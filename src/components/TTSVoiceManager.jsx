import React, { useState, useEffect, useRef } from 'react';
import { 
    Volume2, VolumeX, Play, Square, Settings, Users, Sparkles, Mic, Trash2, 
    RefreshCw, CheckCircle2, Shield, Lock, Radio, Copy, Check, Info, Sliders, Music, Zap, Search, Filter, Key, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// -------------------------------------------------------------
// CATÁLOGO DE LAS 6 VOCES
// -------------------------------------------------------------
export const DEFAULT_CHARACTERS = [
    {
        id: 'locutor_latino',
        name: 'Locutor de Radio FM (Español Latino)',
        avatar: '📻',
        color: '#10B981',
        category: 'espanol',
        voiceId: 'es_002',
        sampleText: 'Transmitiendo 100% en vivo para toda la comunidad de EvilTokkii en Twitch.',
        description: 'Voz profesional y nítida de radio y televisión latinoamericana.',
        enabled: true
    },
    {
        id: 'mexicano',
        name: 'Locutor Mexicano Divertido',
        avatar: '🌮',
        color: '#F59E0B',
        category: 'espanol',
        voiceId: 'es_mx_002',
        sampleText: '¡Qué onda compadres! Pónganse cómodos que este directo se va a poner muy bueno.',
        description: 'Acento mexicano carismático y alegre.',
        enabled: true
    },
    {
        id: 'joven_latino',
        name: 'Joven Streamer Latino',
        avatar: '🧢',
        color: '#06B6D4',
        category: 'espanol',
        voiceId: 'es_male_m3',
        sampleText: '¡Hola a todos chicos! Dejen su buen follow y disfruten de la partida.',
        description: 'Voz juvenil en español.',
        enabled: true
    },
    {
        id: 'locutora_espanola',
        name: 'Locutora Española',
        avatar: '💃',
        color: '#EA580C',
        category: 'espanol',
        voiceId: 'es_female_f6',
        sampleText: '¡Hola chavales! Mucho ánimo y a disfrutar a tope del directo.',
        description: 'Voz con acento de España.',
        enabled: true
    },
    {
        id: 'trailer',
        name: 'Narrador Trailer de Cine',
        avatar: '🎬',
        color: '#E2E8F0',
        category: 'espanol',
        voiceId: 'en_male_m03_lobby',
        sampleText: 'En un mundo lleno de transmisiones, un creador destaca por encima del resto.',
        description: 'Voz profunda y cinematográfica.',
        enabled: true
    },
    {
        id: 'glorious',
        name: 'Canto Celestial de Victoria',
        avatar: '✨',
        color: '#38BDF8',
        category: 'musical',
        voiceId: 'en_female_ht_f08_glorious',
        sampleText: '¡Victoria gloriosa para todos los seguidores de este gran canal!',
        description: 'Canto coral solemne de victoria épica.',
        enabled: true
    }
];

// -------------------------------------------------------------
// MOTOR DE IA DE SÍNTESIS (AUDIO MP3 BASE64)
// -------------------------------------------------------------
export class TTSSpeechEngine {
    static currentAudio = null;

    static async speakText(text, character, volume = 0.9) {
        if (!text || typeof window === 'undefined') return;

        const cleanText = text.slice(0, 160).trim();
        if (!cleanText) return;

        try {
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }

            const voiceId = character?.voiceId || 'es_002';
            const response = await fetch('https://ottsy.weilbyte.dev/api/generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: cleanText,
                    voice: voiceId
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                const audioUrl = `data:audio/mp3;base64,${result.data}`;
                const audio = new Audio(audioUrl);
                audio.volume = Math.max(0.1, Math.min(1.0, volume));
                this.currentAudio = audio;
                await audio.play();
                return;
            } else {
                throw new Error(result.error || "No data returned");
            }
        } catch (err) {
            console.warn("TTS Generation Error, falling back to Web Speech:", err);
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.volume = volume;
                window.speechSynthesis.speak(utterance);
            }
        }
    }
}

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL: TTS VOICE MANAGER
// -------------------------------------------------------------
export const TTSVoiceManager = ({ supabase, triggerToast }) => {
    const [activeTab, setActiveTab] = useState('characters');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('tts_bot_enabled') !== 'false');
    const [commandTrigger, setCommandTrigger] = useState(() => localStorage.getItem('tts_bot_command') || '!voz');
    const [charLimit, setCharLimit] = useState(() => Number(localStorage.getItem('tts_char_limit')) || 120);
    const [cooldownSec, setCooldownSec] = useState(() => Number(localStorage.getItem('tts_cooldown')) || 10);
    const [volume, setVolume] = useState(() => Number(localStorage.getItem('tts_volume')) || 0.9);
    const [permissions, setPermissions] = useState(() => localStorage.getItem('tts_permission') || 'all');
    const [blacklistWords, setBlacklistWords] = useState(() => localStorage.getItem('tts_blacklist') || '');
    
    // Voz Activa en Uso
    const [activeVoiceId, setActiveVoiceId] = useState(() => localStorage.getItem('tts_active_default_voice_v8') || 'locutor_latino');

    const [characters, setCharacters] = useState(() => {
        const saved = localStorage.getItem('tts_characters_custom_v8');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return DEFAULT_CHARACTERS; }
        }
        return DEFAULT_CHARACTERS;
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('tts_history_log');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    });

    const [testInput, setTestInput] = useState('¡Hola a todos los amigos del stream de EvilTokkii!');
    const [isPlayingSample, setIsPlayingSample] = useState(null);
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Guardar configuraciones
    useEffect(() => {
        localStorage.setItem('tts_bot_enabled', isEnabled);
        localStorage.setItem('tts_bot_command', commandTrigger);
        localStorage.setItem('tts_char_limit', charLimit);
        localStorage.setItem('tts_cooldown', cooldownSec);
        localStorage.setItem('tts_volume', volume);
        localStorage.setItem('tts_permission', permissions);
        localStorage.setItem('tts_blacklist', blacklistWords);
        localStorage.setItem('tts_active_default_voice_v8', activeVoiceId);
        localStorage.setItem('tts_characters_custom_v8', JSON.stringify(characters));
    }, [isEnabled, commandTrigger, charLimit, cooldownSec, volume, permissions, blacklistWords, activeVoiceId, characters]);

    // Guardar historial
    useEffect(() => {
        localStorage.setItem('tts_history_log', JSON.stringify(history.slice(0, 50)));
    }, [history]);

    // Probar reproducción
    const handleTestSample = async (charObj, customText = null) => {
        const textToSpeak = customText || charObj.sampleText || testInput;
        setIsPlayingSample(charObj.id);
        await TTSSpeechEngine.speakText(textToSpeak, charObj, volume);
        setTimeout(() => setIsPlayingSample(null), 2500);
    };

    // Establecer como voz en uso
    const handleSelectVoiceInUse = (charObj) => {
        setActiveVoiceId(charObj.id);
        if (triggerToast) {
            triggerToast(`✨ Ahora usando la voz de "${charObj.name}" como voz activa del chat.`);
        }
    };

    // Copiar URL OBS
    const overlayUrl = window.location.origin + (window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/') + '?overlay=tts_audio';

    const handleCopyOBS = () => {
        navigator.clipboard.writeText(overlayUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
    };

    // Obtener objeto de la voz en uso
    const currentActiveVoice = characters.find(c => c.id === activeVoiceId) || characters[0];

    // Filtrar por búsqueda
    const filteredCharacters = characters.filter(c => {
        return !searchQuery || 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.id.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
            
            {/* ============================================================= */}
            {/* 🔝 SWITCH MAESTRO GLOBAL (SIEMPRE VISIBLE ARRIBA DEL TODO) */}
            {/* ============================================================= */}
            <div style={{
                background: isEnabled 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))' 
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.95))',
                border: isEnabled ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                padding: '1.4rem 1.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: isEnabled ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none',
                marginBottom: '1.5rem',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: isEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: isEnabled ? '#10B981' : '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isEnabled ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none'
                    }}>
                        <Mic size={26} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', fontWeight: 800 }}>
                                Estado del Text to Speech (TTS) en Twitch
                            </h3>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '2px 9px',
                                borderRadius: '12px',
                                background: isEnabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                                color: isEnabled ? '#10B981' : '#EF4444',
                                border: isEnabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
                            }}>
                                {isEnabled ? 'EN DIRECTO' : 'DESACTIVADO'}
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0', color: isEnabled ? '#A7F3D0' : '#FDA4AF', fontSize: '0.85rem' }}>
                            {isEnabled 
                                ? `🟢 Activo: Los espectadores pueden enviar mensajes hablados usando el comando "${commandTrigger} [mensaje]" (Voz: ${currentActiveVoice.name}).` 
                                : '🔴 Desactivado: El bot no reproducirá audios de TTS en el chat de Twitch.'
                            }
                        </p>
                    </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '32px', cursor: 'pointer', flexShrink: 0 }}>
                    <input 
                        type="checkbox" 
                        checked={isEnabled} 
                        onChange={(e) => {
                            setIsEnabled(e.target.checked);
                            if (triggerToast) {
                                triggerToast(e.target.checked ? '🟢 TTS para Twitch ACTIVADO' : '🔴 TTS para Twitch DESACTIVADO');
                            }
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: isEnabled ? '#10B981' : '#334155',
                        transition: '0.3s', borderRadius: '34px',
                        boxShadow: isEnabled ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none'
                    }}>
                        <span style={{
                            position: 'absolute', content: '""', height: '24px', width: '24px',
                            left: isEnabled ? '32px' : '4px', bottom: '4px',
                            backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                        }}></span>
                    </span>
                </label>
            </div>

            {/* 1. NAVEGACIÓN POR PESTAÑAS */}
            <div style={{
                display: 'flex',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '6px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '1.8rem',
                flexWrap: 'wrap'
            }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('characters')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'characters' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                        color: activeTab === 'characters' ? '#FFF' : '#94A3B8',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Sparkles size={18} /> 1. Voces ({characters.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'settings' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                        color: activeTab === 'settings' ? '#FFF' : '#94A3B8',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Settings size={18} /> 2. Ajustes
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'history' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                        color: activeTab === 'history' ? '#FFF' : '#94A3B8',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Volume2 size={18} /> 3. Historial en Vivo ({history.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('obs')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: activeTab === 'obs' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                        color: activeTab === 'obs' ? '#FFF' : '#94A3B8',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Radio size={18} /> 4. Overlay OBS
                </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 1: CATÁLOGO DE LAS 6 VOCES */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'characters' && (
                <div>
                    {/* Cabecera y Buscador */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', fontWeight: 800 }}>
                                Catálogo de Voces de IA ({filteredCharacters.length} disponibles)
                            </h3>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Selecciona la voz que responderá al comando configurado en Ajustes.
                            </p>
                        </div>

                        {/* Buscador */}
                        <div style={{ position: 'relative', width: '260px' }}>
                            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar voz..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px',
                                    padding: '8px 12px 8px 36px',
                                    color: '#FFF',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>
                    </div>

                    {/* Grilla de las 6 Tarjetas */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.2rem'
                    }}>
                        {filteredCharacters.map(char => {
                            const isCurrentlyActive = activeVoiceId === char.id;

                            return (
                                <div 
                                    key={char.id} 
                                    className="card" 
                                    style={{ 
                                        padding: '1.4rem', 
                                        borderLeft: '4px solid ' + char.color,
                                        border: isCurrentlyActive ? '2px solid #10B981' : undefined,
                                        borderLeftWidth: '5px',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: isCurrentlyActive ? '0 0 20px rgba(16, 185, 129, 0.2)' : undefined,
                                        position: 'relative'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                            <div style={{
                                                fontSize: '1.8rem',
                                                width: '45px',
                                                height: '45px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {char.avatar}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 800 }}>
                                                    {char.name}
                                                </h4>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 6px' }}>
                                            {char.description}
                                        </p>

                                        <p style={{ fontSize: '0.82rem', color: '#E2E8F0', fontStyle: 'italic', margin: '0 0 14px', minHeight: '36px' }}>
                                            "{char.sampleText}"
                                        </p>
                                    </div>

                                    {/* 2 Botones: Escuchar y Usar esta voz */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleTestSample(char)}
                                            disabled={isPlayingSample === char.id}
                                            style={{
                                                background: isPlayingSample === char.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                                border: '1px solid ' + (isPlayingSample === char.id ? '#10B981' : 'rgba(255, 255, 255, 0.15)'),
                                                color: isPlayingSample === char.id ? '#10B981' : '#F8FAFC',
                                                borderRadius: '10px',
                                                padding: '9px 8px',
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Play size={13} fill="currentColor" /> {isPlayingSample === char.id ? 'Cargando...' : 'Escuchar'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSelectVoiceInUse(char)}
                                            style={{
                                                background: isCurrentlyActive ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255, 255, 255, 0.05)',
                                                border: isCurrentlyActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
                                                color: isCurrentlyActive ? '#FFF' : '#CBD5E1',
                                                borderRadius: '10px',
                                                padding: '9px 8px',
                                                fontWeight: 800,
                                                fontSize: '0.82rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px',
                                                boxShadow: isCurrentlyActive ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {isCurrentlyActive ? <Check size={14} /> : <Sparkles size={13} />}
                                            {isCurrentlyActive ? 'En Uso' : 'Usar esta voz'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 2: AJUSTES GENERALES */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* TARJETA DE VOZ EN USO ACTUAL */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9))',
                        border: '2px solid #10B981',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.2rem',
                        boxShadow: '0 0 25px rgba(16, 185, 129, 0.2)',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: 'rgba(16, 185, 129, 0.25)',
                                color: '#10B981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
                            }}>
                                {currentActiveVoice.avatar}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#10B981', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        🟢 Voz Activa en Uso para el Chat
                                    </span>
                                </div>
                                <h3 style={{ margin: '2px 0 0', color: '#F8FAFC', fontSize: '1.3rem', fontWeight: 800 }}>
                                    {currentActiveVoice.name}
                                </h3>
                                <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                                    Comando del Chat: <code>{commandTrigger} [mensaje]</code>
                                </p>
                            </div>
                        </div>

                        {/* Mensaje de indicación */}
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Info size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '0.84rem', color: '#E2E8F0', fontWeight: 600 }}>
                                Para cambiar la voz en uso ir a la <strong>Pestaña 1 (Voces)</strong> y presionar <strong>"Usar esta voz"</strong>.
                            </span>
                            <button
                                type="button"
                                onClick={() => setActiveTab('characters')}
                                style={{
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38BDF8',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Ir a Pestaña 1 ➜
                            </button>
                        </div>
                    </div>

                    {/* Formulario de Configuración */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1.2rem'
                    }}>
                        {/* Comando */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                                Comando Principal del Chat
                            </label>
                            <input
                                type="text"
                                value={commandTrigger}
                                onChange={(e) => setCommandTrigger(e.target.value)}
                                placeholder="!voz o !tts"
                                className="gift-input-field"
                                style={{ width: '100%', marginBottom: '8px' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Formato: <strong>{commandTrigger} [mensaje]</strong> (ej: <code>{commandTrigger} hola a todos</code>)
                            </span>
                        </div>

                        {/* Permisos */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                                ¿Quiénes pueden usar el comando?
                            </label>
                            <select
                                value={permissions}
                                onChange={(e) => setPermissions(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    color: '#F8FAFC',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    marginBottom: '8px'
                                }}
                            >
                                <option value="all">👥 Todos los Espectadores</option>
                                <option value="subs">⭐ Solo Suscriptores de Twitch</option>
                                <option value="vips">👑 Solo VIPs y Suscriptores</option>
                                <option value="mods">🛡️ Solo Moderadores y Streamer</option>
                            </select>
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Controla qué rango de espectadores puede activar audios en directo.
                            </span>
                        </div>

                        {/* Límite de Caracteres */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                                Máximo de Caracteres ({charLimit} letras)
                            </label>
                            <input
                                type="range"
                                min="30"
                                max="250"
                                step="10"
                                value={charLimit}
                                onChange={(e) => setCharLimit(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer', marginBottom: '8px' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Mensajes más largos serán truncados automáticamente para no saturar el stream.
                            </span>
                        </div>

                        {/* Cooldown */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                                Cooldown entre Mensajes ({cooldownSec} seg)
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="60"
                                step="1"
                                value={cooldownSec}
                                onChange={(e) => setCooldownSec(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer', marginBottom: '8px' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Tiempo de espera mínimo por usuario antes de poder volver a usar la voz.
                            </span>
                        </div>

                        {/* Volumen */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                                Volumen de Reproducción ({Math.round(volume * 100)}%)
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer', marginBottom: '8px' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Nivel de volumen para el navegador y la fuente de audio en OBS.
                            </span>
                        </div>

                        {/* Censura de Palabras */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                                Palabras Bloqueadas / Censura
                            </label>
                            <input
                                type="text"
                                value={blacklistWords}
                                onChange={(e) => setBlacklistWords(e.target.value)}
                                placeholder="insulto1, insulto2, palabra3..."
                                className="gift-input-field"
                                style={{ width: '100%', marginBottom: '8px' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Separadas por comas. Estas palabras serán censuradas con asteriscos.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 3: HISTORIAL EN VIVO */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'history' && (
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', fontWeight: 800 }}>
                                Historial de Mensajes Hablados en Stream
                            </h3>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Registro en vivo de las peticiones de voz activadas por la comunidad.
                            </p>
                        </div>

                        {history.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setHistory([])}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#EF4444',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Trash2 size={14} /> Limpiar Historial
                            </button>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <Volume2 size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                            <p style={{ margin: 0 }}>Aún no se han enviado mensajes de voz en el chat.</p>
                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                Prueba escribiendo en el chat: <code>{commandTrigger} hola a todos</code>
                            </span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {history.map((item, idx) => (
                                <div 
                                    key={idx}
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.4rem' }}>{item.avatar || '🎙️'}</span>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <strong style={{ color: '#F8FAFC', fontSize: '0.9rem' }}>@{item.user}</strong>
                                                <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 700 }}>
                                                    {item.characterName}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.time}</span>
                                            </div>
                                            <p style={{ margin: '2px 0 0', color: '#CBD5E1', fontSize: '0.85rem' }}>
                                                "{item.text}"
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const charObj = characters.find(c => c.id === item.characterId) || DEFAULT_CHARACTERS[0];
                                            TTSSpeechEngine.speakText(item.text, charObj, volume);
                                        }}
                                        title="Volver a reproducir"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '6px 10px',
                                            color: '#FFF',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Play size={14} fill="#FFF" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 4: OVERLAY OBS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'obs' && (
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Radio size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 800 }}>
                                Overlay de Audio para OBS Studio
                            </h3>
                            <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Agrega esta URL como Fuente de Navegador (Browser Source) en OBS si deseas que el audio salga directo en tu transmisión.
                            </p>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '1.5rem'
                    }}>
                        <code style={{ color: '#10B981', fontSize: '0.88rem', wordBreak: 'break-all' }}>
                            {overlayUrl}
                        </code>
                        <button
                            type="button"
                            onClick={handleCopyOBS}
                            style={{
                                background: copiedUrl ? '#10B981' : 'linear-gradient(135deg, #10B981, #059669)',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0
                            }}
                        >
                            {copiedUrl ? <Check size={16} /> : <Copy size={16} />}
                            {copiedUrl ? '¡Copiado!' : 'Copiar URL'}
                        </button>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '1.2rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <h4 style={{ margin: '0 0 8px', color: '#F8FAFC', fontSize: '0.95rem', fontWeight: 700 }}>
                            📋 Instrucciones para OBS Studio:
                        </h4>
                        <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            <li>En OBS Studio, ve a la sección <strong>Fuentes</strong> y presiona el botón <strong>+</strong>.</li>
                            <li>Selecciona <strong>Navegador (Browser Source)</strong> y ponle de nombre <code>TTS Voces Audio</code>.</li>
                            <li>Pega la URL que copiaste arriba.</li>
                            <li>Marca la casilla: <strong>"Controlar audio a través de OBS"</strong> para regular el volumen desde el mezclador de OBS.</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

// -------------------------------------------------------------
// OVERLAY DE OBS TRANSPARENTE PARA TTS (REPRODUCTOR DE AUDIO)
// -------------------------------------------------------------
export const TTSAudioOBSOverlay = ({ supabase }) => {
    const [lastSpoken, setLastSpoken] = useState(null);

    useEffect(() => {
        if (!supabase) return;

        const channel = supabase.channel('tts_realtime_channel')
            .on('broadcast', { event: 'TTS_PLAY_EVENT' }, ({ payload }) => {
                if (payload && payload.text) {
                    const charObj = DEFAULT_CHARACTERS.find(c => c.id === payload.characterId) || DEFAULT_CHARACTERS[0];
                    setLastSpoken({ text: payload.text, user: payload.user, character: charObj });
                    TTSSpeechEngine.speakText(payload.text, charObj, payload.volume || 0.9);
                    setTimeout(() => setLastSpoken(null), 6000);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'transparent',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '20px',
            pointerEvents: 'none',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <AnimatePresence>
                {lastSpoken && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        style={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '2px solid #10B981',
                            borderRadius: '16px',
                            padding: '12px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: '#FFF',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(16, 185, 129, 0.4)'
                        }}
                    >
                        <span style={{ fontSize: '2rem' }}>{lastSpoken.character.avatar}</span>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.9rem' }}>
                                    @{lastSpoken.user}
                                </span>
                                <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                                    ({lastSpoken.character.name})
                                </span>
                            </div>
                            <div style={{ color: '#F8FAFC', fontSize: '0.95rem', fontWeight: 600, marginTop: '2px' }}>
                                "{lastSpoken.text}"
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TTSVoiceManager;
