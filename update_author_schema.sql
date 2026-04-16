-- Actualización para Soporte de Autores y Perfiles
ALTER TABLE whitelist ADD COLUMN IF NOT EXISTS username TEXT;

-- Asegurar que la tabla de noticias tenga una columna para el autor
-- (Si tu tabla se llama 'news_articles', ejecuta esto)
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS author TEXT;

-- (Si tu tabla se llama 'news', ejecuta esto también por si acaso)
ALTER TABLE news ADD COLUMN IF NOT EXISTS author TEXT;
