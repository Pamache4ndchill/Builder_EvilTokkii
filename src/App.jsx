import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, Type, Trash2, Send, LayoutTemplate, Newspaper, FilePlus, ChevronLeft, Bold, Italic, Underline, List, ListOrdered, RemoveFormatting, Calendar, Users, Gift, Save, Lock, AlertCircle, LogOut, Copy, ChevronDown, ChevronUp, Gamepad2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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
  const [sessionPermissions, setSessionPermissions] = useState(localStorage.getItem('builder_permissions') || '*');
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
    return sessionPermissions === requiredPermission;
  };

  const restrictedNavigate = (targetView, requiredPermission) => {
    if (hasAccess(requiredPermission)) {
      if (targetView === 'create_content_item_event') {
        resetItemForm('evento');
        setView('create_content_item');
      } else if (targetView === 'create_content_item_sorteo') {
        resetItemForm('sorteo');
        setView('create_content_item');
      } else {
        setView(targetView);
      }
    } else {
      triggerToast("⚠️ Acceso restringido para tu cuenta.");
    }
  };

  const [view, setView] = useState('home'); // 'home' or 'create'
  
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
    normas: []
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
          .select('username, permissions')
          .eq('email', sessionEmail)
          .single();
        
        if (!error && data) {
          if (!data.username) setNeedsUsername(true);
          else setSessionUsername(data.username);
          
          setSessionPermissions(data.permissions || '*');
          localStorage.setItem('builder_permissions', data.permissions || '*');
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
      const { data, error } = await supabase
        .from('whitelist')
        .select('email, username, permissions')
        .eq('email', loginEmail.trim().toLowerCase())
        .single();
        
      if (error || !data) {
        setLoginError('Vaya, este correo no parece tener permiso de acceso.');
        setIsSubmitting(false);
        return;
      }
      
      localStorage.setItem('builder_email', data.email);
      localStorage.setItem('builder_permissions', data.permissions || '*');
      setSessionEmail(data.email);
      setSessionPermissions(data.permissions || '*');
      
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
    setItemData({ titulo: '', descripcion: '', detalles: '', fecha: '', imagen: '', estado: 'proximo', premios: '', normas: [] });
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
      normas: itemData.normas || []
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
      normas: itemData.normas
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

    if (!isAuthenticated || needsUsername) {
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

  return (
    <div className="app-layout">
      {view !== 'home' && <CloudflareImageGenerator />}
      
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

      {/* SIDEBAR ZONE */}
      {view !== 'home' && view !== 'view_most_streamed' && (() => {
        const activeList = view === 'view_participations' ? eventsList : 
                           view === 'view_twitch' ? [...new Set((twitchList || []).map(t => t.reward_name))].map(name => ({ id: name, titulo: name, tipo: 'Canje Twitch', created_at: new Date() })) :
                           view === 'create' ? savedNews : 
                           libraryItems.filter(item => {
                             const type = (item.tipo || '').toLowerCase().trim();
                             const currentType = (tipoItem || '').toLowerCase().trim();
                             if (currentType === 'sorteo') return type === 'sorteo';
                             if (currentType === 'evento') return type === 'evento';
                             return true;
                           });

        const iconName = view === 'view_participations' ? <Users size={24} color="var(--primary)" /> :
                         view === 'view_twitch' ? <LayoutTemplate size={24} color="var(--primary)" /> :
                         view === 'create' ? <Newspaper size={24} color="var(--primary)" /> : 
                         tipoItem === 'sorteo' ? <Gift size={24} color="var(--primary)" /> : 
                         <Calendar size={24} color="var(--primary)" />;

        const titleText = view === 'view_participations' ? 'Librería de Eventos' :
                          view === 'view_twitch' ? 'Canjes por Tipo' :
                          view === 'create' ? 'Noticias' : 
                          tipoItem === 'sorteo' ? 'Sorteos' : 'Eventos';

        return (
          <aside className="sidebar animate-slide-down">
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {iconName}
                <h2>{titleText} ({(activeList || []).length})</h2>
              </div>
              {view !== 'view_participations' && view !== 'view_twitch' && (
                <button 
                  className="btn-add" 
                  title={`Crear nuevo ${tipoItem}`}
                  onClick={() => {
                    setEditingItemId(null);
                    if (view === 'create') {
                      setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] });
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
              {isLoadingLibrary && view !== 'create' ? (
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
                (activeList || []).map(item => (
                  <div 
                    key={item.id} 
                    className={`news-item animate-slide-down ${ (selectedEventId === item.id || selectedRewardName === item.id) ? 'active' : ''}`} 
                    style={{ 
                      cursor: 'pointer',
                      borderLeft: (selectedEventId === item.id || selectedRewardName === item.id) ? '4px solid var(--primary)' : 'none',
                      backgroundColor: (selectedEventId === item.id || selectedRewardName === item.id) ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                    }} 
                    onClick={() => { 
                      if (view === 'view_participations') {
                        setSelectedEventId(item.id);
                      } else if (view === 'view_twitch') {
                        setSelectedRewardName(item.id);
                      } else {
                        handleEditItem(item.id, view === 'create' ? 'noticia' : null);
                      }
                    }}
                  >
                    {view !== 'view_participations' && view !== 'view_twitch' && (
                      <button 
                        className="btn-delete-news" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                        title={view === 'create' ? "Eliminar" : "Eliminar de Supabase"}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="news-item-title" style={{ paddingRight: '20px' }}>{item.titulo || item.title}</div>
                    <div className="news-item-date" style={{ textTransform: 'capitalize' }}>
                      {view === 'view_twitch' ? 'Categoría Twitch' : view === 'create' ? `Noticia • ${item.author || 'Sin Autor'}` : (item.tipo || 'Objeto')} • {view === 'view_twitch' ? 'Activo' : new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric'})}
                    </div>
                  </div>
                ))
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
            
            <div className="dashboard-grid">
              <div 
                className={`dashboard-card ${!hasAccess('news_only') && sessionPermissions !== '*' ? 'restricted' : ''}`} 
                onClick={() => { setEditingItemId(null); setNewsData({ title: '', subtitle: '', header_image_url: '', content: [] }); restrictedNavigate('create', 'news_only'); }}
              >
                <div className="icon-bg">
                  <FilePlus size={36} />
                </div>
                <h3>Crear Noticia</h3>
                <p>Genera un nuevo artículo inmersivo con imágenes y bloques de texto para la vista principal.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('events_only') && sessionPermissions !== '*' ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('create_content_item_event', 'events_only')}
              >
                <div className="icon-bg">
                  <Calendar size={36} />
                </div>
                <h3>Crear Evento</h3>
                <p>Configura nuevos eventos interactivos con sus normas, detalles, premios y fechas.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('giveaways_only') && sessionPermissions !== '*' ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('create_content_item_sorteo', 'giveaways_only')}
              >
                <div className="icon-bg">
                  <Gift size={36} />
                </div>
                <h3>Crear Sorteo</h3>
                <p>Genera nuevos sorteos para la comunidad, definiendo las condiciones y recompensas.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('admin') && sessionPermissions !== '*' ? 'restricted' : ''}`} 
                onClick={() => restrictedNavigate('view_participations', 'admin')}
              >
                <div className="icon-bg">
                  <Users size={36} />
                </div>
                <h3>Gestionar Participaciones</h3>
                <p>Revisa y gestiona los usuarios inscritos a los diferentes eventos y sorteos activos.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('admin') && sessionPermissions !== '*' ? 'restricted' : ''}`} 
                style={{ border: sessionPermissions === '*' || sessionPermissions === 'admin' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_twitch', 'admin')}
              >
                <div className="icon-bg" style={{ background: sessionPermissions === '*' || sessionPermissions === 'admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: sessionPermissions === '*' || sessionPermissions === 'admin' ? '#A855F7' : 'var(--primary)' }}>
                  <LayoutTemplate size={36} />
                </div>
                <h3 style={{ color: sessionPermissions === '*' || sessionPermissions === 'admin' ? '#A855F7' : 'var(--text-main)' }}>Canjes de Twitch</h3>
                <p>Monitorea y organiza los reclamos de recompensas de puntos de canal vinculados.</p>
              </div>

              <div 
                className={`dashboard-card ${!hasAccess('admin') && sessionPermissions !== '*' ? 'restricted' : ''}`} 
                style={{ border: sessionPermissions === '*' || sessionPermissions === 'admin' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px dashed var(--border-color)' }} 
                onClick={() => restrictedNavigate('view_most_streamed', 'admin')}
              >
                <div className="icon-bg" style={{ background: sessionPermissions === '*' || sessionPermissions === 'admin' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(15, 23, 42, 0.5)', color: 'var(--primary)' }}>
                  <Gamepad2 size={36} />
                </div>
                <h3 style={{ color: 'var(--text-main)' }}>Lo mas Streameable</h3>
                <p>Gestiona los 6 juegos destacados que aparecen en la sección principal de la web.</p>
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
                  <label className="form-label">Título del {tipoItem}</label>
                  <input type="text" name="titulo" className="form-control" value={itemData.titulo} onChange={handleItemChange} required />
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
                  <label className="form-label">Fecha Estimada</label>
                  <input type="text" name="fecha" className="form-control" placeholder="Ej: 20 de Octubre 2026" value={itemData.fecha} onChange={handleItemChange} />
                </div>
                 <div className="form-group">
                  <label className="form-label">Imagen principal (Pega el enlace de R2)</label>
                  <input type="url" name="imagen" className="form-control" placeholder={`${CLOUDFLARE_R2_BASE_URL}/imagen.png`} value={itemData.imagen} onChange={handleItemChange} required />
                  <AdvancedImagePreview imageUrl={itemData.imagen} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select name="estado" className="form-control" value={itemData.estado} onChange={handleItemChange}>
                    <option value="activo">Activo</option>
                    <option value="proximo">Próximo</option>
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

export default App;
