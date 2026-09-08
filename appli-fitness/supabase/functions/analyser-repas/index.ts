// Edge Function : photo -> aliments + calories + macros.
//
// Elle existe pour une raison simple : la cle du modele de vision ne doit
// jamais se trouver dans l'app mobile, qui est distribuee a tout le monde.
// L'app envoie l'image, la fonction appelle le modele et renvoie l'estimation.
//
// Deploiement :
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy analyser-repas

import { createClient } from 'jsr:@supabase/supabase-js@2';

const MODELE = Deno.env.get('MODELE_VISION') ?? 'claude-sonnet-5';
const CLE_ANTHROPIC = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

const QUOTAS: Record<string, number | null> = {
  gratuit: 1,
  standard: 6,
  premium: null,
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

const OUTIL = {
  name: 'enregistrer_analyse',
  description: "Enregistre l'estimation nutritionnelle du repas photographie.",
  input_schema: {
    type: 'object',
    properties: {
      plat: {
        type: 'string',
        description: 'Nom court du plat en francais, ex. "Poulet riz brocolis".',
      },
      confiance: {
        type: 'string',
        enum: ['haute', 'moyenne', 'basse'],
        description: "Confiance dans l'estimation. 'basse' si la photo est ambigue.",
      },
      aliments: {
        type: 'array',
        description: 'Un element par aliment identifiable dans l\'assiette.',
        items: {
          type: 'object',
          properties: {
            nom: { type: 'string' },
            quantite: { type: 'string', description: 'Portion estimee, ex. "150 g".' },
            calories: { type: 'number' },
            proteines: { type: 'number', description: 'grammes' },
            glucides: { type: 'number', description: 'grammes' },
            lipides: { type: 'number', description: 'grammes' },
          },
          required: ['nom', 'quantite', 'calories', 'proteines', 'glucides', 'lipides'],
        },
      },
    },
    required: ['plat', 'confiance', 'aliments'],
  },
} as const;

const CONSIGNE = [
  "Tu estimes la valeur nutritionnelle d'un repas a partir d'une photo.",
  'Detaille aliment par aliment, en francais, avec des portions realistes',
  "deduites de la taille de l'assiette et des couverts visibles.",
  "Une estimation approximative vaut mieux qu'un refus : l'utilisateur corrige",
  "ensuite a la main. Si la photo ne montre pas de nourriture, renvoie une liste",
  "d'aliments vide et une confiance 'basse'.",
].join(' ');

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: autorisation } } },
  );

  const { data: auth } = await supabase.auth.getUser();
  const utilisateur = auth?.user;
  if (!utilisateur) return json({ erreur: 'non_authentifie' }, 401);

  let corps: { image_base64?: string; type_mime?: string };
  try {
    corps = await req.json();
  } catch {
    return json({ erreur: 'corps_illisible' }, 400);
  }

  const image = corps.image_base64;
  if (!image) return json({ erreur: 'image_manquante' }, 400);
  // ~1.4 Mo de base64 : au-dela l'app n'a pas redimensionne comme prevu.
  if (image.length > 1_400_000) return json({ erreur: 'image_trop_lourde' }, 413);

  // Le quota est verifie ici aussi, avant de payer un appel au modele.
  const { data: profil } = await supabase
    .from('users')
    .select('palier')
    .eq('id', utilisateur.id)
    .single();

  const quota = QUOTAS[profil?.palier ?? 'gratuit'];
  if (quota !== null && quota !== undefined) {
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const { count } = await supabase
      .from('meals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', utilisateur.id)
      .eq('date', aujourdhui);

    if ((count ?? 0) >= quota) {
      return json({ erreur: 'quota_photos_atteint', quota }, 402);
    }
  }

  if (!CLE_ANTHROPIC) return json({ erreur: 'cle_vision_absente' }, 500);

  const reponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': CLE_ANTHROPIC,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELE,
      max_tokens: 1024,
      system: CONSIGNE,
      tools: [OUTIL],
      tool_choice: { type: 'tool', name: OUTIL.name },
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: corps.type_mime ?? 'image/jpeg',
              data: image,
            },
          },
          { type: 'text', text: 'Estime la composition de ce repas.' },
        ],
      }],
    }),
  });

  if (!reponse.ok) {
    const detail = await reponse.text();
    console.error('appel vision en echec', reponse.status, detail);
    return json({ erreur: 'vision_indisponible' }, 502);
  }

  const resultat = await reponse.json();
  const bloc = (resultat.content ?? []).find((c: { type: string }) => c.type === 'tool_use');
  if (!bloc) return json({ erreur: 'reponse_vision_inattendue' }, 502);

  const analyse = bloc.input as {
    plat: string;
    confiance: string;
    aliments: Array<Record<string, number | string>>;
  };

  const somme = (champ: string) =>
    Math.round(
      analyse.aliments.reduce((total, a) => total + (Number(a[champ]) || 0), 0) * 10,
    ) / 10;

  return json({
    plat: analyse.plat,
    confiance: analyse.confiance,
    aliments: analyse.aliments,
    totaux: {
      calories: Math.round(somme('calories')),
      proteines: somme('proteines'),
      glucides: somme('glucides'),
      lipides: somme('lipides'),
    },
  });
});
