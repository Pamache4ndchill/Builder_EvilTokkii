import React, { useState, useEffect } from 'react';
import { 
    Settings, Plus, Trash2, Edit2, Search, Sparkles, Download, 
    Play, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, 
    RefreshCw, Layers, Zap, MessageSquare, Copy, Shield, HelpCircle, FileText
} from 'lucide-react';

// PRESETS OFICIALES RECOMENDADOS PARA TWITCH
const OFFICIAL_PRESETS = [
    // UTILIDAD
    {
        command_name: '!web',
        template_type: 'action',
        category: 'Utilidad',
        description: 'Enlace a la web oficial de Tokkii con minijuegos y sorteos',
        active: true,
        responses: ['🌐 ¡Visita nuestra web oficial con minijuegos y sorteos diarios: https://tokkii.online!']
    },
    {
        command_name: '!discord',
        template_type: 'action',
        category: 'Utilidad',
        description: 'Enlace de invitación al servidor oficial de Discord',
        active: true,
        responses: ['👾 ¡Únete a nuestra comunidad oficial de Discord para jugar y no perderte ningún stream: https://discord.gg/eviltokkii!']
    },
    {
        command_name: '!redes',
        template_type: 'action',
        category: 'Utilidad',
        description: 'Enlaces a todas las redes sociales de EvilTokkii',
        active: true,
        responses: ['📱 Síguenos en todas las redes sociales: TikTok, YouTube e Instagram: https://linktr.ee/eviltokkii ✨']
    },
    {
        command_name: '!horario',
        template_type: 'action',
        category: 'Utilidad',
        description: 'Horarios habituales de las transmisiones en vivo',
        active: true,
        responses: ['📅 ¡Hacemos directos habitualmente de Lunes a Viernes a las 20:00 hrs (GMT-4)! Activa la campanita 🔔']
    },
    {
        command_name: '!lurk',
        template_type: 'action',
        category: 'Utilidad',
        description: 'Aviso de espectador en modo lurk / de fondo',
        active: true,
        responses: ['👀 {user} entra en modo lurk/fantasmita pero sigue apoyando con todo su corazón. ¡Muchas gracias por el lurk! 💜']
    },
    {
        command_name: '!comandos',
        template_type: 'action',
        category: 'Utilidad',
        description: 'Lista de comandos principales disponibles en el chat',
        active: true,
        responses: ['📜 Comandos interactivos: !pelea, !abrazo, !beso, !amor, !toxicidad, !facha, !8ball, !ruletarusa, !web, !discord']
    },

    // DUELOS Y COMBATES (VERSUS)
    {
        command_name: '!pelea',
        template_type: 'versus',
        category: 'Duelos',
        description: 'Duelo de espadas aleatorio entre dos usuarios',
        active: true,
        responses: [
            '⚔️ {user} reta a {target} a una dura pelea de espadas. ¡Tras chocar acero fuertemente, {winner} vence heroicamente dejando a {loser} en el suelo!',
            '⚔️ {user} y {target} inician un intenso combate cuerpo a cuerpo... ¡{winner} conecta un golpe fulminante y derrota a {loser}!'
        ]
    },
    {
        command_name: '!cachetada',
        template_type: 'versus',
        category: 'Duelos',
        description: 'Desafío de bofetadas entre viewers',
        active: true,
        responses: [
            '🥊 {user} le suelta una épica bofetada con guante blanco a {target} desafiándole a un duelo... ¡y {winner} noquea a {loser} en segundos!'
        ]
    },

    // INTERACCIÓN SOCIAL (ACTION)
    {
        command_name: '!abrazo',
        template_type: 'action',
        category: 'Social',
        description: 'Envía un cálido abrazo a otro usuario o al streamer',
        active: true,
        responses: [
            '🤗 {user} le da un fuerte, cálido y apapachador abrazo a {target}! <3',
            '💖 {user} corre hacia {target} y le da el abrazo más cariñoso de la galaxia! ✨'
        ]
    },
    {
        command_name: '!beso',
        template_type: 'action',
        category: 'Social',
        description: 'Envía un tierno beso en la mejilla a alguien del chat',
        active: true,
        responses: [
            '💋 {user} se acerca suavemente y le planta un tierno beso en la mejilla a {target}! (˶ᵔ ᵕ ᵔ˶)'
        ]
    },
    {
        command_name: '!pat',
        template_type: 'action',
        category: 'Social',
        description: 'Acariciar la cabeza a otro usuario',
        active: true,
        responses: [
            '🥰 {user} le hace suaves palmaditas y caricias en la cabeza a {target}. ¡Buen trabajo!'
        ]
    },

    // MEDIDORES Y PORCENTAJES
    {
        command_name: '!amor',
        template_type: 'love',
        category: 'Medidores',
        description: 'Calcula el porcentaje de afinidad amorosa entre dos personas',
        active: true,
        responses: [
            '💖 ¡El termómetro del amor dice que {user} y {target} son un {percentage}% compatibles! ¿Habrá boda en el canal? 💍'
        ]
    },
    {
        command_name: '!toxicidad',
        template_type: 'level',
        category: 'Medidores',
        description: 'Escanea el porcentaje de toxicidad de un usuario',
        active: true,
        responses: [
            '☢️ Escáner de veneno activado para {target}... ¡Nivel de toxicidad detectado: {level}%! 🧪'
        ]
    },
    {
        command_name: '!facha',
        template_type: 'level',
        category: 'Medidores',
        description: 'Calcula el nivel de facha y estilo de un usuario',
        active: true,
        responses: [
            '😎 Escaneando estilo y elegancia de {target}... ¡Nivel de facha detectado: {level}%! Qué facherito 🔥'
        ]
    },
    {
        command_name: '!guapo',
        template_type: 'level',
        category: 'Medidores',
        description: 'Medidor de belleza visual',
        active: true,
        responses: [
            '✨ Analizando los rasgos faciales de {target}... ¡Nivel de guapura detectado: {level}%! Belleza pura 💖'
        ]
    },
    {
        command_name: '!iq',
        template_type: 'level',
        category: 'Medidores',
        description: 'Calcula el coeficiente intelectual estimado',
        active: true,
        responses: [
            '🧠 Analizando neuronas de {target}... ¡Coeficiente intelectual estimado: {level} IQ! 🧐'
        ]
    },

    // JUEGOS Y ALEATORIEDAD
    {
        command_name: '!8ball',
        template_type: 'random',
        category: 'Juegos',
        description: 'Bola 8 mágica que responde preguntas de Sí/No',
        active: true,
        responses: [
            '🔮 La bola mágica responde: ¡Sí, definitivamente!',
            '🔮 La bola mágica responde: Mis fuentes dicen que no.',
            '🔮 La bola mágica responde: Es muy probable.',
            '🔮 La bola mágica responde: Mejor no te lo digo ahora...',
            '🔮 La bola mágica responde: Sin ninguna duda.',
            '🔮 La bola mágica responde: Las señales apuntan a que sí.',
            '🔮 La bola mágica responde: No cuentes con ello.'
        ]
    },
    {
        command_name: '!ruletarusa',
        template_type: 'roulette',
        category: 'Juegos',
        description: 'Juego de ruleta rusa con posibilidades de sobrevivir o caer',
        active: true,
        responses: [
            '🔫 {user} toma el revólver y jala del gatillo... ¡CLIC! El tambor giró en vacío. ¡Te has salvado! 😌✨',
            '🔫 {user} toma el revólver y jala del gatillo... ¡CLIC! Nada ocurrió. La suerte sigue de tu lado. 🍀',
            '🔫 {user} toma el revólver y jala del gatillo... ¡BANG! 💥 El arma se disparó. Caes eliminado del combate. 💀'
        ]
    }
];

export default function ChatCommandsManager({ 
    supabase, 
    triggerToast, 
    chatCommands = [], 
    fetchChatCommands, 
    handleDeleteChatCommand,
    enviarMensajeTwitch, 
    isBotConnected 
}) {
    // Search & Category Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

    // Form State for Create / Edit
    const [editingId, setEditingId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formType, setFormType] = useState('action');
    const [formActive, setFormActive] = useState(true);
    const [formResponses, setFormResponses] = useState(['']);

    // Import State
    const [importTab, setImportTab] = useState('streamelements'); // 'streamelements' | 'raw'
    const [seChannel, setSeChannel] = useState('eviltokkii');
    const [isFetchingSe, setIsFetchingSe] = useState(false);
    const [fetchedSeCommands, setFetchedSeCommands] = useState([]);
    const [selectedSeCommands, setSelectedSeCommands] = useState(new Set());
    const [rawTextImport, setRawTextImport] = useState('');


    // Filtered Commands
    const filteredCommands = chatCommands.filter(cmd => {
        const matchesSearch = cmd.command_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (cmd.description && cmd.description.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesSearch) return false;
        if (categoryFilter === 'all') return true;
        if (categoryFilter === 'active') return isCommandActive(cmd);
        if (categoryFilter === 'inactive') return !isCommandActive(cmd);
        if (categoryFilter === 'versus') return cmd.template_type === 'versus';
        if (categoryFilter === 'action') return cmd.template_type === 'action';
        if (categoryFilter === 'random') return cmd.template_type === 'random' || cmd.template_type === 'roulette';
        if (categoryFilter === 'level') return cmd.template_type === 'level' || cmd.template_type === 'love';
        return true;
    });

    const openCreateModal = (preset = null) => {
        if (preset) {
            setEditingId(null);
            setFormName(preset.command_name);
            setFormDesc(preset.description || '');
            setFormType(preset.template_type || 'action');
            setFormActive(preset.active !== false);
            setFormResponses(preset.responses && preset.responses.length > 0 ? [...preset.responses] : ['']);
        } else {
            setEditingId(null);
            setFormName('');
            setFormDesc('');
            setFormType('action');
            setFormActive(true);
            setFormResponses(['']);
        }
        setIsCreateModalOpen(true);
    };

    const openEditModal = (cmd) => {
        setEditingId(cmd.id);
        setFormName(cmd.command_name);
        setFormDesc(cmd.description || '');
        setFormType(cmd.template_type || 'action');
        setFormActive(cmd.active !== false);
        setFormResponses(cmd.responses && cmd.responses.length > 0 ? [...cmd.responses] : ['']);
        setIsCreateModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e?.preventDefault();
        let cleanName = formName.trim().toLowerCase();
        if (!cleanName.startsWith('!')) cleanName = '!' + cleanName;
        cleanName = cleanName.replace(/\s+/g, '');

        if (!cleanName || cleanName === '!') {
            triggerToast('⚠️ Ingresa un nombre de comando válido (ej: !web).');
            return;
        }

        const validResponses = formResponses.filter(r => r.trim());
        if (validResponses.length === 0) {
            triggerToast('⚠️ Debes añadir al menos una respuesta.');
            return;
        }

        const payload = {
            command_name: cleanName,
            template_type: formType,
            description: formDesc.trim(),
            responses: validResponses
        };
        
        // Update local disabled list based on formActive
        let updatedDisabled = [...disabledCmds];
        if (!formActive) {
            if (!updatedDisabled.includes(cleanName)) updatedDisabled.push(cleanName);
        } else {
            updatedDisabled = updatedDisabled.filter(name => name !== cleanName);
        }
        setDisabledCmds(updatedDisabled);
        localStorage.setItem('twitch_commands_disabled', JSON.stringify(updatedDisabled));

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('chat_commands')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                triggerToast(`✅ Comando ${cleanName} actualizado con éxito.`);
            } else {
                // Check existing
                const existing = chatCommands.find(c => c.command_name === cleanName);
                if (existing) {
                    const { error } = await supabase
                        .from('chat_commands')
                        .update(payload)
                        .eq('id', existing.id);
                    if (error) throw error;
                    triggerToast(`✅ Comando ${cleanName} actualizado.`);
                } else {
                    const { error } = await supabase
                        .from('chat_commands')
                        .insert([payload]);
                    if (error) throw error;
                    triggerToast(`✅ Comando ${cleanName} creado con éxito.`);
                }
            }
            if (fetchChatCommands) fetchChatCommands();
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error('Error saving command:', err);
            triggerToast(`⚠️ Error al guardar: ${err.message}`);
        }
    };

    // Disabled Commands Persisted State (Robust Fallback)
    const [disabledCmds, setDisabledCmds] = useState(() => {
        try {
            const saved = localStorage.getItem('twitch_commands_disabled');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const isCommandActive = (cmd) => {
        if (disabledCmds.includes(cmd.command_name.toLowerCase())) return false;
        if (cmd.active === false) return false;
        return true;
    };

    const handleToggleCommandActive = async (cmd) => {
        const currentActive = isCommandActive(cmd);
        const nextActive = !currentActive;
        const cleanName = cmd.command_name.toLowerCase();

        let updatedDisabled = [...disabledCmds];
        if (!nextActive) {
            if (!updatedDisabled.includes(cleanName)) updatedDisabled.push(cleanName);
        } else {
            updatedDisabled = updatedDisabled.filter(name => name !== cleanName);
        }

        setDisabledCmds(updatedDisabled);
        localStorage.setItem('twitch_commands_disabled', JSON.stringify(updatedDisabled));
        window.dispatchEvent(new Event('storage'));

        triggerToast(nextActive ? `🟢 Comando ${cmd.command_name} activado.` : `⏸️ Comando ${cmd.command_name} pausado.`);

        // Try syncing to Supabase if column exists, silently ignore if not
        try {
            if (cmd.id) {
                await supabase.from('chat_commands').update({ active: nextActive }).eq('id', cmd.id);
            }
        } catch (e) {
            // Silently handled via localStorage
        }
    };

    const handleAddPreset = async (preset) => {
        try {
            const existing = chatCommands.find(c => c.command_name === preset.command_name);
            const payload = {
                command_name: preset.command_name,
                template_type: preset.template_type,
                description: preset.description,
                responses: preset.responses
            };

            if (existing) {
                await supabase.from('chat_commands').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('chat_commands').insert([payload]);
            }
            triggerToast(`⚡ Comando ${preset.command_name} añadido a tu bot.`);
            if (fetchChatCommands) fetchChatCommands();
        } catch (err) {
            console.error('Error adding preset:', err);
            triggerToast(`⚠️ Error al añadir preset: ${err.message}`);
        }
    };

    const handleAddAllPresets = async () => {
        try {
            let addedCount = 0;
            for (const preset of OFFICIAL_PRESETS) {
                const existing = chatCommands.find(c => c.command_name === preset.command_name);
                const payload = {
                    command_name: preset.command_name,
                    template_type: preset.template_type,
                    description: preset.description,
                    responses: preset.responses,
                    active: true
                };
                if (existing) {
                    await supabase.from('chat_commands').update(payload).eq('id', existing.id);
                } else {
                    await supabase.from('chat_commands').insert([payload]);
                }
                addedCount++;
            }
            triggerToast(`🎉 ¡${addedCount} comandos predefinidos añadidos con éxito!`);
            if (fetchChatCommands) fetchChatCommands();
            setIsPresetsModalOpen(false);
        } catch (err) {
            console.error('Error bulk adding presets:', err);
            triggerToast('⚠️ Error al añadir todos los comandos.');
        }
    };

    // StreamElements API Fetcher
    const fetchStreamElementsCommands = async () => {
        if (!seChannel.trim()) {
            triggerToast('⚠️ Ingresa un nombre de canal de Twitch.');
            return;
        }
        setIsFetchingSe(true);
        try {
            const cleanChannel = seChannel.trim().toLowerCase().replace(/^#/, '');
            const res = await fetch(`https://api.streamelements.com/kappa/v2/bot/commands/${cleanChannel}/public`);
            if (!res.ok) {
                throw new Error(`No se pudieron obtener comandos públicos de ${cleanChannel}. Estado: ${res.status}`);
            }
            const data = await res.json();
            
            // Format StreamElements commands
            const formatted = data.map(item => {
                let text = item.reply || item.response || '';
                // Convert SE variables to Tokkii variables
                text = text
                    .replace(/\${user\.name}|\${user}|\$\(user\)/gi, '{user}')
                    .replace(/\${touser\.name}|\${touser}|\$\(touser\)/gi, '{target}')
                    .replace(/\${1}|\${query}/gi, '{target}')
                    .replace(/\${random\.1-100}|\$\(random\.1-100\)/gi, '{percentage}');

                let cmdName = item.command;
                if (!cmdName.startsWith('!')) cmdName = '!' + cmdName;

                return {
                    command_name: cmdName,
                    description: item.description || `Comando importado de StreamElements (${cmdName})`,
                    template_type: 'action',
                    responses: [text],
                    active: item.enabled !== false
                };
            }).filter(c => c.responses[0] && c.responses[0].length > 0);

            setFetchedSeCommands(formatted);
            setSelectedSeCommands(new Set(formatted.map(c => c.command_name)));
            triggerToast(`📥 Se encontraron ${formatted.length} comandos en StreamElements.`);
        } catch (err) {
            console.error('Error fetching SE commands:', err);
            triggerToast(`⚠️ Error: ${err.message}`);
        } finally {
            setIsFetchingSe(false);
        }
    };

    const handleImportSelectedSe = async () => {
        const toImport = fetchedSeCommands.filter(c => selectedSeCommands.has(c.command_name));
        if (toImport.length === 0) {
            triggerToast('⚠️ No has seleccionado ningún comando para importar.');
            return;
        }

        try {
            let count = 0;
            for (const cmd of toImport) {
                const existing = chatCommands.find(c => c.command_name === cmd.command_name);
                const payload = {
                    command_name: cmd.command_name,
                    template_type: cmd.template_type,
                    description: cmd.description,
                    responses: cmd.responses,
                    active: cmd.active
                };
                if (existing) {
                    await supabase.from('chat_commands').update(payload).eq('id', existing.id);
                } else {
                    await supabase.from('chat_commands').insert([payload]);
                }
                count++;
            }
            triggerToast(`🎉 ¡${count} comandos de StreamElements importados con éxito!`);
            if (fetchChatCommands) fetchChatCommands();
            setIsImportModalOpen(false);
            setFetchedSeCommands([]);
        } catch (err) {
            console.error('Error importing SE commands:', err);
            triggerToast('⚠️ Error al importar comandos.');
        }
    };

    // Raw Text / Nightbot Parser
    const handleParseRawText = async () => {
        if (!rawTextImport.trim()) {
            triggerToast('⚠️ Pega una lista de comandos o JSON.');
            return;
        }

        try {
            const lines = rawTextImport.trim().split('\n');
            const parsed = [];

            // Try JSON first
            if (rawTextImport.trim().startsWith('[') || rawTextImport.trim().startsWith('{')) {
                try {
                    const parsedJson = JSON.parse(rawTextImport);
                    const arrayData = Array.isArray(parsedJson) ? parsedJson : (parsedJson.commands || [parsedJson]);
                    for (const item of arrayData) {
                        let name = item.name || item.command || item.command_name || '';
                        let resp = item.response || item.reply || item.message || '';
                        if (name && resp) {
                            if (!name.startsWith('!')) name = '!' + name;
                            parsed.push({
                                command_name: name.toLowerCase().trim(),
                                description: item.description || `Comando importado (${name})`,
                                template_type: 'action',
                                responses: [resp.trim()],
                                active: true
                            });
                        }
                    }
                } catch (e) {
                    // Fallback to line by line parser
                }
            }

            // Line by line parser (e.g. "!discord https://discord.gg/..." or "!redes -> Sigue a Tokkii")
            if (parsed.length === 0) {
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
                    
                    const match = trimmed.match(/^(![a-zA-Z0-9_-]+)\s*(?:[-:>])?\s*(.+)$/);
                    if (match) {
                        const name = match[1].toLowerCase();
                        let resp = match[2].trim();
                        // Transform variables
                        resp = resp
                            .replace(/\$\(user\)|\$\{user\}/gi, '{user}')
                            .replace(/\$\(touser\)|\$\{touser\}/gi, '{target}')
                            .replace(/\$\(query\)|\$\{query\}/gi, '{target}');

                        parsed.push({
                            command_name: name,
                            description: `Comando importado (${name})`,
                            template_type: 'action',
                            responses: [resp],
                            active: true
                        });
                    }
                }
            }

            if (parsed.length === 0) {
                triggerToast('⚠️ No se reconocieron comandos válidos. Formato: "!comando respuesta"');
                return;
            }

            let count = 0;
            for (const cmd of parsed) {
                const existing = chatCommands.find(c => c.command_name === cmd.command_name);
                const payload = {
                    command_name: cmd.command_name,
                    template_type: cmd.template_type,
                    description: cmd.description,
                    responses: cmd.responses,
                    active: true
                };
                if (existing) {
                    await supabase.from('chat_commands').update(payload).eq('id', existing.id);
                } else {
                    await supabase.from('chat_commands').insert([payload]);
                }
                count++;
            }

            triggerToast(`🎉 ¡${count} comandos procesados e importados con éxito!`);
            if (fetchChatCommands) fetchChatCommands();
            setIsImportModalOpen(false);
            setRawTextImport('');
        } catch (err) {
            console.error('Error parsing raw text:', err);
            triggerToast('⚠️ Error al procesar el texto.');
        }
    };

    // Test Simulator
    const handleSimulateCommand = (cmd) => {
        if (!cmd.responses || cmd.responses.length === 0) return;
        const resps = cmd.responses;
        const rIndex = Math.floor(Math.random() * resps.length);
        let text = resps[rIndex];

        const dummyUser = 'ViewerAfortunado';
        const dummyTarget = 'EvilTokkii';
        const isUserWinner = Math.random() < 0.5;
        const winner = isUserWinner ? dummyUser : dummyTarget;
        const loser = isUserWinner ? dummyTarget : dummyUser;
        const percentage = Math.floor(Math.random() * 101);
        const level = Math.floor(Math.random() * 101);

        const simulated = text
            .replace(/{user}/g, `@${dummyUser}`)
            .replace(/{caller}/g, `@${dummyUser}`)
            .replace(/{target}/g, `@${dummyTarget}`)
            .replace(/{winner}/g, `@${winner}`)
            .replace(/{loser}/g, `@${loser}`)
            .replace(/{percentage}/g, `${percentage}`)
            .replace(/{level}/g, `${level}`);

        // Send live to Twitch if bot is connected
        if (isBotConnected && enviarMensajeTwitch) {
            enviarMensajeTwitch(simulated);
            triggerToast(`💬 Enviado al chat: ${cmd.command_name}`);
        } else {
            triggerToast(`🧪 Test ${cmd.command_name}: "${simulated.length > 50 ? simulated.substring(0, 50) + '...' : simulated}"`);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            
            {/* 1. CABECERA PRINCIPAL */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem 1.8rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 10px 30px -8px rgba(16, 185, 129, 0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.4)'
                    }}>
                        <Settings size={26} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#F8FAFC', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Comandos del Chat
                            <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', borderRadius: '12px', fontWeight: 600 }}>
                                {chatCommands.length} {chatCommands.length === 1 ? 'comando' : 'comandos'}
                            </span>
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                            Crea, activa y gestiona respuestas automatizadas e interactivas para tu bot de Twitch.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Botón Importar StreamElements / Nightbot */}
                    <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38BDF8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Download size={17} />
                        Importar (StreamElements / Nightbot)
                    </button>

                    {/* Botón Presets Oficiales */}
                    <button
                        type="button"
                        onClick={() => setIsPresetsModalOpen(true)}
                        style={{
                            background: 'rgba(168, 85, 247, 0.12)',
                            color: '#C084FC',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Sparkles size={17} />
                        Biblioteca de Presets
                    </button>

                    {/* Botón Crear Nuevo */}
                    <button
                        type="button"
                        onClick={() => openCreateModal()}
                        style={{
                            background: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={18} />
                        Nuevo Comando
                    </button>
                </div>
            </div>

            {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                {/* Buscador */}
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                    <input
                        type="text"
                        placeholder="Buscar por comando o descripción (ej: !pelea, discord)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '9px 12px 9px 36px',
                            color: '#F8FAFC',
                            fontSize: '0.88rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Filtro por Categorías */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'active', label: '🟢 Activos' },
                        { id: 'inactive', label: '⏸️ Pausados' },
                        { id: 'versus', label: '⚔️ Duelos' },
                        { id: 'action', label: '🤗 Acciones' },
                        { id: 'random', label: '🔮 8ball/Ruleta' },
                        { id: 'level', label: '📊 Medidores %' }
                    ].map(f => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setCategoryFilter(f.id)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: categoryFilter === f.id ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                                background: categoryFilter === f.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                                color: categoryFilter === f.id ? '#10B981' : '#94A3B8',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. LISTADO DE COMANDOS */}
            {filteredCommands.length === 0 ? (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '3.5rem 2rem',
                    textAlign: 'center'
                }}>
                    <Settings size={44} style={{ color: '#64748B', marginBottom: '12px' }} />
                    <h3 style={{ margin: '0 0 8px', color: '#F8FAFC', fontSize: '1.2rem' }}>
                        {searchQuery ? 'No se encontraron comandos coincidentes' : 'Aún no tienes comandos configurados'}
                    </h3>
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                        Puedes crear tu primer comando personalizado o cargar toda la biblioteca de comandos predefinidos con 1 solo clic.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setIsPresetsModalOpen(true)}
                            style={{
                                background: 'rgba(168, 85, 247, 0.15)',
                                color: '#C084FC',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                            Cargar Biblioteca de Presets
                        </button>
                        <button
                            type="button"
                            onClick={() => openCreateModal()}
                            style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            + Crear Comando
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '1.2rem'
                }}>
                    {filteredCommands.map(cmd => {
                        const isCmdActive = isCommandActive(cmd);
                        const typeLabel = 
                            cmd.template_type === 'versus' ? '⚔️ Duelo / Versus' :
                            cmd.template_type === 'action' ? '🤗 Acción / Enlace' :
                            cmd.template_type === 'random' ? '🔮 Decisión Aleatoria' :
                            cmd.template_type === 'love' ? '💖 Medidor de Amor' :
                            cmd.template_type === 'roulette' ? '🔫 Ruleta Rusa' :
                            cmd.template_type === 'level' ? '📊 Medidor de Nivel' : '⚙️ Comando';

                        return (
                            <div
                                key={cmd.id || cmd.command_name}
                                style={{
                                    background: isCmdActive ? 'var(--bg-card)' : 'rgba(15, 23, 42, 0.4)',
                                    border: isCmdActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '14px',
                                    padding: '1.2rem 1.4rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s',
                                    opacity: isCmdActive ? 1 : 0.65,
                                    position: 'relative'
                                }}
                            >
                                <div>
                                    {/* Top Bar of Card */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '1.15rem',
                                                fontWeight: 800,
                                                color: isCmdActive ? '#10B981' : '#94A3B8',
                                                fontFamily: 'monospace'
                                            }}>
                                                {cmd.command_name}
                                            </span>
                                            <span style={{
                                                fontSize: '0.72rem',
                                                background: 'rgba(255, 255, 255, 0.06)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                padding: '2px 7px',
                                                borderRadius: '6px',
                                                color: '#CBD5E1'
                                            }}>
                                                {typeLabel}
                                            </span>
                                        </div>

                                        {/* Switch On/Off */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleCommandActive(cmd)}
                                            title={isCmdActive ? 'Pausar comando' : 'Activar comando'}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: 0
                                            }}
                                        >
                                            {isCmdActive ? (
                                                <ToggleRight size={28} color="#10B981" />
                                            ) : (
                                                <ToggleLeft size={28} color="#64748B" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Description */}
                                    {cmd.description && (
                                        <p style={{ margin: '0 0 12px', color: '#94A3B8', fontSize: '0.84rem', lineHeight: '1.4' }}>
                                            {cmd.description}
                                        </p>
                                    )}

                                    {/* Response Preview Box */}
                                    <div style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '8px',
                                        padding: '9px 12px',
                                        marginBottom: '14px',
                                        fontSize: '0.82rem',
                                        color: '#E2E8F0',
                                        lineHeight: '1.4',
                                        maxHeight: '75px',
                                        overflowY: 'auto'
                                    }}>
                                        {cmd.responses && cmd.responses.length > 1 ? (
                                            <div>
                                                <span style={{ color: '#38BDF8', fontWeight: 600, display: 'block', marginBottom: '3px', fontSize: '0.75rem' }}>
                                                    {cmd.responses.length} respuestas aleatorias (Ejemplo):
                                                </span>
                                                "{cmd.responses[0]}"
                                            </div>
                                        ) : (
                                            <div>"{cmd.responses && cmd.responses[0]}"</div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                                    {/* Probar / Simular */}
                                    <button
                                        type="button"
                                        onClick={() => handleSimulateCommand(cmd)}
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: '#10B981',
                                            border: '1px solid rgba(16, 185, 129, 0.25)',
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            cursor: 'pointer'
                                        }}
                                        title="Simular respuesta del bot"
                                    >
                                        <Play size={12} />
                                        Probar
                                    </button>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {/* Editar */}
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(cmd)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.06)',
                                                color: '#E2E8F0',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                padding: '5px 9px',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                            title="Editar comando"
                                        >
                                            <Edit2 size={14} />
                                        </button>

                                        {/* Eliminar */}
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirmItem(cmd)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#EF4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                padding: '5px 9px',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                            title="Eliminar comando"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL 1: CREAR / EDITAR COMANDO */}
            {isCreateModalOpen && (
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
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '560px',
                        padding: '1.8rem',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Settings size={22} color="#10B981" />
                                {editingId ? 'Editar Comando' : 'Crear Nuevo Comando'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            {/* Nombre del Comando */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                    Nombre del Comando (Iniciando con !)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: !pelea, !web, !discord..."
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        color: '#F8FAFC',
                                        fontSize: '0.92rem'
                                    }}
                                />
                            </div>

                            {/* Descripción */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                    Descripción del Comando
                                </label>
                                <input
                                    type="text"
                                    placeholder="Para qué sirve este comando..."
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        color: '#F8FAFC',
                                        fontSize: '0.92rem'
                                    }}
                                />
                            </div>

                            {/* Tipo de Plantilla */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                                    Tipo de Plantilla / Comportamiento
                                </label>
                                <select
                                    value={formType}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormType(val);
                                        // Autofill suggestion
                                        if (val === 'versus' && formResponses.length === 1 && !formResponses[0]) {
                                            setFormResponses(['⚔️ {user} reta a {target} a una dura pelea. ¡{winner} vence heroicamente dejando a {loser} en el suelo!']);
                                        } else if (val === 'action' && formResponses.length === 1 && !formResponses[0]) {
                                            setFormResponses(['🤗 {user} le da un fuerte abrazo a {target}! <3']);
                                        } else if (val === 'love' && formResponses.length === 1 && !formResponses[0]) {
                                            setFormResponses(['💖 ¡El termómetro del amor dice que {user} y {target} son un {percentage}% compatibles!']);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        color: '#F8FAFC',
                                        fontSize: '0.92rem'
                                    }}
                                >
                                    <option value="action">🤗 Acción Simple / Enlace (Abrazos, Enlaces Web, Redes)</option>
                                    <option value="versus">⚔️ Versus / Duelo (Elige ganador y perdedor al azar)</option>
                                    <option value="random">🔮 Decisión Aleatoria (8ball / Respuestas aleatorias)</option>
                                    <option value="love">💖 Medidor de Amor (Porcentaje de afinidad %)</option>
                                    <option value="roulette">🔫 Ruleta Rusa (Tensión y supervivencia)</option>
                                    <option value="level">📊 Medidor de Nivel / Stats (0-100%)</option>
                                </select>
                            </div>

                            {/* Caja de Ayuda de Variables */}
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px dashed rgba(16, 185, 129, 0.3)',
                                borderRadius: '8px',
                                padding: '10px 14px',
                                marginBottom: '1.2rem',
                                fontSize: '0.8rem',
                                color: '#94A3B8'
                            }}>
                                <strong style={{ color: '#10B981', display: 'block', marginBottom: '3px' }}>Variables disponibles:</strong>
                                • <code style={{ color: '#A7F3D0' }}>{"{user}"}</code>: Viewer que envía el comando.<br />
                                • <code style={{ color: '#A7F3D0' }}>{"{target}"}</code>: Usuario etiquetado tras el comando (ej: !abrazo @amigo).<br />
                                {formType === 'versus' && (
                                    <>• <code style={{ color: '#A7F3D0' }}>{"{winner}"}</code>: Ganador del combate.<br />• <code style={{ color: '#A7F3D0' }}>{"{loser}"}</code>: Perdedor del combate.<br /></>
                                )}
                                {(formType === 'love' || formType === 'level') && (
                                    <>• <code style={{ color: '#A7F3D0' }}>{"{percentage}"}</code> o <code style={{ color: '#A7F3D0' }}>{"{level}"}</code>: Número aleatorio (0-100%).</>
                                )}
                            </div>

                            {/* Frases / Respuestas */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Frases o Respuestas del Bot ({formResponses.length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setFormResponses([...formResponses, ''])}
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.15)',
                                            color: '#10B981',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            padding: '2px 8px',
                                            borderRadius: '5px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        + Añadir Otra Frase
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                                    {formResponses.map((resp, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '6px' }}>
                                            <textarea
                                                rows={2}
                                                placeholder="Escribe la frase que enviará el bot..."
                                                value={resp}
                                                onChange={(e) => {
                                                    const updated = [...formResponses];
                                                    updated[i] = e.target.value;
                                                    setFormResponses(updated);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    background: 'rgba(15, 23, 42, 0.8)',
                                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                                    borderRadius: '8px',
                                                    padding: '8px 10px',
                                                    color: '#F8FAFC',
                                                    fontSize: '0.85rem',
                                                    resize: 'vertical'
                                                }}
                                            />
                                            {formResponses.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormResponses(formResponses.filter((_, idx) => idx !== i))}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#EF4444',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '6px',
                                                        padding: '0 10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botones */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
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
                                        background: '#10B981',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                                    }}
                                >
                                    Guardar Comando
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: BIBLIOTECA DE PRESETS (15+ COMANDOS OFICIALES) */}
            {isPresetsModalOpen && (
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
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '750px',
                        padding: '1.8rem',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sparkles size={22} color="#C084FC" />
                                    Biblioteca de Comandos Oficiales Tokkii
                                </h2>
                                <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                                    Añade comandos listos para usar o instálalos todos de golpe en tu bot.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPresetsModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Top action: Añadir Todos */}
                        <div style={{
                            background: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: '#E2E8F0', fontSize: '0.88rem' }}>
                                Hay <strong>{OFFICIAL_PRESETS.length} comandos</strong> listos y optimizados.
                            </span>
                            <button
                                type="button"
                                onClick={handleAddAllPresets}
                                style={{
                                    background: '#A855F7',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '7px 14px',
                                    borderRadius: '7px',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 3px 10px rgba(168, 85, 247, 0.4)'
                                }}
                            >
                                ⚡ Instalar Todos los Presets
                            </button>
                        </div>

                        {/* Presets List */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                            {OFFICIAL_PRESETS.map((p, idx) => {
                                const alreadyInstalled = chatCommands.some(c => c.command_name === p.command_name);
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: alreadyInstalled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '10px',
                                            padding: '10px 14px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                <strong style={{ color: '#38BDF8', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                                    {p.command_name}
                                                </strong>
                                                <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.06)', padding: '1px 6px', borderRadius: '4px', color: '#94A3B8' }}>
                                                    {p.category}
                                                </span>
                                                {alreadyInstalled && (
                                                    <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <CheckCircle2 size={12} /> Instalado
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>
                                                {p.description}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    openCreateModal(p);
                                                    setIsPresetsModalOpen(false);
                                                }}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.06)',
                                                    color: '#CBD5E1',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    padding: '5px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.78rem',
                                                    cursor: 'pointer'
                                                }}
                                                title="Personalizar antes de guardar"
                                            >
                                                Personalizar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAddPreset(p)}
                                                style={{
                                                    background: alreadyInstalled ? 'rgba(16, 185, 129, 0.15)' : '#10B981',
                                                    color: alreadyInstalled ? '#10B981' : '#FFFFFF',
                                                    border: alreadyInstalled ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                                                    padding: '5px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {alreadyInstalled ? 'Reinstalar' : '+ Añadir'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: IMPORTADOR STREAMELEMENTS / NIGHTBOT */}
            {isImportModalOpen && (
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
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '680px',
                        padding: '1.8rem',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Download size={22} color="#38BDF8" />
                                    Importador Automático de Comandos
                                </h2>
                                <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                                    Extrae comandos públicos desde StreamElements o pega una lista de Nightbot.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsImportModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem' }}>
                            <button
                                type="button"
                                onClick={() => setImportTab('streamelements')}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: importTab === 'streamelements' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                    border: importTab === 'streamelements' ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                                    color: importTab === 'streamelements' ? '#38BDF8' : '#94A3B8',
                                    cursor: 'pointer'
                                }}
                            >
                                🌐 StreamElements (API Pública)
                            </button>
                            <button
                                type="button"
                                onClick={() => setImportTab('raw')}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: importTab === 'raw' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                    border: importTab === 'raw' ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                                    color: importTab === 'raw' ? '#38BDF8' : '#94A3B8',
                                    cursor: 'pointer'
                                }}
                            >
                                📝 Pegar Texto / JSON (Nightbot)
                            </button>
                        </div>

                        {/* TAB 1: STREAMELEMENTS */}
                        {importTab === 'streamelements' && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Nombre del canal en Twitch (ej: eviltokkii)..."
                                        value={seChannel}
                                        onChange={(e) => setSeChannel(e.target.value)}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            color: '#F8FAFC',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={fetchStreamElementsCommands}
                                        disabled={isFetchingSe}
                                        style={{
                                            background: '#38BDF8',
                                            color: '#000000',
                                            border: 'none',
                                            padding: '9px 16px',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            cursor: isFetchingSe ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isFetchingSe ? 'Consultando...' : '🔍 Buscar Comandos'}
                                    </button>
                                </div>

                                {fetchedSeCommands.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                                                {selectedSeCommands.size} de {fetchedSeCommands.length} comandos seleccionados
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedSeCommands.size === fetchedSeCommands.length) {
                                                        setSelectedSeCommands(new Set());
                                                    } else {
                                                        setSelectedSeCommands(new Set(fetchedSeCommands.map(c => c.command_name)));
                                                    }
                                                }}
                                                style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '0.78rem', cursor: 'pointer' }}
                                            >
                                                {selectedSeCommands.size === fetchedSeCommands.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                            </button>
                                        </div>

                                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px', marginBottom: '1rem' }}>
                                            {fetchedSeCommands.map(c => {
                                                const isChecked = selectedSeCommands.has(c.command_name);
                                                return (
                                                    <div
                                                        key={c.command_name}
                                                        onClick={() => {
                                                            const copy = new Set(selectedSeCommands);
                                                            if (isChecked) copy.delete(c.command_name);
                                                            else copy.add(c.command_name);
                                                            setSelectedSeCommands(copy);
                                                        }}
                                                        style={{
                                                            background: isChecked ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                                                            border: isChecked ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                                                            borderRadius: '8px',
                                                            padding: '8px 12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {}}
                                                            style={{ accentColor: '#38BDF8', width: '16px', height: '16px' }}
                                                        />
                                                        <strong style={{ color: '#38BDF8', fontFamily: 'monospace' }}>{c.command_name}</strong>
                                                        <span style={{ color: '#94A3B8', fontSize: '0.82rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {c.responses[0]}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleImportSelectedSe}
                                            style={{
                                                background: '#38BDF8',
                                                color: '#000',
                                                border: 'none',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            📥 Importar {selectedSeCommands.size} Comandos a mi Bot
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: RAW TEXT / NIGHTBOT */}
                        {importTab === 'raw' && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <label style={{ color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '6px' }}>
                                    Pega la lista de comandos (un comando por línea) o JSON:
                                </label>
                                <textarea
                                    rows={8}
                                    placeholder={`!web https://tokkii.online\n!discord https://discord.gg/eviltokkii\n!redes Sigue a EvilTokkii en TikTok y YouTube\n!lurk {user} entra en modo fantasmita`}
                                    value={rawTextImport}
                                    onChange={(e) => setRawTextImport(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        color: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        fontFamily: 'monospace',
                                        marginBottom: '1rem',
                                        resize: 'vertical'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleParseRawText}
                                    style={{
                                        background: '#38BDF8',
                                        color: '#000',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    📥 Procesar e Importar Comandos
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL 4: CONFIRMACIÓN DE ELIMINACIÓN */}
            {deleteConfirmItem && (
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
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '400px',
                        padding: '1.8rem',
                        textAlign: 'center',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
                    }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#EF4444',
                            margin: '0 auto 1rem'
                        }}>
                            <Trash2 size={26} />
                        </div>
                        <h3 style={{ margin: '0 0 8px', color: '#F8FAFC', fontSize: '1.2rem' }}>
                            ¿Eliminar Comando?
                        </h3>
                        <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: '1.4' }}>
                            ¿Estás seguro de que deseas eliminar el comando <strong style={{ color: '#EF4444' }}>{deleteConfirmItem.command_name}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmItem(null)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#E2E8F0',
                                    padding: '9px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (handleDeleteChatCommand) {
                                        await handleDeleteChatCommand(deleteConfirmItem.id);
                                    }
                                    setDeleteConfirmItem(null);
                                }}
                                style={{
                                    flex: 1,
                                    background: '#EF4444',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    padding: '9px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
