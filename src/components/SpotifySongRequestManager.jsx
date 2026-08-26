import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, MessageSquare, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
    Music, Search, Plus, Trash2, CheckCircle2, AlertCircle, 
    ExternalLink, RefreshCw, Radio, Sparkles, Disc3, ShieldCheck
} from 'lucide-react';

const SPOTIFY_CLIENT_ID = '467b4e8480964c26913cb87d276ed20c';
const SPOTIFY_SCOPES = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private'
].join(' ');

export default function SpotifySongRequestManager({ supabase, triggerToast }) {
    // Spotify Auth State
    const [spotifyToken, setSpotifyToken] = useState(() => localStorage.getItem('spotify_access_token') || '');
    const [spotifyUser, setSpotifyUser] = useState(null);
    const [activeDevice, setActiveDevice] = useState(null);
    
    // Playback State
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressMs, setProgressMs] = useState(0);
    const [durationMs, setDurationMs] = useState(0);
    const [volume, setVolume] = useState(() => Number(localStorage.getItem('spotify_player_volume')) || 50);

    // Queue & Requests
    const [songQueue, setSongQueue] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [responseTemplate, setResponseTemplate] = useState(() => localStorage.getItem('spotify_sr_response_template') || '@{user} ¡Canción añadida a la cola de Spotify! 🎵 "{song}" - {artist}');
    const [srCommandPrefix, setSrCommandPrefix] = useState(() => localStorage.getItem('spotify_sr_prefix') || '!sr');

    const pollIntervalRef = useRef(null);

    // Detect OAuth token in URL hash from Spotify redirect
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            if (token) {
                setSpotifyToken(token);
                localStorage.setItem('spotify_access_token', token);
                window.history.replaceState(null, '', window.location.pathname);
                triggerToast('✅ ¡Spotify conectado con éxito!');
            }
        }
    }, [triggerToast]);

    // Handle Login with Spotify
    const handleConnectSpotify = () => {
        const redirectUri = window.location.origin + window.location.pathname;
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}&show_dialog=true`;
        window.location.href = authUrl;
    };

    const handleDisconnectSpotify = () => {
        setSpotifyToken('');
        localStorage.removeItem('spotify_access_token');
        setSpotifyUser(null);
        setCurrentTrack(null);
        triggerToast('Spotify desconectado');
    };

    // Fetch Spotify User Profile
    const fetchSpotifyProfile = useCallback(async (token) => {
        if (!token) return;
        try {
            const res = await fetch('https://api.spotify.com/v1/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSpotifyUser(data);
            } else if (res.status === 401) {
                setSpotifyToken('');
                localStorage.removeItem('spotify_access_token');
            }
        } catch (err) {
            console.error('Error fetching Spotify profile:', err);
        }
    }, []);

    // Fetch Current Playback from Spotify
    const fetchCurrentPlayback = useCallback(async () => {
        if (!spotifyToken) return;
        try {
            const res = await fetch('https://api.spotify.com/v1/me/player', {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
            if (res.status === 200) {
                const data = await res.json();
                if (data && data.item) {
                    setCurrentTrack({
                        id: data.item.id,
                        uri: data.item.uri,
                        title: data.item.name,
                        artist: data.item.artists.map(a => a.name).join(', '),
                        album: data.item.album.name,
                        albumCover: data.item.album.images[0]?.url || '',
                        durationMs: data.item.duration_ms
                    });
                    setIsPlaying(data.is_playing);
                    setProgressMs(data.progress_ms || 0);
                    setDurationMs(data.item.duration_ms || 0);
                    if (data.device) {
                        setActiveDevice(data.device.name);
                    }
                }
            } else if (res.status === 204) {
                // No active playback
                setIsPlaying(false);
            } else if (res.status === 401) {
                setSpotifyToken('');
                localStorage.removeItem('spotify_access_token');
            }
        } catch (err) {
            console.error('Error polling playback:', err);
        }
    }, [spotifyToken]);

    // Poll current playback every 2.5 seconds
    useEffect(() => {
        if (spotifyToken) {
            fetchSpotifyProfile(spotifyToken);
            fetchCurrentPlayback();
            pollIntervalRef.current = setInterval(fetchCurrentPlayback, 2500);
        } else {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [spotifyToken, fetchSpotifyProfile, fetchCurrentPlayback]);

    // Fetch Song Requests from Supabase
    const fetchQueue = useCallback(async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('song_requests')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(30);
            if (!error && data) {
                setSongQueue(data);
            }
        } catch (e) {
            console.error('Error fetching queue:', e);
        }
    }, [supabase]);

    useEffect(() => {
        fetchQueue();
        if (!supabase) return;
        const channel = supabase
            .channel('spotify_song_requests_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, () => {
                fetchQueue();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchQueue, supabase]);

    // Playback Controls
    const handlePlayPause = async () => {
        if (!spotifyToken) return;
        const endpoint = isPlaying 
            ? 'https://api.spotify.com/v1/me/player/pause' 
            : 'https://api.spotify.com/v1/me/player/play';
        try {
            await fetch(endpoint, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
            setIsPlaying(!isPlaying);
            setTimeout(fetchCurrentPlayback, 400);
        } catch (e) {
            triggerToast('⚠️ Abre Spotify en tu PC o móvil para reproducir');
        }
    };

    const handleSkip = async () => {
        if (!spotifyToken) return;
        try {
            await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
            triggerToast('⏭️ Pista siguiente');
            setTimeout(fetchCurrentPlayback, 500);
        } catch (e) {
            console.error(e);
        }
    };

    const handlePrevious = async () => {
        if (!spotifyToken) return;
        try {
            await fetch('https://api.spotify.com/v1/me/player/previous', {
                method: 'POST',
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
            setTimeout(fetchCurrentPlayback, 500);
        } catch (e) {
            console.error(e);
        }
    };

    const handleVolumeChange = async (newVol) => {
        setVolume(newVol);
        localStorage.setItem('spotify_player_volume', newVol);
        if (!spotifyToken) return;
        try {
            await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${newVol}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
        } catch (e) {}
    };

    // Search and Add to Spotify Queue
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim() || !spotifyToken) return;
        setIsSearching(true);

        try {
            let query = searchQuery.trim();
            // If it's a direct Spotify URL
            if (query.includes('spotify.com/track/')) {
                const trackId = query.split('track/')[1]?.split('?')[0];
                if (trackId) {
                    const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                        headers: { Authorization: `Bearer ${spotifyToken}` }
                    });
                    if (res.ok) {
                        const track = await res.json();
                        setSearchResults([track]);
                        setIsSearching(false);
                        return;
                    }
                }
            }

            const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.tracks?.items || []);
            }
        } catch (err) {
            console.error('Error searching Spotify:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddTrackToQueue = async (track, requestedBy = 'Streamer') => {
        if (!spotifyToken) return;
        try {
            // 1. Add to Spotify Queue
            const res = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(track.uri)}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });

            if (res.ok || res.status === 204) {
                triggerToast(`🎵 Añadida a la cola: "${track.name}"`);
            }

            // 2. Save in Supabase for logs and OBS overlay
            if (supabase) {
                await supabase.from('song_requests').insert([{
                    title: `${track.name} - ${track.artists.map(a => a.name).join(', ')}`,
                    video_id: track.id,
                    requested_by: requestedBy,
                    status: 'pending'
                }]);
                fetchQueue();
            }

            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            triggerToast('⚠️ Error al añadir a la cola. Asegúrate de tener Spotify abierto.');
        }
    };

    const handleDeleteQueueItem = async (id) => {
        if (!supabase) return;
        await supabase.from('song_requests').delete().eq('id', id);
        fetchQueue();
        triggerToast('Elemento eliminado del historial');
    };

    const formatTime = (ms) => {
        if (!ms) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            {/* Header Card: Estado y Conexión Spotify */}
            <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                            <Disc3 size={24} className={isPlaying ? 'animate-spin' : ''} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)' }}>
                                Song Request (Spotify Oficial)
                            </h2>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                100% Sin anuncios • Reproducción directa en Spotify
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '30px',
                        background: spotifyToken ? 'rgba(29, 185, 84, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: spotifyToken ? '1px solid rgba(29, 185, 84, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        color: spotifyToken ? '#1DB954' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: spotifyToken ? '#1DB954' : '#ef4444', boxShadow: spotifyToken ? '0 0 10px #1DB954' : 'none' }}></span>
                        {spotifyToken ? (spotifyUser ? `SPOTIFY: ${spotifyUser.display_name?.toUpperCase()}` : 'SPOTIFY CONECTADO') : 'DESCONECTADO'}
                    </div>

                    {!spotifyToken ? (
                        <button
                            type="button"
                            className="btn-submit"
                            style={{
                                width: 'auto',
                                padding: '12px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: '#1DB954',
                                color: '#000',
                                fontWeight: 800,
                                borderRadius: '10px',
                                boxShadow: '0 4px 15px rgba(29, 185, 84, 0.35)'
                            }}
                            onClick={handleConnectSpotify}
                        >
                            <Sparkles size={18} /> Conectar con Spotify
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-submit"
                            style={{
                                width: 'auto',
                                padding: '10px 18px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text-muted)',
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                            }}
                            onClick={handleDisconnectSpotify}
                        >
                            Desconectar
                        </button>
                    )}
                </div>
            </div>

            {/* Main Player & Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Left Column: Active Player & Search */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Active Track Card */}
                    <div className="card animate-slide-down" style={{ padding: '24px', background: 'linear-gradient(180deg, rgba(29, 185, 84, 0.06), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(29, 185, 84, 0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1DB954', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Radio size={14} className={isPlaying ? 'animate-pulse' : ''} />
                                {isPlaying ? 'Reproduciendo Ahora en Spotify' : 'Pausado en Spotify'}
                            </span>
                            {activeDevice && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Dispositivo: <strong>{activeDevice}</strong>
                                </span>
                            )}
                        </div>

                        {currentTrack ? (
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '110px', height: '110px', borderRadius: '14px', overflow: 'hidden', background: '#000', flexShrink: 0, boxShadow: '0 8px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={currentTrack.albumCover} alt={currentTrack.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {currentTrack.title}
                                    </h3>
                                    <span style={{ fontSize: '1rem', color: '#1DB954', fontWeight: 600 }}>
                                        {currentTrack.artist}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Álbum: {currentTrack.album}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                                <Music size={40} opacity={0.3} style={{ marginBottom: '8px' }} />
                                <p style={{ margin: 0 }}>No hay ninguna canción reproduciéndose actualmente en Spotify.</p>
                                <small>Abre Spotify en tu PC o móvil e inicia cualquier pista.</small>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {currentTrack && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${durationMs > 0 ? (progressMs / durationMs) * 100 : 0}%`,
                                        background: '#1DB954',
                                        transition: 'width 1s linear'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                    <span>{formatTime(progressMs)}</span>
                                    <span>{formatTime(durationMs)}</span>
                                </div>
                            </div>
                        )}

                        {/* Controls Toolbar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}
                                    title="Pista anterior"
                                >
                                    <SkipBack size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePlayPause}
                                    style={{ background: '#1DB954', border: 'none', color: '#000', padding: '14px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title={isPlaying ? 'Pausar' : 'Reproducir'}
                                >
                                    {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}
                                    title="Pista siguiente (Skip)"
                                >
                                    <SkipForward size={18} />
                                </button>
                            </div>

                            {/* Volume Slider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '160px' }}>
                                <Volume2 size={16} color="var(--text-muted)" />
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={volume} 
                                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                    style={{ flex: 1, accentColor: '#1DB954', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '30px' }}>{volume}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Manual Search and Add to Queue */}
                    <div className="card animate-slide-down" style={{ padding: '20px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Search size={16} color="#1DB954" /> Añadir Canción a la Cola de Spotify
                        </h4>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Nombre de la canción, artista o link de Spotify..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn-submit"
                                style={{ width: 'auto', padding: '0 20px', background: '#1DB954', color: '#000', fontWeight: 700, borderRadius: '8px' }}
                                disabled={!spotifyToken || isSearching || !searchQuery.trim()}
                            >
                                {isSearching ? 'Buscando...' : 'Buscar'}
                            </button>
                        </form>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {searchResults.map(track => (
                                    <div 
                                        key={track.id}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                            <img src={track.album?.images[2]?.url || track.album?.images[0]?.url} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{track.artists?.map(a => a.name).join(', ')}</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddTrackToQueue(track)}
                                            style={{
                                                padding: '6px 14px',
                                                background: '#1DB954',
                                                border: 'none',
                                                color: '#000',
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            + Añadir
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: OBS Overlay Info & Queue */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Widget OBS URL Card */}
                    <div className="card animate-slide-down" style={{ padding: '20px', border: '1px solid rgba(29, 185, 84, 0.3)' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={16} color="#1DB954" /> Mensaje de Respuesta en el Chat
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                            Personaliza el mensaje que el bot enviará al chat de Twitch al añadir una canción:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <textarea 
                                className="form-control"
                                rows="2"
                                value={responseTemplate}
                                onChange={(e) => setResponseTemplate(e.target.value)}
                                placeholder='@{user} ¡Canción añadida a la cola! 🎵 "{song}" - {artist}'
                                style={{ fontSize: '0.85rem', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>{'{user}'} : Usuario</span>
                                <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>{'{song}'} : Canción</span>
                                <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>{'{artist}'} : Artista</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const def = '@{user} ¡Canción añadida a la cola de Spotify! 🎵 "{song}" - {artist}';
                                        setResponseTemplate(def);
                                        localStorage.setItem('spotify_sr_response_template', def);
                                        triggerToast('Mensaje restaurado a predeterminado');
                                    }}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Restablecer
                                </button>
                                <button
                                    type="button"
                                    className="btn-submit"
                                    style={{ width: 'auto', padding: '6px 16px', fontSize: '0.78rem', background: '#1DB954', color: '#000', fontWeight: 700, borderRadius: '6px' }}
                                    onClick={() => {
                                        localStorage.setItem('spotify_sr_response_template', responseTemplate);
                                        triggerToast('✅ Plantilla de mensaje guardada');
                                    }}
                                >
                                    Guardar Mensaje
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-slide-down" style={{ padding: '20px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ExternalLink size={16} color="#A855F7" /> Widget para OBS Studio
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                            Añade esta URL como fuente de navegador en OBS para mostrar la canción que está sonando en directo:
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                                type="text" 
                                className="form-control" 
                                readOnly 
                                value={`${window.location.origin}/?overlay=song_request`} 
                                style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.4)' }}
                            />
                            <button
                                type="button"
                                className="btn-submit"
                                style={{ width: 'auto', padding: '0 14px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', fontSize: '0.8rem' }}
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/?overlay=song_request`);
                                    triggerToast('📋 Enlace de OBS copiado');
                                }}
                            >
                                Copiar
                            </button>
                        </div>
                    </div>

                    {/* Historial / Cola de Peticiones del Chat */}
                    <div className="card animate-slide-down" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>
                                Pedidos del Chat ({songQueue.length})
                            </h4>
                            <button 
                                type="button" 
                                onClick={fetchQueue}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <RefreshCw size={12} /> Refrescar
                            </button>
                        </div>

                        {songQueue.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Aún no hay canciones pedidas en esta sesión.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                                {songQueue.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.title}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                Por: <strong style={{ color: '#1DB954' }}>@{item.requested_by}</strong>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteQueueItem(item.id)}
                                            style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
}
