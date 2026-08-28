import React, { useState, useEffect } from 'react';
import { 
    Cake, Gift, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, 
    Calendar, Send, Search, User, Sparkles, MessageSquare, ToggleLeft, ToggleRight, PartyPopper
} from 'lucide-react';

const MONTHS = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
];

const DEFAULT_MESSAGE_TEMPLATE = '¡Feliz cumpleaños @{user}! 🎉🎂 Toda la comunidad de EvilTokkii te desea un día increíble y lleno de bendiciones 🥳💜';

export default function BirthdaysManager({ supabase, triggerToast, enviarMensajeTwitch, isBotConnected }) {
    const [birthdays, setBirthdays] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_viewers_birthdays');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const [username, setUsername] = useState('');
    const [day, setDay] = useState(() => new Date().getDate());
    const [month, setMonth] = useState(() => new Date().getMonth() + 1);
    const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE_TEMPLATE);
    const [isActive, setIsActive] = useState(true);

    // Filters & Search
    const [filterTab, setFilterTab] = useState('all'); // 'all', 'today', 'month', 'inactive'
    const [searchQuery, setSearchQuery] = useState('');

    // Automation Settings
    const [isAutoEnabled, setIsAutoEnabled] = useState(() => localStorage.getItem('twitch_birthdays_auto_enabled') !== 'false');
    const [autoInterval, setAutoInterval] = useState(() => Number(localStorage.getItem('twitch_birthdays_interval')) || 20);
    const [autoMinChat, setAutoMinChat] = useState(() => Number(localStorage.getItem('twitch_birthdays_min_chat')) || 0);

    const handleAutoToggle = (enabled) => {
        setIsAutoEnabled(enabled);
        localStorage.setItem('twitch_birthdays_auto_enabled', enabled ? 'true' : 'false');
        window.dispatchEvent(new Event('storage'));
        triggerToast(enabled ? '🟢 Felicitaciones automáticas ACTIVADAS' : '🔴 Felicitaciones automáticas PAUSADAS');
    };

    const handleIntervalChange = (val) => {
        const num = Number(val);
        setAutoInterval(num);
        localStorage.setItem('twitch_birthdays_interval', num);
        localStorage.removeItem('twitch_last_bday_sent');
        window.dispatchEvent(new Event('storage'));
        triggerToast('⏱️ Intervalo de cumpleaños cambiado a cada ' + num + ' minutos (Temporizador Reiniciado)');
    };

    const handleMinChatChange = (val) => {
        const num = Number(val);
        setAutoMinChat(num);
        localStorage.setItem('twitch_birthdays_min_chat', num);
        window.dispatchEvent(new Event('storage'));
        triggerToast('💬 Mensajes mínimos requeridos: ' + num);
    };

    const handleSendAllTodayNow = () => {
        if (todaysBirthdays.length === 0) {
            triggerToast('⚠️ No hay cumpleañeros registrados para hoy');
            return;
        }
        todaysBirthdays.forEach((item, idx) => {
            setTimeout(() => {
                const text = (item.message || DEFAULT_MESSAGE_TEMPLATE)
                    .replace(/@{user}/gi, '@' + item.username)
                    .replace(/{user}/gi, '@' + item.username)
                    .replace(/@{usuario}/gi, '@' + item.username)
                    .replace(/{usuario}/gi, '@' + item.username);
                enviarMensajeTwitch(text);
            }, idx * 7000);
        });
        triggerToast('🎉 ¡Felicitaciones enviadas al chat para los cumpleañeros de hoy!');
    };

    const todayDate = new Date();
    const currentDay = todayDate.getDate();
    const currentMonth = todayDate.getMonth() + 1;

    // Load from Supabase on mount
    useEffect(() => {
        const loadSupabaseBirthdays = async () => {
            if (!supabase) return;
            try {
                const { data, error } = await supabase
                    .from('twitch_birthdays')
                    .select('*')
                    .order('month', { ascending: true })
                    .order('day', { ascending: true });
                
                if (!error && data && data.length > 0) {
                    setBirthdays(data);
                    localStorage.setItem('twitch_viewers_birthdays', JSON.stringify(data));
                }
            } catch (err) {
                console.warn("Could not load from Supabase twitch_birthdays:", err);
            }
        };
        loadSupabaseBirthdays();
    }, [supabase]);

    // Save helpers
    const saveBirthdaysState = async (newList) => {
        setBirthdays(newList);
        localStorage.setItem('twitch_viewers_birthdays', JSON.stringify(newList));

        if (supabase) {
            try {
                await supabase.from('twitch_birthdays').upsert(newList);
            } catch (err) {
                console.warn("Supabase upsert warning:", err);
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const cleanUser = username.trim().replace(/^@/, '');
        if (!cleanUser) {
            triggerToast('⚠️ Por favor ingresa el nombre o usuario de Twitch');
            return;
        }

        const cleanMsg = customMessage.trim() || DEFAULT_MESSAGE_TEMPLATE;

        if (editingId) {
            // Update existing
            const updated = birthdays.map(b => {
                if (b.id === editingId) {
                    return {
                        ...b,
                        username: cleanUser,
                        day: Number(day),
                        month: Number(month),
                        message: cleanMsg,
                        active: isActive,
                        updated_at: new Date().toISOString()
                    };
                }
                return b;
            });
            await saveBirthdaysState(updated);
            triggerToast('✅ Cumpleaños actualizado con éxito');
        } else {
            // Create new
            const newEntry = {
                id: 'bday_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                username: cleanUser,
                day: Number(day),
                month: Number(month),
                message: cleanMsg,
                active: isActive,
                created_at: new Date().toISOString()
            };
            const updated = [...birthdays, newEntry];
            await saveBirthdaysState(updated);
            triggerToast('🎉 ¡Cumpleaños de @' + cleanUser + ' registrado!');
        }

        resetForm();
    };

    const resetForm = () => {
        setEditingId(null);
        setUsername('');
        setDay(new Date().getDate());
        setMonth(new Date().getMonth() + 1);
        setCustomMessage(DEFAULT_MESSAGE_TEMPLATE);
        setIsActive(true);
        setIsModalOpen(false);
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setUsername(item.username);
        setDay(item.day);
        setMonth(item.month);
        setCustomMessage(item.message || DEFAULT_MESSAGE_TEMPLATE);
        setIsActive(item.active !== false);
        setIsModalOpen(true);
    };

    const handleDelete = (id, name) => {
        setDeleteConfirmItem({ id, name });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmItem) return;
        const { id, name } = deleteConfirmItem;
        setDeleteConfirmItem(null);

        const updated = birthdays.filter(b => b.id !== id);
        await saveBirthdaysState(updated);

        if (supabase) {
            try {
                await supabase.from('twitch_birthdays').delete().eq('id', id);
            } catch (err) {
                console.warn(err);
            }
        }
        triggerToast('🗑️ Cumpleaños de @' + name + ' eliminado');
        if (editingId === id) resetForm();
    };

    const handleToggleActive = async (id) => {
        const updated = birthdays.map(b => {
            if (b.id === id) {
                return { ...b, active: !b.active };
            }
            return b;
        });
        await saveBirthdaysState(updated);
    };

    const handleTestSendMessage = (item) => {
        if (!enviarMensajeTwitch) {
            triggerToast('⚠️ Función de envío no disponible');
            return;
        }
        const text = (item.message || DEFAULT_MESSAGE_TEMPLATE).replace(/@{user}/gi, '@' + item.username).replace(/{user}/gi, '@' + item.username).replace(/@{usuario}/gi, '@' + item.username).replace(/{usuario}/gi, '@' + item.username);
        enviarMensajeTwitch(text);
        triggerToast('🚀 Mensaje enviado al chat para @' + item.username);
    };

    // Filter list
    const filteredBirthdays = birthdays.filter(b => {
        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchesUser = b.username.toLowerCase().includes(q);
            const matchesMsg = b.message && b.message.toLowerCase().includes(q);
            if (!matchesUser && !matchesMsg) return false;
        }

        // Tab
        if (filterTab === 'today') {
            return b.day === currentDay && b.month === currentMonth;
        }
        if (filterTab === 'month') {
            return b.month === currentMonth;
        }
        if (filterTab === 'inactive') {
            return b.active === false;
        }
        return true;
    }).sort((a, b) => {
        // Show today's birthdays first
        const aIsToday = a.day === currentDay && a.month === currentMonth;
        const bIsToday = b.day === currentDay && b.month === currentMonth;
        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;

        if (a.month !== b.month) return a.month - b.month;
        return a.day - b.day;
    });

    const todaysBirthdays = birthdays.filter(b => b.day === currentDay && b.month === currentMonth && b.active !== false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header Card */}
            <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #EC4899, #F43F5E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px rgba(236, 72, 153, 0.35)' }}>
                        <Cake size={28} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Gestor de Cumpleaños de Viewers
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            El bot felicitará automáticamente a los cumpleañeros del día cada cierto tiempo que asignes a la mención.
                        </span>
                    </div>
                </div>

                {/* Status Pills */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '30px',
                        background: todaysBirthdays.length > 0 ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: todaysBirthdays.length > 0 ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: todaysBirthdays.length > 0 ? '#EC4899' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}>
                        <span>🎉 🎂</span>
                        <span>{todaysBirthdays.length > 0 ? `¡${todaysBirthdays.length} CUMPLEAÑERO(S) HOY!` : 'Sin Cumpleaños Hoy'}</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '30px',
                        background: isBotConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: isBotConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        color: isBotConnected ? '#10B981' : '#EF4444',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isBotConnected ? '#10B981' : '#EF4444' }} />
                        {isBotConnected ? 'Bot de Twitch Activo' : 'Bot Desconectado'}
                    </div>
                </div>
            </div>

            {/* Automation Settings Banner (100% Ajuste perfecto sin scrollbar) */}
            <div className="card animate-slide-down" style={{ 
                padding: '12px 18px', 
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)', 
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: '12px',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', flexShrink: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            ⏰ Temporizador:
                        </span>
                        <button
                            type="button"
                            onClick={() => handleAutoToggle(!isAutoEnabled)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: isAutoEnabled ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                background: isAutoEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isAutoEnabled ? '#22c55e' : '#ef4444',
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {isAutoEnabled ? '🟢 ACTIVO' : '🔴 PAUSA'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cada:</span>
                        <select
                            className="form-control"
                            value={autoInterval}
                            onChange={(e) => handleIntervalChange(e.target.value)}
                            style={{ width: 'auto', padding: '3px 8px', fontSize: '0.8rem', fontWeight: 700, margin: 0 }}
                        >
                            <option value={5}>5 min</option>
                            <option value={10}>10 min</option>
                            <option value={15}>15 min</option>
                            <option value={20}>20 min (Recomendado)</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mín. chat:</span>
                        <select
                            className="form-control"
                            value={autoMinChat}
                            onChange={(e) => handleMinChatChange(e.target.value)}
                            style={{ width: 'auto', padding: '3px 8px', fontSize: '0.8rem', fontWeight: 700, margin: 0 }}
                        >
                            <option value={0}>Sin límite (Solo tiempo)</option>
                            <option value={5}>5 msgs</option>
                            <option value={10}>10 msgs</option>
                            <option value={20}>20 msgs</option>
                        </select>
                    </div>
                </div>

                {/* Botón Felicitar en Vivo Ahora */}
                <button
                    type="button"
                    onClick={handleSendAllTodayNow}
                    disabled={todaysBirthdays.length === 0}
                    style={{
                        padding: '7px 15px',
                        borderRadius: '10px',
                        background: todaysBirthdays.length > 0 ? 'linear-gradient(135deg, #EC4899, #F43F5E)' : 'rgba(255,255,255,0.05)',
                        color: todaysBirthdays.length > 0 ? '#fff' : 'var(--text-muted)',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: todaysBirthdays.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: todaysBirthdays.length > 0 ? '0 4px 15px rgba(236, 72, 153, 0.35)' : 'none',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                    }}
                >
                    <Send size={13} /> Felicitar en Vivo Ahora
                </button>
            </div>

            {/* Controls Bar: Search, Filter Tabs & Add Birthday Button */}
            <div className="card animate-slide-down" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setFilterTab('all')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: filterTab === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: filterTab === 'all' ? '#fff' : 'var(--text-muted)',
                            border: filterTab === 'all' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        Todos ({birthdays.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilterTab('today')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: filterTab === 'today' ? '#EC4899' : 'rgba(236, 72, 153, 0.1)',
                            color: filterTab === 'today' ? '#fff' : '#EC4899',
                            border: filterTab === 'today' ? '1px solid #EC4899' : '1px solid rgba(236, 72, 153, 0.3)'
                        }}
                    >
                        🎂 De Hoy ({todaysBirthdays.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilterTab('month')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: filterTab === 'month' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255,255,255,0.04)',
                            color: filterTab === 'month' ? '#fff' : 'var(--text-muted)',
                            border: filterTab === 'month' ? '1px solid #A855F7' : '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        Este Mes ({MONTHS.find(m => m.value === currentMonth)?.label})
                    </button>
                </div>

                {/* Search Input & Add Button at Right */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: '220px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar viewer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '32px', fontSize: '0.8rem', padding: '6px 10px 6px 30px', margin: 0 }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #EC4899, #F43F5E)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Plus size={16} /> Registrar Cumpleaños
                    </button>
                </div>
            </div>

            {/* Today Banner (if any) */}
            {todaysBirthdays.length > 0 && (
                <div className="card animate-slide-down" style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 63, 94, 0.1))',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.8rem' }}>🎉</span>
                        <div>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                                ¡Hoy es el cumpleaños de {todaysBirthdays.map(b => '@' + b.username).join(', ')}!
                            </h4>
                            <span style={{ fontSize: '0.78rem', color: '#fbcfe8' }}>
                                El bot enviará su mensaje de felicitación al chat de Twitch en lapsus de tiempo que tengas asignado de forma automática.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Birthday Cards List Centered */}
            {filteredBirthdays.length === 0 ? (
                <div className="card text-center" style={{ padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Cake size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No se encontraron cumpleaños registrados.</p>
                    <small>Utiliza el botón <strong>+ Registrar Cumpleaños</strong> de arriba para agregar a tus viewers.</small>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredBirthdays.map((item) => {
                        const isToday = item.day === currentDay && item.month === currentMonth;
                        const monthLabel = MONTHS.find(m => m.value === item.month)?.label || item.month;
                        const isCardActive = item.active !== false;

                        return (
                            <div 
                                key={item.id}
                                className="card animate-slide-down"
                                style={{
                                    padding: '14px 20px',
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(210px, 230px) 1fr auto',
                                    alignItems: 'center',
                                    gap: '16px',
                                    border: isToday 
                                        ? '1px solid rgba(236, 72, 153, 0.5)' 
                                        : !isCardActive 
                                            ? '1px solid rgba(255,255,255,0.04)' 
                                            : '1px solid rgba(255,255,255,0.08)',
                                    background: isToday 
                                        ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' 
                                        : !isCardActive
                                            ? 'rgba(0,0,0,0.2)'
                                            : 'var(--bg-card)',
                                    opacity: isCardActive ? 1 : 0.6
                                }}
                            >
                                {/* 1. Izquierda: Fecha y Nombre de usuario */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                                    {/* Date Circle Badge */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: isToday ? 'linear-gradient(135deg, #EC4899, #F43F5E)' : 'rgba(255, 255, 255, 0.06)',
                                        border: isToday ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        boxShadow: isToday ? '0 4px 14px rgba(236, 72, 153, 0.4)' : 'none',
                                        flexShrink: 0
                                    }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{item.day}</span>
                                        <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
                                            {monthLabel.substring(0, 3)}
                                        </span>
                                    </div>

                                    {/* Username & Status */}
                                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                @{item.username}
                                            </h4>
                                            {isToday && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '20px',
                                                    background: 'linear-gradient(135deg, #EC4899, #F43F5E)',
                                                    color: '#fff',
                                                    fontWeight: 800,
                                                    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    ¡ES HOY! 🎂
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                                            Fecha: {item.day} de {monthLabel}
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Centro: Cuadro del mensaje autoajustable y uniforme */}
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    minWidth: 0,
                                    wordBreak: 'break-word',
                                    overflowWrap: 'anywhere'
                                }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                                        MENSAJE PARA EL CHAT:
                                    </span>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.84rem',
                                        color: 'var(--text-main)',
                                        lineHeight: 1.45,
                                        fontStyle: 'italic',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'anywhere'
                                    }}>
                                        "{item.message || DEFAULT_MESSAGE_TEMPLATE}"
                                    </p>
                                </div>

                                {/* 3. Derecha: Botones de acciones fijos y alineados */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {/* Test Chat Button */}
                                    <button
                                        type="button"
                                        title="Probar envío en chat"
                                        onClick={() => handleTestSendMessage(item)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            background: 'rgba(145, 70, 255, 0.15)',
                                            border: '1px solid rgba(145, 70, 255, 0.35)',
                                            color: '#A855F7',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Send size={12} /> Probar en Chat
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                        type="button"
                                        title="Editar"
                                        onClick={() => handleEdit(item)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Edit2 size={14} />
                                    </button>

                                    {/* Active/Inactive Toggle */}
                                    <button
                                        type="button"
                                        title={isCardActive ? 'Desactivar' : 'Activar'}
                                        onClick={() => handleToggleActive(item.id)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            background: isCardActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                                            border: isCardActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                            color: isCardActive ? '#10B981' : 'var(--text-muted)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isCardActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        title="Eliminar"
                                        onClick={() => handleDelete(item.id, item.username)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#EF4444',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Emergente para Registrar / Editar Cumpleaños */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div className="card animate-slide-down" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', padding: '24px', border: '1px solid rgba(236, 72, 153, 0.4)', boxShadow: '0 15px 50px rgba(0,0,0,0.85)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {editingId ? <Edit2 size={20} color="#EC4899" /> : <Plus size={20} color="#EC4899" />}
                                {editingId ? 'Editar Cumpleaños' : 'Registrar Nuevo Cumpleaños'}
                            </h3>
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                                title="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Viewer Username */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <User size={14} color="#EC4899" /> Nombre / Usuario de Twitch:
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        @
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: JuanitoGamer, TokkiiFan..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{ paddingLeft: '30px' }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date: Day & Month */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Día:</label>
                                    <select 
                                        className="form-control" 
                                        value={day} 
                                        onChange={(e) => setDay(Number(e.target.value))}
                                    >
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Mes:</label>
                                    <select 
                                        className="form-control" 
                                        value={month} 
                                        onChange={(e) => setMonth(Number(e.target.value))}
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Custom Message */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', margin: 0, fontWeight: 700 }}>
                                        <MessageSquare size={14} color="#EC4899" /> Mensaje de Felicitaciones:
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setCustomMessage(DEFAULT_MESSAGE_TEMPLATE)}
                                        style={{ background: 'none', border: 'none', color: '#EC4899', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Restablecer
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.82rem', color: '#EC4899', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                                    💡 Tip: Usa /announce al inicio para enviar como anuncio oficial
                                </span>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder={DEFAULT_MESSAGE_TEMPLATE}
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    style={{ fontSize: '0.85rem', resize: 'vertical' }}
                                />
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Usa <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 4px', borderRadius: '3px' }}>{'{user}'}</code> para insertar automáticamente la mención al cumpleañero.
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                    Felicitación automática activa
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isActive ? '#10B981' : 'var(--text-muted)' }}
                                >
                                    {isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                </button>
                            </div>

                            {/* Actions Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        padding: '10px 18px',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.12)',
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
                                        background: 'linear-gradient(135deg, #EC4899, #F43F5E)',
                                        color: '#fff',
                                        fontWeight: 800,
                                        borderRadius: '8px',
                                        padding: '10px 22px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                                    }}
                                >
                                    <Sparkles size={16} />
                                    {editingId ? 'Guardar Cambios' : 'Registrar Cumpleaños'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Personalizado para Confirmar Eliminación */}
            {deleteConfirmItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '20px'
                }}>
                    <div className="card animate-slide-down" style={{
                        maxWidth: '440px',
                        width: '100%',
                        padding: '28px',
                        borderRadius: '16px',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        background: 'linear-gradient(145deg, #111827 0%, #0b0f19 100%)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(239, 68, 68, 0.15)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                            color: '#EF4444'
                        }}>
                            <Trash2 size={26} />
                        </div>

                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>
                            ¿Eliminar cumpleaños?
                        </h3>

                        <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            ¿Seguro que deseas eliminar el cumpleaños de <strong>@{deleteConfirmItem.name}</strong>? Esta acción no se puede deshacer.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmItem(null)}
                                style={{
                                    flex: 1,
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                style={{
                                    flex: 1,
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
                                }}
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}