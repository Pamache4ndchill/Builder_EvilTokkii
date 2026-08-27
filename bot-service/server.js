/**
 * ==============================================================================
 * EVILTOKKII TWITCH BOT 24/7 - CLOUD SERVICE
 * ==============================================================================
 * Conectado permanentemente a Twitch IRC y a la API de Helix.
 * Sincronizado en tiempo real con Supabase:
 * - Mensajes Programados (con /announce y control de tráfico)
 * - Cumpleaños de Viewers (con detector de presencia en chat)
 * ==============================================================================
 */

const http = require('http');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

// Configuración por defecto
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cqwugfvxqfvhfmsdfmup.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxd3VnZnZ4cWZ2aGZtc2RmbXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTQ5ODAsImV4cCI6MjA1NTkzMDk4MH0.Qd8f08f8n4fWf-D5-k0r4-5_6789_abcdef';

const BOT_CHANNEL = (process.env.BOT_CHANNEL || 'eviltokkii').toLowerCase().trim();
const BOT_USERNAME = (process.env.BOT_USERNAME || 'Eviltokki_exe').trim();
const BOT_OAUTH = (process.env.BOT_OAUTH || 'oauth:dahm5c9zhnrg9xw1qnxnvnnoqvjz7z').trim();

const TWITCH_CLIENT_ID = 'gp762nuuoqcoxypju8c569th9wz7q5';
const BROADCASTER_ID = '1131620140'; // eviltokkii
const MODERATOR_ID = '1481655280';   // eviltokki_exe

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let ws = null;
let isConnected = false;
let userMessagesCount = 0;
const detectedBirthdayUsers = new Set();
const activeScheduledTimers = [];
let birthdaysTimer = null;

let scheduledMessagesList = [];
let birthdaysList = [];

// ==============================================================================
// 1. SINCRONIZACIÓN CON SUPABASE
// ==============================================================================
async function loadDataFromSupabase() {
    try {
        console.log('🔄 Sincronizando datos con Supabase...');
        
        // 1. Cargar Mensajes Programados
        const { data: msgsData, error: msgsErr } = await supabase
            .from('twitch_scheduled_messages')
            .select('*');
            
        if (!msgsErr && msgsData) {
            scheduledMessagesList = msgsData;
            console.log(`✅ ${scheduledMessagesList.length} Mensajes Programados cargados.`);
        } else {
            console.warn('Nota: Usando mensajes locales si la tabla aún no tiene datos.');
        }

        // 2. Cargar Cumpleaños
        const { data: bdaysData, error: bdaysErr } = await supabase
            .from('twitch_birthdays')
            .select('*');

        if (!bdaysErr && bdaysData) {
            birthdaysList = bdaysData;
            console.log(`🎂 ${birthdaysList.length} Cumpleaños de viewers cargados.`);
        }

        // Reiniciar planificadores con los datos actualizados
        startScheduledTimers();
        startBirthdaysTimer();
    } catch (e) {
        console.error('Error al cargar datos de Supabase:', e.message);
    }
}

// Suscripción Realtime para actualizar al instante cuando editas en el Builder
function setupRealtimeListeners() {
    try {
        supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'twitch_scheduled_messages' }, () => {
                console.log('⚡ Cambio detectado en Mensajes Programados de Supabase. Recargando...');
                loadDataFromSupabase();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'twitch_birthdays' }, () => {
                console.log('⚡ Cambio detectado en Cumpleaños de Supabase. Recargando...');
                loadDataFromSupabase();
            })
            .subscribe();
        console.log('📡 Listener en Tiempo Real de Supabase activo.');
    } catch (e) {
        console.warn('Realtime no disponible en este entorno:', e.message);
    }
}

// ==============================================================================
// 2. ENVÍO DE MENSAJES Y ANUNCIOS A TWITCH
// ==============================================================================
async function sendHelixAnnouncement(messageText, color = 'primary') {
    const tokenClean = BOT_OAUTH.replace(/^oauth:/i, '').trim();
    try {
        const res = await fetch(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${BROADCASTER_ID}&moderator_id=${MODERATOR_ID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenClean}`,
                'Client-Id': TWITCH_CLIENT_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: messageText.substring(0, 500),
                color: color
            })
        });

        if (res.status === 204 || res.ok) {
            console.log(`📢 [Anuncio 24/7 Enviado]: "${messageText}"`);
            return true;
        } else {
            console.warn(`Aviso Helix Anuncio Status: ${res.status}`);
            return false;
        }
    } catch (err) {
        console.error('Error al enviar Anuncio Helix:', err.message);
        return false;
    }
}

async function sendChatMessage(text) {
    if (!text) return;
    const cleanText = text.trim();

    // Si es anuncio (/announce)
    if (cleanText.startsWith('/announce ') || cleanText.startsWith('/announcement ') || cleanText.startsWith('.announce ')) {
        const content = cleanText.replace(/^[/\.](announce|announcement)\s+/i, '');
        const sent = await sendHelixAnnouncement(content, 'primary');
        if (sent) return;
    }

    // Envío por WebSocket IRC clásico
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(`PRIVMSG #${BOT_CHANNEL} :${cleanText}`);
        console.log(`💬 [Chat 24/7 Enviado]: "${cleanText}"`);
    } else {
        console.warn('⚠️ WebSocket no conectado al intentar enviar mensaje.');
    }
}

// ==============================================================================
// 3. RELOJ MAESTRO PERSISTENTE 24/7 (TIMESTAMPS EXACTOS)
// ==============================================================================
const botTimestamps = {};
const botChatCounts = {};
let masterBotTimer = null;

function startScheduledTimers() {
    if (masterBotTimer) clearInterval(masterBotTimer);

    const activeMsgs = scheduledMessagesList.filter(m => m.active !== false && m.text);
    console.log(`⏱️ [Reloj Maestro 24/7] Monitoreando ${activeMsgs.length} mensaje(s) programado(s)...`);

    activeMsgs.forEach(msg => {
        const id = msg.id || msg.text;
        if (!botTimestamps[id]) {
            botTimestamps[id] = Date.now();
            botChatCounts[id] = userMessagesCount;
        }
    });

    masterBotTimer = setInterval(() => {
        const now = Date.now();
        scheduledMessagesList.forEach(msg => {
            if (msg.active === false || !msg.text) return;

            const id = msg.id || msg.text;
            const intervalMinutes = Math.max(1, Number(msg.interval_minutes || msg.intervalMinutes) || 10);
            const intervalMs = intervalMinutes * 60 * 1000;
            const lastSent = botTimestamps[id] || 0;
            const timeElapsed = now - lastSent;

            if (timeElapsed >= intervalMs) {
                const currentChats = userMessagesCount;
                const lastChats = botChatCounts[id] || 0;
                const diffChats = currentChats - lastChats;
                const threshold = msg.min_chat_messages !== undefined ? Number(msg.min_chat_messages) : 0;

                if (threshold <= 0 || diffChats >= threshold) {
                    console.log(`📢 [24/7 Disparo Programado cada ${intervalMinutes}m]: "${msg.text.substring(0, 30)}..."`);
                    sendChatMessage(msg.text);
                    botTimestamps[id] = now;
                    botChatCounts[id] = currentChats;
                } else {
                    console.log(`⏳ [24/7 En Espera de Chat] "${msg.text.substring(0, 20)}..." (${diffChats}/${threshold} msgs)`);
                }
            }
        });
    }, 5000);
}

function startBirthdaysTimer() {
    if (birthdaysTimer) clearInterval(birthdaysTimer);

    const now = new Date();
    const curDay = now.getDate();
    const curMonth = now.getMonth() + 1;

    const todayBdays = birthdaysList.filter(b => Number(b.day) === curDay && Number(b.month) === curMonth && b.active !== false);

    if (todayBdays.length > 0) {
        console.log(`🎉 Detectados ${todayBdays.length} cumpleañero(s) de hoy (${todayBdays.map(b => '@' + b.username).join(', ')}).`);
        
        let bdayIndex = 0;
        const bdayIntervalMs = 20 * 60 * 1000; // 20 min

        birthdaysTimer = setInterval(() => {
            // Solo felicitar periódicamente si el cumpleañero escribió en el chat en esta sesión
            const presentBdays = todayBdays.filter(b => detectedBirthdayUsers.has(b.username.toLowerCase().trim()));

            if (presentBdays.length > 0) {
                const targetBday = presentBdays[bdayIndex % presentBdays.length];
                bdayIndex++;
                const defMsg = '¡Feliz cumpleaños @{user}! 🎉🎂 Toda la comunidad de EvilTokkii te desea un día increíble y lleno de bendiciones 🥳💜';
                const template = targetBday.message || defMsg;
                const finalMsg = template.replace(/@{user}/gi, `@${targetBday.username}`).replace(/{user}/gi, `@${targetBday.username}`);
                
                console.log(`🎉 Enviando felicitación periódica 24/7 a @${targetBday.username}`);
                sendChatMessage(finalMsg);
            }
        }, bdayIntervalMs);
    }
}

// ==============================================================================
// 4. CONEXIÓN WEBSOCKET INDESTRUCTIBLE A TWITCH IRC
// ==============================================================================
function connectTwitchIrc() {
    console.log(`🔌 Conectando a Twitch IRC WebSocket (#${BOT_CHANNEL} como @${BOT_USERNAME})...`);

    try {
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

        ws.on('open', () => {
            console.log('✨ Conectado a Twitch IRC WebSocket.');
            isConnected = true;

            const formattedOauth = BOT_OAUTH.startsWith('oauth:') ? BOT_OAUTH : 'oauth:' + BOT_OAUTH;
            ws.send(`PASS ${formattedOauth}`);
            ws.send(`NICK ${BOT_USERNAME.toLowerCase()}`);
            ws.send(`JOIN #${BOT_CHANNEL.toLowerCase()}`);
            console.log(`🔑 Autenticación enviada para @${BOT_USERNAME} en #${BOT_CHANNEL}`);
        });

        ws.on('message', (data) => {
            const raw = data.toString();

            if (raw.startsWith('PING')) {
                ws.send('PONG :tmi.twitch.tv');
                return;
            }

            if (raw.includes('001') || raw.includes('366')) {
                console.log(`🟢 ¡Bot 24/7 @${BOT_USERNAME} activo y sincronizado en el chat de #${BOT_CHANNEL}!`);
            }

            if (raw.includes('PRIVMSG')) {
                const match = raw.match(/:([^!]+)![^@]+@[^\s]+\s+PRIVMSG\s+#[^\s]+\s+:(.*)/);
                if (match) {
                    const user = match[1];
                    const text = match[2];
                    
                    if (user.toLowerCase() !== BOT_USERNAME.toLowerCase()) {
                        userMessagesCount += 1;
                    }

                    // Detector de Presencia de Cumpleañeros
                    const userLower = user.toLowerCase().trim();
                    const now = new Date();
                    const curDay = now.getDate();
                    const curMonth = now.getMonth() + 1;

                    const matchedBday = birthdaysList.find(b => 
                        Number(b.day) === curDay && 
                        Number(b.month) === curMonth && 
                        b.active !== false && 
                        b.username.toLowerCase().trim() === userLower
                    );

                    if (matchedBday && !detectedBirthdayUsers.has(userLower)) {
                        detectedBirthdayUsers.add(userLower);
                        const defMsg = '¡Feliz cumpleaños @{user}! 🎉🎂 Toda la comunidad de EvilTokkii te desea un día increíble y lleno de bendiciones 🥳💜';
                        const template = matchedBday.message || defMsg;
                        const welcomeMsg = `✨ ¡Bienvenido/a @${user}! ` + template.replace(/@{user}/gi, `@${user}`).replace(/{user}/gi, `@${user}`);
                        
                        console.log(`🎂 [Presencia Detectada] @${user} cumplió años y escribió en el chat. Enviando saludo de bienvenida...`);
                        sendChatMessage(welcomeMsg);
                    }
                }
            }
        });

        ws.on('close', () => {
            isConnected = false;
            console.warn('⚠️ Conexión con Twitch cerrada. Reconectando en 5 segundos automáticamente...');
            setTimeout(connectTwitchIrc, 5000);
        });

        ws.on('error', (err) => {
            console.error('Error de WebSocket:', err.message);
        });

    } catch (e) {
        console.error('Error al inicializar WebSocket:', e.message);
        setTimeout(connectTwitchIrc, 5000);
    }
}

// Heartbeat Keep-Alive cada 3 minutos
setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('PING :tmi.twitch.tv');
    }
}, 180000);

// ==============================================================================
// 5. SERVIDOR HTTP PARA HEALTHCHECK 24/7 (RENDER / RAILWAY / UPTIMEROBOT)
// ==============================================================================
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'online',
        service: 'EvilTokkii Twitch Bot 24/7',
        bot_user: BOT_USERNAME,
        channel: '#' + BOT_CHANNEL,
        connected: isConnected,
        active_scheduled_messages: scheduledMessagesList.filter(m => m.active !== false).length,
        registered_birthdays: birthdaysList.length,
        uptime_seconds: Math.floor(process.uptime())
    }));
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor Healthcheck 24/7 corriendo en puerto ${PORT}`);
    loadDataFromSupabase();
    setupRealtimeListeners();
    connectTwitchIrc();
});
