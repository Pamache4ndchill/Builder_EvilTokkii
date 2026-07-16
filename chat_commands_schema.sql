-- Crear la tabla para almacenar comandos personalizados de Twitch Chat
CREATE TABLE IF NOT EXISTS public.chat_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command_name TEXT NOT NULL UNIQUE, -- Ej: "!pelea", "!abrazo"
    template_type TEXT NOT NULL DEFAULT 'versus', -- 'versus', 'action', 'random'
    description TEXT,
    responses TEXT[] NOT NULL, -- Matriz de strings con las respuestas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar la seguridad de fila (RLS)
ALTER TABLE public.chat_commands ENABLE ROW LEVEL SECURITY;

-- Permitir a cualquiera leer y modificar los comandos públicamente
CREATE POLICY "Public can manage chat commands" 
    ON public.chat_commands 
    FOR ALL 
    USING (true)
    WITH CHECK (true);
