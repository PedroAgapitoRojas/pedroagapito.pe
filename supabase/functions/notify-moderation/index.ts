import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('MODERATION_FROM_EMAIL') || 'PedroAgapito Comunidad <onboarding@resend.dev>';
    if (!resendKey) throw new Error('RESEND_API_KEY no está configurada.');

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401, headers: cors });

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: admin } = await adminClient.from('admin_users').select('user_id').eq('user_id', user.id).eq('active', true).maybeSingle();
    if (!admin) return new Response(JSON.stringify({ error: 'ADMIN_REQUIRED' }), { status: 403, headers: cors });

    const { notification_id } = await req.json();
    if (!notification_id) return new Response(JSON.stringify({ error: 'notification_id requerido' }), { status: 400, headers: cors });

    const { data: notification, error: nError } = await adminClient.from('community_notifications').select('id,user_id,title,message,reason,created_at').eq('id', notification_id).single();
    if (nError || !notification) throw new Error('Aviso no encontrado.');
    const { data: target, error: uError } = await adminClient.auth.admin.getUserById(notification.user_id);
    if (uError || !target?.user?.email) throw new Error('No se encontró el correo del usuario.');

    const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#142019"><div style="max-width:620px;margin:40px auto;background:#fff;border:1px solid #d6e1d8;border-radius:18px;padding:32px"><div style="font-size:12px;letter-spacing:.16em;color:#167a52;font-weight:800">PEDROAGAPITO.PE · COMUNIDAD</div><h1 style="font-size:26px;margin:18px 0 10px">${escapeHtml(notification.title)}</h1><p style="font-size:16px;line-height:1.65">${escapeHtml(notification.message)}</p>${notification.reason ? `<div style="margin-top:20px;padding:16px;background:#eef8f2;border-left:4px solid #167a52;border-radius:8px"><strong>Motivo:</strong><br>${escapeHtml(notification.reason)}</div>` : ''}<p style="margin-top:28px;color:#526159;font-size:13px;line-height:1.5">Puedes revisar este aviso desde tu perfil dentro de la Comunidad.</p></div></body></html>`;
    const response = await fetch('https://api.resend.com/emails', { method:'POST', headers:{Authorization:`Bearer ${resendKey}`,'Content-Type':'application/json'}, body:JSON.stringify({from,to:[target.user.email],subject:notification.title,html}) });
    if (!response.ok) throw new Error(`Resend respondió ${response.status}.`);
    return new Response(JSON.stringify({ ok:true }), { status:200, headers:cors });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Error inesperado' }), { status:500, headers:cors });
  }
});

function escapeHtml(value: unknown) {
  return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
