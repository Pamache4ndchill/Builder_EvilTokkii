import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Music, Play, Pause, Trash2, GripVertical, ArrowUp, ArrowDown, 
    Save, ExternalLink, Copy, Check, AlertCircle, CheckCircle2, 
    Radio, Sparkles, RefreshCw, HelpCircle, ListMusic, ShieldCheck, 
    Settings, Info, Plus, Search, ChevronDown, ChevronUp, Move,
    Disc3, Layers, Maximize2, RotateCcw, Eye, EyeOff, MessageSquare, Send
} from 'lucide-react';

export const DEFAULT_SPOTIFY_CLIENT_ID = '467b4e8480964c26913cb87d276ed20c';

const SPOTIFY_SCOPES = [
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
].join(' ');

// Helpers PKCE
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

// Extraer ID limpio de Playlist desde URL, URI de Spotify o texto plano
export function extractSpotifyPlaylistId(input) {
    if (!input) return '';
    let clean = input.trim();
    if (clean.includes('playlist/')) {
        clean = clean.split('playlist/')[1];
    } else if (clean.startsWith('spotify:playlist:')) {
        clean = clean.replace('spotify:playlist:', '');
    }
    return clean.split('?')[0].split('/')[0].split('#')[0].trim();
}

// Helper para solicitudes a Playlists de Spotify (soporta endpoint moderno /items y fallback a /tracks)
export async function requestSpotifyPlaylistItems(playlistId, method, token, bodyData) {
    const cleanId = extractSpotifyPlaylistId(playlistId);
    if (!cleanId || !token) return null;

    const urls = [
        `https://api.spotify.com/v1/playlists/${cleanId}/items`,
        `https://api.spotify.com/v1/playlists/${cleanId}/tracks`
    ];

    let lastRes = null;
    for (const url of urls) {
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: bodyData ? JSON.stringify(bodyData) : undefined
            });
            if (res.ok) return res;
            if (res.status === 401) return res;
            lastRes = res;
        } catch (e) {
            console.warn(`Request failed to ${url}:`, e);
        }
    }
    return lastRes;
}

export default function SpotifySongRequestManager({ 
    supabase, 
    triggerToast, 
    songRequestCommand: propCmd, 
    setSongRequestCommand: propSetCmd,
    isSongRequestEnabled: propEnabled,
    setIsSongRequestEnabled: propSetEnabled
}) {
    // -------------------------------------------------------------
    // 1. ESTADO DE COMANDO DE TWITCH
    // -------------------------------------------------------------
    const getInitialCommand = () => {
        const saved = localStorage.getItem('song_request_command');
        if (!saved || saved === '!spotifybloqued') return '!sr';
        return saved;
    };

    const [commandInput, setCommandInput] = useState(getInitialCommand);
    const [localEnabled, setLocalEnabled] = useState(() => localStorage.getItem('song_request_enabled') !== 'false');

    const songRequestCommand = propCmd !== undefined ? propCmd : commandInput;
    const isSongRequestEnabled = propEnabled !== undefined ? propEnabled : localEnabled;

    const handleSaveCommand = (e) => {
        e?.preventDefault();
        let clean = commandInput.trim().toLowerCase();
        if (!clean) clean = '!sr';
        if (!clean.startsWith('!')) clean = '!' + clean;
        
        setCommandInput(clean);
        if (propSetCmd) propSetCmd(clean);
        localStorage.setItem('song_request_command', clean);
        window.dispatchEvent(new Event('sr-cmd-changed'));
        if (triggerToast) triggerToast(`✅ Comando de Twitch guardado: ${clean}`);
    };

    const handleToggleEnabled = () => {
        const next = !isSongRequestEnabled;
        if (propSetEnabled) propSetEnabled(next);
        setLocalEnabled(next);
        localStorage.setItem('song_request_enabled', next ? 'true' : 'false');
        window.dispatchEvent(new Event('sr-state-changed'));
        if (triggerToast) triggerToast(next ? '🟢 Song Request ACTIVADO' : '🔴 Song Request PAUSADO');
    };

    // -------------------------------------------------------------
    // 1.1 ESTADO DE MENSAJE DE RESPUESTA EN TWITCH
    // -------------------------------------------------------------
    const DEFAULT_RESPONSE_TEMPLATE = '🎵 @{user} ¡Canción agregada a la Playlist del stream! "{song}" - {artist}';
    const [responseTemplate, setResponseTemplate] = useState(() => {
        return localStorage.getItem('spotify_sr_response_template') || DEFAULT_RESPONSE_TEMPLATE;
    });
    const [savedTemplateSuccess, setSavedTemplateSuccess] = useState(false);

    const handleSaveResponseTemplate = (e) => {
        e?.preventDefault();
        const clean = responseTemplate.trim() || DEFAULT_RESPONSE_TEMPLATE;
        setResponseTemplate(clean);
        localStorage.setItem('spotify_sr_response_template', clean);
        setSavedTemplateSuccess(true);
        setTimeout(() => setSavedTemplateSuccess(false), 2500);
        if (triggerToast) triggerToast('✅ Mensaje de respuesta guardado correctamente');
    };

    const handleResetResponseTemplate = () => {
        setResponseTemplate(DEFAULT_RESPONSE_TEMPLATE);
        localStorage.setItem('spotify_sr_response_template', DEFAULT_RESPONSE_TEMPLATE);
        setSavedTemplateSuccess(true);
        setTimeout(() => setSavedTemplateSuccess(false), 2500);
        if (triggerToast) triggerToast('🔄 Mensaje restaurado al valor por defecto');
    };

    const handleInsertTag = (tag) => {
        setResponseTemplate(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${tag}` : tag;
        });
    };

    // -------------------------------------------------------------
    // 2. ESTADO DE SPOTIFY API (PKCE + PREMIUM)
    // -------------------------------------------------------------
    const [clientIdInput, setClientIdInput] = useState(() => localStorage.getItem('spotify_custom_client_id') || DEFAULT_SPOTIFY_CLIENT_ID);
    const activeClientId = clientIdInput.trim() || DEFAULT_SPOTIFY_CLIENT_ID;

    const currentOriginPath = window.location.origin + window.location.pathname;
    const [spotifyToken, setSpotifyToken] = useState(() => localStorage.getItem('spotify_access_token') || '');
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('spotify_refresh_token') || '');
    const [spotifyUser, setSpotifyUser] = useState(null);
    const [showConfigGuide, setShowConfigGuide] = useState(false);
    const [copiedRedirect, setCopiedRedirect] = useState(false);

    // Refresh Token
    const refreshSpotifyToken = useCallback(async () => {
        const rToken = localStorage.getItem('spotify_refresh_token');
        if (!rToken) return null;

        try {
            const body = new URLSearchParams({
                client_id: activeClientId,
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
                    return data.access_token;
                }
            }
        } catch (e) {
            console.error('Error refreshing Spotify token:', e);
        }
        return null;
    }, [activeClientId]);

    // Handle PKCE Code Exchange on Redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            const storedRedirect = localStorage.getItem('spotify_custom_redirect_uri') || currentOriginPath;
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
                } else if (data.error) {
                    console.error('Spotify token exchange error:', data);
                    if (triggerToast) triggerToast(`❌ Error al conectar Spotify: ${data.error_description || data.error}`);
                }
            })
            .catch(err => {
                console.error('Error exchanging PKCE code:', err);
                if (triggerToast) triggerToast('❌ Error al autorizar con Spotify.');
            });
        }
    }, [currentOriginPath, triggerToast]);

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

    const handleLoginSpotify = async () => {
        const codeVerifier = generateRandomString(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);

        localStorage.setItem('spotify_code_verifier', codeVerifier);
        localStorage.setItem('spotify_custom_client_id', activeClientId);
        localStorage.setItem('spotify_custom_redirect_uri', currentOriginPath);

        const authUrl = new URL('https://accounts.spotify.com/authorize');
        const params = {
            response_type: 'code',
            client_id: activeClientId,
            scope: SPOTIFY_SCOPES,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: currentOriginPath,
            show_dialog: 'true'
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    };

    const handleLogoutSpotify = () => {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_code_verifier');
        setSpotifyToken('');
        setRefreshToken('');
        setSpotifyUser(null);
        if (triggerToast) triggerToast('🔄 Sesión de Spotify desconectada.');
    };

    const handleSaveClientId = () => {
        const clean = clientIdInput.trim() || DEFAULT_SPOTIFY_CLIENT_ID;
        setClientIdInput(clean);
        localStorage.setItem('spotify_custom_client_id', clean);
        if (triggerToast) triggerToast('✅ Client ID guardado.');
    };

    // -------------------------------------------------------------
    // 3. ESTADO DE PLAYLIST DE SPOTIFY
    // -------------------------------------------------------------
    const [playlistInput, setPlaylistInput] = useState(() => 
        localStorage.getItem('spotify_sr_playlist_name') || localStorage.getItem('spotify_sr_playlist_url') || ''
    );
    const [playlistData, setPlaylistData] = useState(null);
    const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

    const fetchPlaylistDetails = useCallback(async (playlistId) => {
        const cleanId = extractSpotifyPlaylistId(playlistId);
        if (!spotifyToken || !cleanId) return;
        setIsLoadingPlaylist(true);
        try {
            let res = await fetch(`https://api.spotify.com/v1/playlists/${cleanId}`, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });

            if (res.status === 401) {
                const newToken = await refreshSpotifyToken();
                if (newToken) {
                    res = await fetch(`https://api.spotify.com/v1/playlists/${cleanId}`, {
                        headers: { Authorization: `Bearer ${newToken}` }
                    });
                }
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

    // Cargar playlist guardada al iniciar
    useEffect(() => {
        const savedId = localStorage.getItem('spotify_sr_playlist_id');
        if (savedId && spotifyToken) {
            fetchPlaylistDetails(savedId);
        }
    }, [spotifyToken, fetchPlaylistDetails]);

    // Vincular Playlist por Nombre o Enlace
    const handleSavePlaylist = async () => {
        const raw = playlistInput.trim();
        if (!raw) {
            if (triggerToast) triggerToast('⚠️ Ingresa el nombre o enlace de la Playlist.');
            return;
        }

        // Si es URL o ID directo
        const directId = extractSpotifyPlaylistId(raw);
        if (directId && directId.length === 22) {
            localStorage.setItem('spotify_sr_playlist_id', directId);
            localStorage.setItem('spotify_sr_playlist_url', raw);
            await fetchPlaylistDetails(directId);
            if (triggerToast) triggerToast('✅ Playlist vinculada por enlace directo.');
            return;
        }

        // Si escribió un nombre, buscar en las playlists del usuario
        if (spotifyToken) {
            setIsLoadingPlaylist(true);
            try {
                const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
                    headers: { Authorization: `Bearer ${spotifyToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const matched = data.items?.find(p => p.name.trim().toLowerCase() === raw.toLowerCase());
                    if (matched) {
                        localStorage.setItem('spotify_sr_playlist_id', matched.id);
                        localStorage.setItem('spotify_sr_playlist_name', matched.name);
                        setPlaylistData(matched);
                        if (triggerToast) triggerToast(`✅ Playlist encontrada y vinculada: "${matched.name}"`);
                        setIsLoadingPlaylist(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Error searching playlist by name:", e);
            } finally {
                setIsLoadingPlaylist(false);
            }
        }

        // Si no se encontró por nombre
        if (directId) {
            localStorage.setItem('spotify_sr_playlist_id', directId);
            await fetchPlaylistDetails(directId);
        } else {
            if (triggerToast) triggerToast(`ℹ️ No se encontró una playlist llamada "${raw}". Puedes crearla con el botón "+ Crear".`);
        }
    };

    // Crear Playlist automáticamente en Spotify con el nombre indicado
    const handleCreatePlaylist = async () => {
        if (!spotifyToken || !spotifyUser) {
            if (triggerToast) triggerToast('⚠️ Primero conecta tu cuenta de Spotify.');
            return;
        }
        const name = playlistInput.trim() || 'Tokkii Song Request';
        setIsCreatingPlaylist(true);
        try {
            const res = await fetch(`https://api.spotify.com/v1/me/playlists`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${spotifyToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: 'Playlist oficial de peticiones del stream en Twitch con EvilTokkii Bot',
                    public: true
                })
            });

            if (res.ok) {
                const newPl = await res.json();
                setPlaylistData(newPl);
                setPlaylistInput(newPl.name);
                localStorage.setItem('spotify_sr_playlist_id', newPl.id);
                localStorage.setItem('spotify_sr_playlist_name', newPl.name);
                if (triggerToast) triggerToast(`🎉 ¡Playlist "${newPl.name}" creada y vinculada en Spotify!`);
            } else {
                const err = await res.json().catch(() => ({}));
                if (triggerToast) triggerToast(`❌ Error al crear playlist: ${err.error?.message || 'Error'}`);
            }
        } catch (e) {
            console.error('Error creating playlist:', e);
            if (triggerToast) triggerToast('❌ Error de red al crear la playlist.');
        } finally {
            setIsCreatingPlaylist(false);
        }
    };

    // -------------------------------------------------------------
    // 4. OVERLAY PARA OBS (ESTILO MUSE DASH SIN FONDO & COMPONENTES LIBRES)
    // -------------------------------------------------------------
    const DEFAULT_OVERLAY_LAYOUT = {
        disc:   { x: 45,  y: 45,  scale: 1 },
        artist: { x: 380, y: 105, scale: 1, maxWidth: 450 },
        title:  { x: 350, y: 195, scale: 1, maxWidth: 580 },
        hideWhenPaused: false
    };

    const [overlayLayout, setOverlayLayout] = useState(() => {
        try {
            const saved = localStorage.getItem('spotify_overlay_layout');
            if (saved) return { ...DEFAULT_OVERLAY_LAYOUT, ...JSON.parse(saved) };
        } catch (e) {}
        return DEFAULT_OVERLAY_LAYOUT;
    });

    const [activeComponent, setActiveComponent] = useState('disc');
    const [isTestPlaying, setIsTestPlaying] = useState(true);
    const [copiedOverlayUrl, setCopiedOverlayUrl] = useState(false);
    const [dragInfo, setDragInfo] = useState(null);
    const [resizeInfo, setResizeInfo] = useState(null);
    const [sampleArtistMode, setSampleArtistMode] = useState('normal'); // 'short' | 'normal' | 'long'
    const canvasRef = useRef(null);

    // Guardar layout y notificar a ventanas abiertas (BroadcastChannel)
    const saveOverlayLayout = (newLayout) => {
        setOverlayLayout(newLayout);
        try {
            localStorage.setItem('spotify_overlay_layout', JSON.stringify(newLayout));
            const bc = new BroadcastChannel('spotify_overlay_channel');
            bc.postMessage({ type: 'UPDATE_LAYOUT', layout: newLayout });
            bc.close();
        } catch (e) {}
    };

    // Drag de componentes en el lienzo
    const handleCompMouseDown = (compKey, e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveComponent(compKey);
        setDragInfo({
            comp: compKey,
            startX: e.clientX,
            startY: e.clientY,
            origX: overlayLayout[compKey]?.x || 0,
            origY: overlayLayout[compKey]?.y || 0
        });
    };

    // Redimensionar límite máximo horizontal (arrastrar borde derecho)
    const handleResizeMouseDown = (compKey, e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveComponent(compKey);
        setResizeInfo({
            comp: compKey,
            startX: e.clientX,
            origMaxWidth: overlayLayout[compKey]?.maxWidth || (compKey === 'artist' ? 450 : 580),
            scale: overlayLayout[compKey]?.scale || 1
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Manejo de redimensionamiento de ancho máximo
            if (resizeInfo) {
                const dx = (e.clientX - resizeInfo.startX) / resizeInfo.scale;
                const newWidth = Math.round(Math.max(160, Math.min(1200, resizeInfo.origMaxWidth + dx)));
                setOverlayLayout(prev => ({
                    ...prev,
                    [resizeInfo.comp]: {
                        ...prev[resizeInfo.comp],
                        maxWidth: newWidth
                    }
                }));
                return;
            }

            // Manejo de arrastre de posición X/Y
            if (!dragInfo) return;
            const dx = e.clientX - dragInfo.startX;
            const dy = e.clientY - dragInfo.startY;
            const newX = Math.round(dragInfo.origX + dx);
            const newY = Math.round(dragInfo.origY + dy);

            setOverlayLayout(prev => {
                const next = {
                    ...prev,
                    [dragInfo.comp]: {
                        ...prev[dragInfo.comp],
                        x: newX,
                        y: newY
                    }
                };
                return next;
            });
        };

        const handleMouseUp = () => {
            if (resizeInfo) {
                setResizeInfo(null);
                saveOverlayLayout(overlayLayout);
            }
            if (dragInfo) {
                setDragInfo(null);
                saveOverlayLayout(overlayLayout);
            }
        };

        if (dragInfo || resizeInfo) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [dragInfo, resizeInfo, overlayLayout]);

    // Presets de ubicación rápida
    const applyPreset = (presetName) => {
        let preset = {};
        if (presetName === 'horizontal') {
            preset = {
                disc:   { x: 45,  y: 45,  scale: 1 },
                artist: { x: 380, y: 105, scale: 1, maxWidth: 450 },
                title:  { x: 350, y: 195, scale: 1, maxWidth: 580 }
            };
        } else if (presetName === 'vertical') {
            preset = {
                disc:   { x: 230, y: 20,  scale: 0.9 },
                artist: { x: 180, y: 325, scale: 0.9, maxWidth: 450 },
                title:  { x: 140, y: 390, scale: 0.9, maxWidth: 580 }
            };
        } else if (presetName === 'right') {
            preset = {
                disc:   { x: 420, y: 40,  scale: 1 },
                artist: { x: 40,  y: 105, scale: 1, maxWidth: 360 },
                title:  { x: 20,  y: 195, scale: 1, maxWidth: 380 }
            };
        } else {
            preset = DEFAULT_OVERLAY_LAYOUT;
        }

        const next = { ...overlayLayout, ...preset };
        saveOverlayLayout(next);
        if (triggerToast) triggerToast(`📐 Preset "${presetName}" aplicado.`);
    };

    const getOverlayObsUrl = () => {
        const origin = window.location.origin;
        const path = '/Builder_EvilTokkii/spotify-overlay.html';
        const params = new URLSearchParams();

        if (spotifyToken) params.set('token', spotifyToken);
        if (refreshToken) params.set('refresh', refreshToken);
        if (activeClientId) params.set('client_id', activeClientId);
        params.set('layout', JSON.stringify(overlayLayout));

        return `${origin}${path}#${params.toString()}`;
    };

    const overlayBrowserUrl = getOverlayObsUrl();

    const handleCopyOverlayUrl = () => {
        const url = getOverlayObsUrl();
        navigator.clipboard.writeText(url);
        setCopiedOverlayUrl(true);
        setTimeout(() => setCopiedOverlayUrl(false), 2200);
        if (triggerToast) triggerToast('📋 URL del Overlay lista para OBS copiada');
    };

    // -------------------------------------------------------------
    // 5. ESTADO DE COLA & PETICIONES (CON DRAG & DROP Y SUPABASE)
    // -------------------------------------------------------------
    const [songQueue, setSongQueue] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isSyncingOrder, setIsSyncingOrder] = useState(false);

    // Modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        onConfirm: null
    });

    const openConfirm = (title, message, confirmText, action) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            confirmText: confirmText || 'Confirmar',
            onConfirm: action
        });
    };

    const closeConfirm = () => {
        setConfirmModal({ isOpen: false, title: '', message: '', confirmText: 'Confirmar', onConfirm: null });
    };

    // Cargar peticiones desde Spotify Playlist, Supabase y LocalStorage
    const fetchQueue = useCallback(async () => {
        let dbList = [];
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('song_requests')
                    .select('*')
                    .order('created_at', { ascending: true })
                    .limit(100);

                if (!error && data) {
                    dbList = data;
                }
            } catch (e) {
                console.error('Error fetching song requests from db:', e);
            }
        }

        let localList = [];
        try {
            localList = JSON.parse(localStorage.getItem('spotify_sr_queue') || '[]');
        } catch (e) {}

        // Mapa de solicitudes conocidas para asociar el usuario solicitante por video_id o título
        const requestMap = new Map();
        for (const item of [...localList, ...dbList]) {
            if (item.video_id) requestMap.set(item.video_id, item);
            if (item.title) requestMap.set(item.title.toLowerCase().trim(), item);
        }

        // Si tenemos token de Spotify y playlist ID, consultar las canciones reales de la playlist
        const savedPlaylistId = extractSpotifyPlaylistId(localStorage.getItem('spotify_sr_playlist_id'));
        if (spotifyToken && savedPlaylistId) {
            try {
                const res = await requestSpotifyPlaylistItems(savedPlaylistId, 'GET', spotifyToken);
                if (res?.ok) {
                    const plData = await res.json();
                    const items = plData.items || [];
                    if (items.length > 0) {
                        const playlistQueue = items.map((pi, idx) => {
                            const track = pi.track || pi.item;
                            if (!track) return null;
                            const artistsStr = track.artists?.map(a => a.name).join(', ') || '';
                            const titleStr = `${track.name} - ${artistsStr}`;
                            const matchedReq = requestMap.get(track.id) || requestMap.get(titleStr.toLowerCase().trim());
                            return {
                                id: matchedReq?.id || `sp_${track.id}_${idx}`,
                                title: titleStr,
                                video_id: track.id,
                                requested_by: matchedReq?.requested_by || 'Twitch Stream',
                                cover_url: track.album?.images?.[0]?.url || matchedReq?.cover_url || '',
                                status: 'completed',
                                created_at: matchedReq?.created_at || new Date().toISOString()
                            };
                        }).filter(Boolean);

                        if (playlistQueue.length > 0) {
                            setSongQueue(playlistQueue);
                            return;
                        }
                    }
                }
            } catch (e) {
                console.warn('Could not fetch items directly from Spotify playlist:', e);
            }
        }

        // Si no se pudieron obtener de Spotify, usamos las combinadas de Supabase y localStorage
        const map = new Map();
        for (const item of [...localList, ...dbList]) {
            const key = item.video_id || item.title;
            if (key) map.set(key, { ...map.get(key), ...item });
        }
        const combined = Array.from(map.values());
        setSongQueue(combined);
    }, [supabase, spotifyToken]);

    useEffect(() => {
        fetchQueue();

        const handleQueueUpdated = (e) => {
            if (e?.detail) {
                setSongQueue(prev => {
                    const exists = prev.some(item => 
                        (item.video_id && item.video_id === e.detail.video_id) || 
                        (item.title && item.title.toLowerCase() === e.detail.title.toLowerCase())
                    );
                    if (exists) return prev;
                    return [...prev, e.detail];
                });
            }
            fetchQueue();
        };

        window.addEventListener('sr-queue-updated', handleQueueUpdated);

        // Polling cada 4 segundos para asegurar sincronización en vivo
        const pollInterval = setInterval(() => {
            fetchQueue();
        }, 4000);

        if (supabase) {
            const channel = supabase
                .channel('sr_realtime_sync')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, () => {
                    fetchQueue();
                })
                .subscribe();

            return () => {
                window.removeEventListener('sr-queue-updated', handleQueueUpdated);
                clearInterval(pollInterval);
                supabase.removeChannel(channel);
            };
        }

        return () => {
            window.removeEventListener('sr-queue-updated', handleQueueUpdated);
            clearInterval(pollInterval);
        };
    }, [fetchQueue, supabase]);

    // Sincronizar el nuevo orden con la Playlist remota de Spotify
    const syncOrderWithSpotify = async (newList) => {
        const playlistId = localStorage.getItem('spotify_sr_playlist_id');
        if (!spotifyToken || !playlistId) return;

        setIsSyncingOrder(true);
        try {
            const uris = newList
                .map(item => {
                    const vid = item.video_id;
                    if (!vid) return null;
                    if (vid.startsWith('spotify:track:')) return vid;
                    if (/^[a-zA-Z0-9]{22}$/.test(vid)) return `spotify:track:${vid}`;
                    return null;
                })
                .filter(Boolean);

            if (uris.length > 0) {
                let res = await requestSpotifyPlaylistItems(playlistId, 'PUT', spotifyToken, { uris: uris.slice(0, 100) });

                if (res?.status === 401) {
                    const newToken = await refreshSpotifyToken();
                    if (newToken) {
                        res = await requestSpotifyPlaylistItems(playlistId, 'PUT', newToken, { uris: uris.slice(0, 100) });
                    }
                }

                if (res?.ok) {
                    if (triggerToast) triggerToast('↕️ ¡Orden sincronizado 1:1 con tu Playlist de Spotify!');
                    fetchPlaylistDetails(playlistId);
                }
            }
        } catch (err) {
            console.error('Error syncing order with Spotify:', err);
        } finally {
            setIsSyncingOrder(false);
        }
    };

    // Reordenar arrastrando (Drag & Drop)
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...songQueue];
        const [movedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, movedItem);

        setSongQueue(reordered);
        setDraggedIndex(null);
        setDragOverIndex(null);

        await syncOrderWithSpotify(reordered);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Mover con botones de flecha ↑ / ↓
    const handleMoveItem = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= songQueue.length) return;

        const reordered = [...songQueue];
        const [movedItem] = reordered.splice(index, 1);
        reordered.splice(targetIndex, 0, movedItem);

        setSongQueue(reordered);
        await syncOrderWithSpotify(reordered);
    };

    // Eliminar una canción individual de la lista y de Spotify
    const handleRemoveSong = (song) => {
        openConfirm(
            '¿Eliminar canción de la lista?',
            `¿Deseas quitar "${song.title}" de la lista y de tu Playlist de Spotify?`,
            'Eliminar Canción',
            async () => {
                const playlistId = localStorage.getItem('spotify_sr_playlist_id');
                const trackUri = song.video_id?.startsWith('spotify:track:')
                    ? song.video_id
                    : song.video_id ? `spotify:track:${song.video_id}` : null;

                try {
                    if (spotifyToken && playlistId && trackUri) {
                        try {
                            await requestSpotifyPlaylistItems(playlistId, 'DELETE', spotifyToken, {
                                tracks: [{ uri: trackUri }],
                                items: [{ uri: trackUri }]
                            });
                        } catch (e) {
                            console.warn('Error deleting track from remote Spotify playlist:', e);
                        }
                    }

                    if (supabase && song.id) {
                        await supabase.from('song_requests').delete().eq('id', song.id);
                    }

                    setSongQueue(prev => prev.filter(s => s.id !== song.id));
                    if (triggerToast) triggerToast(`🗑️ "${song.title}" eliminada de la lista y de Spotify.`);
                    if (playlistId) fetchPlaylistDetails(playlistId);

                } catch (err) {
                    console.error('Error removing song:', err);
                    if (triggerToast) triggerToast('❌ Error al eliminar la canción.');
                }
            }
        );
    };

    // Vaciar todas las canciones de la Playlist en Spotify y comenzar una nueva lista
    const handleClearAllPlaylist = () => {
        const playlistName = playlistData?.name || 'tu Playlist de Spotify';
        openConfirm(
            '¿Vaciar Playlist en Spotify?',
            `Esta acción eliminará TODAS las canciones de "${playlistName}" en Spotify y vaciará la lista del stream para que comiences una nueva sesión limpia en tu siguiente directo.`,
            'Sí, Vaciar Playlist',
            async () => {
                const playlistId = localStorage.getItem('spotify_sr_playlist_id');

                try {
                    if (spotifyToken && playlistId) {
                        const res = await requestSpotifyPlaylistItems(playlistId, 'PUT', spotifyToken, { uris: [] });

                        if (!res?.ok) {
                            console.warn('Could not empty remote playlist:', await res?.text());
                        }
                    }

                    if (supabase) {
                        await supabase.from('song_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                    }

                    setSongQueue([]);
                    if (playlistId) fetchPlaylistDetails(playlistId);
                    if (triggerToast) triggerToast('🧹 ¡Playlist de Spotify vaciada! Lista lista para el nuevo directo.');

                } catch (err) {
                    console.error('Error emptying playlist:', err);
                    if (triggerToast) triggerToast('❌ Error al vaciar la playlist.');
                }
            }
        );
    };

    // -------------------------------------------------------------
    // 6. BÚSQUEDA RÁPIDA MANUAL
    // -------------------------------------------------------------
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showManualSearch, setShowManualSearch] = useState(false);

    const handleSearchManual = async (e) => {
        e?.preventDefault();
        if (!searchQuery.trim() || !spotifyToken) return;

        setIsSearching(true);
        try {
            const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery.trim())}&type=track&limit=5`, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
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

    const handleAddManualTrack = async (track) => {
        const playlistId = localStorage.getItem('spotify_sr_playlist_id');
        if (!playlistId) {
            if (triggerToast) triggerToast('⚠️ Primero vincula tu Playlist de Spotify.');
            return;
        }

        try {
            const res = await requestSpotifyPlaylistItems(playlistId, 'POST', spotifyToken, { uris: [track.uri] });

            if (res?.ok) {
                const artistsStr = track.artists?.map(a => a.name).join(', ') || '';
                if (supabase) {
                    await supabase.from('song_requests').insert([{
                        title: `${track.name} - ${artistsStr}`,
                        video_id: track.id,
                        requested_by: 'Streamer',
                        status: 'pending'
                    }]);
                }
                if (triggerToast) triggerToast(`🎵 Agregada: "${track.name}"`);
                fetchPlaylistDetails(playlistId);
                setSearchQuery('');
                setSearchResults([]);
            }
        } catch (e) {
            console.error('Error adding track manually:', e);
        }
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
            
            {/* Fuente Fredoka e Inyección de Animación de Giro */}
            <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&display=swap" rel="stylesheet" />
            <style>{`
                @keyframes spinOverlayVinyl {
                    to { transform: rotate(360deg); }
                }
                .comp-handle-tag {
                    position: absolute;
                    top: -12px;
                    left: 10px;
                    background: #2a1650;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.4);
                    pointer-events: none;
                    white-space: nowrap;
                    z-index: 10;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
                }
            `}</style>

            {/* ============================================================= */}
            {/* 🔝 1. BARRA SUPERIOR: ESTADO GENERAL & TOGGLE ACTIVO/PAUSADO */}
            {/* ============================================================= */}
            <div style={{
                background: isSongRequestEnabled 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)' 
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: isSongRequestEnabled ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1.5px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '18px',
                padding: '1.25rem 1.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1.5rem',
                boxShadow: isSongRequestEnabled ? '0 10px 25px -5px rgba(16, 185, 129, 0.15)' : 'none',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: isSongRequestEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.18)',
                        color: isSongRequestEnabled ? '#10B981' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>
                        <ListMusic size={26} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 800 }}>
                                Song Request de Twitch
                            </h2>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                background: isSongRequestEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: isSongRequestEnabled ? '#10B981' : '#EF4444',
                                border: isSongRequestEnabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                letterSpacing: '0.04em'
                            }}>
                                {isSongRequestEnabled ? '🟢 CAPTURANDO' : '🔴 PAUSADO'}
                            </span>
                        </div>
                        <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                            Recibe peticiones en el chat de Twitch y envíalas directamente a tu Playlist de Spotify.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Badge de Spotify Status */}
                    {spotifyToken && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(29, 185, 84, 0.12)',
                            border: '1px solid rgba(29, 185, 84, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '10px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1DB954' }} />
                            <span style={{ fontSize: '0.82rem', color: '#1DB954', fontWeight: 700 }}>
                                {spotifyUser?.display_name || 'Spotify Conectado'}
                            </span>
                        </div>
                    )}

                    {/* Switch Toggle Activar/Pausar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                            {isSongRequestEnabled ? 'Activo' : 'Pausado'}
                        </span>
                        <label style={{ position: 'relative', display: 'inline-block', width: '56px', height: '30px', cursor: 'pointer', flexShrink: 0 }}>
                            <input 
                                type="checkbox" 
                                checked={isSongRequestEnabled} 
                                onChange={handleToggleEnabled}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: isSongRequestEnabled ? '#10B981' : '#334155',
                                transition: '0.25s ease', borderRadius: '30px',
                                boxShadow: isSongRequestEnabled ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '22px', width: '22px',
                                    left: isSongRequestEnabled ? '30px' : '4px', bottom: '4px',
                                    backgroundColor: 'white', transition: '0.25s ease', borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* ============================================================= */}
            {/* 🎵 2. CASILLA: PLAYLIST DE SPOTIFY (VINCULAR Y VACIAR) */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.5rem 1.6rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(29, 185, 84, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(29, 185, 84, 0.15)', color: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Music size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 800 }}>
                                Playlist de Spotify para Peticiones
                            </h3>
                            <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Ingresa el nombre o enlace de la playlist donde se agregarán las canciones solicitadas.
                            </p>
                        </div>
                    </div>

                    {playlistData && (
                        <button
                            type="button"
                            onClick={handleClearAllPlaylist}
                            style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            title="Elimina todas las canciones de la playlist en Spotify para empezar una nueva sesión"
                        >
                            <Trash2 size={14} /> Vaciar Playlist (Nueva Sesión)
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        value={playlistInput}
                        onChange={(e) => setPlaylistInput(e.target.value)}
                        placeholder="Ej: Canciones del Stream o https://open.spotify.com/playlist/..."
                        className="gift-input-field"
                        style={{ flex: 1, minWidth: '260px', marginBottom: 0 }}
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
                            padding: '0 18px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {isLoadingPlaylist ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
                        Vincular Playlist
                    </button>

                    {spotifyToken && (
                        <button
                            type="button"
                            onClick={handleCreatePlaylist}
                            disabled={isCreatingPlaylist}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: '#F8FAFC',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '10px',
                                padding: '0 14px',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            title="Crea una nueva playlist con este nombre en tu cuenta de Spotify"
                        >
                            {isCreatingPlaylist ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                            Crear en mi Spotify
                        </button>
                    )}
                </div>

                {playlistData ? (
                    <div style={{
                        background: 'rgba(29, 185, 84, 0.08)',
                        border: '1px solid rgba(29, 185, 84, 0.25)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {playlistData.images?.[0]?.url ? (
                                <img 
                                    src={playlistData.images[0].url} 
                                    alt={playlistData.name} 
                                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ListMusic size={22} color="#94A3B8" />
                                </div>
                            )}
                            <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1DB954', textTransform: 'uppercase' }}>
                                    ✓ Playlist Vinculada
                                </span>
                                <h4 style={{ margin: '1px 0', color: '#FFF', fontSize: '1rem', fontWeight: 800 }}>
                                    {playlistData.name}
                                </h4>
                                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                                    {playlistData.tracks?.total || 0} canciones en Spotify • Por {playlistData.owner?.display_name || 'Tú'}
                                </span>
                                {spotifyUser && playlistData.owner && playlistData.owner.id !== spotifyUser.id && !playlistData.collaborative && (
                                    <div style={{ marginTop: '4px', fontSize: '0.73rem', color: '#F87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <AlertCircle size={12} /> Esta playlist pertenece a otra cuenta y no es colaborativa. Las canciones solicitadas fallarán al agregarse si no es tuya.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <a
                                href={playlistData.external_urls?.spotify || `https://open.spotify.com/playlist/${playlistData.id}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#FFF',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ExternalLink size={13} /> Abrir en Spotify
                            </a>
                        </div>
                    </div>
                ) : (
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        ⚠️ Aún no has vinculado una playlist. Ingresa su nombre o enlace arriba y presiona "Vincular Playlist".
                    </div>
                )}
            </div>

            {/* ============================================================= */}
            {/* 🛡️ 3. CASILLA: CÓMO CONFIGURAR SPOTIFY API (SPOTIFY PREMIUM) */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.5rem 1.6rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(29, 185, 84, 0.15)', color: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 800 }}>
                                Conexión con Spotify API (Spotify Premium)
                            </h3>
                            <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Vincula tu cuenta de Spotify Premium con tu App de Developer para gestionar tu música sin límites.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {spotifyToken ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>
                                    ✓ Conectado: {spotifyUser?.display_name || 'Spotify'}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogoutSpotify}
                                    style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                >
                                    Desconectar
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleLoginSpotify}
                                style={{
                                    background: '#1DB954',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontWeight: 800,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 0 12px rgba(29, 185, 84, 0.3)'
                                }}
                            >
                                <Music size={15} /> Conectar Spotify
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowConfigGuide(!showConfigGuide)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: '#38BDF8',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <HelpCircle size={15} /> ¿Cómo configurar? {showConfigGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '1.2rem', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                        <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                            Client ID de tu App en developer.spotify.com
                        </label>
                        <input
                            type="text"
                            value={clientIdInput}
                            onChange={(e) => setClientIdInput(e.target.value)}
                            placeholder="Ej: 467b4e8480964c26913cb87d276ed20c"
                            className="gift-input-field"
                            style={{ width: '100%', marginBottom: 0, fontFamily: 'monospace', fontSize: '0.82rem' }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveClientId}
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#F8FAFC',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            padding: '10px 16px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            marginTop: '18px'
                        }}
                    >
                        Guardar Client ID
                    </button>
                </div>

                {showConfigGuide && (
                    <div style={{
                        marginTop: '1.2rem',
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '14px',
                        padding: '1.2rem 1.4rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.8rem' }}>
                            <Info size={18} /> Guía: Cómo configurar la API de Spotify (Spotify Premium)
                        </div>

                        <div style={{ display: 'grid', gap: '12px', fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ background: '#1DB954', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>1</span>
                                <div>
                                    <strong>Inicia sesión con tu cuenta de Spotify Premium:</strong> Ve a <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#1DB954', textDecoration: 'underline' }}>developer.spotify.com/dashboard</a>.
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ background: '#1DB954', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>2</span>
                                <div>
                                    <strong>Crea una App:</strong> Presiona el botón <strong>"Create App"</strong>. Dale un nombre como <em>"Tokkii Stream Music"</em> y selecciona <em>"Web API"</em>.
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ background: '#1DB954', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>3</span>
                                <div style={{ width: '100%' }}>
                                    <strong>Agrega la Redirect URI exacta:</strong> En los <em>Settings</em> de tu app de Spotify, en el campo <strong>Redirect URIs</strong>, haz clic en <strong>Add</strong>, pega la siguiente URL y pulsa <strong>Save</strong> al fondo:
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                        <input
                                            type="text"
                                            readOnly
                                            value={currentOriginPath}
                                            style={{
                                                flex: 1,
                                                background: '#0f172a',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                color: '#10B981',
                                                fontSize: '0.8rem',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(currentOriginPath);
                                                setCopiedRedirect(true);
                                                setTimeout(() => setCopiedRedirect(false), 2000);
                                            }}
                                            style={{
                                                background: copiedRedirect ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                                                color: '#FFF',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '0 12px',
                                                fontWeight: 700,
                                                fontSize: '0.78rem',
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
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ background: '#1DB954', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>4</span>
                                <div>
                                    <strong>Copia el Client ID:</strong> En la pestaña <em>Basic Information</em> o <em>Settings</em> de tu app, copia el <strong>Client ID</strong> y pégalo en la casilla de arriba.
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ background: '#1DB954', color: '#000', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}>5</span>
                                <div>
                                    <strong>Conecta tu cuenta:</strong> Haz clic en <strong>"Conectar Spotify"</strong> y acepta los permisos. Con <strong>Spotify Premium</strong>, la música se reproducirá sin anuncios ni límites en la app de Spotify de tu PC mientras transmites en Twitch.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================= */}
            {/* 💬 4. CASILLA: COMANDO DEL CHAT DE TWITCH */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.5rem 1.6rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Radio size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 800 }}>
                            Comando del Chat de Twitch
                        </h3>
                        <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Personaliza el comando con el que tus espectadores pedirán música en vivo.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSaveCommand} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <input
                            type="text"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            placeholder="!sr, !pide, !cancion..."
                            className="gift-input-field"
                            style={{ 
                                width: '100%', 
                                marginBottom: 0, 
                                fontWeight: 700, 
                                fontSize: '0.95rem',
                                letterSpacing: '0.03em',
                                color: '#38BDF8',
                                background: 'rgba(15, 23, 42, 0.9)'
                            }}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        style={{
                            background: '#38BDF8',
                            color: '#04131f',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)'
                        }}
                    >
                        <Save size={16} /> Guardar Comando
                    </button>
                </form>

                <div style={{
                    marginTop: '1rem',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                        Uso en el chat de Twitch: <strong style={{ color: '#F8FAFC', fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>{songRequestCommand} Bohemian Rhapsody</strong> o con enlace directo de Spotify.
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                        ✓ Comando Activo: {songRequestCommand}
                    </span>
                </div>
            </div>

            {/* ============================================================= */}
            {/* 💬 5. CASILLA: MENSAJE DE RESPUESTA EN EL CHAT DE TWITCH */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.6rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.9)', border: '1.5px solid rgba(168, 85, 247, 0.35)', boxShadow: '0 12px 30px -10px rgba(168, 85, 247, 0.15)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.25))',
                            color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.15rem', fontWeight: 800 }}>
                                    Mensaje de Respuesta en el Chat de Twitch
                                </h3>
                                <span style={{
                                    fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px',
                                    background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)'
                                }}>
                                    RESPUESTA AUTOMÁTICA
                                </span>
                            </div>
                            <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                Personaliza el mensaje que el bot enviará al chat de Twitch para avisarle al usuario cuando su canción se agregue a la playlist.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetResponseTemplate}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#94A3B8',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                        title="Restablecer el mensaje al formato predeterminado"
                    >
                        <RotateCcw size={13} /> Restablecer por Defecto
                    </button>
                </div>

                {/* Formulario de Edición */}
                <form onSubmit={handleSaveResponseTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                            <input
                                type="text"
                                value={responseTemplate}
                                onChange={(e) => setResponseTemplate(e.target.value)}
                                placeholder="Escribe el mensaje de confirmación..."
                                style={{
                                    width: '100%',
                                    background: '#0B1120',
                                    border: '1.5px solid rgba(168, 85, 247, 0.35)',
                                    borderRadius: '10px',
                                    padding: '12px 14px',
                                    color: '#F8FAFC',
                                    fontSize: '0.92rem',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                background: savedTemplateSuccess ? '#10B981' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '12px 20px',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                boxShadow: savedTemplateSuccess ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(168, 85, 247, 0.35)'
                            }}
                        >
                            {savedTemplateSuccess ? <Check size={16} /> : <Save size={16} />}
                            {savedTemplateSuccess ? '¡Guardado!' : 'Guardar Mensaje'}
                        </button>
                    </div>

                    {/* Variables disponibles para insertar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
                            Variables disponibles (clic para insertar):
                        </span>
                        {[
                            { tag: '{user}', desc: 'Usuario que solicitó la canción' },
                            { tag: '{song}', desc: 'Título de la canción' },
                            { tag: '{artist}', desc: 'Nombre del artista' }
                        ].map((v) => (
                            <button
                                key={v.tag}
                                type="button"
                                onClick={() => handleInsertTag(v.tag)}
                                style={{
                                    background: 'rgba(168, 85, 247, 0.15)',
                                    color: '#d8b4fe',
                                    border: '1px solid rgba(168, 85, 247, 0.35)',
                                    borderRadius: '6px',
                                    padding: '3px 8px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontFamily: 'monospace',
                                    transition: 'all 0.15s'
                                }}
                                title={`Haz clic para agregar ${v.tag} al mensaje (${v.desc})`}
                            >
                                <Plus size={12} /> {v.tag}
                            </button>
                        ))}
                    </div>

                    {/* Vista Previa del Chat de Twitch */}
                    <div style={{
                        marginTop: '4px',
                        background: '#0e0e10',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        border: '1px solid rgba(145, 70, 255, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.72rem', color: '#a970ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Send size={11} /> Vista previa en el Chat de Twitch
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                Ejemplo en vivo
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.88rem',
                            wordBreak: 'break-word',
                            lineHeight: 1.45
                        }}>
                            {/* Insignia Bot Twitch */}
                            <span style={{
                                background: '#9146FF',
                                color: '#FFF',
                                fontSize: '0.62rem',
                                fontWeight: 900,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                verticalAlign: 'middle',
                                flexShrink: 0
                            }}>
                                BOT
                            </span>
                            
                            {/* Nombre del Bot */}
                            <span style={{ color: '#bf94ff', fontWeight: 800, flexShrink: 0 }}>
                                TokkiiBot:
                            </span>

                            {/* Contenido formateado en vivo */}
                            <span style={{ color: '#E2E8F0' }}>
                                {(responseTemplate || DEFAULT_RESPONSE_TEMPLATE)
                                    .replace(/{user}|{requester}/gi, '@TokkiiViewer')
                                    .replace(/{song}|{title}/gi, 'Exit This Earth\'s Atomosphere')
                                    .replace(/{artist}/gi, 'Camellia')}
                            </span>
                        </div>
                    </div>
                </form>
            </div>

            {/* ============================================================= */}
            {/* 🎛️ 6. CASILLA: OVERLAY PARA OBS (DISEÑO MUSE DASH SIN FONDO CON COMPONENTES LIBRES) */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.6rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.9)', border: '1.5px solid rgba(255, 95, 162, 0.35)', boxShadow: '0 12px 30px -10px rgba(255, 95, 162, 0.15)' }}>
                {/* Header de la casilla Overlay */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(255, 95, 162, 0.25), rgba(63, 216, 255, 0.25))',
                            color: '#ff5fa2', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Disc3 size={24} className={isTestPlaying ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.15rem', fontWeight: 800 }}>
                                    Overlay para OBS (Estilo Muse Dash • Sin Fondo)
                                </h3>
                                <span style={{
                                    fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px',
                                    background: 'rgba(63, 216, 255, 0.15)', color: '#3fd8ff', border: '1px solid rgba(63, 216, 255, 0.35)'
                                }}>
                                    3 COMPONENTES LIBRES
                                </span>
                            </div>
                            <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                Disco giratorio transparente y casillas de autor/canción. Arrastra cada elemento en el lienzo para situarlo donde quieras.
                            </p>
                        </div>
                    </div>

                    {/* Botones de acción OBS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setIsTestPlaying(!isTestPlaying)}
                            style={{
                                background: isTestPlaying ? 'rgba(255, 95, 162, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                color: isTestPlaying ? '#ff5fa2' : '#F8FAFC',
                                border: isTestPlaying ? '1px solid #ff5fa2' : '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px', padding: '7px 12px', fontSize: '0.8rem', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                            title="Prueba el giro infinito del disco y detención al pausar"
                        >
                            {isTestPlaying ? <Pause size={14} /> : <Play size={14} />} {isTestPlaying ? 'Pausar Giro' : 'Girar Disco'}
                        </button>

                        <button
                            type="button"
                            onClick={handleCopyOverlayUrl}
                            style={{
                                background: copiedOverlayUrl ? '#10B981' : '#38BDF8',
                                color: copiedOverlayUrl ? '#FFF' : '#04131f',
                                border: 'none', borderRadius: '8px', padding: '7px 14px',
                                fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)'
                            }}
                        >
                            {copiedOverlayUrl ? <Check size={14} /> : <Copy size={14} />}
                            {copiedOverlayUrl ? 'URL Copiada' : 'Copiar URL para OBS'}
                        </button>

                        <a
                            href={overlayBrowserUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#FFF', borderRadius: '8px', padding: '7px 12px',
                                fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                            title="Abre el overlay limpio en una nueva ventana"
                        >
                            <ExternalLink size={14} /> Abrir Overlay
                        </a>
                    </div>
                </div>

                {/* Barra de Ajuste Rápido & Presets de Posición */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    {/* Selector de componente para ajustar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700 }}>
                            Ajustar:
                        </span>
                        {[
                            { key: 'disc', label: '💽 Disco', color: '#ff5fa2' },
                            { key: 'artist', label: '👤 Autor', color: '#ff8bbd' },
                            { key: 'title', label: '🎵 Canción', color: '#3fd8ff' }
                        ].map(comp => (
                            <button
                                key={comp.key}
                                type="button"
                                onClick={() => setActiveComponent(comp.key)}
                                style={{
                                    background: activeComponent === comp.key ? comp.color : 'rgba(255, 255, 255, 0.06)',
                                    color: activeComponent === comp.key ? (comp.key === 'title' ? '#000' : '#fff') : '#CBD5E1',
                                    border: activeComponent === comp.key ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                {comp.label}
                            </button>
                        ))}
                    </div>

                    {/* Controles numéricos del componente activo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8' }}>
                            X:
                            <input
                                type="number"
                                value={overlayLayout[activeComponent]?.x || 0}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    saveOverlayLayout({
                                        ...overlayLayout,
                                        [activeComponent]: { ...overlayLayout[activeComponent], x: val }
                                    });
                                }}
                                style={{
                                    width: '60px', background: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '4px', padding: '3px 6px', color: '#fff', fontSize: '0.78rem', textAlign: 'center'
                                }}
                            />
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8' }}>
                            Y:
                            <input
                                type="number"
                                value={overlayLayout[activeComponent]?.y || 0}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    saveOverlayLayout({
                                        ...overlayLayout,
                                        [activeComponent]: { ...overlayLayout[activeComponent], y: val }
                                    });
                                }}
                                style={{
                                    width: '60px', background: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '4px', padding: '3px 6px', color: '#fff', fontSize: '0.78rem', textAlign: 'center'
                                }}
                            />
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8' }}>
                            Escala:
                            <select
                                value={overlayLayout[activeComponent]?.scale || 1}
                                onChange={(e) => {
                                    const s = parseFloat(e.target.value) || 1;
                                    saveOverlayLayout({
                                        ...overlayLayout,
                                        [activeComponent]: { ...overlayLayout[activeComponent], scale: s }
                                    });
                                }}
                                style={{
                                    background: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '4px', padding: '3px 6px', color: '#fff', fontSize: '0.78rem'
                                }}
                            >
                                <option value="0.7">70%</option>
                                <option value="0.8">80%</option>
                                <option value="0.9">90%</option>
                                <option value="1">100%</option>
                                <option value="1.1">110%</option>
                                <option value="1.2">120%</option>
                            </select>
                        </label>

                        {/* Límite Máximo Horizontal para Casilla Autor o Canción */}
                        {(activeComponent === 'artist' || activeComponent === 'title') && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: activeComponent === 'artist' ? '#ff5fa2' : '#3fd8ff', fontWeight: 700 }}>
                                Límite Máx:
                                <input
                                    type="number"
                                    min="160"
                                    max="1200"
                                    step="10"
                                    value={overlayLayout[activeComponent]?.maxWidth || (activeComponent === 'artist' ? 450 : 580)}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 200;
                                        saveOverlayLayout({
                                            ...overlayLayout,
                                            [activeComponent]: { ...overlayLayout[activeComponent], maxWidth: val }
                                        });
                                    }}
                                    style={{
                                        width: '64px', background: '#0b1120', 
                                        border: `1.5px solid ${activeComponent === 'artist' ? '#ff5fa2' : '#3fd8ff'}`,
                                        borderRadius: '4px', padding: '3px 6px', color: '#fff', fontSize: '0.78rem', textAlign: 'center', fontWeight: 800
                                    }}
                                    title="Límite máximo horizontal hasta donde crecerá la casilla según el largo del texto antes de truncar"
                                />
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>px</span>
                            </label>
                        )}
                    </div>

                    {/* Probar texto de ejemplo para comprobar el límite de autor */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Largo Autor:</span>
                        <button
                            type="button"
                            onClick={() => setSampleArtistMode('short')}
                            style={{
                                background: sampleArtistMode === 'short' ? '#ff5fa2' : 'transparent',
                                color: sampleArtistMode === 'short' ? '#fff' : '#94A3B8',
                                border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700
                            }}
                            title="Probar nombre corto (se ajusta a su tamaño)"
                        >
                            Corto
                        </button>
                        <button
                            type="button"
                            onClick={() => setSampleArtistMode('normal')}
                            style={{
                                background: sampleArtistMode === 'normal' ? '#ff5fa2' : 'transparent',
                                color: sampleArtistMode === 'normal' ? '#fff' : '#94A3B8',
                                border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700
                            }}
                            title="Probar nombre estándar"
                        >
                            Medio
                        </button>
                        <button
                            type="button"
                            onClick={() => setSampleArtistMode('long')}
                            style={{
                                background: sampleArtistMode === 'long' ? '#ff5fa2' : 'transparent',
                                color: sampleArtistMode === 'long' ? '#fff' : '#94A3B8',
                                border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700
                            }}
                            title="Probar nombre muy largo (llega al límite configurado y no se desborda)"
                        >
                            Largo
                        </button>
                    </div>

                    {/* Presets de diseño */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Plantillas:</span>
                        <button
                            type="button"
                            onClick={() => applyPreset('horizontal')}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', cursor: 'pointer' }}
                        >
                            Horizontal
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('vertical')}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', cursor: 'pointer' }}
                        >
                            Vertical
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('right')}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', cursor: 'pointer' }}
                        >
                            Disco Der.
                        </button>
                        <button
                            type="button"
                            onClick={() => applyPreset('default')}
                            title="Restablecer posición original"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                        >
                            <RotateCcw size={13} />
                        </button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 🎨 LIENZO INTERACTIVO (CANVAS TRANSPARENTE CON ARRASTRE LIBRE) */}
                {/* ========================================================= */}
                <div 
                    ref={canvasRef}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '430px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1.5px dashed rgba(255, 95, 162, 0.45)',
                        // Patrón cuadriculado transparente de tablero de ajedrez (estilo OBS / Photoshop)
                        background: 'repeating-conic-gradient(rgba(255,255,255,0.035) 0% 25%, transparent 0% 50%) 50% / 22px 22px, #0b1120',
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.85)',
                        cursor: dragInfo ? 'grabbing' : 'default',
                        userSelect: 'none'
                    }}
                >
                    {/* Marca de agua de Lienzo Transparente OBS */}
                    <div style={{
                        position: 'absolute', right: '14px', bottom: '12px',
                        fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, pointerEvents: 'none',
                        background: 'rgba(0,0,0,0.4)', padding: '3px 8px', borderRadius: '6px'
                    }}>
                        ✦ Fondo 100% Transparente para OBS • Arrastra los 3 componentes libremente
                    </div>

                    {/* COMPONENTE 1: DISCO DE VINILO */}
                    <div
                        onMouseDown={(e) => handleCompMouseDown('disc', e)}
                        style={{
                            position: 'absolute',
                            left: `${overlayLayout.disc?.x || 30}px`,
                            top: `${overlayLayout.disc?.y || 40}px`,
                            width: '320px',
                            height: '320px',
                            transform: `scale(${overlayLayout.disc?.scale || 1})`,
                            transformOrigin: '0 0',
                            cursor: dragInfo?.comp === 'disc' ? 'grabbing' : 'grab',
                            zIndex: activeComponent === 'disc' ? 30 : 20,
                            filter: activeComponent === 'disc' ? 'drop-shadow(0 0 10px rgba(255,95,162,0.8))' : 'none'
                        }}
                    >
                        <div className="comp-handle-tag">💽 Disco (Arrastrar)</div>

                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {/* Sombra pop sólida estilo Muse Dash */}
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: '#ff5fa2', transform: 'translate(8px, 8px)'
                            }} />

                            {/* Barra de progreso circular sin cortes */}
                            <svg 
                                style={{ 
                                    position: 'absolute', 
                                    left: '-20px', 
                                    top: '-20px', 
                                    width: '360px', 
                                    height: '360px', 
                                    transform: 'rotate(-90deg)', 
                                    zIndex: 3, 
                                    pointerEvents: 'none',
                                    overflow: 'visible'
                                }} 
                                viewBox="0 0 100 100"
                            >
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(42,22,80,0.35)" strokeWidth="6" strokeLinecap="round" />
                                <circle 
                                    cx="50" cy="50" r="45" fill="none" stroke="#ffe45e" strokeWidth="6" strokeLinecap="round"
                                    strokeDasharray="1000" strokeDashoffset="420"
                                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,228,94,0.95))' }}
                                />
                            </svg>

                            {/* Vinilo giratorio */}
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                border: '7px solid #fff',
                                background: 'repeating-radial-gradient(circle at center, #2a1650 0 3px, #3a2170 3px 5px)',
                                boxShadow: '0 0 0 5px #3fd8ff',
                                animation: isTestPlaying ? 'spinOverlayVinyl 9s linear infinite' : 'none'
                            }}>
                                {/* Brillo de vinilo */}
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: '50%',
                                    background: 'conic-gradient(from 20deg, transparent 0 15%, rgba(255,255,255,0.22) 22%, transparent 30% 65%, rgba(63,216,255,0.25) 72%, transparent 80%)',
                                    pointerEvents: 'none'
                                }} />

                                {/* Carátula del disco en el centro */}
                                <div style={{
                                    position: 'absolute', left: '50%', top: '50%', width: '62%', height: '62%',
                                    transform: 'translate(-50%, -50%)', borderRadius: '50%',
                                    backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80")',
                                    backgroundPosition: 'center', backgroundSize: 'cover',
                                    border: '6px solid #fff',
                                    boxShadow: '0 0 0 5px #ff5fa2',
                                    overflow: 'hidden'
                                }} />

                                {/* Agujero central */}
                                <div style={{
                                    position: 'absolute', left: '50%', top: '50%', width: '34px', height: '34px',
                                    transform: 'translate(-50%, -50%)', borderRadius: '50%',
                                    background: '#2a1650', border: '5px solid #fff', zIndex: 2
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* COMPONENTE 2: CASILLA AUTOR (AUTO-AJUSTABLE CON LÍMITE MÁXIMO HORIZONTAL) */}
                    <div
                        onMouseDown={(e) => handleCompMouseDown('artist', e)}
                        style={{
                            position: 'absolute',
                            left: `${overlayLayout.artist?.x || 380}px`,
                            top: `${overlayLayout.artist?.y || 105}px`,
                            width: 'fit-content',
                            maxWidth: `${overlayLayout.artist?.maxWidth || 450}px`,
                            boxSizing: 'border-box',
                            transform: `scale(${overlayLayout.artist?.scale || 1}) skewX(-9deg)`,
                            transformOrigin: '0 0',
                            padding: '10px 28px 10px 34px',
                            background: 'linear-gradient(100deg, #ff5fa2, #ff8bbd)',
                            color: '#fff',
                            fontFamily: "'Fredoka', 'Nunito', sans-serif",
                            fontWeight: 700,
                            fontSize: '28px',
                            lineHeight: 1.1,
                            border: '5px solid #fff',
                            borderRadius: '14px',
                            boxShadow: '7px 7px 0 #2a1650',
                            textShadow: '2px 2px 0 #d4337a',
                            whiteSpace: 'nowrap',
                            cursor: dragInfo?.comp === 'artist' ? 'grabbing' : 'grab',
                            zIndex: activeComponent === 'artist' ? 30 : 22,
                            filter: activeComponent === 'artist' ? 'drop-shadow(0 0 10px rgba(255,95,162,0.95))' : 'none',
                            transition: resizeInfo?.comp === 'artist' ? 'none' : 'max-width 0.15s ease'
                        }}
                    >
                        <div className="comp-handle-tag" style={{ transform: 'skewX(9deg)' }}>
                            👤 Autor (Límite Máx: {overlayLayout.artist?.maxWidth || 450}px)
                        </div>

                        {/* Texto auto-ajustable con truncado si supera el límite máximo */}
                        <span style={{ 
                            display: 'inline-block', 
                            transform: 'skewX(9deg)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            verticalAlign: 'bottom'
                        }}>
                            {sampleArtistMode === 'short' 
                                ? 'Camellia' 
                                : sampleArtistMode === 'normal' 
                                    ? 'Camellia & Nanahira' 
                                    : 'Camellia feat. Toby Fox, Nanahira & Virtual Streamers Band'}
                        </span>

                        {/* Tirador interactivo de redimensionamiento horizontal en el borde derecho */}
                        <div
                            onMouseDown={(e) => handleResizeMouseDown('artist', e)}
                            title="Haz clic y arrastra horizontalmente para definir el límite máximo de ancho"
                            style={{
                                position: 'absolute',
                                right: '-8px',
                                top: '15%',
                                bottom: '15%',
                                width: '16px',
                                background: '#ffd24a',
                                borderRadius: '6px',
                                border: '2px solid #fff',
                                cursor: 'ew-resize',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 40,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                transform: 'skewX(9deg)',
                                transition: 'transform 0.1s'
                            }}
                        >
                            <span style={{ fontSize: '10px', color: '#000', fontWeight: 900, userSelect: 'none' }}>↔</span>
                        </div>
                    </div>

                    {/* COMPONENTE 3: CASILLA CANCIÓN */}
                    <div
                        onMouseDown={(e) => handleCompMouseDown('title', e)}
                        style={{
                            position: 'absolute',
                            left: `${overlayLayout.title?.x || 350}px`,
                            top: `${overlayLayout.title?.y || 195}px`,
                            width: 'fit-content',
                            maxWidth: `${overlayLayout.title?.maxWidth || 580}px`,
                            boxSizing: 'border-box',
                            transform: `scale(${overlayLayout.title?.scale || 1}) skewX(-9deg)`,
                            transformOrigin: '0 0',
                            padding: '12px 30px',
                            background: 'linear-gradient(100deg, #3fd8ff, #8ae9ff)',
                            color: '#2a1650',
                            fontFamily: "'Fredoka', 'Nunito', sans-serif",
                            fontWeight: 700,
                            fontSize: '34px',
                            lineHeight: 1.15,
                            border: '5px solid #fff',
                            borderRadius: '14px',
                            boxShadow: '7px 7px 0 #2a1650',
                            whiteSpace: 'nowrap',
                            cursor: dragInfo?.comp === 'title' ? 'grabbing' : 'grab',
                            zIndex: activeComponent === 'title' ? 30 : 21,
                            filter: activeComponent === 'title' ? 'drop-shadow(0 0 8px rgba(63,216,255,0.9))' : 'none',
                            transition: resizeInfo?.comp === 'title' ? 'none' : 'max-width 0.15s ease'
                        }}
                    >
                        <div className="comp-handle-tag" style={{ transform: 'skewX(9deg)' }}>🎵 Canción (Límite Máx: {overlayLayout.title?.maxWidth || 580}px)</div>
                        <span style={{ 
                            display: 'inline-block', 
                            transform: 'skewX(9deg)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            verticalAlign: 'bottom'
                        }}>
                            Exit This Earth’s Atmosphere
                        </span>

                        {/* Tirador interactivo de redimensionamiento horizontal en el borde derecho */}
                        <div
                            onMouseDown={(e) => handleResizeMouseDown('title', e)}
                            title="Haz clic y arrastra horizontalmente para definir el límite máximo de ancho"
                            style={{
                                position: 'absolute',
                                right: '-8px',
                                top: '15%',
                                bottom: '15%',
                                width: '16px',
                                background: '#3fd8ff',
                                borderRadius: '6px',
                                border: '2px solid #fff',
                                cursor: 'ew-resize',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 40,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                transform: 'skewX(9deg)',
                                transition: 'transform 0.1s'
                            }}
                        >
                            <span style={{ fontSize: '10px', color: '#000', fontWeight: 900, userSelect: 'none' }}>↔</span>
                        </div>
                    </div>
                </div>

                {/* Footer del Overlay: Instrucciones de OBS */}
                <div style={{
                    marginTop: '1rem',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                        💡 <strong>Cómo agregarlo en OBS Studio:</strong> Agrega una fuente tipo <strong>Navegador (Browser Source)</strong>, pega la URL copiada y fija el tamaño en <code>800x450</code> o <code>1920x1080</code>.
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#CBD5E1', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={overlayLayout.hideWhenPaused || false}
                            onChange={(e) => saveOverlayLayout({ ...overlayLayout, hideWhenPaused: e.target.checked })}
                        />
                        Ocultar overlay cuando la música esté pausada
                    </label>
                </div>
            </div>

            {/* ============================================================= */}
            {/* 📜 7. COLA DE CANCIONES SOLICITADAS (CON DRAG & DROP Y DELETE) */}
            {/* ============================================================= */}
            <div className="card" style={{ padding: '1.6rem', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.15rem', fontWeight: 800 }}>
                                Lista de Canciones Solicitadas ({songQueue.length})
                            </h3>
                            {isSyncingOrder && (
                                <span style={{ fontSize: '0.75rem', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <RefreshCw size={12} className="animate-spin" /> Sincronizando con Spotify...
                                </span>
                            )}
                        </div>
                        <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Mantén el clic presionado sobre una canción para arrastrarla y cambiar el orden de escucha en vivo.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setShowManualSearch(!showManualSearch)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: '#F8FAFC',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Search size={14} /> {showManualSearch ? 'Ocultar Buscador' : 'Buscar y Agregar Tema'}
                        </button>
                    </div>
                </div>

                {/* Buscador Manual Colapsable */}
                {showManualSearch && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        marginBottom: '1.2rem'
                    }}>
                        <form onSubmit={handleSearchManual} style={{ display: 'flex', gap: '8px', marginBottom: searchResults.length ? '10px' : 0 }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Escribe el título o artista para agregar directamente..."
                                className="gift-input-field"
                                style={{ flex: 1, marginBottom: 0, fontSize: '0.85rem' }}
                            />
                            <button
                                type="submit"
                                disabled={isSearching || !spotifyToken}
                                style={{
                                    background: '#10B981',
                                    color: '#FFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0 16px',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {isSearching ? <RefreshCw size={14} className="animate-spin" /> : 'Buscar'}
                            </button>
                        </form>

                        {/* Resultados de búsqueda manual */}
                        {searchResults.length > 0 && (
                            <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
                                {searchResults.map(track => (
                                    <div
                                        key={track.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '6px 10px',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.06)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                            {track.album?.images?.[2]?.url && (
                                                <img src={track.album.images[2].url} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                                            )}
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {track.name}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                                    {track.artists?.map(a => a.name).join(', ')}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleAddManualTrack(track)}
                                            style={{
                                                background: 'rgba(29, 185, 84, 0.2)',
                                                color: '#1DB954',
                                                border: '1px solid rgba(29, 185, 84, 0.4)',
                                                borderRadius: '6px',
                                                padding: '4px 10px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
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
                )}

                {/* Lista de Canciones con Drag & Drop */}
                {songQueue.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                        <div style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                        }}>
                            <Music size={26} style={{ opacity: 0.4 }} />
                        </div>
                        <h4 style={{ margin: '0 0 4px', color: '#F8FAFC', fontSize: '1rem', fontWeight: 700 }}>
                            No hay canciones en la lista
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.84rem' }}>
                            Tus espectadores pueden pedir canciones en el chat de Twitch con:
                        </p>
                        <code style={{ display: 'inline-block', marginTop: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '4px 12px', borderRadius: '8px', fontWeight: 700 }}>
                            {songRequestCommand} [nombre o enlace de canción]
                        </code>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {songQueue.map((item, index) => {
                            const isBeingDragged = draggedIndex === index;
                            const isDragOver = dragOverIndex === index;

                            return (
                                <div
                                    key={item.id || index}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    style={{
                                        background: isBeingDragged 
                                            ? 'rgba(56, 189, 248, 0.15)' 
                                            : isDragOver 
                                                ? 'rgba(29, 185, 84, 0.15)' 
                                                : 'rgba(15, 23, 42, 0.75)',
                                        border: isDragOver 
                                            ? '1.5px dashed #1DB954' 
                                            : isBeingDragged 
                                                ? '1.5px dashed #38BDF8' 
                                                : '1px solid rgba(255, 255, 255, 0.07)',
                                        borderRadius: '10px',
                                        padding: '10px 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        cursor: 'grab',
                                        transition: 'all 0.15s ease',
                                        opacity: isBeingDragged ? 0.45 : 1
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                        {/* Tirador Drag & Drop */}
                                        <div 
                                            style={{ color: '#64748B', display: 'flex', alignItems: 'center', cursor: 'grab' }} 
                                            title="Mantén presionado para mover arriba o abajo"
                                        >
                                            <GripVertical size={18} />
                                        </div>

                                        {/* Número de orden */}
                                        <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 800, width: '24px' }}>
                                            #{index + 1}
                                        </span>

                                        {/* Portada o Icono */}
                                        {item.cover_url ? (
                                            <img
                                                src={item.cover_url}
                                                alt=""
                                                style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    flexShrink: 0,
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '8px',
                                                background: 'rgba(29, 185, 84, 0.15)',
                                                color: '#1DB954',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Music size={20} />
                                            </div>
                                        )}

                                        {/* Título & Pedido por */}
                                        <div style={{ overflow: 'hidden' }}>
                                            <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '0.93rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.title}
                                            </h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                                                    Pedida por:
                                                </span>
                                                <span style={{
                                                    background: 'rgba(168, 85, 247, 0.18)',
                                                    color: '#d8b4fe',
                                                    border: '1px solid rgba(168, 85, 247, 0.35)',
                                                    borderRadius: '5px',
                                                    padding: '1px 7px',
                                                    fontSize: '0.74rem',
                                                    fontWeight: 800,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <MessageSquare size={10} />
                                                    @{item.requested_by || 'Viewer'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Acciones: Flechas Arriba/Abajo + Eliminar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveItem(index, -1)}
                                            disabled={index === 0}
                                            title="Mover arriba"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: index === 0 ? '#475569' : '#CBD5E1',
                                                borderRadius: '6px',
                                                padding: '5px',
                                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ArrowUp size={14} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleMoveItem(index, 1)}
                                            disabled={index === songQueue.length - 1}
                                            title="Mover abajo"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: index === songQueue.length - 1 ? '#475569' : '#CBD5E1',
                                                borderRadius: '6px',
                                                padding: '5px',
                                                cursor: index === songQueue.length - 1 ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ArrowDown size={14} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSong(item)}
                                            title="Eliminar de la lista y de la playlist de Spotify"
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.12)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                color: '#EF4444',
                                                borderRadius: '6px',
                                                padding: '5px 8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                marginLeft: '4px'
                                            }}
                                        >
                                            <Trash2 size={13} /> Quitar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ============================================================= */}
            {/* 🛑 MODAL DE CONFIRMACIÓN ELEGANTE */}
            {/* ============================================================= */}
            {confirmModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.78)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.25)',
                        borderRadius: '20px',
                        maxWidth: '460px',
                        width: '100%',
                        padding: '1.8rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                        }}>
                            <Trash2 size={28} />
                        </div>

                        <h3 style={{ margin: '0 0 8px', color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 800 }}>
                            {confirmModal.title}
                        </h3>

                        <p style={{ margin: '0 0 1.6rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                            {confirmModal.message}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={closeConfirm}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#F8FAFC',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                                    closeConfirm();
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                    border: 'none',
                                    color: '#FFF',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    fontWeight: 800,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
                                }}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
