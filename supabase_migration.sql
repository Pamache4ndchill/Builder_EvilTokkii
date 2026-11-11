-- ============================================================================
-- MIGRACIÓN 1: EJECUTAR EN EL SUPABASE DEL BUILDER (hddzijixsigsqsmabtej)
-- Copia desde aquí hasta el final de la MIGRACIÓN 1, pégalo en SQL Editor y pulsa RUN.
-- ============================================================================

ALTER TABLE IF EXISTS public.twitch_redemptions
  ADD COLUMN IF NOT EXISTS twitch_event_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente';

CREATE UNIQUE INDEX IF NOT EXISTS idx_twitch_redemptions_event_id_unique
  ON public.twitch_redemptions (twitch_event_id)
  WHERE twitch_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.twitch_reward_configs (
  reward_name TEXT PRIMARY KEY,
  event_type TEXT NOT NULL DEFAULT 'points',
  pack_type TEXT NOT NULL DEFAULT 'pack_1',
  pack_count INTEGER NOT NULL DEFAULT 1,
  min_bits INTEGER DEFAULT 100,
  gift_sub_mode TEXT DEFAULT 'per_sub',
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.twitch_reward_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access on twitch_reward_configs" ON public.twitch_reward_configs;

CREATE POLICY "Allow full access on twitch_reward_configs"
  ON public.twitch_reward_configs
  FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO public.twitch_reward_configs (reward_name, event_type, pack_type, pack_count, active)
VALUES
  ('GoodTokkii Pack X1', 'points', 'pack_1', 1, true),
  ('GoodTokkii Pack X3', 'points', 'pack_3', 1, true)
ON CONFLICT (reward_name) DO NOTHING;

-- NOTA: twitch_redemptions ya tiene Realtime activo en tu proyecto.
-- Si alguna vez necesitas verificarlo: Supabase Dashboard -> Database -> Publications -> supabase_realtime.


-- ============================================================================
-- MIGRACIÓN 2: EJECUTAR EN EL SUPABASE DEL VISOR/TCG (uawyiubcubczmujetczo)
-- Copia SOLO el bloque CREATE OR REPLACE FUNCTION ... $$; de abajo en una New Query y pulsa RUN.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_user_pack(
  p_user_id UUID,
  p_pack_type TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_pack_id UUID;
  v_current_qty INTEGER;
  v_new_qty INTEGER;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN 0;
  END IF;

  SELECT id, quantity
    INTO v_pack_id, v_current_qty
    FROM public.user_packs
   WHERE user_id = p_user_id
     AND pack_type = p_pack_type
   ORDER BY updated_at DESC NULLS LAST
   LIMIT 1
   FOR UPDATE;

  IF v_pack_id IS NOT NULL THEN
    v_new_qty := COALESCE(v_current_qty, 0) + p_quantity;
    UPDATE public.user_packs
       SET quantity = v_new_qty,
           updated_at = NOW()
     WHERE id = v_pack_id;
  ELSE
    v_new_qty := p_quantity;
    INSERT INTO public.user_packs (user_id, pack_type, quantity, updated_at)
    VALUES (p_user_id, p_pack_type, v_new_qty, NOW());
  END IF;

  RETURN v_new_qty;
END;
$fn$;
