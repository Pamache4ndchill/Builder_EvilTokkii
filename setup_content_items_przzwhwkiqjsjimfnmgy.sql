-- ========================================================
-- 1. TABLA: content_items (Eventos y Sorteos)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR NOT NULL,                      -- 'evento' o 'sorteo'
    titulo VARCHAR NOT NULL,
    slug VARCHAR NOT NULL,
    descripcion TEXT,
    detalles TEXT,
    fecha VARCHAR,                              -- Descripción de la fecha en texto (ej. "Este Sábado, 20:00")
    fecha_fin TIMESTAMP WITH TIME ZONE,          -- Fecha y hora exacta de finalización
    imagen VARCHAR,                             -- Enlace a R2 o nombre de archivo
    estado VARCHAR DEFAULT 'activo',            -- 'activo', 'proximo', 'terminado'
    premios TEXT,
    normas JSONB DEFAULT '[]'::jsonb,           -- Lista de normas/requisitos
    requiere_participacion BOOLEAN DEFAULT TRUE, -- Muestra o no el botón de inscripción
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si la tabla ya existía, asegurarse de que tiene todas las columnas
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS tipo VARCHAR,
ADD COLUMN IF NOT EXISTS titulo VARCHAR,
ADD COLUMN IF NOT EXISTS slug VARCHAR,
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS detalles TEXT,
ADD COLUMN IF NOT EXISTS fecha VARCHAR,
ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS imagen VARCHAR,
ADD COLUMN IF NOT EXISTS estado VARCHAR DEFAULT 'activo',
ADD COLUMN IF NOT EXISTS premios TEXT,
ADD COLUMN IF NOT EXISTS normas JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS requiere_participacion BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================================
-- 2. TABLA: participations (Inscripciones de Usuarios)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR NOT NULL,
    tipo VARCHAR,                               -- 'evento' o 'sorteo'
    item_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
    item_titulo VARCHAR,
    mensaje TEXT,                               -- Comentarios / Discord / Twitch / etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.participations
ADD COLUMN IF NOT EXISTS nombre VARCHAR,
ADD COLUMN IF NOT EXISTS tipo VARCHAR,
ADD COLUMN IF NOT EXISTS item_id UUID,
ADD COLUMN IF NOT EXISTS item_titulo VARCHAR,
ADD COLUMN IF NOT EXISTS mensaje TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================================
-- 3. POLÍTICAS DE SEGURIDAD (RLS) PARA ACCESO PÚBLICO
-- ========================================================
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Manage Content Items" ON public.content_items;
CREATE POLICY "Public Manage Content Items" ON public.content_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Manage Participations" ON public.participations;
CREATE POLICY "Public Manage Participations" ON public.participations FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- 4. HABILITAR REALTIME (Para actualización instantánea)
-- ========================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.content_items;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.participations;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
END $$;
