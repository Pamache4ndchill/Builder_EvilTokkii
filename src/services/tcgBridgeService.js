import { createClient } from '@supabase/supabase-js';

// Supabase 2: Autenticación, Usuarios y Perfiles del TCG
const TCG_SUPABASE_URL = 'https://uawyiubcubczmujetczo.supabase.co';
const TCG_SUPABASE_ANON_KEY = 'sb_publishable_mpnDW2dhMQv5706gNlxvQw_S4HmrPQD';

export const tcgSupabase = createClient(TCG_SUPABASE_URL, TCG_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const STATUS_MAP_STORAGE_KEY = 'tokkii_redemptions_status_map';

/**
 * Obtener el mapa de estados local (fallback seguro por si la columna status no existe en DB)
 */
export const getLocalStatusMap = () => {
  try {
    const raw = localStorage.getItem(STATUS_MAP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Guardar estado de un canje en el mapa local
 */
export const setLocalClaimStatus = (claimId, status) => {
  if (!claimId) return;
  try {
    const current = getLocalStatusMap();
    current[claimId] = status;
    localStorage.setItem(STATUS_MAP_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Error guardando status local de canje:', e);
  }
};

/**
 * Determinar el tipo de sobre según el nombre del canje de Twitch
 * @returns {'pack_1' | 'pack_3' | 'pack_5' | null}
 */
export const getPackTypeFromReward = (rewardName) => {
  if (!rewardName) return null;
  const clean = String(rewardName).toLowerCase().trim();

  // Sobre de 5 cartas
  if (
    clean.includes('x5') ||
    clean.includes('pack 5') ||
    clean.includes('pack_5') ||
    clean.includes('5 carta') ||
    clean.includes('5 cartas') ||
    clean.includes('cinco cartas')
  ) {
    return 'pack_5';
  }

  // Sobre de 3 cartas
  if (
    clean.includes('x3') ||
    clean.includes('pack 3') ||
    clean.includes('pack_3') ||
    clean.includes('3 carta') ||
    clean.includes('3 cartas') ||
    clean.includes('tres cartas')
  ) {
    return 'pack_3';
  }

  // Sobre de 2 cartas
  if (
    clean.includes('x2') ||
    clean.includes('pack 2') ||
    clean.includes('pack_2') ||
    clean.includes('2 carta') ||
    clean.includes('2 cartas') ||
    clean.includes('dos cartas')
  ) {
    return 'pack_2';
  }

  // Sobre de 1 carta
  if (
    clean.includes('x1') ||
    clean.includes('pack 1') ||
    clean.includes('pack_1') ||
    clean.includes('1 carta') ||
    clean.includes('una carta')
  ) {
    return 'pack_1';
  }

  return null;
};

/**
 * Buscar un usuario registrado en el TCG por su nombre de Twitch
 */
export const findTcgUser = async (twitchUsername) => {
  if (!twitchUsername) return null;
  const clean = twitchUsername.trim().toLowerCase().replace(/^@/, '');

  try {
    // 1. Buscar por username exacto o case-insensitive
    const { data: byUsername, error: err1 } = await tcgSupabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('username', clean)
      .maybeSingle();

    if (!err1 && byUsername) {
      return byUsername;
    }

    // 2. Si no coincide, buscar por display_name
    const { data: byDisplay, error: err2 } = await tcgSupabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('display_name', clean)
      .maybeSingle();

    if (!err2 && byDisplay) {
      return byDisplay;
    }
  } catch (err) {
    console.warn('Error buscando usuario en TCG Supabase:', err);
  }

  return null;
};

/**
 * Acreditar sobre(s) al inventario de un usuario en el TCG
 */
export const grantTcgPack = async (userId, packType, quantity = 1) => {
  if (!userId || !packType || quantity <= 0) return false;

  try {
    // Consultar si ya tiene fila para ese tipo de sobre
    const { data: existing, error: selErr } = await tcgSupabase
      .from('user_packs')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('pack_type', packType)
      .maybeSingle();

    if (selErr) {
      console.warn('Error consultando user_packs:', selErr);
    }

    if (existing) {
      const newQty = (Number(existing.quantity) || 0) + quantity;
      const { error: updErr } = await tcgSupabase
        .from('user_packs')
        .update({
          quantity: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updErr) throw updErr;
      return true;
    } else {
      const { error: insErr } = await tcgSupabase
        .from('user_packs')
        .insert({
          user_id: userId,
          pack_type: packType,
          quantity: quantity,
          updated_at: new Date().toISOString(),
        });

      if (insErr) throw insErr;
      return true;
    }
  } catch (e) {
    console.error(`Error acreditando ${quantity}x ${packType} a ${userId}:`, e);
    throw e;
  }
};

/**
 * Procesar un canje de sobre: busca al usuario y le entrega el sobre si está registrado
 * @returns {Promise<{ isPack: boolean, delivered: boolean, status: 'entregado' | 'pendiente', message: string, user?: any, packType?: string }>}
 */
export const deliverPackForRedemption = async (twitchUsername, rewardName) => {
  const packType = getPackTypeFromReward(rewardName);

  // Si no es un canje de sobre de cartas
  if (!packType) {
    return {
      isPack: false,
      delivered: false,
      status: 'no_pack',
      message: 'Este canje no corresponde a un sobre de cartas del TCG.',
    };
  }

  const labelPack = packType === 'pack_1' ? '1 Carta' : packType === 'pack_2' ? '2 Cartas' : packType === 'pack_3' ? '3 Cartas' : '5 Cartas';

  // Buscar si el usuario existe en el TCG
  const user = await findTcgUser(twitchUsername);

  if (!user) {
    return {
      isPack: true,
      delivered: false,
      status: 'pendiente',
      packType,
      message: `@${twitchUsername} aún no ha iniciado sesión en el Visor de Cartas (tcg.eviltokkii.online). Sobre de ${labelPack} pendiente de entrega.`,
    };
  }

  // Si el usuario existe, acreditar el sobre de inmediato
  try {
    await grantTcgPack(user.id, packType, 1);
    return {
      isPack: true,
      delivered: true,
      status: 'entregado',
      user,
      packType,
      message: `¡Sobre de ${labelPack} entregado con éxito a ${user.display_name || user.username}!`,
    };
  } catch (err) {
    return {
      isPack: true,
      delivered: false,
      status: 'pendiente',
      packType,
      user,
      message: `Error al depositar sobre en la base de datos: ${err.message || 'Fallo de conexión'}`,
    };
  }
};
