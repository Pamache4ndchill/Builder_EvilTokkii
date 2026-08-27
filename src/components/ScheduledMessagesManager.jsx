import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, Square, Send, Megaphone, Plus, Trash2, Edit3, Settings, 
    Wifi, WifiOff, MessageSquare, Clock, CheckCircle2, 
    AlertCircle, Sparkles, RefreshCw, ChevronDown, ChevronUp, Terminal, ShieldCheck
} from 'lucide-react';

const TWITCH_CLIENT_ID = 'crp2lmk3jqaqxwymxixn38nf3xxn2b';
const DEFAULT_CHANNEL = 'eviltokkii';
const DEFAULT_USERNAME = 'Eviltokki_exe';

const DEFAULT_TEMPLATES = [
    { text: "🌟 ¡No olvides seguir el canal y activar la campanita para no perderte ningún directo!", interval: 10, minChat: 10 },
    { text: "💬 Únete a nuestra comunidad oficial en Discord: https://discord.gg/eviltokkii", interval: 15, minChat: 15 },
    { text: "🌐 Visita nuestra web oficial con minijuegos, sorteos y noticias: https://tokkii.online", interval: 20, minChat: 20 },
    { text: "🎁 ¿Quieres participar en los sorteos? ¡Canjea tus puntos del canal en la tienda!", interval: 25, minChat: 15 }
];

export default function ScheduledMessagesManager({ supabase, triggerToast }) {
    // Configuración del bot
    const [botChannel, setBotChannel] = useState(() => localStorage.getItem('twitch_bot_channel') || DEFAULT_CHANNEL);
    const [botUsername, setBotUsername] = useState(() => localStorage.getItem('twitch_bot_username') || 'Eviltokki_exe');
    const [botOauth, setBotOauth] = useState(() => localStorage.getItem('twitch_bot_oauth') || 'oauth:dahm5c9zhnrg9xw1qnxnvnnoqvjz7z');
    const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

    // Estado del bot y WebSocket
    const [isBotConnected, setIsBotConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [botLogs, setBotLogs] = useState([]);
    const [chatActivityCount, setChatActivityCount] = useState(0);

    // Mensajes Programados
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_scheduled_messages_v3');
            if (saved) return JSON.parse(saved);
            const legacy = localStorage.getItem('twitch_scheduled_messages_v2');
            if (legacy) return JSON.parse(legacy);
        } catch (e) {
            console.error("Error reading saved messages:", e);
        }
        return [
            { id: 1, text: "🌟 ¡Recuerda seguir el canal y activar las notificaciones para estar al día de todos los directos!", intervalMinutes: 10, minChatMessages: 10, active: true },
            { id: 2, text: "🌐 Visita nuestra web oficial para ver noticias de videojuegos y anime: https://tokkii.online", intervalMinutes: 15, minChatMessages: 15, active: true }
        ];
    });

    // Modales y formularios
    const [editingMsg, setEditingMsg] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [instantMsgText, setInstantMsgText] = useState('');
    const [instantAnnounceText, setInstantAnnounceText] = useState('');

    const wsRef = useRef(null);
    const intervalsRef = useRef([]);
    const chatCounterRef = useRef(0);

    const addLog = useCallback((type, message) => {
        const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
        setBotLogs(prev => [{ id: Date.now() + Math.random(), time, type, message }, ...prev.slice(0, 99)]);
    }, []);

    useEffect(() => {
        localStorage.setItem('twitch_bot_channel', botChannel);
        localStorage.setItem('twitch_bot_username', botUsername);
        localStorage.setItem('twitch_bot_oauth', botOauth);
        localStorage.setItem('twitch_scheduled_messages_v3', JSON.stringify(messages));
    }, [botChannel, botUsername, botOauth, messages]);

    // Detectar OAuth token en URL hash si viene de Twitch Redirect
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            if (token) {
                setBotOauth(token);
                localStorage.setItem('twitch_bot_oauth', token);
                window.history.replaceState(null, '', window.location.pathname);
                triggerToast('✅ Cuenta de Twitch vinculada con éxito');
                addLog('success', 'Token de Twitch detectado y guardado correctamente.');
            }
        }
    }, [triggerToast, addLog]);

    const [showTokenModal, setShowTokenModal] = useState(false);
    const [tokenInput, setTokenInput] = useState('');

    // Conectar automáticamente a Twitch
    const handleConnectBot = async () => {
        if (isConnecting) return;

        let activeToken = botOauth;
        if (!activeToken) {
            setShowTokenModal(true);
            return;
        }

        setIsConnecting(true);

        if (wsRef.current) {
            try { wsRef.current.close(); } catch (e) {}
        }

        addLog('info', `Iniciando conexión a Twitch IRC WebSocket (#${botChannel.toLowerCase()})...`);

        try {
            const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
            wsRef.current = ws;

            ws.onopen = () => {
                addLog('info', 'Conexión WebSocket establecida. Autenticando con Twitch...');
                const tokenFormatted = activeToken.startsWith('oauth:') ? activeToken : `oauth:${activeToken}`;
                ws.send(`PASS ${tokenFormatted}`);
                ws.send(`NICK ${botUsername.toLowerCase()}`);
                ws.send(`JOIN #${botChannel.toLowerCase()}`);
                setIsBotConnected(true);
                setIsConnecting(false);
                addLog('success', `¡Bot conectado con éxito a #${botChannel.toLowerCase()}!`);
                triggerToast(`🟢 Bot conectado al canal #${botChannel}`);
            };

            ws.onmessage = (event) => {
                const raw = event.data || '';

                if (raw.startsWith("PING")) {
                    ws.send("PONG :tmi.twitch.tv");
                    return;
                }

                if (raw.includes("PRIVMSG")) {
                    const match = raw.match(/:([^!]+)![^@]+@[^\s]+\s+PRIVMSG\s+#[^\s]+\s+:(.*)/);
                    if (match) {
                        const user = match[1];
                        const text = match[2];
                        chatCounterRef.current += 1;
                        setChatActivityCount(c => c + 1);
                        addLog('chat', `${user}: ${text}`);
                    }
                } else if (raw.includes("366")) {
                    addLog('success', `Canal #${botChannel} sincronizado y listo para enviar mensajes.`);
                } else if (raw.includes("NOTICE") || raw.includes("login failed")) {
                    addLog('error', `Aviso de Twitch: ${raw.trim()}`);
                }
            };

            ws.onclose = () => {
                setIsBotConnected(false);
                setIsConnecting(false);
                addLog('warn', 'Conexión con Twitch IRC cerrada.');
            };

            ws.onerror = (err) => {
                setIsBotConnected(false);
                setIsConnecting(false);
                addLog('error', 'Error en la conexión con Twitch.');
            };
        } catch (err) {
            setIsConnecting(false);
            addLog('error', `Fallo al inicializar: ${err.message}`);
        }
    };

    const handleDisconnectBot = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        intervalsRef.current.forEach(clearInterval);
        intervalsRef.current = [];
        setIsBotConnected(false);
        addLog('warn', 'Bot desconectado manualmente.');
        triggerToast('🔴 Bot desconectado');
    };

    const sendChatMessage = async (text, isManual = false) => {
        let formattedText = (text || '').trim();

        if (formattedText.startsWith('/announcement ') || formattedText.startsWith('/announce ') || formattedText.startsWith('.announcement ') || formattedText.startsWith('.announce ')) {
            const content = formattedText.replace(/^[/\.](announcement|announce)\s+/i, '');
            try {
                const cleanToken = botOauth.replace(/^oauth:/i, '');
                const valRes = await fetch('https://id.twitch.tv/oauth2/validate', {
                    headers: { 'Authorization': `OAuth ${cleanToken}` }
                });
                if (valRes.ok) {
                    const authInfo = await valRes.json();
                    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${botChannel.toLowerCase().replace(/^#/, '')}`, {
                        headers: { 'Authorization': `Bearer ${cleanToken}`, 'Client-Id': authInfo.client_id }
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        if (userData.data && userData.data.length > 0) {
                            const bId = userData.data[0].id;
                            const annRes = await fetch(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${bId}&moderator_id=${authInfo.user_id}`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${cleanToken}`,
                                    'Client-Id': authInfo.client_id,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ message: content.substring(0, 500), color: 'primary' })
                            });
                            if (annRes.status === 204 || annRes.ok) {
                                addLog('sent', `📢 [Anuncio Oficial Enviado]: ${content}`);
                                if (isManual) triggerToast('📢 Anuncio oficial enviado al chat');
                                return true;
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn('Helix announcement fallback in component:', err);
            }
            formattedText = content;
        }

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            triggerToast('⚠️ Conecta el bot a Twitch primero');
            addLog('error', 'No se pudo enviar el mensaje: Bot desconectado.');
            return false;
        }

        wsRef.current.send(`PRIVMSG #${botChannel.toLowerCase()} :${formattedText}`);
        addLog('sent', `[Enviado al chat] ${formattedText}`);
        if (isManual) {
            triggerToast('Mensaje enviado al chat');
        }
        return true;
    };

    // Planificador de mensajes
    useEffect(() => {
        intervalsRef.current.forEach(clearInterval);
        intervalsRef.current = [];
        chatCounterRef.current = 0;

        if (isBotConnected && messages.length > 0) {
            addLog('info', 'Activando temporizadores de mensajes programados...');

            messages.forEach((msg) => {
                if (msg.active && msg.text && msg.intervalMinutes > 0) {
                    let lastSentChatCount = 0;
                    const intervalMs = msg.intervalMinutes * 60000;
                    const minChat = msg.minChatMessages || 0;

                    const timer = setInterval(() => {
                        const currentChats = chatCounterRef.current;
                        const diff = currentChats - lastSentChatCount;

                        if (diff >= minChat) {
                            sendChatMessage(msg.text);
                            lastSentChatCount = currentChats;
                        } else {
                            addLog('info', `[Espera] Mensaje "${msg.text.substring(0, 20)}..." pausado por poco tráfico (${diff}/${minChat} msgs de chat).`);
                        }
                    }, intervalMs);

                    intervalsRef.current.push(timer);
                }
            });
        }

        return () => {
            intervalsRef.current.forEach(clearInterval);
        };
    }, [isBotConnected, messages, botChannel, addLog]);

    const handleToggleMessage = (id) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
    };

    const handleDeleteMessage = (id) => {
        if (!window.confirm('¿Eliminar este mensaje programado?')) return;
        setMessages(prev => prev.filter(m => m.id !== id));
        triggerToast('Mensaje programado eliminado');
    };

    const handleSaveMessage = (e) => {
        e.preventDefault();
        if (!editingMsg.text.trim()) return;

        if (editingMsg.id === 'new') {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now(),
                    text: editingMsg.text.trim(),
                    intervalMinutes: Math.max(1, Number(editingMsg.intervalMinutes) || 5),
                    minChatMessages: Math.max(0, Number(editingMsg.minChatMessages) || 0),
                    active: true
                }
            ]);
            triggerToast('Nuevo mensaje programado creado');
        } else {
            setMessages(prev => prev.map(m => m.id === editingMsg.id ? {
                ...m,
                text: editingMsg.text.trim(),
                intervalMinutes: Math.max(1, Number(editingMsg.intervalMinutes) || 5),
                minChatMessages: Math.max(0, Number(editingMsg.minChatMessages) || 0)
            } : m));
            triggerToast('Mensaje programado actualizado');
        }

        setIsModalOpen(false);
        setEditingMsg(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            {/* Header Card con Conexión Rápida */}
            <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MessageSquare size={28} color="#9146FF" />
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)' }}>
                            Mensajes Programados (Bot de Twitch)
                        </h2>
                    </div>
                    <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Envía mensajes periódicos automáticos y modera la interacción en el chat de <strong>#{botChannel}</strong>.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '30px',
                        background: isBotConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: isBotConnected ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        color: isBotConnected ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isBotConnected ? '#22c55e' : '#ef4444', boxShadow: isBotConnected ? '0 0 10px #22c55e' : 'none' }}></span>
                        {isBotConnected ? `CONECTADO A #${botChannel.toUpperCase()}` : 'DESCONECTADO'}
                    </div>

                    {!isBotConnected ? (
                        <button
                            type="button"
                            className="btn-submit"
                            style={{
                                width: 'auto',
                                padding: '12px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'linear-gradient(135deg, #9146FF, #772CE8)',
                                color: '#fff',
                                fontWeight: 700,
                                boxShadow: '0 4px 15px rgba(145, 70, 255, 0.35)',
                                borderRadius: '10px'
                            }}
                            onClick={handleConnectBot}
                            disabled={isConnecting}
                        >
                            <Play size={18} fill="currentColor" className={isConnecting ? 'animate-spin' : ''} />
                            {isConnecting ? 'Conectando...' : 'Conectar al Bot'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-submit"
                            style={{
                                width: 'auto',
                                padding: '12px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: '#fff',
                                fontWeight: 700,
                                borderRadius: '10px'
                            }}
                            onClick={handleDisconnectBot}
                        >
                            <Square size={18} fill="currentColor" /> Desconectar
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Principal: Consola a la Izquierda y Configuración a la Derecha */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Columna Izquierda: Consola de Chat en Vivo + Chat Instantáneo + Ajustes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Consola de Eventos */}
                    <div className="card animate-slide-down" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '480px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Terminal size={16} color="#38bdf8" /> Consola de Chat en Vivo
                            </h4>
                            <button
                                type="button"
                                onClick={() => setBotLogs([])}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                                Limpiar consola
                            </button>
                        </div>

                        <div style={{
                            flex: 1,
                            background: '#090d16',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '10px',
                            padding: '12px',
                            fontFamily: 'Consolas, monospace',
                            fontSize: '0.82rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            gap: '6px'
                        }}>
                            {botLogs.map(log => (
                                <div key={log.id} style={{ lineHeight: 1.4, wordBreak: 'break-word' }}>
                                    <span style={{ color: '#64748b' }}>[{log.time}] </span>
                                    {log.type === 'chat' && <span style={{ color: '#38bdf8' }}>{log.message}</span>}
                                    {log.type === 'sent' && <span style={{ color: '#a855f7', fontWeight: 600 }}>{log.message}</span>}
                                    {log.type === 'success' && <span style={{ color: '#22c55e' }}>{log.message}</span>}
                                    {log.type === 'error' && <span style={{ color: '#ef4444' }}>{log.message}</span>}
                                    {log.type === 'info' && <span style={{ color: '#94a3b8' }}>{log.message}</span>}
                                    {log.type === 'warn' && <span style={{ color: '#f59e0b' }}>{log.message}</span>}
                                </div>
                            ))}
                            {botLogs.length === 0 && (
                                <div style={{ color: '#475569', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>
                                    Esperando eventos del chat de Twitch...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enviar Mensaje Rápido */}
                    <div className="card animate-slide-down" style={{ padding: '20px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={16} color="#EC4899" /> Enviar Mensaje Instantáneo
                        </h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Escribe algo en el chat de Twitch..."
                                value={instantMsgText}
                                onChange={(e) => setInstantMsgText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && instantMsgText.trim()) {
                                        sendChatMessage(instantMsgText.trim(), true);
                                        setInstantMsgText('');
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="btn-submit"
                                style={{
                                    width: 'auto',
                                    padding: '0 18px',
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    borderRadius: '8px'
                                }}
                                onClick={() => {
                                    if (instantMsgText.trim()) {
                                        sendChatMessage(instantMsgText.trim(), true);
                                        setInstantMsgText('');
                                    }
                                }}
                                disabled={!isBotConnected || !instantMsgText.trim()}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>

                    {/* Enviar Anuncio Instantáneo (/announce por defecto) */}
                    <div className="card animate-slide-down" style={{ padding: '20px', border: '1px solid rgba(145, 70, 255, 0.4)', background: 'linear-gradient(135deg, rgba(145, 70, 255, 0.08), rgba(15, 23, 42, 0.6))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Megaphone size={16} color="#A855F7" /> Enviar Anuncio Destacado (/announce)
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: '#C084FC', fontWeight: 700, padding: '2px 8px', background: 'rgba(145, 70, 255, 0.2)', borderRadius: '12px', border: '1px solid rgba(145, 70, 255, 0.3)' }}>
                                Banner Twitch
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Escribe un anuncio para destacarlo en grande en el chat..."
                                value={instantAnnounceText}
                                onChange={(e) => setInstantAnnounceText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && instantAnnounceText.trim()) {
                                        const textToSend = instantAnnounceText.trim().startsWith('/announce') 
                                            ? instantAnnounceText.trim() 
                                            : `/announce ${instantAnnounceText.trim()}`;
                                        sendChatMessage(textToSend, true);
                                        setInstantAnnounceText('');
                                    }
                                }}
                                style={{ border: '1px solid rgba(145, 70, 255, 0.4)' }}
                            />
                            <button
                                type="button"
                                className="btn-submit"
                                style={{
                                    width: 'auto',
                                    padding: '0 20px',
                                    background: 'linear-gradient(135deg, #9146FF, #772CE8)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(145, 70, 255, 0.35)'
                                }}
                                onClick={() => {
                                    if (instantAnnounceText.trim()) {
                                        const textToSend = instantAnnounceText.trim().startsWith('/announce') 
                                            ? instantAnnounceText.trim() 
                                            : `/announce ${instantAnnounceText.trim()}`;
                                        sendChatMessage(textToSend, true);
                                        setInstantAnnounceText('');
                                    }
                                }}
                                disabled={!isBotConnected || !instantAnnounceText.trim()}
                            >
                                Anunciar
                            </button>
                        </div>
                    </div>

                    {/* Info de Cuenta Bot */}
                    <div className="card animate-slide-down" style={{ padding: '14px 18px', background: 'rgba(145, 70, 255, 0.05)', border: '1px solid rgba(145, 70, 255, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <ShieldCheck size={16} color="#9146FF" />
                            <span>Canal: <strong>#{botChannel}</strong> • Bot: <strong style={{ color: '#9146FF' }}>@{botUsername}</strong></span>
                        </div>
                    </div>

                </div>

                {/* Columna Derecha: Configuración y Lista de Mensajes Programados */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card animate-slide-down" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={20} color="#38bdf8" /> Mensajes Programados ({messages.filter(m => m.active).length}/{messages.length})
                                </h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Configura los mensajes periódicos que el bot enviará al chat de Twitch.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn-submit"
                                style={{
                                    width: 'auto',
                                    padding: '8px 16px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    borderRadius: '8px'
                                }}
                                onClick={() => {
                                    setEditingMsg({ id: 'new', text: '', intervalMinutes: 10, minChatMessages: 10, active: true });
                                    setIsModalOpen(true);
                                }}
                            >
                                <Plus size={16} /> Añadir Mensaje
                            </button>
                        </div>

                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                No tienes mensajes programados. Haz clic en "Añadir Mensaje" para crear uno.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            padding: '16px 18px',
                                            borderRadius: '12px',
                                            background: msg.active ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                                            border: msg.active ? '1px solid rgba(145, 70, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            opacity: msg.active ? 1 : 0.6
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5, wordBreak: 'break-word', fontWeight: 500 }}>
                                                {msg.text}
                                            </p>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleMessage(msg.id)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        borderRadius: '20px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: msg.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                        color: msg.active ? '#22c55e' : 'var(--text-muted)'
                                                    }}
                                                >
                                                    {msg.active ? 'ACTIVO' : 'PAUSADO'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => sendChatMessage(msg.text, true)}
                                                    disabled={!isBotConnected}
                                                    title="Enviar prueba al chat ahora"
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(56, 189, 248, 0.15)',
                                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                                        color: '#38bdf8',
                                                        cursor: isBotConnected ? 'pointer' : 'not-allowed',
                                                        opacity: isBotConnected ? 1 : 0.5
                                                    }}
                                                >
                                                    <Send size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingMsg({ ...msg });
                                                        setIsModalOpen(true);
                                                    }}
                                                    title="Editar"
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        color: 'var(--text-muted)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Edit3 size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    title="Eliminar"
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        color: '#ef4444',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={13} color="var(--primary)" /> Cada <strong>{msg.intervalMinutes} min</strong>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MessageSquare size={13} color="#38bdf8" /> Requiere <strong>{msg.minChatMessages || 0} msgs de chat</strong>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modal para Crear/Editar Mensaje Programado */}
            {isModalOpen && editingMsg && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div className="card animate-slide-down" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                            {editingMsg.id === 'new' ? 'Nuevo Mensaje Programado' : 'Editar Mensaje Programado'}
                        </h3>

                        <form onSubmit={handleSaveMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ margin: 0 }}>Contenido del Mensaje</label>
            <span style={{ fontSize: '0.72rem', color: '#9146FF', fontWeight: 600 }}>💡 Tip: Usa /announce para resaltar</span>
         </div>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    required
                                    placeholder="Escribe el texto que el bot enviará al chat..."
                                    value={editingMsg.text}
                                    onChange={(e) => setEditingMsg({ ...editingMsg, text: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label className="form-label">Intervalo (Minutos)</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        required
                                        value={editingMsg.intervalMinutes}
                                        onChange={(e) => setEditingMsg({ ...editingMsg, intervalMinutes: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Mínimo de msgs en chat</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={editingMsg.minChatMessages}
                                        onChange={(e) => setEditingMsg({ ...editingMsg, minChatMessages: e.target.value })}
                                    />
                                </div>
                            </div>

                            {editingMsg.id === 'new' && (
                                <div>
                                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plantillas Rápidas</label>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {DEFAULT_TEMPLATES.map((tmpl, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setEditingMsg({
                                                    ...editingMsg,
                                                    text: tmpl.text,
                                                    intervalMinutes: tmpl.interval,
                                                    minChatMessages: tmpl.minChat
                                                })}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Plantilla {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setEditingMsg(null); }}
                                    style={{
                                        padding: '10px 18px',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--text-muted)',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    style={{
                                        width: 'auto',
                                        padding: '10px 22px',
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        borderRadius: '8px'
                                    }}
                                >
                                    Guardar Mensaje
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Modal para Vincular Token de Eviltokki_exe */}
            {showTokenModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div className="card animate-slide-down" style={{ width: '100%', maxWidth: '500px', padding: '28px', border: '1px solid rgba(145, 70, 255, 0.4)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(145, 70, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9146FF' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                                    Conectar Bot: {botUsername}
                                </h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configuración rápida de conexión para #{botChannel}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                            Para que <strong>{botUsername}</strong> pueda escribir los mensajes en el chat de <strong>#{botChannel}</strong>, introduce su clave de acceso OAuth de Twitch (solo se hace una sola vez):
                        </p>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Twitch OAuth Token de {botUsername}</label>
                            <input 
                                type="password"
                                className="form-control"
                                placeholder="oauth:xxxxxxxxxxxxxxxxx"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value.trim())}
                                autoFocus
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    Inicia sesión con <strong>{botUsername}</strong> y copia el token
                                </small>
                                <a 
                                    href="https://twitchtokengenerator.com/quick/fXQcQ5j8Z9" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ color: '#9146FF', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
                                >
                                    🔑 Obtener Token en 1 clic
                                </a>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button
                                type="button"
                                onClick={() => { setShowTokenModal(false); setTokenInput(''); }}
                                style={{
                                    padding: '10px 18px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--text-muted)',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-submit"
                                style={{
                                    width: 'auto',
                                    padding: '10px 24px',
                                    background: 'linear-gradient(135deg, #9146FF, #772CE8)',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontWeight: 700
                                }}
                                onClick={() => {
                                    if (tokenInput.trim()) {
                                        const cleanTok = tokenInput.trim();
                                        setBotOauth(cleanTok);
                                        localStorage.setItem('twitch_bot_oauth', cleanTok);
                                        setShowTokenModal(false);
                                        setTokenInput('');
                                        triggerToast('✅ Token guardado. Conectando al bot...');
                                        // Trigger connect
                                        setTimeout(() => {
                                            handleConnectBot();
                                        }, 100);
                                    } else {
                                        triggerToast('⚠️ Introduce un token válido');
                                    }
                                }}
                            >
                                Guardar y Conectar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

