import React, { useState, useEffect, useRef } from 'react';
import { 
    Volume2, VolumeX, Play, Square, Settings, Users, Sparkles, Mic, Trash2, 
    RefreshCw, CheckCircle2, Shield, Lock, Radio, Copy, Check, Info, Sliders, Music, Zap, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// -------------------------------------------------------------
// CATÁLOGO MASIVO DE 27 VOCES REALES DE IA (AUDIO MP3)
// -------------------------------------------------------------
export const DEFAULT_CHARACTERS = [
    // --- 🎭 PERSONAJES DE CINE Y FICCIÓN ---
    {
        id: 'ghostface',
        name: 'Ghostface (Scream)',
        alias: ['ghostface', 'scream', 'terror'],
        avatar: '🔪',
        color: '#EF4444',
        category: 'personajes',
        voiceId: 'en_us_ghostface',
        sampleText: 'Hello EvilTokkii... what\'s your favorite scary movie?',
        description: 'Voz real siniestra y oscura de la película Scream.',
        enabled: true
    },
    {
        id: 'stitch',
        name: 'Stitch (Lilo & Stitch)',
        alias: ['stitch', 'alien', 'disney'],
        avatar: '🌺',
        color: '#3B82F6',
        category: 'personajes',
        voiceId: 'en_us_stitch',
        sampleText: 'Ohana means family! Welcome to EvilTokkii stream!',
        description: 'Voz oficial traviesa de Stitch de Disney.',
        enabled: true
    },
    {
        id: 'c3po',
        name: 'C-3PO (Star Wars)',
        alias: ['c3po', 'androide', 'starwars'],
        avatar: '🤖',
        color: '#EAB308',
        category: 'personajes',
        voiceId: 'en_us_c3po',
        sampleText: 'Oh dear! Protocol dictates that you follow EvilTokkii on Twitch.',
        description: 'Voz oficial robótica británica de C-3PO.',
        enabled: true
    },
    {
        id: 'chewbacca',
        name: 'Chewbacca (Star Wars)',
        alias: ['chewbacca', 'chewie', 'wookie'],
        avatar: '🦍',
        color: '#A16207',
        category: 'personajes',
        voiceId: 'en_us_chewbacca',
        sampleText: 'Aaarrrgh ggggrrr rrrwaa EvilTokkii!',
        description: 'Sonidos y rugidos reales de Chewbacca.',
        enabled: true
    },
    {
        id: 'stormtrooper',
        name: 'Stormtrooper Imperial',
        alias: ['stormtrooper', 'soldado', 'imperio'],
        avatar: '🪖',
        color: '#94A3B8',
        category: 'personajes',
        voiceId: 'en_us_stormtrooper',
        sampleText: 'Stop right there! Move along to the live stream.',
        description: 'Voz de casco de soldado imperial de Star Wars.',
        enabled: true
    },
    {
        id: 'rocket',
        name: 'Rocket Raccoon (Marvel)',
        alias: ['rocket', 'mapache', 'marvel'],
        avatar: '🦝',
        color: '#F97316',
        category: 'personajes',
        voiceId: 'en_us_rocket',
        sampleText: 'Ain\'t no thing like me except me! Let\'s blast off this stream.',
        description: 'Voz oficial de Rocket de Guardianes de la Galaxia.',
        enabled: true
    },
    {
        id: 'grinch',
        name: 'El Grinch',
        alias: ['grinch', 'navidad', 'verde'],
        avatar: '🎄',
        color: '#84CC16',
        category: 'personajes',
        voiceId: 'en_male_grinch',
        sampleText: 'I hate Christmas! But I love watching EvilTokkii stream!',
        description: 'Voz real maliciosa y cómica del Grinch.',
        enabled: true
    },
    {
        id: 'pirata',
        name: 'Capitán Pirata',
        alias: ['pirata', 'barbanegra', 'corsario'],
        avatar: '🏴‍☠️',
        color: '#475569',
        category: 'personajes',
        voiceId: 'en_male_pirate',
        sampleText: 'Ahoy matey! Drop your anchor and enjoy the stream!',
        description: 'Voz ronca y ruda de capitán pirata.',
        enabled: true
    },
    {
        id: 'santa',
        name: 'Santa Claus / Papá Noel',
        avatar: '🎅',
        alias: ['santa', 'noel', 'claus', 'navidad'],
        color: '#DC2626',
        category: 'personajes',
        voiceId: 'en_male_santa',
        sampleText: 'Ho ho ho! Merry Christmas to EvilTokkii and the entire chat!',
        description: 'Voz alegre y navideña de Santa Claus.',
        enabled: true
    },
    {
        id: 'wizard',
        name: 'Mago Épico / Hechicero',
        avatar: '🧙‍♂️',
        alias: ['mago', 'wizard', 'gandalf', 'magia'],
        color: '#8B5CF6',
        category: 'personajes',
        voiceId: 'en_male_wizard',
        sampleText: 'By the ancient spells of wisdom, I bless this live stream.',
        description: 'Voz mística y venerable de archimago.',
        enabled: true
    },
    {
        id: 'grandma',
        name: 'Abuelita Tierna',
        avatar: '👵',
        alias: ['abuela', 'abuelita', 'grandma'],
        color: '#F472B6',
        category: 'personajes',
        voiceId: 'en_female_grandma',
        sampleText: 'Oh sweetheart, remember to drink water and enjoy the stream.',
        description: 'Voz dulce y cariñosa de abuela.',
        enabled: true
    },

    // --- 🎵 VOCES MUSICALES Y CANTADAS ---
    {
        id: 'opera',
        name: 'Cantante de Ópera / Disney',
        alias: ['opera', 'canto', 'cantante', 'musical'],
        avatar: '🎵',
        color: '#EC4899',
        category: 'musical',
        voiceId: 'en_female_f08_salut_damour',
        sampleText: 'Welcome to the magnificent stream of EvilTokkii!',
        description: '¡Canta cualquier mensaje que escribas con melodía lírica!',
        enabled: true
    },
    {
        id: 'warmy_pop',
        name: 'Cantante Pop / Melódica',
        alias: ['pop', 'melodia', 'cancion', 'melodica'],
        avatar: '🎤',
        color: '#D946EF',
        category: 'musical',
        voiceId: 'en_female_f08_warmy_breeze',
        sampleText: 'Singing with you all night long on Twitch!',
        description: 'Canta el texto con estilo de música pop alegre.',
        enabled: true
    },
    {
        id: 'glorious',
        name: 'Voz Épica Celestial',
        alias: ['gloria', 'celestial', 'epica', 'himno'],
        avatar: '✨',
        color: '#38BDF8',
        category: 'musical',
        voiceId: 'en_female_ht_f08_glorious',
        sampleText: 'Glorious victory to all followers in this stream!',
        description: 'Canto coral y solemne de victoria.',
        enabled: true
    },

    // --- 🎬 NARRADORES Y LOCUTORES ---
    {
        id: 'trailer',
        name: 'Narrador Trailer de Cine',
        alias: ['trailer', 'cine', 'narrador', 'pelicula'],
        avatar: '🎬',
        color: '#E2E8F0',
        category: 'narradores',
        voiceId: 'en_male_m03_lobby',
        sampleText: 'In a world full of streams, one creator stands above the rest.',
        description: 'Voz profunda de trailer de cine de acción.',
        enabled: true
    },
    {
        id: 'documental',
        name: 'Narrador de Documentales',
        alias: ['documental', 'historia', 'profundo'],
        avatar: '🎙️',
        color: '#CBD5E1',
        category: 'narradores',
        voiceId: 'en_male_narration',
        sampleText: 'Here we observe a legendary streamer in their natural habitat.',
        description: 'Voz solemne y calmada de documental.',
        enabled: true
    },
    {
        id: 'comico',
        name: 'Locutor Cómico / Caricatura',
        alias: ['comico', 'caricatura', 'chiste', 'payaso'],
        avatar: '🤡',
        color: '#FBBF24',
        category: 'narradores',
        voiceId: 'en_male_funny',
        sampleText: 'Ha ha! Look who just arrived at the party! Welcome!',
        description: 'Tono cómico y animado de dibujos animados.',
        enabled: true
    },

    // --- 🌍 ESPAÑOL E IDIOMAS INTERNACIONALES ---
    {
        id: 'latino',
        name: 'Locutor de Radio Latino',
        alias: ['latino', 'radio', 'locutor', 'espanol', 'español'],
        avatar: '📻',
        color: '#10B981',
        category: 'idiomas',
        voiceId: 'es_002',
        sampleText: '¡Transmitiendo en vivo para toda la comunidad de EvilTokkii en Twitch!',
        description: 'Voz profesional de locutor de radio en español latino.',
        enabled: true
    },
    {
        id: 'mexicano',
        name: 'Mexicano Clásico',
        alias: ['mexicano', 'mexico', 'mx', 'compadre'],
        avatar: '🌮',
        color: '#F59E0B',
        category: 'idiomas',
        voiceId: 'es_mx_002',
        sampleText: '¡Qué onda compadre! Pónganse cómodos para el stream.',
        description: 'Voz alegre con acento mexicano clásico.',
        enabled: true
    },
    {
        id: 'joven_latino',
        name: 'Joven Latino',
        alias: ['joven', 'chico', 'latino2'],
        avatar: '🧢',
        color: '#06B6D4',
        category: 'idiomas',
        voiceId: 'es_male_m3',
        sampleText: '¡Hola a todos chicos! Qué buen directo estamos teniendo hoy.',
        description: 'Voz juvenil en español.',
        enabled: true
    },
    {
        id: 'espanola',
        name: 'Locutora Española',
        alias: ['espanola', 'espana', 'espanya'],
        avatar: '💃',
        color: '#EA580C',
        category: 'idiomas',
        voiceId: 'es_female_f6',
        sampleText: '¡Hola chavales! Mucho ánimo y a disfrutar del stream.',
        description: 'Voz femenina con acento de España.',
        enabled: true
    },
    {
        id: 'britanico',
        name: 'Lord Británico Elegante',
        alias: ['britanico', 'lord', 'ingles', 'elegante'],
        avatar: '🎩',
        color: '#6366F1',
        category: 'idiomas',
        voiceId: 'en_uk_001',
        sampleText: 'Splendid evening to you, distinguished viewers of EvilTokkii.',
        description: 'Acento aristocrático británico elegante.',
        enabled: true
    },
    {
        id: 'frances',
        name: 'Francés Romántico',
        alias: ['frances', 'paris', 'romantico'],
        avatar: '🥖',
        color: '#F43F5E',
        category: 'idiomas',
        voiceId: 'fr_001',
        sampleText: 'Bonjour mon ami! Bienvenue sur le stream de EvilTokkii.',
        description: 'Voz en francés elegante y suave.',
        enabled: true
    },
    {
        id: 'aleman',
        name: 'Alemán Potente',
        alias: ['aleman', 'deutsch', 'berlin'],
        avatar: '🍺',
        color: '#E11D48',
        category: 'idiomas',
        voiceId: 'de_001',
        sampleText: 'Guten Tag! Willkommen zum fantastischen EvilTokkii Stream.',
        description: 'Voz contundente y clara en alemán.',
        enabled: true
    },
    {
        id: 'shonen_anime',
        name: 'Shonen Anime Japonés',
        alias: ['shonen', 'anime', 'japones', 'goku', 'naruto'],
        avatar: '⚡',
        color: '#FB923C',
        category: 'idiomas',
        voiceId: 'jp_001',
        sampleText: 'Konnichiwa! EvilTokkii no haishin e yokoso! Ikuzo!',
        description: 'Voz enérgica de protagonista de anime shonen.',
        enabled: true
    },
    {
        id: 'kawaii_vtuber',
        name: 'VTuber Kawaii Japonesa',
        alias: ['kawaii', 'vtuber', 'waifu', 'japonesa'],
        avatar: '🌸',
        color: '#F472B6',
        category: 'idiomas',
        voiceId: 'jp_006',
        sampleText: 'Mina-san konnichiwa! EvilTokkii daisuki!',
        description: 'Voz tierna y dulce de VTuber japonesa.',
        enabled: true
    },
    {
        id: 'brasil',
        name: 'Brasileño Carioca',
        alias: ['brasil', 'portugues', 'samba'],
        avatar: '🏖️',
        color: '#10B981',
        category: 'idiomas',
        voiceId: 'br_005',
        sampleText: 'Fala galera! Bem-vindos à live do EvilTokkii!',
        description: 'Voz alegre y rítmica en portugués de Brasil.',
        enabled: true
    }
];

// -------------------------------------------------------------
// MOTOR DE IA DE SÍNTESIS DE VOCES REALES (AUDIO MP3 BASE64)
// -------------------------------------------------------------
export class TTSSpeechEngine {
    static currentAudio = null;

    static async speakText(text, character, volume = 0.9) {
        if (!text || typeof window === 'undefined') return;

        const voiceId = character?.voiceId || 'es_002';
        const cleanText = text.slice(0, 150).trim();
        if (!cleanText) return;

        try {
            // Detener audio anterior si está sonando
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }

            // Llamada al servidor de generación de audio por IA
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
                // Reproducir el audio MP3 real de la voz del personaje
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
            
            // Fallback en caso de corte de red
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
export const TTSVoiceManager = ({ supabase }) => {
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'characters' | 'history' | 'obs'
    const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'personajes' | 'musical' | 'narradores' | 'idiomas'
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('tts_bot_enabled') !== 'false');
    const [commandTrigger, setCommandTrigger] = useState(() => localStorage.getItem('tts_bot_command') || '!voz');
    const [charLimit, setCharLimit] = useState(() => Number(localStorage.getItem('tts_char_limit')) || 120);
    const [cooldownSec, setCooldownSec] = useState(() => Number(localStorage.getItem('tts_cooldown')) || 10);
    const [volume, setVolume] = useState(() => Number(localStorage.getItem('tts_volume')) || 0.9);
    const [permissions, setPermissions] = useState(() => localStorage.getItem('tts_permission') || 'all');
    const [blacklistWords, setBlacklistWords] = useState(() => localStorage.getItem('tts_blacklist') || '');

    const [characters, setCharacters] = useState(() => {
        const saved = localStorage.getItem('tts_characters_custom_v3');
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

    const [testInput, setTestInput] = useState('¡Hola a todos en el stream de EvilTokkii!');
    const [selectedTestChar, setSelectedTestChar] = useState(DEFAULT_CHARACTERS[0].id);
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
        localStorage.setItem('tts_characters_custom_v3', JSON.stringify(characters));
    }, [isEnabled, commandTrigger, charLimit, cooldownSec, volume, permissions, blacklistWords, characters]);

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

    // Toggle de personaje
    const handleToggleCharacter = (charId) => {
        setCharacters(prev => prev.map(c => c.id === charId ? { ...c, enabled: !c.enabled } : c));
    };

    // Copiar URL OBS
    const overlayUrl = window.location.origin + (window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/') + '?overlay=tts_audio';

    const handleCopyOBS = () => {
        navigator.clipboard.writeText(overlayUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
    };

    // Filtrar catálogo por categoría y búsqueda
    const filteredCharacters = characters.filter(c => {
        const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
        const matchesSearch = !searchQuery || 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.alias && c.alias.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
            
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
                    <Settings size={18} /> 1. Ajustes y Comando
                </button>

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
                    <Sparkles size={18} /> 2. Voces de Personajes ({characters.filter(c => c.enabled).length})
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
            {/* PESTAÑA 1: AJUSTES GENERALES DEL COMANDO */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Switch Maestro */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: isEnabled ? '2px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        boxShadow: isEnabled ? '0 0 25px rgba(16, 185, 129, 0.15)' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '14px',
                                background: isEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isEnabled ? '#10B981' : '#EF4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Mic size={26} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.15rem', fontWeight: 800 }}>
                                    Estado del Text to Speech (TTS) en Twitch
                                </h3>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {isEnabled ? '🟢 Activo: Los espectadores pueden enviar mensajes hablados usando el comando en el chat.' : '🔴 Desactivado: El bot no reproducirá audios de TTS en el chat.'}
                                </p>
                            </div>
                        </div>

                        <label style={{ position: 'relative', display: 'inline-block', width: '56px', height: '30px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={isEnabled} 
                                onChange={(e) => setIsEnabled(e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: isEnabled ? '#10B981' : '#334155',
                                transition: '0.3s', borderRadius: '34px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '22px', width: '22px',
                                    left: isEnabled ? '30px' : '4px', bottom: '4px',
                                    backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
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
                                Formato: <strong>{commandTrigger} [personaje] [mensaje]</strong> (ej: <code>{commandTrigger} stitch hola chat</code>)
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

                    {/* Probar Síntesis en Vivo */}
                    <div className="card" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <h4 style={{ margin: '0 0 10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800 }}>
                            <Zap size={18} /> Probar Voz de Personaje por IA en Vivo
                        </h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select
                                value={selectedTestChar}
                                onChange={(e) => setSelectedTestChar(e.target.value)}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    color: '#FFF',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    maxWidth: '280px'
                                }}
                            >
                                {characters.map(c => (
                                    <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={testInput}
                                onChange={(e) => setTestInput(e.target.value)}
                                placeholder="Escribe un mensaje de prueba..."
                                className="gift-input-field"
                                style={{ flex: 1, marginBottom: 0 }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const charObj = characters.find(c => c.id === selectedTestChar);
                                    if (charObj) handleTestSample(charObj, testInput);
                                }}
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
                                <Play size={16} fill="#FFF" /> Escuchar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PESTAÑA 2: CATÁLOGO DE PERSONAJES */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'characters' && (
                <div>
                    {/* Cabecera y Filtros de Categorías */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', fontWeight: 800 }}>
                                Catálogo Masivo de Voces de IA ({filteredCharacters.length} disponibles)
                            </h3>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Voces oficiales de cine, Disney, Star Wars, canciones melódicas y locutores internacionales.
                            </p>
                        </div>

                        {/* Buscador */}
                        <div style={{ position: 'relative', width: '260px' }}>
                            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar voz o personaje..."
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

                    {/* Filtros de Categoría */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid ' + (selectedCategory === 'all' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'),
                                background: selectedCategory === 'all' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedCategory === 'all' ? '#10B981' : '#94A3B8',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                            }}
                        >
                            🌐 Todas ({characters.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedCategory('personajes')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid ' + (selectedCategory === 'personajes' ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'),
                                background: selectedCategory === 'personajes' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedCategory === 'personajes' ? '#3B82F6' : '#94A3B8',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                            }}
                        >
                            🎭 Personajes & Ficción ({characters.filter(c => c.category === 'personajes').length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedCategory('musical')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid ' + (selectedCategory === 'musical' ? '#EC4899' : 'rgba(255, 255, 255, 0.1)'),
                                background: selectedCategory === 'musical' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedCategory === 'musical' ? '#EC4899' : '#94A3B8',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                            }}
                        >
                            🎵 Voces Cantadas / Melódicas ({characters.filter(c => c.category === 'musical').length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedCategory('narradores')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid ' + (selectedCategory === 'narradores' ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)'),
                                background: selectedCategory === 'narradores' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedCategory === 'narradores' ? '#F59E0B' : '#94A3B8',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                            }}
                        >
                            🎬 Narradores de Cine ({characters.filter(c => c.category === 'narradores').length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedCategory('idiomas')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid ' + (selectedCategory === 'idiomas' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'),
                                background: selectedCategory === 'idiomas' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedCategory === 'idiomas' ? '#10B981' : '#94A3B8',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                            }}
                        >
                            🌍 Español & Internacionales ({characters.filter(c => c.category === 'idiomas').length})
                        </button>
                    </div>

                    {/* Grilla de Tarjetas */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.2rem'
                    }}>
                        {filteredCharacters.map(char => (
                            <div 
                                key={char.id} 
                                className="card" 
                                style={{ 
                                    padding: '1.3rem', 
                                    borderLeft: '4px solid ' + char.color,
                                    opacity: char.enabled ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                                <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '1rem', fontWeight: 800 }}>
                                                    {char.name}
                                                </h4>
                                                <span style={{ fontSize: '0.75rem', color: char.color, fontWeight: 700 }}>
                                                    Comando: {commandTrigger} {char.id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Toggle Activar Personaje */}
                                        <input
                                            type="checkbox"
                                            checked={char.enabled}
                                            onChange={() => handleToggleCharacter(char.id)}
                                            title={char.enabled ? "Desactivar personaje" : "Activar personaje"}
                                            style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
                                        />
                                    </div>

                                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 6px' }}>
                                        {char.description}
                                    </p>

                                    <p style={{ fontSize: '0.82rem', color: '#E2E8F0', fontStyle: 'italic', margin: '0 0 14px', minHeight: '36px' }}>
                                        "{char.sampleText}"
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleTestSample(char)}
                                    disabled={isPlayingSample === char.id}
                                    style={{
                                        width: '100%',
                                        background: isPlayingSample === char.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid ' + (isPlayingSample === char.id ? '#10B981' : 'rgba(255, 255, 255, 0.15)'),
                                        color: isPlayingSample === char.id ? '#10B981' : '#F8FAFC',
                                        borderRadius: '10px',
                                        padding: '8px',
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Play size={14} fill="currentColor" /> {isPlayingSample === char.id ? 'Generando audio MP3...' : '▶️ Escuchar Voz Real'}
                                </button>
                            </div>
                        ))}
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
                                Prueba escribiendo en el chat: <code>{commandTrigger} stitch hola a todos</code>
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
