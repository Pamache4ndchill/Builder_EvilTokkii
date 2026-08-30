import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, Square, Trophy, X, Trash2, RefreshCcw, Radio, 
    Crown, Shield, Sparkles, Lock, Users, CheckCircle2, UserCheck, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import tmi from 'tmi.js';
import './TwitchGiveaway.css';

// -------------------------------------------------------------
// BARRA LATERAL: CONFIGURACIÓN, CONTROLES Y REGLAS DEL SORTEO
// -------------------------------------------------------------
export const TwitchGiveawaySidebar = ({
    keyword,
    setKeyword,
    isStarted,
    handleStart,
    handleStop,
    handleClear,
    handleDraw,
    participants,
    winner,
    subMultiplierActive,
    setSubMultiplierActive,
    subsOnly,
    setSubsOnly,
    allowMods,
    setAllowMods,
    allowVips,
    setAllowVips
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
            {/* 1. COMANDO DE ACTIVACIÓN */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Comando de Activación
                </label>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={isStarted}
                    placeholder="Ej: !web o !sorteo"
                    className="gift-input-field"
                    style={{ width: '100%', marginBottom: '0' }}
                />
            </div>

            {/* 2. BOTONES DE ACCIÓN */}
            <div className="gift-action-btns" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {isStarted ? (
                    <button onClick={handleStop} className="gift-btn gift-btn-stop" style={{ width: '100%', padding: '12px' }}>
                        <Square size={16} /> DETENER REGISTRO
                    </button>
                ) : (
                    <button onClick={handleStart} className="gift-btn gift-btn-start" style={{ width: '100%', padding: '12px' }}>
                        <Play size={16} fill="currentColor" /> COMENZAR REGISTRO
                    </button>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={handleClear} 
                        className="gift-btn gift-btn-clear" 
                        disabled={isStarted || participants.length === 0}
                        style={{ flex: 1, padding: '10px' }}
                    >
                        <Trash2 size={15} /> LIMPIAR LISTA
                    </button>
                </div>

                <button
                    onClick={handleDraw}
                    className="gift-btn gift-btn-draw"
                    disabled={participants.length === 0}
                    style={{ 
                        width: '100%', 
                        padding: '12px',
                        border: participants.length > 0 ? '2px solid #9146FF' : 'none',
                        marginTop: '4px'
                    }}
                >
                    <Trophy size={18} color={participants.length > 0 ? '#9146FF' : '#888'} />
                    {winner ? "RE-SORTEAR GANADOR" : "SORTEAR GANADOR"}
                </button>
            </div>

            {/* 3. NORMAS Y PARÁMETROS DEL SORTEO */}
            <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⚙️ Reglas de Participación
                </span>

                {/* Switch: Suscriptores x2 Chance */}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#EC4899" />
                        <div>
                            <div style={{ color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 600 }}>Subs tienen x2 Chance</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Doble probabilidad para suscriptores</div>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={subMultiplierActive}
                        onChange={(e) => setSubMultiplierActive(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#EC4899', cursor: 'pointer' }}
                    />
                </label>

                {/* Switch: Sorteo solo para Suscriptores */}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={16} color="#A855F7" />
                        <div>
                            <div style={{ color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 600 }}>Solo Suscriptores</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Exclusivo para subs de Twitch</div>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={subsOnly}
                        onChange={(e) => setSubsOnly(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#A855F7', cursor: 'pointer' }}
                    />
                </label>

                {/* Switch: Permitir Moderadores */}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={16} color="#10B981" />
                        <div>
                            <div style={{ color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 600 }}>Permitir Moderadores</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Mods pueden entrar al sorteo</div>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={allowMods}
                        onChange={(e) => setAllowMods(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
                    />
                </label>

                {/* Switch: Permitir VIPs */}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Crown size={16} color="#F59E0B" />
                        <div>
                            <div style={{ color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 600 }}>Permitir VIPs</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Insignias VIP pueden participar</div>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={allowVips}
                        onChange={(e) => setAllowVips(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#F59E0B', cursor: 'pointer' }}
                    />
                </label>
            </div>
        </div>
    );
};

// -------------------------------------------------------------
// ÁREA PRINCIPAL: LISTA EN VIVO A LA IZQUIERDA Y PANEL DE SORTEO
// -------------------------------------------------------------
export const TwitchGiveawayMain = ({
    keyword,
    isStarted,
    winner,
    setWinner,
    participants,
    subMultiplierActive,
    subsOnly,
    allowMods,
    allowVips
}) => {
    return (
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
            
            {/* Header de Estado */}
            <div className="gift-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div className={`gift-status-badge ${isStarted ? 'active' : ''}`}>
                    {isStarted && <div className="gift-pulse"></div>}
                    {isStarted ? "🔴 ESCUCHANDO CHAT DE TWITCH EN VIVO..." : "LISTO PARA EMPEZAR"}
                </div>
                <p style={{ marginTop: '0.8rem', marginBottom: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Los espectadores que escriban <span style={{ color: '#9146FF', fontWeight: 'bold' }}>{keyword}</span> en el chat de <strong>@eviltokkii</strong> entrarán automáticamente.
                </p>
            </div>

            {/* Layout Dividido en 2 Columnas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 420px) 1fr',
                gap: '1.5rem',
                alignItems: 'start'
            }}>
                
                {/* COLUMNA IZQUIERDA: LISTA DE PARTICIPANTES EN VIVO */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1.4rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 240px)',
                    height: '560px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} color="#9146FF" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#F8FAFC', fontWeight: 700 }}>
                                En Lista
                            </h3>
                        </div>
                        <span style={{
                            background: 'rgba(145, 70, 255, 0.2)',
                            color: '#C084FC',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                        }}>
                            {participants.length} viewers
                        </span>
                    </div>

                    {/* Scroll de Usuarios */}
                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                        <AnimatePresence initial={false}>
                            {participants.map((item, idx) => {
                                const username = typeof item === 'object' ? item.username : item;
                                const isSub = typeof item === 'object' ? item.isSub : false;
                                const isMod = typeof item === 'object' ? item.isMod : false;
                                const isVip = typeof item === 'object' ? item.isVip : false;

                                return (
                                    <motion.div
                                        key={`participant-${username}-${idx}`}
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -15 }}
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: isSub ? 'linear-gradient(135deg, #EC4899, #A855F7)' : 'rgba(255,255,255,0.1)',
                                                color: '#FFF',
                                                fontWeight: 800,
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {username.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <strong style={{ color: '#F8FAFC', fontSize: '0.92rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    @{username}
                                                </strong>
                                                <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                                                    {isSub && (
                                                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(236, 72, 153, 0.2)', color: '#EC4899', fontWeight: 700 }}>
                                                            ★ SUB {subMultiplierActive && '(x2)'}
                                                        </span>
                                                    )}
                                                    {isMod && (
                                                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 700 }}>
                                                            🛡️ MOD
                                                        </span>
                                                    )}
                                                    {isVip && (
                                                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontWeight: 700 }}>
                                                            👑 VIP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {participants.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                <Radio size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                                <p style={{ margin: 0 }}>Aún no hay participantes en la lista.</p>
                                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                    Diles que escriban <strong style={{ color: '#9146FF' }}>{keyword}</strong> en el chat de Twitch.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: PANEL PRINCIPAL DE SORTEO Y ANIMACIÓN */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    padding: '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                    textAlign: 'center',
                    minHeight: '560px'
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
                        color: isStarted ? '#00ff88' : '#9146FF',
                        boxShadow: isStarted ? '0 0 35px rgba(0, 255, 136, 0.4)' : '0 0 35px rgba(145, 70, 255, 0.3)'
                    }}>
                        <Radio size={46} className={isStarted ? "animate-pulse" : ""} />
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                            {isStarted ? "Escuchando Mensajes en Vivo..." : "Sorteo en Espera"}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto' }}>
                            {isStarted 
                                ? `Esperando que los espectadores envíen "${keyword}" en el stream de Twitch.`
                                : 'Presiona "COMENZAR REGISTRO" en la barra lateral para empezar a recibir espectadores.'
                            }
                        </p>
                    </div>

                    {/* Resumen de Reglas Activas */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {subMultiplierActive && (
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', borderRadius: '12px', fontWeight: 700 }}>
                                ★ Subs x2 Chance
                            </span>
                        )}
                        {subsOnly && (
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', borderRadius: '12px', fontWeight: 700 }}>
                                🔒 Solo Suscriptores
                            </span>
                        )}
                        {!allowMods && (
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderRadius: '12px', fontWeight: 700 }}>
                                🚫 Mods Excluidos
                            </span>
                        )}
                        {!allowVips && (
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderRadius: '12px', fontWeight: 700 }}>
                                🚫 VIPs Excluidos
                            </span>
                        )}
                    </div>

                    {/* Contador Central */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '0.9rem 2rem',
                        borderRadius: '1.2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Trophy size={22} color="#9146FF" />
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#F8FAFC' }}>
                            {participants.length} Participante{participants.length !== 1 ? 's' : ''} Válido{participants.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* MODAL / CELEBRACIÓN DE GANADOR */}
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
                            <div className="gift-winner-label">🎉 ¡GANADOR DEL SORTEO! 🎉</div>
                            <div className="gift-winner-name">@{typeof winner === 'object' ? winner.username : winner}</div>
                            
                            <button onClick={() => setWinner(null)} className="close-modal-btn" style={{ background: 'white', color: '#1a0b2e', marginTop: '1.5rem', fontWeight: 800 }}>
                                <X size={20} /> CERRAR Y CONTINUAR
                            </button>

                            <div className="confetti-container">
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className="gift-confetti" style={{
                                        left: `${Math.random() * 100}%`,
                                        backgroundColor: ['#9146FF', '#00d4ff', '#EC4899', '#ffffff', '#F59E0B'][i % 5],
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

export default TwitchGiveawayMain;
