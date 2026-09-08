// Edge Function : suppression definitive du compte et de toutes ses donnees.
//
// Apple l'exige (App Store Review Guidelines 5.1.1) : une app qui permet de
// creer un compte doit permettre de le supprimer depuis l'app. Sans cela, la
// soumission est refusee.
//
// La suppression demande la cle service_role (un utilisateur ne peut pas
// s'effacer lui-meme d'auth.users), d'ou le passage par une fonction serveur.
//
// Deploiement :
//   supabase functions deploy supprimer-compte

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

function json(corps: unknown, status = 200) {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ erreur: 'methode_non_autorisee' }, 405);

  const autorisation = req.headers.get('Authorization') ?? '';
  if (!autorisation) return json({ erreur: 'non_authentifie' }, 401);

  // Premier client : celui de l'utilisateur, pour savoir qui demande.
  const clientUtilisateur = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: autorisation } } },
  );

  const { data: auth } = await clientUtilisateur.auth.getUser();
  const utilisateur = auth?.user;
  if (!utilisateur) return json({ erreur: 'non_authentifie' }, 401);

  // Second client : celui qui a le droit d'effacer.
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Les photos ne partent pas en cascade : on vide le dossier a la main.
  const { data: fichiers } = await admin.storage
    .from('photos-repas')
    .list(utilisateur.id);

  if (fichiers?.length) {
    await admin.storage
      .from('photos-repas')
      .remove(fichiers.map((f) => `${utilisateur.id}/${f.name}`));
  }

  // public.users et toutes les tables liees partent en cascade avec auth.users.
  const { error } = await admin.auth.admin.deleteUser(utilisateur.id);

  if (error) {
    console.error('suppression de compte en echec', error);
    return json({ erreur: 'suppression_impossible' }, 500);
  }

  console.log(`compte ${utilisateur.id} supprime`);
  return json({ supprime: true });
});
