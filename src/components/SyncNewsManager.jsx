import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Trash2, Sparkles, Flame, Tv, Gamepad2 } from 'lucide-react';

const DEFAULT_AUTHORS = ['EVILTOKKII', 'REQUIEM373', 'ESPEEEOON', 'PAMACHE', 'NPEZE'];

function getLocalDateStr(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getHash(value) {
    return Math.abs(
        String(value || '').split('').reduce((acc, char) => {
            acc = ((acc << 5) - acc) + char.charCodeAt(0);
            return acc & acc;
        }, 0)
    ).toString(36).substring(0, 8);
}

function pickAuthor(seed) {
    const hash = getHash(seed);
    const index = parseInt(hash, 36) % DEFAULT_AUTHORS.length;
    return DEFAULT_AUTHORS[index];
}

function ensureAbsoluteUrl(url, baseUrl) {
    if (!url) return '';
    try {
        return new URL(url, baseUrl).toString();
    } catch {
        return url;
    }
}

function decodeHtmlEntities(text) {
    if (!text) return '';
    return text
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

function generateSlug(title) {
    return title
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function cleanDescription(html) {
    if (!html) return '';
    let clean = decodeHtmlEntities(html);
    clean = clean.replace(/<img[^>]*>/gi, '').replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    clean = clean.replace(/<\/p>|<br\s*\/?>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n');
    clean = clean.replace(/<[^>]*>/g, '').trim();
    return clean;
}

function buildRobustArticleContent(title, cleanDesc, category, sourceName, sourceUrl) {
    const isAnime = category === 'ANIME';
    
    const rawSentences = (cleanDesc || '').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 25);
    const mainCore = rawSentences.slice(0, 3).join('. ') + (rawSentences.length > 0 ? '.' : '');

    const p1 = mainCore.length > 100 
        ? mainCore 
        : (isAnime 
            ? `${title}. Grandes novedades han salido a la luz en las últimas horas para la comunidad del anime y el manga con este nuevo anuncio oficial.`
            : `${title}. Una de las noticias más destacadas del momento en la industria del videojuego, trayendo importantes novedades y anuncios que han capturado la atención de la comunidad gamer.`);

    const p2 = rawSentences.length > 3 
        ? rawSentences.slice(3, 7).join('. ') + '.'
        : (isAnime
            ? 'Entre los detalles más relevantes compartidos por la producción, se destacan las fechas clave de estreno, el equipo creativo a cargo de la animación y los avances mostrados en los materiales promocionales. Esta entrega promete mantener el estándar visual y narrativo que los seguidores de la franquicia han estado esperando con gran expectativa.'
            : 'El informe detalla los aspectos técnicos y jugables más relevantes de este lanzamiento, incluyendo mejoras en la experiencia de juego, novedades en su contenido y la disponibilidad confirmada para las principales plataformas del mercado. Los desarrolladores han puesto especial énfasis en optimizar el rendimiento y la inmersión para los usuarios.');

    const p3 = isAnime
        ? 'La reacción de los fanáticos no se ha hecho esperar en redes sociales y foros especializados, donde se debaten las implicaciones de este estreno dentro de la temporada actual. Con un calendario repleto de lanzamientos de alto perfil, esta producción se posiciona como una de las más seguidas y comentadas por los aficionados a la cultura otaku.'
        : 'La comunidad de jugadores ha recibido estos anuncios con gran entusiasmo, generando amplios debates sobre el futuro de la saga y las expectativas depositadas en este proyecto. En un año repleto de grandes estrenos y competencia en el sector, este movimiento refuerza la posición del título dentro del panorama internacional.';

    return `
        <p style="margin-bottom: 1.5rem; text-align: justify; line-height: 1.8;">${p1}</p>
        <p style="margin-bottom: 1.5rem; text-align: justify; line-height: 1.8;">${p2}</p>
        <p style="margin-bottom: 1.5rem; text-align: justify; line-height: 1.8;">${p3}</p>
        <p style="margin-top: 2.5rem; text-align: center;">
            <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="games-join-btn" style="display: inline-flex; text-decoration: none; padding: 1rem 2.5rem; background: var(--primary); color: white; border-radius: 30px; font-weight: bold; box-shadow: 0 5px 15px rgba(157, 78, 221, 0.4);">
                LEER ARTÍCULO COMPLETO EN ${sourceName.toUpperCase()}
            </a>
        </p>
    `;
}

function extractTagValue(xml, tagName) {
    const escapedTag = tagName.replace(':', '\\:');
    const cdataMatch = xml.match(new RegExp(`<${escapedTag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escapedTag}>`, 'i'));
    if (cdataMatch?.[1]) return cdataMatch[1];
    const regularMatch = xml.match(new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, 'i'));
    return regularMatch?.[1] || '';
}

function isStrictCategory(category, title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (category === 'ANIME') {
        const isPureGaming = (text.includes('gta 6') || text.includes('gta vi') || text.includes('playstation 5') || text.includes('xbox series') || text.includes('tarjeta gráfica') || text.includes('rtx 40') || text.includes('gameplay trailer') || text.includes('nintendo switch 2')) && !text.includes('anime') && !text.includes('manga');
        if (isPureGaming) return false;
        return true;
    }

    if (category === 'VIDEOJUEGOS') {
        const isPureAnime = text.includes('estreno del anime') || text.includes('episodio del anime') || (text.includes('manga') && !text.includes('juego') && !text.includes('gameplay'));
        if (isPureAnime) return false;
        return true;
    }

    return true;
}

export default function SyncNewsManager({ supabase, triggerToast, onSyncComplete }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncingCategory, setSyncingCategory] = useState(null); // 'VIDEOJUEGOS' | 'ANIME' | null
    const [syncProgress, setSyncProgress] = useState('');
    const [todayStats, setTodayStats] = useState({ videojuegos: 0, anime: 0 });

    const todayDateStr = getLocalDateStr();

    const fetchRecentArticles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('news_articles')
                .select('*')
                .order('published_at', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(60);

            if (error) throw error;
            
            const sorted = (data || []).sort((a, b) => {
                const timeA = new Date(a.published_at || a.created_at || 0).getTime();
                const timeB = new Date(b.published_at || b.created_at || 0).getTime();
                return timeB - timeA;
            });

            setArticles(sorted);

            const todayVg = sorted.filter(a => {
                const isVg = a.category === 'VIDEOJUEGOS' || (a.content_blocks && JSON.stringify(a.content_blocks).includes('VIDEOJUEGOS'));
                const isToday = (a.published_at || a.created_at || '').startsWith(todayDateStr);
                return isVg && isToday;
            }).length;

            const todayAn = sorted.filter(a => {
                const isAn = a.category === 'ANIME' || (a.content_blocks && JSON.stringify(a.content_blocks).includes('ANIME'));
                const isToday = (a.published_at || a.created_at || '').startsWith(todayDateStr);
                return isAn && isToday;
            }).length;

            setTodayStats({ videojuegos: todayVg, anime: todayAn });
        } catch (err) {
            console.error("Error fetching articles:", err);
            triggerToast("Error al cargar noticias de Supabase", "bottom");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentArticles();
    }, []);

    // Extrae imagen real y válida del item o de su página
    const extractRealImage = async (item, directXml = '') => {
        let img = item.thumbnail || item.enclosure?.link || '';
        if (img && img.startsWith('http') && !img.includes('placeholder')) return img;

        if (item.description) {
            const m = item.description.match(/<img[^>]*src=["']([^"']*)["']/i);
            if (m && m[1] && m[1].startsWith('http')) return m[1];
        }

        if (item.content) {
            const m = item.content.match(/<img[^>]*src=["']([^"']*)["']/i);
            if (m && m[1] && m[1].startsWith('http')) return m[1];
        }

        if (directXml) {
            const enc = directXml.match(/<enclosure[^>]*url=["']([^"']*)["']/i);
            const med = directXml.match(/<media:content[^>]*url=["']([^"']*)["']/i) || directXml.match(/<media:thumbnail[^>]*url=["']([^"']*)["']/i);
            if (enc && enc[1].startsWith('http')) return enc[1];
            if (med && med[1].startsWith('http')) return med[1];
        }

        return '';
    };

    // Extrae artículos mediante rss2json (CORS friendly) y fallback con proxies
    const fetchNormalizedItems = async (source) => {
        try {
            const r2jUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
            const res = await fetch(r2jUrl);
            if (res.ok) {
                const json = await res.json();
                if (json.status === 'ok' && Array.isArray(json.items) && json.items.length > 0) {
                    const parsedList = [];
                    for (const item of json.items) {
                        const image = await extractRealImage(item);
                        if (image && image.startsWith('http')) {
                            parsedList.push({
                                title: item.title,
                                link: item.link,
                                description: item.description || item.content,
                                image,
                                date: item.pubDate || new Date().toISOString(),
                                sourceName: source.name
                            });
                        }
                    }
                    if (parsedList.length > 0) return parsedList;
                }
            }
        } catch (e) {
            console.warn(`rss2json failed for ${source.name}, trying proxy raw...`, e);
        }

        // Fallback con Proxies XML
        const proxies = [
            (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            (url) => url
        ];

        for (const proxy of proxies) {
            try {
                const target = proxy(source.url);
                const res = await fetch(target, { cache: 'no-store' });
                if (res.ok) {
                    const xml = await res.text();
                    if (xml && (xml.includes('<item>') || xml.includes('<entry>'))) {
                        const itemBlocks = xml.includes('<item>') ? xml.split('<item>') : xml.split('<entry>');
                        itemBlocks.shift();
                        const parsed = [];
                        for (const itemXml of itemBlocks) {
                            const rawTitle = extractTagValue(itemXml, 'title');
                            const rawTitleClean = decodeHtmlEntities(rawTitle.trim());
                            let rawLink = extractTagValue(itemXml, 'link').trim();
                            if (!rawLink || rawLink.startsWith('<')) {
                                rawLink = itemXml.match(/<link[^>]*href=["']([^"']*)["']/i)?.[1] || '';
                            }
                            const guid = extractTagValue(itemXml, 'guid').trim() || extractTagValue(itemXml, 'id').trim();
                            const link = ensureAbsoluteUrl(rawLink || (guid.startsWith('http') ? guid : ''), source.url);
                            
                            if (!rawTitleClean || !link || !link.startsWith('http')) continue;

                            const contentEncoded = extractTagValue(itemXml, 'content:encoded') || extractTagValue(itemXml, 'summary') || extractTagValue(itemXml, 'description');
                            
                            const image = await extractRealImage({ description: contentEncoded, link }, itemXml);
                            if (!image || !image.startsWith('http')) continue;

                            const pubDateStr = extractTagValue(itemXml, 'pubDate') || extractTagValue(itemXml, 'dc:date') || extractTagValue(itemXml, 'updated');

                            parsed.push({
                                title: rawTitleClean,
                                link,
                                description: contentEncoded,
                                image,
                                date: pubDateStr || new Date().toISOString(),
                                sourceName: source.name
                            });
                        }
                        if (parsed.length > 0) return parsed;
                    }
                }
            } catch (e) {
                // Try next
            }
        }

        return [];
    };

    // Sincroniza exclusivamente la categoría seleccionada (3 noticias)
    const handleSyncCategory = async (category) => {
        if (syncingCategory) return;
        setSyncingCategory(category);
        
        const isVg = category === 'VIDEOJUEGOS';
        setSyncProgress(`Iniciando sincronización de 3 noticias de ${isVg ? 'Videojuegos' : 'Anime'}...`);

        const sources = isVg ? [
            { name: 'Areajugones', url: 'https://areajugones.sport.es/videojuegos/feed/' },
            { name: 'GeneracionXbox', url: 'https://generacionxbox.com/feed/' },
            { name: 'Nintenderos', url: 'https://www.nintenderos.com/feed/' },
            { name: '3DJuegos', url: 'https://www.3djuegos.com/universo/rss/rss.php' }
        ] : [
            { name: 'Areajugones Anime', url: 'https://areajugones.sport.es/anime/feed/' },
            { name: 'Crunchyroll', url: 'https://www.crunchyroll.com/news/rss?lang=esES' },
            { name: 'Ramen Para Dos', url: 'https://ramenparados.com/feed/' }
        ];

        let count = 0;
        const targetLimit = 3;

        try {
            for (const src of sources) {
                if (count >= targetLimit) break;
                setSyncProgress(`Consultando noticias en ${src.name}...`);

                const items = await fetchNormalizedItems(src);
                for (const item of items) {
                    if (count >= targetLimit) break;

                    const titleClean = decodeHtmlEntities(item.title || '').trim();
                    const link = (item.link || '').trim();
                    const header_image = item.image;

                    if (!titleClean || !link || !link.startsWith('http') || !header_image || !header_image.startsWith('http')) continue;

                    let fullDesc = cleanDescription(item.description || '');
                    if (!isStrictCategory(category, titleClean, fullDesc)) continue;

                    const hash = getHash(link || `${src.name}-${titleClean}`);
                    const baseSlug = generateSlug(titleClean || `${src.name}-${hash}`);
                    const slug = `${baseSlug}-${hash}`;

                    const { data: existing } = await supabase
                        .from('news_articles')
                        .select('id')
                        .eq('slug', slug)
                        .maybeSingle();

                    if (existing) continue;

                    setSyncProgress(`[${isVg ? 'Videojuegos' : 'Anime'} ${count + 1}/3] Guardando: "${titleClean.substring(0, 30)}..."`);

                    const subtitle = fullDesc.length > 200 ? fullDesc.substring(0, 197) + '...' : (fullDesc || titleClean);
                    const articleHtml = buildRobustArticleContent(titleClean, fullDesc, category, src.name, link);
                    const author = pickAuthor(link);
                    const parsedDate = item.date ? new Date(item.date) : new Date();
                    const published_at = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

                    const payload = {
                        title: titleClean,
                        subtitle,
                        slug,
                        header_image,
                        content_blocks: [
                            { type: 'metadata', category, source: src.name, source_url: link, source_hash: hash, imported_date: todayDateStr },
                            { type: 'text', content: articleHtml }
                        ],
                        author,
                        published_at,
                        category
                    };

                    const { error: insErr } = await supabase
                        .from('news_articles')
                        .upsert(payload, { onConflict: 'slug' });

                    if (!insErr) {
                        count++;
                    }
                }
            }

            setSyncProgress(`¡Completado! Se sincronizaron ${count} noticias de ${isVg ? 'Videojuegos' : 'Anime'}.`);
            triggerToast(`¡Sincronizadas ${count} noticias de ${isVg ? 'Videojuegos' : 'Anime'} con éxito!`);
            await fetchRecentArticles();
            if (onSyncComplete) onSyncComplete();
        } catch (err) {
            console.error("Sync error:", err);
            triggerToast(`Error al sincronizar ${category}: ${err.message}`, 'bottom');
        } finally {
            setSyncingCategory(null);
            setTimeout(() => setSyncProgress(''), 4000);
        }
    };

    const handleDeleteArticle = async (id, title) => {
        if (!window.confirm(`¿Eliminar la noticia "${title}"?`)) return;
        try {
            const { error } = await supabase.from('news_articles').delete().eq('id', id);
            if (error) throw error;
            triggerToast("Noticia eliminada correctamente");
            fetchRecentArticles();
            if (onSyncComplete) onSyncComplete();
        } catch (err) {
            triggerToast(`Error al eliminar: ${err.message}`, 'bottom');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ maxWidth: '550px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Newspaper size={28} color="#38bdf8" /> Sincronizador Automático de Noticias
                    </h2>
                    <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Genera noticias 100% en español con portadas HD oficiales. Elige la categoría que deseas sincronizar:
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn-submit"
                        style={{
                            width: 'auto',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                            color: '#fff',
                            fontWeight: 700,
                            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35)',
                            borderRadius: '10px'
                        }}
                        onClick={() => handleSyncCategory('VIDEOJUEGOS')}
                        disabled={!!syncingCategory}
                    >
                        <Flame size={18} className={syncingCategory === 'VIDEOJUEGOS' ? 'animate-spin' : ''} />
                        {syncingCategory === 'VIDEOJUEGOS' ? 'Sincronizando...' : '🎮 3 de Videojuegos'}
                    </button>

                    <button
                        type="button"
                        className="btn-submit"
                        style={{
                            width: 'auto',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            color: '#fff',
                            fontWeight: 700,
                            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.35)',
                            borderRadius: '10px'
                        }}
                        onClick={() => handleSyncCategory('ANIME')}
                        disabled={!!syncingCategory}
                    >
                        <Tv size={18} className={syncingCategory === 'ANIME' ? 'animate-spin' : ''} />
                        {syncingCategory === 'ANIME' ? 'Sincronizando...' : '📺 3 de Anime'}
                    </button>
                </div>
            </div>

            {syncProgress && (
                <div className="card animate-slide-down" style={{ padding: '14px 20px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={20} color="#38bdf8" />
                    <span style={{ color: '#e0f2fe', fontWeight: 600, fontSize: '0.9rem' }}>{syncProgress}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="card animate-slide-down" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            <Flame size={26} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Noticias Videojuegos Hoy</span>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                {todayStats.videojuegos} / 3 <span style={{ fontSize: '0.85rem', color: todayStats.videojuegos >= 3 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{todayStats.videojuegos >= 3 ? '✅ Completo' : '⚠️ Pendiente'}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleSyncCategory('VIDEOJUEGOS')}
                        disabled={!!syncingCategory}
                        style={{
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            background: 'rgba(236, 72, 153, 0.15)',
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            color: '#f43f5e',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <RefreshCw size={13} className={syncingCategory === 'VIDEOJUEGOS' ? 'animate-spin' : ''} />
                        Generar
                    </button>
                </div>

                <div className="card animate-slide-down" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                            <Tv size={26} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Noticias Anime Hoy</span>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                {todayStats.anime} / 3 <span style={{ fontSize: '0.85rem', color: todayStats.anime >= 3 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{todayStats.anime >= 3 ? '✅ Completo' : '⚠️ Pendiente'}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleSyncCategory('ANIME')}
                        disabled={!!syncingCategory}
                        style={{
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            background: 'rgba(168, 85, 247, 0.15)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            color: '#a855f7',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <RefreshCw size={13} className={syncingCategory === 'ANIME' ? 'animate-spin' : ''} />
                        Generar
                    </button>
                </div>
            </div>

            <div className="card animate-slide-down" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                        Últimos Artículos Publicados en la Web ({articles.length})
                    </h3>
                    <button
                        type="button"
                        onClick={fetchRecentArticles}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                    >
                        <RefreshCw size={14} /> Refrescar lista
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                        Cargando noticias...
                    </div>
                ) : articles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No hay noticias en la base de datos. Usa los botones superiores para importar noticias de Videojuegos o Anime.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {articles.map(art => {
                            const isAnime = art.category === 'ANIME' || (art.content_blocks && JSON.stringify(art.content_blocks).includes('ANIME'));
                            return (
                                <div
                                    key={art.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '16px',
                                        padding: '14px 18px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '12px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                                        {art.header_image && (
                                            <img
                                                src={art.header_image}
                                                alt={art.title}
                                                style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: isAnime ? 'rgba(168, 85, 247, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                                                    color: isAnime ? '#c084fc' : 'var(--primary)'
                                                }}>
                                                    {isAnime ? 'ANIME' : 'VIDEOJUEGOS'}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(art.published_at || art.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    • Por: <strong>{art.author || 'Tokkii'}</strong>
                                                </span>
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                                {art.title}
                                            </h4>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <a
                                            href={`https://tokkii.online/noticias/${art.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: '0.8rem',
                                                background: 'rgba(56, 189, 248, 0.1)',
                                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                                color: '#38bdf8',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <ExternalLink size={14} /> Ver en Web
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteArticle(art.id, art.title)}
                                            style={{
                                                padding: '6px 10px',
                                                fontSize: '0.8rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            title="Eliminar noticia"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}
