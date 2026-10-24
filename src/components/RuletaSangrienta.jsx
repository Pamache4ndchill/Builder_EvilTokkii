import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Skull, 
  Trash2, 
  Plus, 
  Volume2, 
  VolumeX, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Play, 
  Sparkles, 
  Check, 
  X,
  Users, 
  Flame, 
  Swords, 
  AlertCircle,
  Eye,
  EyeOff,
  Maximize2,
  Shield,
  Zap,
  Heart,
  Ghost,
  Crown,
  Bomb,
  Target,
  Dice5,
  Crosshair,
  Award,
  Gift,
  AlertTriangle,
  Key,
  Feather,
  Moon,
  Sun,
  Wand2,
  Trophy,
  HelpCircle,
  Tv,
  CheckCircle2,
  Search,
  Sliders,
  Settings2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './RuletaSangrienta.css';

// =========================================================================
// CATÁLOGO DE ICONOS OUTLINE (SOLO BORDES EN ROSA SUAVE)
// =========================================================================
export const OUTLINE_ICONS_LIST = [
  { name: 'Users', label: 'Usuarios / Equipo', component: Users },
  { name: 'Skull', label: 'Calavera / Muerte', component: Skull },
  { name: 'Shield', label: 'Escudo / Inmunidad', component: Shield },
  { name: 'Flame', label: 'Fuego / Furia', component: Flame },
  { name: 'Zap', label: 'Rayo / Energía', component: Zap },
  { name: 'Swords', label: 'Espadas / Duelo', component: Swords },
  { name: 'Heart', label: 'Corazón / Vida Extra', component: Heart },
  { name: 'Ghost', label: 'Fantasma / Sigilo', component: Ghost },
  { name: 'Crown', label: 'Corona / Realeza', component: Crown },
  { name: 'Sparkles', label: 'Magia / Bendición', component: Sparkles },
  { name: 'Bomb', label: 'Bomba / Explosión', component: Bomb },
  { name: 'Target', label: 'Diana / Puntería', component: Target },
  { name: 'Dice5', label: 'Dados / Azar', component: Dice5 },
  { name: 'Crosshair', label: 'Mira / Objetivo', component: Crosshair },
  { name: 'Award', label: 'Medalla / Honor', component: Award },
  { name: 'Eye', label: 'Ojo / Visión', component: Eye },
  { name: 'Gift', label: 'Regalo / Sorpresa', component: Gift },
  { name: 'AlertTriangle', label: 'Peligro / Alerta', component: AlertTriangle },
  { name: 'Key', label: 'Llave / Secreto', component: Key },
  { name: 'RefreshCw', label: 'Giro Extra / Repetir', component: RefreshCw },
  { name: 'Feather', label: 'Pluma / Respiro', component: Feather },
  { name: 'Moon', label: 'Luna / Sombra', component: Moon },
  { name: 'Sun', label: 'Sol / Salvación', component: Sun },
  { name: 'Wand2', label: 'Varita Mágica', component: Wand2 },
  { name: 'Trophy', label: 'Trofeo / Victoria', component: Trophy },
  { name: 'HelpCircle', label: 'Misterio / Incógnita', component: HelpCircle }
];

export const RenderOutlineIcon = ({ name, size = 18, color = '#f472b6', strokeWidth = 2, style = {} }) => {
  const item = OUTLINE_ICONS_LIST.find(i => i.name.toLowerCase() === (name || '').toLowerCase());
  const IconComp = item ? item.component : Zap;
  return <IconComp size={size} color={color} strokeWidth={strokeWidth} style={style} />;
};

// Paleta de colores rosa suave y elegantes para los sectores
export const BLOOD_COLORS = [
  '#db2777', // Rosa frambuesa medio
  '#f472b6', // Rosa suave pastel
  '#831843', // Ciruela profundo elegante
  '#ec4899', // Rosa Tokkii
  '#9d174d', // Rosa vino suave
  '#be185d', // Rosa frambuesa profundo
  '#f9a8d4', // Rosa claro pastel
  '#500724', // Noche terciopelo suave
];

const LOCAL_STORAGE_USERS_KEY = 'tokkii_ruleta_sangrienta_users_v3';
const LOCAL_STORAGE_RIGHT_SECTIONS_KEY = 'tokkii_ruleta_sangrienta_right_sections_v2';
const LOCAL_STORAGE_POWERS_KEY = 'tokkii_ruleta_sangrienta_powers_v2';
const LOCAL_STORAGE_EVIL_SLOTS_KEY = 'tokkii_ruleta_sangrienta_evil_slots_v1';
const LOCAL_STORAGE_ACTIVE_VIEW_KEY = 'tokkii_ruleta_sangrienta_active_view_v1';

// Participantes iniciales por defecto (EvilTokkii como usuario permanente por defecto)
const DEFAULT_INITIAL_USERS = [
  { id: 'u_eviltokkii_perm', name: 'EvilTokkii', powers: [], source: 'permanent' },
  { id: 'u_1', name: 'Tokkii', powers: ['Inmunidad'], source: 'manual' },
  { id: 'u_2', name: 'Viewer_01', powers: [], source: 'manual' },
  { id: 'u_3', name: 'Espectador_Pro', powers: ['Doble Giro'], source: 'manual' },
  { id: 'u_4', name: 'Dark_Hunter', powers: [], source: 'manual' },
  { id: 'u_5', name: 'Sangre_Real', powers: ['Revivir'], source: 'manual' }
];

// Algoritmo de dispersión para distribuir las repeticiones de EvilTokkii
// de forma aleatoria/espaciada sin que queden casillas de EvilTokkii pegadas entre sí
export function distributeWheelItems(usersList, evilSlotsCount) {
  const evilUser = usersList.find(u => u.name.toLowerCase() === 'eviltokkii') || {
    id: 'u_eviltokkii_perm',
    name: 'EvilTokkii',
    powers: [],
    source: 'permanent'
  };
  const others = usersList.filter(u => u.name.toLowerCase() !== 'eviltokkii');

  if (evilSlotsCount <= 0) {
    return others.length > 0 ? others : [{ id: 'u_vacio', name: 'Sin participantes', powers: [], source: 'manual' }];
  }
  if (others.length === 0) {
    return Array.from({ length: evilSlotsCount }, (_, i) => ({
      ...evilUser,
      id: `evil_${i}`
    }));
  }

  const total = others.length + evilSlotsCount;
  const result = new Array(total).fill(null);

  // Espaciado uniforme para distribuir EvilTokkii
  const step = total / evilSlotsCount;
  const evilPositions = new Set();
  
  // Offset variable para variar la posición inicial
  const offset = Math.floor((others.length * 7 + evilSlotsCount * 3) % Math.max(1, Math.min(step, total)));

  for (let i = 0; i < evilSlotsCount; i++) {
    let ideal = Math.round(offset + i * step) % total;
    let placed = false;
    for (let d = 0; d < total; d++) {
      let testIdx = (ideal + d) % total;
      let prevIdx = (testIdx - 1 + total) % total;
      let nextIdx = (testIdx + 1) % total;

      const hasConflict = evilPositions.has(testIdx) ||
        (evilPositions.has(prevIdx) && evilPositions.size < others.length) ||
        (evilPositions.has(nextIdx) && evilPositions.size < others.length);

      if (!hasConflict) {
        evilPositions.add(testIdx);
        placed = true;
        break;
      }
    }
    if (!placed) {
      for (let s = 0; s < total; s++) {
        if (!evilPositions.has(s)) {
          evilPositions.add(s);
          break;
        }
      }
    }
  }

  let otherIdx = 0;
  for (let i = 0; i < total; i++) {
    if (evilPositions.has(i)) {
      result[i] = {
        ...evilUser,
        id: `evil_slice_${i}`
      };
    } else {
      result[i] = others[otherIdx % others.length];
      otherIdx++;
    }
  }

  return result;
}

// Secciones iniciales por defecto para la Ruleta Derecha
export const DEFAULT_RIGHT_SECTIONS = [
  { id: 'sec_1', label: 'Castigo Leve', icon: 'AlertTriangle' },
  { id: 'sec_2', label: 'Duelo a Muerte', icon: 'Swords' },
  { id: 'sec_3', label: 'Inmune / Salvado', icon: 'Shield' },
  { id: 'sec_4', label: 'Castigo Severo', icon: 'Skull' },
  { id: 'sec_5', label: 'Revivir Compañero', icon: 'Heart' },
  { id: 'sec_6', label: 'Doble Giro', icon: 'RefreshCw' },
  { id: 'sec_7', label: 'Bomba Sorpresa', icon: 'Bomb' },
  { id: 'sec_8', label: 'Premio Especial', icon: 'Trophy' }
];

// Paleta de colores personalizables para los iconos de poderes
export const POWER_COLOR_PRESETS = [
  { label: 'Celeste / Cyan', value: '#38bdf8' },
  { label: 'Rosa Tokkii', value: '#f472b6' },
  { label: 'Verde Neón', value: '#34d399' },
  { label: 'Dorado / Amarillo', value: '#fbbf24' },
  { label: 'Púrpura / Violeta', value: '#c084fc' },
  { label: 'Rojo Carmesí', value: '#f87171' },
  { label: 'Naranja Fuego', value: '#fb923c' },
  { label: 'Azul Real', value: '#60a5fa' },
  { label: 'Blanco Puro', value: '#ffffff' }
];

// Poderes iniciales por defecto creados por la streamer
export const DEFAULT_POWERS = [
  { id: 'pow_1', name: 'Inmunidad', icon: 'Shield', color: '#38bdf8', description: 'Te salva si la ruleta te selecciona para castigo.' },
  { id: 'pow_2', name: 'Revivir', icon: 'Heart', color: '#f472b6', description: 'Vuelve a la ruleta si has sido eliminado.' },
  { id: 'pow_3', name: 'Doble Giro', icon: 'RefreshCw', color: '#fbbf24', description: 'Obliga a girar la ruleta de castigos otra vez.' },
  { id: 'pow_4', name: 'Escudo Fantasma', icon: 'Ghost', color: '#c084fc', description: 'Evita el castigo y pasa al siguiente.' }
];

// Helper para sonidos usando Web Audio API
const audioContextSingleton = {
  ctx: null,
  getCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    return this.ctx;
  },
  playTick() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  },
  playWinner() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch (e) {}
  }
};

// Normalizar usuario si viene como string
export function normalizeUserItem(u) {
  if (!u) return null;
  if (typeof u === 'string') {
    return { id: `u_${u}_${Date.now()}`, name: u.trim(), powers: [], source: 'manual' };
  }
  return {
    id: u.id || `u_${u.name}`,
    name: u.name,
    powers: Array.isArray(u.powers) ? u.powers : [],
    source: u.source || 'manual'
  };
}

// -------------------------------------------------------------------------
// COMPONENTE: CANVAS DE UNA SOLA RULETA (ALTA DEFINICIÓN)
// -------------------------------------------------------------------------
const SingleRuletaCanvas = ({
  wheelId = 1,
  title = "RULETA",
  items = [],
  rotation = 0,
  isSpinning = false,
  winner = null,
  onSpin,
  onDismissWinner,
  onConsumePower,
  allPowers = [],
  isMuted = false,
  hideInternalBanner = false
}) => {
  const canvasRef = useRef(null);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 25;

    ctx.clearRect(0, 0, width, height);

    const total = items.length;
    if (total === 0) {
      // Estado vacío
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 8, 22, 0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = 'rgba(251, 207, 232, 0.65)';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(wheelId === 1 ? 'Sin participantes' : 'Sin opciones', centerX, centerY + 8);
      return;
    }

    const arcSize = (Math.PI * 2) / total;

    // 1. Aro Exterior con remaches
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1e0513';
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 6;
    ctx.stroke();

    // 2. Dibujar Sectores
    items.forEach((item, i) => {
      const angle = i * arcSize;
      const color = BLOOD_COLORS[i % BLOOD_COLORS.length];
      const textLabel = typeof item === 'string' ? item : (item.name || item.label || 'Opción');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = color;
      ctx.fill();

      // Borde entre segmentos
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Texto de cada sector: adaptativo en tamaño y longitud para llegar hasta casi el borde exterior
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);

      const centerRadius = 65;
      const startRadius = centerRadius + 22; // Separado del círculo central (87px)
      const maxRadius = radius - 20; // Casi hasta el borde exterior (325px)
      const availableWidth = maxRadius - startRadius; // ~238px
      const targetWidth = availableWidth * 0.92; // ~219px (usa hasta casi el borde exterior)

      // Altura máxima del sector en la zona interior para que el texto no choque con sectores vecinos
      const wedgeHeightAtStart = 2 * startRadius * Math.sin(arcSize / 2);
      const maxAllowedFontSize = Math.max(12, Math.min(42, Math.floor(wedgeHeightAtStart * 0.82)));

      // 1. Medir el texto a un tamaño de referencia
      ctx.font = 'bold 20px Inter, sans-serif';
      const refWidth = ctx.measureText(textLabel).width || 1;

      // 2. Calcular tamaño de fuente adaptativo para que la longitud del nombre use casi hasta el borde exterior
      let calculatedFontSize = Math.round(20 * (targetWidth / refWidth));
      let finalFontSize = Math.max(10, Math.min(maxAllowedFontSize, calculatedFontSize));

      ctx.font = `bold ${finalFontSize}px Inter, sans-serif`;
      let textWidth = ctx.measureText(textLabel).width;

      // Si por alguna razón excede availableWidth, ajustar para que quepa 100% en 1 sola línea
      if (textWidth > availableWidth) {
        finalFontSize = Math.max(9, Math.floor(finalFontSize * (availableWidth / textWidth)));
        ctx.font = `bold ${finalFontSize}px Inter, sans-serif`;
        textWidth = ctx.measureText(textLabel).width;
      }

      // 3. Si la fuente llegó al tope de altura permitida pero aún queda espacio radial para llegar al borde exterior,
      // añadir espaciado adaptativo entre letras (letter spacing)
      let letterSpacingPx = 0;
      if (textWidth < targetWidth && textLabel.length > 1) {
        const remainingSpace = targetWidth - textWidth;
        letterSpacingPx = Math.min(8, remainingSpace / (textLabel.length - 1));
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const isEvilSlice = textLabel.toLowerCase() === 'eviltokkii';
      if (isEvilSlice) {
        ctx.fillStyle = '#fce7f3';
        ctx.shadowColor = 'rgba(244, 114, 182, 0.95)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 7;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      // Dibujar texto ocupando la longitud hacia el borde exterior
      if ('letterSpacing' in ctx && letterSpacingPx > 0.3) {
        ctx.letterSpacing = `${letterSpacingPx.toFixed(1)}px`;
        ctx.fillText(textLabel, startRadius, 0);
      } else if (letterSpacingPx > 0.5) {
        let curX = startRadius;
        for (let c = 0; c < textLabel.length; c++) {
          const char = textLabel[c];
          ctx.fillText(char, curX, 0);
          curX += ctx.measureText(char).width + letterSpacingPx;
        }
      } else {
        ctx.fillText(textLabel, startRadius, 0);
      }

      ctx.restore();
    });

    // 3. Pequeños remaches en el aro exterior
    const numStuds = Math.max(16, total * 2);
    for (let s = 0; s < numStuds; s++) {
      const studAngle = (s * Math.PI * 2) / numStuds;
      const sx = centerX + (radius + 6) * Math.cos(studAngle);
      const sy = centerY + (radius + 6) * Math.sin(studAngle);
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fillStyle = s % 2 === 0 ? '#f472b6' : '#ffffff';
      ctx.fill();
    }

    // 4. Centro oscuro con borde rosa suave
    ctx.beginPath();
    ctx.arc(centerX, centerY, 65, 0, Math.PI * 2);
    ctx.fillStyle = '#14030d';
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [items, wheelId]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel, items]);

  // Extraer datos del ganador (objeto o string)
  const winnerLabel = useMemo(() => {
    if (!winner) return '';
    if (typeof winner === 'string') return winner;
    return winner.name || winner.label || '';
  }, [winner]);

  const winnerIcon = useMemo(() => {
    if (!winner || typeof winner === 'string') return null;
    return winner.icon || null;
  }, [winner]);

  const winnerPowers = useMemo(() => {
    if (!winner || typeof winner === 'string') return [];
    return Array.isArray(winner.powers) ? winner.powers : [];
  }, [winner]);

  return (
    <div className="ruleta-single-wheel-box">
      <div className="ruleta-wheel-header">
        <RenderOutlineIcon name={wheelId === 1 ? 'Users' : 'Flame'} size={24} color="#f472b6" />
        <span>{title}</span>
      </div>

      <div className="ruleta-canvas-wrapper">
        {/* Puntero Superior Daga/Gota */}
        <div className="ruleta-pointer-top">
          <svg viewBox="0 0 40 48" width="40" height="48" fill="none">
            <path 
              d="M20 46 L6 10 C3 4 8 0 14 0 L26 0 C32 0 37 4 34 10 Z" 
              fill="#f472b6" 
              stroke="#ffffff" 
              strokeWidth="2.5" 
            />
            <circle cx="20" cy="14" r="5" fill="#ffffff" />
          </svg>
        </div>

        {/* Canvas giratorio */}
        <div 
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 8s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            willChange: 'transform'
          }}
        >
          <canvas
            ref={canvasRef}
            width={740}
            height={740}
            style={{ width: '740px', height: '740px', display: 'block' }}
          />
        </div>

        {/* Botón Central de Giro */}
        <button
          type="button"
          className="ruleta-center-spin-btn"
          onClick={onSpin}
          disabled={isSpinning || items.length < 2}
          title={items.length < 2 ? "Añade al menos 2 elementos" : "Girar Ruleta"}
        >
          <Flame size={20} color="#f472b6" style={{ marginBottom: '2px' }} />
          <span>{isSpinning ? '...' : 'GIRAR'}</span>
        </button>

        {/* Banner Flotante del Ganador al detenerse con botón de cerrar y poderes */}
        {!hideInternalBanner && winner && !isSpinning && (
          <div className="ruleta-winner-banner">
            <button
              type="button"
              className="ruleta-winner-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onDismissWinner) onDismissWinner();
              }}
              title="Cerrar casilla para seguir girando"
            >
              <X size={18} />
            </button>

            <div>
              <span className="ruleta-winner-badge">
                {wheelId === 1 ? '✨ ¡PARTICIPANTE ELEGIDO! ✨' : '🎯 ¡RESULTADO DE RULETA! 🎯'}
              </span>

              {/* Si es de la ruleta derecha y tiene icono */}
              {winnerIcon && (
                <div style={{ margin: '8px 0 2px 0', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(244, 114, 182, 0.15)', border: '1.5px solid #f472b6', borderRadius: '50%', padding: '10px' }}>
                    <RenderOutlineIcon name={winnerIcon} size={36} color="#f472b6" />
                  </div>
                </div>
              )}

              <p className="winner-name">@{winnerLabel}</p>

              {/* Si es un participante y tiene poderes asignados */}
              {wheelId === 1 && winnerPowers.length > 0 && (
                <div className="ruleta-winner-powers-box">
                  <span style={{ fontSize: '0.78rem', color: '#fbcfe8', fontWeight: 800, letterSpacing: '0.5px' }}>
                    ⚡ PODERES DISPONIBLES:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', margin: '8px 0' }}>
                    {winnerPowers.map((powName, pIdx) => {
                      const pObj = allPowers.find(p => p.name.toLowerCase() === powName.toLowerCase());
                      const iconName = pObj?.icon || 'Zap';
                      const iconColor = pObj?.color || '#f472b6';
                      return (
                        <button
                          key={`${powName}-${pIdx}`}
                          type="button"
                          className="ruleta-winner-use-power-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onConsumePower) onConsumePower(winnerLabel, powName);
                          }}
                          title={`Activar/Consumir "${powName}"`}
                          style={{
                            background: `linear-gradient(135deg, ${iconColor}dd, ${iconColor}88)`,
                            boxShadow: `0 2px 14px ${iconColor}66`
                          }}
                        >
                          <RenderOutlineIcon name={iconName} size={15} color="#ffffff" />
                          <span>Usar {powName}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                    Pregúntale en stream si activa su poder.
                  </span>
                </div>
              )}

              <button
                type="button"
                className="ruleta-winner-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDismissWinner) onDismissWinner();
                }}
              >
                <Check size={16} /> Continuar / Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------
// MODAL: SELECTOR DE ICONOS OUTLINE (SOLO BORDES)
// -------------------------------------------------------------------------
export const OutlineIconPickerModal = ({ isOpen, onClose, onSelect, currentIcon }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredIcons = OUTLINE_ICONS_LIST.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ruleta-icon-modal-backdrop" onClick={onClose}>
      <div className="ruleta-icon-modal" onClick={e => e.stopPropagation()}>
        <div className="ruleta-icon-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RenderOutlineIcon name="Sparkles" size={20} color="#f472b6" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fbcfe8', fontWeight: 800 }}>
              Seleccionar Icono de Borde
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#f472b6', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Buscador */}
        <div style={{ padding: '12px 20px 0 20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Buscar icono (ej: calavera, espada, escudo, fuego)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
              autoFocus
            />
          </div>
        </div>

        {/* Grid de iconos */}
        <div className="ruleta-icon-grid">
          {filteredIcons.map(item => {
            const isSelected = (currentIcon || '').toLowerCase() === item.name.toLowerCase();
            return (
              <div
                key={item.name}
                className={`ruleta-icon-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(item.name);
                  onClose();
                }}
              >
                <RenderOutlineIcon name={item.name} size={30} color={isSelected ? '#ffffff' : '#f472b6'} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------
// OVERLAY 1920x1080 (Puro para OBS Studio con fondo 100% transparente)
// -------------------------------------------------------------------------
export const RuletaSangrientaOBSOverlay = ({ isPreview = false, supabase }) => {
  // 1. Participantes (Ruleta Izquierda)
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeUserItem).filter(Boolean);
        }
      }
    } catch (e) {}
    return DEFAULT_INITIAL_USERS.map(normalizeUserItem);
  });

  // 2. Secciones personalizables (Ruleta Derecha)
  const [rightSections, setRightSections] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RIGHT_SECTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_RIGHT_SECTIONS;
  });

  // 3. Poderes creados por la streamer
  const [powers, setPowers] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_POWERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_POWERS;
  });

  // Estado Ruleta 1 (Izquierda: Participantes)
  const [rotation1, setRotation1] = useState(0);
  const [isSpinning1, setIsSpinning1] = useState(false);
  const [winner1, setWinner1] = useState(null);
  const [isEliminatingModal, setIsEliminatingModal] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);

  // Repeticiones de casillas de EvilTokkii en la Ruleta
  const [evilTokkiiSlots, setEvilTokkiiSlots] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_EVIL_SLOTS_KEY);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0) return val;
      }
    } catch (e) {}
    return 1;
  });

  // Vista activa del Overlay: 'participants' (solo ruleta participantes) | 'castigos' (ruleta de castigos)
  const [activeView, setActiveView] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_VIEW_KEY);
      if (saved === 'castigos' || saved === 'participants') return saved;
    } catch (e) {}
    return 'participants';
  });

  // Distribución aleatoria no contigua de los ítems de la Ruleta 1
  const wheel1Items = useMemo(() => {
    return distributeWheelItems(users, evilTokkiiSlots);
  }, [users, evilTokkiiSlots]);

  const handleSwitchView = (viewName) => {
    setActiveView(viewName);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_VIEW_KEY, viewName);
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'SWITCH_VIEW', payload: viewName });
      bc.close();
    } catch (e) {}
  };

  // Estado Ruleta 2 (Derecha: Secciones / Castigos)
  const [rotation2, setRotation2] = useState(0);
  const [isSpinning2, setIsSpinning2] = useState(false);
  const [winner2, setWinner2] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [viewportScale, setViewportScale] = useState(1);

  // Auto-escalado responsive
  useEffect(() => {
    if (isPreview) return;

    const origBg = document.body.style.backgroundColor;
    const origOverflow = document.body.style.overflow;
    document.body.style.backgroundColor = 'transparent';
    document.body.style.overflow = 'hidden';

    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / 1920, vh / 1080);
      setViewportScale(s);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.backgroundColor = origBg;
      document.body.style.overflow = origOverflow;
    };
  }, [isPreview]);

  // Sincronización en tiempo real vía BroadcastChannel y localStorage
  useEffect(() => {
    let bc = null;
    try {
      bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SYNC_USERS') {
          if (Array.isArray(payload)) setUsers(payload.map(normalizeUserItem).filter(Boolean));
        } else if (type === 'SYNC_RIGHT_SECTIONS') {
          if (Array.isArray(payload)) setRightSections(payload);
        } else if (type === 'SYNC_POWERS') {
          if (Array.isArray(payload)) setPowers(payload);
        } else if (type === 'SYNC_EVIL_SLOTS') {
          if (typeof payload === 'number') setEvilTokkiiSlots(payload);
        } else if (type === 'SWITCH_VIEW') {
          if (payload === 'participants' || payload === 'castigos') setActiveView(payload);
        } else if (type === 'SPIN_WHEEL_1') {
          triggerSpin1(payload?.rotation);
        } else if (type === 'SPIN_WHEEL_2') {
          triggerSpin2(payload?.rotation);
        } else if (type === 'SPIN_BOTH') {
          triggerSpin1(payload?.rotation1);
          triggerSpin2(payload?.rotation2);
        } else if (type === 'SET_MUTED') {
          setIsMuted(!!payload);
        } else if (type === 'DISMISS_WINNER') {
          if (payload?.wheelId === 1) {
            setWinner1(null);
            setIsEliminatingModal(false);
            setSelectedTargetUser(null);
          } else if (payload?.wheelId === 2) {
            setWinner2(null);
          } else {
            setWinner1(null);
            setWinner2(null);
            setIsEliminatingModal(false);
            setSelectedTargetUser(null);
          }
        }
      };
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === LOCAL_STORAGE_USERS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setUsers(parsed.map(normalizeUserItem).filter(Boolean));
        } catch (err) {}
      } else if (e.key === LOCAL_STORAGE_RIGHT_SECTIONS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setRightSections(parsed);
        } catch (err) {}
      } else if (e.key === LOCAL_STORAGE_POWERS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPowers(parsed);
        } catch (err) {}
      } else if (e.key === LOCAL_STORAGE_EVIL_SLOTS_KEY && e.newValue !== null) {
        const val = parseInt(e.newValue, 10);
        if (!isNaN(val)) setEvilTokkiiSlots(val);
      } else if (e.key === LOCAL_STORAGE_ACTIVE_VIEW_KEY && e.newValue) {
        if (e.newValue === 'participants' || e.newValue === 'castigos') setActiveView(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Escuchar canjes de Twitch en tiempo real si supabase está disponible
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('ruleta_sangrienta_overlay_twitch_sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'twitch_redemptions' }, (payload) => {
        const item = payload?.new;
        if (!item || !item.username || !item.reward_name) return;

        const viewer = item.username.trim().replace(/^@/, '');
        const reward = item.reward_name.trim();

        // Si es canje de Ruleta Sangrienta
        if (reward.toLowerCase() === 'ruleta sangrienta') {
          setUsers(prev => {
            if (prev.some(u => u.name.toLowerCase() === viewer.toLowerCase())) return prev;
            const updated = [...prev, { id: `u_${viewer}_${Date.now()}`, name: viewer, powers: [], source: 'twitch' }];
            try {
              localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }

        // Si es canje de un Poder
        const matchedPower = powers.find(p => p.name.toLowerCase() === reward.toLowerCase());
        if (matchedPower) {
          setUsers(prev => {
            let updated = [...prev];
            const idx = updated.findIndex(u => u.name.toLowerCase() === viewer.toLowerCase());
            if (idx === -1) {
              updated.push({
                id: `u_${viewer}_${Date.now()}`,
                name: viewer,
                powers: [matchedPower.name],
                source: 'twitch'
              });
            } else {
              const u = { ...updated[idx] };
              u.powers = [...(u.powers || []), matchedPower.name];
              updated[idx] = u;
            }
            try {
              localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, powers]);

  // Sonido de tics en giro
  useEffect(() => {
    let interval = null;
    if ((isSpinning1 || isSpinning2) && !isMuted) {
      interval = setInterval(() => {
        audioContextSingleton.playTick();
      }, 130);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpinning1, isSpinning2, isMuted]);

  const triggerSpin1 = (explicitRotation = null) => {
    if (isSpinning1 || wheel1Items.length < 2) return;
    setIsSpinning1(true);
    setWinner1(null);
    setIsEliminatingModal(false);
    setSelectedTargetUser(null);

    const extra = 3600 + Math.floor(Math.random() * 1800) + Math.floor(Math.random() * 360);
    const newRot = explicitRotation !== null ? explicitRotation : rotation1 + extra;
    setRotation1(newRot);

    setTimeout(() => {
      setIsSpinning1(false);
      const total = wheel1Items.length;
      const arc = 360 / total;
      const normalized = (newRot % 360 + 360) % 360;
      const winningIdx = Math.floor(((270 - normalized + 360) % 360) / arc);
      const wonUser = wheel1Items[winningIdx] || wheel1Items[0];
      setWinner1(wonUser);
      if (!isMuted) audioContextSingleton.playWinner();
    }, 8000);
  };

  const triggerSpin2 = (explicitRotation = null) => {
    if (isSpinning2 || rightSections.length < 2) return;
    setIsSpinning2(true);
    setWinner2(null);

    const extra = 3600 + Math.floor(Math.random() * 1800) + Math.floor(Math.random() * 360);
    const newRot = explicitRotation !== null ? explicitRotation : rotation2 + extra;
    setRotation2(newRot);

    setTimeout(() => {
      setIsSpinning2(false);
      const total = rightSections.length;
      const arc = 360 / total;
      const normalized = (newRot % 360 + 360) % 360;
      const winningIdx = Math.floor(((270 - normalized + 360) % 360) / arc);
      const wonSection = rightSections[winningIdx] || rightSections[0];
      setWinner2(wonSection);
      if (!isMuted) audioContextSingleton.playWinner();
    }, 8000);
  };

  const handleDismissWinner1 = () => {
    setWinner1(null);
    setIsEliminatingModal(false);
    setSelectedTargetUser(null);
    try {
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'DISMISS_WINNER', payload: { wheelId: 1 } });
      bc.close();
    } catch (e) {}
  };

  // Eliminar al participante que el ganador de la ruleta seleccionó como objetivo
  const handleEliminateTargetUser = (targetUserName) => {
    if (!targetUserName) return;
    setUsers(prev => {
      const updated = prev.filter(u => u.name.toLowerCase() !== targetUserName.toLowerCase());
      try {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
        const bc = new BroadcastChannel('ruleta_sangrienta_channel');
        bc.postMessage({ type: 'SYNC_USERS', payload: updated });
        bc.close();
      } catch (e) {}
      return updated;
    });
    setSelectedTargetUser(null);
    setIsEliminatingModal(false);
    setWinner1(null);
    try {
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'DISMISS_WINNER', payload: { wheelId: 1 } });
      bc.close();
    } catch (e) {}
  };

  const handleDismissWinner2 = () => {
    setWinner2(null);
    try {
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'DISMISS_WINNER', payload: { wheelId: 2 } });
      bc.close();
    } catch (e) {}
  };

  // Consumir poder de un participante
  const handleConsumePower = (userName, powerName) => {
    setUsers(prev => {
      const updated = prev.map(u => {
        if (u.name.toLowerCase() === userName.toLowerCase()) {
          const powerIdx = u.powers.indexOf(powerName);
          if (powerIdx > -1) {
            const nextPowers = [...u.powers];
            nextPowers.splice(powerIdx, 1);
            return { ...u, powers: nextPowers };
          }
        }
        return u;
      });

      try {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
        const bc = new BroadcastChannel('ruleta_sangrienta_channel');
        bc.postMessage({ type: 'SYNC_USERS', payload: updated });
        bc.close();
      } catch (e) {}

      // Actualizar también el objeto del ganador si coincide
      if (winner1 && winner1.name.toLowerCase() === userName.toLowerCase()) {
        const powerIdx = (winner1.powers || []).indexOf(powerName);
        if (powerIdx > -1) {
          const nextPowers = [...winner1.powers];
          nextPowers.splice(powerIdx, 1);
          setWinner1({ ...winner1, powers: nextPowers });
        }
      }

      return updated;
    });
  };

  const overlayContent = (
    <div className="ruleta-sangrienta-overlay-1080p">
      {/* 1 y 2. ÁREA DE LA RULETA SEGÚN VISTA ACTIVA */}
      <div className="ruleta-sangrienta-wheels-area">
        {activeView === 'participants' ? (
          /* Ruleta 1: Participantes (Solo se muestra esta ruleta por defecto) */
          <SingleRuletaCanvas
            wheelId={1}
            title="PARTICIPANTES"
            items={wheel1Items}
            rotation={rotation1}
            isSpinning={isSpinning1}
            winner={winner1}
            onSpin={() => triggerSpin1()}
            onDismissWinner={handleDismissWinner1}
            onConsumePower={handleConsumePower}
            allPowers={powers}
            isMuted={isMuted}
            hideInternalBanner={true}
          />
        ) : (
          /* Ruleta 2: Destino / Castigos con botón arriba para volver */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              type="button"
              className="ruleta-btn-nav-back"
              onClick={() => handleSwitchView('participants')}
              title="Volver a la Ruleta de Participantes"
            >
              <ArrowLeft size={18} />
              <span>Ruleta de Participantes</span>
            </button>

            <SingleRuletaCanvas
              wheelId={2}
              title="DESTINO / CASTIGOS"
              items={rightSections}
              rotation={rotation2}
              isSpinning={isSpinning2}
              winner={winner2}
              onSpin={() => triggerSpin2()}
              onDismissWinner={handleDismissWinner2}
              isMuted={isMuted}
              hideInternalBanner={false}
            />
          </div>
        )}
      </div>

      {/* 3. RECUADRO A LA DERECHA: USUARIOS CON ICONOS DE PODERES */}
      <div className="ruleta-overlay-users-box">
        <div className="ruleta-overlay-users-header">
          <h2 className="ruleta-overlay-users-title">
            <RenderOutlineIcon name="Users" size={26} color="#f472b6" />
            PARTICIPANTES
          </h2>
          <span className="ruleta-overlay-users-badge">
            {users.length} {users.length === 1 ? 'REGISTRADO' : 'REGISTRADOS'}
          </span>
        </div>

        <div className="ruleta-overlay-users-list">
          {users.length === 0 ? (
            <div className="ruleta-overlay-empty-state">
              <Skull size={44} color="#f472b6" opacity={0.4} />
              <p>Esperando participantes...<br />Canjea <strong>"Ruleta Sangrienta"</strong> en Twitch para unirte.</p>
            </div>
          ) : (
            users.map((user, idx) => (
              <div key={`${user.name}-${idx}`} className="ruleta-overlay-user-pill">
                {/* Izquierda: #Número + Nombre + Twitch badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <span style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>#{idx + 1}</span>
                  <span 
                    style={{ 
                      wordBreak: 'break-word', 
                      fontWeight: 700, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }} 
                    title={user.name}
                  >
                    {user.name}
                  </span>
                  {user.source === 'twitch' && (
                    <span title="Twitch" style={{ color: '#c084fc', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                      <Tv size={12} />
                    </span>
                  )}
                </div>

                {/* Derecha: Iconos de los poderes pegados al lado derecho de la casilla */}
                {user.powers && user.powers.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {user.powers.map((powName, pIdx) => {
                      const powObj = powers.find(p => p.name.toLowerCase() === powName.toLowerCase());
                      const iconName = powObj?.icon || 'Zap';
                      const iconColor = powObj?.color || '#f472b6';
                      return (
                        <span
                          key={`${powName}-${pIdx}`}
                          className="ruleta-power-badge-overlay"
                          title={`Poder: ${powName}`}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderColor: `${iconColor}aa`,
                            background: `${iconColor}22`,
                            boxShadow: `0 0 10px ${iconColor}44`
                          }}
                        >
                          <RenderOutlineIcon name={iconName} size={15} color={iconColor} />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. MODAL CENTRADO EN PANTALLA COMPLETA CON DIFUMINADO DE FONDO PARA EL PARTICIPANTE ELEGIDO */}
      {winner1 && !isSpinning1 && (
        <div className="ruleta-winner-fullscreen-backdrop" onClick={(e) => e.stopPropagation()}>
          {(() => {
            const currentWinnerName = typeof winner1 === 'string' ? winner1 : (winner1?.name || '');
            const isEvilWinner = currentWinnerName.toLowerCase() === 'eviltokkii';

            if (isEvilWinner) {
              /* Ventana emergente específica cuando sale elegida EvilTokkii */
              return (
                <div className="ruleta-winner-modal-large" style={{ borderColor: '#f472b6', boxShadow: '0 0 100px rgba(244, 114, 182, 0.85), inset 0 0 50px rgba(219, 39, 119, 0.4)' }} onClick={(e) => e.stopPropagation()}>
                  <span className="ruleta-winner-badge" style={{ fontSize: '1.05rem', padding: '6px 22px', letterSpacing: '2px', background: 'rgba(244, 114, 182, 0.25)', border: '1.5px solid #f472b6', borderRadius: '20px' }}>
                    👑 ¡EVILTOKKII HA SIDO ELEGIDA! 👑
                  </span>

                  <p className="winner-name" style={{ fontSize: '3.4rem', margin: '14px 0 6px 0' }}>@EvilTokkii</p>

                  <p style={{ fontSize: '1.05rem', color: '#fbcfe8', fontWeight: 600, margin: '0 0 24px 0' }}>
                    ¡EvilTokkii ha caído en la ruleta! Es hora de girar la Ruleta de Castigos para definir su destino.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <button
                      type="button"
                      className="ruleta-btn-continuar"
                      onClick={() => {
                        handleDismissWinner1();
                        handleSwitchView('castigos');
                      }}
                      style={{
                        padding: '16px 36px',
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        gap: '12px'
                      }}
                    >
                      <Flame size={24} color="#ffffff" />
                      <span>Ruleta de Castigos</span>
                    </button>
                  </div>
                </div>
              );
            }

            if (!isEliminatingModal) {
              return (
                <div className="ruleta-winner-modal-large" onClick={(e) => e.stopPropagation()}>
                  <span className="ruleta-winner-badge" style={{ fontSize: '1rem', padding: '6px 20px', letterSpacing: '1.5px' }}>
                    ✨ ¡PARTICIPANTE ELEGIDO! ✨
                  </span>

                  <p className="winner-name">@{currentWinnerName}</p>

                  <div className="ruleta-winner-powers-box-large">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                      <RenderOutlineIcon name="Zap" size={18} color="#f472b6" />
                      <span style={{ fontSize: '0.88rem', color: '#fbcfe8', fontWeight: 800, letterSpacing: '0.8px' }}>
                        PODERES DISPONIBLES:
                      </span>
                    </div>

                    {Array.isArray(winner1?.powers) && winner1.powers.length > 0 ? (
                      <>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', margin: '14px 0' }}>
                          {winner1.powers.map((powName, pIdx) => {
                            const pObj = powers.find(p => p.name.toLowerCase() === powName.toLowerCase());
                            const iconName = pObj?.icon || 'Zap';
                            const iconColor = pObj?.color || '#f472b6';
                            return (
                              <button
                                key={`${powName}-${pIdx}`}
                                type="button"
                                className="ruleta-winner-use-power-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConsumePower(currentWinnerName, powName);
                                }}
                                title={`Activar/Consumir "${powName}"`}
                                style={{
                                  background: `linear-gradient(135deg, ${iconColor}ee, ${iconColor}99)`,
                                  boxShadow: `0 4px 18px ${iconColor}66`,
                                  border: `1.5px solid ${iconColor}`,
                                  borderRadius: '12px',
                                  padding: '10px 18px',
                                  color: '#ffffff',
                                  fontSize: '0.96rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  transition: 'transform 0.15s ease'
                                }}
                              >
                                <RenderOutlineIcon name={iconName} size={18} color="#ffffff" />
                                <span>Usar {powName}</span>
                              </button>
                            );
                          })}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                          Pregúntale en stream si activa su poder. Al hacer clic se consumirá automáticamente.
                        </span>
                      </>
                    ) : (
                      <div style={{ margin: '10px 0', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(244,114,182,0.25)' }}>
                        <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', fontWeight: 600 }}>
                          Vacío
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botones: Continuar (Izq) y Eliminar (Der) */}
                  <div className="ruleta-modal-actions-row">
                    <button
                      type="button"
                      className="ruleta-btn-continuar"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissWinner1();
                      }}
                    >
                      <Check size={18} /> Continuar
                    </button>

                    <button
                      type="button"
                      className="ruleta-btn-eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEliminatingModal(true);
                        setSelectedTargetUser(null);
                      }}
                      title="Verificar poderes y elegir a quién eliminar"
                    >
                      <Skull size={18} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="ruleta-winner-modal-large ruleta-elimination-modal-wide" style={{ borderColor: '#f43f5e' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#f43f5e', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '1.5px' }}>
                  <Skull size={26} color="#f43f5e" />
                  <span>MODALIDAD DE ELIMINACIÓN</span>
                </div>

                <p style={{ margin: '12px 0 6px 0', color: '#ffffff', fontSize: '2.1rem', fontWeight: 900 }}>
                  <span style={{ color: '#f472b6' }}>@{typeof winner1 === 'string' ? winner1 : (winner1?.name || '')}</span> elige a quién eliminar:
                </p>

                <p style={{ fontSize: '0.96rem', color: '#fbcfe8', opacity: 0.95, margin: '0 0 16px 0' }}>
                  Selecciona al participante que saldrá del juego. Si alguien activa un poder de salvación, haz clic en su icono para consumirlo:
                </p>

                {/* Lista de Participantes Restantes en 2 Columnas Adaptativas */}
                {(() => {
                  const currentWinnerName = (typeof winner1 === 'string' ? winner1 : (winner1?.name || '')).toLowerCase();
                  const remainingUsers = users.filter(u => u.name.toLowerCase() !== currentWinnerName);
                  if (remainingUsers.length === 0) {
                    return (
                      <div className="ruleta-elimination-users-list" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '30px', color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', fontStyle: 'italic' }}>
                          No quedan otros participantes registrados en la lista.
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div 
                      className="ruleta-elimination-users-list"
                      style={{
                        gridTemplateColumns: remainingUsers.length === 1 ? '1fr' : 'repeat(2, 1fr)'
                      }}
                    >
                      {remainingUsers.map((u, rIdx) => {
                        const isSelected = selectedTargetUser === u.name;
                        return (
                          <div
                            key={`${u.name}-${rIdx}`}
                            onClick={() => setSelectedTargetUser(u.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 18px',
                              background: isSelected ? 'linear-gradient(90deg, rgba(225, 29, 72, 0.35) 0%, rgba(159, 18, 57, 0.25) 100%)' : 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '14px',
                              border: isSelected ? '2px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.12)',
                              boxShadow: isSelected ? '0 0 22px rgba(244, 63, 94, 0.65)' : 'none',
                              gap: '14px',
                              cursor: 'pointer',
                              minHeight: '52px',
                              boxSizing: 'border-box',
                              transition: 'all 0.18s ease'
                            }}
                          >
                            {/* Izquierda: Selector / Target + Nombre con fuente más grande */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                              <span style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: isSelected ? '#f43f5e' : 'rgba(244, 114, 182, 0.18)',
                                color: isSelected ? '#ffffff' : '#f472b6',
                                fontSize: '0.92rem',
                                fontWeight: 900,
                                flexShrink: 0
                              }}>
                                {isSelected ? <Target size={18} /> : `#${rIdx + 1}`}
                              </span>
                              <span style={{ 
                                color: isSelected ? '#ffffff' : '#f8fafc', 
                                fontWeight: isSelected ? 900 : 800, 
                                fontSize: '1.25rem', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }}
                              title={u.name}
                              >
                                {u.name}
                              </span>
                              {isSelected && (
                                <span style={{ 
                                  background: '#f43f5e', 
                                  color: '#ffffff', 
                                  fontSize: '0.74rem', 
                                  fontWeight: 900, 
                                  padding: '3px 9px', 
                                  borderRadius: '7px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  flexShrink: 0
                                }}>
                                  Objetivo
                                </span>
                              )}
                            </div>

                            {/* Derecha: Poderes asignados (clickeables para consumir) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              {u.powers && u.powers.length > 0 ? (
                                u.powers.map((powName, pIdx) => {
                                  const pObj = powers.find(p => p.name.toLowerCase() === powName.toLowerCase());
                                  const iconName = pObj?.icon || 'Zap';
                                  const iconColor = pObj?.color || '#f472b6';
                                  return (
                                    <button
                                      key={`${powName}-${pIdx}`}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleConsumePower(u.name, powName);
                                      }}
                                      title={`Click para activar/consumir poder "${powName}" de ${u.name}`}
                                      style={{
                                        background: `linear-gradient(135deg, ${iconColor}44, ${iconColor}25)`,
                                        border: `1.5px solid ${iconColor}`,
                                        borderRadius: '9px',
                                        padding: '6px 12px',
                                        color: '#ffffff',
                                        fontSize: '0.9rem',
                                        fontWeight: 800,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        boxShadow: `0 0 10px ${iconColor}55`,
                                        transition: 'transform 0.15s ease'
                                      }}
                                    >
                                      <RenderOutlineIcon name={iconName} size={16} color={iconColor} />
                                      <span>{powName}</span>
                                    </button>
                                  );
                                })
                              ) : (
                                <span style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', fontWeight: 600 }}>
                                  Vacío
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Botones de acción en modo Eliminación */}
                <div className="ruleta-modal-actions-row">
                  <button
                    type="button"
                    className="ruleta-btn-volver"
                    style={{ fontSize: '1.15rem', padding: '16px 28px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEliminatingModal(false);
                      setSelectedTargetUser(null);
                    }}
                  >
                    Volver
                  </button>

                  <button
                    type="button"
                    className="ruleta-btn-danger-confirm"
                    disabled={!selectedTargetUser}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedTargetUser) {
                        handleEliminateTargetUser(selectedTargetUser);
                      }
                    }}
                    style={{
                      opacity: selectedTargetUser ? 1 : 0.45,
                      cursor: selectedTargetUser ? 'pointer' : 'not-allowed',
                      fontSize: '1.15rem',
                      padding: '16px 30px'
                    }}
                  >
                    <Skull size={20} />
                    {selectedTargetUser ? `Eliminar a @${selectedTargetUser}` : 'Selecciona un participante'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );

  if (isPreview) {
    return overlayContent;
  }

  return (
    <div className="ruleta-overlay-fullscreen-root">
      <div 
        className="ruleta-overlay-scaled-stage"
        style={{
          transform: `scale(${viewportScale})`
        }}
      >
        {overlayContent}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------
// VISTA PRINCIPAL DEL BUILDER (PREVIEW 16:9 + CONTROLES Y GESTIÓN COMPLETA)
// -------------------------------------------------------------------------
export default function RuletaSangrientaManager({ onBack, supabase }) {
  // Pestaña activa en el panel inferior
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' | 'sections' | 'powers'

  // 1. Participantes
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeUserItem).filter(Boolean);
        }
      }
    } catch (e) {}
    return DEFAULT_INITIAL_USERS.map(normalizeUserItem);
  });

  // 2. Secciones Ruleta Derecha
  const [rightSections, setRightSections] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RIGHT_SECTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_RIGHT_SECTIONS;
  });

  // 3. Poderes
  const [powers, setPowers] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_POWERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_POWERS;
  });

  // Formularios de entrada
  const [inputName, setInputName] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Formulario nueva sección ruleta derecha
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [newSectionIcon, setNewSectionIcon] = useState('AlertTriangle');

  // Formulario nuevo poder
  const [newPowerName, setNewPowerName] = useState('');
  const [newPowerIcon, setNewPowerIcon] = useState('Shield');
  const [newPowerColor, setNewPowerColor] = useState('#38bdf8');
  const [newPowerDesc, setNewPowerDesc] = useState('');

  // Modal selector de iconos
  const [iconPickerTarget, setIconPickerTarget] = useState(null); // 'section' | 'power' | null

  // Asignar poder manual a usuario
  const [assigningPowerUser, setAssigningPowerUser] = useState(null);

  // Repeticiones de EvilTokkii en la Ruleta
  const [evilTokkiiSlots, setEvilTokkiiSlots] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_EVIL_SLOTS_KEY);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0) return val;
      }
    } catch (e) {}
    return 1;
  });

  // Vista activa de la Ruleta: 'participants' | 'castigos'
  const [activeView, setActiveView] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_VIEW_KEY);
      if (saved === 'castigos' || saved === 'participants') return saved;
    } catch (e) {}
    return 'participants';
  });

  const saveAndSyncEvilSlots = (newSlots) => {
    const clamped = Math.max(0, newSlots);
    setEvilTokkiiSlots(clamped);
    try {
      localStorage.setItem(LOCAL_STORAGE_EVIL_SLOTS_KEY, clamped.toString());
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'SYNC_EVIL_SLOTS', payload: clamped });
      bc.close();
    } catch (e) {}
  };

  const saveAndSyncActiveView = (newView) => {
    setActiveView(newView);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_VIEW_KEY, newView);
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'SWITCH_VIEW', payload: newView });
      bc.close();
    } catch (e) {}
  };

  // Sincronizar cambios externos de slots o vista en el manager
  useEffect(() => {
    let bc = null;
    try {
      bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SYNC_EVIL_SLOTS' && typeof payload === 'number') {
          setEvilTokkiiSlots(payload);
        } else if (type === 'SWITCH_VIEW' && (payload === 'participants' || payload === 'castigos')) {
          setActiveView(payload);
        }
      };
    } catch(e) {}

    const handleStorage = (e) => {
      if (e.key === LOCAL_STORAGE_EVIL_SLOTS_KEY && e.newValue !== null) {
        const val = parseInt(e.newValue, 10);
        if (!isNaN(val)) setEvilTokkiiSlots(val);
      } else if (e.key === LOCAL_STORAGE_ACTIVE_VIEW_KEY && e.newValue) {
        if (e.newValue === 'participants' || e.newValue === 'castigos') setActiveView(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Estados generales
  const [isMuted, setIsMuted] = useState(false);
  const [copiedObs, setCopiedObs] = useState(false);
  const [syncingTwitch, setSyncingTwitch] = useState(false);
  const [twitchSyncMsg, setTwitchSyncMsg] = useState(null);

  const previewScalerRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState(0.6);

  // Guardar y sincronizar usuarios
  const saveAndSyncUsers = (newUsers) => {
    setUsers(newUsers);
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(newUsers));
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'SYNC_USERS', payload: newUsers });
      bc.close();
    } catch (e) {}
  };

  // Guardar y sincronizar secciones ruleta derecha
  const saveAndSyncSections = (newSections) => {
    setRightSections(newSections);
    try {
      localStorage.setItem(LOCAL_STORAGE_RIGHT_SECTIONS_KEY, JSON.stringify(newSections));
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'SYNC_RIGHT_SECTIONS', payload: newSections });
      bc.close();
    } catch (e) {}
  };

  // Guardar y sincronizar poderes
  const saveAndSyncPowers = (newPowers) => {
    setPowers(newPowers);
    try {
      localStorage.setItem(LOCAL_STORAGE_POWERS_KEY, JSON.stringify(newPowers));
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      bc.postMessage({ type: 'SYNC_POWERS', payload: newPowers });
      bc.close();
    } catch (e) {}
  };

  // Escuchar canjes de Twitch en tiempo real en el manager
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('ruleta_sangrienta_manager_twitch_sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'twitch_redemptions' }, (payload) => {
        const item = payload?.new;
        if (!item || !item.username || !item.reward_name) return;

        const viewer = item.username.trim().replace(/^@/, '');
        const reward = item.reward_name.trim();

        // Si es canje "Ruleta Sangrienta"
        if (reward.toLowerCase() === 'ruleta sangrienta') {
          setUsers(prev => {
            if (prev.some(u => u.name.toLowerCase() === viewer.toLowerCase())) return prev;
            const updated = [...prev, { id: `u_${viewer}_${Date.now()}`, name: viewer, powers: [], source: 'twitch' }];
            saveAndSyncUsers(updated);
            return updated;
          });
          setTwitchSyncMsg(`✨ @${viewer} se unió por canje de "Ruleta Sangrienta"!`);
          setTimeout(() => setTwitchSyncMsg(null), 5000);
        }

        // Si es canje de un Poder
        const matchedPower = powers.find(p => p.name.toLowerCase() === reward.toLowerCase());
        if (matchedPower) {
          setUsers(prev => {
            let updated = [...prev];
            const idx = updated.findIndex(u => u.name.toLowerCase() === viewer.toLowerCase());
            if (idx === -1) {
              updated.push({
                id: `u_${viewer}_${Date.now()}`,
                name: viewer,
                powers: [matchedPower.name],
                source: 'twitch'
              });
            } else {
              const u = { ...updated[idx] };
              u.powers = [...(u.powers || []), matchedPower.name];
              updated[idx] = u;
            }
            saveAndSyncUsers(updated);
            return updated;
          });
          setTwitchSyncMsg(`⚡ @${viewer} canjeó el poder "${matchedPower.name}"!`);
          setTimeout(() => setTwitchSyncMsg(null), 5000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, powers]);

  // Sincronización manual de canjes desde Twitch Helix API y Supabase (Exclusivo para Ruleta Sangrienta y Poderes)
  const handleSyncTwitchRedemptions = async () => {
    setSyncingTwitch(true);
    try {
      // 1. Si hay token disponible en localStorage, consultar Twitch Helix para "Ruleta Sangrienta" y poderes
      const rawToken = (localStorage.getItem('twitch_broadcaster_oauth') || localStorage.getItem('twitch_bot_oauth') || '').replace(/^oauth:/i, '').trim();
      if (rawToken) {
        try {
          const valRes = await fetch('https://id.twitch.tv/oauth2/validate', {
            headers: { 'Authorization': `OAuth ${rawToken}` }
          });
          if (valRes.ok) {
            const valData = await valRes.json();
            const clientId = valData.client_id;
            const broadcasterId = valData.user_id || '1131620140';

            const rewardsRes = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}&only_manageable_rewards=false`, {
              headers: {
                'Authorization': `Bearer ${rawToken}`,
                'Client-Id': clientId
              }
            });

            if (rewardsRes.ok) {
              const rwData = await rewardsRes.json();
              const twitchRewards = rwData.data || [];
              const powerNames = powers.map(p => p.name.toLowerCase());
              const ruletaRewards = twitchRewards.filter(r => {
                const t = (r.title || '').trim().toLowerCase();
                return t === 'ruleta sangrienta' || powerNames.includes(t);
              });

              for (const r of ruletaRewards) {
                for (const stat of ['UNFULFILLED', 'FULFILLED']) {
                  try {
                    const redRes = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcasterId}&reward_id=${r.id}&status=${stat}&first=50&sort=NEWEST`, {
                      headers: {
                        'Authorization': `Bearer ${rawToken}`,
                        'Client-Id': clientId
                      }
                    });
                    if (redRes.ok) {
                      const redData = await redRes.json();
                      const list = redData.data || [];
                      for (const item of list) {
                        const uName = (item.user_name || item.user_login || '').trim().replace(/^@/, '');
                        const rName = r.title.trim();
                        const rDate = item.redeemed_at || new Date().toISOString();
                        if (supabase && uName && rName) {
                          try {
                            await supabase.from('twitch_redemptions').insert([{
                              reward_name: rName,
                              username: uName,
                              created_at: rDate
                            }]);
                          } catch(e) {}
                        }
                      }
                    }
                  } catch(e) {}
                }
              }
            }
          }
        } catch(helixErr) {
          console.warn("Consulta Helix en Ruleta:", helixErr);
        }
      }

      // 2. Cargar canjes desde Supabase a la lista de participantes de la ruleta
      let data = [];
      if (supabase) {
        const { data: dbData, error } = await supabase
          .from('twitch_redemptions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (!error && dbData) {
          data = dbData;
        }
      }

      let addedCount = 0;
      let powerCount = 0;
      let updatedUsers = [...users];

      (data || []).forEach(item => {
        if (!item.username || !item.reward_name) return;
        const viewer = item.username.trim().replace(/^@/, '');
        const reward = item.reward_name.trim();

        // Canje Ruleta Sangrienta
        if (reward.toLowerCase() === 'ruleta sangrienta') {
          const exists = updatedUsers.some(u => u.name.toLowerCase() === viewer.toLowerCase());
          if (!exists) {
            updatedUsers.push({
              id: `u_${viewer}_${Date.now()}_${Math.random()}`,
              name: viewer,
              powers: [],
              source: 'twitch'
            });
            addedCount++;
          }
        }

        // Canje de poderes
        const matchedPower = powers.find(p => p.name.toLowerCase() === reward.toLowerCase());
        if (matchedPower) {
          const uIdx = updatedUsers.findIndex(u => u.name.toLowerCase() === viewer.toLowerCase());
          if (uIdx > -1) {
            const u = { ...updatedUsers[uIdx] };
            if (!u.powers.includes(matchedPower.name)) {
              u.powers = [...u.powers, matchedPower.name];
              updatedUsers[uIdx] = u;
              powerCount++;
            }
          }
        }
      });

      if (addedCount > 0 || powerCount > 0) {
        saveAndSyncUsers(updatedUsers);
        setTwitchSyncMsg(`✅ Sincronizados: +${addedCount} usuarios y +${powerCount} poderes desde Twitch.`);
      } else {
        setTwitchSyncMsg(`ℹ️ No hay nuevos canjes pendientes de Ruleta Sangrienta o Poderes.`);
      }
      setTimeout(() => setTwitchSyncMsg(null), 5000);
    } catch (err) {
      console.error(err);
      alert(`Error al sincronizar canjes: ${err.message}`);
    } finally {
      setSyncingTwitch(false);
    }
  };

  // Ajustar escala responsive para previsualizar el overlay de 1920x1080
  useEffect(() => {
    const handleResize = () => {
      if (previewScalerRef.current) {
        const width = previewScalerRef.current.clientWidth;
        setScaleFactor(width / 1920);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Agregar 1 usuario manual
  const handleAddUser = (e) => {
    if (e) e.preventDefault();
    const clean = inputName.trim().replace(/^@/, '');
    if (!clean) return;

    if (users.some(u => u.name.toLowerCase() === clean.toLowerCase())) {
      alert(`El usuario "${clean}" ya está registrado.`);
      return;
    }

    const updated = [...users, { id: `u_${clean}_${Date.now()}`, name: clean, powers: [], source: 'manual' }];
    saveAndSyncUsers(updated);
    setInputName('');
  };

  // Eliminar usuario
  const handleDeleteUser = (index) => {
    const target = users[index];
    if (target && target.name.toLowerCase() === 'eviltokkii') {
      // EvilTokkii decide eliminar su casilla de la ruleta
      saveAndSyncEvilSlots(0);
      return;
    }
    const updated = users.filter((_, i) => i !== index);
    saveAndSyncUsers(updated);
  };

  // Limpiar todos los usuarios (EvilTokkii se mantiene permanente)
  const handleClearAllUsers = () => {
    if (window.confirm("¿Seguro que deseas vaciar toda la lista de participantes? EvilTokkii se mantendrá permanente.")) {
      const evilUser = users.find(u => u.name.toLowerCase() === 'eviltokkii') || {
        id: 'u_eviltokkii_perm',
        name: 'EvilTokkii',
        powers: [],
        source: 'permanent'
      };
      saveAndSyncUsers([evilUser]);
    }
  };

  // Importación masiva
  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput
      .split(/[\n,]+/)
      .map(s => s.trim().replace(/^@/, ''))
      .filter(s => s.length > 0);

    const newItems = [];
    lines.forEach(name => {
      if (!users.some(u => u.name.toLowerCase() === name.toLowerCase()) && !newItems.some(n => n.name.toLowerCase() === name.toLowerCase())) {
        newItems.push({ id: `u_${name}_${Date.now()}_${Math.random()}`, name, powers: [], source: 'manual' });
      }
    });

    const updated = [...users, ...newItems];
    saveAndSyncUsers(updated);
    setBulkInput('');
    setShowBulkModal(false);
  };

  // Agregar nueva sección a la ruleta derecha
  const handleAddSection = (e) => {
    if (e) e.preventDefault();
    const clean = newSectionLabel.trim();
    if (!clean) return;

    const newSec = {
      id: `sec_${Date.now()}`,
      label: clean,
      icon: newSectionIcon || 'AlertTriangle'
    };

    saveAndSyncSections([...rightSections, newSec]);
    setNewSectionLabel('');
  };

  // Eliminar sección de la ruleta derecha
  const handleDeleteSection = (secId) => {
    if (rightSections.length <= 2) {
      alert("La ruleta debe tener al menos 2 secciones.");
      return;
    }
    saveAndSyncSections(rightSections.filter(s => s.id !== secId));
  };

  // Restaurar secciones por defecto
  const handleResetDefaultSections = () => {
    if (window.confirm("¿Restaurar las secciones predeterminadas para la ruleta derecha?")) {
      saveAndSyncSections(DEFAULT_RIGHT_SECTIONS);
    }
  };

  // Crear nuevo poder
  const handleCreatePower = (e) => {
    if (e) e.preventDefault();
    const cleanName = newPowerName.trim();
    if (!cleanName) return;

    if (powers.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
      alert(`Ya existe un poder llamado "${cleanName}".`);
      return;
    }

    const newPow = {
      id: `pow_${Date.now()}`,
      name: cleanName,
      icon: newPowerIcon || 'Shield',
      color: newPowerColor || '#38bdf8',
      description: newPowerDesc.trim() || 'Poder canjeable de canal de Twitch'
    };

    saveAndSyncPowers([...powers, newPow]);
    setNewPowerName('');
    setNewPowerDesc('');
  };

  // Actualizar color de un poder existente
  const handleUpdatePowerColor = (powId, newColor) => {
    const updated = powers.map(p => p.id === powId ? { ...p, color: newColor } : p);
    saveAndSyncPowers(updated);
  };

  // Eliminar poder
  const handleDeletePower = (powId) => {
    saveAndSyncPowers(powers.filter(p => p.id !== powId));
  };

  // Asignar o quitar poder manualmente a un usuario
  const handleToggleUserPower = (userName, powerName) => {
    const updated = users.map(u => {
      if (u.name.toLowerCase() === userName.toLowerCase()) {
        const hasIt = u.powers.includes(powerName);
        const nextPowers = hasIt ? u.powers.filter(p => p !== powerName) : [...u.powers, powerName];
        return { ...u, powers: nextPowers };
      }
      return u;
    });
    saveAndSyncUsers(updated);
  };

  // Copiar link de OBS Studio
  const getObsOverlayUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/+$/, '');
    return `${origin}${pathname}/?overlay=ruleta_sangrienta`;
  };

  const handleCopyObsLink = () => {
    const url = getObsOverlayUrl();
    navigator.clipboard.writeText(url);
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 2500);
  };

  // Disparar giros desde el panel
  const handleBroadcastSpin = (target) => {
    if (target === 'wheel1' && users.length < 2) {
      alert("Añade al menos 2 participantes para girar la ruleta de participantes.");
      return;
    }
    if (target === 'wheel2' && rightSections.length < 2) {
      alert("Añade al menos 2 secciones para girar la ruleta derecha.");
      return;
    }
    if (target === 'both' && (users.length < 2 || rightSections.length < 2)) {
      alert("Asegúrate de que ambas ruletas tengan al menos 2 opciones.");
      return;
    }
    try {
      const bc = new BroadcastChannel('ruleta_sangrienta_channel');
      if (target === 'wheel1') {
        bc.postMessage({ type: 'SPIN_WHEEL_1' });
      } else if (target === 'wheel2') {
        bc.postMessage({ type: 'SPIN_WHEEL_2' });
      } else {
        bc.postMessage({ type: 'SPIN_BOTH' });
      }
      bc.close();
    } catch (e) {}
  };

  return (
    <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Superior */}
      <div className="builder-header animate-slide-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <button className="btn-back" onClick={onBack}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>← Volver</span>
        </button>

        <h1 className="header-title" style={{ fontSize: '1.8rem', margin: 0, textAlign: 'center', flex: 1, color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Skull size={30} color="#f472b6" />
          Ruleta Sangrienta (Doble Ruleta OBS)
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-add"
            onClick={handleCopyObsLink}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', border: '1px solid rgba(244, 114, 182, 0.4)' }}
            title="Copiar URL transparente para OBS Browser Source"
          >
            {copiedObs ? <Check size={16} /> : <Copy size={16} />}
            {copiedObs ? '¡Enlace Copiado!' : 'Copiar Enlace OBS (1920x1080)'}
          </button>

          <a
            href={getObsOverlayUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-submit"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #db2777, #f472b6)', color: '#fff', textDecoration: 'none' }}
          >
            <ExternalLink size={16} /> Abrir Overlay Limpio
          </a>
        </div>
      </div>

      {/* 1. VISOR / PREVIEW DEL OVERLAY 1920x1080 (ESCALADO 16:9) */}
      <div className="ruleta-sangrienta-preview-container">
        <div className="ruleta-preview-badge-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f472b6', boxShadow: '0 0 10px #f472b6' }}></span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbcfe8', letterSpacing: '1px' }}>
              PREVISUALIZACIÓN DE CAPTURA OBS (1920 × 1080 SIN FONDO)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-add"
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                try {
                  const bc = new BroadcastChannel('ruleta_sangrienta_channel');
                  bc.postMessage({ type: 'SET_MUTED', payload: next });
                  bc.close();
                } catch(e) {}
              }}
              style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              title={isMuted ? "Activar audio" : "Silenciar audio"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isMuted ? 'Mute' : 'Sonido ON'}
            </button>
          </div>
        </div>

        {/* Contenedor con aspecto 16:9 que escala fielmente los 1920x1080 */}
        <div className="ruleta-preview-scaler" ref={previewScalerRef}>
          <div 
            className="ruleta-preview-scaler-inner"
            style={{
              transform: `scale(${scaleFactor})`
            }}
          >
            <RuletaSangrientaOBSOverlay isPreview={true} supabase={supabase} />
          </div>
        </div>
      </div>

      {/* 2. PANEL DE GESTIÓN Y CONFIGURACIÓN ABAJO */}
      <div className="ruleta-admin-panel">
        {/* Cabecera con Controles de Giro para la Streamer */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ color: '#f472b6', fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <RenderOutlineIcon name="Flame" size={24} color="#f472b6" />
              Controles de Giro en Vivo
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Controla y alterna entre la Ruleta de Participantes y la Ruleta de Castigos en tiempo real para OBS.
            </p>
          </div>

          {/* Selector de Vista y Botones de Giro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="ruleta-view-selector-pill">
              <button
                type="button"
                className={`ruleta-view-selector-btn ${activeView === 'participants' ? 'active' : ''}`}
                onClick={() => saveAndSyncActiveView('participants')}
              >
                <Users size={15} />
                <span>Ruleta Participantes</span>
              </button>
              <button
                type="button"
                className={`ruleta-view-selector-btn ${activeView === 'castigos' ? 'active' : ''}`}
                onClick={() => saveAndSyncActiveView('castigos')}
              >
                <Flame size={15} />
                <span>Ruleta Castigos</span>
              </button>
            </div>

            {activeView === 'participants' ? (
              <button
                type="button"
                onClick={() => handleBroadcastSpin('wheel1')}
                disabled={users.length < 2}
                style={{ padding: '9px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem', background: 'linear-gradient(135deg, #db2777, #f472b6)', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(244, 114, 182, 0.4)' }}
              >
                <Users size={16} /> Girar Participantes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleBroadcastSpin('wheel2')}
                disabled={rightSections.length < 2}
                style={{ padding: '9px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem', background: 'linear-gradient(135deg, #e11d48, #f43f5e)', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)' }}
              >
                <Flame size={16} /> Girar Castigos
              </button>
            )}
          </div>
        </div>

        {/* Notificación de sincronización de Twitch */}
        {twitchSyncMsg && (
          <div style={{ padding: '10px 16px', background: 'rgba(244, 114, 182, 0.15)', border: '1px solid #f472b6', borderRadius: '10px', color: '#fbcfe8', fontWeight: 700, fontSize: '0.88rem', marginBottom: '18px' }} className="animate-slide-down">
            {twitchSyncMsg}
          </div>
        )}

        {/* PESTAÑAS DE CONFIGURACIÓN */}
        <div className="ruleta-tabs-bar">
          <button
            type="button"
            className={`ruleta-tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            <Users size={18} />
            <span>Participantes (Ruleta Izq)</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(244,114,182,0.25)', padding: '2px 8px', borderRadius: '10px' }}>
              {users.length}
            </span>
          </button>

          <button
            type="button"
            className={`ruleta-tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            <Flame size={18} />
            <span>Secciones (Ruleta Derecha)</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(244,114,182,0.25)', padding: '2px 8px', borderRadius: '10px' }}>
              {rightSections.length}
            </span>
          </button>

          <button
            type="button"
            className={`ruleta-tab-btn ${activeTab === 'powers' ? 'active' : ''}`}
            onClick={() => setActiveTab('powers')}
          >
            <Zap size={18} />
            <span>Poderes de Canal (Twitch)</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(244,114,182,0.25)', padding: '2px 8px', borderRadius: '10px' }}>
              {powers.length}
            </span>
          </button>
        </div>

        {/* CONTENIDO PESTAÑA 1: PARTICIPANTES */}
        {activeTab === 'participants' && (
          <div>
            <div className="ruleta-admin-grid-top">
              {/* Añadir Usuario Manual */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Añadir Participante Manual:
                </label>
                <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre de usuario (ej: Tokkii, Pedro...)"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    style={{ flex: 1, fontSize: '0.9rem' }}
                  />
                  <button
                    type="submit"
                    className="btn-submit"
                    style={{ width: 'auto', padding: '8px 18px', background: 'linear-gradient(135deg, #db2777, #f472b6)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Añadir
                  </button>
                </form>
              </div>

              {/* Sincronización Twitch y Acciones */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: '#fbcfe8' }}>
                    <Tv size={16} color="#a855f7" /> Canjes de Twitch ("Ruleta Sangrienta")
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Los canjes con el nombre <strong>"Ruleta Sangrienta"</strong> se añaden automáticamente en vivo.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={handleSyncTwitchRedemptions}
                    disabled={syncingTwitch}
                    style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.4)' }}
                    title="Traer canjes recientes de Supabase"
                  >
                    <RefreshCw size={14} className={syncingTwitch ? 'animate-spin' : ''} />
                    {syncingTwitch ? 'Sincronizando...' : 'Sincronizar Canjes'}
                  </button>

                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => setShowBulkModal(!showBulkModal)}
                    style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Sparkles size={14} /> Pegar Varios
                  </button>

                  {users.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllUsers}
                      style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', border: '1px solid rgba(244, 114, 182, 0.35)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                      title="Vaciar toda la lista"
                    >
                      <Trash2 size={14} /> Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal para Importar Masivamente */}
            {showBulkModal && (
              <div style={{ background: 'rgba(28, 8, 22, 0.95)', border: '1px solid rgba(244, 114, 182, 0.4)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }} className="animate-slide-down">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '8px' }}>
                  Pega la lista de usuarios (uno por línea o separados por comas):
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Tokkii&#10;Viewer1&#10;Viewer2&#10;Viewer3..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  style={{ marginBottom: '12px', fontSize: '0.88rem' }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => setShowBulkModal(false)}
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handleBulkAdd}
                    style={{ width: 'auto', padding: '6px 18px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #db2777, #f472b6)', color: '#fff', fontWeight: 700 }}
                  >
                    Agregar a la Lista
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Usuarios Registrados */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Usuarios Registrados 
                  <span style={{ fontSize: '0.82rem', background: 'rgba(244, 114, 182, 0.2)', color: '#fbcfe8', padding: '2px 10px', borderRadius: '14px', fontWeight: 700, border: '1px solid rgba(244, 114, 182, 0.4)' }}>
                    {users.length}
                  </span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Los poderes de cada usuario se muestran con su icono a la derecha del nombre.
                </span>
              </div>

              {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
                  <Skull size={40} opacity={0.3} color="#f472b6" style={{ marginBottom: '10px' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No hay participantes en la Ruleta Sangrienta.</p>
                  <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Añade nombres arriba o espera canjes de Twitch.</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {users.map((user, index) => {
                    const isEvil = user.name.toLowerCase() === 'eviltokkii';
                    return (
                      <div 
                        key={`${user.name}-${index}`} 
                        className="ruleta-user-card-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          gap: '12px',
                          border: isEvil ? '1.5px solid rgba(244, 114, 182, 0.45)' : undefined,
                          background: isEvil ? 'linear-gradient(90deg, rgba(50, 14, 35, 0.75) 0%, rgba(25, 7, 18, 0.65) 100%)' : undefined
                        }}
                      >
                        {isEvil ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            {/* Fila Superior: #Número + Nombre COMPLETO (Siempre visible al 100%) + Badge Permanente */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f472b6', flexShrink: 0 }}>
                                #{index + 1}
                              </span>

                              <span 
                                style={{ 
                                  fontWeight: 800, 
                                  fontSize: '0.96rem', 
                                  color: '#fbcfe8', 
                                  whiteSpace: 'nowrap'
                                }}
                                title={user.name}
                              >
                                {user.name}
                              </span>

                              <span style={{ background: 'linear-gradient(135deg, #f472b6, #db2777)', color: '#ffffff', fontSize: '0.66rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                                <Crown size={11} /> Permanente
                              </span>
                            </div>

                            {/* Fila Inferior: Flechas para aumentar o disminuir casillas DEBAJO del nombre + Botón Eliminar/Activar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '22px', flexWrap: 'wrap' }}>
                              <div className="ruleta-stepper-container" title="Cantidad de casillas de EvilTokkii en la ruleta (distribución aleatoria no adyacente)">
                                <button
                                  type="button"
                                  className="ruleta-stepper-btn"
                                  onClick={() => saveAndSyncEvilSlots(Math.max(1, evilTokkiiSlots - 1))}
                                  disabled={evilTokkiiSlots <= 1}
                                  title="Disminuir casillas"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                <span className="ruleta-stepper-val">
                                  {evilTokkiiSlots} {evilTokkiiSlots === 1 ? 'casilla' : 'casillas'}
                                </span>
                                <button
                                  type="button"
                                  className="ruleta-stepper-btn"
                                  onClick={() => saveAndSyncEvilSlots(evilTokkiiSlots + 1)}
                                  title="Aumentar casillas"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  saveAndSyncEvilSlots(evilTokkiiSlots > 0 ? 0 : 1);
                                }}
                                title={evilTokkiiSlots > 0 ? "Eliminar casilla de EvilTokkii de la ruleta" : "Activar casilla de EvilTokkii"}
                                style={{
                                  background: evilTokkiiSlots > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 114, 182, 0.15)',
                                  border: evilTokkiiSlots > 0 ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(244, 114, 182, 0.4)',
                                  color: evilTokkiiSlots > 0 ? '#f43f5e' : '#f472b6',
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700
                                }}
                              >
                                <Trash2 size={13} />
                                <span>{evilTokkiiSlots > 0 ? 'Eliminar' : 'Activar'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Izquierda: Columna con Nombre Arriba y Poderes Abajo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                              {/* Fila Superior: #Número + Nombre Completo (Siempre visible) + Badges */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f472b6', flexShrink: 0 }}>
                                  #{index + 1}
                                </span>

                                <span 
                                  style={{ 
                                    fontWeight: 700, 
                                    fontSize: '0.94rem', 
                                    color: '#f8fafc', 
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                  title={user.name}
                                >
                                  {user.name}
                                </span>

                                {user.source === 'twitch' && (
                                  <span title="Inscrito por canje de Twitch" style={{ color: '#c084fc', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                                    <Tv size={12} />
                                  </span>
                                )}
                              </div>

                              {/* Fila Inferior: Iconos de los Poderes adquiridos ABAJO del nombre */}
                              {user.powers && user.powers.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '22px', flexWrap: 'wrap' }}>
                                  {user.powers.map((powName, pIdx) => {
                                    const pObj = powers.find(p => p.name.toLowerCase() === powName.toLowerCase());
                                    const iconName = pObj?.icon || 'Zap';
                                    const iconColor = pObj?.color || '#f472b6';
                                    return (
                                      <span
                                        key={`${powName}-${pIdx}`}
                                        className="ruleta-power-badge-overlay"
                                        title={`Poder: ${powName} (Click para retirar)`}
                                        onClick={() => handleToggleUserPower(user.name, powName)}
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          borderColor: `${iconColor}aa`,
                                          background: `${iconColor}22`,
                                          boxShadow: `0 0 10px ${iconColor}44`,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <RenderOutlineIcon name={iconName} size={14} color={iconColor} />
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Derecha: Botón [+ Poder] y Eliminar para otros */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              {/* Botón para asignar poder manual */}
                              {powers.length > 0 && (
                                <div style={{ position: 'relative' }}>
                                  <button
                                    type="button"
                                    onClick={() => setAssigningPowerUser(assigningPowerUser === user.name ? null : user.name)}
                                    style={{
                                      background: 'rgba(244, 114, 182, 0.1)',
                                      border: '1px solid rgba(244, 114, 182, 0.3)',
                                      color: '#f472b6',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Asignar poder a este usuario"
                                  >
                                    <Plus size={12} /> Poder
                                  </button>

                                  {/* Desplegable de poderes disponibles */}
                                  {assigningPowerUser === user.name && (
                                    <div style={{
                                      position: 'absolute',
                                      right: 0,
                                      top: '100%',
                                      marginTop: '4px',
                                      background: '#1c0818',
                                      border: '1.5px solid #f472b6',
                                      borderRadius: '10px',
                                      padding: '6px',
                                      zIndex: 50,
                                      minWidth: '170px',
                                      boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
                                    }}>
                                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', paddingLeft: '6px' }}>
                                        Asignar poder:
                                      </span>
                                      {powers.map(p => (
                                        <button
                                          key={p.id}
                                          type="button"
                                          onClick={() => {
                                            handleToggleUserPower(user.name, p.name);
                                            setAssigningPowerUser(null);
                                          }}
                                          style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            background: user.powers.includes(p.name) ? 'rgba(244, 114, 182, 0.2)' : 'transparent',
                                            border: 'none',
                                            color: '#ffffff',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                          }}
                                        >
                                          <RenderOutlineIcon name={p.icon} size={14} color={p.color || '#f472b6'} />
                                          <span>{p.name}</span>
                                          {user.powers.includes(p.name) && <Check size={12} color="#f472b6" style={{ marginLeft: 'auto' }} />}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(index)}
                                title={`Eliminar a ${user.name} de la ruleta`}
                                style={{
                                  background: 'rgba(244, 114, 182, 0.12)',
                                  border: '1px solid rgba(244, 114, 182, 0.3)',
                                  color: '#f472b6',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: SECCIONES RULETA DERECHA */}
        {activeTab === 'sections' && (
          <div>
            <div className="ruleta-admin-grid-top">
              {/* Formulario Añadir Sección */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Añadir Sección a la Ruleta Derecha:
                </label>
                <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="ruleta-icon-picker-btn"
                    onClick={() => setIconPickerTarget('section')}
                    title="Cambiar icono de la sección"
                  >
                    <RenderOutlineIcon name={newSectionIcon} size={22} color="#f472b6" />
                    <span>Cambiar</span>
                  </button>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Texto de la sección (ej: Castigo 1, Revivir, Muerte súbita...)"
                    value={newSectionLabel}
                    onChange={(e) => setNewSectionLabel(e.target.value)}
                    style={{ flex: 1, fontSize: '0.9rem' }}
                  />

                  <button
                    type="submit"
                    className="btn-submit"
                    style={{ width: 'auto', padding: '8px 18px', background: 'linear-gradient(135deg, #db2777, #f472b6)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Añadir Sección
                  </button>
                </form>
              </div>

              {/* Información y Restablecer */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#fbcfe8' }}>
                    Personalización de la Ruleta Derecha
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Cada sección tiene su icono outline y texto visible en el giro y en el resultado final.
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-add"
                  onClick={handleResetDefaultSections}
                  style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Cargar Predeterminadas
                </button>
              </div>
            </div>

            {/* Lista de Secciones Actuales */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Secciones Actuales de la Ruleta Derecha
                <span style={{ fontSize: '0.82rem', background: 'rgba(244, 114, 182, 0.2)', color: '#fbcfe8', padding: '2px 10px', borderRadius: '14px', fontWeight: 700, border: '1px solid rgba(244, 114, 182, 0.4)' }}>
                  {rightSections.length}
                </span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                {rightSections.map((sec, index) => (
                  <div key={sec.id || index} className="ruleta-user-card-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f472b6', minWidth: '22px' }}>
                        #{index + 1}
                      </span>
                      <div style={{ background: 'rgba(244, 114, 182, 0.15)', padding: '6px', borderRadius: '8px' }}>
                        <RenderOutlineIcon name={sec.icon || 'AlertTriangle'} size={20} color="#f472b6" />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sec.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id)}
                      title={`Eliminar "${sec.label}"`}
                      style={{
                        background: 'rgba(244, 114, 182, 0.12)',
                        border: '1px solid rgba(244, 114, 182, 0.3)',
                        color: '#f472b6',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 3: PODERES DE CANAL */}
        {activeTab === 'powers' && (
          <div>
            <div className="ruleta-admin-grid-top">
              {/* Formulario Crear Poder */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Crear Nuevo Poder (Vinculable a Canje de Twitch):
                </label>
                <form onSubmit={handleCreatePower} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="ruleta-icon-picker-btn"
                      onClick={() => setIconPickerTarget('power')}
                      title="Elegir icono para este poder"
                      style={{
                        borderColor: `${newPowerColor}88`,
                        background: `${newPowerColor}1a`
                      }}
                    >
                      <RenderOutlineIcon name={newPowerIcon} size={22} color={newPowerColor} />
                      <span>Icono</span>
                    </button>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre exacto del canje en Twitch (ej: Inmunidad, Revivir...)"
                      value={newPowerName}
                      onChange={(e) => setNewPowerName(e.target.value)}
                      style={{ flex: 1, fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* Selector de Color del Poder */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '4px 0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#fbcfe8', fontWeight: 700 }}>
                      Color del Icono:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {POWER_COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setNewPowerColor(preset.value)}
                          title={preset.label}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: preset.value,
                            border: newPowerColor.toLowerCase() === preset.value.toLowerCase() ? '2.5px solid #ffffff' : '1.5px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            boxShadow: newPowerColor.toLowerCase() === preset.value.toLowerCase() ? `0 0 10px ${preset.value}` : 'none',
                            transform: newPowerColor.toLowerCase() === preset.value.toLowerCase() ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.15s ease',
                            padding: 0
                          }}
                        />
                      ))}

                      {/* Color Picker HTML5 personalizado */}
                      <label
                        title="Personalizar color del poder"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          border: '1.5px solid rgba(255,255,255,0.6)'
                        }}
                      >
                        <input
                          type="color"
                          value={newPowerColor}
                          onChange={e => setNewPowerColor(e.target.value)}
                          style={{ opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Descripción breve (ej: Te salva si la ruleta te selecciona para castigo)"
                      value={newPowerDesc}
                      onChange={(e) => setNewPowerDesc(e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />

                    <button
                      type="submit"
                      className="btn-submit"
                      style={{ width: 'auto', padding: '8px 18px', background: 'linear-gradient(135deg, #db2777, #f472b6)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Crear Poder
                    </button>
                  </div>
                </form>
              </div>

              {/* Guía de Vinculación con Twitch */}
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', color: '#fbcfe8', marginBottom: '6px' }}>
                  <Tv size={16} color="#a855f7" /> ¿Cómo funciona la vinculación con Twitch?
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                  Crea una recompensa de puntos de canal en Twitch que tenga <strong>exactamente el mismo nombre</strong> que el poder creado aquí (ej: <em>Inmunidad</em>). Cuando un espectador la canjee en stream, el sistema le asignará el poder y su icono aparecerá a la derecha de su nombre.
                </p>
                <button
                  type="button"
                  className="btn-add"
                  onClick={() => saveAndSyncPowers(DEFAULT_POWERS)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <RefreshCw size={13} /> Restaurar Poderes Sugeridos
                </button>
              </div>
            </div>

            {/* Lista de Poderes Creados */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Poderes Registrados de la Streamer
                <span style={{ fontSize: '0.82rem', background: 'rgba(244, 114, 182, 0.2)', color: '#fbcfe8', padding: '2px 10px', borderRadius: '14px', fontWeight: 700, border: '1px solid rgba(244, 114, 182, 0.4)' }}>
                  {powers.length}
                </span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {powers.map(p => {
                  const usersWithThisPower = users.filter(u => u.powers.includes(p.name)).length;
                  const powerColor = p.color || '#38bdf8';
                  return (
                    <div key={p.id} style={{ background: 'rgba(20, 7, 18, 0.7)', border: `1.5px solid ${powerColor}55`, borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', overflow: 'hidden' }}>
                        <div style={{ background: `${powerColor}22`, border: `1.5px solid ${powerColor}`, borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RenderOutlineIcon name={p.icon} size={24} color={powerColor} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fbcfe8' }}>
                              {p.name}
                            </span>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: powerColor, boxShadow: `0 0 8px ${powerColor}` }} title={`Color: ${powerColor}`}></span>
                          </div>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                            {p.description}
                          </span>
                          <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.74rem', background: `${powerColor}22`, color: powerColor, border: `1px solid ${powerColor}44`, padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                            {usersWithThisPower} {usersWithThisPower === 1 ? 'poseedor activo' : 'poseedores activos'}
                          </span>

                          {/* Cambiar color rápido */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Color:</span>
                            {POWER_COLOR_PRESETS.slice(0, 6).map(c => (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => handleUpdatePowerColor(p.id, c.value)}
                                title={c.label}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: c.value,
                                  border: powerColor.toLowerCase() === c.value.toLowerCase() ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePower(p.id)}
                        title={`Eliminar poder "${p.name}"`}
                        style={{
                          background: 'rgba(244, 114, 182, 0.12)',
                          border: '1px solid rgba(244, 114, 182, 0.3)',
                          color: '#f472b6',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL SELECTOR DE ICONOS OUTLINE */}
      <OutlineIconPickerModal
        isOpen={iconPickerTarget !== null}
        onClose={() => setIconPickerTarget(null)}
        currentIcon={iconPickerTarget === 'section' ? newSectionIcon : newPowerIcon}
        onSelect={(selectedIconName) => {
          if (iconPickerTarget === 'section') {
            setNewSectionIcon(selectedIconName);
          } else if (iconPickerTarget === 'power') {
            setNewPowerIcon(selectedIconName);
          }
        }}
      />
    </div>
  );
}
