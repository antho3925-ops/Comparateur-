/* ---------------------------------------------------------------------------
   Chez Eva — contenu du site
   ---------------------------------------------------------------------------
   C'est LE SEUL fichier à modifier au quotidien.
   Tout ce qui est écrit ici s'affiche automatiquement sur le site :
   les masseuses, les horaires, les tarifs, la galerie et les coordonnées.

   Pour ajouter une masseuse :
     1. déposer sa photo dans  photos/masseuses/   (ex. : luna.jpg)
     2. copier un bloc { ... } ci-dessous, le coller à la suite,
        et remplacer le texte entre les guillemets.
     3. enregistrer le fichier, puis rafraîchir la page (F5).

   Une masseuse sans photo s'affiche quand même, avec son initiale.
--------------------------------------------------------------------------- */

const SALON = {
  nom: 'Chez Eva',
  slogan: 'Salon de massage érotique & tantrique',
  ville: 'La Chaux-de-Fonds',
  site: 'https://chez-eva.ch',
  adresse: 'Rue du Pont 34',
  codePostal: '2300 La Chaux-de-Fonds',
  telephone: '+41 79 153 27 78',   // <- votre numéro
  whatsapp: '+41791532778',        // <- même numéro, sans espaces, pour le lien WhatsApp
  email: '',                       // <- une adresse ici fait apparaître le bouton e-mail
  parking: 'Entrée discrète, stationnement à proximité.',
  photoEntree: 'photos/salon/entree.jpg',   // la façade, pour trouver la porte sans hésiter
  photoEntreeLegende: "L'entrée de l'immeuble, Rue du Pont 34",
};

/* Le texte d'accueil (le « mot du salon »).
   Chaque paragraphe est une ligne entre guillemets, séparée par une virgule. */
const PRESENTATION = [
  "Cela fait des années que nous accompagnons une clientèle fidèle, discrète et exigeante. Des années à affiner un savoir-faire, à former nos masseuses et à cultiver une seule idée : le massage érotique est un art du soin avant d'être autre chose.",
  "Aujourd'hui, nous ouvrons un nouveau chapitre : Chez Eva s'installe à La Chaux-de-Fonds. Un écrin chaleureux, pensé pour la détente, la lumière douce et le silence, à deux pas du centre — avec la même exigence de qualité et la même discrétion absolue.",
  "Vous serez reçu sans précipitation, dans un cadre propre et raffiné, par une masseuse attentive qui prend le temps de comprendre ce que vous venez chercher. Rien n'est imposé, tout est proposé. Ici, on respire.",
];

/* Les trois arguments affichés sous le mot du salon. */
const ATOUTS = [
  { titre: "Des années d'expérience", texte: "Un savoir-faire éprouvé, patiemment affiné, et des centaines de clients qui reviennent." },
  { titre: 'Discrétion totale',       texte: "Entrée à l'abri des regards, aucune trace, aucun jugement. Ce qui se passe ici reste ici." },
  { titre: 'Un cadre soigné',         texte: "Cabines chauffées, linge frais à chaque soin, douche à disposition, huiles de qualité." },
];

/* Les façons de prendre rendez-vous, affichées sous le mot du salon.
   `bouton` vaut 'telephone', 'whatsapp' ou 'formulaire' ; le site compose
   le lien correspondant tout seul. La carte « formulaire » disparaît
   automatiquement si la prise de rendez-vous en ligne n'est pas active. */
const PRISE_DE_RDV = [
  {
    titre: 'Par téléphone',
    texte: "Le plus direct. Nous vérifions la disponibilité avec vous, nous répondons à vos questions, et le rendez-vous est fixé dans la minute.",
    bouton: 'telephone',
  },
  {
    titre: 'Par WhatsApp',
    texte: "Si vous préférez écrire, ou appeler depuis l'étranger. Même numéro, même discrétion.",
    bouton: 'whatsapp',
  },
  {
    titre: 'En ligne, à toute heure',
    texte: "Choisissez la masseuse, le soin et l'heure qui vous arrange. Nous vous rappelons pour confirmer. Une masseuse annoncée peut même être réservée avant son arrivée.",
    bouton: 'formulaire',
  },
];

const PRISE_DE_RDV_TITRE = 'Trois façons de prendre rendez-vous';

/* --------------------------------- MASSEUSES ------------------------------- */
/* `photo`  = la grande photo de la fiche.
   `photos` = les petites vignettes sous la fiche (cliquables en plein écran).  */
const MASSEUSES = [
  {
    prenom: 'Mina',
    photo: 'photos/masseuses/mina-1.jpg',
    photos: [
      'photos/masseuses/mina-1.jpg',
      'photos/masseuses/mina-2.jpg',
      'photos/masseuses/mina-3.jpg',
      'photos/masseuses/mina-4.jpg',
    ],
    origine: 'Française',
    langues: 'Français, anglais, espagnol',
    specialites: ['Tantra', 'Tantra réciproque', 'Body body', 'Érotique'],
    presentation: "Française, Mina est spécialiste du tantra : un massage lent, enveloppant, affiné au fil des années. Douce, raffinée et attentionnée, elle prend le temps de vous accueillir et de comprendre ce que vous venez chercher avant que les mains ne parlent. Rien n'est pressé — chaque soin est pensé pour vous seul.",
    disponible: true,
    telephone: '',  // son numéro à elle ; vide = on appelle celui du salon
    debut: null,    // 'AAAA-MM-JJ' pour une présence limitée dans le temps
    fin: null,
  },
];

/* Le texte affiché sous le titre de la section. */
const MASSEUSES_INTRO = "Rendez-vous à convenir par téléphone : nous vous dirons sans détour qui vous reçoit, ce qu'elle propose et à quel moment.";

/* ---------------------------------- HORAIRES ------------------------------- */
const HORAIRES = [
  { jour: 'Lundi',    heures: '09h00 – 21h00' },
  { jour: 'Mardi',    heures: '09h00 – 21h00' },
  { jour: 'Mercredi', heures: '09h00 – 21h00' },
  { jour: 'Jeudi',    heures: '09h00 – 21h00' },
  { jour: 'Vendredi', heures: '09h00 – 21h00' },
  { jour: 'Samedi',   heures: '09h00 – 21h00' },
  { jour: 'Dimanche', heures: '09h00 – 21h00' },
];

const HORAIRES_NOTE = "Ouvert sept jours sur sept, dimanche compris. Sur rendez-vous, de préférence une à deux heures à l'avance ; les demandes en dehors de ces horaires sont étudiées au cas par cas.";

/* ----------------------------------- TARIFS -------------------------------- */
const TARIFS = [
  {
    nom: 'Massage érotique',
    resume: "Huiles chaudes et mains expertes, tout le corps, dans une montée progressive.",
    lignes: [
      { duree: '30 minutes', prix: 'CHF 150.–' },
    ],
  },
  {
    nom: 'Massage body body',
    resume: "Corps à corps intégral : la masseuse masse avec tout son corps, glissé et enveloppant.",
    lignes: [
      { duree: '40 minutes', prix: 'CHF 250.–' },
    ],
  },
  {
    nom: 'Massage tantra',
    resume: "Le soin signature de la maison : respiration guidée, lenteur et travail sur tout le corps.",
    lignes: [
      { duree: '40 minutes', prix: 'CHF 200.–' },
      { duree: '1 heure',    prix: 'CHF 300.–' },
    ],
    vedette: true,
  },
  {
    nom: 'Massage tantra réciproque',
    resume: "Le même rituel, à deux : vous massez à votre tour, guidé pas à pas par la masseuse.",
    lignes: [
      { duree: '40 minutes', prix: 'CHF 250.–' },
      { duree: '1 heure',    prix: 'CHF 350.–' },
    ],
  },
];

/* Les suppléments, affichés sous les tarifs. */
const SUPPLEMENTS = [
  { nom: 'Supplément prostatique',    prix: 'CHF 50.–' },
  { nom: 'Deuxième éjaculation',      prix: 'CHF 50.–' },
];

const TARIFS_NOTE = "Paiement en espèces ou par Twint sur place. Les tarifs comprennent la cabine, le linge, la douche et une boisson.";

/* ---------------------------------- GALERIE -------------------------------- */
/* Déposer les images dans photos/salon/ puis ajouter une ligne ici. */
const GALERIE = [
  { src: 'photos/salon/salon-1.jpg', legende: 'Le futon et la cheminée' },
  { src: 'photos/salon/salon-2.jpg', legende: "L'espace tantra" },
  { src: 'photos/salon/salon-3.jpg', legende: 'Le miroir doré' },
];

/* ----------------------------------- REGLES -------------------------------- */
const REGLES = [
  'Salon réservé aux personnes majeures (18 ans révolus).',
  "Hygiène irréprochable exigée — une douche est à votre disposition à l'arrivée.",
  "La masseuse est libre d'accepter ou de refuser une demande, sans discussion.",
  'Aucune photo, aucune vidéo, aucun enregistrement dans le salon.',
  "Toute personne en état d'ébriété ou irrespectueuse sera raccompagnée.",
];
