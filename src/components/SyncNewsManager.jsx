import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Trash2, Sparkles, Flame, Tv } from 'lucide-react';

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
        .replace(/\-\-+/g, '-')
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

function formatParagraphs(text) {
    if (!text) return '';
    const lines = text.split(/\r?\n+/);
    const paragraphs = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.length > 400) {
            const sentences = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed];
            let currentParagraph = '';
            for (let i = 0; i < sentences.length; i++) {
                currentParagraph += sentences[i];
                if ((i + 1) % 3 === 0 || currentParagraph.length > 300) {
                    paragraphs.push(currentParagraph.trim());
                    currentParagraph = '';
                }
            }
            if (currentParagraph.trim()) {
                paragraphs.push(currentParagraph.trim());
            }
        } else {
            paragraphs.push(trimmed);
        }
    }
    
    return paragraphs
        .map(p => `<p style="margin-bottom: 1.5rem; text-align: justify; line-height: 1.8;">${p}</p>`)
        .join('\n');
}

function extractTagValue(xml, tagName) {
    const escapedTag = tagName.replace(':', '\\:');
    const cdataMatch = xml.match(new RegExp(`<${escapedTag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escapedTag}>`, 'i'));
    if (cdataMatch?.[1]) return cdataMatch[1];
    const regularMatch = xml.match(new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, 'i'));
    return regularMatch?.[1] || '';
}

const ANIME_KEYWORDS = [
    'anime', 'manga', 'otaku', 'crunchyroll', 'animacion', 'animación',
    'temporada', 'doblaje', 'doblaje latino', 'pelicula', 'película',
    'demon slayer', 'kimetsu', 'jujutsu', 'dragon ball', 'naruto', 'one piece',
    'chainsaw man', 'bleach', 'toei', 'mappa', 'ufotable', 'aniplex', 'boku no hero',
    'my hero academia', 'spy x family', 'solo leveling', 'frieren', 'mononoke',
    'dan da dan', 'dandadan', 'blue lock', 'kaiju', 'isekai', 'shingeki',
    'attack on titan', 'gundam', 'evangelion', 'romance', 'manhwa', 'webtoon'
];

function isStrictCategory(category, title, description, sourceCategory) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (category === 'ANIME') {
        const isPureGaming = (text.includes('gta 6') || text.includes('gta vi') || text.includes('playstation 5') || text.includes('xbox series') || text.includes('tarjeta gráfica') || text.includes('rtx 40') || text.includes('gameplay trailer') || text.includes('nintendo switch 2')) && !text.includes('anime') && !text.includes('manga');
        if (isPureGaming) return false;

        if (sourceCategory === 'ANIME') {
            const hasAnimeMatch = ANIME_KEYWORDS.some(k => text.includes(k));
            return hasAnimeMatch || !isPureGaming;
        }
        return ANIME_KEYWORDS.some(k => text.includes(k));
    }

    if (category === 'VIDEOJUEGOS') {
        const isPureAnime = text.includes('estreno del anime') || text.includes('episodio del anime') || (text.includes('manga') && !text.includes('juego') && !text.includes('gameplay'));
        if (isPureAnime) return false;
        return true;
    }

    return true;
}

export default function SyncNewsManager({ supabase, triggerToast }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
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
            
            // Orden descendente estricto: desde la más actual a la más vieja
            const sorted = (data || []).sort((a, b) => {
                const timeA = new Date(a.published_at || a.created_at || 0).getTime();
                const timeB = new Date(b.published_at || b.created_at || 0).getTime();
                return timeB - timeA;
            });

            setArticles(sorted);

            // Count today articles
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

    const fetchFeedContent = async (feedUrl) => {
        const proxies = [
            (url) => url, // Direct
            (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
        ];

        for (const proxy of proxies) {
            try {
                const target = proxy(feedUrl);
                const res = await fetch(target, { cache: 'no-store' });
                if (res.ok) {
                    const text = await res.text();
                    if (text && (text.includes('<item>') || text.includes('<entry>'))) {
                        return text;
                    }
                }
            } catch (err) {
                // Try next proxy
            }
        }
        throw new Error(`No se pudo leer el feed: ${feedUrl}`);
    };

    const handleRunSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        setSyncProgress('Iniciando sincronización estricta (3 Videojuegos + 3 Anime)...');

        // Feeds ordenados por prioridad y categoría estricta
        const vgFeeds = [
            { url: 'https://www.3djuegos.com/universo/rss/rss.php', name: '3DJuegos', category: 'VIDEOJUEGOS', lang: 'es' },
            { url: 'https://es.ign.com/feed.xml', name: 'IGN España', category: 'VIDEOJUEGOS', lang: 'es' }
        ];

        const animeFeeds = [
            { url: 'https://www.crunchyroll.com/news/rss?lang=esES', name: 'Crunchyroll', category: 'ANIME', lang: 'es' },
            { url: 'https://www.anmtvla.com/feeds/posts/default?alt=rss', name: 'ANMTV LA', category: 'ANIME', lang: 'es' }
        ];

        let countVideojuegos = 0;
        let countAnime = 0;
        const targetLimit = 3;

        try {
            // 1. Sincronizar exactamente 3 noticias de VIDEOJUEGOS
            for (const feed of vgFeeds) {
                if (countVideojuegos >= targetLimit) break;
                setSyncProgress(`Consultando noticias de Videojuegos en ${feed.name}...`);

                let xml = '';
                try {
                    xml = await fetchFeedContent(feed.url);
                } catch (e) {
                    console.warn(`Feed ${feed.name} falló:`, e);
                    continue;
                }

                const itemBlocks = xml.includes('<item>') ? xml.split('<item>') : xml.split('<entry>');
                itemBlocks.shift();

                for (const itemXml of itemBlocks) {
                    if (countVideojuegos >= targetLimit) break;

                    const rawTitle = extractTagValue(itemXml, 'title');
                    const rawTitleClean = decodeHtmlEntities(rawTitle.trim());
                    const rawLink = extractTagValue(itemXml, 'link').trim() || (itemXml.match(/<link[^>]*href=["']([^"']*)["']/i)?.[1] || '');
                    const guid = extractTagValue(itemXml, 'guid').trim() || extractTagValue(itemXml, 'id').trim();
                    const link = ensureAbsoluteUrl(rawLink || guid, feed.url);

                    if (!rawTitleClean || !link) continue;

                    const contentEncoded = extractTagValue(itemXml, 'content:encoded') || extractTagValue(itemXml, 'summary') || extractTagValue(itemXml, 'description');
                    let fullDesc = cleanDescription(contentEncoded);

                    // Validar categoría estricta de videojuegos
                    if (!isStrictCategory('VIDEOJUEGOS', rawTitleClean, fullDesc, 'VIDEOJUEGOS')) {
                        continue;
                    }

                    const hash = getHash(link || `${feed.name}-${rawTitleClean}`);
                    const baseSlug = generateSlug(rawTitleClean || `${feed.name}-${hash}`);
                    const slug = `${baseSlug}-${hash}`;

                    const { data: existing } = await supabase
                        .from('news_articles')
                        .select('id')
                        .eq('slug', slug)
                        .maybeSingle();

                    if (existing) continue;

                    setSyncProgress(`[Videojuegos ${countVideojuegos + 1}/3] Guardando: "${rawTitleClean.substring(0, 30)}..."`);

                    if (!fullDesc || fullDesc.length < 50) {
                        fullDesc = '¡Mantente al día con las últimas novedades del mundo de los videojuegos! Hay grandes noticias sucediendo en este momento en la industria.\n\nHaz clic en el botón de abajo para leer el artículo completo con todos los detalles directamente en la fuente oficial.';
                    }

                    const subtitle = fullDesc.length > 200 ? fullDesc.substring(0, 197) + '...' : fullDesc;

                    // Extract image
                    let header_image = '';
                    const encMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']*)["']/i);
                    const medMatch = itemXml.match(/<media:content[^>]*url=["']([^"']*)["']/i) || itemXml.match(/<media:thumbnail[^>]*url=["']([^"']*)["']/i);
                    if (encMatch) header_image = encMatch[1];
                    else if (medMatch) header_image = medMatch[1];
                    else {
                        const imgMatch = itemXml.match(/<img[^>]*src=["']([^"']*)["']/i);
                        if (imgMatch) header_image = ensureAbsoluteUrl(imgMatch[1], link);
                    }

                    if (!header_image) {
                        header_image = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80';
                    }

                    const paragraphsHtml = formatParagraphs(fullDesc);
                    const articleHtml = `
                        ${paragraphsHtml}
                        <p style="margin-top: 2rem; text-align: center;">
                            <a href="${link}" target="_blank" rel="noopener noreferrer" class="games-join-btn" style="display: inline-flex; text-decoration: none; padding: 1rem 2.5rem; background: var(--primary); color: white; border-radius: 30px; font-weight: bold; box-shadow: 0 5px 15px rgba(157, 78, 221, 0.4);">
                                LEER ARTÍCULO COMPLETO EN ${feed.name.toUpperCase()}
                            </a>
                        </p>
                    `;

                    const author = pickAuthor(link);
                    const pubDateStr = extractTagValue(itemXml, 'pubDate') || extractTagValue(itemXml, 'dc:date') || extractTagValue(itemXml, 'updated');
                    const parsedDate = pubDateStr ? new Date(pubDateStr) : new Date();
                    const published_at = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

                    const payload = {
                        title: rawTitleClean,
                        subtitle,
                        slug,
                        header_image,
                        content_blocks: [
                            { type: 'metadata', category: 'VIDEOJUEGOS', source: feed.name, source_url: link, source_hash: hash, imported_date: todayDateStr },
                            { type: 'text', content: articleHtml }
                        ],
                        author,
                        published_at,
                        category: 'VIDEOJUEGOS'
                    };

                    const { error: insErr } = await supabase
                        .from('news_articles')
                        .upsert(payload, { onConflict: 'slug' });

                    if (!insErr) {
                        countVideojuegos++;
                    }
                }
            }

            // 2. Sincronizar exactamente 3 noticias de ANIME
            for (const feed of animeFeeds) {
                if (countAnime >= targetLimit) break;
                setSyncProgress(`Consultando noticias de Anime en ${feed.name}...`);

                let xml = '';
                try {
                    xml = await fetchFeedContent(feed.url);
                } catch (e) {
                    console.warn(`Feed ${feed.name} falló:`, e);
                    continue;
                }

                const itemBlocks = xml.includes('<item>') ? xml.split('<item>') : xml.split('<entry>');
                itemBlocks.shift();

                for (const itemXml of itemBlocks) {
                    if (countAnime >= targetLimit) break;

                    const rawTitle = extractTagValue(itemXml, 'title');
                    const rawTitleClean = decodeHtmlEntities(rawTitle.trim());
                    const rawLink = extractTagValue(itemXml, 'link').trim() || (itemXml.match(/<link[^>]*href=["']([^"']*)["']/i)?.[1] || '');
                    const guid = extractTagValue(itemXml, 'guid').trim() || extractTagValue(itemXml, 'id').trim();
                    const link = ensureAbsoluteUrl(rawLink || guid, feed.url);

                    if (!rawTitleClean || !link) continue;

                    const contentEncoded = extractTagValue(itemXml, 'content:encoded') || extractTagValue(itemXml, 'summary') || extractTagValue(itemXml, 'description');
                    let fullDesc = cleanDescription(contentEncoded);

                    // Validar categoría estricta de anime (descartar notas de GTA, consolas o ajenas)
                    if (!isStrictCategory('ANIME', rawTitleClean, fullDesc, feed.category)) {
                        continue;
                    }

                    const hash = getHash(link || `${feed.name}-${rawTitleClean}`);
                    const baseSlug = generateSlug(rawTitleClean || `${feed.name}-${hash}`);
                    const slug = `${baseSlug}-${hash}`;

                    const { data: existing } = await supabase
                        .from('news_articles')
                        .select('id')
                        .eq('slug', slug)
                        .maybeSingle();

                    if (existing) continue;

                    setSyncProgress(`[Anime ${countAnime + 1}/3] Guardando: "${rawTitleClean.substring(0, 30)}..."`);

                    if (!fullDesc || fullDesc.length < 50) {
                        fullDesc = '¡Grandes novedades para los fans del anime! Mantente al día con todos los anuncios, trailers y fechas clave de esta producción.\n\nPuedes consultar todos los pormenores accediendo directamente a la fuente original de la noticia.';
                    }

                    const subtitle = fullDesc.length > 200 ? fullDesc.substring(0, 197) + '...' : fullDesc;

                    // Extract image
                    let header_image = '';
                    const encMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']*)["']/i);
                    const medMatch = itemXml.match(/<media:content[^>]*url=["']([^"']*)["']/i) || itemXml.match(/<media:thumbnail[^>]*url=["']([^"']*)["']/i);
                    if (encMatch) header_image = encMatch[1];
                    else if (medMatch) header_image = medMatch[1];
                    else {
                        const imgMatch = itemXml.match(/<img[^>]*src=["']([^"']*)["']/i);
                        if (imgMatch) header_image = ensureAbsoluteUrl(imgMatch[1], link);
                    }

                    if (header_image && (header_image.includes('blogger.googleusercontent.com') || header_image.includes('bp.blogspot.com'))) {
                        header_image = header_image.replace(/\/s[0-9]+(-c)?\//i, '/s1600/').replace(/\/w[0-9]+-h[0-9]+[^/]*\//i, '/s1600/');
                    }

                    if (!header_image) {
                        header_image = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80';
                    }

                    const paragraphsHtml = formatParagraphs(fullDesc);
                    const articleHtml = `
                        ${paragraphsHtml}
                        <p style="margin-top: 2rem; text-align: center;">
                            <a href="${link}" target="_blank" rel="noopener noreferrer" class="games-join-btn" style="display: inline-flex; text-decoration: none; padding: 1rem 2.5rem; background: var(--primary); color: white; border-radius: 30px; font-weight: bold; box-shadow: 0 5px 15px rgba(157, 78, 221, 0.4);">
                                LEER ARTÍCULO COMPLETO EN ${feed.name.toUpperCase()}
                            </a>
                        </p>
                    `;

                    const author = pickAuthor(link);
                    const pubDateStr = extractTagValue(itemXml, 'pubDate') || extractTagValue(itemXml, 'dc:date') || extractTagValue(itemXml, 'updated');
                    const parsedDate = pubDateStr ? new Date(pubDateStr) : new Date();
                    const published_at = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

                    const payload = {
                        title: rawTitleClean,
                        subtitle,
                        slug,
                        header_image,
                        content_blocks: [
                            { type: 'metadata', category: 'ANIME', source: feed.name, source_url: link, source_hash: hash, imported_date: todayDateStr },
                            { type: 'text', content: articleHtml }
                        ],
                        author,
                        published_at,
                        category: 'ANIME'
                    };

                    const { error: insErr } = await supabase
                        .from('news_articles')
                        .upsert(payload, { onConflict: 'slug' });

                    if (!insErr) {
                        countAnime++;
                    }
                }
            }

            setSyncProgress('¡Sincronización completada con éxito!');
            triggerToast(`¡Sincronizadas ${countVideojuegos} noticias de Videojuegos y ${countAnime} de Anime!`);
            await fetchRecentArticles();
        } catch (err) {
            console.error("Sync error:", err);
            triggerToast(`Error durante la sincronización: ${err.message}`, 'bottom');
        } finally {
            setIsSyncing(false);
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
        } catch (err) {
            triggerToast(`Error al eliminar: ${err.message}`, 'bottom');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            {/* Header Card */}
            <div className="card animate-slide-down" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Newspaper size={28} color="#38bdf8" /> Sincronizador Automático de Noticias
                    </h2>
                    <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Obtén 3 noticias diarias de Videojuegos y 3 de Anime directamente de las fuentes oficiales (3DJuegos, IGN, Crunchyroll, ANMTV).
                    </p>
                </div>

                <button
                    type="button"
                    className="btn-submit"
                    style={{
                        width: 'auto',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                        color: '#fff',
                        fontWeight: 700,
                        boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)'
                    }}
                    onClick={handleRunSync}
                    disabled={isSyncing}
                >
                    <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Sincronizando...' : '?? Sincronizar Noticias Ahora'}
                </button>
            </div>

            {/* Status & Progress Bar */}
            {syncProgress && (
                <div className="card animate-slide-down" style={{ padding: '14px 20px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={20} color="#38bdf8" />
                    <span style={{ color: '#e0f2fe', fontWeight: 600, fontSize: '0.9rem' }}>{syncProgress}</span>
                </div>
            )}

            {/* Daily Counter Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="card animate-slide-down" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Flame size={26} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Noticias Videojuegos Hoy</span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            {todayStats.videojuegos} / 3 <span style={{ fontSize: '0.85rem', color: todayStats.videojuegos >= 3 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{todayStats.videojuegos >= 3 ? '? Completo' : '?? Pendiente'}</span>
                        </div>
                    </div>
                </div>

                <div className="card animate-slide-down" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                        <Tv size={26} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Noticias Anime Hoy</span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            {todayStats.anime} / 3 <span style={{ fontSize: '0.85rem', color: todayStats.anime >= 3 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{todayStats.anime >= 3 ? '? Completo' : '?? Pendiente'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Recent Articles in Supabase */}
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
                        No hay noticias en la base de datos. Haz clic en "Sincronizar Noticias Ahora" para importar las primeras.
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
