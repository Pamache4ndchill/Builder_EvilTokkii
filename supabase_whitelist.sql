-- Tabla para la Lista Blanca de Accesos
CREATE TABLE IF NOT EXISTS whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir la lectura de correos (necesario para verificar el acceso)
-- Nota: Esta política permite que cualquiera consulte si un correo está en la lista.
CREATE POLICY "Allow public select for verification" ON whitelist 
FOR SELECT USING (true);

-- Ejemplo de cómo agregar correos autorizados:
-- INSERT INTO whitelist (email) VALUES ('tu-correo@tokkii.online');
-- INSERT INTO whitelist (email) VALUES ('editor1@test.com');
