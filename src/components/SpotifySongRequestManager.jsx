import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, Pause, Music, Search, Plus, Trash2, CheckCircle2, AlertCircle, 
    ExternalLink, RefreshCw, Radio, Sparkles, Disc3, ShieldCheck, MessageSquare, ListMusic, Check, Copy, HelpCircle, Link as LinkIcon
} from 'lucide-react';

export const DEFAULT_SPOTIFY_CLIENT_ID = '467b4e8480964c26913cb87d276ed20c';
const SPOTIFY_SCOPES = [
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-playback-state',
    'user-read-currently-playing'
].join(' ');

// PKCE Helpers
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// Extraer ID limpio de Playlist desde URL o texto
export function extractSpotifyPlaylistId(input) {
    if (!input) return '';
    const clean = input.trim();
    if (clean.includes('spotify.com/playlist/')) {
        return clean.split('playlist/')[1]?.split('?')[0]?.split('/')[0] || '';
    }
    return clean;
}

export default function SpotifySongRequestManager({ 
    supabase, 
    triggerToast, 
    songRequestCommand: propCmd, 
    setSongRequestCommand: propSetCmd,
    isSongRequestEnabled: propEnabled,
    setIsSongRequestEnabled: propSetEnabled
}) {
    // Spotify Auth State
    // Spotify Client ID & Redirect URI configurables
    const [clientIdInput, setClientIdInput] = useState(() => localStorage.getItem('spotify_custom_client_id') || DEFAULT_SPOTIFY_CLIENT_ID);
    const activeClientId = clientIdInput.trim() || DEFAULT_SPOTIFY_CLIENT_ID;

    const currentOriginPath = window.location.origin + window.location.pathname;
    const [selectedRedirectUri, setSelectedRedirectUri] = useState(() => localStorage.getItem('spotify_custom_redirect_uri') || currentOriginPath);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [copiedRedirect, setCopiedRedirect] = useState(false);

    const [spotifyToken, setSpotifyToken] = useState(() => localStorage.getItem('spotify_access_token') || '');
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('spotify_refresh_token') || '');
    const [spotifyUser, setSpotifyUser] = useState(null);

    // Playlist State (Modo Spotify Free)
    const [playlistInput, setPlaylistInput] = useState(() => localStorage.getItem('spotify_sr_playlist_url') || '');
    const [playlistData, setPlaylistData] = useState(null);
    const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);

    // Queue & Requests
    const [songQueue, setSongQueue] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAddingSong, setIsAddingSong] = useState(false);

    // Command & Settings
    const [localCmd, setLocalCmd] = useState(() => localStorage.getItem('song_request_command') || '!sr');
    const songRequestCommand = propCmd !== undefined ? propCmd : localCmd;
    const setSongRequestCommand = propSetCmd !== undefined ? propSetCmd : setLocalCmd;
    const [customCommandInput, setCustomCommandInput] = useState(() => localStorage.getItem('song_request_command') || '!sr');

    const [localEnabled, setLocalEnabled] = useState(() => localStorage.getItem('song_request_enabled') !== 'false');
    const isSongRequestEnabled = propEnabled !== undefined ? propEnabled : localEnabled;
    const setIsSongRequestEnabled = propSetEnabled !== undefined ? propSetEnabled : setLocalEnabled;

    // Modal de confirmación emergente estilizado
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        onConfirm: null
    });

    const openConfirmModal = (title, message, confirmText, action) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            confirmText: confirmText || 'Eliminar',
            onConfirm: action
        });
    };

    const closeConfirmModal = () => {
        setConfirmDialog({
            isOpen: false,
            title: '',
            message: '',
            confirmText: 'Confirmar',
            onConfirm: null
        });
    };

    const [responseTemplate, setResponseTemplate] = useState(() => 
        localStorage.getItem('spotify_sr_response_template') || '🎵 @{user} ¡Canción agregada a la Playlist del stream! "{song}" - {artist}'
    );

    // Helper: Refresh Access Token with PKCE
    const refreshSpotifyToken = useCallback(async () => {
        const rToken = localStorage.getItem('spotify_refresh_token');
        if (!rToken) return;

        try {
            const body = new URLSearchParams({
                client_id: SPOTIFY_CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: rToken
            });

            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString()
            });

            if (res.ok) {
                const data = await res.json();
                if (data.access_token) {
                    setSpotifyToken(data.access_token);
                    localStorage.setItem('spotify_access_token', data.access_token);
                    if (data.refresh_token) {
                        setRefreshToken(data.refresh_token);
                        localStorage.setItem('spotify_refresh_token', data.refresh_token);
                    }
                }
            }
        } catch (e) {
            console.error('Error refreshing token:', e);
        }
    }, []);

    // Handle PKCE Code Exchange on Redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            const storedRedirect = localStorage.getItem('spotify_custom_redirect_uri') || (window.location.origin + window.location.pathname);
            const storedClientId = localStorage.getItem('spotify_custom_client_id') || DEFAULT_SPOTIFY_CLIENT_ID;

            fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: storedClientId,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: storedRedirect,
                    code_verifier: codeVerifier
                }).toString()
            })
            .then(res => res.json())
            .then(data => {
                if (data.access_token) {
                    setSpotifyToken(data.access_token);
                    localStorage.setItem('spotify_access_token', data.access_token);
                    if (data.refresh_token) {
                        setRefreshToken(data.refresh_token);
                        localStorage.setItem('spotify_refresh_token', data.refresh_token);
                    }
                    if (triggerToast) triggerToast('✅ ¡Cuenta de Spotify vinculada exitosamente!');
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            })
            .catch(err => {
                console.error('Error exchanging PKCE code:', err);
                if (triggerToast) triggerToast('❌ Error al autorizar con Spotify.');
            });
        }
    }, [triggerToast]);

    // Fetch User Profile
    useEffect(() => {
        if (!spotifyToken) return;

        fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${spotifyToken}` }
        })
        .then(res => {
            if (res.status === 401) {
                refreshSpotifyToken();
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (data && !data.error) setSpotifyUser(data);
        })
        .catch(console.error);
    }, [spotifyToken, refreshSpotifyToken]);

    // Fetch Playlist Data
    const fetchPlaylistDetails = useCallback(async (playlistId) => {
        if (!spotifyToken || !playlistId) return;
        setIsLoadingPlaylist(true);
        try {
            const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });

            if (res.status === 401) {
                await refreshSpotifyToken();
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setPlaylistData(data);
                localStorage.setItem('spotify_sr_playlist_id', data.id);
                localStorage.setItem('spotify_sr_playlist_name', data.name);
            } else {
                setPlaylistData(null);
            }
        } catch (e) {
            console.error('Error fetching playlist:', e);
            setPlaylistData(null);
        } finally {
            setIsLoadingPlaylist(false);
        }
    }, [spotifyToken, refreshSpotifyToken]);

    // Cargar Playlist al inicio
    useEffect(() => {
        const savedId = localStorage.getItem('spotify_sr_playlist_id') || extractSpotifyPlaylistId(playlistInput);
        if (savedId && spotifyToken) {
            fetchPlaylistDetails(savedId);
        }
    }, [spotifyToken, fetchPlaylistDetails, playlistInput]);

    // Fetch Song Requests History from Supabase
    const fetchHistory = useCallback(async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('song_requests')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(40);

            if (!error && data) {
                setSongQueue(data);
            }
        } catch (e) {
            console.error('Error fetching song requests history:', e);
        }
    }, [supabase]);

    useEffect(() => {
        fetchHistory();
        if (supabase) {
            const channel = supabase
                .channel('spotify_song_requests_realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, () => {
                    fetchHistory();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [fetchHistory, supabase]);

    // Login Spotify PKCE
    const handleLoginSpotify = async (customRedirect = null) => {
        const codeVerifier = generateRandomString(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);

        localStorage.setItem('spotify_code_verifier', codeVerifier);
        localStorage.setItem('spotify_custom_client_id', activeClientId);

        const redirectUri = customRedirect || selectedRedirectUri || currentOriginPath;
        localStorage.setItem('spotify_custom_redirect_uri', redirectUri);

        const authUrl = new URL('https://accounts.spotify.com/authorize');
        const params = {
            response_type: 'code',
            client_id: activeClientId,
            scope: SPOTIFY_SCOPES,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: redirectUri
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    };

    // Logout Spotify
    const handleLogoutSpotify = () => {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_code_verifier');
        setSpotifyToken('');
        setRefreshToken('');
        setSpotifyUser(null);
        setPlaylistData(null);
        if (triggerToast) triggerToast('Spotify desconectado.');
    };

    // Guardar URL/ID de Playlist
    const handleSavePlaylist = () => {
        const id = extractSpotifyPlaylistId(playlistInput);
        if (!id) {
            if (triggerToast) triggerToast('⚠️ Pega un enlace o ID válido de tu Playlist de Spotify.');
            return;
        }
        localStorage.setItem('spotify_sr_playlist_url', playlistInput.trim());
        localStorage.setItem('spotify_sr_playlist_id', id);
        fetchPlaylistDetails(id);
        if (triggerToast) triggerToast('✅ Playlist de Spotify vinculada correctamente.');
    };

    // Búsqueda Manual
    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!searchQuery.trim() || !spotifyToken) return;

        setIsSearching(true);
        try {
            const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery.trim())}&type=track&limit=6`, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });

            if (res.status === 401) {
                await refreshSpotifyToken();
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.tracks?.items || []);
            }
        } catch (e) {
            console.error('Error searching track:', e);
        } finally {
            setIsSearching(false);
        }
    };

    // Añadir canción a la Playlist de Spotify
    const handleAddTrackToPlaylist = async (track, requester = 'Streamer') => {
        const playlistId = localStorage.getItem('spotify_sr_playlist_id');
        if (!playlistId) {
            if (triggerToast) triggerToast('⚠️ Primero debes vincular tu Playlist de Spotify arriba.');
            return;
        }

        setIsAddingSong(true);
        try {
            const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${spotifyToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [track.uri]
                })
            });

            if (res.status === 401) {
                await refreshSpotifyToken();
                return;
            }

            if (res.ok) {
                // Guardar en Supabase
                const artistsStr = track.artists ? track.artists.map(a => a.name).join(', ') : '';
                if (supabase) {
                    await supabase.from('song_requests').insert([{
                        title: `${track.name} - ${artistsStr}`,
                        video_id: track.id,
                        requested_by: requester,
                        status: 'completed'
                    }]);
                }

                if (triggerToast) triggerToast(`🎵 Agregada a la Playlist: "${track.name}"`);
                fetchPlaylistDetails(playlistId);
            } else {
                const errData = await res.json();
                if (triggerToast) triggerToast(`❌ Error al agregar a la playlist: ${errData.error?.message || 'Error'}`);
            }
        } catch (e) {
            console.error('Error adding track to playlist:', e);
        } finally {
            setIsAddingSong(false);
        }
    };

    // Guardar configuración de comando
    const handleSaveCommand = () => {
        const clean = customCommandInput.trim().toLowerCase();
        if (!clean.startsWith('!')) {
            if (triggerToast) triggerToast('⚠️ El comando debe empezar con signo de exclamación (!)');
            return;
        }
        setSongRequestCommand(clean);
        localStorage.setItem('song_request_command', clean);
        if (triggerToast) triggerToast(`✅ Comando guardado como: ${clean}`);
    };


    // Eliminar canción individual de la Playlist de Spotify y de Supabase
    const handleRemoveTrack = (item) => {
        if (!supabase) return;

        openConfirmModal(
            '¿Quitar canción de la Playlist?',
            `¿Deseas eliminar "${item.title}" de tu Playlist de Spotify y del historial del stream?`,
            'Sí, Quitar Canción',
            async () => {
                const playlistId = localStorage.getItem('spotify_sr_playlist_id');
                const trackUri = item.video_id?.startsWith('spotify:track:') 
                    ? item.video_id 
                    : item.video_id ? `spotify:track:${item.video_id}` : null;

                try {
                    // 1. Si hay token y playlist y trackUri válido, intentar borrar de Spotify
                    if (spotifyToken && playlistId && trackUri) {
                        try {
                            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Bearer ${spotifyToken}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    tracks: [{ uri: trackUri }]
                                })
                            });
                        } catch (e) {
                            console.warn("Could not delete from Spotify remote playlist:", e);
                        }
                    }

                    // 2. Eliminar de Supabase
                    if (item.id) {
                        await supabase.from('song_requests').delete().eq('id', item.id);
                    }

                    setSongQueue(prev => prev.filter(s => s.id !== item.id));
                    if (triggerToast) triggerToast('🗑️ Canción eliminada de la Playlist y del historial.');
                    if (playlistId) fetchPlaylistDetails(playlistId);

                } catch (err) {
                    console.error("Error removing track:", err);
                    if (triggerToast) triggerToast('❌ Error al eliminar la canción.');
                }
            }
        );
    };

    // Limpiar todo el historial con Modal Emergente
    const handleClearAllHistory = () => {
        if (!supabase) return;

        openConfirmModal(
            '¿Vaciar todo el historial de peticiones?',
            'Esta acción eliminará todas las canciones solicitadas del historial del Builder. Las canciones que ya estén en tu Playlist de Spotify no se verán afectadas.',
            'Sí, Limpiar Historial',
            async () => {
                try {
                    await supabase.from('song_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                    setSongQueue([]);
                    if (triggerToast) triggerToast('🧹 Historial de peticiones vaciado correctamente.');
                } catch (err) {
                    console.error("Error clearing history:", err);
                    if (triggerToast) triggerToast('❌ Error al vaciar el historial.');
                }
            }
        );
    };

    // Toggle de estado activo
    const handleToggleState = () => {
        const next = !isSongRequestEnabled;
        setIsSongRequestEnabled(next);
        localStorage.setItem('song_request_enabled', next ? 'true' : 'false');
        if (triggerToast) triggerToast(next ? '🟢 Song Request ACTIVADO' : '🔴 Song Request PAUSADO');
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
            
            {/* ============================================================= */}
            {/* 🔝 1. HEADER & ESTADO GLOBAL DE SONG REQUEST (SPOTIFY FREE) */}
            {/* ============================================================= */}
            <div style={{
                background: isSongRequestEnabled 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))' 
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.95))',
                border: isSongRequestEnabled ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                padding: '1.5rem 1.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: isSongRequestEnabled ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none',
                marginBottom: '1.8rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: isSongRequestEnabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.2)',
                        color: isSongRequestEnabled ? '#10B981' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem'
                    }}>
                        <ListMusic size={28} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.3rem', fontWeight: 800 }}>
                                Song Request de Spotify (Modo Playlist 100% Free)
                            </h2>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '2px 10px',
                                borderRadius: '12px',
                                background: isSongRequestEnabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                                color: isSongRequestEnabled ? '#10B981' : '#EF4444',
                                border: isSongRequestEnabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
                            }}>
                                {isSongRequestEnabled ? '🟢 ACTIVO' : '🔴 PAUSADO'}
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Permite a los espectadores pedir canciones con <code>{songRequestCommand} [canción]</code> y agregarlas automáticamente a tu Playlist de Spotify sin requerir Premium.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {spotifyToken ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                            <span style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 700 }}>
                                {spotifyUser?.display_name || 'Spotify Conectado'}
                            </span>
                            <button
                                type="button"
                                onClick={handleLogoutSpotify}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.78rem', cursor: 'pointer', marginLeft: '6px', textDecoration: 'underline' }}
                            >
                                Desconectar
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => handleLoginSpotify()}
                                style={{
                                    background: '#1DB954',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '10px 18px',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 0 15px rgba(29, 185, 84, 0.4)'
                                }}
                            >
                                <Music size={18} /> Conectar Cuenta de Spotify
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowConfigModal(true)}
                                title="Configurar Redirect URI o Client ID de Spotify"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: '#38BDF8',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    borderRadius: '12px',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Radio size={18} />
                            </button>
                        </div>
                    )}

                    <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '32px', cursor: 'pointer', flexShrink: 0 }}>
                        <input 
                            type="checkbox" 
                            checked={isSongRequestEnabled} 
                            onChange={handleToggleState}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: isSongRequestEnabled ? '#10B981' : '#334155',
                            transition: '0.3s', borderRadius: '34px',
                            boxShadow: isSongRequestEnabled ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none'
                        }}>
                            <span style={{
                                position: 'absolute', content: '""', height: '24px', width: '24px',
                                left: isSongRequestEnabled ? '32px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                </div>
            </div>

            {/* ============================================================= */}
            {/* 📋 2. CONFIGURACIÓN DE LA PLAYLIST DE SPOTIFY (FREE) */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.8rem', marginBottom: '1.8rem', border: '1px solid rgba(29, 185, 84, 0.3)', background: 'rgba(15, 23, 42, 0.85)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(29, 185, 84, 0.15)', color: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LinkIcon size={22} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.15rem', fontWeight: 800 }}>
                            1. Playlist de Spotify de Peticiones del Stream
                        </h3>
                        <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Pega aquí el enlace de la Playlist que creaste en tu Spotify para que el bot inserte las canciones automáticamente.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={playlistInput}
                        onChange={(e) => setPlaylistInput(e.target.value)}
                        placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M o ID de la Playlist"
                        className="gift-input-field"
                        style={{ flex: 1, minWidth: '280px', marginBottom: 0 }}
                    />
                    <button
                        type="button"
                        onClick={handleSavePlaylist}
                        disabled={isLoadingPlaylist}
                        style={{
                            background: '#1DB954',
                            color: '#000',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0 22px',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {isLoadingPlaylist ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                        Vincular Playlist
                    </button>
                </div>

                {/* Tarjeta de Playlist Conectada */}
                {playlistData && (
                    <div style={{
                        background: 'rgba(29, 185, 84, 0.08)',
                        border: '1px solid rgba(29, 185, 84, 0.25)',
                        borderRadius: '14px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {playlistData.images?.[0]?.url ? (
                                <img 
                                    src={playlistData.images[0].url} 
                                    alt={playlistData.name} 
                                    style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ListMusic size={26} color="#94A3B8" />
                                </div>
                            )}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1DB954', textTransform: 'uppercase' }}>
                                        ✓ Playlist Conectada
                                    </span>
                                </div>
                                <h4 style={{ margin: '2px 0 0', color: '#FFF', fontSize: '1.05rem', fontWeight: 800 }}>
                                    {playlistData.name}
                                </h4>
                                <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                                    Por {playlistData.owner?.display_name || 'Tú'} • {playlistData.tracks?.total || 0} canciones
                                </span>
                            </div>
                        </div>

                        <a
                            href={playlistData.external_urls?.spotify || `https://open.spotify.com/playlist/${playlistData.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#FFF',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <ExternalLink size={14} /> Abrir en Spotify
                        </a>
                    </div>
                )}

                {/* Guía Rápida para el Creador */}
                <div style={{ marginTop: '1.2rem', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#38BDF8', fontWeight: 700, fontSize: '0.88rem' }}>
                        <HelpCircle size={16} /> ¿Cómo reproducir en tu directo con Spotify Free?
                    </div>
                    <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        <li>Abre tu app de Spotify en tu PC o móvil.</li>
                        <li>Busca tu Playlist <strong>"{playlistData?.name || 'Peticiones de Twitch'}"</strong> y presiona <strong>Play</strong> para dejarla sonando.</li>
                        <li>Cada vez que alguien pida una canción en Twitch con <code>{songRequestCommand} [canción]</code>, se sumará al final de tu playlist y sonará automáticamente cuando le toque el turno.</li>
                    </ol>
                </div>
            </div>

            {/* ============================================================= */}
            {/* ⚙️ 3. AJUSTES DEL COMANDO & MENSAJE DE TWITCH */}
            {/* ============================================================= */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.8rem' }}>
                
                {/* Comando */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                        Comando del Chat para Peticiones
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={customCommandInput}
                            onChange={(e) => setCustomCommandInput(e.target.value)}
                            placeholder="!sr o !pedir"
                            className="gift-input-field"
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <button
                            type="button"
                            onClick={handleSaveCommand}
                            style={{
                                background: '#38BDF8',
                                color: '#000',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0 16px',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            Guardar
                        </button>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '6px' }}>
                        Ejemplo de uso: <code>{songRequestCommand} Michael Jackson Billie Jean</code>
                    </span>
                </div>

                {/* Plantilla de Respuesta */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                        Plantilla de Respuesta en Twitch
                    </label>
                    <input
                        type="text"
                        value={responseTemplate}
                        onChange={(e) => {
                            setResponseTemplate(e.target.value);
                            localStorage.setItem('spotify_sr_response_template', e.target.value);
                        }}
                        placeholder="🎵 @{user} ¡Canción agregada! '{song}' - {artist}"
                        className="gift-input-field"
                        style={{ width: '100%', marginBottom: '6px' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Variables: <code>{'{user}'}</code>, <code>{'{song}'}</code>, <code>{'{artist}'}</code>
                    </span>
                </div>
            </div>

            {/* ============================================================= */}
            {/* 🔍 4. BUSCADOR MANUAL DE CANCIONES */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.8rem', marginBottom: '1.8rem' }}>
                <h3 style={{ margin: '0 0 10px', color: '#F8FAFC', fontSize: '1.15rem', fontWeight: 800 }}>
                    Buscar y Agregar Canción Manualmente a la Playlist
                </h3>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Escribe el nombre de la canción o artista..."
                            className="gift-input-field"
                            style={{ width: '100%', paddingLeft: '42px', marginBottom: 0 }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching || !spotifyToken}
                        style={{
                            background: '#10B981',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0 20px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />} Buscar
                    </button>
                </form>

                {/* Resultados de Búsqueda */}
                {searchResults.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                        {searchResults.map(track => (
                            <div 
                                key={track.id}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.7)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '10px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                    {track.album?.images?.[2]?.url && (
                                        <img src={track.album.images[2].url} alt={track.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                    )}
                                    <div style={{ overflow: 'hidden' }}>
                                        <h5 style={{ margin: 0, color: '#FFF', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {track.name}
                                        </h5>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                            {track.artists?.map(a => a.name).join(', ')}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleAddTrackToPlaylist(track)}
                                    disabled={isAddingSong}
                                    style={{
                                        background: 'rgba(29, 185, 84, 0.2)',
                                        color: '#1DB954',
                                        border: '1px solid rgba(29, 185, 84, 0.4)',
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                        fontWeight: 800,
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    + Agregar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ============================================================= */}
            {/* 📜 5. HISTORIAL DE PETICIONES DEL STREAM */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', fontWeight: 800 }}>
                            Historial de Peticiones del Chat ({songQueue.length})
                        </h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Canciones solicitadas en directo. Puedes quitar cualquier canción de tu Playlist y del historial con el botón "Quitar".
                        </p>
                    </div>

                    {songQueue.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAllHistory}
                            style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                padding: '7px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Trash2 size={14} /> Limpiar Todo el Historial
                        </button>
                    )}
                </div>

                {songQueue.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                        <Music size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>No hay canciones en el historial de peticiones.</p>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            Tus espectadores pueden pedir con: <code>{songRequestCommand} [canción]</code>
                        </span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {songQueue.map((item, idx) => (
                            <div 
                                key={item.id || idx}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.7)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 700, width: '20px' }}>
                                        #{idx + 1}
                                    </span>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '0.92rem', fontWeight: 700 }}>
                                            {item.title}
                                        </h4>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                            Pedido por <strong style={{ color: '#38BDF8' }}>@{item.requested_by}</strong>
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        background: 'rgba(29, 185, 84, 0.15)',
                                        color: '#1DB954',
                                        fontWeight: 700
                                    }}>
                                        En Playlist
                                    </span>

                                    {/* Botón Quitar de Playlist & Historial */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTrack(item)}
                                        title="Quitar canción de la Playlist de Spotify y borrarla del historial"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.12)',
                                            color: '#EF4444',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                            padding: '5px 10px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Trash2 size={13} /> Quitar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            
            {/* ============================================================= */}
            {/* 🔑 MODAL DE CONFIGURACIÓN SPOTIFY (REDIRECT URI & CLIENT ID) */}
            {/* ============================================================= */}
            {showConfigModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                        border: '1px solid rgba(29, 185, 84, 0.4)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(29, 185, 84, 0.2)',
                        borderRadius: '24px',
                        maxWidth: '560px',
                        width: '100%',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(29, 185, 84, 0.15)', color: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Music size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', fontWeight: 800 }}>
                                    Configuración de Conexión de Spotify
                                </h3>
                                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                    Solución para el error "redirect_uri: Not matching configuration".
                                </p>
                            </div>
                        </div>

                        {/* Tu Redirect URI actual */}
                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                                1. Tu Redirect URI exacta a agregar en Spotify Developer:
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedRedirectUri}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#10B981',
                                        fontSize: '0.82rem',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedRedirectUri);
                                        setCopiedRedirect(true);
                                        setTimeout(() => setCopiedRedirect(false), 2000);
                                    }}
                                    style={{
                                        background: copiedRedirect ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                                        color: '#FFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0 14px',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {copiedRedirect ? <Check size={14} /> : <Copy size={14} />}
                                    {copiedRedirect ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>
                        </div>

                        {/* Opciones de Redirect URIs comunes */}
                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                                O selecciona la Redirect URI que registraste:
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[
                                    currentOriginPath,
                                    window.location.origin + '/',
                                    'http://localhost:5173/Builder_EvilTokkii/',
                                    'http://localhost:5173/',
                                    'http://127.0.0.1:5173/'
                                ].filter((v, i, a) => a.indexOf(v) === i).map(uri => (
                                    <button
                                        key={uri}
                                        type="button"
                                        onClick={() => setSelectedRedirectUri(uri)}
                                        style={{
                                            textAlign: 'left',
                                            background: selectedRedirectUri === uri ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                            border: selectedRedirectUri === uri ? '1px solid #1DB954' : '1px solid rgba(255, 255, 255, 0.08)',
                                            color: selectedRedirectUri === uri ? '#1DB954' : '#CBD5E1',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        {selectedRedirectUri === uri ? '✓ ' : '• '}{uri}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Instrucciones de 3 pasos */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '1.4rem' }}>
                            <h4 style={{ margin: '0 0 6px', color: '#38BDF8', fontSize: '0.85rem', fontWeight: 700 }}>
                                📋 ¿Cómo agregar la Redirect URI en Spotify?
                            </h4>
                            <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#94A3B8', fontSize: '0.78rem', lineHeight: '1.5' }}>
                                <li>Entra a <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#1DB954', textDecoration: 'underline' }}>developer.spotify.com/dashboard</a>.</li>
                                <li>Abre tu App y ve a <strong>Settings (Configuración)</strong>.</li>
                                <li>En el campo <strong>Redirect URIs</strong>, presiona <strong>Add</strong>, pega la URI de arriba y presiona <strong>Save</strong> al fondo.</li>
                            </ol>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setShowConfigModal(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#FFF',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowConfigModal(false);
                                    handleLoginSpotify(selectedRedirectUri);
                                }}
                                style={{
                                    background: '#1DB954',
                                    border: 'none',
                                    color: '#000',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Guardar y Conectar ➜
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* 🛑 MODAL EMERGENTE DE CONFIRMACIÓN (ESTILO BUILDER) */}
            {/* ============================================================= */}
            {confirmDialog.isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.2)',
                        borderRadius: '24px',
                        maxWidth: '480px',
                        width: '100%',
                        padding: '2rem',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.2rem',
                            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                        }}>
                            <Trash2 size={32} />
                        </div>

                        <h3 style={{ margin: '0 0 8px', color: '#F8FAFC', fontSize: '1.3rem', fontWeight: 800 }}>
                            {confirmDialog.title}
                        </h3>

                        <p style={{ margin: '0 0 1.8rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {confirmDialog.message}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={closeConfirmModal}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#F8FAFC',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                                    closeConfirmModal();
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                    border: 'none',
                                    color: '#FFF',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {confirmDialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
