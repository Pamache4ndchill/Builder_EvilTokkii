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
    const [username, setUsername] = useState('');
    const [day, setDay] = useState(() => new Date().getDate());
    const [month, setMonth] = useState(() => new Date().getMonth() + 1);
    const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE_TEMPLATE);
    const [isActive, setIsActive] = useState(true);

    // Filters & Search
    const [filterTab, setFilterTab] = useState('all'); // 'all', 'today', 'month', 'inactive'
    const [searchQuery, setSearchQuery] = useState('');

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
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setUsername(item.username);
        setDay(item.day);
        setMonth(item.month);
        setCustomMessage(item.message || DEFAULT_MESSAGE_TEMPLATE);
        setIsActive(item.active !== false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm('¿Seguro que deseas eliminar el cumpleaños de @' + name + '?')) return;
        const updated = birthdays.filter(b => b.id !== id);
        await saveBirthdaysState(updated);

        if (supabase) {
            try {
                await supabase.from('twitch_birthdays').delete().eq('id', id);
            } catch (err) {
                console.warn(err);
            }
        }
        triggerToast('Cumpleaños de @' + name + ' eliminado');
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
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
                            El bot felicitará automáticamente a los cumpleañeros del día cada 20 minutos en el chat de Twitch
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
                        <PartyPopper size={16} />
                        {todaysBirthdays.length > 0 ? ('🎂 ¡' + todaysBirthdays.length + ' CUMPLEAÑERO(S) HOY!') : 'Sin cumpleaños hoy'}
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

            {/* Main Grid: Left Form, Right List */}
            <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* LEFT: Add / Edit Form */}
                <div className="card animate-slide-down" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {editingId ? <Edit2 size={18} color="#EC4899" /> : <Plus size={18} color="#EC4899" />}
                            {editingId ? 'Editar Cumpleaños' : 'Registrar Cumpleaños'}
                        </h3>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* Viewer Username */}
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                <User size={14} color="var(--primary)" /> Nombre / Usuario de Twitch:
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
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Día:</label>
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
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Mes:</label>
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
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MessageSquare size={14} color="#EC4899" /> Mensaje de Felicitaciones:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCustomMessage(DEFAULT_MESSAGE_TEMPLATE)}
                                    style={{ background: 'none', border: 'none', color: '#EC4899', fontSize: '0.72rem', cursor: 'pointer' }}
                                >
                                    Predeterminado
                                </button>
                            </label>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-submit"
                            style={{
                                marginTop: '6px',
                                background: 'linear-gradient(135deg, #EC4899, #F43F5E)',
                                color: '#fff',
                                fontWeight: 800,
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                            }}
                        >
                            <Sparkles size={18} />
                            {editingId ? 'Guardar Cambios' : 'Registrar Cumpleaños'}
                        </button>

                    </form>
                </div>

                {/* RIGHT: List & Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    
                    {/* Controls Bar: Search & Filter Tabs */}
                    <div className="card animate-slide-down" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                        
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

                        {/* Search Input */}
                        <div style={{ position: 'relative', width: '220px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar viewer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '32px', fontSize: '0.8rem', padding: '6px 10px 6px 30px' }}
                            />
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
                                        El bot enviará su mensaje de felicitación al chat de Twitch cada 20 minutos de forma automática.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Birthday Cards List */}
                    {filteredBirthdays.length === 0 ? (
                        <div className="card text-center" style={{ padding: '40px 20px', color: 'var(--text-muted)' }}>
                            <Cake size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>No se encontraron cumpleaños registrados.</p>
                            <small>Utiliza el formulario de la izquierda para agregar a tus viewers favoritos.</small>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredBirthdays.map(b => {
                                const isToday = b.day === currentDay && b.month === currentMonth;
                                const monthName = MONTHS.find(m => m.value === b.month)?.label || '';

                                return (
                                    <div
                                        key={b.id}
                                        className="card animate-slide-down"
                                        style={{
                                            padding: '18px 20px',
                                            margin: 0,
                                            borderRadius: '12px',
                                            background: isToday 
                                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(15, 23, 42, 0.9))' 
                                                : 'var(--bg-card)',
                                            border: isToday 
                                                ? '1.5px solid rgba(236, 72, 153, 0.5)' 
                                                : '1px solid rgba(255, 255, 255, 0.05)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '16px',
                                            flexWrap: 'wrap',
                                            boxShadow: isToday ? '0 8px 25px rgba(236, 72, 153, 0.2)' : 'none'
                                        }}
                                    >
                                        {/* Viewer Info & Date */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: isToday ? 'linear-gradient(135deg, #EC4899, #F43F5E)' : 'rgba(255,255,255,0.04)',
                                                border: isToday ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: isToday ? '#fff' : 'var(--text-main)', lineHeight: '1' }}>
                                                    {b.day}
                                                </span>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isToday ? '#fff' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                    {monthName.substring(0, 3)}
                                                </span>
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>
                                                        @{b.username}
                                                    </h4>
                                                    {isToday && (
                                                        <span style={{ padding: '2px 8px', background: '#EC4899', color: '#fff', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800 }}>
                                                            ¡ES HOY! 🎂
                                                        </span>
                                                    )}
                                                    {b.active === false && (
                                                        <span style={{ padding: '2px 6px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                                                            Pausado
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    Fecha: {b.day} de {monthName}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Message preview */}
                                        <div style={{ flex: 1, minWidth: '240px', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
                                                Mensaje para el chat:
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontStyle: 'italic', wordBreak: 'break-word' }}>
                                                "{(b.message || DEFAULT_MESSAGE_TEMPLATE).replace(/@{user}/gi, '@' + b.username).replace(/{user}/gi, '@' + b.username).replace(/@{usuario}/gi, '@' + b.username).replace(/{usuario}/gi, '@' + b.username)}"
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            
                                            {/* Send test to chat */}
                                            <button
                                                type="button"
                                                onClick={() => handleTestSendMessage(b)}
                                                className="btn-add"
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '0.75rem',
                                                    background: 'rgba(168, 85, 247, 0.12)',
                                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                                    color: '#A855F7',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                                title="Enviar felicitación al chat ahora mismo"
                                            >
                                                <Send size={13} /> Probar en Chat
                                            </button>

                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(b)}
                                                className="btn-add"
                                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                                title="Editar"
                                            >
                                                <Edit2 size={14} />
                                            </button>

                                            {/* Toggle Active */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(b.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: b.active !== false ? '#10B981' : 'var(--text-muted)'
                                                }}
                                                title={b.active !== false ? 'Desactivar felicitación' : 'Activar felicitación'}
                                            >
                                                {b.active !== false ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(b.id, b.username)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    color: '#EF4444',
                                                    padding: '6px 8px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
