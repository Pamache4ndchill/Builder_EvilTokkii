-- Actualización para Soporte de Autores y Perfiles
ALTER TABLE whitelist ADD COLUMN IF NOT EXISTS username TEXT;

-- Asegurar que la tabla de noticias tenga una columna para el autor
-- (Si tu tabla se llama 'news_articles', ejecuta esto)
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS author TEXT;

-- (Si tu tabla se llama 'news', ejecuta esto también por si acaso)
ALTER TABLE news ADD COLUMN IF NOT EXISTS author TEXT;

-- IMPORTANTE: Permitir que los usuarios actualicen su propio nombre de usuario
-- Si no agregas estas políticas, los cambios desde la web serán bloqueados por Supabase.
CREATE POLICY "Allow public update for username setup" ON whitelist 
FOR UPDATE USING (true) WITH CHECK (true);

-- También una política de inserción por si acaso (aunque se suele hacer manual)
CREATE POLICY "Allow public insert for whitelist" ON whitelist 
FOR INSERT WITH CHECK (true);
