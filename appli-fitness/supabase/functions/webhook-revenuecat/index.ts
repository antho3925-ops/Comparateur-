// Webhook RevenueCat -> users.palier.
//
// C'est ce qui rend les paliers reels : l'app peut afficher ce qu'elle veut,
// seul ce webhook (service_role) peut ecrire users.palier, et c'est cette
// colonne que lisent le quota de photos et les classements.
//
// Deploiement :
//   supabase secrets set REVENUECAT_AUTH_HEADER=<valeur secrete au choix>
//   supabase functions deploy webhook-revenuecat --no-verify-jwt
// Puis, dans RevenueCat > Integrations > Webhooks, renseigner l'URL de la
// fonction et la meme valeur dans le champ Authorization header.

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Identifiants des entitlements declares dans RevenueCat.
const ENTITLEMENT_PREMIUM = Deno.env.get('ENTITLEMENT_PREMIUM') ?? 'premium';
const ENTITLEMENT_STANDARD = Deno.env.get('ENTITLEMENT_STANDARD') ?? 'standard';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('methode_non_autorisee', { status: 405 });
  }

  const attendu = Deno.env.get('REVENUECAT_AUTH_HEADER');
  if (!attendu || req.headers.get('Authorization') !== attendu) {
    return new Response('non_autorise', { status: 401 });
  }

  const { event } = await req.json();
  if (!event?.app_user_id) {
    return new Response('evenement_sans_utilisateur', { status: 400 });
  }

  // app_user_id vaut l'id Supabase : l'app appelle Purchases.logIn(user.id).
  const identifiants: string[] = event.entitlement_ids
    ?? (event.entitlement_id ? [event.entitlement_id] : []);

  const expire = ['CANCELLATION', 'EXPIRATION', 'SUBSCRIPTION_PAUSED'].includes(event.type);

  let palier: 'gratuit' | 'standard' | 'premium' = 'gratuit';
  if (!expire) {
    if (identifiants.includes(ENTITLEMENT_PREMIUM)) palier = 'premium';
    else if (identifiants.includes(ENTITLEMENT_STANDARD)) palier = 'standard';
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await supabase
    .from('users')
    .update({ palier })
    .eq('id', event.app_user_id);

  if (error) {
    console.error('mise a jour du palier en echec', error);
    return new Response('mise_a_jour_impossible', { status: 500 });
  }

  console.log(`palier ${palier} pour ${event.app_user_id} (${event.type})`);
  return new Response(JSON.stringify({ palier }), {
    headers: { 'content-type': 'application/json' },
  });
});
