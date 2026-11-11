import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// CONFIGURACIÓN DE ENTORNOS (Variables cargadas desde Supabase Secrets)
// ============================================================================
const BUILDER_SUPABASE_URL = Deno.env.get('BUILDER_SUPABASE_URL') || 'https://hddzijixsigsqsmabtej.supabase.co';
const BUILDER_SUPABASE_SERVICE_KEY = Deno.env.get('BUILDER_SUPABASE_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const TCG_SUPABASE_URL = Deno.env.get('TCG_SUPABASE_URL') || 'https://uawyiubcubczmujetczo.supabase.co';
const TCG_SUPABASE_SERVICE_KEY = Deno.env.get('TCG_SUPABASE_SERVICE_KEY') || '';

const TWITCH_CLIENT_ID = Deno.env.get('TWITCH_CLIENT_ID') || '';
const TWITCH_CLIENT_SECRET = Deno.env.get('TWITCH_CLIENT_SECRET') || '';
const TWITCH_WEBHOOK_SECRET = Deno.env.get('TWITCH_WEBHOOK_SECRET') || 'EvilTokkii_Webhook_Secret_2026';
const BROADCASTER_USER_ID = Deno.env.get('TWITCH_BROADCASTER_ID') || '1131620140'; // @eviltokkii

const builderSupabase = createClient(BUILDER_SUPABASE_URL, BUILDER_SUPABASE_SERVICE_KEY);
const tcgSupabase = createClient(TCG_SUPABASE_URL, TCG_SUPABASE_SERVICE_KEY || BUILDER_SUPABASE_SERVICE_KEY);

// ============================================================================
// UTILIDADES CRIPTOGRÁFICAS Y NORMALIZACIÓN
// ============================================================================

async function verifyTwitchSignature(
  messageId: string,
  timestamp: string,
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  if (!messageId || !timestamp || !signatureHeader || !secret) return false;
  const message = messageId + timestamp + rawBody;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const expectedHex =
    'sha256=' +
    Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  if (expectedHex.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    diff |= expectedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return diff === 0;
}

function normalizeRewardName(name: string | undefined | null): string {
  if (!name) return 'Canje';
  const clean = String(name).trim().toLowerCase().replace(/\s+/g, ' ');
  if (clean.includes('goodtokkii') && clean.includes('pack')) {
    if (clean.includes('x1') || clean.includes('x 1') || clean.includes('1')) return 'GoodTokkii Pack X1';
    if (clean.includes('x2') || clean.includes('x 2') || clean.includes('2')) return 'GoodTokkii Pack X2';
    if (clean.includes('x3') || clean.includes('x 3') || clean.includes('3')) return 'GoodTokkii Pack X3';
    if (clean.includes('x5') || clean.includes('x 5') || clean.includes('5')) return 'GoodTokkii Pack X5';
  }
  return String(name).trim();
}

function getPackTypeFromReward(rewardName: string): string | null {
  const clean = rewardName.toLowerCase();
  if (clean.includes('x5') || clean.includes('pack 5') || clean.includes('pack_5') || clean.includes('5 carta')) return 'pack_5';
  if (clean.includes('x3') || clean.includes('pack 3') || clean.includes('pack_3') || clean.includes('3 carta')) return 'pack_3';
  if (clean.includes('x2') || clean.includes('pack 2') || clean.includes('pack_2') || clean.includes('2 carta')) return 'pack_2';
  if (clean.includes('x1') || clean.includes('pack 1') || clean.includes('pack_1') || clean.includes('1 carta')) return 'pack_1';
  return null;
}

async function getTwitchAppToken(): Promise<string> {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`No se pudo obtener App Access Token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// ============================================================================
// ENTREGA ATÓMICA EN SUPABASE TCG + REGISTRO EN BUILDER
// ============================================================================

async function findTcgUserId(twitchUsername: string): Promise<string | null> {
  const clean = twitchUsername.trim().toLowerCase().replace(/^@/, '');
  if (!clean) return null;

  const { data: byUsername } = await tcgSupabase
    .from('profiles')
    .select('id')
    .ilike('username', clean)
    .maybeSingle();

  if (byUsername?.id) return byUsername.id;

  const { data: byDisplay } = await tcgSupabase
    .from('profiles')
    .select('id')
    .ilike('display_name', clean)
    .maybeSingle();

  return byDisplay?.id || null;
}

async function processAndDeliverRedemption(params: {
  eventId: string;
  rewardName: string;
  viewerName: string;
  redeemedAt: string;
  packType: string | null;
  packCount: number;
  isRuletaOnly?: boolean;
}) {
  const { eventId, rewardName, viewerName, redeemedAt, packType, packCount, isRuletaOnly } = params;

  // 1. Insertar primero con twitch_event_id UNIQUE para garantizar deduplicación atómica.
  // Si Twitch reintenta el mismo webhook exacto, fallará con código 23505 (duplicado) y no entregaremos doble.
  // Si el usuario hace 10 canjes distintos en 3 segundos, cada uno tiene un eventId diferente y pasan 10/10.
  const { data: insertedRow, error: insertErr } = await builderSupabase
    .from('twitch_redemptions')
    .insert([
      {
        reward_name: rewardName,
        username: viewerName,
        created_at: redeemedAt,
        twitch_event_id: eventId,
        status: isRuletaOnly ? 'pendiente' : 'pendiente',
      },
    ])
    .select('id')
    .single();

  if (insertErr) {
    // Código 23505 = Unique constraint violation -> Ya fue procesado este mismo ID de evento
    if (insertErr.code === '23505') {
      console.log(`[EventSub] Evento duplicado ignorado por ID: ${eventId}`);
      return { deduplicated: true };
    }
    console.error('[EventSub] Error insertando en twitch_redemptions:', insertErr);
    throw insertErr;
  }

  if (isRuletaOnly || !packType) {
    return { insertedId: insertedRow.id, delivered: false, status: 'pendiente' };
  }

  // 2. Buscar perfil en el TCG y sumar sobres atómicamente vía RPC
  const userId = await findTcgUserId(viewerName);
  if (!userId) {
    console.log(`[EventSub] @${viewerName} no registrado aún en TCG. Queda pendiente (${packCount}x ${packType}).`);
    return { insertedId: insertedRow.id, delivered: false, status: 'pendiente' };
  }

  const { error: rpcErr } = await tcgSupabase.rpc('increment_user_pack', {
    p_user_id: userId,
    p_pack_type: packType,
    p_quantity: packCount,
  });

  if (rpcErr) {
    console.error('[EventSub] Error ejecutando RPC increment_user_pack:', rpcErr);
    return { insertedId: insertedRow.id, delivered: false, status: 'pendiente' };
  }

  // 3. Marcar como entregado en twitch_redemptions
  await builderSupabase
    .from('twitch_redemptions')
    .update({ status: 'entregado' })
    .eq('id', insertedRow.id);

  console.log(`✅ [EventSub 24/7] Entregado ${packCount}x ${packType} a @${viewerName} (ID: ${eventId})`);
  return { insertedId: insertedRow.id, delivered: true, status: 'entregado' };
}

// ============================================================================
// SERVER HTTP / DENO HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  // Ruta auxiliar administrativa: ?action=register&secret=<TWITCH_WEBHOOK_SECRET>
  // Registra las 5 suscripciones de Webhook en Twitch con un solo clic
  if (req.method === 'GET' && (action === 'register' || action === 'list')) {
    const providedSecret = url.searchParams.get('secret');
    if (providedSecret !== TWITCH_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Secret inválido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const appToken = await getTwitchAppToken();

      if (action === 'list') {
        const listRes = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
          headers: {
            Authorization: `Bearer ${appToken}`,
            'Client-Id': TWITCH_CLIENT_ID,
          },
        });
        const listData = await listRes.json();
        return new Response(JSON.stringify(listData, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Callback URL pública de esta misma Edge Function
      const callbackUrl = `${BUILDER_SUPABASE_URL}/functions/v1/twitch-eventsub`;

      // Limpiar webhooks antiguos caídos si los hubiera para este callback
      const existingRes = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        headers: {
          Authorization: `Bearer ${appToken}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
      });
      const existingData = await existingRes.json();
      for (const sub of existingData.data || []) {
        if (sub.transport?.callback === callbackUrl && sub.status !== 'enabled') {
          await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${sub.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${appToken}`,
              'Client-Id': TWITCH_CLIENT_ID,
            },
          });
        }
      }

      const topics = [
        { type: 'channel.channel_points_custom_reward_redemption.add', version: '1' },
        { type: 'channel.cheer', version: '1' },
        { type: 'channel.subscribe', version: '1' },
        { type: 'channel.subscription.gift', version: '1' },
        { type: 'channel.subscription.message', version: '1' },
      ];

      const results = [];
      for (const topic of topics) {
        const subRes = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${appToken}`,
            'Client-Id': TWITCH_CLIENT_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: topic.type,
            version: topic.version,
            condition: { broadcaster_user_id: BROADCASTER_USER_ID },
            transport: {
              method: 'webhook',
              callback: callbackUrl,
              secret: TWITCH_WEBHOOK_SECRET,
            },
          }),
        });
        const subJson = await subRes.json();
        results.push({ topic: topic.type, status: subRes.status, response: subJson });
      }

      return new Response(JSON.stringify({ callbackUrl, results }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Solo aceptar POST para webhooks de Twitch
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const rawBody = await req.text();
  const messageId = req.headers.get('twitch-eventsub-message-id') || '';
  const timestamp = req.headers.get('twitch-eventsub-message-timestamp') || '';
  const signature = req.headers.get('twitch-eventsub-message-signature') || '';
  const messageType = req.headers.get('twitch-eventsub-message-type') || '';

  // Verificar firma criptográfica HMAC-SHA256 de Twitch
  const isValid = await verifyTwitchSignature(
    messageId,
    timestamp,
    rawBody,
    signature,
    TWITCH_WEBHOOK_SECRET
  );

  if (!isValid) {
    console.warn('[EventSub] Firma HMAC inválida rechazada.');
    return new Response('Forbidden: Invalid signature', { status: 403 });
  }

  const payload = JSON.parse(rawBody);

  // 1. Verificación inicial del Webhook por Twitch
  if (messageType === 'webhook_callback_verification') {
    console.log('[EventSub] Webhook verificado correctamente por Twitch.');
    return new Response(payload.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. Notificación de evento revocado
  if (messageType === 'revocation') {
    console.warn('[EventSub] Suscripción revocada por Twitch:', payload.subscription);
    return new Response('OK', { status: 200 });
  }

  // 3. Notificación de evento real
  if (messageType === 'notification') {
    const subType = payload.subscription?.type;
    const ev = payload.event;
    if (!ev) return new Response('OK', { status: 200 });

    // Leer las configuraciones activas guardadas desde el Builder
    const { data: configs } = await builderSupabase
      .from('twitch_reward_configs')
      .select('*')
      .eq('active', true);

    const activeConfigs = configs && configs.length > 0
      ? configs
      : [
          { reward_name: 'GoodTokkii Pack X1', event_type: 'points', pack_type: 'pack_1', pack_count: 1 },
          { reward_name: 'GoodTokkii Pack X3', event_type: 'points', pack_type: 'pack_3', pack_count: 1 },
        ];

    try {
      // A) PUNTOS DE CANAL
      if (subType === 'channel.channel_points_custom_reward_redemption.add') {
        const rawTitle = ev.reward?.title || '';
        const normTitle = normalizeRewardName(rawTitle);
        const viewerName = ev.user_name || ev.user_login || 'Espectador';
        const redeemedAt = ev.redeemed_at || new Date().toISOString();
        const eventId = ev.id || messageId;

        const isRuleta =
          normTitle.toLowerCase() === 'ruleta sangrienta' ||
          rawTitle.toLowerCase() === 'ruleta sangrienta';

        const matchedCfg = activeConfigs.find((c: any) => {
          const cleanCfg = normalizeRewardName(c.reward_name).toLowerCase();
          return (
            cleanCfg === normTitle.toLowerCase() ||
            c.reward_name.trim().toLowerCase() === rawTitle.trim().toLowerCase()
          );
        });

        const isDefaultPack = /goodtokkii\s*pack/i.test(rawTitle) || /goodtokkii\s*pack/i.test(normTitle);

        if (isRuleta && !matchedCfg && !isDefaultPack) {
          await processAndDeliverRedemption({
            eventId,
            rewardName: rawTitle,
            viewerName,
            redeemedAt,
            packType: null,
            packCount: 0,
            isRuletaOnly: true,
          });
          return new Response('OK', { status: 200 });
        }

        if (!matchedCfg && !isDefaultPack) {
          return new Response('OK', { status: 200 });
        }

        const packType = matchedCfg?.pack_type || getPackTypeFromReward(normTitle);
        const packCount = Math.max(1, Number(matchedCfg?.pack_count) || 1);

        await processAndDeliverRedemption({
          eventId,
          rewardName: normTitle,
          viewerName,
          redeemedAt,
          packType,
          packCount,
        });
      }

      // B) DONACIÓN DE BITS
      else if (subType === 'channel.cheer') {
        const bits = Number(ev.bits || 0);
        const viewerName = ev.is_anonymous ? '' : (ev.user_name || ev.user_login || '');
        if (!viewerName) return new Response('OK', { status: 200 });

        const matched = activeConfigs
          .filter((c: any) => c.event_type === 'bits' && bits >= (Number(c.min_bits) || 100))
          .sort((a: any, b: any) => (Number(b.min_bits) || 100) - (Number(a.min_bits) || 100))[0];

        if (matched) {
          await processAndDeliverRedemption({
            eventId: messageId,
            rewardName: matched.reward_name,
            viewerName,
            redeemedAt: new Date().toISOString(),
            packType: matched.pack_type,
            packCount: Math.max(1, Number(matched.pack_count) || 1),
          });
        }
      }

      // C) SUSCRIPCIÓN DIRECTA
      else if (subType === 'channel.subscribe') {
        if (ev.is_gift) return new Response('OK', { status: 200 });
        const viewerName = ev.user_name || ev.user_login || '';
        if (!viewerName) return new Response('OK', { status: 200 });

        const matched = activeConfigs.find((c: any) => c.event_type === 'sub');
        if (matched) {
          await processAndDeliverRedemption({
            eventId: messageId,
            rewardName: matched.reward_name,
            viewerName,
            redeemedAt: new Date().toISOString(),
            packType: matched.pack_type,
            packCount: Math.max(1, Number(matched.pack_count) || 1),
          });
        }
      }

      // D) RESUB / MENSAJE DE SUSCRIPCIÓN
      else if (subType === 'channel.subscription.message') {
        const viewerName = ev.user_name || ev.user_login || '';
        if (!viewerName) return new Response('OK', { status: 200 });

        const matched = activeConfigs.find((c: any) => c.event_type === 'sub');
        if (matched) {
          await processAndDeliverRedemption({
            eventId: messageId,
            rewardName: matched.reward_name,
            viewerName,
            redeemedAt: new Date().toISOString(),
            packType: matched.pack_type,
            packCount: Math.max(1, Number(matched.pack_count) || 1),
          });
        }
      }

      // E) SUBS REGALADAS
      else if (subType === 'channel.subscription.gift') {
        const gifterName = ev.is_anonymous ? '' : (ev.user_name || ev.user_login || '');
        if (!gifterName) return new Response('OK', { status: 200 });

        const totalSubs = Number(ev.total || 1);
        const matched = activeConfigs.find((c: any) => c.event_type === 'gift_sub');

        if (matched) {
          const baseCount = Math.max(1, Number(matched.pack_count) || 1);
          const effectiveCount =
            matched.gift_sub_mode === 'per_sub' ? baseCount * totalSubs : baseCount;

          await processAndDeliverRedemption({
            eventId: messageId,
            rewardName: matched.reward_name,
            viewerName: gifterName,
            redeemedAt: new Date().toISOString(),
            packType: matched.pack_type,
            packCount: effectiveCount,
          });
        }
      }
    } catch (procErr) {
      console.error('[EventSub] Error procesando notificación:', procErr);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
});
