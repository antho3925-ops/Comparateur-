// Fonction serveur Netlify : réception du formulaire de devis.
// - Validation complète côté serveur (le navigateur n'est jamais considéré comme fiable)
// - Anti-spam : champ piège invisible + délai minimum de remplissage + limites de longueur
// - Envoi de l'e-mail via l'API HTTP de Resend (aucune dépendance npm)
//
// Variables d'environnement (Netlify > Site configuration > Environment variables) :
//   RESEND_API_KEY  clé API Resend (obligatoire)
//   MAIL_FROM       expéditeur vérifié chez Resend, ex. "Site JON'ART <site@votre-domaine.be>"
//   MAIL_TO         destinataire (défaut : jonartsrl@hotmail.com)

const MAIL_TO = process.env.MAIL_TO || 'jonartsrl@hotmail.com';
const TRAVAUX = ['enduits', 'salle-de-bain', 'peinture', 'carrelage', 'escalier', 'renovation', 'autre'];
const DELAIS = ['', 'urgent', '3mois', '6mois', 'flexible'];
const THANKS = { fr: '/devis/merci/', es: '/es/presupuesto/gracias/' };

// Nettoie une valeur : caractères de contrôle retirés, retours à la ligne seulement si multiligne.
const clean = (v, max, multiline = false) => {
  let s = String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = multiline ? s.replace(/\r\n?/g, '\n') : s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max);
};
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Retourne { data } si tout est valide, sinon { errors }. */
function validate(form) {
  const errors = [];
  const data = {
    lang: form.get('lang') === 'es' ? 'es' : 'fr',
    nom: clean(form.get('nom'), 100),
    telephone: clean(form.get('telephone'), 30),
    email: clean(form.get('email'), 150),
    commune: clean(form.get('commune'), 100),
    travaux: form.getAll('travaux').map((t) => clean(t, 30)).filter((t) => TRAVAUX.includes(t)),
    surface: clean(form.get('surface'), 6),
    delai: clean(form.get('delai'), 20),
    message: clean(form.get('message'), 3000, true),
    consentement: form.get('consentement') === 'oui',
  };
  if (data.nom.length < 2) errors.push('nom');
  if (!/^[0-9+()./ -]{8,30}$/.test(data.telephone)) errors.push('telephone');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.push('email');
  if (data.commune.length < 2) errors.push('commune');
  if (data.message.length < 10) errors.push('message');
  if (data.surface && !/^\d{1,5}$/.test(data.surface)) errors.push('surface');
  if (!DELAIS.includes(data.delai)) errors.push('delai');
  if (!data.consentement) errors.push('consentement');
  return errors.length ? { errors } : { data };
}

/** Détection de robots : champ piège rempli, envoi trop rapide, ou trop de liens. */
function isSpam(form, message) {
  if (clean(form.get('site_web'), 200)) return true;
  const ts = Number(form.get('ts'));
  if (ts && Date.now() - ts < 3000) return true; // rempli en moins de 3 secondes
  if ((message.match(/https?:\/\//g) || []).length > 2) return true;
  return false;
}

function buildEmail(d) {
  const rows = [
    ['Nom', d.nom], ['Téléphone', d.telephone], ['E-mail', d.email], ['Commune', d.commune],
    ['Travaux', d.travaux.join(', ') || '—'], ['Surface', d.surface ? `${d.surface} m²` : '—'],
    ['Délai', d.delai || '—'], ['Langue', d.lang.toUpperCase()],
  ];
  const text = rows.map(([k, v]) => `${k} : ${v}`).join('\n') + `\n\nMessage :\n${d.message}\n`;
  const html = `<h2>Nouvelle demande de devis</h2><table cellpadding="6">${rows
    .map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`).join('')}</table>
    <h3>Message</h3><p style="white-space:pre-wrap">${esc(d.message)}</p>`;
  return { text, html };
}

export default async (req) => {
  const wantsJson = (req.headers.get('accept') || '').includes('application/json');
  const reply = (status, body, lang = 'fr') => {
    if (wantsJson) return Response.json(body, { status });
    if (status === 200) return new Response(null, { status: 303, headers: { Location: THANKS[lang] } });
    return new Response(`<!doctype html><meta charset="utf-8"><p>${esc(body.error)}</p><p><a href="javascript:history.back()">Retour</a></p>`, {
      status, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  };

  if (req.method !== 'POST') return reply(405, { error: 'Méthode non autorisée' });
  if (Number(req.headers.get('content-length') || 0) > 20000) return reply(413, { error: 'Demande trop volumineuse' });

  let form;
  try { form = await req.formData(); } catch { return reply(400, { error: 'Formulaire illisible' }); }

  const { data, errors } = validate(form);
  if (errors) return reply(422, { error: `Champs invalides : ${errors.join(', ')}`, fields: errors });

  // Un robot reçoit une réponse "succès" pour ne pas l'inciter à réessayer.
  if (isSpam(form, data.message)) return reply(200, { ok: true }, data.lang);

  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
    console.error('Configuration e-mail manquante (RESEND_API_KEY / MAIL_FROM)');
    return reply(500, { error: 'Service momentanément indisponible' });
  }

  const { text, html } = buildEmail(data);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [MAIL_TO],
      reply_to: data.email,
      subject: `Demande de devis — ${data.nom} (${data.commune})`,
      text,
      html,
    }),
  });
  if (!res.ok) {
    console.error('Échec Resend', res.status, await res.text());
    return reply(502, { error: "L'envoi a échoué" });
  }
  return reply(200, { ok: true }, data.lang);
};

export const config = { path: '/api/devis' };
