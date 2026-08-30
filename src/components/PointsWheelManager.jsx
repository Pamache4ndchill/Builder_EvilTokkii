// -------------------------------------------------------------
// SINTETIZADOR DE EFECTOS DE SONIDO NATIVO (Web Audio API)
// -------------------------------------------------------------
class WheelSoundEffects {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playCountdownBeep(isFinal = false) {
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const now = this.ctx.currentTime;
            osc.type = isFinal ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.4 : 0.2));

            osc.start(now);
            osc.stop(now + (isFinal ? 0.4 : 0.2));
        } catch (e) {}
    }

    playTick() {
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const now = this.ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600 + Math.random() * 150, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {}
    }

    playWinFanfare() {
        try {
            this.init();
            if (!this.ctx) return;
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);

                const now = this.ctx.currentTime + idx * 0.12;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

                osc.start(now);
                osc.stop(now + 0.5);
            });
        } catch (e) {}
    }
}

const wheelAudio = new WheelSoundEffects();

import React, { useState, useEffect, useRef } from 'react';
import { 
    Disc, Sparkles, Plus, Trash2, Edit2, Play, Copy, CheckCircle2, 
    Settings, Volume2, VolumeX, Eye, Radio, ExternalLink, HelpCircle, 
    RefreshCw, Award, Palette, Type, Clock, Layout, RotateCcw, History, Check, X, Search
} from 'lucide-react';

const DEFAULT_SECTORS = [
    { id: '1', label: '🎉 +500 Puntos', color: '#10B981', probability: 20 },
    { id: '2', label: '👑 Saludo VIP', color: '#38BDF8', probability: 15 },
    { id: '3', label: '🔥 Reto en Directo', color: '#EC4899', probability: 15 },
    { id: '4', label: '💀 Castigo Divertido', color: '#EF4444', probability: 10 },
    { id: '5', label: '🎵 Elige Canción', color: '#F59E0B', probability: 20 },
    { id: '6', label: '🍀 Doble o Nada', color: '#8B5CF6', probability: 10 },
    { id: '7', label: '💎 +2000 Puntos (JACKPOT)', color: '#F43F5E', probability: 10 }
];

const DEFAULT_VISUAL_CONFIG = {
    // Marco y Ruleta
    borderColor: '#EC4899',
    containerBg: '#0F172A',
    centerColor: '#EC4899',
    pointerColor: '#EF4444',
    // Cabecera
    headerBadgeText: '🎡 Ruleta de la Suerte (Puntos)',
    headerBadgeBg: '#EC4899',
    headerBadgeTextColor: '#000000',
    titleTemplate: '¡@{user} está probando suerte!',
    titleColor: '#F8FAFC',
    // Contador 3, 2, 1
    countdownBorderColor: '#EC4899',
    countdownTextColor: '#EC4899',
    countdownFinalText: '¡GIRANDO!',
    countdownSubtext: 'PREPARANDO...',
    countdownSubtextColor: '#94A3B8',
    // Tarjeta Ganador
    winnerBorderColor: '#10B981',
    winnerTitleText: '🎉 ¡PREMIO GANADO! 🎉',
    winnerTitleColor: '#10B981',
    winnerPrizeTextColor: '#FFFFFF',
    winnerSubtitleTemplate: '¡Felicidades @{user}! 🥳✨',
    winnerSubtitleColor: '#EC4899',
    winnerDurationSeconds: 5
};

export default function PointsWheelManager({ 
    supabase, 
    triggerToast, 
    enviarMensajeTwitch, 
    isBotConnected 
}) {
    const [activeTab, setActiveTab] = useState('premios'); // 'premios' | 'editor_visual' | 'ajustes'

    // Configuración de Sectores / Premios
    const [sectors, setSectors] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_points_wheel_sectors');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return DEFAULT_SECTORS;
    });

    // Configuración Visual del Overlay OBS
    const [visualConfig, setVisualConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_points_wheel_visual_config');
            if (saved) return { ...DEFAULT_VISUAL_CONFIG, ...JSON.parse(saved) };
        } catch (e) {}
        return DEFAULT_VISUAL_CONFIG;
    });

    // Historial de Ganadores
    const [winnersHistory, setWinnersHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_points_wheel_history');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [];
    });
    const [historyFilter, setHistoryFilter] = useState('todos'); // 'todos' | 'pendientes' | 'entregados'
    const [historySearch, setHistorySearch] = useState('');

    // Recompensa vinculada y plantilla del chat
    const [rewardName, setRewardName] = useState(() => localStorage.getItem('twitch_points_wheel_reward_name') || 'Girar Ruleta');
    const [announceInChat, setAnnounceInChat] = useState(() => localStorage.getItem('twitch_points_wheel_chat_announce') !== 'false');
    const [chatMessageTemplate, setChatMessageTemplate] = useState(() => localStorage.getItem('twitch_points_wheel_chat_template') || '🎉 ¡@{user} ha canjeado sus puntos en la Ruleta y ha ganado: {prize}! 🥳🎡');
    const [wheelDuration, setWheelDuration] = useState(() => Number(localStorage.getItem('twitch_points_wheel_duration')) || 6);

    // Modal de Edición de Sector
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSector, setEditingSector] = useState(null);
    const [sectorLabel, setSectorLabel] = useState('');
    const [sectorColor, setSectorColor] = useState('#10B981');
    const [sectorProb, setSectorProb] = useState(15);

    // Test Simulator
    const [testViewer, setTestViewer] = useState('ViewerTokkii');
    const [isSpinning, setIsSpinning] = useState(false);
    const [countdownNum, setCountdownNum] = useState(null);
    const [lastWinner, setLastWinner] = useState(null);
    const [copiedOverlayUrl, setCopiedOverlayUrl] = useState(false);
    const [previewVisualElement, setPreviewVisualElement] = useState('wheel'); // 'wheel' | 'countdown' | 'winner'

    // Canvas de la Ruleta
    const canvasRef = useRef(null);
    const rotationRef = useRef(0);
    const broadcastChannelRef = useRef(null);
    const realtimeChannelRef = useRef(null);

    // Cargar Historial desde Supabase y configurar Canales en Tiempo Real
    useEffect(() => {
        const fetchSupabaseHistory = async () => {
            if (!supabase) return;
            try {
                const { data, error } = await supabase
                    .from('points_wheel_history')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (!error && Array.isArray(data)) {
                    const formatted = data.map(item => ({
                        id: String(item.id),
                        viewer: item.viewer,
                        prize: item.prize,
                        color: item.color,
                        date: new Date(item.created_at || Date.now()).toLocaleString('es-ES', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        }),
                        status: item.status || 'pendiente'
                    }));
                    setWinnersHistory(formatted);
                    localStorage.setItem('twitch_points_wheel_history', JSON.stringify(formatted));
                }
            } catch (err) {
                console.warn("Supabase points_wheel_history load error:", err);
            }
        };

        fetchSupabaseHistory();

        try {
            broadcastChannelRef.current = new BroadcastChannel('tokkii_points_wheel_channel');
        } catch (e) {}

        if (supabase) {
            realtimeChannelRef.current = supabase.channel('points_wheel_realtime', {
                config: { broadcast: { self: true } }
            });
            realtimeChannelRef.current.subscribe();
        }

        return () => {
            if (broadcastChannelRef.current) broadcastChannelRef.current.close();
            if (realtimeChannelRef.current && supabase) supabase.removeChannel(realtimeChannelRef.current);
        };
    }, [supabase]);

    // Guardar cambios en localStorage y broadcast
    useEffect(() => {
        localStorage.setItem('twitch_points_wheel_sectors', JSON.stringify(sectors));
        localStorage.setItem('twitch_points_wheel_visual_config', JSON.stringify(visualConfig));
        localStorage.setItem('twitch_points_wheel_reward_name', rewardName);
        localStorage.setItem('twitch_points_wheel_chat_announce', announceInChat ? 'true' : 'false');
        localStorage.setItem('twitch_points_wheel_chat_template', chatMessageTemplate);
        localStorage.setItem('twitch_points_wheel_history', JSON.stringify(winnersHistory));
        localStorage.setItem('twitch_points_wheel_duration', String(wheelDuration));

        // Enviar actualización visual al Overlay de OBS en vivo
        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
                action: 'POINTS_WHEEL_CONFIG_UPDATE',
                visualConfig: visualConfig,
                sectors: sectors
            });
        }
        drawWheel(rotationRef.current);
    }, [sectors, visualConfig, winnersHistory, rewardName, announceInChat, chatMessageTemplate, wheelDuration]);

    // Dibujar Ruleta en Canvas
    const drawWheel = (currentAngle = 0) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 15;

        ctx.clearRect(0, 0, width, height);

        if (sectors.length === 0) return;

        const totalSectors = sectors.length;
        const arcSize = (2 * Math.PI) / totalSectors;

        // Dibujar sectores
        sectors.forEach((sector, i) => {
            const angle = currentAngle + i * arcSize;
            ctx.beginPath();
            ctx.fillStyle = sector.color || '#38BDF8';
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
            ctx.lineTo(centerX, centerY);
            ctx.fill();

            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Texto del sector
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(sector.label, radius - 15, 5);
            ctx.restore();
        });

        // Círculo central personalizable
        ctx.beginPath();
        ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
        ctx.strokeStyle = visualConfig.centerColor || '#EC4899';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = visualConfig.centerColor || '#EC4899';
        ctx.fill();

        // Flecha / Puntero arriba
        ctx.beginPath();
        ctx.fillStyle = visualConfig.pointerColor || '#EF4444';
        ctx.moveTo(centerX - 12, 10);
        ctx.lineTo(centerX + 12, 10);
        ctx.lineTo(centerX, 28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    useEffect(() => {
        drawWheel(0);
    }, [sectors, visualConfig]);

    // Simular Giro de la Ruleta
    const handleSpin = async (viewerName = testViewer) => {
        if (isSpinning || countdownNum !== null || sectors.length === 0) return;
        setLastWinner(null);

        const totalSectors = sectors.length;
        const arcSize = (2 * Math.PI) / totalSectors;

        const winningIndex = Math.floor(Math.random() * totalSectors);
        const winningSector = sectors[winningIndex];

        // Emitir a OBS Studio
        const payload = {
            action: 'POINTS_WHEEL_SPIN',
            viewer: viewerName,
            prize: winningSector.label,
            color: winningSector.color,
            winningIndex: winningIndex,
            sectors: sectors,
            visualConfig: visualConfig,
            duration: wheelDuration,
            timestamp: Date.now()
        };

        if (realtimeChannelRef.current) {
            try {
                realtimeChannelRef.current.send({
                    type: 'broadcast',
                    event: 'SPIN_EVENT',
                    payload: payload
                });
            } catch (e) {}
        }

        if (broadcastChannelRef.current) {
            try {
                broadcastChannelRef.current.postMessage(payload);
            } catch (e) {}
        }

        localStorage.setItem('twitch_points_wheel_last_spin', JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('POINTS_WHEEL_EVENT', { detail: payload }));

        // Conteo 3, 2, 1 en el Builder
        setCountdownNum(3);
        wheelAudio.playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
        setCountdownNum(2);
        wheelAudio.playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
        setCountdownNum(1);
        wheelAudio.playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
        setCountdownNum(visualConfig.countdownFinalText || '¡GIRANDO!');
        wheelAudio.playCountdownBeep(true);
        await new Promise(r => setTimeout(r, 600));
        setCountdownNum(null);

        // Giro
        setIsSpinning(true);

        const targetSectorCenter = winningIndex * arcSize + arcSize / 2;
        const targetAngleNormalized = (3 * Math.PI / 2 - targetSectorCenter + 2 * Math.PI) % (2 * Math.PI);

        const startAngle = rotationRef.current;
        const startAngleNormalized = (startAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

        let deltaAngle = targetAngleNormalized - startAngleNormalized;
        if (deltaAngle < 0) deltaAngle += 2 * Math.PI;

        const extraRotations = 6;
        const totalRotation = extraRotations * 2 * Math.PI + deltaAngle;

        const durationMs = wheelDuration * 1000;
        const startTime = performance.now();
        let lastTickAngle = startAngle;
        const tickStep = (2 * Math.PI) / totalSectors;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentAngle = startAngle + totalRotation * easeOut;

            if (Math.abs(currentAngle - lastTickAngle) >= tickStep) {
                wheelAudio.playTick();
                lastTickAngle = currentAngle;
            }

            rotationRef.current = currentAngle;
            drawWheel(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                wheelAudio.playWinFanfare();

                const finalNorm = (rotationRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
                const pointerAngle = (3 * Math.PI / 2 - finalNorm + 2 * Math.PI) % (2 * Math.PI);
                const exactIndex = Math.floor(pointerAngle / arcSize) % totalSectors;
                const exactSector = sectors[exactIndex] || winningSector;

                const timestampId = String(Date.now());
                const newWinnerEntry = {
                    id: timestampId,
                    viewer: viewerName,
                    prize: exactSector.label,
                    color: exactSector.color,
                    date: new Date().toLocaleString('es-ES', { 
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                    }),
                    status: 'pendiente'
                };

                setLastWinner(newWinnerEntry);
                setWinnersHistory(prev => [newWinnerEntry, ...prev]);

                // Guardar en Supabase
                if (supabase) {
                    supabase.from('points_wheel_history').insert([{
                        viewer: viewerName,
                        prize: exactSector.label,
                        color: exactSector.color,
                        status: 'pendiente',
                        created_at: new Date().toISOString()
                    }]).then(({ error }) => {
                        if (error) console.warn("Error saving winner to Supabase:", error);
                    }).catch(e => console.warn("Supabase insert catch:", e));
                }

                if (announceInChat && isBotConnected && enviarMensajeTwitch) {
                    const template = chatMessageTemplate || '🎉 ¡@{user} ha canjeado sus puntos en la Ruleta y ha ganado: {prize}! 🥳🎡';
                    const chatMsg = template
                        .replace(/@{user}|{user}/gi, `@${viewerName}`)
                        .replace(/{prize}|{premio}/gi, exactSector.label);
                    enviarMensajeTwitch(chatMsg);
                }

                triggerToast(`🎉 ¡${viewerName} ha ganado: ${exactSector.label}!`);
            }
        };

        requestAnimationFrame(animate);
    };

    
    const handleToggleStatus = async (id) => {
        let updatedStatus = 'pendiente';
        setWinnersHistory(prev => prev.map(item => {
            if (item.id === id) {
                updatedStatus = item.status === 'entregado' ? 'pendiente' : 'entregado';
                return { ...item, status: updatedStatus };
            }
            return item;
        }));

        triggerToast(updatedStatus === 'entregado' ? '✅ Premio marcado como Entregado' : '⏳ Premio marcado como Pendiente');

        if (supabase) {
            try {
                await supabase.from('points_wheel_history').update({ status: updatedStatus }).eq('id', id);
            } catch (e) {}
        }
    };

    const handleDeleteHistoryItem = async (id) => {
        setWinnersHistory(prev => prev.filter(item => item.id !== id));
        triggerToast('🗑️ Registro eliminado del historial');

        if (supabase) {
            try {
                await supabase.from('points_wheel_history').delete().eq('id', id);
            } catch (e) {}
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('¿Seguro que deseas vaciar todo el historial de ganadores de Supabase y local?')) {
            setWinnersHistory([]);
            triggerToast('🗑️ Historial de ganadores vaciado');

            if (supabase) {
                try {
                    await supabase.from('points_wheel_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                } catch (e) {}
            }
        }
    };

    const handleUpdateVisual = (key, value) => {
        setVisualConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleResetVisualDefaults = () => {
        setVisualConfig(DEFAULT_VISUAL_CONFIG);
        triggerToast('🔄 Diseño restablecido a los valores por defecto');
    };

    const handleOpenEditModal = (sector = null) => {
        if (sector) {
            setEditingSector(sector);
            setSectorLabel(sector.label);
            setSectorColor(sector.color || '#38BDF8');
            setSectorProb(sector.probability || 15);
        } else {
            setEditingSector(null);
            setSectorLabel('');
            setSectorColor('#38BDF8');
            setSectorProb(15);
        }
        setIsEditModalOpen(true);
    };

    const handleSaveSector = (e) => {
        e?.preventDefault();
        if (!sectorLabel.trim()) return;

        if (editingSector) {
            setSectors(sectors.map(s => s.id === editingSector.id ? {
                ...s,
                label: sectorLabel.trim(),
                color: sectorColor,
                probability: Number(sectorProb) || 15
            } : s));
            triggerToast('✅ Premio actualizado');
        } else {
            const newSector = {
                id: String(Date.now()),
                label: sectorLabel.trim(),
                color: sectorColor,
                probability: Number(sectorProb) || 15
            };
            setSectors([...sectors, newSector]);
            triggerToast('✅ Nuevo premio añadido');
        }
        setIsEditModalOpen(false);
    };

    const handleDeleteSector = (id) => {
        if (sectors.length <= 2) {
            triggerToast('⚠️ La ruleta debe tener al menos 2 sectores.');
            return;
        }
        setSectors(sectors.filter(s => s.id !== id));
        triggerToast('🗑️ Sector eliminado');
    };

    const overlayUrl = `${window.location.origin}${window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/'}?overlay=points_wheel`;

    const handleCopyOverlayUrl = () => {
        navigator.clipboard.writeText(overlayUrl);
        setCopiedOverlayUrl(true);
        triggerToast('📋 URL del Overlay copiada para OBS');
        setTimeout(() => setCopiedOverlayUrl(false), 2500);
    };

    return (
        <div style={{ maxWidth: '1350px', margin: '0 auto', paddingBottom: '3rem' }}>
            
            {/* 1. CABECERA PRINCIPAL */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem 1.8rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 10px 30px -8px rgba(236, 72, 153, 0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(236, 72, 153, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#EC4899',
                        border: '1px solid rgba(236, 72, 153, 0.4)'
                    }}>
                        <Disc size={26} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#F8FAFC', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Ruleta por Puntos de Canal
                            <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(236, 72, 153, 0.2)', color: '#EC4899', borderRadius: '12px', fontWeight: 600 }}>
                                100% Personalizable
                            </span>
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                            Personaliza elemento por elemento el marco, contador 3-2-1, ruleta y cartel de ganador para OBS Studio.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Abrir Overlay */}
                    <a
                        href={overlayUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#E2E8F0',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            textDecoration: 'none'
                        }}
                    >
                        <ExternalLink size={16} /> Ver Overlay
                    </a>

                    {/* Copiar URL Overlay */}
                    <button
                        type="button"
                        onClick={handleCopyOverlayUrl}
                        style={{
                            background: copiedOverlayUrl ? '#10B981' : 'rgba(236, 72, 153, 0.15)',
                            color: copiedOverlayUrl ? '#FFFFFF' : '#EC4899',
                            border: copiedOverlayUrl ? '1px solid #10B981' : '1px solid rgba(236, 72, 153, 0.4)',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            cursor: 'pointer'
                        }}
                    >
                        {copiedOverlayUrl ? <CheckCircle2 size={17} /> : <Copy size={17} />}
                        {copiedOverlayUrl ? '¡URL Copiada!' : 'Copiar URL Overlay OBS'}
                    </button>
                </div>
            </div>

            {/* BARRA DE PESTAÑAS (TABS) */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('premios')}
                    style={{
                        background: activeTab === 'premios' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                        color: activeTab === 'premios' ? '#EC4899' : '#94A3B8',
                        border: activeTab === 'premios' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Award size={18} /> 1. Premios de la Ruleta ({sectors.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('editor_visual')}
                    style={{
                        background: activeTab === 'editor_visual' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                        color: activeTab === 'editor_visual' ? '#EC4899' : '#94A3B8',
                        border: activeTab === 'editor_visual' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Palette size={18} /> 2. Personalización Visual OBS (Colores y Textos)
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('ajustes')}
                    style={{
                        background: activeTab === 'ajustes' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                        color: activeTab === 'ajustes' ? '#EC4899' : '#94A3B8',
                        border: activeTab === 'ajustes' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Settings size={18} /> 3. Ajustes de Twitch y Tiempos
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('historial')}
                    style={{
                        background: activeTab === 'historial' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                        color: activeTab === 'historial' ? '#EC4899' : '#94A3B8',
                        border: activeTab === 'historial' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <History size={18} /> 4. Historial de Ganadores ({winnersHistory.length})
                </button>
            </div>

            {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA ACTIVA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* COLUMNA IZQUIERDA: VISTA PREVIA INTERACTIVA DE OBS */}
                <div style={{
                    position: 'sticky',
                    top: '20px',
                    background: 'var(--bg-card)',
                    border: `2px solid ${visualConfig.borderColor || '#EC4899'}`,
                    borderRadius: '24px',
                    padding: '1.8rem',
                    textAlign: 'center',
                    boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${visualConfig.borderColor || '#EC4899'}44`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{
                            background: visualConfig.headerBadgeBg || '#EC4899',
                            color: visualConfig.headerBadgeTextColor || '#000000',
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {visualConfig.headerBadgeText || '🎡 Ruleta de la Suerte (Puntos)'}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setPreviewVisualElement('wheel')}
                                style={{
                                    background: previewVisualElement === 'wheel' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.06)',
                                    color: '#FFF',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Ruleta
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewVisualElement('countdown')}
                                style={{
                                    background: previewVisualElement === 'countdown' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.06)',
                                    color: '#FFF',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer'
                                }}
                            >
                                3-2-1
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewVisualElement('winner')}
                                style={{
                                    background: previewVisualElement === 'winner' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.06)',
                                    color: '#FFF',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Ganador
                            </button>
                        </div>
                    </div>

                    <h3 style={{ margin: '0 0 1rem', color: visualConfig.titleColor || '#F8FAFC', fontSize: '1.25rem', fontWeight: 800 }}>
                        {(visualConfig.titleTemplate || '¡@{user} está probando suerte!').replace(/@{user}|{user}/g, '@' + testViewer)}
                    </h3>

                    {/* Canvas / Visualizador */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.2rem' }}>
                        <canvas
                            ref={canvasRef}
                            width={340}
                            height={340}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '50%',
                                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.8))'
                            }}
                        />

                        {/* Preview del Contador 3, 2, 1 */}
                        {(countdownNum !== null || previewVisualElement === 'countdown') && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '160px',
                                height: '160px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)',
                                border: `4px solid ${visualConfig.countdownBorderColor || '#EC4899'}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 45px ${visualConfig.countdownBorderColor || '#EC4899'}aa`,
                                zIndex: 20
                            }}>
                                <span style={{
                                    color: visualConfig.countdownTextColor || '#EC4899',
                                    fontSize: countdownNum !== null && typeof countdownNum !== 'number' ? '1.2rem' : '4rem',
                                    fontWeight: 900,
                                    textShadow: `0 0 20px ${visualConfig.countdownTextColor || '#EC4899'}`,
                                    lineHeight: 1
                                }}>
                                    {countdownNum !== null ? countdownNum : 3}
                                </span>
                                <span style={{ color: visualConfig.countdownSubtextColor || '#94A3B8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>
                                    {visualConfig.countdownSubtext || 'PREPARANDO...'}
                                </span>
                            </div>
                        )}

                        {/* Preview de Tarjeta Ganador */}
                        {(lastWinner !== null || previewVisualElement === 'winner') && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '94%',
                                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%)',
                                border: `3px solid ${visualConfig.winnerBorderColor || '#10B981'}`,
                                borderRadius: '20px',
                                padding: '1.4rem 1.2rem',
                                boxShadow: `0 20px 50px rgba(0, 0, 0, 0.95), 0 0 40px ${visualConfig.winnerBorderColor || '#10B981'}88`,
                                zIndex: 30
                            }}>
                                <span style={{
                                    color: visualConfig.winnerTitleColor || '#10B981',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    display: 'block',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    {visualConfig.winnerTitleText || '🎉 ¡PREMIO GANADO! 🎉'}
                                </span>
                                
                                <h4 style={{
                                    margin: '8px 0 6px',
                                    color: visualConfig.winnerPrizeTextColor || '#FFFFFF',
                                    fontSize: '1.45rem',
                                    fontWeight: 900
                                }}>
                                    {lastWinner?.prize || '💎 +2000 Puntos (JACKPOT)'}
                                </h4>

                                <span style={{
                                    color: visualConfig.winnerSubtitleColor || '#EC4899',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    display: 'block'
                                }}>
                                    {(visualConfig.winnerSubtitleTemplate || '¡Felicidades @{user}! 🥳✨').replace(/@{user}|{user}/g, '@' + testViewer)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Controles de Simulación */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '0.8rem' }}>
                        <input
                            type="text"
                            placeholder="Nombre del viewer..."
                            value={testViewer}
                            onChange={(e) => setTestViewer(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                color: '#F8FAFC',
                                fontSize: '0.88rem'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => handleSpin(testViewer)}
                            disabled={isSpinning || countdownNum !== null}
                            style={{
                                background: isSpinning || countdownNum !== null ? '#64748B' : '#EC4899',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '8px 18px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: isSpinning || countdownNum !== null ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)'
                            }}
                        >
                            <Play size={15} />
                            {countdownNum !== null ? 'Conteo...' : isSpinning ? 'Girando...' : 'Girar en OBS'}
                        </button>
                    </div>
                </div>

                {/* COLUMNA DERECHA: CONFIGURACIÓN SEGÚN TAB */}
                <div>
                    {/* TAB 1: PREMIOS DE LA RULETA */}
                    {activeTab === 'premios' && (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Award size={20} color="#EC4899" /> Banco de Premios de la Ruleta ({sectors.length})
                                    </h3>
                                    <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                                        Edita el texto, color y probabilidad (%) de cada sector.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleOpenEditModal()}
                                    style={{
                                        background: '#EC4899',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Plus size={16} /> + Añadir Premio
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {sectors.map(s => (
                                    <div
                                        key={s.id}
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: s.color || '#EC4899', flexShrink: 0, border: '2px solid rgba(255,255,255,0.4)' }} />
                                            <div>
                                                <strong style={{ color: '#F8FAFC', fontSize: '0.98rem' }}>{s.label}</strong>
                                                <span style={{ color: '#94A3B8', fontSize: '0.82rem', marginLeft: '12px' }}>
                                                    Probabilidad: <strong style={{ color: '#EC4899' }}>{s.probability || 15}%</strong>
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(s)}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.06)',
                                                    color: '#E2E8F0',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Editar premio"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSector(s.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#EF4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Eliminar premio"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: EDITOR VISUAL COMPLETO ELEMENTO POR ELEMENTO */}
                    {activeTab === 'editor_visual' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* 1. SECCIÓN: MARCO PRINCIPAL Y EJES */}
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Layout size={18} color="#EC4899" /> 1. Marco Exterior y Eje de la Ruleta
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleResetVisualDefaults}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#94A3B8',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <RotateCcw size={12} /> Restablecer Colores
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Borde del Marco
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.borderColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('borderColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.borderColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('borderColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Eje Central
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.centerColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('centerColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.centerColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('centerColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color de la Flecha Puntero
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.pointerColor || '#EF4444'}
                                                onChange={(e) => handleUpdateVisual('pointerColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.pointerColor || '#EF4444'}
                                                onChange={(e) => handleUpdateVisual('pointerColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. SECCIÓN: CABECERA Y TÍTULO AL GIRAR */}
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '1.5rem'
                            }}>
                                <h4 style={{ margin: '0 0 1rem', color: '#F8FAFC', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Type size={18} color="#EC4899" /> 2. Cabecera y Título al Girar
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Texto de la Etiqueta Superior
                                        </label>
                                        <input
                                            type="text"
                                            value={visualConfig.headerBadgeText || ''}
                                            onChange={(e) => handleUpdateVisual('headerBadgeText', e.target.value)}
                                            placeholder="Ej: 🎡 Ruleta de la Suerte"
                                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color de Fondo de la Etiqueta
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.headerBadgeBg || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('headerBadgeBg', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.headerBadgeBg || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('headerBadgeBg', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Texto de la Etiqueta
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.headerBadgeTextColor || '#000000'}
                                                onChange={(e) => handleUpdateVisual('headerBadgeTextColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.headerBadgeTextColor || '#000000'}
                                                onChange={(e) => handleUpdateVisual('headerBadgeTextColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Título al Girar
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.titleColor || '#F8FAFC'}
                                                onChange={(e) => handleUpdateVisual('titleColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.titleColor || '#F8FAFC'}
                                                onChange={(e) => handleUpdateVisual('titleColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Plantilla del Título al Girar (Usa {'{user}'} para el nombre)
                                        </label>
                                        <input
                                            type="text"
                                            value={visualConfig.titleTemplate || ''}
                                            onChange={(e) => handleUpdateVisual('titleTemplate', e.target.value)}
                                            placeholder="¡@{user} está probando suerte!"
                                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. SECCIÓN: CONTADOR REGRESIVO (3, 2, 1) */}
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '1.5rem'
                            }}>
                                <h4 style={{ margin: '0 0 1rem', color: '#F8FAFC', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={18} color="#EC4899" /> 3. Contador Regresivo (3, 2, 1)
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Círculo del Contador
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.countdownBorderColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('countdownBorderColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.countdownBorderColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('countdownBorderColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color de los Números (3, 2, 1)
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.countdownTextColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('countdownTextColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.countdownTextColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('countdownTextColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Subtexto ("PREPARANDO...")
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.countdownSubtextColor || '#94A3B8'}
                                                onChange={(e) => handleUpdateVisual('countdownSubtextColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.countdownSubtextColor || '#94A3B8'}
                                                onChange={(e) => handleUpdateVisual('countdownSubtextColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Subtexto del Contador
                                        </label>
                                        <input
                                            type="text"
                                            value={visualConfig.countdownSubtext || ''}
                                            onChange={(e) => handleUpdateVisual('countdownSubtext', e.target.value)}
                                            placeholder="PREPARANDO..."
                                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Texto Final del Conteo
                                        </label>
                                        <input
                                            type="text"
                                            value={visualConfig.countdownFinalText || ''}
                                            onChange={(e) => handleUpdateVisual('countdownFinalText', e.target.value)}
                                            placeholder="¡GIRANDO!"
                                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4. SECCIÓN: CARTEL DE GANADOR */}
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '1.5rem'
                            }}>
                                <h4 style={{ margin: '0 0 1rem', color: '#F8FAFC', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Award size={18} color="#EC4899" /> 4. Cartel de Ganador (Sobre la Ruleta)
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Texto del Título de Ganador
                                        </label>
                                        <input
                                            type="text"
                                            value={visualConfig.winnerTitleText || ''}
                                            onChange={(e) => handleUpdateVisual('winnerTitleText', e.target.value)}
                                            placeholder="🎉 ¡PREMIO GANADO! 🎉"
                                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Título ("¡PREMIO GANADO!")
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.winnerTitleColor || '#10B981'}
                                                onChange={(e) => handleUpdateVisual('winnerTitleColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.winnerTitleColor || '#10B981'}
                                                onChange={(e) => handleUpdateVisual('winnerTitleColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Texto del Premio Ganado
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.winnerPrizeTextColor || '#FFFFFF'}
                                                onChange={(e) => handleUpdateVisual('winnerPrizeTextColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.winnerPrizeTextColor || '#FFFFFF'}
                                                onChange={(e) => handleUpdateVisual('winnerPrizeTextColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color de la Felicitación ("¡Felicidades @...")
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.winnerSubtitleColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('winnerSubtitleColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.winnerSubtitleColor || '#EC4899'}
                                                onChange={(e) => handleUpdateVisual('winnerSubtitleColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Color del Borde del Ganador
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={visualConfig.winnerBorderColor || '#10B981'}
                                                onChange={(e) => handleUpdateVisual('winnerBorderColor', e.target.value)}
                                                style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                value={visualConfig.winnerBorderColor || '#10B981'}
                                                onChange={(e) => handleUpdateVisual('winnerBorderColor', e.target.value)}
                                                style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Plantilla de Felicitación (Usa {'{user}'} para el viewer)
                                        </label>
                                        <input
                                            type="text"
                                            value={visualConfig.winnerSubtitleTemplate || ''}
                                            onChange={(e) => handleUpdateVisual('winnerSubtitleTemplate', e.target.value)}
                                            placeholder="¡Felicidades @{user}! 🥳✨"
                                            style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '8px 10px', color: '#FFF', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    
                    {/* TAB 4: HISTORIAL DE GANADORES */}
                    {activeTab === 'historial' && (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <History size={20} color="#EC4899" /> Historial de Premios Canjeados ({winnersHistory.length})
                                    </h3>
                                    <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                                        Lleva un control detallado de los premios ganados en directo para no olvidar entregarlos.
                                    </p>
                                </div>

                                {winnersHistory.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearHistory}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#EF4444',
                                            border: '1px solid rgba(239, 68, 68, 0.25)',
                                            padding: '7px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.82rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <Trash2 size={14} /> Vaciar Historial
                                    </button>
                                )}
                            </div>

                            {/* Barra de Filtros y Búsqueda */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por viewer o premio..."
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '8px',
                                            padding: '8px 10px 8px 32px',
                                            color: '#F8FAFC',
                                            fontSize: '0.85rem'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {['todos', 'pendientes', 'entregados'].map(tabKey => (
                                        <button
                                            key={tabKey}
                                            type="button"
                                            onClick={() => setHistoryFilter(tabKey)}
                                            style={{
                                                background: historyFilter === tabKey ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                                                color: historyFilter === tabKey ? '#EC4899' : '#94A3B8',
                                                border: historyFilter === tabKey ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                padding: '6px 12px',
                                                fontSize: '0.82rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {tabKey}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lista de Registros */}
                            {winnersHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                                    <History size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>Aún no hay ganadores registrados en el historial.</p>
                                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>Los giros de la ruleta aparecerán aquí automáticamente.</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                                    {winnersHistory
                                        .filter(item => {
                                            if (historyFilter === 'pendientes' && item.status !== 'pendiente') return false;
                                            if (historyFilter === 'entregados' && item.status !== 'entregado') return false;
                                            if (historySearch) {
                                                const q = historySearch.toLowerCase();
                                                return item.viewer.toLowerCase().includes(q) || item.prize.toLowerCase().includes(q);
                                            }
                                            return true;
                                        })
                                        .map(item => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    background: 'rgba(15, 23, 42, 0.6)',
                                                    border: item.status === 'entregado' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(236, 72, 153, 0.25)',
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        background: item.status === 'entregado' ? '#10B981' : '#F59E0B',
                                                        boxShadow: item.status === 'entregado' ? '0 0 8px #10B981' : '0 0 8px #F59E0B'
                                                    }} />
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <strong style={{ color: '#F8FAFC', fontSize: '1rem' }}>@{item.viewer}</strong>
                                                            <span style={{
                                                                background: item.status === 'entregado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                                color: item.status === 'entregado' ? '#10B981' : '#F59E0B',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {item.status === 'entregado' ? '✓ Entregado' : '⏳ Pendiente'}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                                                            <span style={{ color: item.color || '#EC4899', fontWeight: 700, fontSize: '0.9rem' }}>
                                                                {item.prize}
                                                            </span>
                                                            <span style={{ color: '#64748B', fontSize: '0.78rem' }}>
                                                                • {item.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(item.id)}
                                                        style={{
                                                            background: item.status === 'entregado' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: item.status === 'entregado' ? '#F59E0B' : '#10B981',
                                                            border: item.status === 'entregado' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px'
                                                        }}
                                                    >
                                                        <Check size={14} />
                                                        {item.status === 'entregado' ? 'Marcar Pendiente' : 'Marcar Entregado'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteHistoryItem(item.id)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#EF4444',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            padding: '6px 10px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer'
                                                        }}
                                                        title="Eliminar registro"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: AJUSTES DE TWITCH Y TIEMPOS */}
                    {activeTab === 'ajustes' && (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '1.5rem'
                        }}>
                            <h3 style={{ margin: '0 0 1.2rem', color: '#F8FAFC', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Settings size={20} color="#EC4899" /> Ajustes de Integración y Tiempos
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                        Nombre del Canje de Puntos en Twitch
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Girar Ruleta"
                                        value={rewardName}
                                        onChange={(e) => setRewardName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            color: '#F8FAFC',
                                            fontSize: '0.88rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', whiteSpace: 'nowrap' }}>
                                        Duración del Giro (Segundos)
                                    </label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="15"
                                        value={wheelDuration}
                                        onChange={(e) => setWheelDuration(Number(e.target.value) || 6)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            color: '#F8FAFC',
                                            fontSize: '0.88rem'
                                        }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                        Anunciar Ganador en el Chat con el Bot
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                        <input
                                            type="checkbox"
                                            id="announce-chat"
                                            checked={announceInChat}
                                            onChange={(e) => setAnnounceInChat(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: '#EC4899', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="announce-chat" style={{ color: '#E2E8F0', fontSize: '0.88rem', cursor: 'pointer' }}>
                                            EmiliaMaria_exe anunciará el premio en el chat al finalizar el giro
                                        </label>
                                    </div>
                                </div>

                                {announceInChat && (
                                    <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                            Mensaje que dirá el Bot en el Chat (Variables: {'{user}'} y {'{prize}'})
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={chatMessageTemplate}
                                            onChange={(e) => setChatMessageTemplate(e.target.value)}
                                            placeholder="🎉 ¡@{user} ha canjeado sus puntos en la Ruleta y ha ganado: {prize}! 🥳🎡"
                                            style={{
                                                width: '100%',
                                                background: 'rgba(15, 23, 42, 0.8)',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                borderRadius: '8px',
                                                padding: '10px 12px',
                                                color: '#F8FAFC',
                                                fontSize: '0.88rem',
                                                resize: 'vertical',
                                                minHeight: '60px'
                                            }}
                                        />
                                        <span style={{ display: 'block', color: '#94A3B8', fontSize: '0.78rem', marginTop: '4px' }}>
                                            💡 Puedes usar <code>{'{user}'}</code> para el nombre del viewer y <code>{'{prize}'}</code> para el premio ganado.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE CREAR / EDITAR SECTOR */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(2, 6, 23, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#0F172A',
                        border: '1px solid rgba(236, 72, 153, 0.4)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '460px',
                        padding: '1.8rem',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
                    }}>
                        <h2 style={{ margin: '0 0 1.2rem', fontSize: '1.3rem', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={22} color="#EC4899" />
                            {editingSector ? 'Editar Premio' : 'Nuevo Premio de Ruleta'}
                        </h2>

                        <form onSubmit={handleSaveSector}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                    Nombre del Premio (Texto en Ruleta)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: +1000 Puntos o Reto en Directo"
                                    value={sectorLabel}
                                    onChange={(e) => setSectorLabel(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '9px 12px',
                                        color: '#F8FAFC',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                        Color del Sector
                                    </label>
                                    <input
                                        type="color"
                                        value={sectorColor}
                                        onChange={(e) => setSectorColor(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                        Probabilidad (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={sectorProb}
                                        onChange={(e) => setSectorProb(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            color: '#F8FAFC',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#E2E8F0',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        background: '#EC4899',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Guardar Premio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------------
// COMPONENTE OVERLAY TRANSPARENTE PARA OBS STUDIO (1920x1080)
// -------------------------------------------------------------
export function PointsWheelOBSOverlay({ supabase }) {
    const [phase, setPhase] = useState('idle');
    const [countdownNumber, setCountdownNumber] = useState(null);
    const [activeSpin, setActiveSpin] = useState(null);
    const [winnerData, setWinnerData] = useState(null);
    const canvasRef = useRef(null);
    const rotationRef = useRef(0);
    const timerRef = useRef(null);

    const [sectors, setSectors] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_points_wheel_sectors');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return DEFAULT_SECTORS;
    });

    const [visualConfig, setVisualConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_points_wheel_visual_config');
            if (saved) return { ...DEFAULT_VISUAL_CONFIG, ...JSON.parse(saved) };
        } catch (e) {}
        return DEFAULT_VISUAL_CONFIG;
    });

    const drawWheel = (currentAngle = 0, currentSectors = sectors, currentVisual = visualConfig) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 20;

        ctx.clearRect(0, 0, width, height);
        if (!currentSectors || currentSectors.length === 0) return;

        const totalSectors = currentSectors.length;
        const arcSize = (2 * Math.PI) / totalSectors;

        currentSectors.forEach((sector, i) => {
            const angle = currentAngle + i * arcSize;
            ctx.beginPath();
            ctx.fillStyle = sector.color || '#EC4899';
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
            ctx.lineTo(centerX, centerY);
            ctx.fill();

            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 6;
            ctx.fillText(sector.label, radius - 20, 6);
            ctx.restore();
        });

        // Centro de la ruleta personalizable
        ctx.beginPath();
        ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
        ctx.strokeStyle = currentVisual?.centerColor || '#EC4899';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 16, 0, 2 * Math.PI);
        ctx.fillStyle = currentVisual?.centerColor || '#EC4899';
        ctx.fill();

        // Puntero arriba personalizable
        ctx.beginPath();
        ctx.fillStyle = currentVisual?.pointerColor || '#EF4444';
        ctx.moveTo(centerX - 16, 12);
        ctx.lineTo(centerX + 16, 12);
        ctx.lineTo(centerX, 36);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    const runSpinAnimation = async (viewerName, winningPrize, customSectors = null, durationSec = 6, explicitIndex = null, customVisual = null) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        const activeSectors = customSectors || sectors;
        if (customSectors) setSectors(customSectors);

        const activeVisual = customVisual || visualConfig;
        if (customVisual) setVisualConfig(customVisual);

        // 1. FASE DE CONTEO REGRESIVO (3, 2, 1)
        setPhase('countdown');
        setActiveSpin({ viewer: viewerName, prize: winningPrize });
        setWinnerData(null);

        setTimeout(() => drawWheel(rotationRef.current, activeSectors, activeVisual), 50);

        setCountdownNumber(3);
        wheelAudio.playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
        setCountdownNumber(2);
        wheelAudio.playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
        setCountdownNumber(1);
        wheelAudio.playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
        setCountdownNumber(activeVisual?.countdownFinalText || '¡GIRANDO!');
        wheelAudio.playCountdownBeep(true);
        await new Promise(r => setTimeout(r, 600));
        setCountdownNumber(null);

        // 2. FASE DE GIRO
        setPhase('spinning');

        const totalSectors = activeSectors.length;
        const arcSize = (2 * Math.PI) / totalSectors;
        
        let winningIndex = explicitIndex;
        if (winningIndex === null || winningIndex === undefined || winningIndex < 0) {
            winningIndex = activeSectors.findIndex(s => s.label === winningPrize);
            if (winningIndex === -1) winningIndex = 0;
        }

        const targetSectorCenter = winningIndex * arcSize + arcSize / 2;
        const targetAngleNormalized = (3 * Math.PI / 2 - targetSectorCenter + 2 * Math.PI) % (2 * Math.PI);

        const startAngle = rotationRef.current;
        const startAngleNormalized = (startAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

        let deltaAngle = targetAngleNormalized - startAngleNormalized;
        if (deltaAngle < 0) deltaAngle += 2 * Math.PI;

        const extraRotations = 6;
        const totalRotation = extraRotations * 2 * Math.PI + deltaAngle;

        const durationMs = (durationSec || 6) * 1000;
        const startTime = performance.now();
        let lastTickAngle = startAngle;
        const tickStep = (2 * Math.PI) / totalSectors;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentAngle = startAngle + totalRotation * easeOut;

            if (Math.abs(currentAngle - lastTickAngle) >= tickStep) {
                wheelAudio.playTick();
                lastTickAngle = currentAngle;
            }

            rotationRef.current = currentAngle;
            drawWheel(currentAngle, activeSectors, activeVisual);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                wheelAudio.playWinFanfare();

                const finalNorm = (rotationRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
                const pointerAngle = (3 * Math.PI / 2 - finalNorm + 2 * Math.PI) % (2 * Math.PI);
                const exactIndex = Math.floor(pointerAngle / arcSize) % totalSectors;
                const exactSector = activeSectors[exactIndex] || activeSectors[winningIndex];

                // 3. FASE DE PREMIO GANADOR
                setPhase('winner');
                setWinnerData({
                    viewer: viewerName,
                    prize: exactSector.label
                });

                // 4. FASE DE DESVANECIMIENTO SUAVE
                const staySeconds = activeVisual?.winnerDurationSeconds || 5;
                timerRef.current = setTimeout(() => {
                    setPhase('fading');
                    setTimeout(() => {
                        setPhase('idle');
                        setActiveSpin(null);
                        setWinnerData(null);
                        setCountdownNumber(null);
                    }, 800);
                }, staySeconds * 1000);
            }
        };

        requestAnimationFrame(animate);
    };

    // Escuchar eventos en tiempo real
    useEffect(() => {
        let realtimeChannel = null;
        if (supabase) {
            realtimeChannel = supabase.channel('points_wheel_realtime')
                .on('broadcast', { event: 'SPIN_EVENT' }, (payload) => {
                    if (payload && payload.payload) {
                        const data = payload.payload;
                        runSpinAnimation(data.viewer, data.prize, data.sectors, data.duration, data.winningIndex, data.visualConfig);
                    }
                })
                .subscribe();
        }

        let bc = null;
        try {
            bc = new BroadcastChannel('tokkii_points_wheel_channel');
            bc.onmessage = (event) => {
                if (event && event.data) {
                    if (event.data.action === 'POINTS_WHEEL_SPIN') {
                        runSpinAnimation(event.data.viewer, event.data.prize, event.data.sectors, event.data.duration, event.data.winningIndex, event.data.visualConfig);
                    } else if (event.data.action === 'POINTS_WHEEL_CONFIG_UPDATE') {
                        if (event.data.visualConfig) setVisualConfig(event.data.visualConfig);
                        if (event.data.sectors) setSectors(event.data.sectors);
                    }
                }
            };
        } catch (e) {}

        const handleEvent = (e) => {
            if (e?.detail?.action === 'POINTS_WHEEL_SPIN') {
                runSpinAnimation(e.detail.viewer, e.detail.prize, e.detail.sectors, e.detail.duration, e.detail.winningIndex, e.detail.visualConfig);
            }
        };

        const handleStorage = (e) => {
            if (e.key === 'twitch_points_wheel_last_spin' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    if (data.action === 'POINTS_WHEEL_SPIN') {
                        runSpinAnimation(data.viewer, data.prize, data.sectors, data.duration, data.winningIndex, data.visualConfig);
                    }
                } catch (err) {}
            } else if (e.key === 'twitch_points_wheel_visual_config' && e.newValue) {
                try {
                    setVisualConfig(JSON.parse(e.newValue));
                } catch (err) {}
            }
        };

        window.addEventListener('POINTS_WHEEL_EVENT', handleEvent);
        window.addEventListener('storage', handleStorage);

        return () => {
            if (realtimeChannel && supabase) supabase.removeChannel(realtimeChannel);
            if (bc) bc.close();
            if (timerRef.current) clearTimeout(timerRef.current);
            window.removeEventListener('POINTS_WHEEL_EVENT', handleEvent);
            window.removeEventListener('storage', handleStorage);
        };
    }, [supabase]);

    if (phase === 'idle') return null;

    const isFading = phase === 'fading';

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity: isFading ? 0 : 1,
            transform: isFading ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none'
        }}>
            {/* Contenedor Principal de la Ruleta y Premios */}
            <div style={{
                position: 'relative',
                background: visualConfig?.containerBg || 'rgba(15, 23, 42, 0.94)',
                border: `3px solid ${visualConfig?.borderColor || '#EC4899'}`,
                borderRadius: '32px',
                padding: '2.2rem 2.8rem',
                textAlign: 'center',
                boxShadow: `0 30px 90px rgba(0, 0, 0, 0.9), 0 0 60px ${visualConfig?.borderColor || '#EC4899'}88`,
                animation: 'slideDown 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                maxWidth: '600px',
                width: '90%'
            }}>
                {/* Header del canje */}
                <div style={{ marginBottom: '1.2rem' }}>
                    <span style={{
                        background: visualConfig?.headerBadgeBg || 'linear-gradient(135deg, #EC4899, #F472B6)',
                        color: visualConfig?.headerBadgeTextColor || '#000000',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        padding: '5px 18px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: `0 4px 15px ${visualConfig?.headerBadgeBg || '#EC4899'}66`
                    }}>
                        {visualConfig?.headerBadgeText || '🎡 Ruleta de la Suerte (Puntos)'}
                    </span>
                    <h2 style={{ margin: '12px 0 0', color: visualConfig?.titleColor || '#F8FAFC', fontSize: '1.6rem', fontWeight: 800 }}>
                        {(visualConfig?.titleTemplate || '¡@{user} está probando suerte!').replace(/@{user}|{user}/g, '@' + (activeSpin?.viewer || 'Viewer'))}
                    </h2>
                </div>

                {/* Canvas de la ruleta */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '50%',
                            filter: 'drop-shadow(0 15px 40px rgba(0,0,0,0.8))'
                        }}
                    />

                    {/* OVERLAY DE CUENTA REGRESIVA 3, 2, 1 SOBRE LA RULETA */}
                    {countdownNumber !== null && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)',
                            border: `4px solid ${visualConfig?.countdownBorderColor || '#EC4899'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 50px ${visualConfig?.countdownBorderColor || '#EC4899'}bb, inset 0 0 30px ${visualConfig?.countdownBorderColor || '#EC4899'}55`,
                            animation: 'bounceIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            zIndex: 20
                        }}>
                            <span style={{
                                color: visualConfig?.countdownTextColor || '#EC4899',
                                fontSize: typeof countdownNumber === 'number' ? '4.5rem' : '1.3rem',
                                fontWeight: 900,
                                textShadow: `0 0 25px ${visualConfig?.countdownTextColor || '#EC4899'}, 0 0 50px ${visualConfig?.countdownTextColor || '#EC4899'}`,
                                lineHeight: 1
                            }}>
                                {countdownNumber}
                            </span>
                            {typeof countdownNumber === 'number' && (
                                <span style={{ color: visualConfig?.countdownSubtextColor || '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                                    {visualConfig?.countdownSubtext || 'PREPARANDO...'}
                                </span>
                            )}
                        </div>
                    )}

                    {/* CARTEL DEL PREMIO DIRECTAMENTE SOBRE LA RULETA AL DETENERSE */}
                    {winnerData && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '92%',
                            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%)',
                            border: `3px solid ${visualConfig?.winnerBorderColor || '#10B981'}`,
                            borderRadius: '24px',
                            padding: '1.6rem 1.4rem',
                            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.95), 0 0 50px ${visualConfig?.winnerBorderColor || '#10B981'}aa`,
                            animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            zIndex: 10
                        }}>
                            <span style={{
                                color: visualConfig?.winnerTitleColor || '#10B981',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                display: 'block',
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                textShadow: `0 0 20px ${visualConfig?.winnerTitleColor || '#10B981'}aa`
                            }}>
                                {visualConfig?.winnerTitleText || '🎉 ¡PREMIO GANADO! 🎉'}
                            </span>
                            
                            <h3 style={{
                                margin: '10px 0 6px',
                                color: visualConfig?.winnerPrizeTextColor || '#FFFFFF',
                                fontSize: '1.8rem',
                                fontWeight: 900,
                                textShadow: '0 4px 15px rgba(0,0,0,0.9)'
                            }}>
                                {winnerData.prize}
                            </h3>

                            <span style={{
                                color: visualConfig?.winnerSubtitleColor || '#EC4899',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                display: 'block'
                            }}>
                                {(visualConfig?.winnerSubtitleTemplate || '¡Felicidades @{user}! 🥳✨').replace(/@{user}|{user}/g, '@' + winnerData.viewer)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
