/* ---------------------------------------------------------------------------
   Mina Tantra — contenu du site
   ---------------------------------------------------------------------------
   C'est LE SEUL fichier a modifier au quotidien.
   Tout ce qui est ecrit ici s'affiche automatiquement sur le site :
   les masseuses, les horaires, les tarifs, la galerie et les coordonnees.

   Pour ajouter une masseuse :
     1. deposer sa photo dans  photos/masseuses/   (ex. : luna.jpg)
     2. copier un bloc { ... } ci-dessous, le coller a la suite,
        et remplacer le texte entre les guillemets.
     3. enregistrer le fichier, puis rafraichir la page (F5).

   Une masseuse sans photo s'affiche quand meme, avec son initiale.
--------------------------------------------------------------------------- */

const SALON = {
  nom: 'Mina Tantra',
  slogan: 'Salon de massage erotique & tantrique',
  ville: 'La Chaux-de-Fonds',
  adresse: 'La Chaux-de-Fonds, Neuchatel — adresse exacte communiquee lors de la prise de rendez-vous',
  telephone: '+41 77 276 13 70',   // <- votre numero
  whatsapp: '+41772761370',        // <- meme numero, sans espaces, pour le lien WhatsApp
  email: '',                       // <- une adresse ici fait apparaitre le bouton e-mail
  parking: 'Parking prive a proximite immediate, entree discrete.',
};

/* Le texte d'accueil (le « mot du salon »).
   Chaque paragraphe est une ligne entre guillemets, separee par une virgule. */
const PRESENTATION = [
  "Cela fait des annees que Mina Tantra accompagne une clientele fidele, discrete et exigeante. Des annees a affiner un savoir-faire, a former nos masseuses et a cultiver une seule idee : le massage erotique est un art du soin avant d'etre autre chose.",
  "Aujourd'hui, nous ouvrons un nouveau chapitre : Mina Tantra s'installe a La Chaux-de-Fonds. Un ecrin chaleureux, pense pour la detente, la lumiere douce et le silence, a deux pas du centre — avec la meme exigence de qualite et la meme discretion absolue.",
  "Vous serez recu sans precipitation, dans un cadre propre et raffine, par des masseuses attentives qui prennent le temps de comprendre ce que vous venez chercher. Rien n'est impose, tout est propose. Ici, on respire.",
];

/* Les trois arguments affiches sous le mot du salon. */
const ATOUTS = [
  { titre: 'Des annees d\'experience', texte: "Une equipe formee, un savoir-faire eprouve et des centaines de clients qui reviennent." },
  { titre: 'Discretion totale', texte: "Entree a l'abri des regards, aucune trace, aucun jugement. Ce qui se passe ici reste ici." },
  { titre: 'Un cadre soigne', texte: "Cabines chauffees, linge frais a chaque soin, douche a disposition, huiles de qualite." },
];

/* --------------------------------- MASSEUSES ------------------------------- */
const MASSEUSES = [
  {
    prenom: 'Mina',
    photo: 'photos/masseuses/mina.jpg',
    age: 29,
    origine: 'Bresil',
    langues: 'Francais, portugais, anglais',
    specialites: ['Tantra', 'Body-body', 'Californien'],
    presentation: "Fondatrice du salon. Douce, solaire et profondement a l'ecoute, Mina pratique un tantra lent qui prend son temps.",
    disponible: true,
  },
  {
    prenom: 'Lena',
    photo: 'photos/masseuses/lena.jpg',
    age: 26,
    origine: 'Europe de l\'Est',
    langues: 'Francais, anglais, russe',
    specialites: ['Nuru', 'Body-body', 'Quatre mains'],
    presentation: "Petillante et joueuse, Lena aime les massages enveloppants et les ambiances legeres.",
    disponible: true,
  },
  {
    prenom: 'Sofia',
    photo: 'photos/masseuses/sofia.jpg',
    age: 32,
    origine: 'Espagne',
    langues: 'Francais, espagnol',
    specialites: ['Tantra', 'Prostatique', 'Relaxant'],
    presentation: "Experimentee et posee, Sofia est la masseuse des premieres fois : elle explique, rassure et guide.",
    disponible: false,   // false = affiche « bientot de retour »
  },
];

/* ---------------------------------- HORAIRES ------------------------------- */
const HORAIRES = [
  { jour: 'Lundi',    heures: '10h00 – 22h00' },
  { jour: 'Mardi',    heures: '10h00 – 22h00' },
  { jour: 'Mercredi', heures: '10h00 – 22h00' },
  { jour: 'Jeudi',    heures: '10h00 – 22h00' },
  { jour: 'Vendredi', heures: '10h00 – 23h00' },
  { jour: 'Samedi',   heures: '12h00 – 23h00' },
  { jour: 'Dimanche', heures: 'Ferme' },
];

const HORAIRES_NOTE = "Sur rendez-vous, de preference une a deux heures a l'avance. Les demandes en dehors de ces horaires sont etudiees au cas par cas.";

/* ----------------------------------- TARIFS -------------------------------- */
const TARIFS = [
  {
    nom: 'Massage sensuel',
    resume: 'Le classique de la maison : huiles chaudes, corps a corps progressif, tout le dos et le devant.',
    lignes: [
      { duree: '30 minutes', prix: 'CHF 120.–' },
      { duree: '45 minutes', prix: 'CHF 160.–' },
      { duree: '1 heure',    prix: 'CHF 200.–' },
    ],
  },
  {
    nom: 'Rituel tantrique',
    resume: 'Un soin long, lent et complet, respiration guidee et travail sur tout le corps.',
    lignes: [
      { duree: '1 heure',     prix: 'CHF 250.–' },
      { duree: '1 h 30',      prix: 'CHF 330.–' },
      { duree: '2 heures',    prix: 'CHF 420.–' },
    ],
    vedette: true,
  },
  {
    nom: 'Quatre mains',
    resume: 'Deux masseuses, un seul rythme. L\'experience la plus demandee du salon.',
    lignes: [
      { duree: '45 minutes', prix: 'CHF 320.–' },
      { duree: '1 heure',    prix: 'CHF 400.–' },
    ],
  },
];

const TARIFS_NOTE = "Paiement en especes ou par Twint sur place. Les tarifs comprennent la cabine, le linge, la douche et une boisson.";

/* ---------------------------------- GALERIE -------------------------------- */
/* Deposer les images dans photos/salon/ puis ajouter une ligne ici. */
const GALERIE = [
  { src: 'photos/salon/salon-1.jpg', legende: 'La cabine principale' },
  { src: 'photos/salon/salon-2.jpg', legende: 'L\'espace d\'accueil' },
  { src: 'photos/salon/salon-3.jpg', legende: 'La douche' },
  { src: 'photos/salon/salon-4.jpg', legende: 'Les huiles' },
];

/* ----------------------------------- REGLES -------------------------------- */
const REGLES = [
  'Salon reserve aux personnes majeures (18 ans revolus).',
  'Hygiene irreprochable exigee — une douche est a votre disposition a l\'arrivee.',
  'Les masseuses sont libres d\'accepter ou de refuser une demande, sans discussion.',
  'Aucune photo, aucune video, aucun enregistrement dans le salon.',
  'Toute personne en etat d\'ebriete ou irrespectueuse sera raccompagnee.',
];
