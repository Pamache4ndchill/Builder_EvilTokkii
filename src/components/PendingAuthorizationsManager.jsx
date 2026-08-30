import React, { useState, useEffect, useCallback } from 'react';
import { 
    UserCheck, UserX, Users, ShieldCheck, Check, Trash2, RefreshCw, 
    Search, AlertCircle, Clock, Sparkles, CheckCircle2, ChevronRight, Crown, Mail, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PendingAuthorizationsManager({ supabase, triggerToast, sessionEmail, onGoToPermissions }) {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionInProgress, setActionInProgress] = useState(null);

    // Cargar usuarios pendientes (approved === false)
    const fetchPendingUsers = useCallback(async () => {
        if (!supabase) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('whitelist')
                .select('*')
                .eq('approved', false)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPendingUsers(data);
            }
        } catch (err) {
            console.error('Error fetching pending users:', err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchPendingUsers();

        // Suscripción Realtime a cambios en whitelist
        if (supabase) {
            const channel = supabase
                .channel('whitelist_pending_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'whitelist' }, () => {
                    fetchPendingUsers();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [fetchPendingUsers, supabase]);

    // 1. Aprobar Acceso Estándar
    const handleApproveStandard = async (userObj) => {
        if (!supabase) return;
        setActionInProgress(userObj.id || userObj.email);
        try {
            const { error } = await supabase
                .from('whitelist')
                .update({ 
                    approved: true,
                    // Permisos básicos predeterminados
                    access_news: true,
                    access_events: true,
                    access_giveaways: true,
                    access_participations: true,
                    access_twitch: true,
                    access_scheduled_messages: true,
                    access_song_request: true,
                    access_commands: true,
                    access_reports: true,
                    access_minigames: true,
                    access_ruleta: true,
                    access_twitch_giveaway: true,
                    access_birthdays: true,
                    access_tts_voices: true,
                    access_points_wheel: true,
                    access_tierlists: true,
                    access_most_streamed: true
                })
                .eq('email', userObj.email);

            if (error) throw error;

            setPendingUsers(prev => prev.filter(u => u.email !== userObj.email));
            triggerToast(`✅ Usuario @${userObj.username || userObj.email} aprobado con éxito.`);
        } catch (err) {
            console.error('Error approving user:', err);
            triggerToast('❌ Error al aprobar usuario: ' + (err.message || 'Inténtalo de nuevo'));
        } finally {
            setActionInProgress(null);
        }
    };

    // 2. Rechazar / Eliminar Solicitud
    const handleRejectUser = async (userObj) => {
        if (!supabase) return;
        const confirmDelete = window.confirm(`¿Estás seguro de rechazar y eliminar la solicitud de "${userObj.username || userObj.email}"?`);
        if (!confirmDelete) return;

        setActionInProgress(userObj.id || userObj.email);
        try {
            const { error } = await supabase
                .from('whitelist')
                .delete()
                .eq('email', userObj.email);

            if (error) throw error;

            setPendingUsers(prev => prev.filter(u => u.email !== userObj.email));
            triggerToast(`🗑️ Solicitud de ${userObj.email} eliminada.`);
        } catch (err) {
            console.error('Error deleting user request:', err);
            triggerToast('❌ Error al eliminar solicitud: ' + (err.message || 'Error'));
        } finally {
            setActionInProgress(null);
        }
    };

    // Filtrar por búsqueda
    const filteredUsers = pendingUsers.filter(u => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (u.email && u.email.toLowerCase().includes(q)) || 
               (u.username && u.username.toLowerCase().includes(q));
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
            
            {/* Header del Panel */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.8))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '20px',
                padding: '1.8rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)'
                    }}>
                        <UserCheck size={28} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.4rem', fontWeight: 800 }}>
                                Solicitudes Pendientes de Autorización
                            </h2>
                            <span style={{
                                background: pendingUsers.length > 0 ? '#EF4444' : '#10B981',
                                color: '#FFF',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: '20px'
                            }}>
                                {pendingUsers.length} {pendingUsers.length === 1 ? 'pendiente' : 'pendientes'}
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            Usuarios que intentaron iniciar sesión y están a la espera de tu aprobación desde Supabase.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={fetchPendingUsers}
                        disabled={isLoading}
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#F8FAFC',
                            borderRadius: '10px',
                            padding: '9px 14px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Actualizar
                    </button>

                    {onGoToPermissions && (
                        <button
                            type="button"
                            onClick={onGoToPermissions}
                            style={{
                                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '9px 16px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <ShieldCheck size={16} /> Ver Gestión de Permisos
                        </button>
                    )}
                </div>
            </div>

            {/* Barra de Búsqueda */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por correo electrónico o apodo..."
                    style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        padding: '12px 14px 12px 42px',
                        color: '#FFF',
                        fontSize: '0.9rem'
                    }}
                />
            </div>

            {/* Listado de Solicitudes */}
            {filteredUsers.length === 0 ? (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <CheckCircle2 size={36} />
                    </div>
                    <h3 style={{ margin: '0 0 6px', color: '#F8FAFC', fontSize: '1.2rem', fontWeight: 800 }}>
                        ¡No hay solicitudes pendientes!
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Todos los usuarios registrados en el Builder están autorizados o la lista está al día.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence>
                        {filteredUsers.map((user) => {
                            const dateStr = user.created_at 
                                ? new Date(user.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
                                : 'Fecha no registrada';

                            const isBusy = actionInProgress === (user.id || user.email);

                            return (
                                <motion.div
                                    key={user.id || user.email}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="card"
                                    style={{
                                        padding: '1.4rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1.5rem',
                                        flexWrap: 'wrap',
                                        borderLeft: '5px solid #F59E0B',
                                        background: 'rgba(15, 23, 42, 0.75)'
                                    }}
                                >
                                    {/* Info Usuario */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '46px',
                                            height: '46px',
                                            borderRadius: '12px',
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            color: '#F59E0B',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            fontWeight: 800
                                        }}>
                                            {(user.username || user.email || 'U')[0].toUpperCase()}
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 800 }}>
                                                    {user.username || 'Usuario sin apodo'}
                                                </h4>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    color: '#EF4444',
                                                    fontWeight: 700
                                                }}>
                                                    Pendiente
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Mail size={13} /> {user.email}
                                                </span>
                                                <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={13} /> {dateStr}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        {/* Botón Rechazar */}
                                        <button
                                            type="button"
                                            onClick={() => handleRejectUser(user)}
                                            disabled={isBusy}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.15)',
                                                color: '#EF4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '10px',
                                                padding: '9px 16px',
                                                fontSize: '0.84rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Trash2 size={15} /> Rechazar
                                        </button>

                                        {/* Botón Aprobar */}
                                        <button
                                            type="button"
                                            onClick={() => handleApproveStandard(user)}
                                            disabled={isBusy}
                                            style={{
                                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                                color: '#FFF',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '9px 20px',
                                                fontSize: '0.88rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Check size={16} /> {isBusy ? 'Aprobando...' : 'Aprobar Acceso'}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
