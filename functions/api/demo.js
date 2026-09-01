/**
 * POST /api/demo — réception des demandes de démo.
 *
 * Cloudflare Pages Function : la clé Resend reste côté serveur et n'est jamais
 * exposée au navigateur.
 *
 * Variables d'environnement à définir dans Cloudflare Pages :
 *   RESEND_API_KEY  (secret, obligatoire)
 *   DEMO_INBOX      (destinataire interne ; défaut : demo@karefully-app.com)
 *   DEMO_FROM       (expéditeur vérifié dans Resend ; défaut : Karefully <demo@karefully-app.com>)
 */

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

const SPECIALTIES = ['Chirurgie plastique & esthétique', 'Médecine esthétique', 'Autre'];
const VOLUMES = ['< 10', '10–30', '30–100', '> 100'];

const json = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

/** Échappe le HTML : le contenu du formulaire ne doit jamais être interprété dans l'e-mail. */
const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/** Normalise une valeur texte : chaîne coupée à `max`, ou chaîne vide. */
const clean = (value, max) =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function onRequest({ request, env }) {
    if (request.method !== 'POST') {
        return json({ ok: false, error: 'method_not_allowed' }, 405);
    }

    let payload;

    try {
        payload = await request.json();
    } catch {
        return json({ ok: false, error: 'invalid_json' }, 400);
    }

    if (!payload || typeof payload !== 'object') {
        return json({ ok: false, error: 'invalid_payload' }, 400);
    }

    // Honeypot : un robot remplit ce champ caché, un humain jamais.
    if (clean(payload.company_website, 200)) {
        return json({ ok: false, error: 'rejected' }, 400);
    }

    const name = clean(payload.name, 120);
    const email = clean(payload.email, 200);
    const clinic = clean(payload.clinic, 160);
    const specialty = clean(payload.specialty, 80);
    const phone = clean(payload.phone, 60);
    const volume = clean(payload.volume, 40);
    const message = clean(payload.message, 4000);
    const consent = payload.consent === true || payload.consent === 'on';

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    if (!name || !emailLooksValid || !clinic || !specialty || !consent) {
        return json({ ok: false, error: 'missing_fields' }, 400);
    }

    // Les listes déroulantes ne doivent accepter que les valeurs proposées.
    if (!SPECIALTIES.includes(specialty)) {
        return json({ ok: false, error: 'invalid_specialty' }, 400);
    }

    if (volume && !VOLUMES.includes(volume)) {
        return json({ ok: false, error: 'invalid_volume' }, 400);
    }

    if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY manquante : demande de démo non transmise.');
        return json({ ok: false, error: 'server_not_configured' }, 500);
    }

    const rows = [
        ['Nom et prénom', name],
        ['E-mail', email],
        ['Clinique / cabinet', clinic],
        ['Spécialité', specialty],
        ['Téléphone', phone || '—'],
        ['Interventions par mois', volume || '—'],
        ['Message', message || '—']
    ];

    const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#16262A;line-height:1.5">
  <h2 style="font-size:18px;margin:0 0 4px">Nouvelle demande de démo</h2>
  <p style="margin:0 0 18px;font-size:13px;color:#5A7276">Envoyée depuis karefully-app.com</p>
  <table style="border-collapse:collapse;font-size:14px">
${rows
    .map(
        ([label, value]) =>
            `    <tr><td style="padding:6px 16px 6px 0;color:#5A7276;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#16262A;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
    )
    .join('\n')}
  </table>
  <p style="margin:18px 0 0;font-size:12px;color:#5A7276">Consentement de recontact : accordé.</p>
</div>`;

    const text = rows.map(([label, value]) => `${label} : ${value}`).join('\n');

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: env.DEMO_FROM || 'Karefully <demo@karefully-app.com>',
                to: [env.DEMO_INBOX || 'demo@karefully-app.com'],
                reply_to: email,
                subject: `Demande de démo — ${clinic}`,
                html,
                text
            })
        });

        if (!response.ok) {
            const detail = await response.text();
            console.error('Resend a refusé l’envoi', response.status, detail);
            return json({ ok: false, error: 'send_failed' }, 502);
        }
    } catch (error) {
        console.error('Appel Resend impossible', error);
        return json({ ok: false, error: 'send_failed' }, 502);
    }

    return json({ ok: true });
}
