-- 1. Crear la tabla 'user_reports'
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('bug', 'sugerencia', 'cambio')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar la seguridad a nivel de fila (Row Level Security - RLS)
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Seguridad RLS

-- Permitir insertar sus propios reportes a usuarios autenticados
CREATE POLICY "Permitir insertar reportes a usuarios autenticados" 
ON public.user_reports 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Permitir a los usuarios visualizar sus propios reportes enviados
CREATE POLICY "Permitir ver sus propios reportes" 
ON public.user_reports 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Otorgar permisos a los roles de la API de Supabase
GRANT ALL ON public.user_reports TO authenticated;
GRANT ALL ON public.user_reports TO service_role;
