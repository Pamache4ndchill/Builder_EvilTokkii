-- Script para solucionar errores de RLS (Row Level Security) 
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase.

-- 1. Habilitar RLS en las tablas (si no están ya habilitadas)
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twitch_redemptions ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas de acceso total para el Rol Public/Anon
-- Nota: Esto permite que el Builder gestione los datos sin usar Supabase Auth clásico.

-- Políticas para content_items (Sorteos y Eventos)
DROP POLICY IF EXISTS "Public Manage Content Items" ON public.content_items;
CREATE POLICY "Public Manage Content Items" ON public.content_items 
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para news_articles (Noticias)
DROP POLICY IF EXISTS "Public Manage News Articles" ON public.news_articles;
CREATE POLICY "Public Manage News Articles" ON public.news_articles 
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para participations (Registros de usuarios)
DROP POLICY IF EXISTS "Public Manage Participations" ON public.participations;
CREATE POLICY "Public Manage Participations" ON public.participations 
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para twitch_redemptions (Canjes)
DROP POLICY IF EXISTS "Public Manage Twitch Redemptions" ON public.twitch_redemptions;
CREATE POLICY "Public Manage Twitch Redemptions" ON public.twitch_redemptions 
FOR ALL USING (true) WITH CHECK (true);

-- 3. Asegurar acceso de lectura público (opcional, ya cubierto por 'FOR ALL' pero recomendado por claridad)
-- Si 'FOR ALL' da problemas, podrías usar SELECT, INSERT, UPDATE, DELETE por separado.
