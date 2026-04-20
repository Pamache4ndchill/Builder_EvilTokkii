-- Script para solucionar errores de RLS (Row Level Security) - ACTUALIZADO
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase.

-- 1. Habilitar RLS en las tablas
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twitch_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.most_streamed ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas de acceso total para el Rol Public/Anon

-- Políticas para content_items
DROP POLICY IF EXISTS "Public Manage Content Items" ON public.content_items;
CREATE POLICY "Public Manage Content Items" ON public.content_items FOR ALL USING (true) WITH CHECK (true);

-- Políticas para news_articles
DROP POLICY IF EXISTS "Public Manage News Articles" ON public.news_articles;
CREATE POLICY "Public Manage News Articles" ON public.news_articles FOR ALL USING (true) WITH CHECK (true);

-- Políticas para participations
DROP POLICY IF EXISTS "Public Manage Participations" ON public.participations;
CREATE POLICY "Public Manage Participations" ON public.participations FOR ALL USING (true) WITH CHECK (true);

-- Políticas para twitch_redemptions
DROP POLICY IF EXISTS "Public Manage Twitch Redemptions" ON public.twitch_redemptions;
CREATE POLICY "Public Manage Twitch Redemptions" ON public.twitch_redemptions FOR ALL USING (true) WITH CHECK (true);

-- Políticas para most_streamed (¡IMPORTANTE!)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.most_streamed;
DROP POLICY IF EXISTS "Public Manage Most Streamed" ON public.most_streamed;
CREATE POLICY "Public Manage Most Streamed" ON public.most_streamed FOR ALL USING (true) WITH CHECK (true);

-- 3. Asegurar que los datos iniciales existan en most_streamed si la tabla está vacía
INSERT INTO public.most_streamed (title, image_url, order_index)
SELECT 'Overwatch', 'Imagenes/Overwatch.png', 1 WHERE NOT EXISTS (SELECT 1 FROM public.most_streamed WHERE order_index = 1);
INSERT INTO public.most_streamed (title, image_url, order_index)
SELECT 'Reanimal', 'Imagenes/Reanimal.png', 2 WHERE NOT EXISTS (SELECT 1 FROM public.most_streamed WHERE order_index = 2);
INSERT INTO public.most_streamed (title, image_url, order_index)
SELECT 'Poppy Playtime', 'Imagenes/PoppyPlayTime.png', 3 WHERE NOT EXISTS (SELECT 1 FROM public.most_streamed WHERE order_index = 3);
INSERT INTO public.most_streamed (title, image_url, order_index)
SELECT 'Teamfight Tactics', 'Imagenes/TeamfightTactics.png', 4 WHERE NOT EXISTS (SELECT 1 FROM public.most_streamed WHERE order_index = 4);
INSERT INTO public.most_streamed (title, image_url, order_index)
SELECT 'GTA V', 'Imagenes/GTA_V.png', 5 WHERE NOT EXISTS (SELECT 1 FROM public.most_streamed WHERE order_index = 5);
INSERT INTO public.most_streamed (title, image_url, order_index)
SELECT 'Just Chatting', 'Imagenes/JustCHatting.png', 6 WHERE NOT EXISTS (SELECT 1 FROM public.most_streamed WHERE order_index = 6);
