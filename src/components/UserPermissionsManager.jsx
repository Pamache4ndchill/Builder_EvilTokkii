import React, { useState, useEffect, useCallback } from 'react';
import { 
    ShieldCheck, UserCheck, Users, Plus, Trash2, Edit, Save, 
    RefreshCw, Search, ToggleLeft, ToggleRight, Check, X, 
    Crown, Lock, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

const PERMISSION_COLUMNS = [
    { key: 'approved', label: 'Acceso al Builder', desc: 'Permite iniciar sesión', color: '#10B981', isMain: true },
    { key: 'access_news', label: 'Crear Noticias', desc: 'Publicación de noticias', color: '#38BDF8' },
    { key: 'access_events', label: 'Eventos y Sorteos', desc: 'Creación de eventos y sorteos', color: '#818CF8' },
    { key: 'access_participations', label: 'Participaciones', desc: 'Revisar inscritos a eventos', color: '#F472B6' },
    { key: 'access_most_streamed', label: 'Lo más Streameable', desc: 'Juegos destacados web', color: '#EC4899' },
    { key: 'access_reports', label: 'Reportes Web', desc: 'Bandeja de reportes de usuarios', color: '#EF4444' },
    { key: 'access_minigames', label: 'Minijuegos', desc: 'Banco de preguntas y dinámicas', color: '#A855F7' },
    { key: 'access_tierlists', label: 'Tierlists', desc: 'Edición de personajes de tierlists', color: '#F59E0B' },
    { key: 'access_ruleta', label: 'Ruleta de Sorteos', desc: 'Ruleta animada en directo', color: '#A855F7' },
    { key: 'access_points_wheel', label: 'Ruleta por Puntos', desc: 'Ruleta de puntos con overlay OBS', color: '#38BDF8' },
    { key: 'access_twitch_giveaway', label: 'Sorteo en Vivo (Chat)', desc: 'Sorteo de palabras clave', color: '#9146FF' },
    { key: 'access_twitch', label: 'Canjes de Twitch', desc: 'Reclamos de puntos de canal', color: '#8B5CF6' },
    { key: 'access_scheduled_messages', label: 'Mensajes Programados', desc: 'Temporizadores del bot', color: '#3B82F6' },
    { key: 'access_song_request', label: 'Song Request', desc: 'Cola de Spotify y reproductor', color: '#1DB954' },
    { key: 'access_commands', label: 'Comandos del Chat', desc: 'Comandos de pelea y diversión', color: '#10B981' },
    { key: 'access_tts_voices', label: 'Voces TTS (Personajes)', desc: 'Comandos de voces de IA para Twitch', color: '#10B981' },
    { key: 'access_birthdays', label: 'Cumpleaños', desc: 'Felicitaciones automáticas de viewers', color: '#EC4899' },
    { key: 'access_bot_credentials', label: 'Credenciales Bot', desc: 'Configuración de cuenta y token', color: '#9146FF' }
];

export default function UserPermissionsManager({ supabase, triggerToast, sessionEmail }) {
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // Modal para agregar usuario
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Fetch Whitelist Users from Supabase
    const fetchUsers = useCallback(async () => {
        if (!supabase) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('whitelist')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setUsersList(data);
                if (!selectedUser && data.length > 0) {
                    setSelectedUser(data[0]);
                } else if (selectedUser) {
                    const updatedSelected = data.find(u => u.id === selectedUser.id || u.email === selectedUser.email);
                    if (updatedSelected) setSelectedUser(updatedSelected);
                }
            }
        } catch (err) {
            console.error('Error fetching whitelist:', err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase, selectedUser]);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Toggle Permission Switch
    const handleTogglePermission = async (userObj, permKey) => {
        if (!supabase) return;
        const currentValue = !!userObj[permKey];
        const newValue = !currentValue;

        // Optimistic UI update
        const updatedUsers = usersList.map(u => {
            if (u.id === userObj.id || u.email === userObj.email) {
                return { ...u, [permKey]: newValue };
            }
            return u;
        });
        setUsersList(updatedUsers);
        if (selectedUser && (selectedUser.id === userObj.id || selectedUser.email === userObj.email)) {
            setSelectedUser({ ...selectedUser, [permKey]: newValue });
        }

        try {
            const { error } = await supabase
                .from('whitelist')
                .update({ [permKey]: newValue })
                .eq('email', userObj.email);

            if (error) {
                if (error.message && error.message.includes('column')) {
                    triggerToast(`⚠️ La columna ${permKey} aún no existe en Supabase (ejecuta el script SQL abajo)`);
                } else {
                    throw error;
                }
            } else {
                triggerToast(`Permiso actualizado para @${userObj.username || userObj.email}`);
            }
        } catch (err) {
            console.error('Error updating permission:', err);
            triggerToast('⚠️ Error al actualizar permiso');
        }
    };

    // Grant / Revoke All Permissions
    const handleSetAllPermissions = async (userObj, grantAll) => {
        if (!supabase) return;
        const updates = {};
        PERMISSION_COLUMNS.forEach(col => {
            updates[col.key] = grantAll;
        });

        // Optimistic UI update
        const updatedUsers = usersList.map(u => {
            if (u.id === userObj.id || u.email === userObj.email) {
                return { ...u, ...updates };
            }
            return u;
        });
        setUsersList(updatedUsers);
        if (selectedUser && (selectedUser.id === userObj.id || selectedUser.email === userObj.email)) {
            setSelectedUser({ ...selectedUser, ...updates });
        }

        try {
            const { error } = await supabase
                .from('whitelist')
                .update(updates)
                .eq('email', userObj.email);

            if (error) throw error;
            triggerToast(grantAll ? `✅ Todos los permisos otorgados a @${userObj.username || userObj.email}` : `🔴 Todos los permisos revocados para @${userObj.username || userObj.email}`);
        } catch (err) {
            console.error('Error batch updating permissions:', err);
            fetchUsers();
        }
    };

    // Add New User
    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = newEmail.trim().toLowerCase();
        const cleanUser = newUsername.trim();

        if (!cleanEmail) {
            triggerToast('⚠️ Por favor ingresa el correo del usuario');
            return;
        }

        setIsCreating(true);
        try {
            const newRecord = {
                email: cleanEmail,
                username: cleanUser || cleanEmail.split('@')[0],
                approved: true,
                access_news: false,
                access_events: false,
                access_giveaways: false,
                access_participations: false,
                access_most_streamed: false,
                access_reports: false,
                access_minigames: false,
                access_tierlists: false,
                access_ruleta: false,
                access_twitch_giveaway: false,
                access_twitch: false,
                access_scheduled_messages: false,
                access_song_request: false,
                access_commands: false,
                access_birthdays: false,
                access_bot_credentials: false,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('whitelist')
                .insert([newRecord]);

            if (error) throw error;

            triggerToast(`🎉 Usuario @${newRecord.username} agregado a la whitelist`);
            setIsAddModalOpen(false);
            setNewEmail('');
            setNewUsername('');
            fetchUsers();
        } catch (err) {
            console.error('Error adding user:', err);
            triggerToast('⚠️ Error: ' + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    // Delete User
    const handleDeleteUser = async (userObj) => {
        if (!window.confirm(`¿Seguro que deseas eliminar el acceso de @${userObj.username || userObj.email}?`)) return;
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('whitelist')
                .delete()
                .eq('email', userObj.email);

            if (error) throw error;

            triggerToast(`Usuario @${userObj.username || userObj.email} eliminado`);
            setUsersList(prev => prev.filter(u => u.email !== userObj.email));
            if (selectedUser && selectedUser.email === userObj.email) {
                setSelectedUser(usersList[0] || null);
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            triggerToast('⚠️ Error al eliminar usuario');
        }
    };

    const filteredUsers = usersList.filter(u => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (u.email && u.email.toLowerCase().includes(q)) || 
               (u.username && u.username.toLowerCase().includes(q));
    });

    const activeUser = selectedUser || filteredUsers[0] || null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            {/* Header Card */}
            <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)' }}>
                        <Crown size={28} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Gestión de Usuarios y Permisos (Admin)
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Panel exclusivo de Pamache para activar y desactivar casillas del Builder por usuario
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={fetchUsers}
                        className="btn-add"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        disabled={isLoading}
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        {isLoading ? 'Cargando...' : 'Actualizar'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-submit"
                        style={{ width: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000', fontWeight: 800, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> Añadir Usuario
                    </button>
                </div>
            </div>

            {/* Main Layout: Left Users List, Right Permissions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* LEFT: Users Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Search Box */}
                    <div className="card animate-slide-down" style={{ padding: '14px 16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por email o usuario..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '34px', fontSize: '0.85rem', margin: 0 }}
                            />
                        </div>
                    </div>

                    {/* Users List Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                        {filteredUsers.length === 0 ? (
                            <div className="card text-center" style={{ padding: '30px 15px', color: 'var(--text-muted)' }}>
                                No hay usuarios en la lista.
                            </div>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = activeUser && (activeUser.id === user.id || activeUser.email === user.email);
                                const isOwner = user.email.toLowerCase() === 'pamacheyt@gmail.com';
                                const activePermsCount = PERMISSION_COLUMNS.filter(c => c.key !== 'approved' && user[c.key]).length;

                                return (
                                    <div
                                        key={user.id || user.email}
                                        className="card animate-slide-down"
                                        onClick={() => setSelectedUser(user)}
                                        style={{
                                            padding: '16px 18px',
                                            margin: 0,
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            background: isSelected 
                                                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95))' 
                                                : 'var(--bg-card)',
                                            border: isSelected 
                                                ? '1.5px solid #F59E0B' 
                                                : '1px solid rgba(255, 255, 255, 0.06)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isSelected ? '0 6px 20px rgba(245, 158, 11, 0.2)' : 'none'
                                        }}
                                    >
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <strong style={{ fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    @{user.username || 'Sin Nombre'}
                                                </strong>
                                                {isOwner && (
                                                    <span style={{ padding: '1px 6px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                                                        SUPERADMIN
                                                    </span>
                                                )}
                                                {!user.approved && (
                                                    <span style={{ padding: '1px 6px', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                                                        Pendiente
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                                                {user.email}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#F59E0B', marginTop: '4px', fontWeight: 600 }}>
                                                {activePermsCount} casillas activas
                                            </div>
                                        </div>

                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.approved ? '#10B981' : '#EF4444', boxShadow: user.approved ? '0 0 8px #10B981' : 'none', flexShrink: 0 }} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT: User Permissions Editor */}
                {activeUser ? (
                    <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', margin: 0 }}>
                        
                        {/* Header del Usuario Seleccionado */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '18px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                                            @{activeUser.username || activeUser.email}
                                        </h3>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {activeUser.email}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Batch Actions */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => handleSetAllPermissions(activeUser, true)}
                                    className="btn-add"
                                    style={{ padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981' }}
                                >
                                    ✅ Dar Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetAllPermissions(activeUser, false)}
                                    className="btn-add"
                                    style={{ padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
                                >
                                    🔴 Revocar Todos
                                </button>
                                {activeUser.email.toLowerCase() !== 'pamacheyt@gmail.com' && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteUser(activeUser)}
                                        style={{ padding: '6px 10px', background: 'none', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '6px', cursor: 'pointer' }}
                                        title="Eliminar usuario"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Switches Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                            {PERMISSION_COLUMNS.map(col => {
                                const isEnabled = !!activeUser[col.key];

                                return (
                                    <div
                                        key={col.key}
                                        onClick={() => handleTogglePermission(activeUser, col.key)}
                                        style={{
                                            padding: '14px 16px',
                                            borderRadius: '10px',
                                            background: isEnabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                                            border: isEnabled ? `1px solid ${col.color}40` : '1px solid rgba(255, 255, 255, 0.06)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ minWidth: 0, paddingRight: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                                                <strong style={{ fontSize: '0.9rem', color: isEnabled ? '#fff' : 'var(--text-muted)' }}>
                                                    {col.label}
                                                </strong>
                                            </div>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                                {col.desc}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: isEnabled ? (col.color || '#10B981') : '#64748b',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {isEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                ) : (
                    <div className="card text-center" style={{ padding: '60px 20px', color: 'var(--text-muted)' }}>
                        Selecciona un usuario de la lista de la izquierda para configurar sus accesos.
                    </div>
                )}

            </div>

            {/* Modal para Añadir Nuevo Usuario */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="card animate-slide-down" style={{ width: '460px', padding: '24px', margin: 0, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Plus size={18} color="#F59E0B" /> Añadir Usuario a la Whitelist
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Correo Electrónico (Gmail/Email):</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="usuario@gmail.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Nombre de Usuario / Apodo:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Kari, Naofumi, Juan..."
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    style={{ width: 'auto', padding: '8px 20px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000', fontWeight: 800, borderRadius: '8px' }}
                                    disabled={isCreating}
                                >
                                    {isCreating ? 'Guardando...' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
