import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Tv, Bot, Plus, Sparkles, Award, Image as ImageIcon, Type, Trash2, Send, LayoutTemplate, Newspaper, FilePlus, ChevronLeft, Bold, Italic, Underline, List, ListOrdered, RemoveFormatting, Calendar, Users, Gift, Cake, Key, Crown, ShieldCheck, Save, Lock, AlertCircle, LogOut, Copy, ChevronDown, ChevronUp, Gamepad2, MessageSquare, Play, Square, Settings, Wifi, WifiOff, Pause, SkipForward, Trophy, HelpCircle, Disc, Layers, Volume2, VolumeX, Mic, UserCheck, UserX } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Ruleta, { RuletaSidebar, RuletaWheel } from './components/Ruleta';
import TwitchGiveaway, { TwitchGiveawaySidebar, TwitchGiveawayMain } from './components/TwitchGiveaway';
import TierlistsManager from './components/TierlistsManager';
import SyncNewsManager from './components/SyncNewsManager';
import ScheduledMessagesManager from './components/ScheduledMessagesManager';
import SpotifySongRequestManager from './components/SpotifySongRequestManager';
import BirthdaysManager from './components/BirthdaysManager';
import BotCredentialsManager from './components/BotCredentialsManager';
import ChatCommandsManager from './components/ChatCommandsManager';
import PointsWheelManager, { PointsWheelOBSOverlay } from './components/PointsWheelManager';
import TTSVoiceManager, { TTSAudioOBSOverlay, DEFAULT_CHARACTERS, TTSSpeechEngine } from './components/TTSVoiceManager';
import UserPermissionsManager from './components/UserPermissionsManager';
import PendingAuthorizationsManager from './components/PendingAuthorizationsManager';

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
import { POKEMON_QUESTIONS } from './data/PokemonQuestions';
import { BRAND_QUESTIONS } from './data/BrandQuestions';
import { HISTORY_QUESTIONS } from './data/HistoryQuestions';

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
  const isPointsWheelOverlay = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('overlay') === 'points_wheel';
  if (isPointsWheelOverlay) {
    return <PointsWheelOBSOverlay supabase={supabase} />;
  }

  const isTTSAudioOverlay = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('overlay') === 'tts_audio';
  if (isTTSAudioOverlay) {
    return <TTSAudioOBSOverlay supabase={supabase} />;
  }
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('builder_session') === 'true');
  const [sessionEmail, setSessionEmail] = useState(localStorage.getItem('builder_email') || '');
  const [sessionUsername, setSessionUsername] = useState(localStorage.getItem('builder_username') || '');
    const [pendingUsersCount, setPendingUsersCount] = useState(0);

  // Monitor de solicitudes de usuarios pendientes
  useEffect(() => {
    if (!supabase) return;

    const fetchPendingCount = async () => {
      try {
        const { count, error } = await supabase
          .from('whitelist')
          .select('id', { count: 'exact', head: true })
          .eq('approved', false);

        if (!error && count !== null) {
          setPendingUsersCount(count);
        }
      } catch (err) {
        console.warn("Error fetching pending whitelist count:", err);
      }
    };

    fetchPendingCount();

    const channel = supabase
      .channel('whitelist_count_monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whitelist' }, () => {
        fetchPendingCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const isPamacheAdmin = (sessionEmail && sessionEmail.toLowerCase() === 'pamacheyt@gmail.com') ||
                         (sessionUsername && sessionUsername.toLowerCase() === 'pamache_') ||
                         sessionPermissions === '*' ||
                         (typeof sessionPermissions === 'object' && sessionPermissions?.email?.toLowerCase() === 'pamacheyt@gmail.com');

  const hasAccess = (requiredPermission) => {
    if (requiredPermission === 'user_permissions') return isPamacheAdmin;
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
        case 'ruleta':
          return !!sessionPermissions.access_ruleta;
        case 'twitch_giveaway':
          return !!sessionPermissions.access_twitch_giveaway;
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
        case 'bot_credentials':
          return sessionPermissions.access_bot_credentials !== undefined ? !!sessionPermissions.access_bot_credentials : (sessionPermissions.access_twitch || sessionPermissions.access_scheduled_messages || true);
        case 'birthdays':
          return sessionPermissions.access_birthdays !== undefined ? !!sessionPermissions.access_birthdays : (sessionPermissions.access_twitch || sessionPermissions.access_scheduled_messages || true);
        case 'tts_voices':
          return sessionPermissions.access_tts_voices !== undefined ? !!sessionPermissions.access_tts_voices : (sessionPermissions.access_twitch || true);
        case 'points_wheel':
          return sessionPermissions.access_points_wheel !== undefined ? !!sessionPermissions.access_points_wheel : (sessionPermissions.access_twitch || sessionPermissions.access_ruleta || true);
        case 'tierlists':
          return sessionPermissions.access_tierlists !== undefined ? !!sessionPermissions.access_tierlists : true;
        case 'admin':
          return !!(
            sessionPermissions.access_participations ||
            sessionPermissions.access_twitch ||
            sessionPermissions.access_most_streamed ||
            sessionPermissions.access_scheduled_messages ||
            sessionPermissions.access_song_request ||
            sessionPermissions.access_commands ||
            sessionPermissions.access_reports ||
            sessionPermissions.access_minigames ||
            sessionPermissions.access_tierlists
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
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [replyingText, setReplyingText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  
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
    covers: [],
    pokemon: [],
    brands: [],
    history: []
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
        covers: [...COVERS_QUESTIONS],
        pokemon: [...POKEMON_QUESTIONS],
        brands: [...BRAND_QUESTIONS],
        history: [...HISTORY_QUESTIONS]
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
        gameType === 'pokemon' ? [...POKEMON_QUESTIONS] :
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
  const [songRequestCommand, setSongRequestCommand] = useState(() => localStorage.getItem('song_request_command') || '!spotifybloqued');
  const [isSongRequestEnabled, setIsSongRequestEnabled] = useState(() => localStorage.getItem('song_request_enabled') === 'true');

  const songRequestCommandRef = useRef(songRequestCommand);
  const isSongRequestEnabledRef = useRef(isSongRequestEnabled);
  const twitchUserIdsCacheRef = useRef({});
  const twitchClientIdCacheRef = useRef(null);
  const ttsUserCooldownRef = useRef({});

  useEffect(() => {
    songRequestCommandRef.current = songRequestCommand;
    localStorage.setItem('song_request_command', songRequestCommand);
  }, [songRequestCommand]);

  useEffect(() => {
    isSongRequestEnabledRef.current = isSongRequestEnabled;
    localStorage.setItem('song_request_enabled', isSongRequestEnabled ? 'true' : 'false');
  }, [isSongRequestEnabled]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedCmd = localStorage.getItem('song_request_command') || '!spotifybloqued';
      const savedEnabled = localStorage.getItem('song_request_enabled') === 'true';
      setSongRequestCommand(savedCmd);
      setIsSongRequestEnabled(savedEnabled);
      songRequestCommandRef.current = savedCmd;
      isSongRequestEnabledRef.current = savedEnabled;
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sr-state-changed', handleStorageChange);
    window.addEventListener('sr-cmd-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sr-state-changed', handleStorageChange);
      window.removeEventListener('sr-cmd-changed', handleStorageChange);
    };
  }, []);

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
        if (selectedReportId === id) setSelectedReportId(null);
      }
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  const handleSaveReportResponse = async (reportId) => {
    if (!replyingText.trim()) {
      triggerToast("⚠️ Por favor escribe una respuesta.");
      return;
    }
    setSendingResponse(true);
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({ admin_response: replyingText.trim() })
        .eq('id', reportId);

      if (error) throw error;

      triggerToast("💌 Respuesta enviada con éxito al usuario.");
      setUserReports(prev => prev.map(r => r.id === reportId ? { ...r, admin_response: replyingText.trim() } : r));
    } catch (err) {
      console.error("Error sending report response:", err);
      triggerToast("⚠️ Error al guardar respuesta: " + err.message);
    } finally {
      setSendingResponse(false);
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

  // Helper para obtener token válido de Spotify con auto-refresh forzado
  const getValidSpotifyAccessToken = async (forceRefresh = false) => {
    let token = localStorage.getItem('spotify_access_token');
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    const clientId = localStorage.getItem('spotify_custom_client_id') || '467b4e8480964c26913cb87d276ed20c';

    if (!token && !refreshToken) return null;

    if (!forceRefresh && token) {
      try {
        const check = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (check.ok) return token;
      } catch (e) {}
    }

    // Renovar con refresh_token
    if (refreshToken) {
      try {
        const body = new URLSearchParams({
          client_id: clientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        });

        const res = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });

        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            localStorage.setItem('spotify_access_token', data.access_token);
            if (data.refresh_token) {
              localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }
            return data.access_token;
          }
        }
      } catch (e) {
        console.error("Error refreshing Spotify token:", e);
      }
    }

    return token;
  };

  const handleSongRequest = async (query, requester) => {
    const isSREnabled = localStorage.getItem('song_request_enabled') !== 'false';
    if (!isSREnabled) {
      addBotLog(`[Song Request] Petición de @${requester} ignorada porque las peticiones están pausadas.`);
      return;
    }

    try {
      // Limpiar query eliminando palabras accidentales como "free " o "spotify "
      let queryClean = query.trim();
      if (queryClean.toLowerCase().startsWith('free ')) {
        queryClean = queryClean.slice(5).trim();
      }
      if (queryClean.toLowerCase().startsWith('spotify ')) {
        queryClean = queryClean.slice(8).trim();
      }

      addBotLog(`[Spotify Free SR] Buscando canción para @${requester}: "${queryClean}"`);
      
      let spotifyToken = await getValidSpotifyAccessToken();
      if (!spotifyToken) {
        addBotLog(`[Spotify SR] ⚠️ No hay cuenta de Spotify conectada en el Builder.`);
        enviarMensajeTwitch(`@${requester} ⚠️ Spotify no está conectado actualmente en el stream.`, true);
        return;
      }

      const playlistId = localStorage.getItem('spotify_sr_playlist_id');
      if (!playlistId) {
        addBotLog(`[Spotify SR] ⚠️ No hay Playlist de Spotify configurada en el Builder.`);
        enviarMensajeTwitch(`@${requester} ⚠️ El streamer aún no ha configurado la Playlist de Spotify en el Builder.`, true);
        return;
      }

      let track = null;
      let lastSearchError = null;

      // 1. Buscar por URL directa
      if (queryClean.includes('spotify.com/track/')) {
        const trackId = queryClean.split('track/')[1]?.split('?')[0]?.split('/')[0];
        let res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        if (res.status === 401) {
          spotifyToken = await getValidSpotifyAccessToken(true);
          if (spotifyToken) {
            res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
              headers: { Authorization: `Bearer ${spotifyToken}` }
            });
          }
        }
        if (res.ok) {
          track = await res.json();
        } else {
          lastSearchError = `HTTP ${res.status}`;
        }
      } else {
        // 2. Buscar por texto en Spotify API
        const searchTerms = [queryClean];
        // Si tiene varias palabras, agregar fallback con las primeras 2 palabras
        const words = queryClean.split(/\s+/);
        if (words.length > 2) {
          searchTerms.push(words.slice(0, 2).join(' '));
        }

        for (const term of searchTerms) {
          if (track) break;

          let searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=track&limit=5`;
          let res = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${spotifyToken}` }
          });

          if (res.status === 401) {
            spotifyToken = await getValidSpotifyAccessToken(true);
            if (spotifyToken) {
              res = await fetch(searchUrl, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
              });
            }
          }

          if (res.ok) {
            const data = await res.json();
            if (data.tracks?.items && data.tracks.items.length > 0) {
              track = data.tracks.items[0];
            }
          } else {
            lastSearchError = `HTTP ${res.status}`;
            const errBody = await res.json().catch(() => ({}));
            addBotLog(`[Spotify Search Error] ${res.status}: ${JSON.stringify(errBody)}`);
          }
        }
      }

      if (!track) {
        if (lastSearchError && (lastSearchError.includes('401') || lastSearchError.includes('403'))) {
          addBotLog(`[Spotify SR] Error de autenticación en Spotify (${lastSearchError}).`);
          enviarMensajeTwitch(`@${requester} ⚠️ La sesión de Spotify necesita ser reconectada en el Builder (Error ${lastSearchError}).`, true);
        } else {
          addBotLog(`[Spotify SR] No se encontró pista para: "${queryClean}"`);
          enviarMensajeTwitch(`@${requester} ⚠️ No se encontró la canción "${queryClean}" en Spotify. Intenta con el nombre y artista.`, true);
        }
        return;
      }

      // Añadir a la Playlist de Spotify Free
      let addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [track.uri] })
      });

      if (addRes.status === 401) {
        spotifyToken = await getValidSpotifyAccessToken(true);
        addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${spotifyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris: [track.uri] })
        });
      }

      if (!addRes.ok) {
        const errJson = await addRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Error al agregar canción a la playlist');
      }

      // Guardar en Supabase para el historial
      const artistsStr = track.artists ? track.artists.map(a => a.name).join(', ') : '';
      if (supabase) {
        await supabase.from('song_requests').insert([{
          title: `${track.name} - ${artistsStr}`,
          video_id: track.id,
          requested_by: requester,
          status: 'completed'
        }]);
      }

      addBotLog(`[Spotify SR] ✅ Agregada a la Playlist: "${track.name}" de ${artistsStr} por @${requester}`);
      
      const template = localStorage.getItem('spotify_sr_response_template') || '🎵 @{user} ¡Canción agregada a la Playlist del stream! "{song}" - {artist}';
      const finalMsg = template
        .replace(/{user}/gi, requester)
        .replace(/{requester}/gi, requester)
        .replace(/{song}/gi, track.name)
        .replace(/{title}/gi, track.name)
        .replace(/{artist}/gi, artistsStr);
        
      enviarMensajeTwitch(finalMsg, true);

    } catch (err) {
      addBotLog(`[Spotify SR Error] ${err.message}`);
      enviarMensajeTwitch(`@${requester} ⚠️ Error al agregar la canción a la Playlist de Spotify: ${err.message}`, true);
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
        enviarMensajeTwitch(`🎵 Reproduciendo ahora: "${data.title}" (pedida por @${data.requested_by})`, true);
      } else {
        enviarMensajeTwitch(`🎵 No hay ninguna canción reproduciéndose en este momento.`, true);
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
      enviarMensajeTwitch(`⏭️ Canción omitida: "${currentSong.title}"`, true);
      playNextSong();
    } catch (err) {
      console.error("Error skipping song:", err);
    }
  };

  const handleMoveSong = async (songId, direction) => {
    const pending = allSongs.filter(s => s.status === 'pending');
    const idx = pending.findIndex(s => s.id === songId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= pending.length) return;

    const current = pending[idx];
    const target = pending[targetIdx];

    try {
      const tempTime = current.created_at;
      
      const { error: err1 } = await supabase
        .from('song_requests')
        .update({ created_at: target.created_at })
        .eq('id', current.id);

      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from('song_requests')
        .update({ created_at: tempTime })
        .eq('id', target.id);

      if (err2) throw err2;

      fetchSongs();
      triggerToast("↕️ Cola de reproducción reordenada");
    } catch (err) {
      console.error("Error reordering song:", err);
      triggerToast("❌ Error al mover la canción");
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
      const spotifyToken = localStorage.getItem('spotify_access_token');
      if (!spotifyToken) {
        triggerToast("⚠️ Conecta tu cuenta de Spotify en la pestaña de Song Request primero");
        return;
      }
      let querySearch = manualQuery.trim();
      let track = null;
      if (querySearch.includes('spotify.com/track/')) {
        const trackId = querySearch.split('track/')[1]?.split('?')[0];
        const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        if (res.ok) track = await res.json();
      } else {
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(querySearch)}&type=track&limit=1`, {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          track = data.tracks?.items?.[0];
        }
      }

      if (!track) {
        triggerToast("⚠️ No se encontró esa canción en Spotify.");
        return;
      }

      await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(track.uri)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });

      const artistsStr = track.artists ? track.artists.map(a => a.name).join(', ') : '';
      await supabase.from('song_requests').insert([{ 
        title: `${track.name} - ${artistsStr}`, 
        video_id: track.id, 
        requested_by: sessionUsername || 'Streamer', 
        status: 'pending'
      }]);
        
      setManualQuery('');
      triggerToast(`🎵 "${track.name}" añadida a la cola de Spotify!`);
      fetchSongs();
    } catch (err) {
      triggerToast(`⚠️ Error: ${err.message}`);
    }
  };
  
  const [botOauth, setBotOauth] = useState(() => {
    const saved = localStorage.getItem('twitch_bot_oauth') || '';
    if (!saved || saved !== 'eqwqvqkwf6onasha2qzupnzxlardxd') {
      localStorage.setItem('twitch_bot_oauth', 'eqwqvqkwf6onasha2qzupnzxlardxd');
      return 'eqwqvqkwf6onasha2qzupnzxlardxd';
    }
    return saved;
  });
  const [botUsername, setBotUsername] = useState(() => {
    localStorage.setItem('twitch_bot_username', 'EmiliaMaria_exe');
    return 'EmiliaMaria_exe';
  });
  const [botChannel, setBotChannel] = useState(() => localStorage.getItem('twitch_bot_channel') || 'eviltokkii');
  const [isBotConnected, setIsBotConnected] = useState(false);
  const [botLogs, setBotLogs] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState(() => {
    const defaultMsgs = [
      { id: '1', text: "🌟 ¡Recuerda seguir el canal y activar las notificaciones para estar al día de todos los directos!", intervalMinutes: 10, minChatMessages: 10, active: true },
      { id: '2', text: "/announce 🌐 ¡Visita nuestra web oficial con minijuegos y sorteos diarios: https://tokkii.online!", intervalMinutes: 15, minChatMessages: 15, active: true }
    ];
    try {
      const savedV3 = localStorage.getItem('twitch_scheduled_messages_v3');
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const savedV2 = localStorage.getItem('twitch_scheduled_messages_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading scheduled messages:", e);
    }
    return defaultMsgs;
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
  const detectedBirthdayUsersRef = useRef(new Set());
  const scheduledTimestampsRef = useRef({});
  const scheduledChatCountsRef = useRef({});
  const lastBdaySentTimestampRef = useRef(0);
  const lastBdayChatCountRef = useRef(0);

  const addBotLog = (text) => {
    const time = new Date().toLocaleTimeString();
    setBotLogs(prev => [`[${time}] ${text}`, ...prev.slice(0, 99)]);
  };

  const isManuallyDisconnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);

  const handleTwitchTTSMessage = (user, fullText, rawIrcMessage = '') => {
    try {
      const isTTSEnabled = localStorage.getItem('tts_bot_enabled') !== 'false';
      if (!isTTSEnabled) return;

      const ttsCmd = (localStorage.getItem('tts_bot_command') || '!voz').toLowerCase().trim();
      const prefix = ttsCmd + ' ';
      let rest = fullText.slice(prefix.length).trim();
      if (!rest) return;

      // Verificar cooldown
      const cooldownSec = Number(localStorage.getItem('tts_cooldown')) || 10;
      const now = Date.now();
      const lastUsed = ttsUserCooldownRef.current[user.toLowerCase()] || 0;
      if (now - lastUsed < cooldownSec * 1000) {
        return; // En cooldown
      }
      ttsUserCooldownRef.current[user.toLowerCase()] = now;

      // Cargar la voz actualmente en uso seleccionada en el Builder
      const activeVoiceId = localStorage.getItem('tts_active_default_voice_v8') || localStorage.getItem('tts_active_default_voice_v7') || 'locutor_latino';
      let charactersList = DEFAULT_CHARACTERS;
      try {
        const saved = localStorage.getItem('tts_characters_custom_v8');
        if (saved) charactersList = JSON.parse(saved);
      } catch (e) {}

      let targetChar = charactersList.find(c => c.id === activeVoiceId) || charactersList[0] || DEFAULT_CHARACTERS[0];
      let messageText = rest;

      if (!messageText) return;

      // Límite de caracteres
      const charLimit = Number(localStorage.getItem('tts_char_limit')) || 120;
      if (messageText.length > charLimit) {
        messageText = messageText.slice(0, charLimit) + '...';
      }

      // Filtro de censura / palabras bloqueadas
      const blacklistStr = localStorage.getItem('tts_blacklist') || '';
      if (blacklistStr) {
        const bannedWords = blacklistStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
        bannedWords.forEach(banned => {
          const reg = new RegExp(banned, 'gi');
          messageText = messageText.replace(reg, '***');
        });
      }

      // Reproducir en navegador
      const vol = Number(localStorage.getItem('tts_volume')) || 0.85;
      TTSSpeechEngine.speakText(messageText, targetChar, vol);

      // Emitir a OBS Overlay vía Supabase Realtime
      if (supabase) {
        const channel = supabase.channel('tts_realtime_channel');
        channel.send({
          type: 'broadcast',
          event: 'TTS_PLAY_EVENT',
          payload: {
            user,
            text: messageText,
            characterId: targetChar.id,
            volume: vol
          }
        });
      }

      // Guardar en historial
      try {
        const historySaved = JSON.parse(localStorage.getItem('tts_history_log') || '[]');
        const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const newEntry = {
          user,
          text: messageText,
          characterId: targetChar.id,
          characterName: targetChar.name,
          avatar: targetChar.avatar,
          time: timeStr
        };
        const updatedHistory = [newEntry, ...historySaved].slice(0, 50);
        localStorage.setItem('tts_history_log', JSON.stringify(updatedHistory));
      } catch (e) {}

      addBotLog(`[TTS Voz] 🎙️ @${user} usó la voz de ${targetChar.name}: "${messageText}"`);
    } catch (err) {
      console.error("Error processing TTS message:", err);
    }
  };

  const connectTwitchBot = () => {
    if (!botOauth || !botUsername || !botChannel) {
      return;
    }
    
    isManuallyDisconnectedRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e) {}
    }
    
    addBotLog("Conectando a Twitch IRC (Modo Permanente)...");
    
    try {
      // Registrar timestamps actuales para que los temporizadores esperen su ciclo completo
      const connectNow = Date.now();
      scheduledMessages.forEach(msg => {
        scheduledTimestampsRef.current[msg.id] = connectNow;
        scheduledChatCountsRef.current[msg.id] = userMessagesCountRef.current;
      });
      lastBdaySentTimestampRef.current = connectNow;
      lastBdayChatCountRef.current = userMessagesCountRef.current;

      const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
      wsRef.current = ws;

      ws.onopen = () => {
        addBotLog("¡Conectado al WebSocket de Twitch!");
        
        const formattedOauth = botOauth.startsWith('oauth:') ? botOauth : 'oauth:' + botOauth;
        ws.send(`PASS ${formattedOauth}`);
        ws.send(`NICK ${(botUsername || 'EmiliaMaria_exe').toLowerCase().trim()}`);
        ws.send(`JOIN #${botChannel.toLowerCase().trim()}`);
        setIsBotConnected(true);
        addBotLog(`Autenticación enviada para @${botUsername} en el canal #${botChannel}`);

        // Keep-alive heartbeat every 4 minutes
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send("PING :tmi.twitch.tv");
          }
        }, 240000);
      };

      ws.onmessage = (event) => {
        const rawMessage = event.data;
        
        if (rawMessage.startsWith("PING")) {
          ws.send("PONG :tmi.twitch.tv");
          return;
        }

        if (rawMessage.includes("001") || rawMessage.includes("366")) {
          setIsBotConnected(true);
          addBotLog(`✅ Bot @${botUsername} sincronizado y listo en #${botChannel}`);
        }

        if (rawMessage.includes("Login authentication failed")) {
          setIsBotConnected(false);
          addBotLog("❌ Twitch: Falló la autenticación. Por favor actualiza el Token OAuth.");
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

            // Birthday Viewer Chat Presence Detector
            try {
              const userLower = user.toLowerCase().trim();
              const savedBdays = localStorage.getItem('twitch_viewers_birthdays');
              if (savedBdays) {
                const parsedBdays = JSON.parse(savedBdays);
                const now = new Date();
                const curDay = now.getDate();
                const curMonth = now.getMonth() + 1;

                const matchedBday = parsedBdays.find(b => 
                  Number(b.day) === curDay && 
                  Number(b.month) === curMonth && 
                  b.active !== false && 
                  b.username.toLowerCase().trim() === userLower
                );

                if (matchedBday && !detectedBirthdayUsersRef.current.has(userLower)) {
                  detectedBirthdayUsersRef.current.add(userLower);
                  const defMsg = '¡Feliz cumpleaños @{user}! 🎉🎂 Toda la comunidad de EvilTokkii te desea un día increíble y lleno de bendiciones 🥳💜';
                  const template = matchedBday.message || defMsg;
                  const formattedMessage = template
                    .replace(/@{user}/gi, `@${user}`)
                    .replace(/{user}/gi, `@${user}`)
                    .replace(/@{usuario}/gi, `@${user}`)
                    .replace(/{usuario}/gi, `@${user}`);
                  
                  addBotLog(`[Cumpleaños] 🎂 ¡@${user} (cumpleañero de hoy) acaba de escribir en el chat! Enviando felicitaciones...`);
                  enviarMensajeTwitch(formattedMessage, true);
                }
              }
            } catch (bdayErr) {
              console.warn("Error detecting birthday chatter:", bdayErr);
            }



            // TTS Voice Command Parser
            const isTTSEnabled = localStorage.getItem('tts_bot_enabled') !== 'false';
            const ttsCmd = (localStorage.getItem('tts_bot_command') || '!voz').toLowerCase().trim();
            const textLower = text.toLowerCase().trim();

            if (isTTSEnabled && (textLower.startsWith(ttsCmd + ' ') || textLower === ttsCmd)) {
              handleTwitchTTSMessage(user, text, rawMessage);
            }

            // Song Request Command Parsers (Control Reactivo y Multi-Comando)
            const isSREnabled = localStorage.getItem('song_request_enabled') !== 'false';
            const currentSRCmd = (localStorage.getItem('song_request_command') || '!sr').toLowerCase().trim();

            // Lista de comandos válidos (el personalizado + alias comunes como !sr y !srfree)
            const validSRCommands = Array.from(new Set([currentSRCmd, '!sr', '!srfree', '!pedir', '!cancion'])).filter(Boolean);
            const matchedSRCmd = validSRCommands.find(cmd => textLower.startsWith(cmd + ' ') || textLower === cmd);

            if (isSREnabled && matchedSRCmd) {
              const query = text.trim().slice(matchedSRCmd.length).trim();
              if (query) {
                handleSongRequest(query, user);
              } else {
                enviarMensajeTwitch(`@${user} 🎵 Uso del comando: ${matchedSRCmd} [nombre de la canción o artista]`, true);
              }
            } else if (currentSRState && (textLower === "!song" || textLower === "!currentsong")) {
              handleGetActiveSong();
            } else if (currentSRState && textLower === "!skip") {
              if (user.toLowerCase() === botChannel.toLowerCase() || user.toLowerCase() === botUsername.toLowerCase()) {
                handleSkipSong();
              }
            } else {
              // Custom Commands checking
              const tokens = text.trim().split(/\s+/);
              const cmdWord = tokens[0].toLowerCase();
              const matchedCmd = chatCommands.find(c => c.command_name.toLowerCase() === cmdWord);
              let isCmdDisabled = false;
              try {
                const disabledList = JSON.parse(localStorage.getItem('twitch_commands_disabled') || '[]');
                if (disabledList.includes(cmdWord) || (matchedCmd && disabledList.includes(matchedCmd.command_name.toLowerCase()))) {
                  isCmdDisabled = true;
                }
              } catch (e) {}

              if (matchedCmd && !isCmdDisabled && matchedCmd.active !== false && matchedCmd.responses && matchedCmd.responses.length > 0) {
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
        } else if (rawMessage.includes("NOTICE") || rawMessage.includes("421") || rawMessage.includes("login failed") || rawMessage.includes("Login unsuccessful")) {
          addBotLog(`⚠️ Twitch Aviso: ${rawMessage.trim()}`);
          if (rawMessage.includes("Login authentication failed") || rawMessage.includes("Login unsuccessful")) {
            addBotLog("❌ Error de Autenticación en Twitch: El Token OAuth no es válido o ha expirado. Por favor genera uno nuevo en https://twitchapps.com/tmi/");
          }
        }
      };

      ws.onclose = () => {
        setIsBotConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        
        if (!isManuallyDisconnectedRef.current) {
          addBotLog("Conexión con Twitch IRC cerrada. Reintentando en 5 segundos automáticamente...");
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectTwitchBot();
          }, 5000);
        } else {
          addBotLog("Conexión con Twitch IRC cerrada.");
        }
      };

      ws.onerror = (error) => {
        addBotLog("Aviso de WebSocket Twitch IRC.");
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
    isManuallyDisconnectedRef.current = true;
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    clearAllIntervals();
    setIsBotConnected(false);
    addBotLog("Bot desconectado manualmente.");
  };

// Caches para IDs y Client ID movidos al inicio

  const getTwitchClientId = async (token) => {
    if (twitchClientIdCacheRef.current) return twitchClientIdCacheRef.current;
    try {
      const res = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: { 'Authorization': `OAuth ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.client_id) {
          twitchClientIdCacheRef.current = data.client_id;
          return data.client_id;
        }
      }
    } catch (e) {
      console.warn("Could not validate token client ID:", e);
    }
    return 'q6batx0epp6085zfzqqb5sf3htzkbt'; // Fallback a TMI client ID oficial
  };

  const getTwitchUserId = async (username, token) => {
    const cleanUser = (username || '').toLowerCase().replace(/^#/, '').trim();
    if (!cleanUser) return null;
    if (twitchUserIdsCacheRef.current[cleanUser]) return twitchUserIdsCacheRef.current[cleanUser];

    try {
      const clientId = await getTwitchClientId(token);
      const res = await fetch(`https://api.twitch.tv/helix/users?login=${cleanUser}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': clientId
        }
      });
      if (res.ok) {
        const data = await res.json();
        const id = data.data?.[0]?.id;
        if (id) {
          twitchUserIdsCacheRef.current[cleanUser] = id;
          return id;
        }
      }
    } catch (e) {
      console.warn("Could not fetch user ID for", cleanUser, e);
    }
    return null;
  };

  // Twitch Helix Official Announcement Sender Dinámico
  const sendTwitchAnnouncement = async (messageText, color = 'primary') => {
    const rawToken = (botOauthRef.current || localStorage.getItem('twitch_bot_oauth') || '').replace(/^oauth:/i, '').trim();
    if (!rawToken) return false;

    const currentChannel = (botChannelRef.current || localStorage.getItem('twitch_bot_channel') || 'eviltokkii').toLowerCase().replace(/^#/, '').trim();
    const currentBot = (botUsernameRef.current || localStorage.getItem('twitch_bot_username') || 'EmiliaMaria_exe').toLowerCase().trim();

    try {
      const clientId = await getTwitchClientId(rawToken);
      const broadcasterId = await getTwitchUserId(currentChannel, rawToken);
      const moderatorId = await getTwitchUserId(currentBot, rawToken);

      if (broadcasterId && moderatorId) {
        const res = await fetch(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rawToken}`,
            'Client-Id': clientId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageText.substring(0, 500),
            color: color
          })
        });

        if (res.status === 204 || res.ok) {
          addBotLog(`📢 [Anuncio Destacado en #${currentChannel}]: "${messageText}"`);
          return true;
        }
      }
    } catch (err) {
      console.warn("Helix Announcement error, using IRC command fallback:", err);
    }
    return false;
  };

  const enviarMensajeTwitch = async (texto, silent = false) => {
    let formattedText = (texto || '').trim();
    const channelTarget = (botChannelRef.current || localStorage.getItem('twitch_bot_channel') || 'eviltokkii').toLowerCase().replace(/^#/, '').trim();

    // Detección de Anuncios (/announce)
    const isAnnounce = /^[/\\.](announce|announcement)\s+/i.test(formattedText);
    if (isAnnounce) {
      const content = formattedText.replace(/^[/\\.](announce|announcement)\s+/i, '').trim();
      
      // 1. Intentar enviar Anuncio Oficial con Banner por API Helix
      try {
        const sentViaHelix = await sendTwitchAnnouncement(content, 'primary');
        if (sentViaHelix) {
          if (!silent) triggerToast("📢 ¡Anuncio destacado enviado al chat!");
          return true;
        }
      } catch (e) {
        console.warn("Helix announce skipped:", e);
      }

      // 2. Si el token no tiene scope de anuncios de Helix, enviar el mensaje al chat como mensaje del bot para que NUNCA se pierda
      formattedText = content;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(`PRIVMSG #${channelTarget} :${formattedText}`);
      addBotLog(`✅ Mensaje enviado a #${channelTarget}: ${formattedText}`);
      if (!silent) {
        triggerToast("💬 Mensaje enviado al chat con éxito");
      }
      return true;
    } else {
      addBotLog("❌ Error: El WebSocket no está abierto. Pulsa 'Activar y Conectar Bot'.");
      if (!silent) {
        triggerToast("⚠️ Conéctate a Twitch primero.");
      }
      return false;
    }
  };

  // Reloj Maestro Global Persistente con Timestamps Reales (Inmune a re-renders)
  useEffect(() => {
    if (intervalsRef.current) {
      intervalsRef.current.forEach(t => clearInterval(t));
      intervalsRef.current = [];
    }

    if (!isBotConnected) return;

    const masterTimer = setInterval(() => {
      if (!isBotConnected) return;
      const now = Date.now();

      // ⏱️ MENSAJES PROGRAMADOS PERIÓDICOS (Misma lógica exacta y garantizada que Cumpleaños)
      scheduledMessages.forEach(msg => {
        if (!msg.active || !msg.text) return;

        const rawMins = msg.intervalMinutes || msg.interval_minutes || (msg.intervalMs ? msg.intervalMs / 60000 : 10);
        const intervalMinutes = Math.max(1, parseInt(rawMins, 10) || 10);
        const intervalMs = intervalMinutes * 60 * 1000;
        const minChat = Number(msg.minChatMessages) || 0;

        const lastSent = scheduledTimestampsRef.current[msg.id] || Number(localStorage.getItem('twitch_last_scheduled_sent_' + msg.id)) || 0;
        const timeElapsed = now - lastSent;

        if (timeElapsed >= intervalMs) {
          const curChats = userMessagesCountRef.current;
          const lastChats = scheduledChatCountsRef.current[msg.id] || 0;
          const diffChats = curChats - lastChats;

          if (minChat <= 0 || diffChats >= minChat) {
            addBotLog(`⏱️ [Mensaje Programado - cada ${intervalMinutes}m]: "${msg.text.substring(0, 30)}..."`);
            enviarMensajeTwitch(msg.text, true);
            scheduledTimestampsRef.current[msg.id] = now;
            scheduledChatCountsRef.current[msg.id] = curChats;
            localStorage.setItem('twitch_last_scheduled_sent_' + msg.id, String(now));
          } else {
            addBotLog(`⏳ [Mensaje Programado en Espera de Chat] "${msg.text.substring(0, 20)}..." (${diffChats}/${minChat} msgs requeridos)`);
          }
        }
      });
      // 🎂 AUTOMATIZACIÓN DE CUMPLEAÑOS EN STREAM (100% Garantizada y Precisa)
      const isBdayAuto = localStorage.getItem('twitch_birthdays_auto_enabled') !== 'false';
      if (isBdayAuto) {
        const rawMins = localStorage.getItem('twitch_birthdays_interval');
        const bdayIntervalMins = Math.max(1, Number(rawMins) || 20);
        const bdayIntervalMs = bdayIntervalMins * 60 * 1000;
        const bdayMinChat = Number(localStorage.getItem('twitch_birthdays_min_chat')) || 0;
        
        const savedBdaysStr = localStorage.getItem('twitch_viewers_birthdays');
        if (savedBdaysStr) {
          try {
            const allBdays = JSON.parse(savedBdaysStr);
            const today = new Date();
            const cDay = today.getDate();
            const cMonth = today.getMonth() + 1;
            const activeTodays = allBdays.filter(b => Number(b.day) === cDay && Number(b.month) === cMonth && b.active !== false);

            if (activeTodays.length > 0) {
              const lastBdaySent = lastBdaySentTimestampRef.current || Number(localStorage.getItem('twitch_last_bday_sent')) || 0;
              const bdayElapsed = now - lastBdaySent;

              if (bdayElapsed >= bdayIntervalMs) {
                const curChats = userMessagesCountRef.current;
                const lastChats = lastBdayChatCountRef.current || 0;
                const diffChats = curChats - lastChats;

                if (bdayMinChat <= 0 || diffChats >= bdayMinChat) {
                  activeTodays.forEach((item, idx) => {
                    setTimeout(() => {
                      const defMsg = '¡Feliz cumpleaños @{user}! 🎉🎂 Toda la comunidad de EvilTokkii te desea un día increíble y lleno de bendiciones 🥳💜';
                      const template = item.message || defMsg;
                      const formatted = template
                        .replace(/@{user}/gi, '@' + item.username)
                        .replace(/{user}/gi, '@' + item.username)
                        .replace(/@{usuario}/gi, '@' + item.username)
                        .replace(/{usuario}/gi, '@' + item.username);
                      addBotLog(`🎂 [Cumpleaños Automático - cada ${bdayIntervalMins}m]: Felicitando a @${item.username}`);
                      enviarMensajeTwitch(formatted, true);
                    }, idx * 7000);
                  });

                  lastBdaySentTimestampRef.current = now;
                  lastBdayChatCountRef.current = curChats;
                  localStorage.setItem('twitch_last_bday_sent', String(now));
                } else {
                  addBotLog(`⏳ [Cumpleaños en Espera de Chat] (${diffChats}/${bdayMinChat} msgs requeridos)`);
                }
              }
            }
          } catch (e) {
            console.warn("Error running auto birthday timer:", e);
          }
        }
      }
    }, 5000); // Revisa cada 5 segundos con precisión absoluta

    intervalsRef.current.push(masterTimer);

    return () => {
      if (intervalsRef.current) {
        intervalsRef.current.forEach(t => clearInterval(t));
        intervalsRef.current = [];
      }
    };
  }, [isBotConnected, scheduledMessages]);

  useEffect(() => {
    localStorage.setItem('twitch_bot_oauth', botOauth);
  }, [botOauth]);

  useEffect(() => {
    localStorage.setItem('twitch_bot_username', botUsername);
  }, [botUsername]);

  const botChannelRef = useRef(botChannel);
  const botUsernameRef = useRef(botUsername);
  const botOauthRef = useRef(botOauth);

  useEffect(() => {
    botChannelRef.current = botChannel;
    localStorage.setItem('twitch_bot_channel', botChannel);
  }, [botChannel]);

  useEffect(() => {
    botUsernameRef.current = botUsername;
    localStorage.setItem('twitch_bot_username', botUsername);
  }, [botUsername]);

  useEffect(() => {
    botOauthRef.current = botOauth;
    localStorage.setItem('twitch_bot_oauth', botOauth);
  }, [botOauth]);

  useEffect(() => {
    localStorage.setItem('twitch_scheduled_messages_v3', JSON.stringify(scheduledMessages));
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
  const [newsMonthFilter, setNewsMonthFilter] = useState('all');

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

  // Ruleta States
  const [ruletaParticipants, setRuletaParticipants] = useState([]);
  const [ruletaInputValue, setRuletaInputValue] = useState('');
  const [ruletaIsMuted, setRuletaIsMuted] = useState(false);
  const [ruletaHideNames, setRuletaHideNames] = useState(false);
  const [ruletaEditingIndex, setRuletaEditingIndex] = useState(null);
  const [ruletaShowToast, setRuletaShowToast] = useState(false);

  const handleAddRuletaParticipant = () => {
    if (ruletaInputValue.trim()) {
      const names = ruletaInputValue
        .split(/\r\n|\r|\n/)
        .map(name => name.trim())
        .filter(name => name.length > 0);
      if (names.length > 0) {
        setRuletaParticipants(prev => [...prev, ...names]);
        setRuletaInputValue('');
      }
    }
  };

  const handleRemoveRuletaParticipant = (index) => {
    if (ruletaParticipants.length <= 2) {
      alert("Se necesitan al menos 2 participantes.");
      return;
    }
    setRuletaParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearRuletaParticipants = () => {
    setRuletaParticipants([]);
    setRuletaShowToast(true);
    setTimeout(() => setRuletaShowToast(false), 3000);
  };

  // Twitch Giveaway States & Advanced Rule Handlers
  const [twitchGiveawayParticipants, setTwitchGiveawayParticipants] = useState([]);
  const [twitchGiveawayKeyword, setTwitchGiveawayKeyword] = useState('!web');
  const [twitchGiveawayIsStarted, setTwitchGiveawayIsStarted] = useState(false);
  const [twitchGiveawayWinner, setTwitchGiveawayWinner] = useState(null);

  // Reglas de Sorteo
  const [giveawaySubMultiplier, setGiveawaySubMultiplier] = useState(false);
  const [giveawaySubsOnly, setGiveawaySubsOnly] = useState(false);
  const [giveawayAllowMods, setGiveawayAllowMods] = useState(true);
  const [giveawayAllowVips, setGiveawayAllowVips] = useState(true);

  const twitchGiveawayClientRef = useRef(null);
  const twitchGiveawayParticipantsRef = useRef([]);

  useEffect(() => {
    twitchGiveawayParticipantsRef.current = twitchGiveawayParticipants;
  }, [twitchGiveawayParticipants]);

  const connectTwitchGiveaway = useCallback(() => {
    if (twitchGiveawayClientRef.current) return;
    try {
      const client = new tmi.Client({ channels: ['eviltokkii'] });
      client.connect().then(() => console.log('Sorteo conectó a Twitch')).catch(e => console.error(e));
      client.on('message', (_ch, tags, msg, self) => {
        if (self || !twitchGiveawayIsStarted) return;
        const text = msg.trim();
        const user = tags['display-name'] || tags.username;
        if (text.toLowerCase() === twitchGiveawayKeyword.trim().toLowerCase() && user) {
          // Detectar Insignias de Twitch
          const isSub = !!(tags.subscriber || tags.badges?.subscriber || tags.badges?.founder);
          const isMod = !!(tags.mod || tags.badges?.moderator || tags.badges?.broadcaster);
          const isVip = !!(tags.vip || tags.badges?.vip);

          // Filtros de Reglas
          if (giveawaySubsOnly && !isSub) return;
          if (!giveawayAllowMods && isMod) return;
          if (!giveawayAllowVips && isVip) return;

          const exists = twitchGiveawayParticipantsRef.current.some(p => (typeof p === 'object' ? p.username : p).toLowerCase() === user.toLowerCase());
          if (!exists) {
            const participantObj = {
              username: user,
              isSub,
              isMod,
              isVip
            };
            setTwitchGiveawayParticipants(prev => [participantObj, ...prev]);
          }
        }
      });
      twitchGiveawayClientRef.current = client;
    } catch (err) {
      console.error(err);
    }
  }, [twitchGiveawayIsStarted, twitchGiveawayKeyword, giveawaySubsOnly, giveawayAllowMods, giveawayAllowVips]);

  useEffect(() => {
    if (twitchGiveawayIsStarted) {
      connectTwitchGiveaway();
    }
  }, [twitchGiveawayIsStarted, connectTwitchGiveaway]);

  const handleStartTwitchGiveaway = () => {
    setTwitchGiveawayIsStarted(true);
    setTwitchGiveawayWinner(null);
  };

  const handleStopTwitchGiveaway = () => {
    setTwitchGiveawayIsStarted(false);
  };

  const handleDrawTwitchGiveaway = () => {
    if (twitchGiveawayParticipants.length === 0) {
      triggerToast("⚠️ No hay participantes todavía en la lista.");
      return;
    }
    setTwitchGiveawayIsStarted(false);

    // Bolsa de Tickets con Ponderación x2 para Subs si está activo
    const ticketPool = [];
    twitchGiveawayParticipants.forEach(item => {
      const user = typeof item === 'object' ? item.username : item;
      const isSub = typeof item === 'object' ? item.isSub : false;
      const entries = (giveawaySubMultiplier && isSub) ? 2 : 1;
      for (let i = 0; i < entries; i++) {
        ticketPool.push(user);
      }
    });

    const randomIndex = Math.floor(Math.random() * ticketPool.length);
    setTwitchGiveawayWinner(ticketPool[randomIndex]);
  };

  const handleClearTwitchGiveaway = () => {
    setTwitchGiveawayParticipants([]);
    setTwitchGiveawayWinner(null);
    triggerToast("🗑️ Lista de participantes limpiada.");
  };

  // Control Estricto de Conexión del Bot: Solo se conecta si el interruptor está ACTIVADO
  useEffect(() => {
    if (!localStorage.getItem('twitch_bot_username')) localStorage.setItem('twitch_bot_username', 'EmiliaMaria_exe');
    if (!localStorage.getItem('twitch_bot_channel')) localStorage.setItem('twitch_bot_channel', 'eviltokkii');

    const isBotActive = localStorage.getItem('twitch_bot_enabled') === 'true';
    if (isBotActive) {
      const timer = setTimeout(() => {
        // Inicializar timestamps al momento actual para evitar que dispare mensajes viejos de golpe
        const now = Date.now();
        scheduledMessages.forEach(msg => {
          scheduledTimestampsRef.current[msg.id] = now;
          scheduledChatCountsRef.current[msg.id] = userMessagesCountRef.current;
        });
        lastBdaySentTimestampRef.current = now;
        lastBdayChatCountRef.current = userMessagesCountRef.current;

        connectTwitchBot();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      addBotLog("Bot en estado DESACTIVADO. Pulsa 'Activar Bot' en la casilla de Credenciales para conectarlo.");
    }
  }, []);

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
              access_minigames: false,
              access_ruleta: false,
              access_twitch_giveaway: false,
              access_birthdays: false,
              access_bot_credentials: false,
              access_tts_voices: false
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
    if (view === 'create_content_item' || view === 'create' || view === 'view_sync_news' || view === 'view_twitch' || view === 'view_participations' || view === 'view_most_streamed') {
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

  const handleUploadMostStreamedImage = async (itemId, file) => {
    if (!file) return;
    try {
      triggerToast("⏳ Subiendo imagen a Cloudflare R2...");
      
      // 1. Pedir presigned URL a la Edge Function
      const { data, error } = await supabase.functions.invoke('clever-api', {
        body: { fileName: file.name, fileType: file.type }
      });
      if (error || !data) throw new Error(error ? error.message : "Error contactando Edge Function");

      // 2. Subir físicamente a Cloudflare R2
      const uploadRes = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadRes.ok) throw new Error("AWS Server Error: " + uploadRes.status);

      const localBlob = URL.createObjectURL(file);
      window.__R2_MOCK_CACHE__[data.finalPublicUrl] = localBlob;

      handleMostStreamedChange(itemId, 'image_url', data.finalPublicUrl);
      triggerToast("✅ ¡Imagen subida a Cloudflare R2 con éxito!");
    } catch (err) {
      console.error("Error uploading game image:", err);
      alert("No se pudo subir a Cloudflare R2: " + err.message);
    }
  };

  const handleDeleteMostStreamedItem = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${title || 'este juego'}" de la lista?`)) return;
    try {
      const { error } = await supabase
        .from('most_streamed')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMostStreamed(prev => prev.filter(i => i.id !== id));
      triggerToast("🗑️ Juego eliminado correctamente");
    } catch (err) {
      console.error("Error deleting game:", err);
      alert("Error al eliminar juego: " + err.message);
    }
  };

  const handleAddMostStreamedItem = async () => {
    try {
      const newOrder = mostStreamed.length + 1;
      const { data, error } = await supabase
        .from('most_streamed')
        .insert([{
          title: 'Nuevo Juego',
          image_url: '',
          description: '',
          order_index: newOrder
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMostStreamed(prev => [...prev, data]);
      } else {
        fetchMostStreamed();
      }
      triggerToast("✨ Nueva casilla de juego añadida");
    } catch (err) {
      console.error("Error adding game:", err);
      alert("Error al añadir juego: " + err.message);
    }
  };

  const saveMostStreamedItem = async (item) => {
    setSubmittingId(item.id);
    try {
      const payload = { 
          id: item.id,
          title: item.title, 
          image_url: item.image_url || '',
          updated_at: new Date().toISOString() 
      };
      if (item.description !== undefined) {
          payload.description = item.description;
      }
      const { error } = await supabase
        .from('most_streamed')
        .upsert(payload);
      
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

    const handleDeleteNewsByMonth = (monthLabel, itemsToDelete) => {
    if (!itemsToDelete || itemsToDelete.length === 0) return;
    const count = itemsToDelete.length;
    const ids = itemsToDelete.map(item => item.id);

    showConfirm(
      `¿Seguro que deseas eliminar permanentemente TODAS las ${count} noticias de ${monthLabel}? Esta acción las borrará de Supabase y del Builder.`,
      async () => {
        const { error } = await supabase.from('news_articles').delete().in('id', ids);
        if (!error) {
          setSavedNews(prev => prev.filter(item => !ids.includes(item.id)));
          setNewsMonthFilter('all');
          if (editingItemId && ids.includes(editingItemId)) {
            setEditingItemId(null);
            setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] });
          }
          triggerToast(`✅ Se han eliminado ${count} noticias de ${monthLabel}.`);
        } else {
          alert("Error al eliminar noticias del mes: " + error.message);
        }
        closeConfirm();
      }
    );
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
                {activeMinigameTab === 'pokemon' && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">URL de la Imagen (Artwork del Pokémon)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingMinigameItem.data.pokemonImage}
                  onChange={(e) => {
                    const copy = { ...editingMinigameItem };
                    copy.data.pokemonImage = e.target.value;
                    setEditingMinigameItem(copy);
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                  <img 
                    src={editingMinigameItem.data.pokemonImage} 
                    alt="Preview Pokémon" 
                    style={{ height: '80px', objectFit: 'contain', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '6px' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                  />
                </div>
              </div>
            )}

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
      {view === 'view_ruleta' ? (
        <aside className="sidebar animate-slide-down">
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Disc size={24} color="var(--primary)" />
              <h2 style={{ whiteSpace: 'nowrap', fontSize: '1.1rem', margin: 0 }}>Ruleta de Sorteos</h2>
            </div>
          </div>
          <div className="sidebar-content" style={{ padding: 0 }}>
            <RuletaSidebar
              participants={ruletaParticipants}
              setParticipants={setRuletaParticipants}
              inputValue={ruletaInputValue}
              setInputValue={setRuletaInputValue}
              addParticipant={handleAddRuletaParticipant}
              removeParticipant={handleRemoveRuletaParticipant}
              clearParticipants={handleClearRuletaParticipants}
              editingIndex={ruletaEditingIndex}
              setEditingIndex={setRuletaEditingIndex}
            />
          </div>
        </aside>
      ) : view === 'view_twitch_giveaway' ? (
        <aside className="sidebar animate-slide-down">
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gift size={24} color="#3B82F6" />
              <h2 style={{ 
                whiteSpace: 'nowrap', 
                fontSize: '1.1rem', 
                margin: 0,
                color: '#3B82F6',
                background: 'none',
                WebkitTextFillColor: '#3B82F6',
                WebkitBackgroundClip: 'initial',
                textShadow: '0 0 12px rgba(59, 130, 246, 0.6)'
              }}>
                Sorteo en Vivo
              </h2>
            </div>
          </div>
          <div className="sidebar-content" style={{ padding: 0 }}>
            <TwitchGiveawaySidebar
              keyword={twitchGiveawayKeyword}
              setKeyword={setTwitchGiveawayKeyword}
              isStarted={twitchGiveawayIsStarted}
              handleStart={handleStartTwitchGiveaway}
              handleStop={handleStopTwitchGiveaway}
              handleClear={handleClearTwitchGiveaway}
              handleDraw={handleDrawTwitchGiveaway}
              participants={twitchGiveawayParticipants}
              winner={twitchGiveawayWinner}
              subMultiplierActive={giveawaySubMultiplier}
              setSubMultiplierActive={setGiveawaySubMultiplier}
              subsOnly={giveawaySubsOnly}
              setSubsOnly={setGiveawaySubsOnly}
              allowMods={giveawayAllowMods}
              setAllowMods={setGiveawayAllowMods}
              allowVips={giveawayAllowVips}
              setAllowVips={setGiveawayAllowVips}
            />
          </div>
        </aside>
      ) : ['create', 'create_content_item', 'view_participations', 'view_twitch'].includes(view) && (() => {
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
              {/* FILTRO Y SELECTOR DE MES/AÑO EXCLUSIVO PARA NOTICIAS */}
              {view === 'create' && savedNews.length > 0 && (() => {
                // Obtener meses únicos con formato "Mes Año"
                const monthGroupsMap = {};
                savedNews.forEach(item => {
                  const d = new Date(item.created_at || Date.now());
                  const monthName = d.toLocaleDateString('es-ES', { month: 'long' });
                  const key = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${d.getFullYear()}`;
                  if (!monthGroupsMap[key]) monthGroupsMap[key] = [];
                  monthGroupsMap[key].push(item);
                });
                const availableMonths = Object.keys(monthGroupsMap);

                return (
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '5px' }}>
                      Filtrar por Mes y Año:
                    </label>
                    <select
                      value={newsMonthFilter}
                      onChange={(e) => setNewsMonthFilter(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: '#F8FAFC',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">📅 Todos los Meses ({savedNews.length})</option>
                      {availableMonths.map(mKey => (
                        <option key={mKey} value={mKey}>
                          📅 {mKey} ({monthGroupsMap[mKey].length})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

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
              ) : view === 'create' ? (() => {
                // Agrupar noticias por Mes y Año
                const grouped = {};
                savedNews.forEach(item => {
                  const d = new Date(item.created_at || Date.now());
                  const monthName = d.toLocaleDateString('es-ES', { month: 'long' });
                  const key = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${d.getFullYear()}`;
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(item);
                });

                const groupKeys = Object.keys(grouped).filter(k => newsMonthFilter === 'all' || newsMonthFilter === k);

                if (groupKeys.length === 0) {
                  return (
                    <div className="empty-sidebar" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No hay noticias en este mes seleccionado.
                    </div>
                  );
                }

                return groupKeys.map(groupMonth => {
                  const itemsInMonth = grouped[groupMonth];

                  return (
                    <div key={groupMonth} style={{ marginBottom: '14px' }}>
                      {/* Cabecera del Mes con Botón de Eliminar Mes */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(15, 23, 42, 0.5) 100%)',
                        borderLeft: '3px solid #EC4899',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        marginTop: '4px'
                      }}>
                        <span style={{ color: '#F8FAFC', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          📅 {groupMonth} <span style={{ color: '#EC4899', fontSize: '0.75rem' }}>({itemsInMonth.length})</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteNewsByMonth(groupMonth, itemsInMonth)}
                          title={`Eliminar todas las noticias de ${groupMonth} en Supabase y Builder`}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '4px',
                            padding: '3px 7px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Trash2 size={12} /> Eliminar Mes
                        </button>
                      </div>

                      {/* Lista de Noticias del Mes */}
                      {itemsInMonth.map(item => {
                        const isActive = editingItemId === item.id;

                        return (
                          <div 
                            key={item.id} 
                            className={`news-item animate-slide-down ${isActive ? 'active' : ''}`} 
                            style={{ 
                              cursor: 'pointer',
                              borderLeft: isActive ? '4px solid var(--primary)' : 'none',
                              backgroundColor: isActive ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                              marginBottom: '6px'
                            }} 
                            onClick={() => { 
                              handleEditItem(item.id, 'noticia');
                            }}
                          >
                            <button 
                              className="btn-delete-news" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeleteItem(item.id); 
                              }}
                              title="Eliminar noticia individual"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="news-item-title" style={{ paddingRight: '20px' }}>
                              {item.titulo || item.title}
                            </div>
                            <div className="news-item-date" style={{ textTransform: 'capitalize', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div>
                                Noticia • {item.author || 'Sin Autor'} • {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric'})}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })() : (
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
                          handleEditItem(item.id, null);
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
              <h1 className="home-header-title">Builder de EvilTokkii</h1>
              <button 
                onClick={handleLogout}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                title="Cerrar Sesión"
              >
                <LogOut size={18} /> Salir ({sessionUsername})
              </button>
            </div>
            <p className="home-header-subtitle">
              Gestiona el contenido estructurado de la web, Bot y contenido para Twitch. Bienvenidos y usar con mucha responsabilidad.
            </p>
            
            {isPamacheAdmin && (
              <>
                <h2 className="section-title" style={{ marginTop: '2rem', marginBottom: '1.2rem', color: '#F59E0B', fontSize: '1.4rem', fontWeight: 600, borderBottom: '1px solid rgba(245, 158, 11, 0.2)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crown size={22} color="#F59E0B" /> Panel de Superadministrador (Pamache)
                </h2>
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  
                  {/* Pendientes de Autorización */}
                  <div 
                    className="dashboard-card theme-amber" 
                    onClick={() => restrictedNavigate('view_pending_authorizations', 'user_permissions')}
                    style={{ position: 'relative' }}
                  >
                    {pendingUsersCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#EF4444',
                        color: '#FFF',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <AlertCircle size={12} /> {pendingUsersCount} {pendingUsersCount === 1 ? 'Pendiente' : 'Pendientes'}
                      </span>
                    )}
                    <div className="icon-bg" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                      <UserCheck size={26} />
                    </div>
                    <div className="dashboard-card-info">
                      <h3 style={{ color: '#F59E0B' }}>Pendientes de Autorización</h3>
                      <p>Revisa, aprueba o rechaza solicitudes de nuevos usuarios registrados en el Builder con 1 solo clic.</p>
                    </div>
                  </div>

                  {/* Gestión de Permisos */}
                  <div 
                    className="dashboard-card theme-amber" 
                    onClick={() => restrictedNavigate('view_user_permissions', 'user_permissions')}
                  >
                    <div className="icon-bg" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                      <ShieldCheck size={26} />
                    </div>
                    <div className="dashboard-card-info">
                      <h3 style={{ color: '#F59E0B' }}>Gestión de Permisos</h3>
                      <p>Activa o desactiva casillas del Builder para cada usuario con interruptores On/Off sin entrar a Supabase.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 1. SECCIÓN: BOT PARA TWITCH (Verde #10B981) */}
            <h2 className="section-title" style={{ marginTop: '2rem', marginBottom: '1.2rem', color: '#10B981', fontSize: '1.4rem', fontWeight: 600, borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={22} color="#10B981" /> Bot para Twitch
            </h2>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2.5rem', gap: '1.2rem' }}>
              
              {/* Cumpleaños */}
              <div 
                className="dashboard-card theme-green" 
                onClick={() => restrictedNavigate('view_birthdays', 'birthdays')}
              >
                <div className="icon-bg" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                  <Cake size={26} color="#10B981" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Cumpleaños</h3>
                  <p>Registra fechas de cumpleaños de viewers y programa felicitaciones automáticas en el chat.</p>
                </div>
              </div>

              {/* Mensajes Programados */}
              <div 
                className={`dashboard-card theme-green ${!hasAccess('scheduled_messages') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_scheduled_messages', 'scheduled_messages')}
              >
                <div className="icon-bg" style={{ background: hasAccess('scheduled_messages') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#10B981' }}>
                  <MessageSquare size={26} color="#10B981" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Mensajes programados</h3>
                  <p>Programa mensajes automatizados periódicos para el chat de Twitch de EvilTokkii.</p>
                </div>
              </div>

              {/* Comandos del Chat */}
              <div 
                className={`dashboard-card theme-green ${!hasAccess('commands') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_commands', 'commands')}
              >
                <div className="icon-bg" style={{ background: hasAccess('commands') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#10B981' }}>
                  <Settings size={26} color="#10B981" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Comandos del Chat</h3>
                  <p>Crea comandos personalizados y plantillas interactivas (ej: versus/peleas) para el chat.</p>
                </div>
              </div>

              {/* Credenciales Bot */}
              <div 
                className="dashboard-card theme-green" 
                onClick={() => restrictedNavigate('view_bot_credentials', 'bot_credentials')}
              >
                <div className="icon-bg" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                  <Key size={26} color="#10B981" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Credenciales Bot</h3>
                  <p>Configura de forma centralizada la cuenta de Twitch secundaria (EmiliaMaria_exe), token y color.</p>
                </div>
              </div>

              {/* Voces TTS (Text to Speech) */}
              <div 
                className={`dashboard-card theme-green ${!hasAccess('tts_voices') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_tts_voices', 'tts_voices')}
              >
                <div className="icon-bg" style={{ background: hasAccess('tts_voices') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#10B981' }}>
                  <Volume2 size={26} color="#10B981" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Voces TTS (Personajes)</h3>
                  <p>Comandos de voz con personajes de anime, videojuegos y celebridades (Goku, Homero, Sonic, etc.).</p>
                </div>
              </div>
            </div>

            {/* SECCIÓN: CANJES POR PUNTOS DE TWITCH (Azul #3B82F6) */}
            <h2 className="section-title" style={{ marginTop: '1.5rem', marginBottom: '1.2rem', color: '#3B82F6', fontSize: '1.4rem', fontWeight: 600, borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={22} color="#3B82F6" /> Canjes por puntos de Twitch
            </h2>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2.5rem', gap: '1.2rem' }}>
              <div 
                className={`dashboard-card theme-blue ${!hasAccess('points_wheel') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_points_wheel', 'points_wheel')}
              >
                <div className="icon-bg" style={{ background: hasAccess('points_wheel') ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#3B82F6' }}>
                  <Sparkles size={26} color="#3B82F6" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Ruleta por Puntos</h3>
                  <p>Ruleta interactiva con overlay para OBS que gira automáticamente al canjear puntos de canal.</p>
                </div>
              </div>
            </div>

            {/* 2. SECCIÓN: HERRAMIENTAS DE LA WEB (Rosa #EC4899) */}
            <h2 className="section-title" style={{ marginTop: '1.5rem', marginBottom: '1.2rem', color: '#EC4899', fontSize: '1.4rem', fontWeight: 600, borderBottom: '1px solid rgba(236, 72, 153, 0.2)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={22} color="#EC4899" /> Herramientas de la Web
            </h2>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2.5rem', gap: '1.2rem' }}>
              <div 
                className={`dashboard-card theme-pink ${!hasAccess('news_only') ? 'restricted' : ''}`} 
                onClick={() => { setEditingItemId(null); setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] }); restrictedNavigate('create', 'news_only'); }}
              >
                <div className="icon-bg" style={{ background: hasAccess('news_only') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <FilePlus size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3>Crear Noticia</h3>
                  <p>Genera un nuevo artículo inmersivo con imágenes y bloques de texto para la vista principal.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-pink ${!hasAccess('events_and_giveaways') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('create_content_item', 'events_and_giveaways')}
              >
                <div className="icon-bg" style={{ background: hasAccess('events_and_giveaways') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <Calendar size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3>Crear Sorteo o Evento</h3>
                  <p>Configura sorteos y eventos interactivos en un creador unificado con normas, premios y fechas.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-pink ${!hasAccess('participations') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_participations', 'participations')}
              >
                <div className="icon-bg" style={{ background: hasAccess('participations') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <Users size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3>Gestionar Participaciones</h3>
                  <p>Revisa y gestiona los usuarios inscritos a los diferentes eventos y sorteos activos.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-pink ${!hasAccess('most_streamed') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_most_streamed', 'most_streamed')}
              >
                <div className="icon-bg" style={{ background: hasAccess('most_streamed') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <Gamepad2 size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Lo mas Streameable</h3>
                  <p>Gestiona los 6 juegos destacados que aparecen en la sección principal de la web.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-pink ${!hasAccess('reports') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_reports', 'reports')}
              >
                <div className="icon-bg" style={{ background: hasAccess('reports') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <AlertCircle size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Reportes Web</h3>
                  <p>Visualiza y gestiona los reportes, sugerencias y fallos enviados por los usuarios desde la web.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-pink ${!hasAccess('minigames') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_minijuegos', 'minigames')}
              >
                <div className="icon-bg" style={{ background: hasAccess('minigames') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <Gamepad2 size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Minijuegos</h3>
                  <p>Visualiza y edita manualmente el banco de preguntas, perks y palabras de todas las dinámicas.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-pink ${!hasAccess('tierlists') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_tierlists', 'tierlists')}
              >
                <div className="icon-bg" style={{ background: hasAccess('tierlists') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <Layers size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Contenido Tierlists</h3>
                  <p>Gestiona, añade y actualiza personajes e imágenes en las 4 Tierlists oficiales de la web.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-pink ${!hasAccess('news_only') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_sync_news', 'news_only')}
              >
                <div className="icon-bg" style={{ background: hasAccess('news_only') ? 'rgba(236, 72, 153, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#EC4899' }}>
                  <Newspaper size={26} color="#EC4899" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Sincronizar Noticias</h3>
                  <p>Ejecuta la sincronización automática de 3 noticias de videojuegos y 3 de anime desde los feeds oficiales.</p>
                </div>
              </div>
            </div>

            {/* 3. SECCIÓN: HERRAMIENTAS TWITCH (Celeste #38BDF8) */}
            <h2 className="section-title" style={{ marginTop: '2.5rem', marginBottom: '1.2rem', color: '#38BDF8', fontSize: '1.4rem', fontWeight: 600, borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tv size={22} color="#38BDF8" /> Herramientas Twitch
            </h2>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>
              <div 
                className={`dashboard-card theme-cyan ${!hasAccess('ruleta') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_ruleta', 'ruleta')}
              >
                <div className="icon-bg" style={{ background: hasAccess('ruleta') ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#38BDF8' }}>
                  <Disc size={26} color="#38BDF8" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Ruleta de Sorteos</h3>
                  <p>Girador de ruleta animada personalizable para realizar sorteos en directo.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-cyan ${!hasAccess('twitch_giveaway') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_twitch_giveaway', 'twitch_giveaway')}
              >
                <div className="icon-bg" style={{ background: hasAccess('twitch_giveaway') ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#38BDF8' }}>
                  <Gift size={26} color="#38BDF8" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Sorteo en Vivo (Chat)</h3>
                  <p>Escucha el chat de Twitch en tiempo real por palabras clave para sortear ganadores.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-cyan ${!hasAccess('twitch') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_twitch', 'twitch')}
              >
                <div className="icon-bg" style={{ background: hasAccess('twitch') ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#38BDF8' }}>
                  <LayoutTemplate size={26} color="#38BDF8" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Inscripciones por canje</h3>
                  <p>Monitorea y organiza los reclamos de recompensas de puntos de canal vinculados.</p>
                </div>
              </div>

              <div 
                className={`dashboard-card theme-cyan ${!hasAccess('song_request') ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_song_request', 'song_request')}
              >
                <div className="icon-bg" style={{ background: hasAccess('song_request') ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.5)', color: '#38BDF8' }}>
                  <Play size={26} color="#38BDF8" />
                </div>
                <div className="dashboard-card-info">
                  <h3 style={{ color: 'var(--text-main)' }}>Song Request</h3>
                  <p>Gestiona la cola de canciones pedidas por el chat y visualiza el reproductor.</p>
                </div>
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
        ) : view === 'view_ruleta' ? (
          <div className="builder-view" style={{ maxWidth: '100%', margin: 0, padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 40px)' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 style={{ 
                fontSize: '2.2rem', 
                fontWeight: 900,
                textTransform: 'uppercase',
                color: '#EC4899',
                background: 'none',
                WebkitTextFillColor: '#EC4899',
                WebkitBackgroundClip: 'initial',
                textShadow: '0 0 20px rgba(236, 72, 153, 0.75), 0 0 45px rgba(236, 72, 153, 0.45)',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                margin: 0,
                whiteSpace: 'nowrap'
              }}>
                Ruleta de Sorteos EvilTokkii
              </h1>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <RuletaWheel
                participants={ruletaParticipants}
                isMuted={ruletaIsMuted}
                setIsMuted={setRuletaIsMuted}
                hideNames={ruletaHideNames}
                setHideNames={setRuletaHideNames}
                showToast={ruletaShowToast}
              />
            </div>
          </div>
        ) : view === 'view_twitch_giveaway' ? (
          <div className="builder-view" style={{ maxWidth: '100%', margin: 0, padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 40px)' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 style={{ 
                fontSize: '2.2rem', 
                fontWeight: 900,
                textTransform: 'uppercase',
                color: '#3B82F6',
                background: 'none',
                WebkitTextFillColor: '#3B82F6',
                WebkitBackgroundClip: 'initial',
                textShadow: '0 0 20px rgba(59, 130, 246, 0.85), 0 0 45px rgba(59, 130, 246, 0.55)',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                margin: 0,
                whiteSpace: 'nowrap'
              }}>
                Sorteo en Vivo
              </h1>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <TwitchGiveawayMain
                keyword={twitchGiveawayKeyword}
                isStarted={twitchGiveawayIsStarted}
                winner={twitchGiveawayWinner}
                setWinner={setTwitchGiveawayWinner}
                participants={twitchGiveawayParticipants}
                subMultiplierActive={giveawaySubMultiplier}
                subsOnly={giveawaySubsOnly}
                allowMods={giveawayAllowMods}
                allowVips={giveawayAllowVips}
              />
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
          <div className="builder-view" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', margin: 0, textAlign: 'center', flex: 1 }}>
                Lo más Streameable
              </h1>
              <button 
                className="btn-submit"
                onClick={handleAddMostStreamedItem}
                style={{ width: 'auto', padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--primary), #ec4899)', fontWeight: 700 }}
              >
                <Plus size={18} /> Añadir Juego
              </button>
            </div>

            <div className="card animate-slide-down" style={{ minHeight: '60vh', padding: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.4rem' }}>
                    <Gamepad2 size={24} />
                    Catálogo de Juegos más Streameados ({mostStreamed.length})
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', margin: 0 }}>
                    Estos juegos se muestran en la sección principal de la web. Puedes subir portadas a R2, editarlos o eliminarlos.
                  </p>
                </div>
              </div>

              {isLoadingMostStreamed ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <LayoutTemplate size={48} opacity={0.3} style={{ marginBottom: '10px' }} />
                  <br />
                  Cargando juegos desde Supabase...
                </div>
              ) : mostStreamed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <Gamepad2 size={48} opacity={0.3} style={{ marginBottom: '10px' }} />
                  <p>No hay juegos registrados en el catálogo.</p>
                  <button className="btn-submit" onClick={handleAddMostStreamedItem} style={{ width: 'auto', margin: '0 auto' }}>
                    <Plus size={16} /> Crear Primer Juego
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                  {mostStreamed.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="card animate-slide-down" 
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(15, 23, 42, 0.6))', 
                        border: '1px solid rgba(233, 176, 255, 0.2)', 
                        borderRadius: '20px', 
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        gap: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: '230px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
                      }}
                    >
                      {/* Botón Eliminar Casilla Arriba a la Derecha */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMostStreamedItem(item.id, item.title)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          zIndex: 10,
                          transition: 'all 0.2s ease'
                        }}
                        title="Eliminar este juego"
                      >
                        <Trash2 size={15} /> Eliminar
                      </button>

                      {/* Left: Portada a Altura Completa (100% alto) */}
                      <div style={{
                        width: '145px',
                        minWidth: '145px',
                        maxWidth: '145px',
                        alignSelf: 'stretch',
                        background: '#0d0714',
                        borderRight: '1px solid rgba(233, 176, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {item.image_url ? (
                          <img 
                            src={item.image_url.startsWith('http') ? getDisplayUrl(item.image_url) : `${CLOUDFLARE_R2_BASE_URL}/${item.image_url}`} 
                            alt={item.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                            onError={(e) => { e.target.style.display = 'none'; }} 
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', padding: '10px', textAlign: 'center' }}>
                            <Gamepad2 size={36} opacity={0.35} />
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Sin Portada</span>
                          </div>
                        )}
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'linear-gradient(135deg, var(--primary), #772ce8)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                          zIndex: 2
                        }}>
                          #{index + 1}
                        </span>
                      </div>

                      {/* Right: Contenedor con Título Arriba, Casilla para Subir Imagen a R2 y Descripción Abajo */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        padding: '18px 24px 18px 0',
                        paddingRight: '125px'
                      }}>
                        {/* 1. Título del Juego Arriba */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px', fontWeight: 700, color: 'var(--text-main)' }}>
                            Título del Juego
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={item.title} 
                            onChange={(e) => handleMostStreamedChange(item.id, 'title', e.target.value)} 
                            placeholder="Ej: Overwatch"
                            style={{ fontWeight: 600, fontSize: '0.95rem' }}
                          />
                        </div>

                        {/* 2. Subir Imagen a Cloudflare R2 + Enlace */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700 }}>URL de la Imagen (Cloudflare R2)</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sube un archivo directo o escribe la ruta</span>
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={item.image_url} 
                              placeholder="https://pub-0bf9a87cec964ff49bfd058873c948c3.r2.dev/public/... o Imagenes/Nombre.png"
                              onChange={(e) => handleMostStreamedChange(item.id, 'image_url', e.target.value)} 
                              style={{ fontSize: '0.85rem' }}
                            />
                            <label 
                              style={{
                                padding: '0 16px',
                                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                                color: '#fff',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                              }}
                              title="Seleccionar archivo desde tu PC y subirlo automáticamente a Cloudflare R2"
                            >
                              <ImageIcon size={16} /> Subir Imagen a R2
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleUploadMostStreamedImage(item.id, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* 3. Descripción del Juego / Contenido Abajo */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px', fontWeight: 700, color: 'var(--text-main)' }}>
                            Descripción del Juego / Contenido
                          </label>
                          <textarea 
                            className="form-control" 
                            rows="2"
                            placeholder="Escribe una pequeña descripción del contenido en directo sin límite de caracteres..."
                            value={item.description || ''} 
                            onChange={(e) => handleMostStreamedChange(item.id, 'description', e.target.value)} 
                            style={{ resize: 'vertical', minHeight: '65px', fontSize: '0.88rem' }}
                          />
                        </div>

                        {/* 4. Botón Guardar Cambios */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button 
                            className="btn-submit" 
                            style={{ 
                              width: 'auto', 
                              padding: '10px 24px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              background: 'linear-gradient(135deg, var(--primary), #772ce8)',
                              color: '#fff',
                              borderRadius: '10px',
                              fontWeight: 700,
                              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                            }} 
                            onClick={() => saveMostStreamedItem(item)}
                            disabled={submittingId === item.id}
                          >
                            {submittingId === item.id ? 'Guardando...' : <><Save size={16} /> Guardar Cambios</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : view === 'view_scheduled_messages' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
            <ScheduledMessagesManager 
              supabase={supabase} 
              triggerToast={triggerToast}
              isBotConnected={isBotConnected}
              connectTwitchBot={connectTwitchBot}
              disconnectTwitchBot={disconnectTwitchBot}
              enviarMensajeTwitch={enviarMensajeTwitch}
              botLogs={botLogs}
              setBotLogs={setBotLogs}
              messages={scheduledMessages}
              setMessages={setScheduledMessages}
            />
          </div>
        ) : view === 'view_tts_voices' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>

            <TTSVoiceManager 
              supabase={supabase}
              triggerToast={triggerToast}
            />
          </div>
        ) : view === 'view_points_wheel' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>

            <PointsWheelManager 
              supabase={supabase}
              triggerToast={triggerToast}
              enviarMensajeTwitch={enviarMensajeTwitch}
              isBotConnected={isBotConnected}
            />
          </div>
        ) : view === 'view_commands' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>

            <ChatCommandsManager 
              supabase={supabase}
              triggerToast={triggerToast}
              chatCommands={chatCommands}
              fetchChatCommands={fetchChatCommands}
              handleSaveChatCommand={handleSaveChatCommand}
              handleDeleteChatCommand={handleDeleteChatCommand}
              enviarMensajeTwitch={enviarMensajeTwitch}
              isBotConnected={isBotConnected}
            />
          </div>
        ) : view === 'view_reports' ? (
          <div className="builder-view" style={{ maxWidth: '1500px', width: '98%' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => { setView('home'); setSelectedReportId(null); setReplyingText(''); }}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Bandeja de Reportes y Ayuda
              </h1>
            </div>

            {/* Sub-header con Filtros y Buscador */}
            <div className="card animate-slide-down" style={{ padding: '16px 20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
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
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
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
                    placeholder="Buscar por usuario o texto..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    style={{ width: '260px', margin: 0, padding: '6px 12px', fontSize: '0.85rem' }}
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
            ) : (() => {
              const filteredReports = userReports
                .filter(r => reportFilter === 'todos' || r.report_type === reportFilter)
                .filter(r => !reportSearch || r.description.toLowerCase().includes(reportSearch.toLowerCase()) || (r.username && r.username.toLowerCase().includes(reportSearch.toLowerCase())));

              const activeReport = filteredReports.find(r => r.id === selectedReportId) || filteredReports[0] || null;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
                  {/* BARRA LATERAL IZQUIERDA: Lista de Reportes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredReports.length === 0 ? (
                      <div className="card text-center" style={{ padding: '30px 15px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        No hay reportes que coincidan con la búsqueda.
                      </div>
                    ) : (
                      filteredReports.map((report) => {
                        const isSelected = activeReport && activeReport.id === report.id;
                        const isAnswered = !!report.admin_response;

                        return (
                          <div
                            key={report.id}
                            className="card animate-slide-down"
                            onClick={() => {
                              setSelectedReportId(report.id);
                              setReplyingText(report.admin_response || '');
                            }}
                            style={{
                              padding: '14px 16px',
                              margin: 0,
                              cursor: 'pointer',
                              borderRadius: '12px',
                              background: isSelected 
                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)' 
                                : 'var(--bg-card)',
                              border: isSelected 
                                ? '1px solid var(--primary)' 
                                : '1px solid rgba(255, 255, 255, 0.05)',
                              borderLeft: `5px solid ${
                                report.report_type === 'bug' ? '#EF4444' : 
                                report.report_type === 'sugerencia' ? '#10B981' : 
                                '#F59E0B'
                              }`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 4px 14px rgba(236, 72, 153, 0.2)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                background: report.report_type === 'bug' ? 'rgba(239, 68, 68, 0.15)' : report.report_type === 'sugerencia' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: report.report_type === 'bug' ? '#EF4444' : report.report_type === 'sugerencia' ? '#10B981' : '#F59E0B',
                                border: `1px solid ${report.report_type === 'bug' ? 'rgba(239, 68, 68, 0.3)' : report.report_type === 'sugerencia' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                              }}>
                                {report.report_type === 'bug' ? '🐛 Bug' : report.report_type === 'sugerencia' ? '💡 Sugerencia' : '🔄 Cambio'}
                              </span>

                              <span style={{
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                background: isAnswered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: isAnswered ? '#10B981' : '#F59E0B'
                              }}>
                                {isAnswered ? 'Respondido' : 'Pendiente'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                {report.username ? `@${report.username}` : `Usuario #${report.user_id.substring(0,6)}`}
                              </strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <p style={{
                              margin: 0,
                              fontSize: '0.8rem',
                              color: 'var(--text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {report.description}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* PANEL PRINCIPAL DERECHO: Detalle del Reporte y Casilla para Responder */}
                  {activeReport ? (
                    <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', margin: 0 }}>
                      {/* Cabecera del Reporte Seleccionado */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              background: activeReport.report_type === 'bug' ? 'rgba(239, 68, 68, 0.15)' : activeReport.report_type === 'sugerencia' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: activeReport.report_type === 'bug' ? '#EF4444' : activeReport.report_type === 'sugerencia' ? '#10B981' : '#F59E0B',
                              border: `1px solid ${activeReport.report_type === 'bug' ? 'rgba(239, 68, 68, 0.3)' : activeReport.report_type === 'sugerencia' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                            }}>
                              {activeReport.report_type === 'bug' ? '🐛 Bug' : activeReport.report_type === 'sugerencia' ? '💡 Sugerencia' : '🔄 Cambio'}
                            </span>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                              {activeReport.username ? `@${activeReport.username}` : `Usuario: ${activeReport.user_id}`}
                            </h2>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Enviado el {new Date(activeReport.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn-delete-news"
                          onClick={() => handleDeleteReport(activeReport.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            padding: '8px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}
                        >
                          <Trash2 size={16} /> Eliminar Reporte
                        </button>
                      </div>

                      {/* Contenido Completo de la Descripción */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Mensaje / Descripción del Usuario
                        </label>
                        <div style={{
                          fontSize: '0.95rem',
                          color: 'var(--text-main)',
                          background: 'rgba(15, 23, 42, 0.4)',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6'
                        }}>
                          {activeReport.description}
                        </div>
                      </div>

                      {/* Galería de Imágenes Adjuntas */}
                      {activeReport.images && Array.isArray(activeReport.images) && activeReport.images.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Imágenes Adjuntas ({activeReport.images.length})
                          </label>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {activeReport.images.map((imgUrl, index) => (
                              <a
                                key={index}
                                href={imgUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'block',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Captura ${index + 1}`}
                                  style={{
                                    height: '140px',
                                    maxWidth: '220px',
                                    objectFit: 'cover',
                                    display: 'block'
                                  }}
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Casilla para Responder al Usuario */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          💌 Responder al Usuario (Aparecerá en su buzón personal):
                        </label>
                        <textarea
                          rows={4}
                          className="form-control"
                          placeholder="Escribe tu respuesta oficial de soporte aquí..."
                          value={replyingText}
                          onChange={(e) => setReplyingText(e.target.value)}
                          style={{
                            width: '100%',
                            margin: 0,
                            padding: '12px 14px',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            background: 'rgba(0,0,0,0.25)'
                          }}
                        />
                        <button
                          type="button"
                          className="btn-submit"
                          onClick={() => handleSaveReportResponse(activeReport.id)}
                          disabled={sendingResponse}
                          style={{
                            width: 'fit-content',
                            padding: '10px 24px',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            alignSelf: 'flex-end',
                            fontSize: '0.9rem'
                          }}
                        >
                          {sendingResponse ? 'Guardando...' : activeReport.admin_response ? '🔄 Actualizar Respuesta' : '✉️ Enviar Respuesta'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card text-center" style={{ padding: '50px 20px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Selecciona un reporte de la izquierda para ver los detalles.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : view === 'view_minijuegos' ? (
          <div className="builder-view" style={{ maxWidth: '1600px', width: '98%' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => { setView('home'); setMinigameSearch(''); setMinigamePage(1); setEditingMinigameItem(null); }}>
                <ChevronLeft size={18} /> Volver
              </button>
              <h1 className="header-title" style={{ fontSize: '1.8rem', flex: 1, textAlign: 'center', paddingRight: '100px' }}>
                Gestor de Minijuegos
              </h1>
            </div>

            {/* Layout en 2 Columnas: Barra Lateral Izquierda (Menú + Filtros) y Contenido Principal Derecha */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Barra Lateral Izquierda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'sticky', top: '20px' }}>
                {/* Selector de Minijuegos en lista vertical */}
                <div className="card animate-slide-down" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Seleccionar Minijuego
                  </span>
                  {[
                    { id: 'overwatch', label: '🛡️ Overwatch' },
                    { id: 'dbd', label: '💀 DBD Perks' },
                    { id: 'games', label: '🎮 Trivia Juegos' },
                    { id: 'flags', label: '🏳️ Banderas' },
                    { id: 'scramble', label: '🔤 Scramble' },
                    { id: 'music', label: '🎵 Música' },
                    { id: 'disney', label: '🏰 Disney' },
                    { id: 'covers', label: '🎮 Carátulas' },
                    { id: 'pokemon', label: '😺 Pokémon' },
                    { id: 'brands', label: '🏷️ Marcas' },
                    { id: 'history', label: '🌍 Eventos Mundiales' }
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
                        padding: '10px 14px',
                        background: activeMinigameTab === tab.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                        border: activeMinigameTab === tab.id ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-main)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        boxShadow: activeMinigameTab === tab.id ? '0 4px 12px rgba(255, 0, 110, 0.25)' : 'none'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        ({(minigamesData[tab.id] || []).length})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Buscador y Botones de Acción */}
                <div className="card animate-slide-down" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Acciones y Búsqueda
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por texto..."
                    value={minigameSearch}
                    onChange={(e) => {
                      setMinigameSearch(e.target.value);
                      setMinigamePage(1);
                    }}
                    style={{ width: '100%', margin: 0, padding: '8px 12px', fontSize: '0.9rem' }}
                  />
                  <button
                    onClick={fetchMinigamesFromSupabase}
                    className="btn-submit"
                    style={{ width: '100%', padding: '8px 16px', margin: 0 }}
                    disabled={loadingMinigames || isSavingMinigame}
                  >
                    {loadingMinigames ? 'Cargando...' : '🔄 Actualizar Lista'}
                  </button>
                  <button
                    onClick={() => resetMinigameToDefault(activeMinigameTab)}
                    className="btn-submit"
                    style={{ width: '100%', padding: '8px 16px', margin: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    disabled={loadingMinigames || isSavingMinigame}
                  >
                    ⚠️ Restaurar Defectos
                  </button>
                </div>
              </div>

              {/* Panel Principal Derecha (Contenido de cada Minijuego) */}
              <div>
                {loadingMinigames ? (
                  <div className="card text-center" style={{ padding: '40px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Cargando datos del minijuego desde Supabase...</p>
                  </div>
                ) : (() => {
              const items = minigamesData[activeMinigameTab] || [];
              
              const filtered = items.filter((item) => {
                if (!minigameSearch) return true;
                const searchLower = minigameSearch.toLowerCase();
                if (activeMinigameTab === 'overwatch' || activeMinigameTab === 'games' || activeMinigameTab === 'history') {
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
                } else if (activeMinigameTab === 'brands') {
                  return (item.brandName || '').toLowerCase().includes(searchLower) ||
                         (item.logoUrl || '').toLowerCase().includes(searchLower);
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
                      
                      if (activeMinigameTab === 'covers' || activeMinigameTab === 'pokemon') {
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
                            {/* Imagen de carátula o Pokémon a la izquierda */}
                            <div style={{ width: '150px', flexShrink: 0, background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                              <img 
                                src={activeMinigameTab === 'pokemon' ? item.pokemonImage : item.image} 
                                alt={activeMinigameTab === 'pokemon' ? 'Pokémon' : 'Carátula'} 
                                style={{ width: '100%', height: '100%', objectFit: activeMinigameTab === 'pokemon' ? 'contain' : 'cover' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
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
                                  {activeMinigameTab === 'pokemon' ? '¿Quién es este Pokémon?' : item.text}
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

                            {(activeMinigameTab === 'overwatch' || activeMinigameTab === 'games' || activeMinigameTab === 'disney' || activeMinigameTab === 'covers' || activeMinigameTab === 'history') && (
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

                            {activeMinigameTab === 'brands' && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ padding: '8px', background: '#fff', borderRadius: '8px', display: 'inline-flex' }}>
                                  <img 
                                    src={item.logoUrl} 
                                    alt={item.brandName} 
                                    style={{ height: '50px', maxWidth: '140px', objectFit: 'contain' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>
                                  {item.brandName}
                                </div>
                              </div>
                            )}

                            {activeMinigameTab === 'music' && (
                              <div style={{ marginBottom: '12px' }}>
                                {item.audioUrl ? (
                                  <audio 
                                    controls 
                                    src={item.audioUrl} 
                                    style={{ width: '100%', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', padding: '2px' }}
                                  />
                                ) : item.youtubeId ? (
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
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Sin vista previa de audio
                                  </span>
                                )}
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
            </div>
          </div>
        ) : view === 'view_pending_authorizations' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver al Inicio
              </button>
            </div>

            <PendingAuthorizationsManager 
              supabase={supabase}
              triggerToast={triggerToast}
              sessionEmail={sessionEmail}
              onGoToPermissions={() => setView('view_user_permissions')}
            />
          </div>
        ) : view === 'view_user_permissions' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
            <UserPermissionsManager 
              supabase={supabase} 
              triggerToast={triggerToast} 
              sessionEmail={sessionEmail}
            />
          </div>
        ) : view === 'view_bot_credentials' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
            <BotCredentialsManager 
              supabase={supabase} 
              triggerToast={triggerToast} 
              isBotConnected={isBotConnected}
              connectTwitchBot={connectTwitchBot}
              disconnectTwitchBot={disconnectTwitchBot}
              enviarMensajeTwitch={enviarMensajeTwitch}
              botLogs={botLogs}
              setBotLogs={setBotLogs}
            />
          </div>
        ) : view === 'view_birthdays' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
            <BirthdaysManager 
              supabase={supabase} 
              triggerToast={triggerToast} 
              enviarMensajeTwitch={enviarMensajeTwitch}
              isBotConnected={isBotConnected}
            />
          </div>
        ) : view === 'view_song_request' ? (
          <div className="builder-view" style={{ maxWidth: '1400px', width: '95%', margin: '0 auto' }}>
            <div className="builder-header animate-slide-down">
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
            <SpotifySongRequestManager 
              supabase={supabase} 
              triggerToast={triggerToast} 
              songRequestCommand={songRequestCommand}
              setSongRequestCommand={setSongRequestCommand}
              isSongRequestEnabled={isSongRequestEnabled}
              setIsSongRequestEnabled={setIsSongRequestEnabled}
            />
          </div>
        ) : view === 'view_tierlists' ? (
          <div className="builder-view" style={{ maxWidth: '100%', margin: 0, padding: '1.5rem 2rem' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
            <TierlistsManager supabase={supabase} triggerToast={triggerToast} />
          </div>
        ) : view === 'view_sync_news' ? (
          <div className="builder-view" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem' }}>
            <div className="builder-header animate-slide-down" style={{ width: '100%', justifyContent: 'flex-start', position: 'relative', minHeight: '40px', marginBottom: '1.5rem' }}>
              <button className="btn-back" onClick={() => setView('home')}>
                <ChevronLeft size={18} /> Volver
              </button>
            </div>
            <SyncNewsManager supabase={supabase} triggerToast={triggerToast} onSyncComplete={fetchLibraryItems} />
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
        host: 'https://www.youtube-nocookie.com',
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
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }
      
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
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
