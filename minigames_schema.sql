-- Script para crear la tabla de contenido de minijuegos en Supabase
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase.

CREATE TABLE IF NOT EXISTS public.minigames_content (
    game_type VARCHAR PRIMARY KEY, -- 'overwatch', 'dbd', 'flags', 'games', 'scramble', 'music', 'disney'
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.minigames_content ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para permitir acceso público total (lectura y escritura)
DROP POLICY IF EXISTS "Public Manage Minigames Content" ON public.minigames_content;
CREATE POLICY "Public Manage Minigames Content" ON public.minigames_content FOR ALL USING (true) WITH CHECK (true);
