-- 1. Actualización de la Tabla content_items
-- Agregamos las nuevas columnas a la tabla existente (si ya existe) o la creamos de nuevo con estas columnas.

ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS requiere_participacion BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMP WITH TIME ZONE;

-- Si estás recreando la tabla desde cero, el script completo sería:
/*
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR NOT NULL,                      -- 'evento' o 'sorteo'
    titulo VARCHAR NOT NULL,
    slug VARCHAR NOT NULL,
    descripcion TEXT,
    detalles TEXT,
    fecha VARCHAR,                              -- Descripción de la fecha en texto (ej. "Este Sábado")
    fecha_fin TIMESTAMP WITH TIME ZONE,          -- Fecha y hora exacta de finalización
    imagen VARCHAR,                             -- Nombre del archivo en R2
    estado VARCHAR DEFAULT 'activo',            -- 'activo', 'proximo', 'terminado'
    premios TEXT,
    normas JSONB,                               -- Array de normas
    requiere_participacion BOOLEAN DEFAULT TRUE, -- Para mostrar o no el botón de inscripción
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 2. Función para actualizar automáticamente el estado a 'terminado' al expirar
CREATE OR REPLACE FUNCTION public.check_and_update_expired_content()
RETURNS trigger AS $$
BEGIN
    -- Si la fecha_fin ha pasado, forzar el estado a 'terminado'
    IF NEW.fecha_fin IS NOT NULL AND NEW.fecha_fin <= NOW() THEN
        NEW.estado := 'terminado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar en cada inserción o modificación
DROP TRIGGER IF EXISTS trigger_check_expiry ON public.content_items;
CREATE TRIGGER trigger_check_expiry
BEFORE INSERT OR UPDATE ON public.content_items
FOR EACH ROW
EXECUTE FUNCTION public.check_and_update_expired_content();

-- 3. Función auxiliar para ser llamada de forma periódica o manual para limpiar todos los registros expirados
CREATE OR REPLACE FUNCTION public.cron_update_expired_content()
RETURNS void AS $$
BEGIN
    UPDATE public.content_items
    SET estado = 'terminado'
    WHERE fecha_fin IS NOT NULL 
      AND fecha_fin <= NOW() 
      AND estado != 'terminado';
END;
$$ LANGUAGE plpgsql;

-- 4. Creación de Vistas Útiles para la App
-- Vista de elementos activos (Eventos y Sorteos que aún no han expirado)
CREATE OR REPLACE VIEW public.active_content_items AS
SELECT * 
FROM public.content_items
WHERE estado != 'terminado' 
  AND (fecha_fin IS NULL OR fecha_fin > NOW())
ORDER BY created_at DESC;

-- Vista de elementos terminados (Expirados o marcados explícitamente como terminado)
CREATE OR REPLACE VIEW public.finished_content_items AS
SELECT * 
FROM public.content_items
WHERE estado = 'terminado' 
   OR (fecha_fin IS NOT NULL AND fecha_fin <= NOW())
ORDER BY fecha_fin DESC;
