import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, Type, Trash2, Send, LayoutTemplate, Newspaper, FilePlus, ChevronLeft, Bold, Italic, Underline, List, ListOrdered, RemoveFormatting, Calendar, Users, Gift, Save, Lock, AlertCircle, LogOut, Copy, ChevronDown, ChevronUp, Gamepad2, MessageSquare, Play, Square, Settings, Wifi, WifiOff, Pause, SkipForward, Trophy, HelpCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

import md5 from 'blueimp-md5';
import { DOWNLOADED_PERKS } from './data/DbdPerksDownloaded';
import { OVERWATCH_QUESTIONS } from './data/OverwatchQuestions';
import { GAMES_QUESTIONS } from './data/GamesQuestions';
import { MUSIC_HITS_QUESTIONS } from './data/MusicHitsQuestions';
import { FLAG_QUESTIONS } from './data/FlagQuestions';
import { SCRAMBLE_WORDS } from './data/ScrambleWords';
import { DBD_PERKS } from './data/DbdPerks';
import { DISNEY_QUESTIONS } from './data/DisneyQuestions';
import { COVERS_QUESTIONS } from './data/CoversQuestions';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hddzijixsigsqsmabtej.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_bJGAVsHsVrSu2KAhbEC7DA_DpYnxDAp";
export const CLOUDFLARE_R2_BASE_URL = import.meta.env.VITE_R2_BASE_URL || "https://pub-0bf9a87cec964ff49bfd058873c948c3.r2.dev/public";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global Temporary Cache for mocking Cloudflare R2 Uploads visually before backend integration
window.__R2_MOCK_CACHE__ = window.__R2_MOCK_CACHE__ || {};

const getDisplayUrl = (url) => {
  if (!url) return '';
  return window.__R2_MOCK_CACHE__[url] || url;
};

function getDbdPerkImageUrl(apiPath) {
  if (!apiPath) return '';
  const parts = apiPath.split('/');
  const rawBaseName = parts[parts.length - 1].replace('.png', ''); // e.g. iconPerks_Terminus
  
  if (DOWNLOADED_PERKS.has(rawBaseName)) {
    return `Imagenes/Perks/${rawBaseName}.png`;
  }

  let baseName = rawBaseName;

  if (baseName.startsWith('iconPerks_')) {
    const perkPart = baseName.substring(10); // e.g. Terminus
    const formattedPerkPart = perkPart.charAt(0).toLowerCase() + perkPart.slice(1); // e.g. terminus
    baseName = 'IconPerks_' + formattedPerkPart + '.png'; // e.g. IconPerks_terminus.png
  } else {
    baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + '.png';
  }
  
  const hash = md5(baseName);
  const f = hash.charAt(0);
  const s = hash.substring(0, 2);
  
  return `https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/${f}/${s}/${baseName}`;
}

function handlePerkImageError(e, apiPath) {
  e.target.onerror = null; // Prevent loop
  if (!apiPath) {
    e.target.src = 'https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public/Imagenes/default_perk.png';
    return;
  }
  try {
    const parts = apiPath.split('/');
    const rawBaseName = parts[parts.length - 1];
    let baseName = rawBaseName;
    if (baseName.startsWith('iconPerks_')) {
      const perkPart = baseName.substring(10);
      const formattedPerkPart = perkPart.charAt(0).toLowerCase() + perkPart.slice(1);
      baseName = 'IconPerks_' + formattedPerkPart + '.png';
    } else {
      baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + '.png';
    }
    const hash = md5(baseName);
    const f = hash.charAt(0);
    const s = hash.substring(0, 2);
    e.target.src = `https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/${f}/${s}/${baseName}`;
  } catch (err) {
    e.target.src = 'https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public/Imagenes/default_perk.png';
  }
}

const RichTextEditor = ({ value, onChange }) => {
  const contentEditableRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  // Track cursor movement or formatting changes to highlight buttons
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  };

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
    if (contentEditableRef.current) {
      onChange(contentEditableRef.current.innerHTML);
    }
  };

  const handleChange = () => {
    updateActiveFormats();
    if (contentEditableRef.current) {
      onChange(contentEditableRef.current.innerHTML);
    }
  };

  // Ensure initial value is set without resetting cursor position
  useEffect(() => {
    if (contentEditableRef.current && value !== contentEditableRef.current.innerHTML) {
      // Insert initial fetch value safely, or clear entirely if value resets.
      if (contentEditableRef.current.innerHTML === "" || value === "") {
        contentEditableRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  return (
    <div className="rte-container">
      <div className="rte-toolbar">
        <select 
          className="rte-select" 
          onChange={(e) => handleCommand('formatBlock', e.target.value)}
          defaultValue="P"
        >
          <option value="P">Párrafo Normal</option>
          <option value="H2">Subtítulo (H2)</option>
          <option value="H3">Título Pequeño (H3)</option>
        </select>
        
        <div className="rte-toolbar-divider"></div>
        
        <button 
          type="button" 
          className={`rte-btn ${activeFormats.bold ? 'active' : ''}`} 
          onClick={() => handleCommand('bold')}
          title="Negrita"
        >
          <Bold size={16} />
        </button>
        <button 
          type="button" 
          className={`rte-btn ${activeFormats.italic ? 'active' : ''}`} 
          onClick={() => handleCommand('italic')}
          title="Cursiva"
        >
          <Italic size={16} />
        </button>
        <button 
          type="button" 
          className={`rte-btn ${activeFormats.underline ? 'active' : ''}`} 
          onClick={() => handleCommand('underline')}
          title="Subrayado"
        >
          <Underline size={16} />
        </button>
        
        <div className="rte-toolbar-divider"></div>

        <button 
          type="button" 
          className={`rte-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`} 
          onClick={() => handleCommand('insertUnorderedList')}
          title="Lista con puntos"
        >
          <List size={16} />
        </button>
        <button 
          type="button" 
          className={`rte-btn ${activeFormats.insertOrderedList ? 'active' : ''}`} 
          onClick={() => handleCommand('insertOrderedList')}
          title="Lista con números/guiones"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="rte-toolbar-divider"></div>
        
        <button 
          type="button" 
          className="rte-btn" 
          onClick={() => handleCommand('removeFormat')}
          title="Limpiar formato"
        >
          <RemoveFormatting size={16} />
        </button>
      </div>
      
      <div 
        ref={contentEditableRef}
        className="rte-content form-control"
        contentEditable
        onInput={handleChange}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        suppressContentEditableWarning={true}
        style={{ minHeight: '120px', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', background: 'transparent' }}
        data-placeholder="Escribe el contenido del párrafo aquí..."
      ></div>
    </div>
  );
};

const AutoResizeTextarea = ({ value, onChange, name, className, placeholder, rows }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      name={name}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows || 2}
      style={{ overflow: 'hidden', resize: 'none' }}
    />
  );
};

const CloudflareImageGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLocalPreview(URL.createObjectURL(file));
      setGeneratedLink('');
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    
    try {
      // 1. Pedir presigned URL a la Edge Function
      const { data, error } = await supabase.functions.invoke('clever-api', {
        body: { fileName: selectedFile.name, fileType: selectedFile.type }
      });
      if (error || !data) throw new Error(error ? error.message : "Error contactando Edge Function");

      // 2. Subir físicamente a Cloudflare R2
      const uploadRes = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type }
      });

      if (!uploadRes.ok) throw new Error("AWS Server Error: " + uploadRes.status);

      // Usar la visibilidad paralela
      window.__R2_MOCK_CACHE__[data.finalPublicUrl] = localPreview;
      setGeneratedLink(data.finalPublicUrl);
    } catch (err) {
      console.error(err);
      alert("Ruta Profesional: No se pudo subir directo a R2: " + err.message);
    }
    
    setIsUploading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setLocalPreview('');
    setGeneratedLink('');
  };

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, WebkitAnimation: 'slideDown 0.3s ease-out' }}>
      {!isOpen ? (
        <button 
          className="btn-submit" 
          style={{ padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 5px 20px rgba(236, 72, 153, 0.4)', width: 'auto' }}
          onClick={() => setIsOpen(true)}
        >
          <ImageIcon size={18} /> Subidor Cloudflare R2
        </button>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '20px', width: '320px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><ImageIcon size={18} /> Herramienta R2</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>X</button>
          </div>
          
          <input type="file" accept="image/*" onChange={handleFileSelect} className="form-control" style={{ marginBottom: '10px', fontSize: '0.85rem', padding: '8px', width: '100%' }} />
          
          {localPreview && !generatedLink && (
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <img src={localPreview} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px', border: '1px dashed var(--border-color)' }} />
            </div>
          )}

          <button 
            className="btn-submit" 
            style={{ width: '100%', padding: '10px', fontSize: '0.95rem', marginBottom: '15px', borderRadius: '8px' }}
            disabled={!selectedFile || isUploading}
            onClick={handleUploadClick}
          >
            {isUploading ? 'Procesando en Cloudflare...' : 'Subir a R2'}
          </button>

          {generatedLink && (
            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <img 
                  src={localPreview} 
                  alt="Uploaded" 
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', margin: 0, flex: 1 }}>
                  {generatedLink}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={copyToClipboard}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', flex: 2, fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  Copiar enlace
                </button>
                <button 
                  onClick={resetUploader}
                  style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', flex: 1, fontSize: '0.8rem' }}
                >
                  Subir otra
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showToast && (
        <div 
          className="animate-slide-up-fade"
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--primary)',
            color: 'var(--text-main)',
            padding: '12px 24px',
            borderRadius: '50px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
          ¡Enlace copiado al portapapeles!
        </div>
      )}
    </div>
  );
};
const AdvancedImagePreview = ({ imageUrl }) => {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  if (!imageUrl) return null;

  const displayUrl = getDisplayUrl(imageUrl);

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
    transition: 'none'
  };

  return (
    <div className="advanced-preview-grid">
      {/* Guía Visual con Overlays */}
      <div className="preview-card main-guide-container">
        <h4>
          Guía de Diseño y Zona Segura
          <div style={{ display: 'flex', gap: '15px', fontSize: '0.7rem' }}>
            <span style={{color: '#ff3e3e', display: 'flex', alignItems: 'center', gap: '4px', fontVariant: 'all-small-caps'}}><div style={{width:8, height:8, border:'1px dashed #ff3e3e'}}></div> Banner</span>
            <span style={{color: '#2eff7e', display: 'flex', alignItems: 'center', gap: '4px', fontVariant: 'all-small-caps'}}><div style={{width:8, height:8, border:'1px dashed #2eff7e'}}></div> Casilla</span>
          </div>
        </h4>
        <div className="guide-visualizer" style={{ background: '#0f172a' }}>
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <img src={displayUrl} alt="Guide Visualizer" style={imageStyle} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.height = '100px'; }} />
          </div>
          {/* Safe Zone Overlay */}
          <div className="guide-overlay-box guide-safe-rect" title="Zona Segura (450x400)"></div>
          {/* Banner Overlay */}
          <div className="guide-overlay-box guide-banner-rect" title="Recorte Banner (1200x400)"></div>
          {/* Casilla Overlay */}
          <div className="guide-overlay-box guide-casilla-rect" title="Recorte Casilla (450x350)"></div>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="preview-controls">
          <div className="control-group">
            <label>Zoom: {zoom.toFixed(2)}x</label>
            <input type="range" min="0.5" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Desplazar X: {offsetX}px</label>
            <input type="range" min="-300" max="300" step="1" value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Desplazar Y: {offsetY}px</label>
            <input type="range" min="-300" max="300" step="1" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} />
          </div>
          <button type="button" className="btn-reset" onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); }}>Restablecer</button>
        </div>
        
        <div className="guide-tip-card">
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <li><strong>Subida:</strong> Mín. 1200px (Ancho) x 600-700px (Alto)</li>
            <li><strong>Banner (Cabecera):</strong> 1200 x 400 px (3:1)</li>
            <li><strong>Miniatura (Casilla):</strong> 450 x 350 px (9:7)</li>
            <li><strong>Zona Segura:</strong> Centra lo vital en 450x400 px</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('builder_session') === 'true');
  const [sessionEmail, setSessionEmail] = useState(localStorage.getItem('builder_email') || '');
  const [sessionUsername, setSessionUsername] = useState(localStorage.getItem('builder_username') || '');
  const [sessionPermissions, setSessionPermissions] = useState(() => {
    const cached = localStorage.getItem('builder_permissions');
    if (!cached) return '*';
    try {
      return JSON.parse(cached);
    } catch {
      return cached;
    }
  });
  const [needsUsername, setNeedsUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [expandedDates, setExpandedDates] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'bottom' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  const triggerToast = (message, type = 'bottom') => {
    setToast({ show: true, message, type });
    const delay = type === 'center' ? 4000 : 2500;
    setTimeout(() => setToast({ show: false, message: '', type: 'bottom' }), delay);
  };

  const showConfirm = (message, action) => {
    setConfirmModal({ show: true, message, onConfirm: action });
  };

  const closeConfirm = () => {
    setConfirmModal({ show: false, message: '', onConfirm: null });
  };

  const hasAccess = (requiredPermission) => {
    if (sessionPermissions === '*') return true;
    if (typeof sessionPermissions === 'object' && sessionPermissions !== null) {
      if (sessionPermissions.approved === false) return false;
      if (sessionPermissions.permissions === '*') return true;

      switch (requiredPermission) {
        case 'news_only':
          return !!sessionPermissions.access_news;
        case 'events_and_giveaways':
          return !!(sessionPermissions.access_events || sessionPermissions.access_giveaways);
        case 'events_only':
          return !!sessionPermissions.access_events;
        case 'giveaways_only':
          return !!sessionPermissions.access_giveaways;
        case 'participations':
          return !!sessionPermissions.access_participations;
        case 'twitch':
          return !!sessionPermissions.access_twitch;
        case 'most_streamed':
          return !!sessionPermissions.access_most_streamed;
        case 'scheduled_messages':
          return !!sessionPermissions.access_scheduled_messages;
        case 'song_request':
          return !!sessionPermissions.access_song_request;
        case 'commands':
          return !!sessionPermissions.access_commands;
        case 'reports':
          return !!sessionPermissions.access_reports;
        case 'minigames':
          return !!sessionPermissions.access_minigames;
        case 'admin':
          return !!(
            sessionPermissions.access_participations ||
            sessionPermissions.access_twitch ||
            sessionPermissions.access_most_streamed ||
            sessionPermissions.access_scheduled_messages ||
            sessionPermissions.access_song_request ||
            sessionPermissions.access_commands ||
            sessionPermissions.access_reports ||
            sessionPermissions.access_minigames
          );
        default:
          return false;
      }
    }
    return false;
  };

  const restrictedNavigate = (targetView, requiredPermission) => {
    if (hasAccess(requiredPermission)) {
      if (targetView === 'create_content_item_event') {
        resetItemForm('evento');
        setView('create_content_item');
      } else if (targetView === 'create_content_item_sorteo') {
        resetItemForm('sorteo');
        setView('create_content_item');
      } else if (targetView === 'create_content_item') {
        resetItemForm('evento');
        setView('create_content_item');
      } else {
        setView(targetView);
      }
    } else {
      triggerToast("⚠️ Acceso restringido para tu cuenta.");
    }
  };

  const [view, setView] = useState('home'); // 'home' or 'create'

  // Web Reports States
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportFilter, setReportFilter] = useState('todos');
  const [reportSearch, setReportSearch] = useState('');
  const [expandedReports, setExpandedReports] = useState({});
  
  // Minigames Editor States
  const [activeMinigameTab, setActiveMinigameTab] = useState('overwatch');
  const [minigamesData, setMinigamesData] = useState({
    overwatch: [],
    dbd: [],
    flags: [],
    games: [],
    scramble: [],
    music: [],
    disney: [],
    covers: []
  });
  const [loadingMinigames, setLoadingMinigames] = useState(false);
  const [minigameSearch, setMinigameSearch] = useState('');
  const [minigamePage, setMinigamePage] = useState(1);
  const [editingMinigameItem, setEditingMinigameItem] = useState(null);
  const [isSavingMinigame, setIsSavingMinigame] = useState(false);

  const fetchMinigamesFromSupabase = async () => {
    setLoadingMinigames(true);
    try {
      const { data, error } = await supabase
        .from('minigames_content')
        .select('*');
      
      if (error) {
        console.warn("Table minigames_content might not exist yet or permission denied. Using seeds.", error.message);
      }
      
      const loadedData = {
        overwatch: [...OVERWATCH_QUESTIONS],
        dbd: DBD_PERKS.filter(perk => {
          const parts = perk.image.split('/');
          const imgName = parts[parts.length - 1].replace('.png', '');
          return DOWNLOADED_PERKS.has(imgName);
        }),
        flags: [...FLAG_QUESTIONS],
        games: [...GAMES_QUESTIONS],
        scramble: SCRAMBLE_WORDS.map(w => ({
          id: w.id,
          scrambleWord: w.word,
          scrambleHint: w.hint,
          options: [],
          answerIndex: 0
        })),
        music: [...MUSIC_HITS_QUESTIONS],
        disney: [...DISNEY_QUESTIONS],
        covers: [...COVERS_QUESTIONS]
      };

      if (data && data.length > 0) {
        data.forEach(row => {
          if (loadedData[row.game_type]) {
            if (row.game_type === 'dbd') {
              loadedData.dbd = row.data.filter(perk => {
                const parts = perk.image.split('/');
                const imgName = parts[parts.length - 1].replace('.png', '');
                return DOWNLOADED_PERKS.has(imgName);
              });
            } else {
              loadedData[row.game_type] = row.data;
            }
          }
        });
      }
      
      setMinigamesData(loadedData);
    } catch (err) {
      console.error("Error loading minigames:", err);
    } finally {
      setLoadingMinigames(false);
    }
  };

  const saveMinigameToSupabase = async (gameType, updatedData) => {
    setIsSavingMinigame(true);
    try {
      const { error } = await supabase
        .from('minigames_content')
        .upsert({
          game_type: gameType,
          data: updatedData,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setMinigamesData(prev => ({
        ...prev,
        [gameType]: updatedData
      }));
      triggerToast("✅ ¡Cambios guardados en Supabase!");
      setEditingMinigameItem(null);
    } catch (err) {
      console.error("Error saving minigame:", err);
      alert("Error al guardar en Supabase. Asegúrate de haber creado la tabla minigames_content: " + err.message);
    } finally {
      setIsSavingMinigame(false);
    }
  };

  const deleteMinigameItem = (index) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este elemento?")) return;
    const items = [...minigamesData[activeMinigameTab]];
    items.splice(index, 1);
    saveMinigameToSupabase(activeMinigameTab, items);
  };

  const resetMinigameToDefault = async (gameType) => {
    if (!window.confirm(`¿Estás seguro de que deseas restaurar los valores por defecto de este minijuego? Se perderán las ediciones manuales.`)) return;
    setIsSavingMinigame(true);
    try {
      const { error } = await supabase
        .from('minigames_content')
        .delete()
        .eq('game_type', gameType);
      
      if (error) throw error;
      
      const defaultData = 
        gameType === 'overwatch' ? [...OVERWATCH_QUESTIONS] :
        gameType === 'dbd' ? DBD_PERKS.filter(perk => {
          const parts = perk.image.split('/');
          const imgName = parts[parts.length - 1].replace('.png', '');
          return DOWNLOADED_PERKS.has(imgName);
        }) :
        gameType === 'flags' ? [...FLAG_QUESTIONS] :
        gameType === 'games' ? [...GAMES_QUESTIONS] :
        gameType === 'scramble' ? SCRAMBLE_WORDS.map(w => ({
          id: w.id,
          scrambleWord: w.word,
          scrambleHint: w.hint,
          options: [],
          answerIndex: 0
        })) :
        gameType === 'music' ? [...MUSIC_HITS_QUESTIONS] :
        gameType === 'disney' ? [...DISNEY_QUESTIONS] :
        [...COVERS_QUESTIONS];
      
      setMinigamesData(prev => ({
        ...prev,
        [gameType]: defaultData
      }));
      
      triggerToast("🔄 Restaurado a valores por defecto.");
    } catch (err) {
      console.error("Error resetting minigame:", err);
      alert("Error al restaurar: " + err.message);
    } finally {
      setIsSavingMinigame(false);
    }
  };
  
  // Song Request States
  const [songRequests, setSongRequests] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [manualQuery, setManualQuery] = useState('');
  const [playerVolume, setPlayerVolume] = useState(() => Number(localStorage.getItem('song_player_volume')) || 50);
  const [isPlayerEnabledInDashboard, setIsPlayerEnabledInDashboard] = useState(() => localStorage.getItem('dashboard_player_enabled') === 'true');
  const [songRequestCommand, setSongRequestCommand] = useState(() => localStorage.getItem('song_request_command') || '!sr');

  useEffect(() => {
    localStorage.setItem('song_request_command', songRequestCommand);
  }, [songRequestCommand]);

  const [allSongs, setAllSongs] = useState([]);
  const [chatCommands, setChatCommands] = useState([]);
  const [cmdFormName, setCmdFormName] = useState('');
  const [cmdFormType, setCmdFormType] = useState('versus');
  const [cmdFormDesc, setCmdFormDesc] = useState('');
  const [cmdFormResponses, setCmdFormResponses] = useState(['']);

  const fetchUserReports = async () => {
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.warn("Table user_reports might not exist yet or permission denied:", error.message);
        return;
      }
      if (data) setUserReports(data);
    } catch (err) {
      console.error("Error fetching user reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este reporte?")) return;
    try {
      const { error } = await supabase
        .from('user_reports')
        .delete()
        .eq('id', id);
      
      if (error) {
        triggerToast("⚠️ Error al eliminar reporte: " + error.message);
      } else {
        triggerToast("✅ Reporte eliminado.");
        setUserReports(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  const fetchChatCommands = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_commands')
        .select('*')
        .order('command_name', { ascending: true });
        
      if (error) {
        console.warn("Table chat_commands might not exist yet:", error.message);
        return;
      }
      if (data) setChatCommands(data);
    } catch (err) {
      console.error("Error fetching chat commands:", err);
    }
  };

  // Make fetchSongs component-level so we can trigger it instantly after mutations
  const fetchSongs = async () => {
    try {
      // 1. Fetch ALL pending and playing songs
      const { data: activeAndPending, error: activeErr } = await supabase
        .from('song_requests')
        .select('*')
        .in('status', ['pending', 'playing'])
        .order('created_at', { ascending: true });
        
      if (activeErr) throw activeErr;

      // 2. Fetch the 10 most recent played/skipped songs for history
      const { data: history, error: historyErr } = await supabase
        .from('song_requests')
        .select('*')
        .in('status', ['played', 'skipped'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyErr) throw historyErr;

      // Combine: history first (reversed so it flows chronologically), then active & pending
      const combinedHistory = history ? [...history].reverse() : [];
      const combined = [...combinedHistory, ...(activeAndPending || [])];

      setAllSongs(combined);
      setSongRequests((activeAndPending || []).filter(r => r.status === 'pending'));
      
      const active = (activeAndPending || []).find(r => r.status === 'playing');
      if (active) {
        setCurrentSong(active);
      } else {
        setCurrentSong(null);
      }
    } catch (err) {
      console.error("Error fetching song requests:", err);
    }
  };

  // Load YouTube Player API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Fetch & Sync Song Requests from Supabase
  useEffect(() => {
    fetchSongs();
    fetchChatCommands();
    fetchMinigamesFromSupabase();

    // Subscribe to realtime database changes
    const channel = supabase
      .channel('song_requests_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, () => {
        fetchSongs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('song_player_volume', playerVolume);
  }, [playerVolume]);

  useEffect(() => {
    localStorage.setItem('dashboard_player_enabled', isPlayerEnabledInDashboard ? 'true' : 'false');
  }, [isPlayerEnabledInDashboard]);

  const searchYouTube = async (query) => {
    const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = query.match(urlRegex);
    if (match) {
      const videoId = match[1];
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await res.json();
        return { videoId, title: data.title || 'Video de YouTube' };
      } catch {
        return { videoId, title: 'Video de YouTube' };
      }
    }
    
    // Invidious API Fallback Instances for searching without API Keys
    const instances = [
      'https://invidious.projectsegfau.lt',
      'https://yewtu.be',
      'https://vid.puffyan.us',
      'https://invidious.flokinet.to'
    ];
    
    for (const instance of instances) {
      try {
        const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const firstResult = data.find(item => item.type === 'video');
            if (firstResult) {
              return { videoId: firstResult.videoId, title: firstResult.title };
            }
          }
        }
      } catch (e) {
        console.warn(`Failed searching with instance ${instance}:`, e);
      }
    }
    
    throw new Error("No se pudo buscar la canción en YouTube. Intenta usar un enlace directo.");
  };

  const handleSongRequest = async (query, requester) => {
    try {
      addBotLog(`[Twitch Chat] Song Request por @${requester}: "${query}"`);
      const song = await searchYouTube(query);
      
      // Check database to see if we need to auto-play (nothing playing or pending)
      const { data: activeSongs } = await supabase
        .from('song_requests')
        .select('id')
        .eq('status', 'playing');
        
      const { data: pendingSongs } = await supabase
        .from('song_requests')
        .select('id')
        .eq('status', 'pending');

      const isQueueEmpty = (!activeSongs || activeSongs.length === 0) && (!pendingSongs || pendingSongs.length === 0);
      
      const { error } = await supabase
        .from('song_requests')
        .insert([{ 
          title: song.title, 
          video_id: song.videoId, 
          requested_by: requester, 
          status: isQueueEmpty ? 'playing' : 'pending',
          played_at: isQueueEmpty ? new Date().toISOString() : null
        }]);
        
      if (error) throw error;
      
      enviarMensajeTwitch(`@${requester} ¡Canción añadida a la cola! 🎵 "${song.title}"`);
      // Update local state instantly
      fetchSongs();
    } catch (err) {
      addBotLog(`Error al procesar Song Request: ${err.message}`);
      enviarMensajeTwitch(`@${requester} ⚠️ Error: ${err.message}`);
    }
  };

  const handleGetActiveSong = async () => {
    try {
      const { data, error } = await supabase
        .from('song_requests')
        .select('title, requested_by')
        .eq('status', 'playing')
        .order('played_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (data) {
        enviarMensajeTwitch(`🎵 Reproduciendo ahora: "${data.title}" (pedida por @${data.requested_by})`);
      } else {
        enviarMensajeTwitch(`🎵 No hay ninguna canción reproduciéndose en este momento.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const playNextSong = async () => {
    try {
      // Get first pending song
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1);
        
      if (error) throw error;
      
      // Update currently playing song to 'played'
      if (currentSong) {
        await supabase
          .from('song_requests')
          .update({ status: 'played' })
          .eq('id', currentSong.id);
      }
      
      if (data && data.length > 0) {
        const next = data[0];
        await supabase
          .from('song_requests')
          .update({ status: 'playing', played_at: new Date().toISOString() })
          .eq('id', next.id);
          
        setCurrentSong(next);
      } else {
        setCurrentSong(null);
      }
    } catch (err) {
      console.error("Error playing next song:", err);
    }
  };

  const handleSkipSong = async () => {
    if (!currentSong) return;
    try {
      await supabase
        .from('song_requests')
        .update({ status: 'skipped' })
        .eq('id', currentSong.id);
        
      addBotLog(`Canción omitida: "${currentSong.title}"`);
      enviarMensajeTwitch(`⏭️ Canción omitida: "${currentSong.title}"`);
      playNextSong();
    } catch (err) {
      console.error("Error skipping song:", err);
    }
  };

  const handleTogglePlayPause = async () => {
    if (!currentSong) return;
    const nextPlayState = currentSong.is_playing === false ? true : false;
    
    // Optimistic local state update
    setCurrentSong(prev => ({ ...prev, is_playing: nextPlayState }));

    try {
      await supabase
        .from('song_requests')
        .update({ is_playing: nextPlayState })
        .eq('id', currentSong.id);
        
      addBotLog(nextPlayState ? "Reproducción reanudada" : "Reproducción pausada");
    } catch (err) {
      console.error("Error updating play state:", err);
    }
  };

  const handlePlaySpecificSong = async (song) => {
    try {
      // 1. Mark the currently playing song (if any) as 'played'
      if (currentSong) {
        await supabase
          .from('song_requests')
          .update({ status: 'played' })
          .eq('id', currentSong.id);
      }
      
      // 2. Mark all other pending songs created before this one as played to maintain queue logic
      // This automatically puts skipped songs into history (crossed out)
      const { error: skipError } = await supabase
        .from('song_requests')
        .update({ status: 'played' })
        .eq('status', 'pending')
        .lt('created_at', song.created_at);

      if (skipError) throw skipError;

      // 3. Mark all played/skipped songs created AFTER this one as 'pending' so they can be re-played
      // This reactivates the rest of the queue from this song forward
      const { error: resetError } = await supabase
        .from('song_requests')
        .update({ status: 'pending' })
        .in('status', ['played', 'skipped'])
        .gt('created_at', song.created_at);

      if (resetError) throw resetError;
      
      // 4. Mark the selected song as 'playing'
      await supabase
        .from('song_requests')
        .update({ status: 'playing', played_at: new Date().toISOString(), is_playing: true })
        .eq('id', song.id);
        
      fetchSongs();
      triggerToast(`▶️ Reproduciendo: ${song.title}`);
    } catch (err) {
      console.error("Error playing specific song:", err);
    }
  };

  const handleReloadOBS = () => {
    supabase.channel('obs_reload_channel').send({
      type: 'broadcast',
      event: 'reload_widget',
      payload: { message: 'reload' }
    });
    triggerToast("🔄 Señal de recarga enviada a OBS.");
  };

  const handleDeleteSongFromQueue = async (id) => {
    try {
      await supabase
        .from('song_requests')
        .delete()
        .eq('id', id);
        
      triggerToast("🗑️ Canción eliminada de la cola.");
      // Refresh local queue state instantly
      fetchSongs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveChatCommand = async (commandName, templateType, description, responses) => {
    try {
      let cleanName = commandName.trim().toLowerCase();
      if (!cleanName.startsWith('!')) {
        cleanName = '!' + cleanName;
      }
      cleanName = cleanName.replace(/\s+/g, '');

      if (!cleanName || cleanName === '!') {
        triggerToast("⚠️ El nombre del comando no es válido.");
        return false;
      }

      const filteredResponses = responses.filter(r => r.trim());
      if (filteredResponses.length === 0) {
        triggerToast("⚠️ Debes añadir al menos una respuesta válida.");
        return false;
      }

      const payload = {
        command_name: cleanName,
        template_type: templateType,
        description: description || '',
        responses: filteredResponses.map(r => r.trim())
      };

      const existing = chatCommands.find(c => c.command_name === cleanName);
      
      let error;
      if (existing) {
        const { error: err } = await supabase
          .from('chat_commands')
          .update(payload)
          .eq('id', existing.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('chat_commands')
          .insert([payload]);
        error = err;
      }

      if (error) throw error;

      triggerToast("💾 Comando guardado con éxito.");
      fetchChatCommands();
      return true;
    } catch (err) {
      console.error(err);
      triggerToast(`⚠️ Error al guardar comando: ${err.message}`);
      return false;
    }
  };

  const handleDeleteChatCommand = async (id) => {
    showConfirm("¿Estás seguro de que deseas eliminar este comando de chat?", async () => {
      try {
        const { error } = await supabase
          .from('chat_commands')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        triggerToast("🗑️ Comando eliminado.");
        fetchChatCommands();
      } catch (err) {
        console.error(err);
        triggerToast("⚠️ Error al eliminar el comando.");
      }
      closeConfirm();
    });
  };

  const handleClearQueue = () => {
    showConfirm("¿Deseas limpiar toda la cola de reproducción? Se borrarán todas las canciones de la base de datos.", async () => {
      try {
        const { error } = await supabase
          .from('song_requests')
          .delete()
          .neq('status', 'nonexistent_status_placeholder');

        if (error) throw error;

        setCurrentSong(null);
        setSongRequests([]);
        triggerToast("🧹 Cola de reproducción limpiada.");
      } catch (err) {
        console.error(err);
        triggerToast("⚠️ Error al limpiar la cola.");
      }
      closeConfirm();
    });
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    try {
      const song = await searchYouTube(manualQuery);
      
      // Determine if we need to auto-play (if queue and current are empty)
      const isQueueEmpty = !currentSong && songRequests.length === 0;

      const { error } = await supabase
        .from('song_requests')
        .insert([{ 
          title: song.title, 
          video_id: song.videoId, 
          requested_by: sessionUsername || 'Streamer', 
          status: isQueueEmpty ? 'playing' : 'pending',
          played_at: isQueueEmpty ? new Date().toISOString() : null
        }]);
        
      if (error) throw error;
      setManualQuery('');
      triggerToast("🎵 Canción añadida manualmente!");
      // Update local state instantly
      fetchSongs();
    } catch (err) {
      triggerToast(`⚠️ Error: ${err.message}`);
    }
  };
  
  const [botOauth, setBotOauth] = useState(() => localStorage.getItem('twitch_bot_oauth') || '');
  const [botUsername, setBotUsername] = useState(() => localStorage.getItem('twitch_bot_username') || '');
  const [botChannel, setBotChannel] = useState(() => localStorage.getItem('twitch_bot_channel') || 'eviltokkii');
  const [isBotConnected, setIsBotConnected] = useState(false);
  const [botLogs, setBotLogs] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('twitch_scheduled_messages_v2');
      if (saved) return JSON.parse(saved);
      
      const legacy = localStorage.getItem('twitch_scheduled_messages');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return parsed.map((txt, idx) => ({
          id: Date.now() + idx,
          text: typeof txt === 'string' ? txt : (txt.text || ''),
          intervalMs: typeof txt === 'object' && txt.intervalMs ? txt.intervalMs : 300000,
          active: true
        }));
      }
      return [
        { id: 1, text: "¡Hola! Recuerda seguir el canal y activar las notificaciones. 🔔", intervalMs: 300000, active: true }
      ];
    } catch (e) {
      return [
        { id: 1, text: "¡Hola! Recuerda seguir el canal y activar las notificaciones. 🔔", intervalMs: 300000, active: true }
      ];
    }
  });
  const [newScheduledMessage, setNewScheduledMessage] = useState('');
  const [newScheduledInterval, setNewScheduledInterval] = useState(5); // default 5 minutes
  const [newScheduledMinChat, setNewScheduledMinChat] = useState(20); // default 20 chat messages
  const [instantMessage, setInstantMessage] = useState('');
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editingMsgText, setEditingMsgText] = useState('');
  const [editingMsgInterval, setEditingMsgInterval] = useState(5);
  const [editingMsgMinChat, setEditingMsgMinChat] = useState(20);

  const wsRef = useRef(null);
  const intervalsRef = useRef([]);
  const userMessagesCountRef = useRef(0);

  const addBotLog = (text) => {
    const time = new Date().toLocaleTimeString();
    setBotLogs(prev => [`[${time}] ${text}`, ...prev.slice(0, 99)]);
  };

  const connectTwitchBot = () => {
    if (!botOauth || !botUsername || !botChannel) {
      triggerToast("⚠️ Por favor rellena todos los campos de configuración del bot.");
      return;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    addBotLog("Conectando a Twitch IRC...");
    
    try {
      const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
      wsRef.current = ws;

      ws.onopen = () => {
        addBotLog("¡Conectado a Twitch IRC WebSocket!");
        setIsBotConnected(true);
        
        const formattedOauth = botOauth.startsWith('oauth:') ? botOauth : 'oauth:' + botOauth;
        ws.send(`PASS ${formattedOauth}`);
        ws.send(`NICK ${botUsername.toLowerCase()}`);
        ws.send(`JOIN #${botChannel.toLowerCase()}`);
        addBotLog(`Autenticación enviada para el bot ${botUsername} en el canal #${botChannel}`);
      };

      ws.onmessage = (event) => {
        const rawMessage = event.data;
        
        if (rawMessage.startsWith("PING")) {
          ws.send("PONG :tmi.twitch.tv");
          addBotLog("PING recibido -> PONG enviado (Keep-alive)");
          return;
        }
        
        if (rawMessage.includes("PRIVMSG")) {
          const match = rawMessage.match(/:([^!]+)![^@]+@[^\s]+\s+PRIVMSG\s+#[^\s]+\s+:(.*)/);
          if (match) {
            const user = match[1];
            const text = match[2];
            addBotLog(`Chat - ${user}: ${text}`);
            if (user.toLowerCase() !== botUsername.toLowerCase()) {
              userMessagesCountRef.current += 1;
            }

            // Song Request Command Parsers
            const cmdPrefix = songRequestCommand.trim() + " ";
            if (text.startsWith(cmdPrefix) || text.startsWith("!songrequest ")) {
              const query = text.slice(text.startsWith(cmdPrefix) ? cmdPrefix.length : 13).trim();
              handleSongRequest(query, user);
            } else if (text === "!song" || text === "!currentsong") {
              handleGetActiveSong();
            } else if (text === "!skip") {
              if (user.toLowerCase() === botChannel.toLowerCase() || user.toLowerCase() === botUsername.toLowerCase()) {
                handleSkipSong();
              }
            } else {
              // Custom Commands checking
              const tokens = text.trim().split(/\s+/);
              const cmdWord = tokens[0].toLowerCase();
              const matchedCmd = chatCommands.find(c => c.command_name.toLowerCase() === cmdWord);
              if (matchedCmd && matchedCmd.responses && matchedCmd.responses.length > 0) {
                let target = tokens[1] || '';
                if (target.startsWith('@')) {
                  target = target.slice(1);
                }
                if (!target) {
                  target = 'alguien';
                }

                // Choose a random response from options
                const resps = matchedCmd.responses;
                const rIndex = Math.floor(Math.random() * resps.length);
                let messageTemplate = resps[rIndex];

                // Versus helper logic
                const isUserWinner = Math.random() < 0.5;
                const winner = isUserWinner ? user : target;
                const loser = isUserWinner ? target : user;

                // Numbers logic
                const percentage = Math.floor(Math.random() * 101);
                const level = Math.floor(Math.random() * 101);

                // Dynamic replacements
                const finalMessage = messageTemplate
                  .replace(/{user}/g, `@${user}`)
                  .replace(/{caller}/g, `@${user}`)
                  .replace(/{target}/g, `@${target}`)
                  .replace(/{winner}/g, `@${winner}`)
                  .replace(/{loser}/g, `@${loser}`)
                  .replace(/{percentage}/g, `${percentage}`)
                  .replace(/{level}/g, `${level}`);

                enviarMensajeTwitch(finalMessage);
              }
            }
          }
        } else if (rawMessage.includes("366")) {
          addBotLog(`¡Unido con éxito al chat del canal #${botChannel}!`);
        } else if (rawMessage.includes("NOTICE") || rawMessage.includes("421") || rawMessage.includes("login failed")) {
          addBotLog(`Twitch: ${rawMessage.trim()}`);
        }
      };

      ws.onclose = () => {
        setIsBotConnected(false);
        addBotLog("Conexión con Twitch IRC cerrada.");
      };

      ws.onerror = (error) => {
        addBotLog(`Error de WebSocket.`);
      };
    } catch (e) {
      addBotLog(`Error al inicializar WebSocket: ${e.message}`);
    }
  };

  const clearAllIntervals = () => {
    if (intervalsRef.current) {
      intervalsRef.current.forEach(timer => clearInterval(timer));
      intervalsRef.current = [];
    }
  };

  const disconnectTwitchBot = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    clearAllIntervals();
    setIsBotConnected(false);
    addBotLog("Bot desconectado manualmente.");
  };

  const enviarMensajeTwitch = (texto) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(`PRIVMSG #${botChannel.toLowerCase()} :${texto}`);
      addBotLog(`Mensaje enviado: ${texto}`);
    } else {
      addBotLog("Error: El WebSocket no está abierto. Conéctate primero.");
      triggerToast("⚠️ Conéctate a Twitch primero.");
    }
  };

  useEffect(() => {
    clearAllIntervals();
    userMessagesCountRef.current = 0;
    
    if (isBotConnected && scheduledMessages.length > 0) {
      addBotLog("Iniciando programadores independientes con control de actividad...");
      
      scheduledMessages.forEach(msg => {
        if (msg.active && msg.text && msg.intervalMs > 0) {
          let lastSentCount = 0;
          const threshold = msg.minChatMessages !== undefined ? msg.minChatMessages : 20;
          
          addBotLog(`Mensaje activo: "${msg.text.substring(0, 20)}..." cada ${msg.intervalMs / 60000} min (req. ${threshold} msgs de chat)`);
          
          const timer = setInterval(() => {
            const currentCount = userMessagesCountRef.current;
            if (currentCount - lastSentCount >= threshold) {
              enviarMensajeTwitch(msg.text);
              lastSentCount = currentCount;
            } else {
              addBotLog(`[Espera] Omitido: "${msg.text.substring(0, 15)}..." por poco tráfico (${currentCount - lastSentCount}/${threshold} mensajes recibidos)`);
            }
          }, msg.intervalMs);
          intervalsRef.current.push(timer);
        }
      });
    }
    
    return () => {
      clearAllIntervals();
    };
  }, [isBotConnected, scheduledMessages, botChannel]);

  useEffect(() => {
    localStorage.setItem('twitch_bot_oauth', botOauth);
  }, [botOauth]);

  useEffect(() => {
    localStorage.setItem('twitch_bot_username', botUsername);
  }, [botUsername]);

  useEffect(() => {
    localStorage.setItem('twitch_bot_channel', botChannel);
  }, [botChannel]);

  useEffect(() => {
    localStorage.setItem('twitch_scheduled_messages_v2', JSON.stringify(scheduledMessages));
  }, [scheduledMessages]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearAllIntervals();
    };
  }, []);

  const [libraryItems, setLibraryItems] = useState([]); // Base de datos (Eventos/Sorteos)
  const [savedNews, setSavedNews] = useState([]); // Caché local para Noticias

  const [newsData, setNewsData] = useState({
    title: '',
    subtitle: '',
    header_image_url: '',
    content: []
  });

  const [itemData, setItemData] = useState({
    titulo: '',
    descripcion: '',
    detalles: '',
    fecha: '',
    imagen: '',
    estado: 'proximo',
    premios: '',
    normas: [],
    requiere_participacion: true,
    fecha_fin: ''
  });
  const [tipoItem, setTipoItem] = useState('evento');
  const [newNorma, setNewNorma] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Participations State
  const [eventsList, setEventsList] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isLoadingParticipations, setIsLoadingParticipations] = useState(false);

  // Twitch Redemptions State
  const [twitchList, setTwitchList] = useState([]);
  const [selectedRewardName, setSelectedRewardName] = useState(null);
  const [isLoadingTwitch, setIsLoadingTwitch] = useState(false);

  // Most Streamed Games State
  const [mostStreamed, setMostStreamed] = useState([]);
  const [isLoadingMostStreamed, setIsLoadingMostStreamed] = useState(false);

  // Validar sesión y username al cargar
  useEffect(() => {
    const validateSession = async () => {
      if (isAuthenticated && sessionEmail) {
        const { data, error } = await supabase
          .from('whitelist')
          .select('*')
          .eq('email', sessionEmail)
          .maybeSingle();
        
        if (!error && data) {
          if (!data.approved) {
            handleLogout();
            return;
          }
          if (!data.username) setNeedsUsername(true);
          else setSessionUsername(data.username);
          
          setSessionPermissions(data);
          localStorage.setItem('builder_permissions', JSON.stringify(data));
        }
      }
    };
    validateSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');
    
    try {
      const emailClean = loginEmail.trim().toLowerCase();
      const { data, error } = await supabase
        .from('whitelist')
        .select('*')
        .eq('email', emailClean)
        .maybeSingle();
        
      if (error) {
        console.error("Database error during login:", error);
        setLoginError('Ocurrió un error al verificar tu acceso.');
        setIsSubmitting(false);
        return;
      }
      
      // If user is NOT in the whitelist, register them as pending approval
      if (!data) {
        const { error: insertError } = await supabase
          .from('whitelist')
          .insert([
            {
              email: emailClean,
              approved: false,
              access_news: false,
              access_events: false,
              access_giveaways: false,
              access_participations: false,
              access_twitch: false,
              access_most_streamed: false,
              access_scheduled_messages: false,
              access_song_request: false,
              access_commands: false,
              access_reports: false,
              access_minigames: false
            }
          ]);
          
        if (insertError) {
          console.error("Error creating whitelist request:", insertError);
          setLoginError('No se pudo registrar tu solicitud de acceso.');
        } else {
          setLoginError('Tu correo ha sido registrado para aprobación. Por favor, espera a que el administrador apruebe tu acceso.');
        }
        setIsSubmitting(false);
        return;
      }
      
      // If they are in the whitelist but NOT approved
      if (!data.approved) {
        setLoginError('Tu cuenta está pendiente de aprobación por el administrador.');
        setIsSubmitting(false);
        return;
      }
      
      localStorage.setItem('builder_email', data.email);
      localStorage.setItem('builder_permissions', JSON.stringify(data));
      setSessionEmail(data.email);
      setSessionPermissions(data);
      
      if (!data.username) {
        setNeedsUsername(true);
      } else {
        localStorage.setItem('builder_session', 'true');
        localStorage.setItem('builder_username', data.username);
        setSessionUsername(data.username);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error(err);
      setLoginError('Ocurrió un error al verificar tu acceso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('whitelist')
        .update({ username: newUsername.trim() })
        .eq('email', sessionEmail);
        
      if (error) throw error;
      
      localStorage.setItem('builder_session', 'true');
      localStorage.setItem('builder_username', newUsername.trim());
      setSessionUsername(newUsername.trim());
      setNeedsUsername(false);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      alert("Error guardando el nombre de usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('builder_session');
    localStorage.removeItem('builder_email');
    localStorage.removeItem('builder_username');
    localStorage.removeItem('builder_permissions');
    setIsAuthenticated(false);
    setSessionEmail('');
    setSessionUsername('');
    setSessionPermissions('*');
    setView('home');
  };

  useEffect(() => {
    if (view === 'create_content_item' || view === 'create' || view === 'view_twitch' || view === 'view_participations' || view === 'view_most_streamed') {
      fetchLibraryItems();
      if (view === 'view_most_streamed') fetchMostStreamed();
    }
  }, [view, tipoItem]);

  const fetchLibraryItems = async () => {
    setIsLoadingLibrary(true);
    try {
      const { data: news } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false });
      const { data: content } = await supabase.from('content_items').select('*').order('created_at', { ascending: false });
      const { data: redemptions } = await supabase.from('twitch_redemptions').select('*').order('created_at', { ascending: false });
      
      if (news) setSavedNews(news);
      if (content) setLibraryItems(content);
      if (redemptions) setTwitchList(redemptions);
    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const fetchMostStreamed = async (isSilent = false) => {
    if (!isSilent) setIsLoadingMostStreamed(true);
    try {
      const { data, error } = await supabase
        .from('most_streamed')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setMostStreamed(data);
    } catch (err) {
      console.error("Error fetching most streamed:", err);
    } finally {
      if (!isSilent) setIsLoadingMostStreamed(false);
    }
  };

  const handleMostStreamedChange = (id, field, value) => {
    setMostStreamed(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const saveMostStreamedItem = async (item) => {
    setSubmittingId(item.id);
    try {
      const { error } = await supabase
        .from('most_streamed')
        .upsert({ 
          id: item.id,
          title: item.title, 
          image_url: item.image_url || '', 
          updated_at: new Date().toISOString() 
        });
      
      if (error) throw error;
      
      triggerToast(`¡"${item.title}" actualizado correctamente!`);
      
      // Sincronización silenciosa en segundo plano
      await fetchMostStreamed(true);
      
    } catch (err) {
      console.error("Error al guardar juego:", err);
      alert("Error al persistir cambios: " + (err.message || "Error desconocido"));
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    if (view === 'view_participations') {
      fetchParticipationsAndEvents();
    } else if (view === 'view_reports') {
      fetchUserReports();
    } else if (view === 'view_minijuegos') {
      fetchMinigamesFromSupabase();
    }
  }, [view]);

  const fetchParticipationsAndEvents = async () => {
    setIsLoadingParticipations(true);
    
    // 1. Cargar la lista de eventos
    const { data: eventsData, error: eventsError } = await supabase
      .from('content_items')
      .select('id, titulo, tipo, estado, created_at')
      .order('created_at', { ascending: false });

    // 2. Cargar la lista de participaciones
    const { data: partData, error: partError } = await supabase
      .from('participations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (eventsError || partError) {
      console.error("Error fetching data:", eventsError || partError);
      alert("Hubo un error cargando los datos de Supabase. Revisa la consola.");
    } else {
      if (eventsData) setEventsList(eventsData);
      if (partData) setParticipations(partData);
    }
    setIsLoadingParticipations(false);
  };

  const handleDeleteParticipation = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${nombre}" de este evento? Esta acción no se puede deshacer.`)) {
      const { error } = await supabase.from('participations').delete().eq('id', id);
      if (!error) {
        setParticipations(prev => prev.filter(p => p.id !== id));
        alert('Participante eliminado con éxito.');
      } else {
        alert("Error al eliminar al participante: " + error.message);
      }
    }
  };

  const selectedEvent = eventsList.find(e => e.id === selectedEventId);
  const selectedParticipations = selectedEventId ? participations.filter(p => p.item_id === selectedEventId || p.item_titulo === (selectedEvent?.titulo || '')) : [];

  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setNewsData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, typeContext = 'evento', blockId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    console.log(`Iniciando subida real de ${file.name} a R2 vía Edge Function...`);

    try {
      const { data, error } = await supabase.functions.invoke('clever-api', {
        body: { fileName: file.name, fileType: file.type }
      });

      if (error || !data) throw new Error(error ? error.message : "Error generando presigned URL localmente");

      const uploadRes = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadRes.ok) throw new Error("Mala conexion con R2 BUCKET: " + uploadRes.statusText);

      const finalUrl = data.finalPublicUrl;
      
      // Inyectar previsualizador híbrido
      window.__R2_MOCK_CACHE__[finalUrl] = URL.createObjectURL(file);

      if (typeContext === 'evento' || typeContext === 'sorteo') {
        setItemData(prev => ({ ...prev, imagen: finalUrl }));
      } else if (typeContext === 'noticia_header') {
        setNewsData(prev => ({ ...prev, header_image_url: finalUrl }));
      } else if (typeContext === 'noticia_block' && blockId) {
        updateContentBlock(blockId, finalUrl);
      }
    } catch (err) {
      console.error(err);
      alert("Error subiendo al R2 Final: " + err.message);
    }
    
    setIsUploadingImage(false);
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemData(prev => ({ ...prev, [name]: value }));
  };

  const addNorma = () => {
    if (newNorma.trim()) {
      setItemData(prev => ({ ...prev, normas: [...prev.normas, newNorma.trim()] }));
      setNewNorma('');
    }
  };

  const removeNorma = (index) => {
    setItemData(prev => ({
      ...prev,
      normas: prev.normas.filter((_, i) => i !== index)
    }));
  };

  const resetItemForm = (tipo) => {
    setEditingItemId(null);
    setTipoItem(tipo);
    setNewNorma('');
    setItemData({ 
      titulo: '', 
      descripcion: '', 
      detalles: '', 
      fecha: '', 
      imagen: '', 
      estado: 'proximo', 
      premios: '', 
      normas: [],
      requiere_participacion: true,
      fecha_fin: ''
    });
  };

  const handleEditItem = async (id, itemTypeHint = null) => {
    if (view === 'create' || itemTypeHint === 'noticia') {
      const { data: newsItem, error } = await supabase.from('news_articles').select('*').eq('id', id).single();
      if (error) {
        alert("Error cargando la noticia: " + error.message);
        return;
      }
      
      setEditingItemId(id);
      setNewsData({
        title: newsItem.title || '',
        subtitle: newsItem.subtitle || '',
        header_image_url: newsItem.header_image || '',
        content: (newsItem.content_blocks || []).map(block => ({
          id: crypto.randomUUID(),
          type: block.type,
          value: block.type === 'text' ? (block.content || '') : (block.url || '')
        }))
      });
      setView('create');
      return;
    }

    const { data: itemData, error } = await supabase.from('content_items').select('*').eq('id', id).single();
    if (error) {
      alert("Error cargando la información de Supabase: " + error.message);
      return;
    }
    
    setEditingItemId(id);
    setTipoItem(itemData.tipo || 'evento');
    setItemData({
      titulo: itemData.titulo || '',
      descripcion: itemData.descripcion || '',
      detalles: itemData.detalles || '',
      fecha: itemData.fecha || '',
      imagen: itemData.imagen || '',
      estado: itemData.estado || 'proximo',
      premios: itemData.premios || '',
      normas: itemData.normas || [],
      requiere_participacion: itemData.requiere_participacion !== false,
      fecha_fin: itemData.fecha_fin ? itemData.fecha_fin.substring(0, 16) : ''
    });
    setNewNorma('');
    setView('create_content_item');
  };

  const addContentBlock = (type) => {
    setNewsData(prev => ({
      ...prev,
      content: [...prev.content, { id: crypto.randomUUID(), type, value: '' }]
    }));
  };

  const updateContentBlock = (id, newValue) => {
    setNewsData(prev => ({
      ...prev,
      content: prev.content.map(block => 
        block.id === id ? { ...block, value: newValue } : block
      )
    }));
  };

  const removeContentBlock = (id) => {
    setNewsData(prev => ({
      ...prev,
      content: prev.content.filter(block => block.id !== id)
    }));
  };

  const handleDeleteItem = (id) => {
    const msg = view === 'create' 
      ? "¿Seguro que deseas eliminar esta noticia permanentemente de Supabase?" 
      : "¿Seguro que deseas eliminar este registro permanentemente de Supabase?";
      
    showConfirm(msg, async () => {
      if (view === 'create') {
        const { error } = await supabase.from('news_articles').delete().eq('id', id);
        if (!error) {
          setSavedNews(prev => prev.filter(item => item.id !== id));
          triggerToast("Noticia eliminada correctamente.");
        } else {
          alert("Error al eliminar noticia: " + error.message);
        }
      } else {
        const { error } = await supabase.from('content_items').delete().eq('id', id);
        if (!error) {
          setLibraryItems(prev => prev.filter(item => item.id !== id));
          triggerToast("Registro eliminado correctamente.");
        } else {
          alert("Error al eliminar: " + error.message);
        }
      }
      closeConfirm();
    });
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      tipo: tipoItem,
      titulo: itemData.titulo,
      slug: itemData.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      descripcion: itemData.descripcion,
      detalles: itemData.detalles,
      fecha: itemData.fecha,
      imagen: itemData.imagen,
      estado: itemData.estado,
      premios: itemData.premios,
      normas: itemData.normas,
      requiere_participacion: itemData.requiere_participacion,
      fecha_fin: itemData.fecha_fin ? new Date(itemData.fecha_fin).toISOString() : null
    };

    if (editingItemId) {
      console.log(`Actualizando ${tipoItem} en Supabase en tiempo real...`);
      const { error } = await supabase
        .from('content_items')
        .update(payload)
        .eq('id', editingItemId);

      if (error) {
        console.error("Error actualizando en Supabase:", error);
        alert(`Error al guardar cambios: ${error.message}`);
        setIsSubmitting(false);
        return;
      }
      triggerToast(`¡${tipoItem === 'evento' ? 'Evento' : 'Sorteo'} actualizado exitosamente!`, 'center');
    } else {
      console.log(`Guardando nuevo ${tipoItem} en Supabase...`);
      const { error } = await supabase
        .from('content_items')
        .insert([payload]);

      if (error) {
        console.error("Error insertando en Supabase:", error);
        alert(`Error al guardar en base de datos: ${error.message}`);
        setIsSubmitting(false);
        return;
      }
      triggerToast(`¡${tipoItem === 'evento' ? 'Evento' : 'Sorteo'} generado exitosamente!`, 'center');
      resetItemForm(tipoItem);
    }

    // Refresh Sidebar
    fetchLibraryItems();
    setIsSubmitting(false);
    
    // Permanece en la vista actual para fluidez
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      title: newsData.title,
      author: sessionUsername,
      slug: newsData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      subtitle: newsData.subtitle || null,
      header_image: newsData.header_image_url,
      content_blocks: newsData.content.map(block => {
        if (block.type === 'text') {
           return { type: 'text', content: block.value };
        } else {
           return { type: 'image', url: block.value };
        }
      })
    };

    if (editingItemId) {
      const { error } = await supabase.from('news_articles').update(payload).eq('id', editingItemId);
      if (error) {
        console.error("Error actualizando en Supabase:", error);
        alert("Hubo un error guardando cambios: " + error.message);
        setIsSubmitting(false);
        return;
      }
      triggerToast('¡Noticia actualizada exitosamente!', 'center');
    } else {
      const { error } = await supabase.from('news_articles').insert([payload]);
      if (error) {
        console.error("Error al publicar en Supabase:", error);
        alert("Hubo un error guardando la noticia: " + error.message);
        setIsSubmitting(false);
        return;
      }
      triggerToast('¡Noticia publicada exitosamente!', 'center');
      setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] });
    }

    fetchLibraryItems(); // Refrescar librería
    setIsSubmitting(false);
    
    // Reset Form & stay in current view for fluidity
    setEditingItemId(null);
    setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] });
  };

    const params = new URLSearchParams(window.location.search);
    const isOverlay = params.get('overlay') === 'true';

    if ((!isAuthenticated || needsUsername) && !isOverlay) {
    return (
      <div className="login-view">
        <div className="login-card animate-slide-down">
          {needsUsername ? (
            <>
              <div className="login-logo">
                <Users size={32} />
              </div>
              <h1 className="login-title">¡Bienvenido!</h1>
              <p className="login-subtitle">Parece que es tu primera vez aquí. Elige un nombre de usuario que aparecerá como autor en tus noticias.</p>
              
              <form onSubmit={handleSetUsername}>
                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Tu nombre de usuario o nick"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required 
                    style={{ textAlign: 'center', marginBottom: '1rem' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Comenzar a Crear'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="login-logo">
                <Lock size={32} />
              </div>
              <h1 className="login-title">Builder Tokkii</h1>
              <p className="login-subtitle">Ingresa tu correo autorizado para acceder al panel de control.</p>
              
              <form onSubmit={handleLogin}>
                {loginError && (
                  <div className="error-message">
                    <AlertCircle size={18} />
                    {loginError}
                  </div>
                )}
                <div className="form-group">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="correo@ejemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required 
                    style={{ textAlign: 'center', marginBottom: '1rem' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verificando...' : 'Entrar al Builder'}
                </button>
              </form>
            </>
          )}
          
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Si no tienes acceso, contacta con el administrador.
          </p>
        </div>
      </div>
    );
  }

  // Handle Overlay Route
  const params2 = new URLSearchParams(window.location.search);
  const isOverlay2 = params2.get('overlay') === 'true';

  if (isOverlay2) {
    return <SongRequestOverlay currentSong={currentSong} volume={playerVolume} onEnded={playNextSong} />;
  }

  return (
    <div className="app-layout">
      {view === 'create' && <CloudflareImageGenerator />}
      
      {toast.show && (
        <div 
          className={toast.type === 'center' ? 'animate-modal-center' : 'animate-slide-up-fade'}
          style={toast.type === 'center' ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--bg-card)',
            border: '2px solid var(--primary)',
            color: 'var(--text-main)',
            padding: '2.5rem 4rem',
            borderRadius: '24px',
            fontSize: '1.3rem',
            fontWeight: '700',
            boxShadow: '0 20px 80px rgba(0,0,0,0.9), 0 0 30px rgba(168, 85, 247, 0.3)',
            zIndex: 6000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            textAlign: 'center',
            width: '90%',
            maxWidth: '500px'
          } : {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--primary)',
            color: 'var(--text-main)',
            padding: '12px 24px',
            borderRadius: '50px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {toast.type === 'center' && (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}>
               <Save size={36} />
            </div>
          )}
          {toast.type !== 'center' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>}
          {toast.message}
        </div>
      )}

      {editingMinigameItem && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4000
          }}
        >
          <div 
            className="login-card animate-modal-in" 
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              padding: '2.5rem', 
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              margin: '0 20px',
              textAlign: 'left',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gamepad2 size={24} color="var(--primary)" />
              Editar Item #{editingMinigameItem.index + 1} ({activeMinigameTab.toUpperCase()})
            </h2>
            
            {(activeMinigameTab === 'overwatch' || activeMinigameTab === 'games' || activeMinigameTab === 'disney' || activeMinigameTab === 'covers') && (
              <>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Texto de la Pregunta</label>
                  <textarea 
                    className="form-control" 
                    rows={2}
                    value={editingMinigameItem.data.text}
                    onChange={(e) => {
                      const copy = { ...editingMinigameItem };
                      copy.data.text = e.target.value;
                      setEditingMinigameItem(copy);
                    }}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                {(activeMinigameTab === 'disney' || activeMinigameTab === 'covers') && (
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">URL de la Imagen</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editingMinigameItem.data.image}
                      onChange={(e) => {
                        const copy = { ...editingMinigameItem };
                        copy.data.image = e.target.value;
                        setEditingMinigameItem(copy);
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                      <img 
                        src={editingMinigameItem.data.image} 
                        alt="Preview" 
                        style={{ height: '80px', objectFit: 'contain', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '6px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = activeMinigameTab === 'disney' ? 'https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public/Imagenes/default_character.png' : 'https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public/Imagenes/default_perk.png'; }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeMinigameTab === 'dbd' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <img 
                    src={getDbdPerkImageUrl(editingMinigameItem.data.image)} 
                    alt={editingMinigameItem.data.name} 
                    style={{ width: '80px', height: '80px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                    onError={(e) => handlePerkImageError(e, editingMinigameItem.data.image)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Nombre del Perk</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editingMinigameItem.data.name}
                    onChange={(e) => {
                      const copy = { ...editingMinigameItem };
                      copy.data.name = e.target.value;
                      setEditingMinigameItem(copy);
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Ruta de la Imagen Local</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editingMinigameItem.data.image}
                    onChange={(e) => {
                      const copy = { ...editingMinigameItem };
                      copy.data.image = e.target.value;
                      setEditingMinigameItem(copy);
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Rol</label>
                  <select 
                    className="form-control"
                    value={editingMinigameItem.data.role}
                    onChange={(e) => {
                      const copy = { ...editingMinigameItem };
                      copy.data.role = e.target.value;
                      setEditingMinigameItem(copy);
                    }}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px' }}
                  >
                    <option value="survivor">Survivor</option>
                    <option value="killer">Killer</option>
                  </select>
                </div>
              </>
            )}

            {activeMinigameTab === 'flags' && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Código de Bandera (Minúsculas, ej: es, ar, mx)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingMinigameItem.data.flagCode}
                  onChange={(e) => {
                    const copy = { ...editingMinigameItem };
                    copy.data.flagCode = e.target.value;
                    setEditingMinigameItem(copy);
                  }}
                />
              </div>
            )}

            {activeMinigameTab === 'scramble' && (
              <>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Palabra Correcta (Mayúsculas)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editingMinigameItem.data.scrambleWord}
                    onChange={(e) => {
                      const copy = { ...editingMinigameItem };
                      copy.data.scrambleWord = e.target.value.toUpperCase();
                      setEditingMinigameItem(copy);
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Pista</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editingMinigameItem.data.scrambleHint}
                    onChange={(e) => {
                      const copy = { ...editingMinigameItem };
                      copy.data.scrambleHint = e.target.value;
                      setEditingMinigameItem(copy);
                    }}
                  />
                </div>
              </>
            )}

            {activeMinigameTab === 'music' && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">ID de Video de YouTube (11 caracteres)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingMinigameItem.data.youtubeId}
                  onChange={(e) => {
                    const copy = { ...editingMinigameItem };
                    copy.data.youtubeId = e.target.value;
                    setEditingMinigameItem(copy);
                  }}
                />
              </div>
            )}

            {editingMinigameItem.data.options && editingMinigameItem.data.options.length > 0 && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Opciones de Respuesta</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  {editingMinigameItem.data.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="radio" 
                        name="minigame-correct-answer"
                        checked={editingMinigameItem.data.answerIndex === oIdx}
                        onChange={() => {
                          const copy = { ...editingMinigameItem };
                          copy.data.answerIndex = oIdx;
                          setEditingMinigameItem(copy);
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4ADE80' }}
                        title="Marcar como respuesta correcta"
                      />
                      <input 
                        type="text" 
                        className="form-control"
                        value={opt}
                        onChange={(e) => {
                          const copy = { ...editingMinigameItem };
                          copy.data.options[oIdx] = e.target.value;
                          setEditingMinigameItem(copy);
                        }}
                        style={{ flex: 1, padding: '8px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button 
                className="btn-submit" 
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', flex: 1 }}
                onClick={() => setEditingMinigameItem(null)}
                disabled={isSavingMinigame}
              >
                Cancelar
              </button>
              <button 
                className="btn-submit" 
                style={{ background: 'var(--primary)', color: 'white', flex: 1 }}
                onClick={() => {
                  const items = [...minigamesData[activeMinigameTab]];
                  items[editingMinigameItem.index] = editingMinigameItem.data;
                  saveMinigameToSupabase(activeMinigameTab, items);
                }}
                disabled={isSavingMinigame}
              >
                {isSavingMinigame ? 'Guardando...' : 'Guardar en Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4000
          }}
        >
          <div 
            className="login-card animate-modal-in" 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              padding: '2rem', 
              textAlign: 'center',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              margin: '0 20px'
            }}
          >
            <div className="login-logo" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '1.5rem' }}>
              <Trash2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>¿Estás seguro?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
              {confirmModal.message}
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-submit" 
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                onClick={closeConfirm}
              >
                Cancelar
              </button>
              <button 
                className="btn-submit" 
                style={{ background: '#ef4444', color: 'white' }}
                onClick={confirmModal.onConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMsg && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4000
          }}
        >
          <div 
            className="login-card animate-modal-in" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '2rem', 
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              margin: '0 20px',
              textAlign: 'left'
            }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={24} color="var(--primary)" />
              {editingMsg.id === 'new' ? 'Nuevo Mensaje Programado' : 'Editar Mensaje Programado'}
            </h2>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Texto del Mensaje</label>
              <textarea 
                className="form-control" 
                rows={3}
                placeholder="Escribe el contenido del mensaje automático..."
                value={editingMsgText}
                onChange={(e) => setEditingMsgText(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Intervalo (Minutos)</label>
              <input 
                type="number" 
                min="1"
                className="form-control"
                value={editingMsgInterval}
                onChange={(e) => setEditingMsgInterval(Math.max(1, parseInt(e.target.value, 10)))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Mínimo de mensajes de chat (otros usuarios)</label>
              <input 
                type="number" 
                min="0"
                className="form-control"
                value={editingMsgMinChat}
                onChange={(e) => setEditingMsgMinChat(Math.max(0, parseInt(e.target.value, 10)))}
              />
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                El mensaje se enviará si se ha alcanzado el tiempo programado Y además se han recibido esta cantidad de mensajes de chat de otros usuarios desde el envío anterior.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button 
                className="btn-submit" 
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', flex: 1 }}
                onClick={() => setEditingMsg(null)}
              >
                Cancelar
              </button>
              {editingMsg.id !== 'new' && (
                <button 
                  className="btn-submit" 
                  style={{ background: '#ef4444', color: 'white', flex: 1 }}
                  onClick={() => {
                    setScheduledMessages(scheduledMessages.filter(m => m.id !== editingMsg.id));
                    setEditingMsg(null);
                  }}
                >
                  Eliminar
                </button>
              )}
              <button 
                className="btn-submit" 
                style={{ background: 'var(--primary)', color: 'white', flex: 1 }}
                onClick={() => {
                  if (editingMsgText.trim()) {
                    if (editingMsg.id === 'new') {
                      setScheduledMessages([
                        ...scheduledMessages,
                        {
                          id: Date.now(),
                          text: editingMsgText.trim(),
                          intervalMs: editingMsgInterval * 60000,
                          minChatMessages: editingMsgMinChat,
                          active: true
                        }
                      ]);
                    } else {
                      setScheduledMessages(scheduledMessages.map(m => 
                        m.id === editingMsg.id 
                          ? { ...m, text: editingMsgText.trim(), intervalMs: editingMsgInterval * 60000, minChatMessages: editingMsgMinChat } 
                          : m
                      ));
                    }
                    setEditingMsg(null);
                  }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstantModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4000
          }}
        >
          <div 
            className="login-card animate-modal-in" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '2rem', 
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              margin: '0 20px',
              textAlign: 'left'
            }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Send size={24} color="var(--primary)" />
              Enviar mensaje ahora
            </h2>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Contenido del Mensaje</label>
              <textarea 
                className="form-control" 
                rows={4}
                placeholder="Escribe el mensaje que se enviará instantáneamente al chat..."
                value={instantMessage}
                onChange={(e) => setInstantMessage(e.target.value)}
                style={{ resize: 'vertical' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button 
                className="btn-submit" 
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', flex: 1 }}
                onClick={() => {
                  setShowInstantModal(false);
                  setInstantMessage('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-submit" 
                style={{ background: 'var(--primary)', color: 'white', flex: 1 }}
                onClick={() => {
                  if (instantMessage.trim()) {
                    enviarMensajeTwitch(instantMessage);
                    setShowInstantModal(false);
                    setInstantMessage('');
                  }
                }}
              >
                Enviar Mensaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR ZONE */}
      {view !== 'home' && view !== 'view_most_streamed' && view !== 'view_song_request' && view !== 'view_reports' && view !== 'view_minijuegos' && (() => {
        const activeList = view === 'view_participations' ? eventsList : 
                           view === 'view_twitch' ? [...new Set((twitchList || []).map(t => t.reward_name))].map(name => ({ id: name, titulo: name, tipo: 'Canje Twitch', created_at: new Date() })) :
                           view === 'create' ? savedNews : 
                           view === 'view_scheduled_messages' ? scheduledMessages :
                           view === 'view_commands' ? chatCommands :
                           libraryItems.filter(item => {
                             if (view === 'create_content_item') return true;
                             const type = (item.tipo || '').toLowerCase().trim();
                             const currentType = (tipoItem || '').toLowerCase().trim();
                             if (currentType === 'sorteo') return type === 'sorteo';
                             if (currentType === 'evento') return type === 'evento';
                             return true;
                           });

        const iconName = view === 'view_participations' ? <Users size={24} color="var(--primary)" /> :
                         view === 'view_twitch' ? <LayoutTemplate size={24} color="var(--primary)" /> :
                         view === 'create' ? <Newspaper size={24} color="var(--primary)" /> : 
                         view === 'view_scheduled_messages' ? <MessageSquare size={24} color="var(--primary)" /> :
                         view === 'view_commands' ? <Settings size={24} color="var(--primary)" /> :
                         view === 'create_content_item' ? <LayoutTemplate size={24} color="var(--primary)" /> :
                         tipoItem === 'sorteo' ? <Gift size={24} color="var(--primary)" /> : 
                         <Calendar size={24} color="var(--primary)" />;

        const titleText = view === 'view_participations' ? 'Librería de Eventos' :
                          view === 'view_twitch' ? 'Canjes por Tipo' :
                          view === 'create' ? 'Noticias' : 
                          view === 'view_scheduled_messages' ? 'Mensajes Programados' :
                          view === 'view_commands' ? 'Comandos Creados' :
                          view === 'create_content_item' ? 'Sorteos y Eventos' :
                          tipoItem === 'sorteo' ? 'Sorteos' : 'Eventos';

        return (
          <aside className="sidebar animate-slide-down">
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {iconName}
                <h2 style={{ whiteSpace: 'nowrap', fontSize: '1.1rem', margin: 0 }}>{titleText} ({(activeList || []).length})</h2>
              </div>
              {view !== 'view_participations' && view !== 'view_twitch' && (
                <button 
                  className="btn-add" 
                  title={view === 'view_scheduled_messages' ? "Crear nuevo mensaje" : view === 'view_commands' ? "Crear nuevo comando" : `Crear nuevo ${tipoItem}`}
                  onClick={() => {
                    setEditingItemId(null);
                    if (view === 'create') {
                      setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] });
                    } else if (view === 'view_scheduled_messages') {
                      setEditingMsg({ id: 'new', text: '', intervalMs: 300000, active: true, minChatMessages: 20 });
                      setEditingMsgText('');
                      setEditingMsgInterval(5);
                      setEditingMsgMinChat(20);
                    } else if (view === 'view_commands') {
                      setCmdFormName('');
                      setCmdFormDesc('');
                      setCmdFormType('versus');
                      setCmdFormResponses(['']);
                    } else {
                      resetItemForm(tipoItem);
                    }
                  }}
                  style={{ width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
            <div className="sidebar-content">
              {isLoadingLibrary && (activeList || []).length === 0 && view !== 'create' && view !== 'view_scheduled_messages' ? (
                <div className="empty-sidebar" style={{ opacity: 0.6, transition: 'opacity 0.2s' }}>
                  <div style={{ marginBottom: '10px' }}><LayoutTemplate size={40} /></div>
                  Cargando librería en vivo...
                </div>
              ) : (activeList || []).length === 0 ? (
                <div className="empty-sidebar">
                  <div style={{ opacity: 0.5 }}><LayoutTemplate size={40} /></div>
                  Aún no hay registros de {titleText.toLowerCase()}.
                </div>
              ) : (
                (activeList || []).map(item => {
                  const isActive = selectedEventId === item.id || 
                                   selectedRewardName === item.id || 
                                   (view === 'view_scheduled_messages' && editingMsg && editingMsg.id === item.id) ||
                                   (view === 'view_commands' && cmdFormName === item.command_name);

                  return (
                    <div 
                      key={item.id} 
                      className={`news-item animate-slide-down ${isActive ? 'active' : ''}`} 
                      style={{ 
                        cursor: 'pointer',
                        borderLeft: isActive ? '4px solid var(--primary)' : 'none',
                        backgroundColor: isActive ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                      }} 
                      onClick={() => { 
                        if (view === 'view_participations') {
                          setSelectedEventId(item.id);
                        } else if (view === 'view_twitch') {
                          setSelectedRewardName(item.id);
                        } else if (view === 'view_scheduled_messages') {
                          setEditingMsg(item);
                          setEditingMsgText(item.text);
                          setEditingMsgInterval(item.intervalMs / 60000);
                          setEditingMsgMinChat(item.minChatMessages !== undefined ? item.minChatMessages : 20);
                        } else if (view === 'view_commands') {
                          setCmdFormName(item.command_name);
                          setCmdFormType(item.template_type);
                          setCmdFormDesc(item.description || '');
                          setCmdFormResponses(item.responses);
                        } else {
                          handleEditItem(item.id, view === 'create' ? 'noticia' : null);
                        }
                      }}
                    >
                      {view !== 'view_participations' && view !== 'view_twitch' && (
                        <button 
                          className="btn-delete-news" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (view === 'view_scheduled_messages') {
                              setScheduledMessages(scheduledMessages.filter(m => m.id !== item.id));
                              if (editingMsg && editingMsg.id === item.id) setEditingMsg(null);
                            } else if (view === 'view_commands') {
                              handleDeleteChatCommand(item.id);
                            } else {
                              handleDeleteItem(item.id); 
                            }
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="news-item-title" style={{ paddingRight: '20px' }}>
                        {item.titulo || item.title || item.text || item.command_name}
                      </div>
                      <div className="news-item-date" style={{ textTransform: 'capitalize', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          {view === 'view_twitch' ? 'Categoría Twitch' : 
                           view === 'create' ? `Noticia • ${item.author || 'Sin Autor'}` : 
                           view === 'view_scheduled_messages' ? `Intervalo: ${item.intervalMs / 60000} min` : 
                           view === 'view_commands' ? `Tipo: ${item.template_type === 'versus' ? 'Pelea/Versus' : item.template_type === 'action' ? 'Acción' : 'Decisión'}` :
                           (item.tipo || 'Objeto')} 
                           {view !== 'view_twitch' && view !== 'view_commands' && ` • ${new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric'})}`}
                        </div>
                        {(view === 'create_content_item' || view === 'view_participations') && item.tipo && (
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              backgroundColor: item.tipo === 'sorteo' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: item.tipo === 'sorteo' ? '#e9d5ff' : '#bfdbfe',
                              border: item.tipo === 'sorteo' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)'
                            }}>
                              {item.tipo}
                            </span>
                            {item.estado === 'terminado' && (
                              <span style={{
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.4)'
                              }}>
                                Terminado
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        );
      })()}

      {/* MAIN CONTENT ZONE */}
      <main className="main-area">
        {view === 'home' ? (
          <div className="home-view animate-slide-down">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 className="home-header-title">Panel de Creadores</h1>
              <button 
                onClick={handleLogout}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                title="Cerrar Sesión"
              >
                <LogOut size={18} /> Salir ({sessionUsername})
              </button>
            </div>
            <p className="home-header-subtitle">
              Gestiona el contenido estructurado de la web. Selecciona una acción para comenzar.
            </p>
            
            <h2 className="section-title" style={{ marginTop: '2.5rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '1.4rem', fontWeight: 600, borderBottom: '1px solid rgba(239, 68, 68, 0.1)', paddingBottom: '8px' }}>
              Herramientas de la Web
            </h2>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '3rem', gap: '1.5rem' }}>
              <div 
                className={`dashboard-card ${!hasAccess('news_only') ? 'restricted' : ''}`} 
                onClick={() => { setEditingItemId(null); setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] }); restrictedNavigate('create', 'news_only'); }}
              >
                <div className="icon-bg">
                  <FilePlus size={36} />
                </div>
                <h3>Crear Noticia</h3>
                <p>Genera un nuevo artículo inmersivo con imágenes y bloques de texto para la vista principal.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('events_and_giveaways') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('create_content_item', 'events_and_giveaways')}
              >
                <div className="icon-bg">
                  <Calendar size={36} />
                </div>
                <h3>Crear Sorteo o Evento</h3>
                <p>Configura sorteos y eventos interactivos en un creador unificado con normas, premios y fechas.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('participations') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_participations', 'participations')}
              >
                <div className="icon-bg">
                  <Users size={36} />
                </div>
                <h3>Gestionar Participaciones</h3>
                <p>Revisa y gestiona los usuarios inscritos a los diferentes eventos y sorteos activos.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('most_streamed') ? 'restricted' : ''}`} 
                style={{ border: hasAccess('most_streamed') ? '1px solid rgba(236, 72, 153, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_most_streamed', 'most_streamed')}
              >
                <div className="icon-bg" style={{ background: hasAccess('most_streamed') ? 'rgba(236, 72, 153, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: 'var(--primary)' }}>
                  <Gamepad2 size={36} />
                </div>
                <h3 style={{ color: 'var(--text-main)' }}>Lo mas Streameable</h3>
                <p>Gestiona los 6 juegos destacados que aparecen en la sección principal de la web.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('reports') ? 'restricted' : ''}`} 
                style={{ border: hasAccess('reports') ? '1px solid rgba(239, 68, 68, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_reports', 'reports')}
              >
                <div className="icon-bg" style={{ background: hasAccess('reports') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: '#EF4444' }}>
                  <AlertCircle size={36} />
                </div>
                <h3 style={{ color: 'var(--text-main)' }}>Reportes Web</h3>
                <p>Visualiza y gestiona los reportes, sugerencias y fallos enviados por los usuarios desde la web.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('minigames') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_minijuegos', 'minigames')}
                style={{ border: hasAccess('minigames') ? '1px solid rgba(168, 85, 247, 0.4)' : '1px dashed var(--border-color)' }}
              >
                <div className="icon-bg" style={{ background: hasAccess('minigames') ? 'rgba(168, 85, 247, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: '#A855F7' }}>
                  <Gamepad2 size={36} />
                </div>
                <h3 style={{ color: 'var(--text-main)' }}>Minijuegos</h3>
                <p>Visualiza y edita manualmente el banco de preguntas, perks y palabras de todas las dinámicas.</p>
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: '2.5rem', marginBottom: '1.5rem', color: '#A855F7', fontSize: '1.4rem', fontWeight: 600, borderBottom: '1px solid rgba(168, 85, 247, 0.1)', paddingBottom: '8px' }}>
              Herramientas Twitch
            </h2>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div 
                className={`dashboard-card ${!hasAccess('twitch') ? 'restricted' : ''}`} 
                style={{ border: hasAccess('twitch') ? '1px solid rgba(168, 85, 247, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_twitch', 'twitch')}
              >
                <div className="icon-bg" style={{ background: hasAccess('twitch') ? 'rgba(168, 85, 247, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: hasAccess('twitch') ? '#A855F7' : 'var(--primary)' }}>
                  <LayoutTemplate size={36} />
                </div>
                <h3 style={{ color: hasAccess('twitch') ? '#A855F7' : 'var(--text-main)' }}>Canjes de Twitch</h3>
                <p>Monitorea y organiza los reclamos de recompensas de puntos de canal vinculados.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('scheduled_messages') ? 'restricted' : ''}`} 
                style={{ border: hasAccess('scheduled_messages') ? '1px solid rgba(59, 130, 246, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_scheduled_messages', 'scheduled_messages')}
              >
                <div className="icon-bg" style={{ background: hasAccess('scheduled_messages') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: '#3B82F6' }}>
                  <MessageSquare size={36} />
                </div>
                <h3 style={{ color: 'var(--text-main)' }}>Mensajes programados</h3>
                <p>Programa mensajes automatizados para el chat de Twitch de EvilTokkii.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('song_request') ? 'restricted' : ''}`} 
                style={{ border: hasAccess('song_request') ? '1px solid rgba(245, 158, 11, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_song_request', 'song_request')}
              >
                <div className="icon-bg" style={{ background: hasAccess('song_request') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: '#F59E0B' }}>
                  <Play size={36} />
                </div>
                <h3 style={{ color: 'var(--text-main)' }}>Song Request</h3>
                <p>Gestiona la cola de canciones pedidas por el chat y visualiza el reproductor.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('commands') ? 'restricted' : ''}`} 
                style={{ border: hasAccess('commands') ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_commands', 'commands')}
              >
                <div className="icon-bg" style={{ background: hasAccess('commands') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: '#10B981' }}>
                  <Settings size={36} />
                </div>
                <h3 style={{ color: 'var(--text-main)' }}>Comandos del Chat</h3>
                <p>Crea comandos personalizados y plantillas divertidas (ej: pelea) para tu chat de Twitch.</p>
              </div>
            </div>
          </div>
        ) : view === 'create_content_item' ? (
          <div className="builder-view">
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                {editingItemId ? `Editar ${tipoItem === 'evento' ? 'Evento' : 'Sorteo'}` : `Generador de ${tipoItem === 'evento' ? 'Evento' : 'Sorteo'}`}
              </h1>
            </div>

            <form onSubmit={handleItemSubmit}>
              <div className="card animate-slide-down" style={{ animationDelay: '0.1s' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Publicación</label>
                  <select 
                    className="form-control" 
                    value={tipoItem} 
                    onChange={(e) => setTipoItem(e.target.value)}
                  >
                    <option value="evento">Evento</option>
                    <option value="sorteo">Sorteo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Título del {tipoItem}</label>
                  <input type="text" name="titulo" className="form-control" value={itemData.titulo} onChange={handleItemChange} required />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0 20px 0' }}>
                  <input 
                    type="checkbox" 
                    id="requiere_participacion" 
                    name="requiere_participacion" 
                    checked={itemData.requiere_participacion} 
                    onChange={(e) => setItemData(prev => ({ ...prev, requiere_participacion: e.target.checked }))} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="requiere_participacion" className="form-label" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>
                    Permitir participación (Mostrar botón de inscripción)
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción Breve</label>
                  <AutoResizeTextarea name="descripcion" className="form-control" value={itemData.descripcion} onChange={handleItemChange} rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Detalles de Participación (Opcional)</label>
                  <AutoResizeTextarea name="detalles" className="form-control" value={itemData.detalles} onChange={handleItemChange} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha Estimada (Texto)</label>
                  <input type="text" name="fecha" className="form-control" placeholder="Ej: Este Sábado, 20:00 Horas" value={itemData.fecha} onChange={handleItemChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha y Hora de Finalización (Expiración Automática)</label>
                  <input 
                    type="datetime-local" 
                    name="fecha_fin" 
                    className="form-control" 
                    value={itemData.fecha_fin} 
                    onChange={handleItemChange} 
                  />
                  <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Al superar esta fecha y hora, el elemento se marcará automáticamente como terminado.
                  </small>
                </div>
                 <div className="form-group">
                  <label className="form-label">Imagen principal (Pega el enlace de R2)</label>
                  <input type="url" name="imagen" className="form-control" placeholder={`${CLOUDFLARE_R2_BASE_URL}/imagen.png`} value={itemData.imagen} onChange={handleItemChange} required />
                  <AdvancedImagePreview imageUrl={itemData.imagen} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado Inicial</label>
                  <select name="estado" className="form-control" value={itemData.estado} onChange={handleItemChange}>
                    <option value="activo">Activo</option>
                    <option value="proximo">Próximo</option>
                    <option value="terminado">Terminado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Premios Disponibles</label>
                  <AutoResizeTextarea name="premios" className="form-control" placeholder="Describe los premios" value={itemData.premios} onChange={handleItemChange} rows={2} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Normas y Requisitos (JSONB Array)</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nueva norma (Ej: Seguir cuenta de Twitter)..." 
                      value={newNorma} 
                      onChange={(e) => setNewNorma(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addNorma(); } }}
                    />
                    <button type="button" className="btn-submit" style={{ padding: '0 20px', width: 'auto' }} onClick={addNorma}>Añadir</button>
                  </div>
                  {itemData.normas.length > 0 && (
                    <ul style={{ background: 'var(--bg-card-hover)', padding: '15px 15px 15px 30px', borderRadius: '8px' }}>
                      {itemData.normas.map((norma, idx) => (
                        <li key={idx} style={{ marginBottom: '8px' }}>
                          {norma} 
                          <button type="button" onClick={() => removeNorma(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', marginLeft: '10px', cursor: 'pointer' }}><Trash2 size={14}/></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button type="submit" className="btn-submit animate-slide-down" style={{ animationDelay: '0.2s' }} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : editingItemId ? <><Save size={20} /> Guardar Cambios</> : <><Save size={20} /> Publicar {tipoItem}</>}
              </button>
            </form>
          </div>
        ) : view === 'view_participations' ? (
          <div className="builder-view">
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => { setView('home'); setSelectedEventId(null); }}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Registro de Participantes
              </h1>
            </div>

            <div className="card animate-slide-down" style={{ minHeight: '60vh' }}>
              {isLoadingParticipations ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <Users size={48} opacity={0.3} style={{ marginBottom: '10px' }} />
                  <br />
                  Cargando participaciones desde Supabase...
                </div>
              ) : !selectedEventId ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <LayoutTemplate size={48} opacity={0.3} style={{ marginBottom: '10px' }} />
                  <br />
                  Selecciona un evento o sorteo en la librería izquierda para ver sus participantes.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                      {selectedEvent?.tipo === 'sorteo' ? <Gift size={24} /> : <Calendar size={24} />}
                      {selectedEvent?.titulo}
                    </h2>
                    <span style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--text)', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                      {selectedParticipations.length} Registrado{selectedParticipations.length !== 1 && 's'}
                    </span>
                  </div>
                  
                  {selectedParticipations.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                      Nadie se ha inscrito aún en este {selectedEvent?.tipo}.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedParticipations.map(part => (
                        <div key={part.id} style={{ background: 'var(--bg-card-hover)', padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--primary)' }}>
                          <div>
                            <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Users size={16} color="var(--primary)" /> {part.nombre}
                            </strong>
                            <span style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
                              <strong>Detalles Provistos:</strong> {part.mensaje || 'Ninguno'}
                            </span>
                            <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                              Inscrito el {new Date(part.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          <button 
                            className="btn-delete-news"
                            style={{ position: 'relative', top: '0', right: '0', opacity: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                            title="Eliminar participante permanentemente"
                            onClick={() => handleDeleteParticipation(part.id, part.nombre)}
                          >
                            <Trash2 size={16} /> Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : view === 'view_twitch' ? (
          <div className="builder-view">
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => { setView('home'); setSelectedRewardName(null); setExpandedDates({}); }}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Recompensas de Twitch
              </h1>
            </div>

            <div className="card animate-slide-down" style={{ minHeight: '60vh' }}>
              {!selectedRewardName ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <LayoutTemplate size={48} opacity={0.3} style={{ marginBottom: '10px' }} />
                  <br />
                  Selecciona una categoría de canje a la izquierda para ver quiénes lo han reclamado.
                </div>
              ) : (() => {
                  const claimsForReward = twitchList.filter(t => t.reward_name === selectedRewardName);
                  
                  // Agrupar por día
                  const groupedByDay = claimsForReward.reduce((acc, claim) => {
                    const day = new Date(claim.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(claim);
                    return acc;
                  }, {});

                  const sortedDays = Object.keys(groupedByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>
                        <h2 style={{ color: '#A855F7', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                          <LayoutTemplate size={24} />
                          Canje: "{selectedRewardName}"
                        </h2>
                        <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                          {claimsForReward.length} Reclamos
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gap: '20px' }}>
                        {sortedDays.map(day => (
                          <div key={day} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'rgba(15, 23, 42, 0.3)' }}>
                            {/* Header del día */}
                            <div 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '12px 20px', 
                                background: 'var(--bg-card-hover)', 
                                cursor: 'pointer',
                                borderBottom: expandedDates[day] ? '1px solid var(--border-color)' : 'none'
                              }}
                              onClick={() => setExpandedDates(prev => ({ ...prev, [day]: !prev[day] }))}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {expandedDates[day] ? <ChevronUp size={18} color="#A855F7" /> : <ChevronDown size={18} color="#A855F7" />}
                                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{day}</span>
                                <span style={{ fontSize: '0.8rem', background: '#A855F7', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{groupedByDay[day].length}</span>
                              </div>
                              
                              <button 
                                className="btn-add" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const list = groupedByDay[day].map(c => c.username).join('\n');
                                  navigator.clipboard.writeText(list);
                                  setShowToast(true);
                                  setTimeout(() => setShowToast(false), 2000);
                                }}
                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <Copy size={14} /> Copiar Usuarios
                              </button>
                            </div>

                            {/* Lista de usuarios (si está expandido) */}
                            {expandedDates[day] && (
                              <div style={{ display: 'grid', gap: '8px', padding: '15px' }} className="animate-slide-down">
                                {groupedByDay[day].map(claim => (
                                  <div key={claim.id} style={{ background: 'var(--bg-card)', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #A855F7' }}>
                                    <div>
                                      <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Users size={14} color="#A855F7" /> {claim.username}
                                      </strong>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        A las {new Date(claim.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    
                                    <button 
                                      className="btn-delete-news"
                                      style={{ position: 'relative', top: '0', right: '0', opacity: 1, padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto', background: 'rgba(239,68,68,0.05)' }}
                                      onClick={() => showConfirm(`¿Eliminar reclamo de ${claim.username}?`, async () => {
                                        const { error } = await supabase.from('twitch_redemptions').delete().eq('id', claim.id);
                                        if(!error) fetchLibraryItems();
                                        closeConfirm();
                                      })}
                                    >
                                      <Trash2 size={14} /> Eliminar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  );
              })()}
            </div>
          </div>
        ) : view === 'view_most_streamed' ? (
          <div className="builder-view">
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Lo más Streameable
              </h1>
            </div>

            <div className="card animate-slide-down" style={{ minHeight: '60vh' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <Gamepad2 size={24} />
                  Top 6 Juegos más Jugados
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
                  Estos juegos se muestran en la sección principal de la web. Recomendado: Máximo 6 juegos.
                </p>
              </div>

              {isLoadingMostStreamed ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <LayoutTemplate size={48} opacity={0.3} style={{ marginBottom: '10px' }} />
                  <br />
                  Cargando juegos desde Supabase...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {mostStreamed.map((item, index) => (
                    <div key={item.id} className="card" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', position: 'relative', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', zIndex: 2 }}>
                        {index + 1}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Título del Juego</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={item.title} 
                          onChange={(e) => handleMostStreamedChange(item.id, 'title', e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">URL de la Imagen (R2)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={item.image_url} 
                            placeholder="Imagenes/Nombre.png"
                            onChange={(e) => handleMostStreamedChange(item.id, 'image_url', e.target.value)} 
                          />
                        </div>
                      </div>
                      {item.image_url && (
                        <div className="image-preview-wrapper" style={{ height: '120px', marginBottom: '15px', borderRadius: '8px', overflow: 'hidden' }}>
                          <img 
                            src={item.image_url.startsWith('http') ? getDisplayUrl(item.image_url) : `${CLOUDFLARE_R2_BASE_URL}/${item.image_url}`} 
                            alt={item.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.classList.add('error'); }} 
                          />
                        </div>
                      )}
                      <button 
                        className="btn-submit" 
                        style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                        onClick={() => saveMostStreamedItem(item)}
                        disabled={submittingId === item.id}
                      >
                        {submittingId === item.id ? 'Guardando...' : <><Save size={16} /> Guardar Cambios</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : view === 'view_scheduled_messages' ? (
          <div className="builder-view">
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Mensajes Programados (Twitch Bot)
              </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Left Column: Configuration & Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card animate-slide-down" style={{ animationDelay: '0.1s' }}>
                  <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                    <Settings size={20} />
                    Configuración del Bot
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Introduce los datos de tu cuenta bot de Twitch para poder interactuar en el chat.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Twitch OAuth Token</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="oauth:xxxx..."
                      value={botOauth}
                      onChange={(e) => setBotOauth(e.target.value)}
                    />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Consigue tu token en <a href="https://twitchtokengenerator.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>twitchtokengenerator.com</a>
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Usuario del Bot</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nombre de la cuenta bot"
                      value={botUsername}
                      onChange={(e) => setBotUsername(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Canal de Destino</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nombre del canal (ej: eviltokkii)"
                      value={botChannel}
                      onChange={(e) => setBotChannel(e.target.value)}
                    />
                  </div>



                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    {!isBotConnected ? (
                      <button 
                        className="btn-submit" 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#22C55E' }}
                        onClick={connectTwitchBot}
                      >
                        <Play size={18} /> Conectar Bot
                      </button>
                    ) : (
                      <button 
                        className="btn-submit" 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#EF4444' }}
                        onClick={disconnectTwitchBot}
                      >
                        <Square size={18} /> Desconectar Bot
                      </button>
                    )}
                  </div>
                </div>

                <div className="card animate-slide-down" style={{ animationDelay: '0.2s' }}>
                  <button 
                    className="btn-submit" 
                    style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', background: 'var(--primary)' }}
                    onClick={() => {
                      if (!isBotConnected) {
                        triggerToast("⚠️ Conéctate a Twitch primero.");
                      } else {
                        setShowInstantModal(true);
                      }
                    }}
                  >
                    <Send size={20} /> Enviar mensaje ahora
                  </button>
                </div>
              </div>

              {/* Right Column: Scheduled Messages & Logs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


                <div className="card animate-slide-down" style={{ animationDelay: '0.2s', height: '475px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                      Consola de Eventos
                    </h2>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                      onClick={() => setBotLogs([])}
                    >
                      Limpiar consola
                    </button>
                  </div>
                  
                  <div style={{ 
                    background: '#0F172A', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    fontFamily: 'monospace', 
                    fontSize: '0.85rem', 
                    color: '#38BDF8', 
                    height: '370px', 
                    overflowY: 'auto',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '4px' }}>
                      {botLogs.map((log, index) => (
                        <div key={index} style={{ whiteSpace: 'pre-wrap' }}>{log}</div>
                      ))}
                    </div>
                    {botLogs.length === 0 && (
                      <div style={{ color: '#64748B', fontStyle: 'italic' }}>Esperando eventos del bot de Twitch...</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : view === 'view_commands' ? (
          <div className="builder-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Creador de Comandos
              </h1>
            </div>

            <div className="card animate-slide-down" style={{ animationDelay: '0.15s', margin: 0 }}>
              <h2 style={{ color: 'var(--primary)', marginTop: 0, fontSize: '1.25rem' }}>
                Configurar Comando
              </h2>
              
              <div className="form-group">
                <label className="form-label">Nombre del Comando (Ej: !pelea o !abrazo)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Escribe el comando iniciando con !"
                  value={cmdFormName}
                  onChange={(e) => setCmdFormName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción del Comando</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Para qué sirve el comando..."
                  value={cmdFormDesc}
                  onChange={(e) => setCmdFormDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Plantilla Interactiva</label>
                <select 
                  className="form-control"
                  value={cmdFormType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCmdFormType(val);
                    // Autofill template responses
                    if (val === 'versus') {
                      setCmdFormResponses(["{user} reta a {target} a una dura pelea de espadas. ¡Tras chocar acero, {winner} vence heroicamente dejando a {loser} en el suelo!"]);
                    } else if (val === 'action') {
                      setCmdFormResponses(["{user} le da un fuerte y cálido abrazo a {target}! <3"]);
                    } else if (val === 'random') {
                      setCmdFormResponses(["Sí, definitivamente.", "No, no lo creo.", "Tal vez, pregunta de nuevo.", "Es muy probable!"]);
                    } else if (val === 'love') {
                      setCmdFormResponses(["¡El termómetro del amor dice que {user} y {target} son un {percentage}% compatibles! ❤️"]);
                    } else if (val === 'roulette') {
                      setCmdFormResponses(["🔫 {user} jala del gatillo... ¡CLIC! El tambor gira y el arma no se dispara. Te has salvado. 😌", "🔫 {user} jala del gatillo... ¡BANG! El arma se dispara y caes eliminado del combate. 💀"]);
                    } else if (val === 'level') {
                      setCmdFormResponses(["Escaneando a {target}... ¡Nivel de toxicidad detectado: {level}%! ☢️", "Escaneando a {target}... ¡Nivel de guapeza detectado: {level}%! 😎"]);
                    }
                  }}
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px' }}
                >
                  <option value="versus">⚔️ Versus (Pelea / Duelo con Ganador Aleatorio)</option>
                  <option value="action">❤️ Acción Simple (Abrazo / Saludo entre usuarios)</option>
                  <option value="random">🔮 Decisión Aleatoria (8ball / Respuestas aleatorias)</option>
                  <option value="love">💖 Medidor de Amor (Porcentaje de afinidad entre usuarios)</option>
                  <option value="roulette">🔫 Ruleta Rusa (Tensión y supervivencia con frases aleatorias)</option>
                  <option value="level">📊 Medidor de Nivel (Estadísticas locas 0-100%)</option>
                </select>
              </div>

              {/* Variables Helper Box */}
              <div style={{ 
                background: 'rgba(168, 85, 247, 0.05)', 
                border: '1px dashed rgba(168, 85, 247, 0.2)', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '15px', 
                fontSize: '0.8rem', 
                color: 'var(--text-muted)',
                lineHeight: '1.4'
              }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>Variables disponibles para la frase:</strong>
                {cmdFormType === 'versus' && (
                  <>
                    • <code style={{ color: '#E9D5FF' }}>{"{user}"}</code>: El streamer o usuario que envía el comando.<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{target}"}</code>: La persona que fue etiquetada tras el comando.<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{winner}"}</code>: Ganador del duelo elegido de forma aleatoria (50% de probabilidad).<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{loser}"}</code>: Perdedor del duelo (el que no salió elegido ganador).
                  </>
                )}
                {cmdFormType === 'action' && (
                  <>
                    • <code style={{ color: '#E9D5FF' }}>{"{user}"}</code>: El usuario que envía el comando.<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{target}"}</code>: La persona etiquetada que recibe la acción.
                  </>
                )}
                {cmdFormType === 'random' && (
                  <>
                    • <code style={{ color: '#E9D5FF' }}>{"{user}"}</code>: El usuario que consulta al bot.<br />
                    Escribe múltiples respuestas abajo y el bot elegirá una de ellas al azar para responder a la pregunta.
                  </>
                )}
                {cmdFormType === 'love' && (
                  <>
                    • <code style={{ color: '#E9D5FF' }}>{"{user}"}</code>: El usuario que envía el comando.<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{target}"}</code>: La pareja o persona elegida.<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{percentage}"}</code>: Porcentaje aleatorio entre 0% y 100%.
                  </>
                )}
                {cmdFormType === 'roulette' && (
                  <>
                    • <code style={{ color: '#E9D5FF' }}>{"{user}"}</code>: El valiente que arriesga su vida en el chat.<br />
                    Escribe los resultados (ej: uno de salvado y otro de eliminado) en la lista de frases posibles.
                  </>
                )}
                {cmdFormType === 'level' && (
                  <>
                    • <code style={{ color: '#E9D5FF' }}>{"{user}"}</code>: El usuario que realiza el escaneo.<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{target}"}</code>: El usuario analizado.<br />
                    • <code style={{ color: '#E9D5FF' }}>{"{level}"}</code>: Porcentaje del nivel medido (0-100%).
                  </>
                )}
              </div>

              {/* Responses list */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Frases / Respuestas posibles</span>
                  <button 
                    type="button" 
                    onClick={() => setCmdFormResponses([...cmdFormResponses, ''])}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    + Añadir Frase
                  </button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {cmdFormResponses.map((resp, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px' }}>
                      <textarea 
                        className="form-control" 
                        placeholder="Escribe la frase utilizando las variables..."
                        value={resp}
                        onChange={(e) => {
                          const newResps = [...cmdFormResponses];
                          newResps[i] = e.target.value;
                          setCmdFormResponses(newResps);
                        }}
                        rows={2}
                        style={{ flex: 1, resize: 'vertical', minHeight: '55px', fontSize: '0.85rem', padding: '8px' }}
                      />
                      {cmdFormResponses.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => setCmdFormResponses(cmdFormResponses.filter((_, idx) => idx !== i))}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-submit" 
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: 0 }}
                  onClick={() => {
                    setCmdFormName('');
                    setCmdFormDesc('');
                    setCmdFormType('versus');
                    setCmdFormResponses(['']);
                  }}
                >
                  Limpiar
                </button>
                <button 
                  type="button" 
                  className="btn-submit"
                  style={{ marginTop: 0 }}
                  onClick={async () => {
                    const success = await handleSaveChatCommand(cmdFormName, cmdFormType, cmdFormDesc, cmdFormResponses);
                    if (success) {
                      setCmdFormName('');
                      setCmdFormDesc('');
                      setCmdFormResponses(['']);
                    }
                  }}
                >
                  Guardar Comando
                </button>
              </div>

            </div>
          </div>
        ) : view === 'view_reports' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Bandeja de Reportes Web
              </h1>
            </div>

            <div className="card animate-slide-down" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['todos', 'bug', 'sugerencia', 'cambio'].map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`btn-add ${reportFilter === type ? 'active' : ''}`}
                      onClick={() => setReportFilter(type)}
                      style={{
                        padding: '6px 12px',
                        background: reportFilter === type ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                        border: reportFilter === type ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-main)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {type === 'todos' ? 'Todos' : type === 'bug' ? '🐛 Bugs' : type === 'sugerencia' ? '💡 Sugerencias' : '🔄 Cambios'}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar en descripción..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    style={{ width: '250px', margin: 0, padding: '6px 12px', fontSize: '0.9rem' }}
                  />
                  <button
                    onClick={fetchUserReports}
                    className="btn-submit"
                    style={{ width: 'auto', padding: '6px 16px', margin: 0 }}
                    disabled={loadingReports}
                  >
                    {loadingReports ? 'Cargando...' : 'Actualizar'}
                  </button>
                </div>
              </div>
            </div>

            {loadingReports ? (
              <div className="card text-center" style={{ padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Cargando reportes desde la base de datos...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                {userReports
                  .filter(r => reportFilter === 'todos' || r.report_type === reportFilter)
                  .filter(r => !reportSearch || r.description.toLowerCase().includes(reportSearch.toLowerCase()))
                  .map((report) => {
                    const isExpanded = !!expandedReports[report.id];
                    return (
                      <div 
                        key={report.id} 
                        className="card animate-slide-down" 
                        style={{ 
                          padding: '16px 20px', 
                          borderLeft: `5px solid ${
                            report.report_type === 'bug' ? '#EF4444' : 
                            report.report_type === 'sugerencia' ? '#10B981' : 
                            '#F59E0B'
                          }`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: isExpanded ? '12px' : '0px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => setExpandedReports(prev => ({ ...prev, [report.id]: !prev[report.id] }))}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              background: report.report_type === 'bug' ? 'rgba(239, 68, 68, 0.15)' : report.report_type === 'sugerencia' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: report.report_type === 'bug' ? '#EF4444' : report.report_type === 'sugerencia' ? '#10B981' : '#F59E0B',
                              border: `1px solid ${report.report_type === 'bug' ? 'rgba(239, 68, 68, 0.3)' : report.report_type === 'sugerencia' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                            }}>
                              {report.report_type === 'bug' ? '🐛 Bug' : report.report_type === 'sugerencia' ? '💡 Sugerencia' : '🔄 Cambio'}
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                              {report.username ? `@${report.username}` : (report.user_id ? `Usuario: ${report.user_id.substring(0, 8)}...` : 'Usuario Anónimo')}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              • {new Date(report.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn-delete-news"
                              onClick={() => handleDeleteReport(report.id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#EF4444',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Eliminar Reporte"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedReports(prev => ({ ...prev, [report.id]: !prev[report.id] }))}>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ 
                              fontSize: '0.95rem', 
                              color: 'var(--text-main)', 
                              background: 'rgba(15, 23, 42, 0.3)', 
                              padding: '12px 16px', 
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.03)',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.5'
                            }}>
                              {report.description}
                            </div>
                            
                            {report.images && Array.isArray(report.images) && report.images.length > 0 && (
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                                {report.images.map((imgUrl, index) => (
                                  <a 
                                    key={index} 
                                    href={imgUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      display: 'block', 
                                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                                      borderRadius: '6px', 
                                      overflow: 'hidden',
                                      transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt={`Reporte Adjunto ${index + 1}`} 
                                      style={{ 
                                        maxHeight: '150px', 
                                        maxWidth: '250px', 
                                        objectFit: 'cover', 
                                        display: 'block' 
                                      }} 
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                {userReports.filter(r => reportFilter === 'todos' || r.report_type === reportFilter).filter(r => !reportSearch || r.description.toLowerCase().includes(reportSearch.toLowerCase())).length === 0 && (
                  <div className="card text-center" style={{ padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No se encontraron reportes que coincidan con la búsqueda o filtro.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : view === 'view_minijuegos' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => { setView('home'); setMinigameSearch(''); setMinigamePage(1); setEditingMinigameItem(null); }}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Gestor de Minijuegos
              </h1>
            </div>

            <div className="card animate-slide-down" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'overwatch', label: '🛡️ Overwatch' },
                    { id: 'dbd', label: '💀 DBD Perks' },
                    { id: 'games', label: '🎮 Trivia Juegos' },
                    { id: 'flags', label: '🏳️ Banderas' },
                    { id: 'scramble', label: '🔤 Scramble' },
                    { id: 'music', label: '🎵 Música' },
                    { id: 'disney', label: '🏰 Disney' },
                    { id: 'covers', label: '🎮 Carátulas' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveMinigameTab(tab.id);
                        setMinigameSearch('');
                        setMinigamePage(1);
                        setEditingMinigameItem(null);
                      }}
                      className={`btn-add ${activeMinigameTab === tab.id ? 'active' : ''}`}
                      style={{
                        padding: '8px 16px',
                        background: activeMinigameTab === tab.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                        border: activeMinigameTab === tab.id ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por texto..."
                    value={minigameSearch}
                    onChange={(e) => {
                      setMinigameSearch(e.target.value);
                      setMinigamePage(1);
                    }}
                    style={{ width: '250px', margin: 0, padding: '6px 12px', fontSize: '0.9rem' }}
                  />
                  <button
                    onClick={() => resetMinigameToDefault(activeMinigameTab)}
                    className="btn-submit"
                    style={{ width: 'auto', padding: '6px 16px', margin: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    disabled={loadingMinigames || isSavingMinigame}
                  >
                    Restaurar Defectos
                  </button>
                  <button
                    onClick={fetchMinigamesFromSupabase}
                    className="btn-submit"
                    style={{ width: 'auto', padding: '6px 16px', margin: 0 }}
                    disabled={loadingMinigames || isSavingMinigame}
                  >
                    {loadingMinigames ? 'Cargando...' : 'Actualizar'}
                  </button>
                </div>
              </div>
            </div>

            {loadingMinigames ? (
              <div className="card text-center" style={{ padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Cargando datos del minijuego desde Supabase...</p>
              </div>
            ) : (() => {
              const items = minigamesData[activeMinigameTab] || [];
              
              const filtered = items.filter((item) => {
                if (!minigameSearch) return true;
                const searchLower = minigameSearch.toLowerCase();
                if (activeMinigameTab === 'overwatch' || activeMinigameTab === 'games') {
                  return (item.text || '').toLowerCase().includes(searchLower) ||
                         (item.options || []).some(opt => opt.toLowerCase().includes(searchLower));
                } else if (activeMinigameTab === 'dbd') {
                  return (item.name || '').toLowerCase().includes(searchLower) ||
                         (item.role || '').toLowerCase().includes(searchLower);
                } else if (activeMinigameTab === 'flags') {
                  return (item.options || []).some(opt => opt.toLowerCase().includes(searchLower)) ||
                         (item.flagCode || '').toLowerCase().includes(searchLower);
                } else if (activeMinigameTab === 'scramble') {
                  return (item.scrambleWord || '').toLowerCase().includes(searchLower) ||
                         (item.scrambleHint || '').toLowerCase().includes(searchLower);
                } else if (activeMinigameTab === 'music') {
                  return (item.options || []).some(opt => opt.toLowerCase().includes(searchLower)) ||
                         (item.youtubeId || '').toLowerCase().includes(searchLower);
                }
                return true;
              });

              const itemsPerPage = 15;
              const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
              const startIdx = (minigamePage - 1) * itemsPerPage;
              const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {paginated.map((item, localIdx) => {
                      const absoluteIdx = startIdx + localIdx;
                      const originalIdx = items.indexOf(item);
                      
                      if (activeMinigameTab === 'dbd') {
                        return (
                          <div 
                            key={originalIdx !== -1 ? originalIdx : absoluteIdx} 
                            className="card animate-slide-down" 
                            style={{ 
                              padding: '12px 16px', 
                              display: 'flex', 
                              gap: '15px',
                              alignItems: 'center',
                              borderLeft: '4px solid var(--primary)', 
                              margin: 0,
                              position: 'relative',
                              minHeight: '100px'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <img 
                                src={getDbdPerkImageUrl(item.image)} 
                                alt={item.name} 
                                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                                onError={(e) => handlePerkImageError(e, item.image)}
                              />
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold', marginTop: '4px' }}>
                                #{originalIdx + 1}
                              </span>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '20px' }}>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1.2' }}>
                                {item.name}
                              </h4>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                width: 'fit-content',
                                background: item.role === 'killer' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: item.role === 'killer' ? '#EF4444' : '#10B981',
                                textTransform: 'uppercase'
                              }}>
                                {item.role === 'killer' ? 'Asesino' : 'Superviviente'}
                              </span>
                            </div>

                            <div style={{ 
                              position: 'absolute',
                              right: '16px',
                              bottom: '12px',
                              display: 'flex',
                              gap: '8px'
                            }}>
                              <button
                                type="button"
                                className="btn-add"
                                style={{ 
                                  width: 'auto', 
                                  padding: '4px 12px', 
                                  fontSize: '0.8rem',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#EF4444',
                                  border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                                onClick={() => deleteMinigameItem(originalIdx)}
                              >
                                Eliminar
                              </button>
                              <button
                                type="button"
                                className="btn-add"
                                style={{ 
                                  width: 'auto', 
                                  padding: '4px 12px', 
                                  fontSize: '0.8rem'
                                }}
                                onClick={() => setEditingMinigameItem({ index: originalIdx, data: JSON.parse(JSON.stringify(item)) })}
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        );
                      }
                      
                      if (activeMinigameTab === 'covers') {
                        return (
                          <div 
                            key={originalIdx !== -1 ? originalIdx : absoluteIdx} 
                            className="card animate-slide-down" 
                            style={{ 
                              padding: '0', 
                              display: 'flex', 
                              flexDirection: 'row', 
                              borderLeft: '4px solid var(--primary)', 
                              margin: 0,
                              overflow: 'hidden',
                              background: 'rgba(255,255,255,0.01)',
                              minHeight: '220px'
                            }}
                          >
                            {/* Imagen de carátula a la izquierda */}
                            <div style={{ width: '150px', flexShrink: 0, background: '#000', position: 'relative' }}>
                              <img 
                                src={item.image} 
                                alt="Carátula" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public/Imagenes/default_perk.png'; }}
                              />
                            </div>

                            {/* Contenido a la derecha */}
                            <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                    #{originalIdx + 1}
                                  </span>
                                </div>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', lineHeight: '1.4', color: 'var(--text-main)' }}>
                                  {item.text}
                                </h4>

                                {item.options && item.options.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                                    {item.options.map((opt, oIdx) => {
                                      const isCorrect = oIdx === item.answerIndex;
                                      return (
                                        <div 
                                          key={oIdx} 
                                          style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: isCorrect ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                            border: isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                                            color: isCorrect ? '#4ADE80' : 'var(--text-muted)'
                                          }}
                                        >
                                          {isCorrect ? '✅ ' : '• '} {opt}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                <button
                                  type="button"
                                  className="btn-delete"
                                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => handleDeleteMinigameItem(originalIdx)}
                                >
                                  Eliminar
                                </button>
                                <button
                                  type="button"
                                  className="btn-add"
                                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => setEditingMinigameItem({ index: originalIdx, data: JSON.parse(JSON.stringify(item)) })}
                                >
                                  Editar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div 
                          key={originalIdx !== -1 ? originalIdx : absoluteIdx} 
                          className="card animate-slide-down" 
                          style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--primary)', margin: 0 }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                #{originalIdx + 1}
                              </span>
                              
                              {activeMinigameTab === 'dbd' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    background: item.role === 'killer' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    color: item.role === 'killer' ? '#EF4444' : '#10B981',
                                    textTransform: 'uppercase'
                                  }}>
                                    {item.role === 'killer' ? 'Asesino' : 'Superviviente'}
                                  </span>
                                  <img 
                                    src={getDbdPerkImageUrl(item.image)} 
                                    alt={item.name} 
                                    style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                                    onError={(e) => handlePerkImageError(e, item.image)}
                                  />
                                </div>
                              )}
                              {activeMinigameTab === 'covers' && (
                                <img 
                                  src={item.image} 
                                  alt="Carátula" 
                                  style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public/Imagenes/default_perk.png'; }}
                                />
                              )}
                              
                              {activeMinigameTab === 'flags' && (
                                <img 
                                  src={`https://flagcdn.com/h80/${item.flagCode}.png`} 
                                  alt={item.flagCode}
                                  style={{ height: '24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              )}

                              {activeMinigameTab === 'music' && (
                                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontFamily: 'monospace' }}>
                                  YT: {item.youtubeId}
                                </span>
                              )}
                            </div>

                            {(activeMinigameTab === 'overwatch' || activeMinigameTab === 'games' || activeMinigameTab === 'disney' || activeMinigameTab === 'covers') && (
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', lineHeight: '1.4', color: 'var(--text-main)' }}>
                                {item.text}
                              </h4>
                            )}

                            {activeMinigameTab === 'disney' && (
                              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                                <img 
                                  src={item.image} 
                                  alt="Imagen" 
                                  style={{ height: '80px', objectFit: 'contain', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '6px' }}
                                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public/Imagenes/default_character.png'; }}
                                />
                              </div>
                            )}

                            {activeMinigameTab === 'dbd' && (
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                {item.name}
                              </h4>
                            )}

                            {activeMinigameTab === 'flags' && (
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-muted)' }}>
                                Adivina el país para la bandera: <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{item.flagCode}</strong>
                              </h4>
                            )}

                            {activeMinigameTab === 'scramble' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary)' }}>
                                  {item.scrambleWord}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  💡 Pista: {item.scrambleHint}
                                </div>
                              </div>
                            )}

                            {activeMinigameTab === 'music' && (
                              <div style={{ marginBottom: '12px' }}>
                                <div style={{ 
                                  height: '80px', 
                                  background: '#000', 
                                  borderRadius: '6px', 
                                  overflow: 'hidden', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  marginBottom: '8px'
                                }}>
                                  <img 
                                    src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`} 
                                    alt="thumbnail" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                                  />
                                </div>
                              </div>
                            )}

                            {item.options && item.options.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
                                {item.options.map((opt, oIdx) => {
                                  const isCorrect = oIdx === item.answerIndex;
                                  return (
                                    <div 
                                      key={oIdx} 
                                      style={{
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        background: isCorrect ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                        border: isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                                        color: isCorrect ? '#4ADE80' : 'var(--text-muted)'
                                      }}
                                    >
                                      {isCorrect ? '✅ ' : '• '} {opt}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn-add"
                              style={{ 
                                width: 'auto', 
                                padding: '6px 16px', 
                                fontSize: '0.85rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                              }}
                              onClick={() => deleteMinigameItem(originalIdx)}
                            >
                              Eliminar
                            </button>
                            <button
                              type="button"
                              className="btn-add"
                              style={{ width: 'auto', padding: '6px 16px', fontSize: '0.85rem' }}
                              onClick={() => setEditingMinigameItem({ index: originalIdx, data: JSON.parse(JSON.stringify(item)) })}
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', marginBottom: '40px' }}>
                      <button
                        className="btn-add"
                        style={{ width: 'auto', padding: '6px 12px' }}
                        disabled={minigamePage === 1}
                        onClick={() => setMinigamePage(p => p - 1)}
                      >
                        Anterior
                      </button>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Página <strong>{minigamePage}</strong> de {totalPages}
                      </span>
                      <button
                        className="btn-add"
                        style={{ width: 'auto', padding: '6px 12px' }}
                        disabled={minigamePage === totalPages}
                        onClick={() => setMinigamePage(p => p + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : view === 'view_song_request' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Song Request Widget (Twitch)
              </h1>
            </div>

            {/* Top Row: 3 equal-height Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
              
              {/* Column 1: Player Card */}
              <div className="card animate-slide-down" style={{ animationDelay: '0.1s', display: 'flex', flexDirection: 'column', margin: 0, justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, fontSize: '1.25rem' }}>
                    <Play size={18} />
                    Reproductor Activo
                  </h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isPlayerEnabledInDashboard} 
                        onChange={(e) => setIsPlayerEnabledInDashboard(e.target.checked)}
                      />
                      Reproducir en este panel
                    </label>
                  </div>

                  {currentSong ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ 
                        height: isPlayerEnabledInDashboard ? '150px' : '50px', 
                        background: '#000', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                      }}>
                        {isPlayerEnabledInDashboard ? (
                          <YoutubePlayer videoId={currentSong.video_id} onEnded={playNextSong} volume={playerVolume} isPlaying={currentSong.is_playing !== false} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <Wifi size={14} color="#22C55E" />
                            {currentSong.is_playing !== false ? 'Reproduciendo en OBS' : 'Pausado en OBS'}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0 }}>
                        <div style={{ overflow: 'hidden', marginRight: '5px', minWidth: 0, flex: 1 }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentSong.title}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Por: <strong>@{currentSong.requested_by}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Playback Control Bar */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '5px' }}>
                        <button 
                          onClick={handleTogglePlayPause}
                          style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(168, 85, 247, 0.3)'
                          }}
                          title={currentSong.is_playing !== false ? "Pausar" : "Reproducir"}
                        >
                          {currentSong.is_playing !== false ? <Pause size={18} /> : <Play size={18} />}
                        </button>

                        <button 
                          onClick={handleSkipSong}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Siguiente Canción"
                        >
                          <SkipForward size={18} />
                        </button>
                      </div>

                      {/* Volume Slider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={playerVolume} 
                          onChange={(e) => setPlayerVolume(Number(e.target.value))} 
                          style={{ flex: 1, accentColor: 'var(--primary)', height: '4px' }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '25px', textAlign: 'right' }}>{playerVolume}%</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '20px 10px', 
                      textAlign: 'center', 
                      background: 'rgba(15, 23, 42, 0.3)', 
                      borderRadius: '8px', 
                      border: '1px dashed var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem'
                    }}>
                      Sin reproducción activa.
                      <button 
                        className="btn-add" 
                        onClick={playNextSong}
                        style={{ margin: '8px auto 0 auto', display: 'block', height: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                        disabled={songRequests.length === 0}
                      >
                        Iniciar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: OBS Setup Card */}
              <div className="card animate-slide-down" style={{ 
                animationDelay: '0.2s', 
                display: 'flex', 
                flexDirection: 'column', 
                margin: 0, 
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, fontSize: '1.25rem' }}>
                    <LayoutTemplate size={18} />
                    Integración OBS
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '8px' }}>
                    Para reproducir el audio en directo y mostrar el widget animado:
                  </p>
                  <ol style={{ color: 'var(--text-muted)', fontSize: '0.8rem', paddingLeft: '18px', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                    <li style={{ marginBottom: '4px' }}>Copia la URL: <code style={{ color: '#E9D5FF', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 4px', borderRadius: '4px', display: 'inline-block', fontSize: '0.7rem', wordBreak: 'break-all', marginTop: '1px' }}>{`${window.location.origin}/?overlay=true`}</code></li>
                    <li style={{ marginBottom: '4px' }}>En OBS, añade una fuente de <strong>Navegador</strong>.</li>
                    <li>Activa <strong>"Controlar audio mediante OBS"</strong>.</li>
                  </ol>
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '2px', display: 'block' }}>Comando personalizado chat</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ej: !sr o !pedir"
                      value={songRequestCommand}
                      onChange={(e) => setSongRequestCommand(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '6px' }}
                    />
                  </div>
                </div>
                <button 
                  className="btn-add"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/?overlay=true`);
                    triggerToast("📋 Enlace copiado al portapapeles");
                  }}
                  style={{ width: '100%', height: 'auto', padding: '8px', fontSize: '0.8rem', marginTop: '10px' }}
                >
                  <Copy size={14} /> Copiar URL del Widget
                </button>
                <button 
                  className="btn-submit"
                  onClick={handleReloadOBS}
                  style={{ width: '100%', height: 'auto', padding: '8px', fontSize: '0.8rem', marginTop: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', border: '1px solid rgba(168, 85, 247, 0.2)' }}
                >
                  Forzar Recarga de OBS
                </button>
              </div>

              {/* Column 3: Manual Add Card */}
              <div className="card animate-slide-down" style={{ animationDelay: '0.15s', display: 'flex', flexDirection: 'column', margin: 0, justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
                    <Plus size={18} />
                    Añadir Manualmente
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '10px' }}>
                    Introduce el nombre de la canción o pega el link de YouTube directamente:
                  </p>
                  <form onSubmit={handleManualAdd} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Canción o URL de YouTube..."
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    />
                    <button type="submit" className="btn-submit" style={{ width: '100%', marginTop: '5px', padding: '8px', fontSize: '0.85rem' }}>
                      Añadir a la Cola
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* Bottom Row: Song Queue (Full Width, Fixed Height) */}
            <div className="card animate-slide-down" style={{ 
              animationDelay: '0.25s', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '350px',
              margin: 0
            }}>
              <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, fontSize: '1.25rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <List size={18} />
                  Cola de Reproducción ({songRequests.length})
                </div>
                {songRequests.length > 0 && (
                  <button 
                    onClick={handleClearQueue}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      height: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Limpiar toda la cola"
                  >
                    <Trash2 size={14} /> Limpiar Cola
                  </button>
                )}
              </h2>
              
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                paddingRight: '5px',
                marginTop: '10px'
              }}>
                {allSongs.map((song, index) => {
                  const isPlaying = song.status === 'playing';
                  const isDone = song.status === 'played' || song.status === 'skipped';
                  
                  return (
                    <div key={song.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: isPlaying ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '6px',
                      border: isPlaying ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      minWidth: 0,
                      opacity: isDone ? 0.5 : 1
                    }}>
                      <div style={{ overflow: 'hidden', marginRight: '8px', minWidth: 0, flex: 1 }}>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}>
                          {index + 1}. {song.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Por: @{song.requested_by} • <span style={{ textTransform: 'uppercase', fontSize: '0.65rem', color: isPlaying ? '#A855F7' : '#94A3B8' }}>{song.status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                        {!isPlaying && (
                          <button 
                            onClick={() => handlePlaySpecificSong(song)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#22C55E',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Reproducir ahora"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteSongFromQueue(song.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Eliminar de la cola"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {songRequests.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '15px', fontSize: '0.8rem' }}>
                    No hay canciones pendientes en la cola. ¡Usa tu comando en el chat para pedir canciones!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="builder-view">
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                {editingItemId ? "Editar Noticia" : "Generador de Noticias"}
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Main Info Card */}
              <div className="card animate-slide-down" style={{ animationDelay: '0.1s' }}>
                <div className="form-group">
                  <label className="form-label">Título de la Noticia</label>
                  <input 
                    type="text" 
                    name="title"
                    className="form-control" 
                    placeholder="Ej: Anunciada nueva temporada de tu anime favorito..."
                    value={newsData.title}
                    onChange={handleMainChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtítulo (Opcional)</label>
                  <input 
                    type="text" 
                    name="subtitle"
                    className="form-control" 
                    placeholder="Añade un texto breve que complemente al título"
                    value={newsData.subtitle}
                    onChange={handleMainChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Imagen de Cabecera (URL)</label>
                  <input 
                    type="url" 
                    name="header_image_url"
                    className="form-control" 
                    placeholder={`${CLOUDFLARE_R2_BASE_URL}/portada-noticia.jpg`}
                    value={newsData.header_image_url}
                    onChange={handleMainChange}
                    required
                  />
                  {newsData.header_image_url && (
                    <div className="image-preview-wrapper" style={{ marginTop: '10px' }}>
                      <img src={getDisplayUrl(newsData.header_image_url)} alt="Cabecera" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.classList.add('error'); }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Content Builder */}
              <div className="card animate-slide-down" style={{ animationDelay: '0.2s' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                  <LayoutTemplate className="lucide" size={24} color="var(--primary)" />
                  Cuerpo de la Noticia
                </h2>
                
                <div className="blocks-container">
                  {newsData.content.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      No has añadido ningún bloque. Selecciona una opción abajo para empezar.
                    </div>
                  )}

                  {newsData.content.map((block, index) => (
                    <div key={block.id} className="block-item animate-slide-down">
                      <div className="block-header">
                        <span className="block-type-badge">
                          {block.type === 'text' ? <Type size={14} /> : <ImageIcon size={14} />}
                          {block.type === 'text' ? 'Bloque de Texto' : 'Bloque de Imagen'}
                        </span>
                        <button 
                          type="button" 
                          className="btn-icon" 
                          onClick={() => removeContentBlock(block.id)}
                          title="Eliminar bloque"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {block.type === 'text' ? (
                        <RichTextEditor
                          value={block.value}
                          onChange={(htmlValue) => updateContentBlock(block.id, htmlValue)}
                        />
                      ) : (
                        <div>
                          <input 
                            type="url" 
                            className="form-control" 
                            placeholder="Pega el enlace generado por el subidor superior"
                            value={block.value}
                            onChange={(e) => updateContentBlock(block.id, e.target.value)}
                            required
                          />
                          {block.value && (
                            <div className="image-preview-wrapper" style={{ minHeight: '80px', marginTop: '1rem' }}>
                              <img src={getDisplayUrl(block.value)} alt={`Bloque ${index}`} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.classList.add('error'); }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="add-actions">
                  <button 
                    type="button" 
                    className="btn-add" 
                    onClick={() => addContentBlock('text')}
                  >
                    <Type size={18} /> Añadir Texto
                  </button>
                  <button 
                    type="button" 
                    className="btn-add" 
                    onClick={() => addContentBlock('image')}
                  >
                    <ImageIcon size={18} /> Añadir Imagen
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit animate-slide-down" 
                style={{ animationDelay: '0.3s' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : editingItemId ? <><Save size={20} /> Guardar Cambios</> : <><Send size={20} /> Publicar</>}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// YouTube Iframe Player Wrapper Component
const YoutubePlayer = ({ videoId, onEnded, volume = 50, isPlaying = true }) => {
  const playerRef = useRef(null);
  const containerId = useRef(`yt-player-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let player;
    const initPlayer = () => {
      player = new window.YT.Player(containerId.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
            if (isPlaying) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === 0) { // YT.PlayerState.ENDED is 0
              onEnded();
            }
          }
        }
      });
      playerRef.current = player;
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      } else if (!isPlaying && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  return <div style={{ width: '100%', height: '100%' }} id={containerId.current}></div>;
};

// Sleek Stream overlay widget for OBS browser source
const SongRequestOverlay = ({ currentSong, volume, onEnded }) => {
  const isPlaying = currentSong ? (currentSong.is_playing !== false) : false;

  useEffect(() => {
    const channel = supabase
      .channel('obs_reload_channel')
      .on('broadcast', { event: 'reload_widget' }, () => {
        window.location.reload(true); // force reload bypassing cache
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {currentSong && (
        <div style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none' }}>
          <YoutubePlayer videoId={currentSong.video_id} onEnded={onEnded} volume={volume} isPlaying={isPlaying} />
        </div>
      )}
      
      {currentSong ? (
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.2)',
          maxWidth: '450px',
          animation: 'slideIn 0.5s ease-out'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #A855F7',
            animation: isPlaying ? 'spin 10s linear infinite' : 'none',
            flexShrink: 0,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={`https://img.youtube.com/vi/${currentSong.video_id}/mqdefault.jpg`} 
              alt="cover" 
              style={{ width: '140%', height: '140%', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.8rem', color: '#A855F7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isPlaying ? 'Sonando ahora' : 'Pausado'}
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</span>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Pedida por: <strong style={{ color: '#E9D5FF' }}>@{currentSong.requested_by}</strong></span>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px dashed rgba(148, 163, 184, 0.3)',
          borderRadius: '16px',
          padding: '16px 24px',
          fontSize: '0.9rem',
          color: '#94A3B8',
          animation: 'pulse 2s infinite'
        }}>
          Sin canciones en cola. ¡Usa tu comando en el chat!
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default App;
