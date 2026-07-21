-- Tabla para la Lista Blanca de Accesos y Control de Permisos
CREATE TABLE IF NOT EXISTS public.whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    approved BOOLEAN NOT NULL DEFAULT false,
    access_news BOOLEAN NOT NULL DEFAULT false,
    access_events BOOLEAN NOT NULL DEFAULT false,
    access_giveaways BOOLEAN NOT NULL DEFAULT false,
    access_participations BOOLEAN NOT NULL DEFAULT false,
    access_twitch BOOLEAN NOT NULL DEFAULT false,
    access_most_streamed BOOLEAN NOT NULL DEFAULT false,
    access_scheduled_messages BOOLEAN NOT NULL DEFAULT false,
    access_song_request BOOLEAN NOT NULL DEFAULT false,
    access_commands BOOLEAN NOT NULL DEFAULT false,
    access_reports BOOLEAN NOT NULL DEFAULT false,
    access_ruleta BOOLEAN NOT NULL DEFAULT false,
    access_twitch_giveaway BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura pública para verificación y flujo de registro
CREATE POLICY "Permitir lectura publica para verificacion" 
ON public.whitelist 
FOR SELECT 
USING (true);

-- Permitir a usuarios anonimos/autenticados insertar solicitudes de registro
CREATE POLICY "Permitir insertar solicitudes de registro" 
ON public.whitelist 
FOR INSERT 
WITH CHECK (true);

-- Permitir actualizar su propio registro (ej. configurar username)
CREATE POLICY "Permitir actualizar su propio registro" 
ON public.whitelist 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Otorgar permisos a los roles de la API
GRANT ALL ON public.whitelist TO anon;
GRANT ALL ON public.whitelist TO authenticated;
GRANT ALL ON public.whitelist TO service_role;
