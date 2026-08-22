import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit3, Search, RotateCcw, Save, Upload, Sparkles, AlertCircle, Check, X, Shield, Sword, Heart } from 'lucide-react';
import { GENSHIN_CHARACTERS } from '../data/GenshinCharacters';
import { WUTHERING_WAVES_CHARACTERS } from '../data/WuwaCharacters';
import { OVERWATCH_CHARACTERS } from '../data/OverwatchCharacters';
import { DBD_CHARACTERS } from '../data/DbdCharacters';

const DEFAULT_TIERLISTS = {
  genshin: GENSHIN_CHARACTERS,
  wuwa: WUTHERING_WAVES_CHARACTERS,
  overwatch: OVERWATCH_CHARACTERS,
  dbd: DBD_CHARACTERS
};

const TABS = [
  { id: 'genshin', label: 'Genshin Impact', color: '#e5c14f', icon: '🌟' },
  { id: 'wuwa', label: 'Wuthering Waves', color: '#38bdf8', icon: '🌀' },
  { id: 'overwatch', label: 'Overwatch', color: '#f97316', icon: '⚔️' },
  { id: 'dbd', label: 'Dead by Daylight', color: '#ef4444', icon: '💀' }
];

const GAME_OPTIONS = {
  genshin: {
    elements: ['Anemo', 'Geo', 'Electro', 'Dendro', 'Hydro', 'Pyro', 'Cryo'],
    weapons: ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'],
    elementLabel: 'Elemento',
    weaponLabel: 'Tipo de Arma'
  },
  wuwa: {
    elements: ['Glacio', 'Fusion', 'Electro', 'Aero', 'Spectro', 'Havoc'],
    weapons: ['Sword', 'Broadblade', 'Pistols', 'Gauntlets', 'Rectifier'],
    elementLabel: 'Elemento',
    weaponLabel: 'Tipo de Arma'
  },
  overwatch: {
    elements: ['Tank', 'Damage', 'Support'],
    weapons: ['Overwatch', 'Talon', 'Neutral'],
    elementLabel: 'Rol',
    weaponLabel: 'Facción'
  },
  dbd: {
    elements: ['Survivor', 'Killer'],
    weapons: ['Original', 'Licenciado'],
    elementLabel: 'Bando',
    weaponLabel: 'Origen'
  }
};

export function getCharacterImageUrl(imgUrl) {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:') || imgUrl.startsWith('blob:')) {
    return imgUrl;
  }
  const cleanPath = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
  // Primary: Production website domain, fallback to raw github
  return `https://tokkii.online${cleanPath}`;
}

export default function TierlistsManager({ supabase, triggerToast }) {
  const [activeTab, setActiveTab] = useState('genshin');
  const [tierlistsData, setTierlistsData] = useState(DEFAULT_TIERLISTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [charForm, setCharForm] = useState({
    id: '',
    name: '',
    element: 'Anemo',
    weapon: 'Sword',
    rarity: 5,
    imgUrl: ''
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    fetchTierlistsData();
  }, []);

  useEffect(() => {
    const opts = GAME_OPTIONS[activeTab];
    setCharForm(prev => ({
      ...prev,
      element: opts.elements[0],
      weapon: opts.weapons[0]
    }));
  }, [activeTab]);

  const fetchTierlistsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('minigames_content')
        .select('*')
        .in('game_type', ['tierlist_genshin', 'tierlist_wuwa', 'tierlist_overwatch', 'tierlist_dbd']);

      if (!error && data && data.length > 0) {
        const loaded = { ...DEFAULT_TIERLISTS };
        data.forEach(row => {
          const key = row.game_type.replace('tierlist_', '');
          if (Array.isArray(row.data) && row.data.length > 0) {
            loaded[key] = row.data;
          }
        });
        setTierlistsData(loaded);
      }
    } catch (err) {
      console.error('Error fetching tierlists from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTierlistToSupabase = async (gameKey, list) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('minigames_content')
        .upsert({
          game_type: 'tierlist_' + gameKey,
          data: list,
          updated_at: new Date().toISOString()
        }, { onConflict: 'game_type' });

      if (error) throw error;
      if (triggerToast) triggerToast('💾 Tierlist de ' + gameKey.toUpperCase() + ' guardada con éxito.');
    } catch (err) {
      console.error('Error saving tierlist:', err);
      alert('Error al guardar en Supabase: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    const opts = GAME_OPTIONS[activeTab];
    setEditingCharacter(null);
    setCharForm({
      id: '',
      name: '',
      element: opts.elements[0],
      weapon: opts.weapons[0],
      rarity: 5,
      imgUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (char) => {
    setEditingCharacter(char);
    setCharForm({
      id: char.id,
      name: char.name,
      element: char.element,
      weapon: char.weapon,
      rarity: char.rarity || 5,
      imgUrl: char.imgUrl
    });
    setIsModalOpen(true);
  };

  const handleSaveCharacter = async (e) => {
    e.preventDefault();
    if (!charForm.name.trim()) {
      alert('Por favor introduce el nombre del personaje.');
      return;
    }
    if (!charForm.imgUrl.trim()) {
      alert('Por favor introduce o sube la imagen del personaje.');
      return;
    }

    const currentList = tierlistsData[activeTab] || [];
    let updatedList;

    if (editingCharacter) {
      updatedList = currentList.map(c => c.id === editingCharacter.id ? {
        ...c,
        name: charForm.name.trim(),
        element: charForm.element,
        weapon: charForm.weapon,
        rarity: Number(charForm.rarity),
        imgUrl: charForm.imgUrl.trim()
      } : c);
    } else {
      const genId = charForm.id.trim() || charForm.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const newChar = {
        id: genId,
        name: charForm.name.trim(),
        element: charForm.element,
        weapon: charForm.weapon,
        rarity: Number(charForm.rarity),
        imgUrl: charForm.imgUrl.trim()
      };
      updatedList = [newChar, ...currentList];
    }

    setTierlistsData(prev => ({
      ...prev,
      [activeTab]: updatedList
    }));

    setIsModalOpen(false);
    await saveTierlistToSupabase(activeTab, updatedList);
  };

  const handleDeleteCharacter = async (charId, charName) => {
    if (!window.confirm('¿Estás seguro de eliminar a "' + charName + '" de la Tierlist?')) return;

    const currentList = tierlistsData[activeTab] || [];
    const updatedList = currentList.filter(c => c.id !== charId);

    setTierlistsData(prev => ({
      ...prev,
      [activeTab]: updatedList
    }));

    await saveTierlistToSupabase(activeTab, updatedList);
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('¿Restaurar la Tierlist de ' + activeTab.toUpperCase() + ' a sus personajes base predeterminados?')) return;

    const defaultList = DEFAULT_TIERLISTS[activeTab] || [];
    setTierlistsData(prev => ({
      ...prev,
      [activeTab]: defaultList
    }));

    await saveTierlistToSupabase(activeTab, defaultList);
  };

  const handleUploadImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('clever-api', {
        body: { fileName: file.name, fileType: file.type }
      });
      if (error || !data) throw new Error(error ? error.message : 'Error contactando Edge Function');

      const uploadRes = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadRes.ok) throw new Error('Error al subir a R2: ' + uploadRes.status);

      setCharForm(prev => ({
        ...prev,
        imgUrl: data.finalPublicUrl
      }));
      if (triggerToast) triggerToast('✅ Imagen subida a Cloudflare R2 con éxito');
    } catch (err) {
      console.error(err);
      const localUrl = URL.createObjectURL(file);
      setCharForm(prev => ({
        ...prev,
        imgUrl: localUrl
      }));
      alert('Nota: Se cargó la imagen localmente. Mensaje: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const currentChars = tierlistsData[activeTab] || [];
  const filteredChars = currentChars.filter(c => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) ||
           (c.element || '').toLowerCase().includes(q) ||
           (c.weapon || '').toLowerCase().includes(q);
  });

  const opts = GAME_OPTIONS[activeTab];

  return (
    <div className="tierlists-manager-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={28} color="var(--primary)" /> Contenido Tierlists
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Administra, añade y actualiza los personajes e imágenes de las 4 Tierlists oficiales.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: 4 Tierlist Tabs & Quick Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Tabs Card */}
          <div className="card animate-slide-down" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Seleccionar Tierlist
            </span>

            {TABS.map(tab => {
              const count = (tierlistsData[tab.id] || []).length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '14px 16px',
                    background: isActive ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(168, 85, 247, 0.25))' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-main)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 15px rgba(236, 72, 153, 0.3)' : 'none'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="card animate-slide-down" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Filtro y Restauración
            </span>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar personaje o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', margin: 0, padding: '8px 12px 8px 34px', fontSize: '0.85rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <button
              type="button"
              className="btn-submit"
              style={{ width: '100%', padding: '8px 14px', margin: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.85rem' }}
              onClick={handleResetToDefault}
              disabled={isSaving}
            >
              <RotateCcw size={14} style={{ marginRight: '6px', display: 'inline' }} /> Restaurar Defectos
            </button>
          </div>
        </div>

        {/* Right Column: Complete Vertical Single-View of Characters */}
        <div className="card animate-slide-down" style={{ padding: '24px', minHeight: '650px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{TABS.find(t => t.id === activeTab)?.icon}</span>
                <span>Personajes de {TABS.find(t => t.id === activeTab)?.label}</span>
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mostrando {filteredChars.length} de {currentChars.length} personajes
              </span>
            </div>

            <button
              type="button"
              className="btn-submit"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleOpenAddModal}
            >
              <Plus size={16} /> Añadir a esta Tierlist
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Cargando personajes desde la base de datos...
            </div>
          ) : filteredChars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No se encontraron personajes que coincidan con la búsqueda.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '16px',
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto',
              paddingRight: '6px'
            }}>
              {filteredChars.map((char) => {
                return (
                  <div
                    key={char.id}
                    className="card"
                    style={{
                      padding: '14px',
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: char.rarity === 5 ? '1px solid rgba(229, 193, 79, 0.35)' : '1px solid rgba(184, 116, 236, 0.25)',
                      borderRadius: '14px',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'rgba(0,0,0,0.4)',
                      border: char.rarity === 5 ? '2px solid #e5c14f' : '2px solid #b874ec',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                    }}>
                      <img
                        src={getCharacterImageUrl(char.imgUrl)}
                        alt={char.name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          const cleanPath = char.imgUrl.startsWith('/') ? char.imgUrl : `/${char.imgUrl}`;
                          e.target.src = `https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public${cleanPath}`;
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={char.name}>
                        {char.name}
                      </h4>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(236, 72, 153, 0.15)',
                          color: '#ec4899',
                          border: '1px solid rgba(236, 72, 153, 0.3)'
                        }}>
                          {char.element}
                        </span>

                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)'
                        }}>
                          {char.weapon}
                        </span>

                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: char.rarity === 5 ? 'rgba(229, 193, 79, 0.15)' : 'rgba(184, 116, 236, 0.15)',
                          color: char.rarity === 5 ? '#e5c14f' : '#b874ec'
                        }}>
                          {char.rarity}★
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: 'auto', paddingTop: '8px' }}>
                      <button
                        type="button"
                        className="btn-submit"
                        style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        onClick={() => handleOpenEditModal(char)}
                      >
                        <Edit3 size={13} /> Editar
                      </button>

                      <button
                        type="button"
                        className="btn-submit"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleDeleteCharacter(char.id, char.name)}
                        title="Eliminar personaje"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Añadir / Editar Personaje */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5000,
            padding: '20px'
          }}
        >
          <div
            className="card animate-modal-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              borderRadius: '16px',
              border: '1px solid var(--primary)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--primary)" />
                {editingCharacter ? 'Editar Personaje' : 'Añadir Nuevo Personaje'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCharacter} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Name */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Nombre del Personaje</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: D.Mon, Alyosha, Odette, etc."
                  value={charForm.name}
                  onChange={(e) => setCharForm({ ...charForm, name: e.target.value })}
                  required
                />
              </div>

              {/* Image Input & Uploader */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Imagen del Personaje (Ruta local o URL de R2)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: /Overwatch/D.Mon.png o https://..."
                  value={charForm.imgUrl}
                  onChange={(e) => setCharForm({ ...charForm, imgUrl: e.target.value })}
                  required
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <label
                    className="btn-submit"
                    style={{
                      width: 'auto',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                      background: 'rgba(236,72,153,0.15)',
                      border: '1px solid rgba(236,72,153,0.35)',
                      color: 'var(--primary)',
                      margin: 0
                    }}
                  >
                    <Upload size={14} /> {isUploadingImage ? 'Subiendo...' : 'Subir archivo de imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImageFile}
                      style={{ display: 'none' }}
                      disabled={isUploadingImage}
                    />
                  </label>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Sube a Cloudflare R2 o usa una ruta como /Overwatch/D.Mon.png
                  </small>
                </div>

                {/* Preview Image */}
                {charForm.imgUrl && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px' }}>
                    <img
                      src={getCharacterImageUrl(charForm.imgUrl)}
                      alt="Preview"
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--primary)' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        const cleanPath = charForm.imgUrl.startsWith('/') ? charForm.imgUrl : `/${charForm.imgUrl}`;
                        e.target.src = `https://raw.githubusercontent.com/WebTokkii/tokkii-web/main/public${cleanPath}`;
                      }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>Vista Previa de Imagen</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{charForm.imgUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Element / Role Selection */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>{opts.elementLabel}</label>
                <select
                  className="form-control"
                  value={charForm.element}
                  onChange={(e) => setCharForm({ ...charForm, element: e.target.value })}
                >
                  {opts.elements.map(el => (
                    <option key={el} value={el}>{el}</option>
                  ))}
                </select>
              </div>

              {/* Weapon / Faction Selection */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>{opts.weaponLabel}</label>
                <select
                  className="form-control"
                  value={charForm.weapon}
                  onChange={(e) => setCharForm({ ...charForm, weapon: e.target.value })}
                >
                  {opts.weapons.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Rarity Selection */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Rareza</label>
                <select
                  className="form-control"
                  value={charForm.rarity}
                  onChange={(e) => setCharForm({ ...charForm, rarity: Number(e.target.value) })}
                >
                  <option value={5}>5 Estrellas (Dorado / Especial)</option>
                  <option value={4}>4 Estrellas (Morado / Estándar)</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-submit"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', flex: 1 }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  style={{ background: 'var(--primary)', color: '#fff', flex: 1 }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : editingCharacter ? 'Guardar Cambios' : 'Añadir Personaje'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
