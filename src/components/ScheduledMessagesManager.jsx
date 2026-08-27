import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, Square, Send, Smile, Megaphone, Plus, Trash2, Edit3, Settings, 
    Wifi, WifiOff, MessageSquare, Clock, CheckCircle2, 
    AlertCircle, Sparkles, RefreshCw, ChevronDown, ChevronUp, Terminal, ShieldCheck
} from 'lucide-react';

const TWITCH_CLIENT_ID = 'crp2lmk3jqaqxwymxixn38nf3xxn2b';
const DEFAULT_CHANNEL = 'eviltokkii';
const DEFAULT_USERNAME = 'Eviltokki_exe';


const EMOJI_CATEGORIES = {
    destacados: {
        label: '⭐ Stream & Twitch',
        emojis: ['✨', '🌟', '💜', '💛', '📢', '🔔', '🎮', '🎁', '🚀', '💬', '👑', '🥳', '🎉', '🎂', '🐱', '🔥', '💯', '⚡', '🍣', '👾', '💎', '🏆', '🥇', '🍿', '🍕']
    },
    caritas: {
        label: '😀 Caritas & Gestos',
        emojis: [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '☺️', '😊', '😇', '🙂', '😉', '😌', 
            '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', 
            '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', 
            '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', 
            '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠', '🤥', '😶', '😐', '😑', '🫥', '😯', '😦', '😧', '😮', 
            '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', 
            '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃'
        ]
    },
    manos: {
        label: '👋 Manos & Gestos',
        emojis: [
            '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '🫵', '👉', '👈', '👆', '👇', '☝️', '👍', 
            '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', 
            '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🫀', '🫁', '🧠', '👀', '👁️', '👅', '👄'
        ]
    },
    corazones: {
        label: '💜 Corazones & Símbolos',
        emojis: [
            '💜', '💛', '❤️', '🧡', '💚', '💙', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', 
            '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☯️', '⚛️', '💮', '🛑', '⛔', '⭕', '❌', 
            '❗', '❓', '❕', '❔', '⚠️', '🚸', '🔱', '🔰', '♻️', '❇️', '✳️', '❎', '✅', '💠', '🔷', 
            '🔶', '🔹', '🔸', '🔘', '🔲', '🔳', '⚪', '⚫', '🔴', '🔵', '🟣', '🟢', '🟡', '🟠'
        ]
    },
    gaming: {
        label: '🎮 Gaming & Música',
        emojis: [
            '🎮', '🕹️', '👾', '🎲', '🎯', '🎳', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎪', '🎭', '🎨', 
            '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎟️', '🎫', '📺', '📻', 
            '📹', '📽️', '💻', '🖥️', '📱', '🔋', '🔌', '💡', '📡', '🎙️', '🔊', '🔉', '🔈', '🔇', '📢', 
            '📣', '🔔', '🔕', '🃏', '🀄', '🪄', '🪅', '🪆', '🪁', '🎈', '🎏', '🎀'
        ]
    },
    comida: {
        label: '🍕 Comida & Fiesta',
        emojis: [
            '🍕', '🍔', '🍟', '🌭', '🍿', '🍣', '🍙', '🍘', '🥟', '🍢', '🍡', '🍧', '🍨', '🍦', '🍰', 
            '🎂', '🧁', '🍮', '🍩', '🍪', '🍫', '🍬', '🍭', '🍯', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', 
            '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥢', '🍽️', '🥣', '🌮', '🌯', '🫔', '🥗'
        ]
    },
    efectos: {
        label: '🌟 Efectos & Animales',
        emojis: [
            '✨', '🌟', '⭐', '🌠', '💫', '💥', '☄️', '☀️', '🌙', '⚡', '🔥', '🌈', '🌸', '🌺', '🌻', 
            '🌹', '🍀', '🍁', '🐱', '🐱‍👤', '🐾', '🦄', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙', '🦋', 
            '👑', '💎', '💍', '🔮', '🧿', '🚀', '🛸', '🌍', '🪐', '🐶', '🐺', '🐵', '🙈', '🙉', '🙊'
        ]
    }
};

function EmojiPickerPopover({ onSelectEmoji, onClose }) {
    const [activeTab, setActiveTab] = useState('destacados');

    return (
        <div 
            className="card animate-slide-down"
            style={{
                position: 'absolute',
                bottom: '100%',
                right: '0',
                marginBottom: '10px',
                width: '340px',
                maxHeight: '280px',
                background: '#0f172a',
                border: '1.5px solid rgba(145, 70, 255, 0.4)',
                borderRadius: '14px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(145, 70, 255, 0.25)',
                zIndex: 1000,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#A855F7', fontWeight: 700 }}>
                    {EMOJI_CATEGORIES[activeTab].label}
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        style={{
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: activeTab === key ? 'rgba(145, 70, 255, 0.3)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === key ? '#fff' : 'var(--text-muted)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat.label.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Emojis Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '4px'
            }}>
                {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => {
                            onSelectEmoji(emoji);
                            if (onClose) onClose();
                        }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '8px',
                            fontSize: '1.25rem',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.1s, background 0.1s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.background = 'rgba(145, 70, 255, 0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}

const DEFAULT_TEMPLATES = [
    { text: "🌟 ¡No olvides seguir el canal y activar la campanita para no perderte ningún directo!", interval: 10, minChat: 10 },
    { text: "💬 Únete a nuestra comunidad oficial en Discord: https://discord.gg/eviltokkii", interval: 15, minChat: 15 },
    { text: "🌐 Visita nuestra web oficial con minijuegos, sorteos y noticias: https://tokkii.online", interval: 20, minChat: 20 },
    { text: "🎁 ¿Quieres participar en los sorteos? ¡Canjea tus puntos del canal en la tienda!", interval: 25, minChat: 15 }
];

export default function ScheduledMessagesManager({ 
    supabase, 
    triggerToast, 
    isBotConnected, 
    connectTwitchBot, 
    disconnectTwitchBot, 
    enviarMensajeTwitch, 
    botLogs: propBotLogs, 
    setBotLogs: propSetBotLogs,
    messages: propMessages,
    setMessages: propSetMessages
}) {
    // Configuración del bot
    const [botChannel, setBotChannel] = useState(() => localStorage.getItem('twitch_bot_channel') || DEFAULT_CHANNEL);
    const [botUsername, setBotUsername] = useState(() => localStorage.getItem('twitch_bot_username') || 'Eviltokki_exe');
    const [botOauth, setBotOauth] = useState(() => localStorage.getItem('twitch_bot_oauth') || 'oauth:dahm5c9zhnrg9xw1qnxnvnnoqvjz7z');
    const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

    // Estado del bot y WebSocket
    // Using global isBotConnected from App.jsx
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        if (isBotConnected) {
            setIsConnecting(false);
        }
    }, [isBotConnected]);
    const [localLogs, setLocalLogs] = useState([]);
    const botLogs = propBotLogs !== undefined ? propBotLogs : localLogs;
    const setBotLogs = propSetBotLogs !== undefined ? propSetBotLogs : setLocalLogs;
    const [chatActivityCount, setChatActivityCount] = useState(0);

    const [localMessages, setLocalMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_scheduled_messages_v3');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [];
    });
    const messages = propMessages !== undefined ? propMessages : localMessages;
    const setMessages = propSetMessages !== undefined ? propSetMessages : setLocalMessages;

    // Modales y formularios
    const [editingMsg, setEditingMsg] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [instantMsgText, setInstantMsgText] = useState('');
    const [instantAnnounceText, setInstantAnnounceText] = useState('');
    const [showInstantEmoji, setShowInstantEmoji] = useState(false);
    const [showAnnounceEmoji, setShowAnnounceEmoji] = useState(false);
    const [showModalEmoji, setShowModalEmoji] = useState(false);

    const wsRef = useRef(null);
    const intervalsRef = useRef([]);
    const chatCounterRef = useRef(0);

    const addLog = useCallback((type, message) => {
        const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
        setBotLogs(prev => [{ id: Date.now() + Math.random(), time, type, message }, ...prev.slice(0, 99)]);
    }, []);

    // Sincronizar en tiempo real con Supabase
    useEffect(() => {
        const fetchRemoteMessages = async () => {
            if (!supabase) return;
            try {
                const { data, error } = await supabase
                    .from('twitch_scheduled_messages')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (!error && data && data.length > 0) {
                    const formatted = data.map(d => ({
                        id: d.id,
                        text: d.text,
                        intervalMinutes: d.interval_minutes || 10,
                        minChatMessages: d.min_chat_messages !== undefined ? d.min_chat_messages : 10,
                        active: d.active !== false
                    }));
                    setMessages(formatted);
                    localStorage.setItem('twitch_scheduled_messages_v3', JSON.stringify(formatted));
                }
            } catch (e) {
                console.warn("Supabase fetch note:", e.message);
            }
        };
        fetchRemoteMessages();
    }, [supabase]);

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
        if (disconnectTwitchBot) {
            disconnectTwitchBot();
            triggerToast('🔴 Bot desconectado manualmente');
        }
    };

    const sendChatMessage = async (text, isManual = false) => {
        if (!isBotConnected) {
            triggerToast('⚠️ Conecta el bot a Twitch primero');
            return false;
        }
        if (enviarMensajeTwitch) {
            await enviarMensajeTwitch(text, !isManual);
            if (isManual) {
                triggerToast(text.startsWith('/announce') ? '📢 Anuncio enviado al chat' : 'Mensaje enviado al chat');
            }
            return true;
        }
        return false;
    };

    // Timers are managed globally in App.jsx to avoid restarts when navigating

    const handleToggleMessage = async (id) => {
        let targetMsg = null;
        let newActiveState = true;

        setMessages(prev => prev.map(m => {
            if (m.id === id) {
                newActiveState = !m.active;
                targetMsg = { ...m, active: newActiveState };
                return targetMsg;
            }
            return m;
        }));

        // Si se acaba de activar (LANZAR), enviar una primera emisión al instante
        if (newActiveState && targetMsg && targetMsg.text && isBotConnected) {
            sendChatMessage(targetMsg.text, true);
        }

        if (supabase) {
            try {
                await supabase
                    .from('twitch_scheduled_messages')
                    .update({ active: newActiveState, updated_at: new Date().toISOString() })
                    .eq('id', String(id));
            } catch (err) {
                console.warn("Supabase toggle note:", err.message);
            }
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('¿Eliminar este mensaje programado?')) return;
        setMessages(prev => prev.filter(m => m.id !== id));
        triggerToast('Mensaje programado eliminado');

        if (supabase) {
            try {
                await supabase
                    .from('twitch_scheduled_messages')
                    .delete()
                    .eq('id', String(id));
            } catch (err) {
                console.warn("Supabase delete note:", err.message);
            }
        }
    };

    const handleSaveMessage = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        if (!editingMsg || !editingMsg.text || !editingMsg.text.trim()) {
            triggerToast('⚠️ Por favor escribe el contenido del mensaje');
            return;
        }

        const targetId = editingMsg.id === 'new' ? 'msg_' + Date.now() : String(editingMsg.id);
        const intervalMins = Math.max(1, Number(editingMsg.intervalMinutes) || 10);
        const minChats = Math.max(0, Number(editingMsg.minChatMessages) || 0);
        const cleanText = editingMsg.text.trim();

        if (editingMsg.id === 'new') {
            const newRecord = {
                id: targetId,
                text: cleanText,
                intervalMinutes: intervalMins,
                minChatMessages: minChats,
                active: true
            };
            setMessages(prev => [...prev, newRecord]);
            triggerToast('✅ Nuevo mensaje programado creado');

            if (supabase) {
                supabase.from('twitch_scheduled_messages').upsert({
                    id: targetId,
                    text: cleanText,
                    interval_minutes: intervalMins,
                    min_chat_messages: minChats,
                    active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }).catch(e => console.warn("Supabase insert note:", e));
            }
        } else {
            setMessages(prev => prev.map(m => m.id === editingMsg.id ? {
                ...m,
                text: cleanText,
                intervalMinutes: intervalMins,
                minChatMessages: minChats
            } : m));
            triggerToast('✅ Mensaje programado actualizado');

            if (supabase) {
                supabase.from('twitch_scheduled_messages').update({
                    text: cleanText,
                    interval_minutes: intervalMins,
                    min_chat_messages: minChats,
                    updated_at: new Date().toISOString()
                }).eq('id', targetId).catch(e => console.warn("Supabase update note:", e));
            }
        }

        // Cierre inmediato del modal
        setIsModalOpen(false);
        setEditingMsg(null);
        setShowModalEmoji(false);
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

            {/* Grid Principal: Mensajes Programados a la Izquierda y Consola a la Derecha */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Columna Izquierda: Mensajes Programados */}
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '4px' }}>
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

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleToggleMessage(msg.id);
                                                        triggerToast(msg.active ? '⏸️ Temporizador pausado' : '▶️ Temporizador global lanzado');
                                                    }}
                                                    title={msg.active ? "Pausar temporizador" : "Lanzar temporizador en stream"}
                                                    style={{
                                                        padding: '5px 12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        borderRadius: '20px',
                                                        border: msg.active ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                                                        cursor: 'pointer',
                                                        background: msg.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                                                        color: msg.active ? '#22c55e' : 'var(--text-muted)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    {msg.active ? '🟢 EN CURSO' : '▶️ LANZAR'}
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
                                                        setEditingMsg({
                                                            id: msg.id,
                                                            text: msg.text,
                                                            intervalMinutes: msg.intervalMinutes || 10,
                                                            minChatMessages: msg.minChatMessages !== undefined ? msg.minChatMessages : 10,
                                                            active: msg.active
                                                        });
                                                        setIsModalOpen(true);
                                                    }}
                                                    title="Editar mensaje"
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
                                                    title="Eliminar mensaje"
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

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
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

                {/* Columna Derecha: Consola + Mensaje Instantáneo + Anuncio Destacado + Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Consola de Eventos */}
                    <div className="card animate-slide-down" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '420px' }}>
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

                    {/* Enviar Mensaje Rápido con Emojis */}
                    <div className="card animate-slide-down" style={{ padding: '20px', position: 'relative' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={16} color="#EC4899" /> Enviar Mensaje Instantáneo
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
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
                                title="Insertar Emojis"
                                onClick={() => setShowInstantEmoji(!showInstantEmoji)}
                                style={{
                                    padding: '0 12px',
                                    background: showInstantEmoji ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    borderRadius: '8px',
                                    fontSize: '1.15rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                😊
                            </button>

                            {showInstantEmoji && (
                                <EmojiPickerPopover 
                                    onSelectEmoji={(emoji) => {
                                        setInstantMsgText(prev => prev + emoji);
                                    }}
                                    onClose={() => setShowInstantEmoji(false)}
                                />
                            )}

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

                    {/* Enviar Anuncio Instantáneo con Emojis */}
                    <div className="card animate-slide-down" style={{ padding: '20px', border: '1px solid rgba(145, 70, 255, 0.4)', background: 'linear-gradient(135deg, rgba(145, 70, 255, 0.08), rgba(15, 23, 42, 0.6))', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Megaphone size={16} color="#A855F7" /> Enviar Anuncio Destacado (/announce)
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: '#C084FC', fontWeight: 700, padding: '2px 8px', background: 'rgba(145, 70, 255, 0.2)', borderRadius: '12px', border: '1px solid rgba(145, 70, 255, 0.3)' }}>
                                Banner Twitch
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
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
                                title="Insertar Emojis"
                                onClick={() => setShowAnnounceEmoji(!showAnnounceEmoji)}
                                style={{
                                    padding: '0 12px',
                                    background: showAnnounceEmoji ? 'rgba(145, 70, 255, 0.35)' : 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(145, 70, 255, 0.3)',
                                    borderRadius: '8px',
                                    fontSize: '1.15rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                😊
                            </button>

                            {showAnnounceEmoji && (
                                <EmojiPickerPopover 
                                    onSelectEmoji={(emoji) => {
                                        setInstantAnnounceText(prev => prev + emoji);
                                    }}
                                    onClose={() => setShowAnnounceEmoji(false)}
                                />
                            )}

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
                    <div className="card animate-slide-down" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', padding: '24px', border: '1px solid rgba(145, 70, 255, 0.4)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                                {editingMsg.id === 'new' ? 'Nuevo Mensaje Programado' : 'Editar Mensaje Programado'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setIsModalOpen(false); setEditingMsg(null); setShowModalEmoji(false); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                                title="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
            <label className="form-label" style={{ margin: 0 }}>Contenido del Mensaje</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#9146FF', fontWeight: 600 }}>💡 Tip: Usa /announce para resaltar</span>
                <button
                    type="button"
                    onClick={() => setShowModalEmoji(!showModalEmoji)}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '2px 6px', fontSize: '0.9rem', cursor: 'pointer' }}
                    title="Insertar emojis"
                >
                    😊 Emojis
                </button>
                {showModalEmoji && (
                    <EmojiPickerPopover 
                        onSelectEmoji={(emoji) => {
                            setEditingMsg(prev => ({ ...prev, text: (prev.text || '') + emoji }));
                        }}
                        onClose={() => setShowModalEmoji(false)}
                    />
                )}
            </div>
         </div>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    required
                                    placeholder="Escribe el texto. Puedes usar /announce al inicio para publicarlo como Anuncio oficial..."
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

