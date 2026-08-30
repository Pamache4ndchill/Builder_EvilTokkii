import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Trophy, X, Edit2, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './Ruleta.css';

export const COLORS = [
    '#a855f7', // Primary Purple
    '#ec4899', // Secondary Pink
    '#3b82f6', // Accent Blue
    '#ffffff', // White
    '#c084fc', // Light Purple
    '#f97316', // Orange
];

export const RuletaSidebar = ({
    participants,
    setParticipants,
    inputValue,
    setInputValue,
    addParticipant,
    removeParticipant,
    clearParticipants,
    editingIndex,
    setEditingIndex
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    AGREGAR PARTICIPANTES
                </label>
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addParticipant();
                        }
                    }}
                    placeholder="Escribe o pega nombres (uno por línea)..."
                    className="add-input"
                    style={{ width: '100%', resize: 'none', height: '90px', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.4' }}
                />
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button 
                        onClick={addParticipant} 
                        className="add-btn" 
                        style={{ flex: 1, padding: '0.65rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                    >
                        <Plus size={16} /> Agregar
                    </button>
                    <button 
                        onClick={clearParticipants} 
                        className="add-btn delete" 
                        style={{ flex: 1, background: '#ef4444', padding: '0.65rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }} 
                        title="Limpiar Lista"
                    >
                        <Trash2 size={16} /> Limpiar Lista
                    </button>
                </div>
            </div>

            <div style={{ padding: '1rem 1.25rem 0.5rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    En Lista
                </span>
                <span className="participants-count">{participants.length}</span>
            </div>

            <div className="participants-list custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <AnimatePresence initial={false}>
                    {participants.map((name, index) => (
                        <motion.div
                            key={`p-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="participant-item"
                            style={{ padding: '0.5rem 0.75rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                                <div className="participant-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {editingIndex === index ? (
                                    <input
                                        autoFocus
                                        className="add-input"
                                        style={{ padding: '0.2rem 0.4rem', height: 'auto', borderRadius: '4px', width: '100%', fontSize: '0.85rem' }}
                                        value={name}
                                        onChange={(e) => {
                                            const newParts = [...participants];
                                            newParts[index] = e.target.value;
                                            setParticipants(newParts);
                                        }}
                                        onBlur={() => setEditingIndex(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingIndex(null)}
                                    />
                                ) : (
                                    <span className="participant-name" onClick={() => setEditingIndex(index)} style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {name}
                                    </span>
                                )}
                            </div>
                            <div className="participant-actions">
                                <button onClick={() => setEditingIndex(index)} className="action-btn">
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={() => removeParticipant(index)} className="action-btn delete">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {participants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        Aún no hay participantes en la ruleta. ¡Agrégalos arriba!
                    </div>
                )}
            </div>
        </div>
    );
};

export const RuletaWheel = ({
    participants,
    isMuted,
    setIsMuted,
    hideNames,
    setHideNames,
    showToast
}) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [spinDuration, setSpinDuration] = useState(0);

    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const lastTickAngleRef = useRef(0);

    const playTick = useCallback(() => {
        if (isMuted) return;
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio error", e);
        }
    }, [isMuted]);

    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvas.width;
        const center = size / 2;
        const radius = center - 10;
        const total = participants.length;

        ctx.clearRect(0, 0, size, size);

        if (total === 0) {
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();
            return;
        }

        const arcSize = (Math.PI * 2) / total;

        ctx.beginPath();
        ctx.arc(center, center, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        participants.forEach((name, i) => {
            const angle = i * arcSize;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, angle, angle + arcSize);
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (!hideNames) {
                ctx.save();
                ctx.translate(center, center);
                ctx.rotate(angle + arcSize / 2);
                ctx.textAlign = 'right';
                const bgColor = COLORS[i % COLORS.length];
                ctx.fillStyle = bgColor === '#ffffff' ? '#0f172a' : '#ffffff';
                ctx.font = `bold ${Math.max(14, 26 - total)}px Inter, sans-serif`;
                ctx.shadowColor = bgColor === '#ffffff' ? 'transparent' : 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                ctx.fillText(name, radius - 30, 10);
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(center, center);
                ctx.rotate(angle + arcSize / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = `bold 24px Inter, sans-serif`;
                ctx.fillText("?", radius - 30, 10);
                ctx.restore();
            }
        });

        ctx.beginPath();
        ctx.arc(center, center, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.stroke();
    }, [participants, hideNames]);

    useEffect(() => {
        drawWheel();
    }, [drawWheel, participants, hideNames]);

    const startSpin = () => {
        if (isSpinning || participants.length < 2) return;

        setIsSpinning(true);
        setWinner(null);

        const duration = 8 + Math.random() * 4;
        setSpinDuration(duration);

        const extraRotation = 3600 + Math.random() * 720;
        const newRotation = rotation + extraRotation;

        setRotation(newRotation);
    };

    const calculateWinner = (finalRotation) => {
        const totalSegments = participants.length;
        const segmentAngle = 360 / totalSegments;
        const normalizedRotation = finalRotation % 360;
        const winningIndex = Math.floor(((270 - normalizedRotation + 360) % 360) / segmentAngle);
        setWinner(participants[winningIndex]);
    };

    const handleAnimationComplete = () => {
        if (isSpinning) {
            setIsSpinning(false);
            calculateWinner(rotation);
        }
    };

    const handleUpdate = (latest) => {
        if (!isSpinning) return;
        const currentRotation = latest.rotate;
        const totalSegments = participants.length;
        const segmentAngle = 360 / totalSegments;
        if (Math.floor(currentRotation / segmentAngle) !== Math.floor(lastTickAngleRef.current / segmentAngle)) {
            playTick();
        }
        lastTickAngleRef.current = currentRotation;
    };

    return (
        <div className="ruleta-container" style={{ margin: '0 auto', padding: '1rem', background: 'transparent', border: 'none' }}>
            <div className="ruleta-wheel-side">
                <div className="wheel-indicator"></div>

                <div className="wheel-wrapper">
                    <motion.div
                        animate={{ rotate: rotation }}
                        transition={{
                            duration: isSpinning ? spinDuration : 0,
                            ease: [0.1, 0, 0.1, 1]
                        }}
                        onUpdate={handleUpdate}
                        onAnimationComplete={handleAnimationComplete}
                    >
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={500}
                            className="wheel-canvas"
                        />
                    </motion.div>

                    <button
                        onClick={startSpin}
                        disabled={isSpinning || participants.length < 2}
                        className="spin-button"
                    >
                        <div className="spin-btn-bg"></div>
                        <span>{isSpinning ? '...' : 'GIRAR'}</span>
                    </button>
                </div>

                <div className="ruleta-controls">
                    <button onClick={() => setIsMuted(!isMuted)} className="control-btn" title={isMuted ? "Activar sonido" : "Silenciar"}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={() => setHideNames(!hideNames)}
                        disabled={isSpinning}
                        className={`control-btn control-btn-long ${hideNames ? 'active' : ''}`}
                    >
                        {hideNames ? <Eye size={18} /> : <EyeOff size={18} />}
                        {hideNames ? "Misterio ON" : "Misterio OFF"}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="winner-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="winner-modal"
                        >
                            <div className="winner-icon-box">
                                <Trophy size={48} />
                            </div>
                            <h3 className="winner-label">¡Tenemos un ganador!</h3>
                            <div className="winner-name">{winner}</div>
                            <button onClick={() => setWinner(null)} className="close-modal-btn">
                                CERRAR <X size={20} />
                            </button>

                            <div className="confetti-container">
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className="confetti" style={{
                                        left: `${Math.random() * 100}%`,
                                        backgroundColor: COLORS[i % COLORS.length],
                                        animationDelay: `${Math.random() * 3}s`,
                                        width: `${Math.random() * 10 + 5}px`,
                                        height: `${Math.random() * 10 + 5}px`,
                                    }}></div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="ruleta-toast"
                    >
                        <span>Lista borrada con éxito</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Ruleta = () => {
    const [participants, setParticipants] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [hideNames, setHideNames] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showToast, setShowToast] = useState(false);

    const addParticipant = () => {
        if (inputValue.trim()) {
            const names = inputValue
                .split(/\r\n|\r|\n/)
                .map(name => name.trim())
                .filter(name => name.length > 0);

            if (names.length > 0) {
                setParticipants(prev => [...prev, ...names]);
                setInputValue('');
            }
        }
    };

    const removeParticipant = (index) => {
        if (participants.length <= 2) {
            alert("Se necesitan al menos 2 participantes.");
            return;
        }
        setParticipants(prev => prev.filter((_, i) => i !== index));
    };

    const clearParticipants = () => {
        setParticipants([]);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <RuletaWheel
                participants={participants}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                hideNames={hideNames}
                setHideNames={setHideNames}
                showToast={showToast}
            />
        </div>
    );
};

export default Ruleta;
