// Configuration du site Paytoocash.
//
// Tant que SUPABASE_URL et SUPABASE_ANON_KEY sont vides, le site fonctionne
// en mode démo : lecture seule, à partir de catalogue-paytoocash.json.
// Pour activer l'administration, suivre SUPABASE.md puis coller ici les deux
// valeurs trouvées dans Supabase > Project Settings > API.
//
// La clé « anon » est publique par conception : la sécurité repose sur les
// règles RLS définies dans supabase/schema.sql. Ne jamais coller ici la clé
// « service_role ».

export const CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Compte administrateur créé dans Supabase. S'il est renseigné, la page
  // /admin ne demande que le mot de passe.
  ADMIN_EMAIL: 'paytoocash@gmail.com',

  // Nom du bucket de stockage des photos (créé par schema.sql).
  BUCKET: 'photos',
};
