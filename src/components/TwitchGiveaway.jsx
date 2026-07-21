import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Trophy, X, Trash2, RefreshCcw, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import tmi from 'tmi.js';
import './TwitchGiveaway.css';

export const TwitchGiveawaySidebar = ({
    keyword,
    setKeyword,
    isStarted,
    handleStart,
    handleStop,
    handleClear,
    handleDraw,
    participants,
    winner
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    COMANDO DE ACTIVACIÓN
                </label>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={isStarted}
                    placeholder="Ej: !web o !sorteo"
                    className="gift-input-field"
                    style={{ marginBottom: '1rem' }}
                />

                <div className="gift-action-btns">
                    {isStarted ? (
                        <button onClick={handleStop} className="gift-btn gift-btn-stop">
                            <Square size={16} /> DETENER
                        </button>
                    ) : (
                        <button onClick={handleStart} className="gift-btn gift-btn-start">
                            <Play size={16} fill="currentColor" /> COMENZAR
                        </button>
                    )}
                    <button onClick={handleClear} className="gift-btn gift-btn-clear" disabled={isStarted}>
                        <Trash2 size={16} /> LIMPIAR
                    </button>

                    <button
                        onClick={handleDraw}
                        className="gift-btn gift-btn-draw"
                        disabled={participants.length === 0}
                        style={{ border: participants.length > 0 ? '2px solid #9146FF' : 'none' }}
                    >
                        <Trophy size={18} color={participants.length > 0 ? '#9146FF' : '#888'} />
                        {winner ? "RE-SORTEAR" : "SORTEAR GANADOR"}
                    </button>
                </div>
            </div>

            <div style={{ padding: '1rem 1.25rem 0.5rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    En Lista
                </span>
                <span className="gift-count">{participants.length}</span>
            </div>

            <div className="gift-users-scroll custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <AnimatePresence initial={false}>
                    {participants.map((user) => (
                        <motion.div
                            key={`twitch-user-${user}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="gift-user-item"
                        >
                            <div className="gift-user-avatar">{user.charAt(0).toUpperCase()}</div>
                            <div className="gift-user-name">{user}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {participants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        Aún no hay nadie. ¡Diles que escriban <strong style={{ color: '#9146FF' }}>{keyword}</strong> en el chat de Twitch!
                    </div>
                )}
            </div>
        </div>
    );
};

export const TwitchGiveawayMain = ({
    keyword,
    isStarted,
    winner,
    setWinner,
    participants
}) => {
    return (
        <div className="gift-container" style={{ margin: 0, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="gift-header" style={{ marginBottom: '2rem' }}>
                <div className={`gift-status-badge ${isStarted ? 'active' : ''}`}>
                    {isStarted && <div className="gift-pulse"></div>}
                    {isStarted ? "ESCUCHANDO CHAT DE TWITCH EN VIVO..." : "LISTO PARA EMPEZAR"}
                </div>
                <p style={{ marginTop: '1.25rem', marginBottom: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Los usuarios que escriban <span style={{ color: '#9146FF', fontWeight: 'bold' }}>{keyword}</span> en el chat de Twitch entrarán automáticamente en la lista.
                </p>
            </div>

            <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '2rem',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: isStarted ? 'rgba(0, 255, 136, 0.15)' : 'rgba(145, 70, 255, 0.15)',
                    border: isStarted ? '2px solid #00ff88' : '2px solid #9146FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isStarted ? '#00ff88' : '#9146FF'
                }}>
                    <Radio size={48} className={isStarted ? "animate-pulse" : ""} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        {isStarted ? "Escuchando Mensajes..." : "Sorteo Inactivo"}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                        {isStarted 
                            ? `Esperando que los espectadores envíen ${keyword} en stream.`
                            : 'Presiona "Comenzar" en la barra lateral para empezar a escuchar el chat de Twitch.'
                        }
                    </p>
                </div>

                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Trophy size={20} color="#9146FF" />
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        {participants.length} Participante{participants.length !== 1 ? 's' : ''} en lista
                    </span>
                </div>
            </div>

            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="gift-winner-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            className="gift-winner-card"
                        >
                            <div className="gift-winner-label">¡GANADOR SORTEO!</div>
                            <div className="gift-winner-name">{winner}</div>
                            <button onClick={() => setWinner(null)} className="close-modal-btn" style={{ background: 'white', color: '#1a0b2e' }}>
                                <X size={20} /> CERRAR
                            </button>

                            <div className="confetti-container">
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className="gift-confetti" style={{
                                        left: `${Math.random() * 100}%`,
                                        backgroundColor: ['#9146FF', '#00d4ff', '#ff006e', '#ffffff'][i % 4],
                                        animationDelay: `${Math.random() * 3}s`,
                                        transform: `rotate(${Math.random() * 360}deg)`
                                    }}></div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TwitchGiveaway = () => {
    const [participants, setParticipants] = useState([]);
    const [keyword, setKeyword] = useState('!web');
    const [isStarted, setIsStarted] = useState(false);
    const [winner, setWinner] = useState(null);

    const clientRef = useRef(null);
    const participantsRef = useRef([]);

    useEffect(() => {
        participantsRef.current = participants;
    }, [participants]);

    const connectToTwitch = useCallback(() => {
        if (clientRef.current) return;

        const client = new tmi.Client({
            channels: ['eviltokkii']
        });

        client.connect().then(() => {
            console.log('Conectado a Twitch');
        }).catch(err => {
            console.error('Error conectando a Twitch:', err);
        });

        client.on('message', (_channel, tags, message, self) => {
            if (self) return;
            if (!isStarted) return;

            const msg = message.trim();
            const user = tags['display-name'] || tags.username;

            if (msg === keyword.trim() && user) {
                if (!participantsRef.current.includes(user)) {
                    setParticipants(prev => {
                        if (prev.includes(user)) return prev;
                        return [user, ...prev];
                    });
                }
            }
        });

        clientRef.current = client;
    }, [isStarted, keyword]);

    useEffect(() => {
        if (isStarted) {
            connectToTwitch();
        }
    }, [isStarted, connectToTwitch]);

    const handleStart = () => {
        setIsStarted(true);
        setWinner(null);
    };

    const handleStop = () => {
        setIsStarted(false);
    };

    const handleDraw = () => {
        if (participants.length === 0) {
            alert("No hay participantes todavía.");
            return;
        }
        setIsStarted(false);
        const randomIndex = Math.floor(Math.random() * participants.length);
        setWinner(participants[randomIndex]);
    };

    const handleClear = () => {
        setParticipants([]);
        setWinner(null);
    };

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <TwitchGiveawayMain
                keyword={keyword}
                isStarted={isStarted}
                winner={winner}
                setWinner={setWinner}
                participants={participants}
            />
        </div>
    );
};

export default TwitchGiveaway;
