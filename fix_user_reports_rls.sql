-- Script para solucionar políticas de RLS en user_reports para que aparezcan en el Builder
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase.

-- 1. Asegurar que RLS esté activo
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas restrictivas previas que impedían al Builder (usuario anon/cliente) ver los reportes
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Public Manage User Reports" ON public.user_reports;

-- 3. Crear una nueva política unificada de gestión pública (igual a las otras tablas como content_items, participations, etc.)
-- Esto permite al Builder consultar (SELECT) todos los reportes y borrarlos (DELETE), y a la web insertar (INSERT) nuevos reportes.
CREATE POLICY "Public Manage User Reports" 
ON public.user_reports 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Otorgar permisos a los roles correspondientes
GRANT ALL ON public.user_reports TO anon;
GRANT ALL ON public.user_reports TO authenticated;
GRANT ALL ON public.user_reports TO service_role;
