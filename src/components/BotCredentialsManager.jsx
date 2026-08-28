import React, { useState, useEffect } from 'react';
import { 
    Key, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, 
    Save, RefreshCw, Send, Terminal, Eye, EyeOff, Bot, Radio, Wifi, WifiOff
} from 'lucide-react';

const DEFAULT_CHANNEL = 'eviltokkii';
const DEFAULT_USERNAME = 'EmiliaMaria_exe';
const DEFAULT_OAUTH = 'oauth:dahm5c9zhnrg9xw1qnxnvnnoqvjz7z';

export default function BotCredentialsManager({ 
    supabase, 
    triggerToast, 
    isBotConnected, 
    connectTwitchBot, 
    disconnectTwitchBot, 
    enviarMensajeTwitch,
    botLogs,
    setBotLogs
}) {
    const [botChannel, setBotChannel] = useState(() => localStorage.getItem('twitch_bot_channel') || DEFAULT_CHANNEL);
    const [botUsername, setBotUsername] = useState(() => localStorage.getItem('twitch_bot_username') || DEFAULT_USERNAME);
    const [botOauth, setBotOauth] = useState(() => {
    const saved = localStorage.getItem('twitch_bot_oauth');
    if (!saved || saved.includes('ol3ji2g7')) {
      localStorage.setItem('twitch_bot_oauth', 'oauth:dahm5c9zhnrg9xw1qnxnvnnoqvjz7z');
      return 'oauth:dahm5c9zhnrg9xw1qnxnvnnoqvjz7z';
    }
    return saved;
  });
    const [showPassword, setShowPassword] = useState(false);
    const [testMessage, setTestMessage] = useState('¡Hola chat! Soy EmiliaMaria_exe y estoy listo para acompañar el stream 🤖💜');
    const [isSaving, setIsSaving] = useState(false);

    // Load from Supabase app_settings if available
    useEffect(() => {
        const loadRemoteCredentials = async () => {
            if (!supabase) return;
            try {
                const { data, error } = await supabase
                    .from('app_settings')
                    .select('*')
                    .eq('key', 'twitch_bot_credentials')
                    .maybeSingle();

                if (!error && data && data.value) {
                    if (data.value.botChannel) setBotChannel(data.value.botChannel);
                    if (data.value.botUsername) setBotUsername(data.value.botUsername);
                    if (data.value.botOauth) setBotOauth(data.value.botOauth);
                }
            } catch (e) {
                // Table might not exist yet
            }
        };
        loadRemoteCredentials();
    }, [supabase]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        const cleanChannel = botChannel.trim().toLowerCase().replace(/^#/, '');
        const cleanUser = botUsername.trim();
        const cleanOauth = botOauth.trim();

        if (!cleanChannel || !cleanUser || !cleanOauth) {
            triggerToast('⚠️ Por favor completa todos los campos (Canal, Usuario y Token)');
            return;
        }

        setIsSaving(true);
        localStorage.setItem('twitch_bot_channel', cleanChannel);
        localStorage.setItem('twitch_bot_username', cleanUser);
        localStorage.setItem('twitch_bot_oauth', cleanOauth);

        if (supabase) {
            try {
                await supabase.from('app_settings').upsert({
                    key: 'twitch_bot_credentials',
                    value: {
                        botChannel: cleanChannel,
                        botUsername: cleanUser,
                        botOauth: cleanOauth,
                        updated_at: new Date().toISOString()
                    }
                });
            } catch (err) {
                console.warn('Supabase app_settings save note:', err);
            }
        }

        setIsSaving(false);
        triggerToast('✅ ¡Credenciales del Bot guardadas con éxito!');

        // Reconnect with new credentials
        if (connectTwitchBot) {
            setTimeout(() => {
                connectTwitchBot();
            }, 300);
        }
    };

    const handleSendTest = () => {
        if (!testMessage.trim()) return;
        if (!isBotConnected) {
            triggerToast('⚠️ Conecta el bot primero antes de enviar una prueba');
            return;
        }
        if (enviarMensajeTwitch) {
            enviarMensajeTwitch(testMessage.trim());
            triggerToast('🚀 Mensaje de prueba enviado al chat de Twitch');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            {/* Header Card */}
            <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #9146FF, #772CE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(145, 70, 255, 0.35)' }}>
                        <Key size={26} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Credenciales de la Cuenta del Bot (Twitch)
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Configuración centralizada para que EmiliaMaria_exe se conecte permanentemente a tu chat
                        </span>
                    </div>
                </div>

                {/* Connection Status Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 18px',
                        borderRadius: '30px',
                        background: isBotConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: isBotConnected ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                        color: isBotConnected ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isBotConnected ? '#22c55e' : '#ef4444', boxShadow: isBotConnected ? '0 0 10px #22c55e' : 'none' }}></span>
                        {isBotConnected ? ('BOT CONECTADO: @' + botUsername.toUpperCase()) : 'BOT DESCONECTADO'}
                    </div>

                    {isBotConnected ? (
                        <button
                            type="button"
                            className="btn-submit"
                            style={{ width: 'auto', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontSize: '0.8rem' }}
                            onClick={disconnectTwitchBot}
                        >
                            Desconectar
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-submit"
                            style={{ width: 'auto', padding: '8px 18px', background: '#9146FF', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}
                            onClick={connectTwitchBot}
                        >
                            Conectar Ahora
                        </button>
                    )}
                </div>
            </div>

            {/* Main Columns: Left Settings Form, Right Help & Console */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Form Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card animate-slide-down" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 18px 0', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bot size={18} color="#9146FF" /> Datos de Acceso de la Cuenta Bot
                        </h3>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Canal de Twitch */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                                    Canal de Twitch (Tu canal de Stream):
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        #
                                    </span>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        value={botChannel}
                                        onChange={(e) => setBotChannel(e.target.value.toLowerCase().trim())}
                                        placeholder="eviltokkii"
                                        style={{ paddingLeft: '28px' }}
                                        required
                                    />
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                                    El canal de Twitch donde el bot entrará a enviar los mensajes.
                                </span>
                            </div>

                            {/* Usuario del Bot */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                                    Nombre de Usuario de la Cuenta Bot:
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        @
                                    </span>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        value={botUsername}
                                        onChange={(e) => setBotUsername(e.target.value.trim())}
                                        placeholder="EmiliaMaria_exe"
                                        style={{ paddingLeft: '30px' }}
                                        required
                                    />
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                                    El usuario exacto de la cuenta secundaria creada para el bot.
                                </span>
                            </div>

                            {/* Token OAuth */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label className="form-label" style={{ fontSize: '0.85rem', margin: 0 }}>
                                        Token OAuth de Twitch Chat:
                                    </label>
                                    <a
                                        href="https://twitchtokengenerator.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#9146FF', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                    >
                                        <ExternalLink size={12} /> Generar Token en twitchtokengenerator.com
                                    </a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        value={botOauth}
                                        onChange={(e) => setBotOauth(e.target.value.trim())}
                                        placeholder="oauth:xxxxxxxxxxxxxxxxxxxxxx"
                                        style={{ paddingRight: '40px', fontFamily: 'monospace' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        title={showPassword ? 'Ocultar' : 'Mostrar'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                                    Inicia sesión en twitchtokengenerator.com con la cuenta de <strong>{botUsername || 'EmiliaMaria_exe'}</strong> para obtener este código.
                                </span>
                            </div>

                            {/* Submit Button */}
                            <div style={{ marginTop: '8px' }}>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    style={{
                                        background: 'linear-gradient(135deg, #9146FF, #772CE8)',
                                        color: '#fff',
                                        fontWeight: 800,
                                        borderRadius: '10px',
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 15px rgba(145, 70, 255, 0.3)'
                                    }}
                                    disabled={isSaving}
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Guardando...' : 'Guardar y Conectar Bot'}
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Test Chat Message Card */}
                    <div className="card animate-slide-down" style={{ padding: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={15} color="#9146FF" /> Enviar Mensaje de Prueba al Chat
                        </h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Escribe un mensaje de prueba..."
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn-submit"
                                style={{ width: 'auto', padding: '0 18px', background: '#9146FF', color: '#fff', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}
                                onClick={handleSendTest}
                                disabled={!isBotConnected || !testMessage.trim()}
                            >
                                Probar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info & Live Console Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Instructions Card */}
                    <div className="card animate-slide-down" style={{ padding: '20px', background: 'rgba(145, 70, 255, 0.05)', border: '1px solid rgba(145, 70, 255, 0.25)' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#9146FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={16} /> ¿Cómo funciona la conexión permanente?
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            <li>Al guardar tus credenciales aquí, el bot se conectará <strong>automáticamente</strong> al abrir el Builder.</li>
                            <li>Tanto los <strong>Mensajes Programados</strong> como los <strong>Cumpleaños de Viewers</strong> utilizarán esta cuenta para enviar mensajes.</li>
<li>Para que los mensajes con <strong>/announce</strong> salgan con el banner destacado de Twitch, la cuenta del bot debe ser <strong>Moderador</strong> (<code>/mod EmiliaMaria_exe</code>) y su token debe tener el permiso <code>moderator:manage:announcements</code>.</li>
                            <li>Cuenta con <strong>auto-reconexión continua</strong> y <strong>Heartbeat Keep-Alive</strong> para que nunca se caiga durante tus transmisiones.</li>
                        </ul>
                    </div>

                    {/* Live Bot Console */}
                    <div className="card animate-slide-down" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '360px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Terminal size={15} color="#38bdf8" /> Registro de Conexión en Vivo
                            </h4>
                            {setBotLogs && (
                                <button
                                    type="button"
                                    onClick={() => setBotLogs([])}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>

                        <div style={{
                            flex: 1,
                            background: '#090d16',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '10px',
                            padding: '12px',
                            fontFamily: 'Consolas, monospace',
                            fontSize: '0.78rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            gap: '4px'
                        }}>
                            {(botLogs || []).map((log, idx) => (
                                <div key={idx} style={{ lineHeight: 1.4, color: log.includes('Error') ? '#ef4444' : log.includes('¡Conectado') ? '#22c55e' : log.includes('Cumpleaños') ? '#ec4899' : '#94a3b8' }}>
                                    {log}
                                </div>
                            ))}
                            {(!botLogs || botLogs.length === 0) && (
                                <div style={{ color: '#475569', fontStyle: 'italic', textAlign: 'center', marginTop: '2.5rem' }}>
                                    Sin eventos recientes...
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
