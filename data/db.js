// Fichier genere automatiquement par build.mjs - NE PAS EDITER A LA MAIN.
// Source de verite : data/meta.json, data/catalogue-prestations.json, data/assureurs/*.json
window.DB = {
  "meta": {
    "schema_version": "1.0",
    "annee_tarifaire": 2026,
    "devise": "CHF",
    "commentaire": "Parametres LAMal communs a tous les assureurs. La LAMal etant identique partout, seuls la franchise choisie, le modele et la prime varient d'un assureur a l'autre. Les valeurs ci-dessous servent de defaut : un fichier assureur peut les surcharger si une capture montre autre chose.",
    "lamal": {
      "franchises_adulte": [
        300,
        500,
        1000,
        1500,
        2000,
        2500
      ],
      "franchises_jeune_adulte": [
        300,
        500,
        1000,
        1500,
        2000,
        2500
      ],
      "franchises_enfant": [
        0,
        100,
        200,
        300,
        400,
        500,
        600
      ],
      "quote_part_taux": 0.1,
      "quote_part_plafond_annuel_adulte": 700,
      "quote_part_plafond_annuel_enfant": 350,
      "contribution_hospitaliere_par_jour_adulte": 15,
      "contribution_hospitaliere_par_jour_enfant": 0,
      "age_enfant_max": 18,
      "age_jeune_adulte_min": 19,
      "age_jeune_adulte_max": 25,
      "exonerations": [
        {
          "id": "maternite",
          "libelle": "Prestations de maternite",
          "franchise_applicable": false,
          "quote_part_applicable": false,
          "contribution_hospitaliere_applicable": false,
          "remarque": "Exoneration des la 13e semaine de grossesse et jusqu'a 8 semaines apres l'accouchement."
        }
      ],
      "quote_part_taux_medicament_original_substituable": 0.2,
      "remarque_medicaments": "Quote-part portee a 20% lorsqu'un generique existe et que l'original est neanmoins delivre, sauf exception medicale justifiee."
    },
    "modeles_assurance": [
      {
        "id": "standard",
        "libelle": "Standard (libre choix du medecin)"
      },
      {
        "id": "medecin_famille",
        "libelle": "Medecin de famille / reseau"
      },
      {
        "id": "hmo",
        "libelle": "HMO (cabinet de groupe)"
      },
      {
        "id": "telmed",
        "libelle": "Telemedecine"
      },
      {
        "id": "pharmacie",
        "libelle": "Pharmacie (pharmacien en 1er recours)"
      }
    ],
    "sources": [
      {
        "type": "reference_legale",
        "libelle": "LAMal / OAMal - parametres 2026",
        "a_verifier": true,
        "remarque": "A confirmer chaque annee. Modifier annee_tarifaire et les montants ci-dessus lors de la mise a jour annuelle."
      }
    ]
  },
  "catalogue": {
    "schema_version": "1.0",
    "commentaire": "Nomenclature commune. Chaque ligne de facture saisie dans l'outil pointe vers un 'id' de cette liste, et chaque assureur decrit ses remboursements en reference aux memes 'id'. C'est ce qui rend la comparaison possible entre caisses. Ne jamais renommer un 'id' existant : ajouter un nouvel id et marquer l'ancien 'actif': false. Le champ 'nature' distingue un remboursement de facture d'une prestation versee (capital, rente, indemnite journaliere) : ces dernieres n'entrent pas dans le calcul du reste a charge et sont presentees a part.",
    "groupes": [
      {
        "id": "ambulatoire",
        "libelle": "Soins ambulatoires"
      },
      {
        "id": "medicaments",
        "libelle": "Medicaments"
      },
      {
        "id": "hospitalier",
        "libelle": "Hospitalisation"
      },
      {
        "id": "dentaire",
        "libelle": "Soins dentaires"
      },
      {
        "id": "med_alternatives",
        "libelle": "Medecines alternatives"
      },
      {
        "id": "optique",
        "libelle": "Optique"
      },
      {
        "id": "prevention",
        "libelle": "Prevention et check-up"
      },
      {
        "id": "maternite",
        "libelle": "Maternite"
      },
      {
        "id": "etranger_urgence",
        "libelle": "Etranger, transport et sauvetage"
      },
      {
        "id": "aides_soins",
        "libelle": "Aides, appareils et soins a domicile"
      },
      {
        "id": "incapacite",
        "libelle": "Incapacite de travail"
      },
      {
        "id": "juridique",
        "libelle": "Protection juridique"
      },
      {
        "id": "capitaux",
        "libelle": "Capitaux et rentes"
      }
    ],
    "prestations": [
      {
        "id": "consultation_medecin",
        "libelle": "Consultation medecin generaliste",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "consultation_specialiste",
        "libelle": "Consultation medecin specialiste",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "urgence_ambulatoire",
        "libelle": "Urgences ambulatoires (permanence, hopital sans nuitee)",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "analyses_laboratoire",
        "libelle": "Analyses de laboratoire",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "imagerie_medicale",
        "libelle": "Imagerie (radio, IRM, CT, echographie)",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "physiotherapie_prescrite",
        "libelle": "Physiotherapie prescrite",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "remarque": "Prise en charge LAMal sur ordonnance, par series. Au-dela des series prescrites, bascule possible sur la LCA.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "psychotherapie_medicale",
        "libelle": "Psychotherapie sur prescription (therapeute admis LAMal)",
        "groupe": "ambulatoire",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement",
        "remarque": "Depuis le 1er juillet 2022, la psychotherapie psychologique prescrite et dispensee par un therapeute admis a facturer la LAMal est prise en charge par l'assurance de base : cette part est IDENTIQUE chez toutes les caisses. Une complementaire peut s'y ajouter pour ce qui reste a charge. Saisir le montant total et la part au tarif LAMal, comme pour une hospitalisation mi-privee."
      },
      {
        "id": "psychotherapie_non_medicale",
        "libelle": "Psychotherapie hors LAMal (sans prescription ou therapeute non admis)",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement",
        "remarque": "Reserve aux traitements qui ne relevent pas du tout de la base : absence de prescription medicale, therapeute non admis a facturer la LAMal, methode non reconnue. Pour une psychotherapie prescrite, utiliser l'entree mixte, qui fait jouer la base puis la complementaire."
      },
      {
        "id": "logopedie_ergotherapie",
        "libelle": "Logopedie / ergotherapie prescrite",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "medicaments_liste",
        "libelle": "Medicaments de la liste des specialites (LS)",
        "groupe": "medicaments",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "quote_part_taux_override": null,
        "remarque": "Quote-part 20% possible si un generique existe et que l'original est delivre. Mettre quote_part_taux_override a 0.20 sur la ligne de facture si le cas se presente.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "medicaments_hors_liste",
        "libelle": "Medicaments hors liste / non rembourses par la LAMal",
        "groupe": "medicaments",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "vaccins_lamal",
        "libelle": "Vaccinations recommandees (plan suisse)",
        "groupe": "prevention",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "vaccins_voyage",
        "libelle": "Vaccins de voyage",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "checkup_preventif",
        "libelle": "Check-up / bilan de sante preventif",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "depistage_lamal",
        "libelle": "Depistage pris en charge par la LAMal (mammographie, colon, etc.)",
        "groupe": "prevention",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "fitness_prevention",
        "libelle": "Abonnement fitness / cours de prevention",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "sevrage_tabagique",
        "libelle": "Sevrage tabagique / programmes sante",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "hospitalisation_commune",
        "libelle": "Hospitalisation division commune (canton de domicile)",
        "groupe": "hospitalier",
        "categorie": "LAMal",
        "unite_saisie": "montant_et_jours",
        "remarque": "Soumise a la franchise, a la quote-part et a la contribution journaliere aux frais de sejour.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "hospitalisation_demi_privee",
        "libelle": "Hospitalisation division mi-privee",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "remarque": "La LAMal prend en charge le tarif de la division commune ; la complementaire couvre le surcout. La facture de l'hopital distingue en general les deux montants.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "hospitalisation_privee",
        "libelle": "Hospitalisation division privee",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "hospitalisation_hors_canton",
        "libelle": "Hospitalisation hors canton / libre choix de l'hopital",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "libre_choix_medecin_hopital",
        "libelle": "Honoraires du medecin choisi (chef de service, operateur)",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "confort_hospitalier",
        "libelle": "Confort hospitalier (chambre, TV, accompagnant)",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "readaptation_cure",
        "libelle": "Readaptation / sejour de convalescence / cure balneaire",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "dentaire_soins",
        "libelle": "Soins dentaires courants (caries, detartrage, controle)",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "remarque": "Hors LAMal sauf accident ou maladie grave non evitable.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "dentaire_orthodontie",
        "libelle": "Orthodontie",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "dentaire_prothese_implant",
        "libelle": "Protheses, couronnes, implants",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "dentaire_accident",
        "libelle": "Soins dentaires suite a accident",
        "groupe": "dentaire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "remarque": "Pris en charge par la LAMal si l'accident n'est pas couvert par la LAA.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "osteopathie",
        "libelle": "Osteopathie",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "acupuncture",
        "libelle": "Acupuncture",
        "groupe": "med_alternatives",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_seances",
        "remarque": "Prise en charge LAMal uniquement si pratiquee par un medecin titulaire du titre reconnu ; sinon LCA.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "homeopathie",
        "libelle": "Homeopathie",
        "groupe": "med_alternatives",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_seances",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "naturopathie_phytotherapie",
        "libelle": "Naturopathie / phytotherapie",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "medecine_chinoise",
        "libelle": "Medecine traditionnelle chinoise",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "chiropratique",
        "libelle": "Chiropratique",
        "groupe": "med_alternatives",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_seances",
        "remarque": "Chiropraticien reconnu : prise en charge LAMal. Complements et depassements : LCA.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "massage_therapeutique",
        "libelle": "Massage therapeutique / reflexologie",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "autres_med_alternatives",
        "libelle": "Autre medecine alternative (therapeute reconnu ASCA / RME)",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "lunettes_lentilles_adulte",
        "libelle": "Lunettes et lentilles (adulte)",
        "groupe": "optique",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "lunettes_lentilles_enfant",
        "libelle": "Lunettes et lentilles (enfant)",
        "groupe": "optique",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "remarque": "Forfait LAMal annuel limite jusqu'a 18 ans, complete par la LCA.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "chirurgie_refractive",
        "libelle": "Chirurgie refractive (laser des yeux)",
        "groupe": "optique",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "maternite_controles",
        "libelle": "Controles de grossesse et prestations de maternite",
        "groupe": "maternite",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "exoneration_id": "maternite",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "accouchement",
        "libelle": "Accouchement (etablissement, maison de naissance, domicile)",
        "groupe": "maternite",
        "categorie": "LAMal",
        "unite_saisie": "montant_et_jours",
        "exoneration_id": "maternite",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "maternite_complements",
        "libelle": "Complements maternite (cours, sage-femme au-dela LAMal, forfait naissance)",
        "groupe": "maternite",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "transport_urgence",
        "libelle": "Transport medicalise / ambulance",
        "groupe": "etranger_urgence",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "remarque": "La LAMal ne prend en charge qu'une part limitee et plafonnee ; le solde releve de la LCA.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "sauvetage",
        "libelle": "Frais de sauvetage (helicoptere, montagne)",
        "groupe": "etranger_urgence",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "rapatriement",
        "libelle": "Rapatriement sanitaire",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "soins_etranger_urgence",
        "libelle": "Soins d'urgence a l'etranger",
        "groupe": "etranger_urgence",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "remarque": "La LAMal rembourse au maximum le double de ce que couterait le traitement en Suisse ; la LCA couvre generalement le surplus.",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "assistance_voyage",
        "libelle": "Assistance voyage (frais annexes, retour, hebergement)",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "soins_domicile_lamal",
        "libelle": "Soins a domicile prescrits (Spitex)",
        "groupe": "aides_soins",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "aide_menage",
        "libelle": "Aide au menage / aide familiale",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "moyens_auxiliaires_lamal",
        "libelle": "Moyens auxiliaires de la liste LiMA",
        "groupe": "aides_soins",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "moyens_auxiliaires_lca",
        "libelle": "Moyens auxiliaires hors liste (semelles, appareils auditifs, etc.)",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "indemnite_journaliere",
        "libelle": "Indemnite journaliere en cas d'incapacite de travail",
        "groupe": "incapacite",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "remarque": "Prestation versee, pas un remboursement de facture. Traitee separement dans le comparatif.",
        "actif": true,
        "nature": "prestation_versee"
      },
      {
        "id": "contraception",
        "libelle": "Contraception (pilule, sterilet, implant)",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "sterilisation",
        "libelle": "Sterilisation",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "gynecologie_preventive",
        "libelle": "Gynecologie preventive (complement au-dela de la LAMal)",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "depistage_lca",
        "libelle": "Depistage complementaire (mammographie, echographie hors LAMal)",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "garde_enfants_malades",
        "libelle": "Garde d'enfants malades a domicile",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "rattrapage_scolaire",
        "libelle": "Rattrapage scolaire apres accident ou maladie",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "chirurgie_esthetique_reconstructive",
        "libelle": "Chirurgie esthetique reconstructive (cicatrices, oreilles decollees)",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "confort_chirurgie_ambulatoire",
        "libelle": "Confort lors d'une chirurgie ambulatoire (hotel, taxi, repas)",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "chirurgie_ambulatoire",
        "libelle": "Chirurgie ambulatoire",
        "groupe": "ambulatoire",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "indemnite_hospitalisation",
        "libelle": "Indemnite journaliere d'hospitalisation",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "indemnite_hospitalisation_etranger",
        "libelle": "Indemnite journaliere d'hospitalisation a l'etranger",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "capital_hospitalisation",
        "libelle": "Capital forfaitaire par hospitalisation",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "capital_invalidite_accident",
        "libelle": "Capital invalidite suite a accident",
        "groupe": "capitaux",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "capital_deces_accident",
        "libelle": "Capital deces suite a accident",
        "groupe": "capitaux",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "rente_cancer_enfant",
        "libelle": "Rente mensuelle en cas de cancer de l'enfant",
        "groupe": "capitaux",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "indemnite_travail_menager",
        "libelle": "Indemnite journaliere d'incapacite de travail menager",
        "groupe": "incapacite",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "protection_juridique",
        "libelle": "Protection juridique (frais et honoraires d'avocat)",
        "groupe": "juridique",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true,
        "remarque": "Prise en charge de frais de litige, sans lien avec une facture medicale."
      },
      {
        "id": "libre_choix_specialiste",
        "libelle": "Libre choix du specialiste",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "recherche_sauvetage_etranger",
        "libelle": "Recherche et sauvetage a l'etranger",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "dentaire_prophylaxie",
        "libelle": "Controle prophylactique dentaire (detartrage, hygiene)",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "gardiennage_domicile",
        "libelle": "Gardiennage du domicile / des animaux pendant une hospitalisation",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "protection_juridique_patient",
        "libelle": "Protection juridique du patient (litiges medicaux)",
        "groupe": "juridique",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "soins_longue_duree",
        "libelle": "Forfait soins de longue duree / hotellerie EMS",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "indemnite_soins",
        "libelle": "Indemnite journaliere de soins (EMS)",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "soins_domicile_lca",
        "libelle": "Soins a domicile (complement au-dela de la LAMal)",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "procreation_assistee",
        "libelle": "Procreation medicalement assistee",
        "groupe": "maternite",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "tests_prenataux_genetiques",
        "libelle": "Tests prenataux et genetiques",
        "groupe": "maternite",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "indemnite_allaitement",
        "libelle": "Indemnite / allocation d'allaitement",
        "groupe": "maternite",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "forfait_accouchement",
        "libelle": "Forfait accouchement (ambulatoire, domicile, maison de naissance)",
        "groupe": "maternite",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "chambre_familiale_accouchement",
        "libelle": "Chambre familiale lors de l'accouchement",
        "groupe": "maternite",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "rooming_in",
        "libelle": "Rooming-in (sejour d'un parent aupres de son enfant hospitalise)",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "nuitee_hospitaliere_ambulatoire",
        "libelle": "Nuitee hospitaliere lors d'une intervention ambulatoire",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "innovations_medicales",
        "libelle": "Innovations et procedures medicales non prises en charge",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "implants_medicaux",
        "libelle": "Implants medicaux",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "centre_thermal",
        "libelle": "Centre thermal / bains",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "liberation_primes",
        "libelle": "Liberation du paiement des primes",
        "groupe": "capitaux",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "capital_invalidite_maladie",
        "libelle": "Capital invalidite suite a maladie",
        "groupe": "capitaux",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "capital_deces_maladie",
        "libelle": "Capital deces suite a maladie",
        "groupe": "capitaux",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "dommages_materiels",
        "libelle": "Dommages materiels consecutifs a un accident",
        "groupe": "capitaux",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "prestation_versee",
        "actif": true
      },
      {
        "id": "annulation_voyage",
        "libelle": "Frais d'annulation de voyage",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "voyage_frais_annexes",
        "libelle": "Frais de voyage annexes (retour anticipe, depart retarde, hebergement)",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "visite_proche_hospitalisation",
        "libelle": "Voyage de visite d'un proche en cas d'hospitalisation",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "soins_etranger_planifies",
        "libelle": "Traitements planifies a l'etranger",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "podologie",
        "libelle": "Podologie",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "therapies_digitales",
        "libelle": "Therapies digitales",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "libre_choix_medecin_ambulatoire",
        "libelle": "Libre choix du medecin en ambulatoire (medecins non conventionnes)",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "deuxieme_avis_medical",
        "libelle": "Deuxieme avis medical",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "acces_prioritaire_soins",
        "libelle": "Acces prioritaire aux specialistes / prise en charge acceleree",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "tests_genetiques",
        "libelle": "Tests genetiques et autotests de depistage",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "vaccins_prevention_lca",
        "libelle": "Vaccinations preventives non couvertes par la LAMal",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "activite_physique_cours",
        "libelle": "Cours d'activite physique, piscine, escalade, clubs sportifs",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "prevention_psychologique",
        "libelle": "Prevention psychologique / fitness mental",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "conseil_sante_pharmacie",
        "libelle": "Conseil sante et examens en pharmacie",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "chirurgie_maxillaire",
        "libelle": "Chirurgie maxillaire",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "dentaire_esthetique",
        "libelle": "Dentaire esthetique (blanchiment, facettes)",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      },
      {
        "id": "clubs_sportifs",
        "libelle": "Clubs sportifs, abonnements piscine et escalade",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "nature": "remboursement",
        "actif": true
      }
    ]
  },
  "assureurs": [
    {
      "schema_version": "1.0",
      "id": "assura",
      "nom": "Assura",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "Brochure produits Assura SA, apercu des assurances complementaires ; CGA LCA 07.2015 mise a jour 01.2022 ; CSC Complementa Extra et Natura 07.2015",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : la source ne traite que des complementaires. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "Gamme saisie depuis la brochure produits officielle : Complementa Extra, Natura, Medna, Denta Plus, Mondia, Mondia Plus, les quatre assurances d'hospitalisation, Hospita, Previsia Extra, Previsia Plus et Nativa.",
        "Gamme dentaire : Denta Sana (soins et protheses) et Denta Ortho (orthodontie, trois niveaux) sont les produits commercialises, saisis depuis les fiches produits du site. Denta Plus, qui figurait dans la brochure fournie, n'est plus propose : il est conserve en portefeuille ferme pour les clients qui le detiennent encore, et exclu des caisses proposees en alternative.",
        "Materna Varia, Pecunia, Previsia Maladie et les trois modules Lexa ne figurent pas dans la brochure fournie et reposent encore sur un recapitulatif de site.",
        "Assura ne propose aucune prestation de check-up, de fitness, de depistage ni de vaccination preventive dans sa gamme LCA : verifie article par article dans les CSC, ce n'est pas une lacune de saisie.",
        "Le Club Assura est la seule reponse d'Assura sur ces postes. Il agit par rabais sur le prix facture, pas par prise en charge.",
        "Psychotherapie : la brochure Assura place la prestation de Complementa Extra en complement de l'assurance de base. Les recapitulatifs des autres caisses ne precisent pas si leurs produits completent de la meme maniere une psychotherapie prescrite : sur cette ligne, la comparaison peut sous-estimer les concurrentes tant que leurs conditions n'ont pas ete verifiees."
      ],
      "produits_lca": [
        {
          "id": "assura_complementa_extra",
          "code_produit": null,
          "nom": "Complementa Extra",
          "type": "global",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Aucune participation a charge de l'assure, hormis la franchise dentaire. Pas de couverture des urgences a l'etranger : la completer par Mondia ou Mondia Plus.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Division generale d'un etablissement hospitalier repertorie dans la planification d'un canton. Aucune participation a charge de l'assure.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 50,
              "nb_jours_max_annuel": 30,
              "conditions": "Par un service d'assistance, durant l'hospitalisation et jusqu'au 15e jour qui suit.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 70,
              "nb_jours_max_annuel": 10,
              "conditions": "Accompagnement d'un enfant : frais factures par l'hopital en cas d'hebergement d'un accompagnant.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": 1,
              "plafond_par_jour": 70,
              "nb_jours_max_annuel": 21,
              "conditions": "Garde d'enfants jusqu'a 15 ans par un organisme officiel, pour les enfants d'un assure adulte hospitalise.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 1,
              "plafond_annuel": 50000,
              "conditions": "CHF 50'000 SUR LA DUREE DU CONTRAT, et non par annee, pour les medicaments vitaux sans equivalent dans la liste des specialites.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 1,
              "plafond_annuel": 500,
              "conditions": "Appareils medicaux ou articles orthopediques.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 1,
              "plafond_annuel": 1000,
              "franchise_prestation": 500,
              "conditions": "Jusqu'a CHF 1'000 par annee, apres deduction de la franchise de CHF 500, selon tarif SSO. Cumulable avec Denta Sana, dont les prestations dentaires s'ajoutent a celles-ci.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "En Suisse, en complement de l'assurance de base : transports sans limite. La base ne couvre que 50% de la facture, plafonnes a CHF 500 par annee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1,
              "plafond_annuel": 20000,
              "conditions": "En Suisse, en complement de l'assurance de base, qui plafonne a CHF 5'000.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rattrapage_scolaire",
              "taux_remboursement": 1,
              "plafond_par_jour": 50,
              "plafond_annuel": 3000,
              "conditions": "Assistance scolaire par une personne qualifiee, lorsque l'enfant assure ne peut pas suivre le programme scolaire pendant un mois.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 200,
              "nb_jours_max_annuel": 21,
              "conditions": "Soins a domicile evitant une hospitalisation, sur prescription medicale.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "centre_thermal",
              "taux_remboursement": 1,
              "plafond_annuel": 1000,
              "conditions": "Cures balneaires sur prescription : en Suisse CHF 1'000 par annee pour les frais de bains et de soins ; a l'etranger CHF 500 par annee si l'affection ne peut etre traitee en Suisse. La base ne couvre que CHF 10 par jour de logement.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 40,
              "nb_jours_max_annuel": 21,
              "conditions": "Cures de convalescence en Suisse, sur prescription medicale.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 100,
              "conditions": "CHF 100 par annee, cumulables sur cinq annees sans prestation, soit CHF 500 au maximum. Un client qui renouvelle ses lunettes tous les trois ans dispose donc de CHF 300.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires",
              "plafond_cumulable": {
                "annees_max": 5,
                "plafond_max": 500
              }
            },
            {
              "prestation_id": "chirurgie_refractive",
              "taux_remboursement": 1,
              "plafond_annuel": 100,
              "conditions": "CHF 100 par annee, cumulables sur cinq annees sans prestation, soit CHF 500 au maximum. Meme mecanisme que les verres de lunettes.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires",
              "plafond_cumulable": {
                "annees_max": 5,
                "plafond_max": 500
              }
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": 1,
              "plafond_annuel": 1500,
              "conditions": "CHF 1'500 par annee pour les frais consecutifs a des traitements medicalement prescrits, prodigues par des psychotherapeutes non medecins et des psychologues independants figurant sur la liste de l'organisation faitiere des assureurs-maladie suisses. Vient EN COMPLEMENT de l'assurance de base, qui prend en charge la psychotherapie prescrite depuis le 1er juillet 2022 : la brochure place cette prestation en regard de la mention « selon les prestations legales » du volet base.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "liberation_primes",
              "taux_remboursement": 1,
              "conditions": "Apres un delai de 90 jours de chomage, Assura regle les primes des complementaires conclues simultanement, y compris pour les membres de la famille faisant menage commun.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_natura",
          "code_produit": null,
          "nom": "Natura",
          "type": "medecine_alternative",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            200
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Soins prodigues par des therapeutes reconnus, membres d'une association figurant sur la liste d'Assura SA. Bonus : suppression de la franchise annuelle sur le prochain traitement apres cinq ans sans prestation. En cas de conclusion de Natura et de Medna, la franchise n'est percue qu'une fois et Assura offre 50% de rabais sur la prime Medna.",
          "couvertures": [
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 110,
              "nb_seances_max_annuel": 12,
              "conditions": "Acupressure, acupuncture. Remboursement selon la duree de la seance : premiere consultation ou bilan de sante de CHF 50 a 130, seances ulterieures de CHF 50 a 110. Douze seances par annee ; au-dela, sur accord d'Assura SA. Franchise annuelle de CHF 200 et quote-part de 10%.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 110,
              "nb_seances_max_annuel": 12,
              "conditions": "Osteopathie, etiopathie, therapie craniosacrale, fasciatherapie-pulsologie. Remboursement selon la duree de la seance : premiere consultation ou bilan de sante de CHF 50 a 130, seances ulterieures de CHF 50 a 110. Douze seances par annee ; au-dela, sur accord d'Assura SA. Franchise annuelle de CHF 200 et quote-part de 10%.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 110,
              "nb_seances_max_annuel": 12,
              "conditions": "Homeopathie, serocytotherapie. Remboursement selon la duree de la seance : premiere consultation ou bilan de sante de CHF 50 a 130, seances ulterieures de CHF 50 a 110. Douze seances par annee ; au-dela, sur accord d'Assura SA. Franchise annuelle de CHF 200 et quote-part de 10%.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 110,
              "nb_seances_max_annuel": 12,
              "conditions": "Medecine chinoise, shiatsu. Remboursement selon la duree de la seance : premiere consultation ou bilan de sante de CHF 50 a 130, seances ulterieures de CHF 50 a 110. Douze seances par annee ; au-dela, sur accord d'Assura SA. Franchise annuelle de CHF 200 et quote-part de 10%.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 110,
              "nb_seances_max_annuel": 12,
              "conditions": "Phytotherapie, aromatherapie, iridologie, kinesiologie. Remboursement selon la duree de la seance : premiere consultation ou bilan de sante de CHF 50 a 130, seances ulterieures de CHF 50 a 110. Douze seances par annee ; au-dela, sur accord d'Assura SA. Franchise annuelle de CHF 200 et quote-part de 10%.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 110,
              "nb_seances_max_annuel": 12,
              "conditions": "Bioresonance, drainage lymphatique, mesotherapie, Ortho-Bionomy, reflexologie, sophrologie curative, sympathicotherapie, therapie neurale. Eurythmie curative et eutonie uniquement sur prescription medicale prealable. Remboursement selon la duree de la seance : premiere consultation ou bilan de sante de CHF 50 a 130, seances ulterieures de CHF 50 a 110. Douze seances par annee ; au-dela, sur accord d'Assura SA. Franchise annuelle de CHF 200 et quote-part de 10%.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "plafond_annuel": 800,
              "conditions": "Examens de laboratoire et remedes prescrits, max CHF 800 par annee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_medna",
          "code_produit": null,
          "nom": "Medna",
          "type": "medecine_alternative",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            200
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Soins prodigues par des medecins au benefice d'une formation specifique. Ne couvre ni l'acupuncture ni l'osteopathie, contrairement a Natura. Franchise annuelle de CHF 200, sans quote-part.",
          "couvertures": [
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 1,
              "plafond_par_seance": 80,
              "conditions": "Acupressure. Traitements medicaux a CHF 80 par seance, nombre de seances illimite. Uniquement dans la mesure ou la therapie n'est pas prise en charge par l'assurance de base.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 1,
              "plafond_par_seance": 80,
              "conditions": "Homeopathie. Traitements medicaux a CHF 80 par seance, nombre de seances illimite. Uniquement dans la mesure ou la therapie n'est pas prise en charge par l'assurance de base.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 1,
              "plafond_par_seance": 80,
              "conditions": "Medecine chinoise, medecine ayurvedique. Traitements medicaux a CHF 80 par seance, nombre de seances illimite. Uniquement dans la mesure ou la therapie n'est pas prise en charge par l'assurance de base.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 1,
              "plafond_par_seance": 80,
              "conditions": "Phytotherapie, medecine anthroposophique. Traitements medicaux a CHF 80 par seance, nombre de seances illimite. Uniquement dans la mesure ou la therapie n'est pas prise en charge par l'assurance de base.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 1,
              "plafond_par_seance": 80,
              "conditions": "Bioresonance, hypnose medicale, therapie neurale, sophrologie, training autogene. Traitements medicaux a CHF 80 par seance, nombre de seances illimite. Uniquement dans la mesure ou la therapie n'est pas prise en charge par l'assurance de base.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.8,
              "plafond_annuel": 2000,
              "conditions": "Medicaments enregistres par Swissmedic, 80% du prix, sur prescription medicale.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_denta_plus",
          "code_produit": null,
          "nom": "Denta Plus (portefeuille ferme)",
          "type": "dentaire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            500
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "PRODUIT PLUS COMMERCIALISE, remplace par Denta Sana et Denta Ortho. Conserve pour les clients qui le detiennent encore : selectionnable comme couverture actuelle, exclu des caisses proposees en alternative. Valeurs issues d'une edition anterieure de la brochure produits. Prise en charge selon tarif officiel, en Suisse ou en zone frontaliere. Questionnaire dentaire indemnise jusqu'a CHF 100 a l'adhesion. Bonus : suppression de la franchise sur le prochain traitement apres cinq ans sans prestation, les frais de prophylaxie n'influencant pas son octroi. Avec Complementa Extra, les prestations dentaires des deux assurances sont cumulees et la franchise percue une seule fois.",
          "couvertures": [
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 1,
              "plafond_annuel": 80,
              "conditions": "Controle dentaire et detartrage, des la 2e annee d'assurance, sans franchise ni quote-part.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires",
              "exempt_franchise_produit": true
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.8,
              "plafond_annuel": 11600,
              "conditions": "Mesures diagnostiques et therapeutiques : 80% d'une facturation maximale de CHF 15'000 par annee, apres deduction de la franchise de CHF 500 (CHF 250 pour les enfants). Le plafond de remboursement en decoule : 80% de CHF 14'500.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.8,
              "plafond_annuel": 800,
              "conditions": "Prestations techniques : confection de couronnes, de ponts et protheses, 80% d'une facturation maximale de CHF 1'000 par annee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.8,
              "plafond_annuel": 400,
              "conditions": "Honoraires et appareillages jusqu'a 20 ans revolus : 80% d'une facturation maximale de CHF 500 par annee pleine et echue, cumulable sur plusieurs annees jusqu'a CHF 10'000.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires",
              "plafond_cumulable": {
                "annees_max": null,
                "plafond_max": 10000
              }
            }
          ],
          "portefeuille_ferme": true
        },
        {
          "id": "assura_denta_sana",
          "code_produit": null,
          "nom": "Denta Sana",
          "type": "dentaire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 6,
          "delais_attente_specifiques": [
            {
              "motif": "prophylaxie",
              "mois": 0
            }
          ],
          "hors_perimetre_facture": false,
          "edition_source": "assura.ch, fiches produits Denta Sana et Denta Ortho",
          "enveloppes": [
            {
              "id": "env_ds",
              "libelle": "Traitements ambulatoires et prothetiques",
              "plafond_annuel": 6000
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 1,
              "plafond_annuel": 80,
              "exempt_franchise_produit": true,
              "conditions": "Prophylaxie prise en charge integralement jusqu'a CHF 80 par annee. Aucune carence : la prophylaxie est due des la premiere annee.",
              "source_page": "assura.ch, fiches produits Denta Sana et Denta Ortho"
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ds",
              "conditions": "Traitements ambulatoires, 75 pour cent dans la limite de l'enveloppe annuelle de CHF 6'000 partagee avec les traitements prothetiques.",
              "source_page": "assura.ch, fiches produits Denta Sana et Denta Ortho"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ds",
              "conditions": "Traitements prothetiques, 75 pour cent, meme enveloppe annuelle de CHF 6'000.",
              "source_page": "assura.ch, fiches produits Denta Sana et Denta Ortho"
            }
          ],
          "remarque": "Admission sans controle avant 5 ans. Carence de 6 mois sur les traitements, aucune sur la prophylaxie. Cumulable avec Complementa Extra, dont les prestations dentaires s'ajoutent."
        },
        {
          "id": "assura_denta_ortho_1",
          "code_produit": null,
          "nom": "Denta Ortho niveau 1",
          "type": "dentaire",
          "niveau": "n1",
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 12,
          "hors_perimetre_facture": false,
          "edition_source": "assura.ch, fiches produits Denta Sana et Denta Ortho",
          "couvertures": [
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 2000,
              "conditions": "Orthodontie prise en charge a 75 pour cent des frais, dans la limite de CHF 2'000 par annee selon le niveau souscrit.",
              "source_page": "assura.ch, fiches produits Denta Sana et Denta Ortho",
              "plafond_cumulable": {
                "annees_max": null,
                "plafond_max": 2000
              }
            }
          ],
          "remarque": "Admission sans controle avant 5 ans. Carence de 12 mois. Rabais de 15% si souscrit avant la naissance."
        },
        {
          "id": "assura_denta_ortho_2",
          "code_produit": null,
          "nom": "Denta Ortho niveau 2",
          "type": "dentaire",
          "niveau": "n2",
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 12,
          "hors_perimetre_facture": false,
          "edition_source": "assura.ch, fiches produits Denta Sana et Denta Ortho",
          "couvertures": [
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 6000,
              "conditions": "Orthodontie prise en charge a 75 pour cent des frais, dans la limite de CHF 6'000 par annee selon le niveau souscrit.",
              "source_page": "assura.ch, fiches produits Denta Sana et Denta Ortho",
              "plafond_cumulable": {
                "annees_max": null,
                "plafond_max": 6000
              }
            }
          ],
          "remarque": "Admission sans controle avant 5 ans. Carence de 12 mois. Rabais de 15% si souscrit avant la naissance."
        },
        {
          "id": "assura_denta_ortho_3",
          "code_produit": null,
          "nom": "Denta Ortho niveau 3",
          "type": "dentaire",
          "niveau": "n3",
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 12,
          "hors_perimetre_facture": false,
          "edition_source": "assura.ch, fiches produits Denta Sana et Denta Ortho",
          "couvertures": [
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 10000,
              "conditions": "Orthodontie prise en charge a 75 pour cent des frais, dans la limite de CHF 10'000 par annee selon le niveau souscrit.",
              "source_page": "assura.ch, fiches produits Denta Sana et Denta Ortho",
              "plafond_cumulable": {
                "annees_max": null,
                "plafond_max": 10000
              }
            }
          ],
          "remarque": "Admission sans controle avant 5 ans. Carence de 12 mois. Rabais de 15% si souscrit avant la naissance."
        },
        {
          "id": "assura_mondia",
          "code_produit": null,
          "nom": "Mondia",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Monde entier. Organisme d'assistance 24 heures sur 24 et 7 jours sur 7. Couverture lors de sejours de 45 jours consecutifs au maximum ; au-dela, prolongation possible avec l'accord prealable d'Assura SA.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Prise en charge integrale et sans limite des frais de traitement et d'hospitalisation, avec libre choix du prestataire, en plus des prestations reconnues par la LAMal ou la LAA. Remboursement de la participation a charge de l'assure dans les pays de l'UE et de l'AELE. Avance sur les frais d'hospitalisation.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 1,
              "conditions": "Envoi des medicaments essentiels s'ils ne sont pas disponibles sur place.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Transport sanitaire.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "conditions": "Rapatriement vers la Suisse.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "conditions": "Operations de recherche, de secours et de sauvetage.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1,
              "conditions": "Rapatriement des enfants de l'assure, ou possibilite de faire venir un proche parent en cas d'hospitalisation a l'etranger.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_mondia_plus",
          "code_produit": null,
          "nom": "Mondia Plus",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Reprend Mondia et y ajoute le volet annulation.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Prise en charge integrale et sans limite des frais de traitement et d'hospitalisation, avec libre choix du prestataire, en plus des prestations reconnues par la LAMal ou la LAA. Remboursement de la participation a charge de l'assure dans les pays de l'UE et de l'AELE. Avance sur les frais d'hospitalisation.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 1,
              "conditions": "Envoi des medicaments essentiels s'ils ne sont pas disponibles sur place.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Transport sanitaire.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "conditions": "Rapatriement vers la Suisse.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "conditions": "Operations de recherche, de secours et de sauvetage.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1,
              "conditions": "Rapatriement des enfants de l'assure, ou possibilite de faire venir un proche parent en cas d'hospitalisation a l'etranger.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "annulation_voyage",
              "taux_remboursement": 1,
              "plafond_annuel": 15000,
              "conditions": "Maximum CHF 15'000 par assure et par cas, deux annulations par annee au maximum : annulation totale ou partielle d'un voyage reserve.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 1,
              "plafond_annuel": 5000,
              "conditions": "Frais supplementaires en cas de depart retarde ou necessaires a la poursuite du voyage, max CHF 5'000 par personne. Frais dus a un retour premature et remboursement des couts du sejour non utilise.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "assistance_voyage",
              "taux_remboursement": 1,
              "plafond_annuel": 100,
              "conditions": "Frais d'annulation de prestations de loisirs reservees, max CHF 100.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_optima_flex_varia",
          "code_produit": null,
          "nom": "Optima Flex Varia",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 75,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Etablissements parmi la liste des agrees Assura SA. Aucune couverture des urgences a l'etranger : la completer par Mondia ou Mondia Plus.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Division generale, au choix avant chaque hospitalisation. Aucune participation.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "participation_par_jour": 100,
              "participation_jours_max": 15,
              "participation_plafond_annuel": 4500,
              "conditions": "Chambre a deux lits. Participation de CHF 100 par jour, 15 jours par annee au maximum. Les participations des divisions privee et semi-privee sont cumulees jusqu'a CHF 4'500 par annee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "participation_par_jour": 300,
              "participation_jours_max": 15,
              "participation_plafond_annuel": 4500,
              "conditions": "Chambre a un lit. Participation de CHF 300 par jour, 15 jours par annee au maximum, cumulee avec la semi-privee jusqu'a CHF 4'500 par annee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1,
              "conditions": "Libre choix lorsque le medecin est agree par Assura SA.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": 1,
              "plafond_par_jour": 250,
              "nb_jours_max_annuel": 15,
              "plafond_annuel": 3750,
              "conditions": "Indemnite versee en cas de sejour en division generale : CHF 250 par jour, 15 jours par annee, jusqu'a CHF 3'750 par annee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 1,
              "plafond_par_jour": 500,
              "conditions": "Avec accord prealable d'Assura SA. CHF 500 par jour, deux jours par sejour au maximum.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_optima_varia",
          "code_produit": null,
          "nom": "Optima Varia",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 75,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Etablissements parmi la liste des agrees Assura SA.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Division semi-privee, chambre a deux lits. Aucune participation a charge de l'assure.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1,
              "conditions": "Libre choix lorsque le medecin est agree par Assura SA.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "plafond_annuel": 1000,
              "conditions": "En cas de sejour volontaire en division generale : CHF 100 par jour, CHF 1'000 par sejour au maximum.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 1,
              "conditions": "Avec accord prealable d'Assura SA. Prise en charge uniquement lorsque le cout est inferieur au tarif usuel applique dans le canton de domicile.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Selon les conditions de l'assistance touristique d'Assura SA. Completable par Mondia ou Mondia Plus.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_optima_plus_varia",
          "code_produit": null,
          "nom": "Optima Plus Varia",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 75,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Etablissements parmi la liste des agrees Assura SA.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Division privee, chambre a un lit. Aucune participation a charge de l'assure.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1,
              "conditions": "Libre choix lorsque le medecin est agree par Assura SA.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "plafond_annuel": 1000,
              "conditions": "En cas de sejour volontaire en division generale : CHF 100 par jour, CHF 1'000 par sejour au maximum.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 1,
              "conditions": "Avec accord prealable d'Assura SA. Prise en charge uniquement lorsque le cout est inferieur au tarif usuel applique dans le canton de domicile.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Selon les conditions de l'assistance touristique d'Assura SA. Completable par Mondia ou Mondia Plus.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_ultra_varia",
          "code_produit": null,
          "nom": "Ultra Varia",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 75,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Libre choix quasi total des etablissements en Suisse. Prime selon l'age reel, avec paliers a 19, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86 et 91 ans, en derogation de l'art. 12 CGA.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Division privee, chambre a un lit. Aucune participation a charge de l'assure.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1,
              "conditions": "Libre choix, hormis les medecins et etablissements indiques comme exclus ou sous condition dans la liste des fournisseurs de soins.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": 1,
              "plafond_par_jour": 150,
              "plafond_annuel": 1500,
              "conditions": "Sejour volontaire en division generale d'un hopital public : CHF 150 par jour, CHF 1'500 par sejour. Dans un etablissement agree Optima ou Optima Plus : CHF 50 par jour, CHF 500 par sejour.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 1,
              "conditions": "Avec accord prealable d'Assura SA. Prise en charge uniquement lorsque le cout est inferieur au tarif usuel prive applique dans le canton de domicile.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Selon les conditions de l'assistance touristique d'Assura SA.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Couverte par derogation expresse a l'exclusion de l'art. 4 CGA. Taux et plafond a reprendre dans les conditions speciales.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_hospita",
          "code_produit": null,
          "nom": "Hospita",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 50,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "exclusions": [
            "affections relevant de la LAA, de la LAI ou de la LAM"
          ],
          "couvertures": [
            {
              "prestation_id": "capital_hospitalisation",
              "taux_remboursement": 1,
              "plafond_annuel": 3000,
              "conditions": "Capital au choix : CHF 500 ou 1'000 pour tous, CHF 1'500, 2'000, 2'500 ou 3'000 pour les adultes uniquement. Octroye une fois par annee pour une hospitalisation de plus de 24 heures. Non verse pour les sejours consecutifs a une affection relevant de la LAA, de la LAI ou de la LAM.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_previsia_extra",
          "code_produit": null,
          "nom": "Previsia Extra",
          "type": "accident",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 75,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "5 variantes adultes (19-65 ans), 5 variantes seniors (66-75 ans) et 7 variantes enfants (0-18 ans). Les capitaux dependent de la variante souscrite : les plafonds saisis sont les maxima de la gamme.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Division privee dans le monde entier.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 1,
              "conditions": "Soins prodigues par un therapeute membre d'une association professionnelle reconnue par Assura SA.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 300,
              "conditions": "Sur ordonnance medicale, par un service officiel d'assistance medicale.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 200,
              "plafond_annuel": 6000,
              "conditions": "Traitements ordonnes medicalement pris en charge sans limite. Frais de sejour et de pension jusqu'a CHF 200 par jour, CHF 6'000 par cas.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "dentaire_accident",
              "taux_remboursement": 1,
              "conditions": "Traitements appliques ou ordonnes par un dentiste. Pour les enfants, traitements provisoires et definitifs jusqu'a 22 ans revolus.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "chirurgie_esthetique_reconstructive",
              "taux_remboursement": 1,
              "plafond_annuel": 60000,
              "conditions": "Jusqu'a CHF 60'000 par cas, lorsque l'intervention est necessaire a la suite de l'accident.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 80,
              "plafond_annuel": 6000,
              "conditions": "Par un service d'assistance, si incapacite de travail d'au moins 50% attestee par un medecin. Maximum CHF 6'000 par cas.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 1,
              "conditions": "Premiere acquisition de protheses, lunettes, appareils acoustiques et moyens auxiliaires orthopediques. Reparation ou remplacement si endommages. Location de mobilier de malade.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 60000,
              "conditions": "Frais de recherche, de sauvetage et de recuperation, jusqu'a CHF 60'000 par cas.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Couverts si medicalement necessaires.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "dommages_materiels",
              "taux_remboursement": 1,
              "plafond_annuel": 6000,
              "conditions": "Jusqu'a CHF 6'000 par cas : nettoyage, reparation ou remplacement en valeur a neuf d'habits et effets personnels, y compris ceux des personnes ayant porte secours.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": 1,
              "conditions": "Frais de garde d'enfants jusqu'a 15 ans.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "conditions": "Frais d'accompagnement lors d'un sejour hospitalier.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rattrapage_scolaire",
              "taux_remboursement": 1,
              "conditions": "Frais d'assistance scolaire par une personne qualifiee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1,
              "conditions": "En cas d'accident a l'etranger sans rapatriement possible : prolongation du sejour d'un accompagnant, et transport puis sejour d'un proche lorsque l'hospitalisation depasse sept jours.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": 1,
              "plafond_annuel": 50000,
              "conditions": "Selon la variante : adultes de CHF 5'000 a 50'000, enfants de CHF 3'000 a 10'000, seniors de CHF 5'000 a 10'000.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Capital d'invalidite progressif selon la variante : adultes de CHF 20'000 a 100'000, enfants de CHF 30'000 a 250'000, seniors de CHF 5'000 a 20'000.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "conditions": "Allocation d'hospitalisation de CHF 10 a 30 par jour selon la variante.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "conditions": "Indemnite pour perte de gain de CHF 10 a 60 par jour selon la variante.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "capital_hospitalisation",
              "taux_remboursement": 1,
              "plafond_annuel": 3000,
              "conditions": "Propre a Previsia Extra : capital au choix de CHF 1'000, 2'000 ou 3'000 pour un adulte, CHF 1'000 pour un enfant. Verse au maximum une fois par annee et une seule fois par evenement assure.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_previsia_plus",
          "code_produit": null,
          "nom": "Previsia Plus",
          "type": "accident",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 75,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Memes prestations de frais de traitement que Previsia Extra, sans le capital en cas d'hospitalisation. La variante 11 n'est pas proposee pour Previsia Extra.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Division privee dans le monde entier.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 1,
              "conditions": "Soins prodigues par un therapeute membre d'une association professionnelle reconnue par Assura SA.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 300,
              "conditions": "Sur ordonnance medicale, par un service officiel d'assistance medicale.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 200,
              "plafond_annuel": 6000,
              "conditions": "Traitements ordonnes medicalement pris en charge sans limite. Frais de sejour et de pension jusqu'a CHF 200 par jour, CHF 6'000 par cas.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "dentaire_accident",
              "taux_remboursement": 1,
              "conditions": "Traitements appliques ou ordonnes par un dentiste. Pour les enfants, traitements provisoires et definitifs jusqu'a 22 ans revolus.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "chirurgie_esthetique_reconstructive",
              "taux_remboursement": 1,
              "plafond_annuel": 60000,
              "conditions": "Jusqu'a CHF 60'000 par cas, lorsque l'intervention est necessaire a la suite de l'accident.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 80,
              "plafond_annuel": 6000,
              "conditions": "Par un service d'assistance, si incapacite de travail d'au moins 50% attestee par un medecin. Maximum CHF 6'000 par cas.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 1,
              "conditions": "Premiere acquisition de protheses, lunettes, appareils acoustiques et moyens auxiliaires orthopediques. Reparation ou remplacement si endommages. Location de mobilier de malade.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 60000,
              "conditions": "Frais de recherche, de sauvetage et de recuperation, jusqu'a CHF 60'000 par cas.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Couverts si medicalement necessaires.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "dommages_materiels",
              "taux_remboursement": 1,
              "plafond_annuel": 6000,
              "conditions": "Jusqu'a CHF 6'000 par cas : nettoyage, reparation ou remplacement en valeur a neuf d'habits et effets personnels, y compris ceux des personnes ayant porte secours.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": 1,
              "conditions": "Frais de garde d'enfants jusqu'a 15 ans.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "conditions": "Frais d'accompagnement lors d'un sejour hospitalier.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "rattrapage_scolaire",
              "taux_remboursement": 1,
              "conditions": "Frais d'assistance scolaire par une personne qualifiee.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1,
              "conditions": "En cas d'accident a l'etranger sans rapatriement possible : prolongation du sejour d'un accompagnant, et transport puis sejour d'un proche lorsque l'hospitalisation depasse sept jours.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": 1,
              "plafond_annuel": 50000,
              "conditions": "Selon la variante : adultes de CHF 5'000 a 50'000, enfants de CHF 3'000 a 10'000, seniors de CHF 5'000 a 10'000.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Capital d'invalidite progressif selon la variante : adultes de CHF 20'000 a 100'000, enfants de CHF 30'000 a 250'000, seniors de CHF 5'000 a 20'000.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "conditions": "Allocation d'hospitalisation de CHF 10 a 30 par jour selon la variante.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            },
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "conditions": "Indemnite pour perte de gain de CHF 10 a 60 par jour selon la variante.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_nativa",
          "code_produit": null,
          "nom": "Nativa",
          "type": "global",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 18,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "edition_source": "Brochure produits Assura SA, apercu des assurances complementaires",
          "remarque": "Rabais de combinaison. En cas de souscription prenatale : six mois de primes offertes et pas de questionnaire medical. Ce produit est un regroupement : ses prestations sont celles des six assurances qui le composent.",
          "couvertures": [
            {
              "prestation_id": "consultation_medecin",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Package prenatal et pour enfants regroupant sept assurances : Complementa Extra, Denta Sana, Denta Ortho, Mondia Plus, Medna, Natura et Previsia Extra. Se referer a chacune pour le detail des prestations.",
              "source_page": "Brochure produits Assura SA, apercu des assurances complementaires"
            }
          ]
        },
        {
          "id": "assura_materna_varia",
          "code_produit": null,
          "nom": "Materna Varia",
          "type": "maternite",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 50,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 12,
          "hors_perimetre_facture": false,
          "remarque": "Reserve aux femmes, fin automatique a 50 ans. Souscription uniquement via un conseiller. Les CGA citent Complementa, Complementa Plus, Materna Eco, Materna Media, Materna Plus et Natura R3 comme categories assumant des prestations de maternite : la gamme Materna comporte donc plusieurs variantes non encore saisies.",
          "couvertures": [
            {
              "prestation_id": "accouchement",
              "taux_remboursement": 1,
              "conditions": "Division privee pour la grossesse et l'accouchement."
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": 1,
              "plafond_annuel": 1500,
              "conditions": "Bonus de CHF 1'500 pour un accouchement ambulatoire ou a domicile."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.75,
              "plafond_annuel": 2000,
              "conditions": "Echographies, cours de preparation, test TPNI, suivi et gymnastique postnatale."
            },
            {
              "prestation_id": "tests_prenataux_genetiques",
              "taux_remboursement": 0.75,
              "plafond_annuel": 2000,
              "conditions": "Test TPNI."
            },
            {
              "prestation_id": "indemnite_allaitement",
              "taux_remboursement": 1,
              "plafond_annuel": 200
            }
          ]
        },
        {
          "id": "assura_pecunia",
          "code_produit": null,
          "nom": "Pecunia",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "exclusions": [
            "maternite"
          ],
          "remarque": "Risque accident en option.",
          "couvertures": [
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_jour": 300,
              "conditions": "Jusqu'a CHF 300 par jour, maintien du revenu jusqu'a 100%, 720 indemnites journalieres. Delais d'attente de 30 a 720 jours au choix. Aucune prestation en dessous de 50% d'incapacite."
            }
          ]
        },
        {
          "id": "assura_previsia_maladie",
          "code_produit": null,
          "nom": "Previsia Maladie",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 55,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Aucun delai de carence, pas de questionnaire medical. Fin automatique a 65 ans.",
          "couvertures": [
            {
              "prestation_id": "capital_deces_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 100000,
              "conditions": "Par tranches de CHF 10'000 jusqu'a CHF 100'000."
            },
            {
              "prestation_id": "capital_invalidite_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 100000,
              "conditions": "Par tranches de CHF 10'000 jusqu'a CHF 100'000. Versement proportionnel des 40% d'invalidite, integral des 70%."
            }
          ]
        },
        {
          "id": "assura_lexa_a",
          "code_produit": null,
          "nom": "Lexa module A (prive)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": 18,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Delais de carence de 1 a 12 mois selon le domaine. Rabais combine jusqu'a 25% pour les 3 modules.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 600000,
              "conditions": "Basis CHF 100'000, Maxi jusqu'a CHF 600'000, monde CHF 150'000. RC, penal, propriete, travail, contrats, harcelement, bail en option."
            }
          ]
        },
        {
          "id": "assura_lexa_b",
          "code_produit": null,
          "nom": "Lexa module B (patients)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": 18,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Delais de carence de 1 a 12 mois selon le domaine. Rabais combine jusqu'a 25% pour les 3 modules.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": 1,
              "plafond_annuel": 200000,
              "conditions": "Litiges medicaux."
            }
          ]
        },
        {
          "id": "assura_lexa_c",
          "code_produit": null,
          "nom": "Lexa module C (circulation)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": 18,
          "age_adhesion_max": 99,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Delais de carence de 1 a 12 mois selon le domaine. Rabais combine jusqu'a 25% pour les 3 modules.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 600000,
              "conditions": "RC, penal, permis, contrats lies aux vehicules."
            }
          ]
        }
      ],
      "cadre_contractuel": {
        "source": "CGA LCA Assura SA, edition 07.2015, mise a jour 01.2022 (CGA_ASSURA_LCA_07.2015-MAJ-01.2022_F)",
        "remarque": "Cadre commun a tous les produits. Chaque produit dispose de conditions speciales (CSC) qui peuvent y deroger : toujours croiser CGA et CSC.",
        "etendue_territoriale": {
          "portee": "monde entier",
          "hors_suisse_liechtenstein_zone_frontaliere_jours_max": 90,
          "remarque": "Art. 5. Le transfert de domicile hors de Suisse, du Liechtenstein ou de la zone frontaliere met fin a l'assurance a la fin de la periode en cours. Un assure malade ou accidente en Suisse qui part a l'etranger n'est indemnise qu'avec l'accord ecrit prealable d'Assura."
        },
        "concours_assureurs": {
          "regle": "prorata",
          "subsidiaire_a": [
            "LAMal",
            "LAA",
            "assurance militaire",
            "AI"
          ],
          "remarque": "Art. 6. Assura n'intervient qu'a titre complementaire. Aucune prestation si les frais ont ete payes par un tiers responsable ou son assureur. En l'absence de couverture LAMal, les prestations sont calculees comme si elle existait."
        },
        "duree_et_resiliation": {
          "duree_min_ans_si_debut_1er_janvier": 3,
          "duree_min_ans_si_debut_en_cours_annee": 2,
          "preavis_resiliation_mois": 3,
          "contrat_a_vie_entiere": true,
          "exceptions_vie_entiere": [
            "Previsia",
            "Pecunia",
            "Assuralex",
            "Assura-Serenity"
          ],
          "remarque": "Art. 8 et 9. Resiliation au 31 decembre, preavis de 3 mois. En cas de hausse tarifaire (art. 10), les nouvelles primes sont communiquees au moins 25 jours avant la fin de l'annee et le produit peut etre resilie jusqu'au dernier jour de l'annee civile."
        },
        "primes": {
          "base": "age de l'assure a la conclusion",
          "paliers_age_standard": [
            19,
            26
          ],
          "remarque": "Art. 12. Passage automatique au tarif superieur a 19 ans puis a 26 ans, le tarif devenant alors definitif. Ultra Varia deroge a cette regle : prime selon l'age reel, avec paliers a 19, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86 et 91 ans."
        },
        "declaration_sinistre": {
          "delai_jours": 3,
          "concerne": [
            "incapacite de travail",
            "hospitalisation",
            "intervention chirurgicale",
            "cure balneaire"
          ],
          "remarque": "Art. 14. Annonce immediate exigee, urgences reservees. Aucune prestation due au-dela de 3 jours, sauf retard non fautif. Un accord telephonique ne fonde aucun droit. Art. 16 : decompte sur factures originales detaillees ; franchise et quote-part sont deduites directement."
        },
        "maternite_couverte_par": [
          "Complementa",
          "Complementa Plus",
          "Materna Eco",
          "Materna Media",
          "Materna Plus",
          "Natura R3"
        ]
      },
      "exclusions_generales": {
        "reference": "Art. 4.1 CGA",
        "reserve": "Sous reserve des prestations specifiques prevues par les conditions speciales de chaque produit : plusieurs categories derogent expressement a ces exclusions.",
        "liste": [
          "affections sous reserve, affections en cours a la signature et suites d'accidents anterieurs",
          "traitements non reconnus par l'assurance obligatoire",
          "chirurgie plastique et reconstructive",
          "consequences du tabagisme, de l'alcoolisme et des stupefiants",
          "suicide et mutilation volontaire, tentatives comprises",
          "interruption ou conservation de grossesse, procreation assistee, traitements de la sterilite",
          "atteintes volontaires, actes temeraires ou delictueux, faute grave, bagarre",
          "accidents en competition et a l'entrainement associe",
          "cures d'air, de repos, d'eau et thalassotherapie",
          "traitements de l'obesite",
          "corrections des defauts de la vue",
          "hospitalisations medicosociales et soins palliatifs de fin de vie",
          "mesures dietetiques, de readaptation, de rehabilitation ou de traitement de la douleur",
          "maladies mentales ou nerveuses",
          "frais personnels d'hospitalisation sans lien avec la guerison",
          "acquisition ou location d'appareils medicaux, articles orthopediques et protheses",
          "faits de guerre, emeutes, terrorisme, sabotage",
          "certains accidents d'aeronef, parachute ou parapente",
          "effets des radiations ionisantes, hors radiations prescrites medicalement",
          "transplantations d'organes"
        ]
      },
      "programme_partenaires": {
        "nom": "Club Assura",
        "source": "assura.ch/fr/club et ses quatre pages de categories",
        "date_verification": "2026-09-07",
        "nature": "avantage_commercial",
        "contractuel": false,
        "avertissements": [
          "Ce ne sont pas des prestations contractuelles garanties, contrairement aux montants des CSC.",
          "Offres reservees aux assures Assura, non cumulables avec d'autres promotions et non transmissibles a un tiers.",
          "Assura et ses partenaires peuvent les modifier ou les supprimer a tout moment.",
          "La majorite des partenaires sante, dentaire et chirurgie oculaire sont implantes en Suisse romande. Pour un client alemanique ou tessinois, l'argument perd beaucoup de sa force.",
          "Le catalogue evolue frequemment : reverifier avant chaque campagne commerciale."
        ],
        "rabais": [
          {
            "prestation_ids": [
              "dentaire_soins",
              "dentaire_prophylaxie",
              "dentaire_prothese_implant",
              "dentaire_orthodontie"
            ],
            "taux": 0.5,
            "partenaire": "PanaDent",
            "remarque": "Le rabais le plus eleve du Club. Autres partenaires dentaires a -20% : Clinique d'Hygiene Dentaire, Clinique Dentaire de Romanel."
          },
          {
            "prestation_ids": [
              "lunettes_lentilles_adulte",
              "lunettes_lentilles_enfant"
            ],
            "taux": 0.3,
            "partenaire": "Berdoz Vision & Audition",
            "remarque": "Optical Web a -10%, Visual Studio Opticiens a tarif special sur une selection de montures."
          },
          {
            "prestation_ids": [
              "moyens_auxiliaires_lca"
            ],
            "taux": 0.3,
            "partenaire": "Berdoz Vision & Audition",
            "remarque": "Audition. Attends GmbH a -23% sur les produits d'incontinence absorbants."
          },
          {
            "prestation_ids": [
              "fitness_prevention",
              "activite_physique_cours",
              "clubs_sportifs"
            ],
            "taux": 0.2,
            "partenaire": "Let's Go Fitness et 7 autres enseignes",
            "remarque": "Fitline, Life Club, LifeFitness24, RNTL, JUNGLE BOX, Choice Health Wellness Spa, Moki Pilates. Reseau surtout romand."
          },
          {
            "prestation_ids": [
              "medicaments_liste",
              "medicaments_hors_liste"
            ],
            "taux": 0.15,
            "partenaire": "Pharmacie du Bouchet, Geneve",
            "remarque": "Rabais permanents et taxes offertes sur les medicaments sur ordonnance. Zur Rose a -10% sur generiques et biosimilaires, MediService a -5% en livraison a domicile. Un seul point de vente physique, a Geneve."
          },
          {
            "prestation_ids": [
              "chirurgie_refractive"
            ],
            "taux": 0.1,
            "partenaire": "Centre Microchirurgie Oculaire (CEMO)",
            "remarque": "Les Cliniques de l'oeil OnO : bilan pre-operatoire environ CHF 350, operation de CHF 1'650 a 1'850 par oeil. Jules-Gonin, Oculus et Swiss Visio Network a tarif special."
          },
          {
            "prestation_ids": [
              "massage_therapeutique"
            ],
            "taux": 0.2,
            "partenaire": "Choice Health Wellness Spa",
            "remarque": "Spa, soins relaxants et therapies complementaires. Non rembourse par la LCA Assura : le rabais porte sur une prestation entierement a charge du client."
          }
        ],
        "application_rabais": "facture",
        "application_rabais_options": {
          "facture": "Le partenaire facture moins ; la caisse rembourse sur ce montant reduit. C'est ce que decrit la documentation du Club : les offres agissent sur le prix facture, pas sur la prise en charge.",
          "reste_a_charge": "La caisse rembourse sur le prix plein, puis le rabais porte sur ce qui reste a payer. Plus avantageux a annoncer, mais plus cher pour le client.",
          "remarque": "Sur des lunettes a CHF 1'000, avec CHF 500 de plafond cumule et 30% de rabais : CHF 200 a charge en mode facture, CHF 350 en mode reste a charge. Verifier aupres du partenaire comment le rabais s'applique en pratique."
        }
      }
    },
    {
      "schema_version": "1.0",
      "id": "axa",
      "nom": "AXA",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "AXA (Suisse), pages produits officielles axa.ch et apercu des prestations",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "AXA ne propose pas d'assurance de base LAMal. Un client AXA a donc necessairement sa base chez un autre assureur : la franchise et le modele saisis se rapportent a cet autre assureur."
      },
      "notes_generales": [
        "AXA ne propose pas d'assurance de base LAMal, uniquement des complementaires LCA.",
        "Rabais famille : 5% pour deux personnes, 10% des trois personnes du meme menage.",
        "Duree minimale de contrat de 1 an, au choix 1, 2 ou 3 ans. Preavis de resiliation de 3 mois pour la fin de l'annee civile, 1 mois en cas de modification de prime.",
        "Exclusions principales : traitements et operations esthetiques, procreation medicalement assistee et traitements contre la sterilite."
      ],
      "produits_lca": [
        {
          "id": "axa_actif",
          "code_produit": null,
          "nom": "ACTIF",
          "type": "ambulatoire",
          "niveau": "actif",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante et sport",
              "plafond_annuel": 400
            },
            {
              "id": "env_prev",
              "libelle": "Mesures de medecine preventive",
              "plafond_annuel": 500
            }
          ],
          "couvertures": [
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "clubs_sportifs",
              "taux_remboursement": 0.75,
              "plafond_annuel": 100,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "enveloppe_id": "env_ps",
              "conditions": "Cours labellises Qualicert ou Qualitop, ecoles de natation labellisees."
            },
            {
              "prestation_id": "massage_therapeutique",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "conditions": "Massages medicaux."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.75,
              "plafond_annuel": 500,
              "conditions": "Bilans de sante, sur 3 ans."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 500 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 500 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 500 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "conseil_sante_pharmacie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 500 par an. Le taux n'est pas indique dans la source."
            }
          ]
        },
        {
          "id": "axa_plus",
          "code_produit": null,
          "nom": "PLUS",
          "type": "ambulatoire",
          "niveau": "plus",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Ne comprend ni la promotion de la sante, ni la medecine complementaire, ni les mesures de prevention : ces postes sont propres a ACTIF et COMPLET.",
          "couvertures": [
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 150,
              "conditions": "Jusqu'a CHF 150 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Therapeutes non admis a la LAMal."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9,
              "conditions": "Vaccinations preventives et de voyage."
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.75,
              "conditions": "Medicaments agrees Swissmedic non a charge de la LAMal."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Appareils auditifs, fauteuils roulants, semelles, lits medicalises, perruques."
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1000,
              "conditions": "Ambulatoire."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Urgence medicale ambulatoire et stationnaire, 100% des frais."
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1,
              "plafond_annuel": 1000,
              "conditions": "Hospitalisation d'au moins 7 jours a l'etranger, CHF 1'000 par cas."
            }
          ]
        },
        {
          "id": "axa_complet",
          "code_produit": null,
          "nom": "COMPLET",
          "type": "ambulatoire",
          "niveau": "complet",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante et sport",
              "plafond_annuel": 500
            },
            {
              "id": "env_prev",
              "libelle": "Mesures de medecine preventive",
              "plafond_annuel": 600
            }
          ],
          "couvertures": [
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 300,
              "conditions": "Jusqu'a CHF 300 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.75,
              "plafond_annuel": 300,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "clubs_sportifs",
              "taux_remboursement": 0.75,
              "plafond_annuel": 150,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.75,
              "plafond_annuel": 300,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000
            },
            {
              "prestation_id": "prevention_psychologique",
              "taux_remboursement": 0.75,
              "plafond_annuel": 500,
              "conditions": "Fitness mental, par des psychologues FSP ou SBAP. CHF 500 sur 3 ans."
            },
            {
              "prestation_id": "massage_therapeutique",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.75,
              "plafond_annuel": 1000,
              "conditions": "Sur 3 ans."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 2000
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 0.9,
              "plafond_annuel": 2000
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000,
              "conditions": "Methodes reconnues AXA, therapeutes RME ou ASCA."
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 600 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 600 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 600 par an. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "conseil_sante_pharmacie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_prev",
              "conditions": "Compris dans le plafond global de prevention de CHF 600 par an. Le taux n'est pas indique dans la source."
            }
          ]
        },
        {
          "id": "axa_hopital_commune",
          "code_produit": null,
          "nom": "Hopital Division commune",
          "type": "hospitalisation",
          "niveau": "commune",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Liste d'hopitaux AXA applicable, certains etablissements et maisons de naissance exclus.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Libre choix de l'hopital dans toute la Suisse en division commune, couverture des frais depassant le tarif du canton de domicile."
            }
          ]
        },
        {
          "id": "axa_hopital_semi_privee",
          "code_produit": null,
          "nom": "Hopital Division semi-privee",
          "type": "hospitalisation",
          "niveau": "semi_privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Gratuit de la naissance au 1er anniversaire.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Chambre a deux lits, libre choix du medecin et de l'hopital dans toute la Suisse."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "axa_hopital_privee",
          "code_produit": null,
          "nom": "Hopital Division privee",
          "type": "hospitalisation",
          "niveau": "privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Chambre individuelle, libre choix du medecin specialiste et de l'hopital en Suisse."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Couverture etendue a l'etranger."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Cures balneaires, thermales et de convalescence a l'etranger possibles sur demande."
            }
          ]
        },
        {
          "id": "axa_hopital_flex1",
          "code_produit": null,
          "nom": "Hopital Flex 1",
          "type": "hospitalisation",
          "niveau": "flex1",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Gratuit de la naissance au 1er anniversaire.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division choisie au moment de l'hospitalisation, moyennant une participation. Taux et participation non chiffres dans la source."
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Meme mecanisme."
            }
          ]
        },
        {
          "id": "axa_hopital_flex2",
          "code_produit": null,
          "nom": "Hopital Flex 2",
          "type": "hospitalisation",
          "niveau": "flex2",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Gratuit de la naissance au 1er anniversaire.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division choisie au moment de l'hospitalisation, moyennant une participation. Taux et participation non chiffres dans la source."
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Meme mecanisme."
            }
          ]
        },
        {
          "id": "axa_indemnite_hospitalisation",
          "code_produit": null,
          "nom": "Indemnite journaliere d'hospitalisation",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Complement a l'assurance complementaire d'hospitalisation.",
          "couvertures": [
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Couverture des frais subsequents d'un sejour hospitalier pour soins aigus, a partir de trois nuits. Montant non precise dans la source."
            }
          ]
        },
        {
          "id": "axa_accident_prive",
          "code_produit": null,
          "nom": "Accident Prive",
          "type": "accident",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Complete la LAA. Gratuit de la naissance au 1er anniversaire.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Hospitalisation en division privee en cas d'accident."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "axa_dentaire_adultes",
          "code_produit": null,
          "nom": "Assurance dentaire complementaire (adultes)",
          "type": "dentaire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Taux et plafonds non chiffres dans la source. Le produit Dentaire 1000 est gratuit de la naissance au 1er anniversaire.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Correction de malpositions dentaires."
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Hygiene dentaire, detartrage professionnel."
            },
            {
              "prestation_id": "dentaire_esthetique",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Blanchiment."
            }
          ]
        },
        {
          "id": "axa_dentaire_enfants",
          "code_produit": null,
          "nom": "Assurance dentaire complementaire (enfants)",
          "type": "dentaire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Taux et plafonds non chiffres dans la source.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Traitement des caries, obturations, remplacements dentaires."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Pose d'un appareil dentaire."
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Examens de controle, hygiene dentaire."
            },
            {
              "prestation_id": "chirurgie_maxillaire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Extraction des dents de sagesse."
            }
          ]
        },
        {
          "id": "axa_capital",
          "code_produit": null,
          "nom": "Assurance de capital",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "La couverture s'eteint a 60 ans revolus.",
          "couvertures": [
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 300000,
              "conditions": "Somme assuree de CHF 0 a 300'000."
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 300000
            },
            {
              "prestation_id": "capital_invalidite_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 300000,
              "conditions": "Des 56 ans, la couverture invalidite maladie est limitee a CHF 100'000."
            },
            {
              "prestation_id": "capital_deces_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 300000
            }
          ]
        },
        {
          "id": "axa_pharmacie",
          "code_produit": null,
          "nom": "Conseil sante en pharmacie",
          "type": "pharmacie",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "conseil_sante_pharmacie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Participation aux frais de conseil sante et d'examens realises dans plus de 300 pharmacies partenaires. Compris dans le plafond global de prevention : CHF 600 par an avec COMPLET, CHF 500 avec ACTIF."
            }
          ]
        }
      ]
    },
    {
      "schema_version": "1.0",
      "id": "concordia",
      "nom": "CONCORDIA",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "CONCORDIA, pages produits officielles concordia.ch (DIVERSA, NATURA, hospitalisation, dentaire, vacances)",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : la source ne traite que des complementaires. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "Rabais famille : des le 3e enfant, DIVERSA, NATURA et l'assurance-hospitalisation sont gratuites si les deux premiers enfants ont deja souscrit la meme assurance.",
        "Toute nouvelle assurance LCA ou augmentation de prestations necessite une declaration de sante.",
        "Resiliation avec preavis de 3 mois pour la fin de l'annee, au plus tard le dernier jour ouvre de septembre.",
        "Franchise hospitalisation due une seule fois par annee civile, meme en cas d'hospitalisations multiples ; deux fois seulement si le sejour est a cheval sur 2 annees et depasse 30 jours."
      ],
      "produits_lca": [
        {
          "id": "concordia_diversa",
          "code_produit": null,
          "nom": "DIVERSA",
          "type": "global",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Primes enfants jusqu'a 15 ans : CHF 4 par mois, gratuit des le 3e enfant. Pas de franchise.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Traitements ambulatoires et stationnaires d'urgence a l'etranger, stationnaire limite a 30 jours."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 10000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Illimite."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.5
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "conditions": "Dentaire ambulatoire."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "conditions": "Orthopedie dento-faciale jusqu'a 22 ans."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 150,
              "conditions": "CHF 150 par an avant 18 ans, puis sur 3 ans des 18 ans."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Aide familiale, 30 jours par an."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Cures, 30 jours par an."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.5,
              "plafond_annuel": 1000
            }
          ]
        },
        {
          "id": "concordia_diversa_plus",
          "code_produit": null,
          "nom": "DIVERSAplus",
          "type": "global",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Sans franchise.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Traitements ambulatoires et stationnaires d'urgence a l'etranger, stationnaire limite a 60 jours."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 20000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Illimite."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "conditions": "Dentaire ambulatoire."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "conditions": "Orthopedie dento-faciale jusqu'a 22 ans."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 250,
              "conditions": "CHF 250 par an avant 18 ans, puis sur 3 ans des 18 ans."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Aide familiale, 30 jours par an."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Cures, 30 jours par an."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.5,
              "plafond_annuel": 1000
            }
          ]
        },
        {
          "id": "concordia_diversa_care",
          "code_produit": null,
          "nom": "DIVERSAcare",
          "type": "global",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "chambre familiale accouchement",
              "mois": 12
            }
          ],
          "remarque": "Prestations familiales.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Traitements ambulatoires et stationnaires d'urgence a l'etranger, stationnaire limite a 45 jours."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 10000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Illimite."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.5
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "conditions": "Dentaire ambulatoire."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "conditions": "Orthopedie dento-faciale jusqu'a 22 ans."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 200,
              "conditions": "CHF 200 par an avant 18 ans, puis sur 3 ans des 18 ans."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Aide familiale, 30 jours par an."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Cures, 30 jours par an."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.5,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "nb_jours_max_annuel": 10,
              "conditions": "CHF 60 par nuit, 10 nuits au maximum."
            },
            {
              "prestation_id": "chambre_familiale_accouchement",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "nb_jours_max_annuel": 5,
              "conditions": "CHF 60 par nuit, 5 nuits au maximum. Carence de 1 an."
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": 1,
              "plafond_annuel": 600,
              "conditions": "CHF 30 de l'heure."
            },
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": 1,
              "plafond_annuel": 300000,
              "conditions": "Europe jusqu'a CHF 300'000, hors Europe CHF 50'000. Partenaire Protekta."
            },
            {
              "prestation_id": "nuitee_hospitaliere_ambulatoire",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200
            }
          ]
        },
        {
          "id": "concordia_diversa_premium",
          "code_produit": null,
          "nom": "DIVERSApremium",
          "type": "global",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Le plus complet de la gamme. Pas de franchise, hors traitements planifies a l'etranger.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Traitements ambulatoires et stationnaires d'urgence a l'etranger, stationnaire limite a 75 jours."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Illimite."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "conditions": "Dentaire ambulatoire."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "conditions": "Orthopedie dento-faciale jusqu'a 22 ans."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 300,
              "conditions": "CHF 300 par an avant 18 ans, puis sur 3 ans des 18 ans."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Aide familiale, 30 jours par an."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "nb_jours_max_annuel": 30,
              "conditions": "Cures, 30 jours par an."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.5,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 0.75,
              "plafond_annuel": 10000,
              "conditions": "Traitements ambulatoires planifies a l'etranger, franchise de CHF 1'000."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 10
            },
            {
              "prestation_id": "chambre_familiale_accouchement",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 5
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": 1,
              "plafond_annuel": 600,
              "conditions": "CHF 50 de l'heure."
            },
            {
              "prestation_id": "chirurgie_refractive",
              "taux_remboursement": 0.5,
              "plafond_annuel": 600,
              "conditions": "CHF 600 sur 5 ans."
            },
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": 1,
              "plafond_annuel": 500000,
              "conditions": "Europe jusqu'a CHF 500'000, hors Europe CHF 50'000."
            },
            {
              "prestation_id": "nuitee_hospitaliere_ambulatoire",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200
            }
          ]
        },
        {
          "id": "concordia_natura",
          "code_produit": null,
          "nom": "NATURA",
          "type": "medecine_alternative",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_th",
              "libelle": "Therapeutes reconnus",
              "plafond_annuel": 1500
            },
            {
              "id": "env_fam",
              "libelle": "Maternite et famille, tous domaines",
              "plafond_annuel": 500
            },
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante, tous domaines",
              "plafond_annuel": 500
            }
          ],
          "remarque": "Plus de 70 methodes reconnues. Primes enfants jusqu'a 15 ans : CHF 6 par mois, gratuit des le 3e enfant. Pas de franchise.",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "plafond_annuel": 4000,
              "conditions": "Traitements par des naturopathes reconnus."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 4000,
              "conditions": "Traitements par des naturopathes reconnus."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "massage_therapeutique",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200,
              "enveloppe_id": "env_fam",
              "conditions": "Preparation a l'accouchement, allaitement, gymnastique. CHF 200 par domaine."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": 500,
              "conditions": "Prevention medicale."
            }
          ]
        },
        {
          "id": "concordia_natura_plus",
          "code_produit": null,
          "nom": "NATURAplus",
          "type": "medecine_alternative",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_th",
              "libelle": "Therapeutes reconnus",
              "plafond_annuel": 2000
            },
            {
              "id": "env_fam",
              "libelle": "Maternite et famille, tous domaines",
              "plafond_annuel": 500
            },
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante, tous domaines",
              "plafond_annuel": 500
            }
          ],
          "remarque": "Plus de 130 methodes reconnues. Inclut cours bebes-nageurs, yoga et Sport Bonus. Pas de tarif enfant reduit. Pas de franchise.",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "plafond_annuel": 6000,
              "conditions": "Traitements par des naturopathes reconnus."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 6000,
              "conditions": "Traitements par des naturopathes reconnus."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "massage_therapeutique",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_th",
              "conditions": "Traitements par des therapeutes reconnus."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200,
              "enveloppe_id": "env_fam",
              "conditions": "Preparation a l'accouchement, allaitement, gymnastique. CHF 200 par domaine."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": 500,
              "conditions": "Prevention medicale."
            }
          ]
        },
        {
          "id": "concordia_hospi_privee",
          "code_produit": null,
          "nom": "Assurance-hospitalisation PRIVEE",
          "type": "hospitalisation",
          "niveau": "privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Couverture non garantie dans tous les hopitaux, listes CONCORDIA.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Chambre individuelle, libre choix de l'hopital et du medecin dans le monde entier, prise en charge integrale."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "acces_prioritaire_soins",
              "taux_remboursement": 1,
              "conditions": "concordiaMed premium."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "conditions": "CHF 60 par jour pour le sejour d'un parent aupres de son enfant hospitalise, ou inversement. Identique quelle que soit la variante."
            }
          ]
        },
        {
          "id": "concordia_hospi_mi_privee",
          "code_produit": null,
          "nom": "Assurance-hospitalisation MI-PRIVEE",
          "type": "hospitalisation",
          "niveau": "mi_privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Valable en Suisse uniquement.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Chambre a 2 lits, libre choix de l'hopital et du medecin dans toute la Suisse."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": 1,
              "conditions": "Contributions accouchement. Montant non precise."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "conditions": "CHF 60 par jour pour le sejour d'un parent aupres de son enfant hospitalise, ou inversement. Identique quelle que soit la variante."
            }
          ]
        },
        {
          "id": "concordia_hospi_libero",
          "code_produit": null,
          "nom": "Assurance-hospitalisation LIBERO",
          "type": "hospitalisation",
          "niveau": "libero",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Flexibilite maximale par sejour. La franchise peut etre reduite en choisissant une division inferieure a l'admission : la division commune n'entraine aucune franchise.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Division commune."
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Division choisie a chaque entree a l'hopital."
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Division choisie a chaque entree a l'hopital."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1,
              "conditions": "En divisions mi-privee et privee."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "conditions": "CHF 60 par jour pour le sejour d'un parent aupres de son enfant hospitalise, ou inversement. Identique quelle que soit la variante."
            }
          ]
        },
        {
          "id": "concordia_hospi_commune",
          "code_produit": null,
          "nom": "Assurance-hospitalisation COMMUNE",
          "type": "hospitalisation",
          "niveau": "commune",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Pas de libre choix de l'hopital ni du medecin.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale en division commune, y compris hors canton de domicile et dans les hopitaux conventionnes CONCORDIA."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "conditions": "CHF 60 par jour pour le sejour d'un parent aupres de son enfant hospitalise, ou inversement. Identique quelle que soit la variante."
            }
          ]
        },
        {
          "id": "concordia_dentaire_1",
          "code_produit": null,
          "nom": "Soins dentaires variante 1",
          "type": "dentaire",
          "niveau": "v1",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 500
            }
          ],
          "remarque": "Admission sans examen de sante jusqu'au 5e anniversaire de l'enfant.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Controles et hygiene dentaire."
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Bridges, couronnes, implants."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Orthopedie dento-faciale."
            }
          ]
        },
        {
          "id": "concordia_dentaire_2",
          "code_produit": null,
          "nom": "Soins dentaires variante 2",
          "type": "dentaire",
          "niveau": "v2",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 1000
            }
          ],
          "remarque": "Admission sans examen de sante jusqu'au 5e anniversaire de l'enfant.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Controles et hygiene dentaire."
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Bridges, couronnes, implants."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Orthopedie dento-faciale."
            }
          ]
        },
        {
          "id": "concordia_dentaire_3",
          "code_produit": null,
          "nom": "Soins dentaires variante 3",
          "type": "dentaire",
          "niveau": "v3",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 1500
            }
          ],
          "remarque": "Admission sans examen de sante jusqu'au 5e anniversaire de l'enfant.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Controles et hygiene dentaire."
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Bridges, couronnes, implants."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Orthopedie dento-faciale."
            }
          ]
        },
        {
          "id": "concordia_dentaire_4",
          "code_produit": null,
          "nom": "Soins dentaires variante 4",
          "type": "dentaire",
          "niveau": "v4",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 2000
            }
          ],
          "remarque": "Admission sans examen de sante jusqu'au 5e anniversaire de l'enfant.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Controles et hygiene dentaire."
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Bridges, couronnes, implants."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Orthopedie dento-faciale."
            }
          ]
        },
        {
          "id": "concordia_voyage",
          "code_produit": null,
          "nom": "Assurance vacances et voyages",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "duree_min_contrat_ans": 1,
          "remarque": "Duree au choix : 8, 15, 22, 30, 60, 90, 120, 150, 180 ou 365 jours. Souscriptible meme sans assurance de base CONCORDIA. N'inclut ni l'annulation ni les bagages. Assistance concordiaMed 24h/24.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Frais de guerison ambulatoires et stationnaires au tarif local."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 10000,
              "conditions": "Recherche."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "accouchement",
              "taux_remboursement": 1,
              "conditions": "Accouchement inattendu a l'etranger."
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "dentaire_accident",
              "taux_remboursement": 1,
              "conditions": "Soins dentaires suite a accident, au tarif local."
            }
          ]
        },
        {
          "id": "concordia_indemnites",
          "code_produit": null,
          "nom": "Indemnites journalieres",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "couvertures": [
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Perte de salaire en cas d'incapacite de travail (maladie ou accident). Montants et delais regis par des conditions generales dediees."
            }
          ]
        },
        {
          "id": "concordia_protection_juridique",
          "code_produit": null,
          "nom": "Protection juridique des patients (Protekta)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Assureur partenaire : Protekta.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": 1,
              "plafond_annuel": 500000,
              "conditions": "Incluse dans DIVERSAcare (Europe CHF 300'000, hors Europe CHF 50'000) et dans DIVERSApremium (Europe CHF 500'000, hors Europe CHF 50'000)."
            }
          ]
        }
      ]
    },
    {
      "schema_version": "1.0",
      "id": "css",
      "nom": "CSS",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "CSS, pages produits myFlex, fiches produit et conditions generales officielles css.ch",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel. Les montants et pourcentages exacts varient selon l'edition de la police et sont fixes unilateralement par la CSS : cette saisie est donc particulierement a verifier avant tout engagement."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : la source ne traite que des complementaires. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "La ligne myFlex fonctionne par combinaison modulaire : assurance ambulatoire (Economy, Balance ou Premium) + assurance hospitalisation (Economy, Balance ou Premium) + un module medecine alternative ou dentaire.",
        "Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie."
      ],
      "produits_lca": [
        {
          "id": "css_ambulatoire_economy",
          "code_produit": null,
          "nom": "myFlex Ambulatoire Economy",
          "type": "ambulatoire",
          "niveau": "economy",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Entree de gamme. Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie.",
          "couvertures": [
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 100
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.5,
              "plafond_annuel": 300,
              "conditions": "Compte sante, CHF 300 sur 2 annees civiles. Necessite myFlex Hospitalisation."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.5,
              "plafond_annuel": 150,
              "conditions": "Bonus compte sante, CHF 150 par an, CHF 300 pour une famille."
            }
          ]
        },
        {
          "id": "css_ambulatoire_balance",
          "code_produit": null,
          "nom": "myFlex Ambulatoire Balance",
          "type": "ambulatoire",
          "niveau": "balance",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Niveau standard. Surclassement possible sans nouvel examen de sante, de 20 a 70 ans, tous les 5 ans. Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie.",
          "couvertures": [
            {
              "prestation_id": "lunettes_lentilles_enfant",
              "taux_remboursement": 1,
              "plafond_annuel": 150,
              "conditions": "CHF 150 par cas jusqu'a 18 ans."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 150,
              "conditions": "CHF 150 par an des 19 ans."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.5,
              "plafond_annuel": 500,
              "conditions": "Compte sante, sur 2 annees civiles."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.5,
              "plafond_annuel": 250,
              "conditions": "Bonus compte sante, CHF 250 par an, CHF 500 pour une famille."
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": 0.9,
              "conditions": "Accouchement ambulatoire et echographie."
            },
            {
              "prestation_id": "indemnite_allaitement",
              "taux_remboursement": 1,
              "plafond_annuel": 200,
              "conditions": "CHF 200 par enfant."
            }
          ]
        },
        {
          "id": "css_ambulatoire_premium",
          "code_produit": null,
          "nom": "myFlex Ambulatoire Premium",
          "type": "ambulatoire",
          "niveau": "premium",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Sports a risque integralement assures, sous reserve de negligence grave. Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Jusqu'a CHF 250'000 par cas en Europe et CHF 50'000 par cas hors d'Europe."
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "conditions": "Sauvetage et rapatriement illimites dans le monde entier."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 1,
              "plafond_annuel": 1000,
              "conditions": "Voyage d'un proche et frais de retour anticipe jusqu'a CHF 1'000."
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.5,
              "plafond_annuel": 1000,
              "conditions": "Compte sante, sur 2 annees civiles."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.5,
              "plafond_annuel": 500,
              "conditions": "Bonus compte sante, CHF 500 par an, CHF 700 pour une famille."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Prise en charge partielle, taux non precise."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "CSS, pages produits myFlex, fiches produit et conditions generales officielles css.ch"
            }
          ]
        },
        {
          "id": "css_hospitalisation_economy",
          "code_produit": null,
          "nom": "myFlex Hospitalisation Economy",
          "type": "hospitalisation",
          "niveau": "economy",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Surclassement Economy vers Balance ou Balance vers Premium sans nouvel examen de sante. Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie.",
          "couvertures": [
            {
              "prestation_id": "chirurgie_ambulatoire",
              "taux_remboursement": 0.9,
              "conditions": "Prestations ambulatoires et semi-hospitalieres permettant d'eviter ou de raccourcir une hospitalisation stationnaire, jusqu'a 90% du montant maximum stationnaire."
            },
            {
              "prestation_id": "capital_hospitalisation",
              "taux_remboursement": 1,
              "plafond_annuel": 2000,
              "conditions": "CHF 2'000 pour un sejour d'au moins 4 jours (3 nuits), selon la division choisie."
            }
          ]
        },
        {
          "id": "css_hospitalisation_balance",
          "code_produit": null,
          "nom": "myFlex Hospitalisation Balance",
          "type": "hospitalisation",
          "niveau": "balance",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Surclassement Economy vers Balance ou Balance vers Premium sans nouvel examen de sante. Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie.",
          "couvertures": [
            {
              "prestation_id": "chirurgie_ambulatoire",
              "taux_remboursement": 0.9,
              "conditions": "Prestations ambulatoires et semi-hospitalieres permettant d'eviter ou de raccourcir une hospitalisation stationnaire, jusqu'a 90% du montant maximum stationnaire."
            },
            {
              "prestation_id": "capital_hospitalisation",
              "taux_remboursement": 1,
              "plafond_annuel": 2000,
              "conditions": "CHF 2'000 pour un sejour d'au moins 4 jours (3 nuits), selon la division choisie."
            }
          ]
        },
        {
          "id": "css_hospitalisation_premium",
          "code_produit": null,
          "nom": "myFlex Hospitalisation Premium",
          "type": "hospitalisation",
          "niveau": "premium",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Surclassement Economy vers Balance ou Balance vers Premium sans nouvel examen de sante. Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie.",
          "couvertures": [
            {
              "prestation_id": "chirurgie_ambulatoire",
              "taux_remboursement": 0.9,
              "conditions": "Prestations ambulatoires et semi-hospitalieres permettant d'eviter ou de raccourcir une hospitalisation stationnaire, jusqu'a 90% du montant maximum stationnaire."
            },
            {
              "prestation_id": "capital_hospitalisation",
              "taux_remboursement": 1,
              "plafond_annuel": 2000,
              "conditions": "CHF 2'000 pour un sejour d'au moins 4 jours (3 nuits), selon la division choisie."
            }
          ]
        },
        {
          "id": "css_medecine_alternative",
          "code_produit": null,
          "nom": "myFlex Medecine alternative",
          "type": "medecine_alternative",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Peut etre remplacee par le module dentaire selon l'offre.",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Methodes et fournisseurs reconnus par la CSS. Taux et plafonds non chiffres dans la source."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Methodes et fournisseurs reconnus par la CSS. Taux et plafonds non chiffres dans la source."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Methodes et fournisseurs reconnus par la CSS. Taux et plafonds non chiffres dans la source."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Methodes et fournisseurs reconnus par la CSS. Taux et plafonds non chiffres dans la source."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Methodes et fournisseurs reconnus par la CSS. Taux et plafonds non chiffres dans la source."
            }
          ]
        },
        {
          "id": "css_compte_sante",
          "code_produit": null,
          "nom": "Compte sante et bonus",
          "type": "prevention",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Mecanisme transversal plutot que produit autonome : les contributions dependent de la categorie Economy, Balance ou Premium souscrite. Le compte sante n'est debloque qu'en combinant une assurance ambulatoire myFlex ET une assurance hospitalisation myFlex. Son niveau depend de la categorie choisie.",
          "couvertures": [
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Preparation a l'accouchement, natation pour enfants."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "myStep, abonnements, cours de danse."
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Gym du dos, aquafitness, yoga, gestion du stress."
            },
            {
              "prestation_id": "clubs_sportifs",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Piscines, salles d'escalade, abonnements de ski de fond."
            },
            {
              "prestation_id": "sevrage_tabagique",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "css_dentaire",
          "code_produit": null,
          "nom": "Assurance pour soins dentaires",
          "type": "dentaire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Taux et plafonds non chiffres dans la source. Peut etre souscrite en lieu et place du module myFlex Medecine alternative.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Contribution aux traitements dentaires."
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Controles, detartrage."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Selon la variante souscrite."
            }
          ]
        },
        {
          "id": "css_ij_hospitalisation",
          "code_produit": null,
          "nom": "Indemnite journaliere en cas d'hospitalisation",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "couvertures": [
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Indemnite journaliere forfaitaire pendant le sejour hospitalier, versee independamment des autres assurances. Montant au choix selon contrat."
            }
          ]
        },
        {
          "id": "css_ij_individuelle",
          "code_produit": null,
          "nom": "Assurance individuelle d'indemnite journaliere",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "couvertures": [
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Incapacite de travail due a une maladie ou un accident, maintien du revenu. Regie par ses propres conditions generales."
            }
          ]
        },
        {
          "id": "css_voyage",
          "code_produit": null,
          "nom": "Assurance pour voyages et vacances",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Duree d'assurance de 10 a 62 jours, ou contrats d'un an ou trois ans. L'assistance de personnes est deja incluse dans l'assurance ambulatoire.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Frais de guerison, selon la formule choisie."
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "conditions": "Sauvetage et rapatriement illimites dans le monde entier."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "annulation_voyage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Selon la formule choisie."
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 1,
              "plafond_annuel": 1000,
              "conditions": "Voyage d'un proche, frais de retour anticipe jusqu'a CHF 1'000."
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Deces ou invalidite par accident, selon la formule."
            }
          ]
        },
        {
          "id": "css_ihp",
          "code_produit": null,
          "nom": "International Health Plan (IHP)",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Produit dedie aux Suisses de l'etranger et aux expatries.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Couverture globale dans le monde entier."
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "css_capital_accident",
          "code_produit": null,
          "nom": "Assurance deces ou invalidite par accident",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Libre choix du beneficiaire, modifiable a tout moment. Versement independant des autres assurances, imposition separee a taux reduit.",
          "couvertures": [
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 2100000,
              "conditions": "Jusqu'a CHF 2'100'000 en cas d'invalidite par accident, montant progressif."
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 200000
            }
          ]
        },
        {
          "id": "css_capital_maladie",
          "code_produit": null,
          "nom": "Assurance deces ou invalidite par maladie",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Egalement disponible pour les enfants et les jeunes, via un produit dedie.",
          "couvertures": [
            {
              "prestation_id": "capital_invalidite_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 600000
            },
            {
              "prestation_id": "capital_deces_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 200000
            }
          ]
        },
        {
          "id": "css_protection_juridique",
          "code_produit": null,
          "nom": "Protection juridique privee et circulation",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Litiges en droit prive et circulation routiere. Plafonds non precises dans la source."
            },
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Produit distinct de protection juridique des patients."
            }
          ]
        }
      ]
    },
    {
      "schema_version": "1.0",
      "id": "groupe_mutuel",
      "nom": "Groupe Mutuel",
      "actif": true,
      "source": {
        "origine": "brochure officielle",
        "reference": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis l'apercu produits, qui indique QUELLES prestations sont couvertes mais rarement a quel taux ni sous quel plafond. Toute couverture au statut 'a_completer' attend les conditions particulieres du produit. Ne pas presenter un montant a un client sur la base d'une couverture 'a_completer'."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : l'apercu des complementaires ne traite pas de l'assurance de base. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "Duree minimale des contrats : 3 ans, sauf Mundo et Legissana+ (1 an) et l'indemnite journaliere individuelle (selon police).",
        "Resiliation possible en fin d'annee civile avec preavis de 3 mois, au plus tot en fin de duree minimale.",
        "Les produits GO, HC, HB, HS et AJ limitent la duree de prise en charge hospitaliere (90 a 180 jours en division generale).",
        "Exclusions generales : maladies et accidents preexistants, faute grave de l'assure, conduite en etat d'ebriete qualifiee, faits de guerre a l'etranger (sauf exceptions)."
      ],
      "produits_lca": [
        {
          "id": "gm_global_smart_n1",
          "code_produit": "GO",
          "nom": "Global smart niveau 1",
          "type": "global",
          "niveau": "n1",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "grossesse et accouchement",
              "mois": 12
            }
          ],
          "remarque": "Rabais famille. Duree minimale de contrat 3 ans. La duree de prise en charge hospitaliere en division generale est limitee (90 a 180 jours selon l'apercu).",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "L'apercu cite les divisions commune, mi-privee et privee pour la gamme Global smart sans preciser laquelle correspond au niveau 1.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 200000,
              "conditions": "Urgences a l'etranger, maximum CHF 200'000 par an.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_global_smart_n2",
          "code_produit": "GO",
          "nom": "Global smart niveau 2",
          "type": "global",
          "niveau": "n2",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "grossesse et accouchement",
              "mois": 12
            }
          ],
          "remarque": "Rabais famille. Duree minimale de contrat 3 ans. La duree de prise en charge hospitaliere en division generale est limitee (90 a 180 jours selon l'apercu).",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "L'apercu cite les divisions commune, mi-privee et privee pour la gamme Global smart sans preciser laquelle correspond au niveau 2.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 200000,
              "conditions": "Urgences a l'etranger, maximum CHF 200'000 par an.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "chirurgie_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Uniquement niveaux 2 et 3.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_global_smart_n3",
          "code_produit": "GO",
          "nom": "Global smart niveau 3",
          "type": "global",
          "niveau": "n3",
          "age_adhesion_min": null,
          "age_adhesion_max": 70,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "grossesse et accouchement",
              "mois": 12
            }
          ],
          "remarque": "Rabais famille. Duree minimale de contrat 3 ans. La duree de prise en charge hospitaliere en division generale est limitee (90 a 180 jours selon l'apercu).",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "L'apercu cite les divisions commune, mi-privee et privee pour la gamme Global smart sans preciser laquelle correspond au niveau 3.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 200000,
              "conditions": "Urgences a l'etranger, maximum CHF 200'000 par an.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "chirurgie_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Uniquement niveaux 2 et 3.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_soins_premium",
          "code_produit": "SD",
          "nom": "Soins complementaires Premium",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 70,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Orthodontie limitee aux enfants. Rabais famille si un parent est au benefice de Premium. Duree minimale de contrat 3 ans.",
          "couvertures": [
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "contraception",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_soins_optimum",
          "code_produit": "SO",
          "nom": "Soins complementaires Optimum",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            150
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Reprend les prestations de Premium et y ajoute les lignes ci-dessus. Rabais famille. Duree minimale de contrat 3 ans.",
          "couvertures": [
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "contraception",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "chirurgie_esthetique_reconstructive",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Correction de cicatrices et d'oreilles decollees.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "confort_chirurgie_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Hotel, taxi et repas lors d'une chirurgie ambulatoire.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_hospitalisation_hc1",
          "code_produit": "HC",
          "nom": "Hospitalisation niveau 1",
          "type": "hospitalisation",
          "niveau": "hc1",
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "mois": 12
            }
          ],
          "remarque": "Duree de prise en charge hospitaliere limitee (90 a 180 jours en division generale selon l'apercu). Duree minimale de contrat 3 ans.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division commune. L'apercu ne precise pas l'etendue du libre choix de l'etablissement.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_hospitalisation_hc2",
          "code_produit": "HC",
          "nom": "Hospitalisation niveau 2",
          "type": "hospitalisation",
          "niveau": "hc2",
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0,
            1000,
            3000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "mois": 12
            }
          ],
          "remarque": "Duree de prise en charge hospitaliere limitee (90 a 180 jours en division generale selon l'apercu). Duree minimale de contrat 3 ans.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division mi-privee.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 1000,
              "conditions": "Indemnite journaliere en cas d'hospitalisation a l'etranger.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_hospitalisation_hc3",
          "code_produit": "HC",
          "nom": "Hospitalisation niveau 3",
          "type": "hospitalisation",
          "niveau": "hc3",
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0,
            1000,
            3000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "mois": 12
            }
          ],
          "remarque": "Duree de prise en charge hospitaliere limitee (90 a 180 jours en division generale selon l'apercu). Duree minimale de contrat 3 ans.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division privee.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 1500,
              "conditions": "Indemnite journaliere en cas d'hospitalisation a l'etranger.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_hospitalisation_hc4",
          "code_produit": "HC",
          "nom": "Hospitalisation niveau 4",
          "type": "hospitalisation",
          "niveau": "hc4",
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0,
            1000,
            3000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "mois": 12
            }
          ],
          "remarque": "Duree de prise en charge hospitaliere limitee (90 a 180 jours en division generale selon l'apercu). Duree minimale de contrat 3 ans.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division privee, niveau superieur.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 3000,
              "conditions": "Indemnite journaliere en cas d'hospitalisation a l'etranger.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_hospitalisation_hbonus",
          "code_produit": "HB",
          "nom": "Hospitalisation H-Bonus",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "participation_par_jour": {
            "min": 100,
            "max": 200,
            "remarque": "Selon la division choisie. Le montant exact par division n'est pas donne dans l'apercu."
          },
          "remarque": "Systeme de bonus de prime sur 3 ans. Duree minimale de contrat 3 ans.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division choisie au moment de l'hospitalisation (commune, mi-privee ou privee), avec une participation de CHF 100 a 200 par jour selon la division retenue.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Meme mecanisme de choix de division au moment de l'hospitalisation.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_hopital_senior",
          "code_produit": "HS",
          "nom": "Hopital senior (classes 1 a 4)",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": 55,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            2000,
            5000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "exclusions": [
            "maternite"
          ],
          "remarque": "Adhesion des 55 ans, sans limite d'age superieure. Prime progressive avec l'age. Franchises 0 / 2'000 / 5'000 pour les classes 3 et 4. L'apercu ne detaille pas la division par classe.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Soins en division commune, mi-privee ou privee selon la classe.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "confort_hospitalier",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Confort hotelier variable selon la classe : chambre a 1 ou 2 lits.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_capital_hospitalisation",
          "code_produit": "KH",
          "nom": "Capital hospitalisation H-Capital",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "exclusions": [
            "maternite",
            "traitement ambulatoire",
            "semi-hospitalisation"
          ],
          "remarque": "Prestation versee, sans lien avec le montant de la facture.",
          "couvertures": [
            {
              "prestation_id": "capital_hospitalisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 3500,
              "conditions": "Capital forfaitaire au choix, de CHF 300 a CHF 3'500 par hospitalisation stationnaire de plus de 24 heures. Le montant depend de l'option souscrite.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_indemnite_hospitalisation",
          "code_produit": "BH",
          "nom": "Indemnite journaliere d'hospitalisation",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 6,
          "hors_perimetre_facture": true,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "mois": 12
            }
          ],
          "couvertures": [
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": 1,
              "plafond_par_jour": 200,
              "nb_jours_max_annuel": 90,
              "conditions": "Jusqu'a CHF 200 par jour, maximum 90 jours par an et 360 indemnites sur 4 ans.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_mundo",
          "code_produit": "MU",
          "nom": "Mundo",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_mundo",
              "libelle": "Plafond annuel Mundo, toutes prestations confondues",
              "plafond_annuel": 100000
            }
          ],
          "exclusions": [
            "traitements volontaires a l'etranger"
          ],
          "duree_min_contrat_ans": 1,
          "remarque": "Couverture maladie et accident dans le monde entier, ambulatoire et hospitalier. Rabais en combinaison avec GO, HB, HC, HS, SD ou SO.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_mundo",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_mundo",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_mundo",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_mundo",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_dentaire_plus_1",
          "code_produit": "DP",
          "nom": "Dentaire plus niveau 1",
          "type": "dentaire",
          "niveau": "dp1",
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 3,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "protheses",
              "mois": 12
            }
          ],
          "enveloppes": [
            {
              "id": "env_dp",
              "libelle": "Plafond annuel dentaire, toutes prestations confondues",
              "plafond_annuel": 1000
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "conditions": "Frais de laboratoire inclus.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 1,
              "plafond_annuel": 75,
              "conditions": "Controle prophylactique, CHF 75.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_dentaire_plus_2",
          "code_produit": "DP",
          "nom": "Dentaire plus niveau 2",
          "type": "dentaire",
          "niveau": "dp2",
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 3,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "protheses",
              "mois": 12
            }
          ],
          "enveloppes": [
            {
              "id": "env_dp",
              "libelle": "Plafond annuel dentaire, toutes prestations confondues",
              "plafond_annuel": 3000
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "conditions": "Frais de laboratoire inclus.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 1,
              "plafond_annuel": 75,
              "conditions": "Controle prophylactique, CHF 75.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_dentaire_plus_3",
          "code_produit": "DP",
          "nom": "Dentaire plus niveau 3",
          "type": "dentaire",
          "niveau": "dp3",
          "age_adhesion_min": null,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 3,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "protheses",
              "mois": 12
            }
          ],
          "enveloppes": [
            {
              "id": "env_dp",
              "libelle": "Plafond annuel dentaire, toutes prestations confondues",
              "plafond_annuel": 15000
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp",
              "conditions": "Frais de laboratoire inclus.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 1,
              "plafond_annuel": 75,
              "conditions": "Controle prophylactique, CHF 75.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_acrobat",
          "code_produit": "AB",
          "nom": "Acrobat (0 a 18 ans)",
          "type": "accident",
          "niveau": null,
          "age_adhesion_min": 0,
          "age_adhesion_max": 18,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Trois niveaux existent (eco, light, standard) mais l'apercu ne detaille pas les prestations par niveau. Transfert automatique vers ProVista ou ActiVita a 18 ans.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 700000,
              "conditions": "Capital invalidite jusqu'a CHF 700'000 selon le niveau.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": 1,
              "plafond_annuel": 10000,
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "rattrapage_scolaire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "chirurgie_esthetique_reconstructive",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_activita",
          "code_produit": "AJ",
          "nom": "ActiVita (des 18 ans)",
          "type": "accident",
          "niveau": null,
          "age_adhesion_min": 18,
          "age_adhesion_max": 60,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "exclusions": [
            "sport professionnel",
            "entreprises temeraires"
          ],
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Traitements stationnaires prives.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "libre_choix_specialiste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "chirurgie_esthetique_reconstructive",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 60000,
              "conditions": "Jusqu'a CHF 60'000 par cas.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "gardiennage_domicile",
              "taux_remboursement": null,
              "statut": "a_completer",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 1,
              "plafond_annuel": 500,
              "conditions": "Abonnement sport, CHF 500 par cas.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_indemnite_journaliere",
          "code_produit": "PI",
          "nom": "Indemnite journaliere individuelle",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": 15,
          "age_adhesion_max": 55,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Annonce du sinistre dans les 15 jours. Duree de contrat selon police.",
          "couvertures": [
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Perte de salaire en cas de maladie et/ou d'accident. Montant, duree (par exemple 730 jours) et delai d'attente definis dans la police.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_sekunda",
          "code_produit": "AM",
          "nom": "Sekunda (incapacite de travail menager)",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": 18,
          "age_adhesion_max": 55,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "exclusions": [
            "maladie",
            "maternite"
          ],
          "remarque": "Carence de 15 jours. Couverture prenant fin a 65 ans.",
          "couvertures": [
            {
              "prestation_id": "indemnite_travail_menager",
              "taux_remboursement": 1,
              "plafond_par_jour": 50,
              "nb_jours_max_annuel": 365,
              "conditions": "Jusqu'a CHF 50 par jour en cas d'incapacite de travail menager consecutive a un accident.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_legispriva",
          "code_produit": "LJ",
          "nom": "Legispriva (protection juridique privee)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 3,
          "hors_perimetre_facture": true,
          "remarque": "Carence de 3 mois pour certains domaines. Frais et honoraires d'avocat, expertises, deplacement sur citation judiciaire.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Maximum CHF 250'000 par cas. Droit du travail, bail, contrat d'entreprise, consommation, penal et administratif, propriete, voisinage, droit des personnes, de la famille et des successions.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_legisstrada",
          "code_produit": "LJ",
          "nom": "Legisstrada (protection juridique mobilite)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 3,
          "hors_perimetre_facture": true,
          "remarque": "Carence de 3 mois pour certains domaines. Frais et honoraires d'avocat, expertises, deplacement sur citation judiciaire.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Maximum CHF 250'000 par cas. Droit penal et administratif de la circulation, responsabilite civile, assurances et contrats lies aux vehicules.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_legisduo",
          "code_produit": "LJ",
          "nom": "Legisduo (privee + mobilite)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 3,
          "hors_perimetre_facture": true,
          "remarque": "Carence de 3 mois pour certains domaines. Frais et honoraires d'avocat, expertises, deplacement sur citation judiciaire.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Maximum CHF 250'000 par cas. Combine Legispriva et Legisstrada, aux conditions cumulees des deux produits.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_legissana_plus",
          "code_produit": "LS",
          "nom": "Legissana+ (protection juridique du patient)",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "delais_attente_specifiques": [
            {
              "motif": "interventions esthetiques",
              "mois": 3
            }
          ],
          "exclusions": [
            "psychiatrie",
            "psychotherapie"
          ],
          "duree_min_contrat_ans": 1,
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 500000,
              "conditions": "Maximum CHF 500'000 par cas en Suisse et CHF 50'000 par cas hors de Suisse. Litiges lies a la violation de la protection des donnees de sante, aux erreurs de diagnostic ou de traitement, et aux dommages lies a un moyen auxiliaire ou un medicament.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_provista",
          "code_produit": "ID",
          "nom": "ProVista",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 65,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Des 70 ans, les prestations sont limitees a CHF 10'000 pour le deces et CHF 30'000 pour l'invalidite.",
          "couvertures": [
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 400000,
              "conditions": "Capital invalidite jusqu'a CHF 400'000, avec progression jusqu'a 350%. Montant selon l'option souscrite.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 200000,
              "conditions": "Capital deces jusqu'a CHF 200'000. Montant selon l'option souscrite.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_provistalight",
          "code_produit": "AD",
          "nom": "ProVistalight",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 65,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Memes plafonds et memes limitations que ProVista pour le deces.",
          "couvertures": [
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 200000,
              "conditions": "Capital deces suite a accident uniquement, jusqu'a CHF 200'000 selon l'option souscrite.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        },
        {
          "id": "gm_kidsprotect",
          "code_produit": "KP",
          "nom": "KidsProtect",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 17,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 3,
          "hors_perimetre_facture": true,
          "remarque": "Reserve aux enfants de moins de 17 ans sans cancer preexistant. Couverture prenant fin a 17 ans revolus, ou 60 mois apres le diagnostic.",
          "couvertures": [
            {
              "prestation_id": "rente_cancer_enfant",
              "taux_remboursement": 1,
              "plafond_par_jour": null,
              "conditions": "Rente mensuelle de CHF 4'000 en cas de cancer de l'enfant, maximum 15 rentes sur 60 mois. Usage libre, sans franchise.",
              "source_page": "Apercu des assurances complementaires selon la LCA, Groupe Mutuel, edition 2.26"
            }
          ]
        }
      ]
    },
    {
      "schema_version": "1.0",
      "id": "helsana",
      "nom": "Helsana",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "Helsana, brochure « Nos assurances et prestations en detail », edition 2025/26",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : la source ne traite que des complementaires. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "Rabais famille : 5% des 2 personnes, 10% des 3 personnes.",
        "Rabais pluriannuel de 3% pour les nouveaux contrats de 3 ans.",
        "Rabais jusqu'a 15% avec une franchise hospitaliere au choix."
      ],
      "produits_lca": [
        {
          "id": "helsana_top",
          "code_produit": null,
          "nom": "TOP",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ts",
              "libelle": "Therapies speciales",
              "plafond_annuel": 3000
            },
            {
              "id": "env_transport",
              "libelle": "Transport et sauvetage en Suisse",
              "plafond_annuel": 100000
            }
          ],
          "remarque": "Rabais famille : 5% des 2 personnes, 10% des 3. Rabais pluriannuel de 3% pour un nouveau contrat de 3 ans.",
          "couvertures": [
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "conditions": "Sans plafond indique."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Protection integrale en cas d'urgence."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 0.9,
              "plafond_annuel": 150
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Protection juridique sante et etranger, jusqu'a CHF 250'000 par litige."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.75,
              "plafond_annuel": 500
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": 0.75,
              "plafond_annuel": 500
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ts"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ts"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "conditions": "Ecole du dos et cours assimiles, CHF 200 par domaine."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "conditions": "Domaine grossesse de la promotion sante, CHF 200 par domaine."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_transport",
              "conditions": "Transport et sauvetage en Suisse, plafond annuel commun de CHF 100'000. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_transport",
              "conditions": "Meme plafond commun que le transport."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "conditions": "Medecine complementaire ambulatoire 75%. En stationnaire, prise en charge a 100% jusqu'a CHF 5'000 par an."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "Helsana, brochure « Nos assurances et prestations en detail », edition 2025/26"
            }
          ]
        },
        {
          "id": "helsana_sana",
          "code_produit": null,
          "nom": "SANA",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ts",
              "libelle": "Therapies speciales",
              "plafond_annuel": 3000
            },
            {
              "id": "env_transport",
              "libelle": "Transport et sauvetage en Suisse",
              "plafond_annuel": 100000
            }
          ],
          "remarque": "Oriente medecine alternative, reseau de plus de 14'000 therapeutes reconnus. Rabais famille : 5% des 2 personnes, 10% des 3. Rabais pluriannuel de 3% pour un nouveau contrat de 3 ans.",
          "couvertures": [
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "conditions": "Sans plafond indique."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Protection integrale en cas d'urgence."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 0.9,
              "plafond_annuel": 150
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Protection juridique sante et etranger, jusqu'a CHF 250'000 par litige."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.75,
              "plafond_annuel": 500
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": 0.75,
              "plafond_annuel": 500
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ts"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ts"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "conditions": "Ecole du dos et cours assimiles, CHF 200 par domaine."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "conditions": "Domaine grossesse de la promotion sante, CHF 200 par domaine."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_transport",
              "conditions": "Transport et sauvetage en Suisse, plafond annuel commun de CHF 100'000. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_transport",
              "conditions": "Meme plafond commun que le transport."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "conditions": "Medecine complementaire ambulatoire 75%. En stationnaire, prise en charge a 100% jusqu'a CHF 5'000 par an."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 10000,
              "conditions": "Jusqu'a 20 ans."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.75,
              "conditions": "Medicaments de medecine complementaire, 75%."
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "Helsana, brochure « Nos assurances et prestations en detail », edition 2025/26"
            }
          ]
        },
        {
          "id": "helsana_completa",
          "code_produit": null,
          "nom": "COMPLETA",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ts",
              "libelle": "Therapies speciales",
              "plafond_annuel": 4500
            },
            {
              "id": "env_transport",
              "libelle": "Transport et sauvetage en Suisse",
              "plafond_annuel": 100000
            }
          ],
          "remarque": "Combine TOP et SANA avec des remboursements plus eleves. Rabais famille : 5% des 2 personnes, 10% des 3. Rabais pluriannuel de 3% pour un nouveau contrat de 3 ans.",
          "couvertures": [
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "conditions": "Sans plafond indique."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Protection integrale en cas d'urgence."
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1500
            },
            {
              "prestation_id": "protection_juridique_patient",
              "taux_remboursement": 1,
              "plafond_annuel": 250000,
              "conditions": "Protection juridique sante et etranger, jusqu'a CHF 250'000 par litige."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": 750
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 750
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ts"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_ts"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "conditions": "Ecole du dos et cours assimiles, CHF 200 par domaine."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.75,
              "plafond_annuel": 200,
              "conditions": "Domaine grossesse de la promotion sante, CHF 200 par domaine."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_transport",
              "conditions": "Transport et sauvetage en Suisse, plafond annuel commun de CHF 100'000. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer",
              "enveloppe_id": "env_transport",
              "conditions": "Meme plafond commun que le transport."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "conditions": "Medecine complementaire ambulatoire 75%. En stationnaire, prise en charge a 100% jusqu'a CHF 5'000 par an."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.75
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1,
              "plafond_annuel": 30000,
              "conditions": "Recherche en Suisse, 100% jusqu'a CHF 30'000."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 10000,
              "conditions": "Jusqu'a 20 ans."
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "Helsana, brochure « Nos assurances et prestations en detail », edition 2025/26"
            }
          ]
        },
        {
          "id": "helsana_completa_plus",
          "code_produit": null,
          "nom": "COMPLETA PLUS",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "chirurgie refractive",
              "mois": 12
            }
          ],
          "remarque": "Souscriptible uniquement en complement de COMPLETA.",
          "couvertures": [
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 200,
              "conditions": "CHF 200 par an en supplement de COMPLETA, montures comprises."
            },
            {
              "prestation_id": "chirurgie_refractive",
              "taux_remboursement": 1,
              "plafond_annuel": 1000,
              "conditions": "Laser, CHF 500 par oeil et par an. Carence de 12 mois."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1000,
              "conditions": "90% du montant excedant la prise en charge COMPLETA, max CHF 1'000 par an."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.75,
              "conditions": "Quote-part ramenee a 25%."
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": 0.75,
              "conditions": "Quote-part ramenee a 25%."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 1,
              "plafond_annuel": 200,
              "conditions": "CHF 200 par an supplementaires, tous domaines."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.75,
              "plafond_annuel": 500,
              "conditions": "15% supplementaires max CHF 500 par an, ou 75% max CHF 500 pour les therapies non couvertes par COMPLETA."
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "Helsana, brochure « Nos assurances et prestations en detail », edition 2025/26"
            }
          ]
        },
        {
          "id": "helsana_primeo",
          "code_produit": null,
          "nom": "PRIMEO",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Confort pour les interventions ambulatoires. Complete la gamme HOSPITAL.",
          "couvertures": [
            {
              "prestation_id": "libre_choix_medecin_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Chez les partenaires reconnus Helsana."
            },
            {
              "prestation_id": "confort_chirurgie_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Espace repos, restauration, taxi."
            },
            {
              "prestation_id": "innovations_medicales",
              "taux_remboursement": 0.9,
              "plafond_annuel": 5000
            },
            {
              "prestation_id": "implants_medicaux",
              "taux_remboursement": 0.9,
              "plafond_annuel": 5000
            },
            {
              "prestation_id": "nuitee_hospitaliere_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 1200,
              "conditions": "Nuitees non indiquees, jusqu'a CHF 1'200 par an. Taux non precise."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 600,
              "conditions": "Accompagnant, jusqu'a CHF 600 par an."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "KidsCare et Nanny Service, 40 heures par an."
            },
            {
              "prestation_id": "gardiennage_domicile",
              "taux_remboursement": 1,
              "plafond_annuel": 100,
              "conditions": "Garde d'animaux, CHF 100 par cas."
            },
            {
              "prestation_id": "centre_thermal",
              "taux_remboursement": 1,
              "plafond_annuel": 180,
              "conditions": "CHF 20 par entree, 9 entrees au maximum."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 500
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 1,
              "plafond_annuel": 1700,
              "conditions": "Jusqu'a CHF 1'700 sur 3 ans."
            }
          ]
        },
        {
          "id": "helsana_world",
          "code_produit": null,
          "nom": "WORLD",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Couverture monde entier hors zones a risque. Admission sans examen du risque, affections preexistantes exclues.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Frais de guerison integraux, 12 mois au maximum."
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 10000
            },
            {
              "prestation_id": "visite_proche_hospitalisation",
              "taux_remboursement": 1,
              "conditions": "Voyage de visite pour 2 proches si l'hospitalisation depasse 7 jours."
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 1,
              "plafond_annuel": 10000,
              "conditions": "Voyage de retour 100%. Frais de voyage jusqu'a CHF 10'000 par personne ou CHF 20'000 par famille."
            }
          ]
        },
        {
          "id": "helsana_dentaplus_light",
          "code_produit": null,
          "nom": "DENTAplus LIGHT",
          "type": "dentaire",
          "niveau": "light",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 6,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_dp",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 300
            }
          ],
          "remarque": "Souscription sans examen pour LIGHT. Pas d'examen de sante pour les enfants de moins de 3 ans, pas de radiographies avant 7 ans.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "chirurgie_maxillaire",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            }
          ]
        },
        {
          "id": "helsana_dentaplus_bronze",
          "code_produit": null,
          "nom": "DENTAplus BRONZE",
          "type": "dentaire",
          "niveau": "bronze",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 6,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_dp",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 1000
            }
          ],
          "remarque": "Souscription sans examen pour LIGHT. Pas d'examen de sante pour les enfants de moins de 3 ans, pas de radiographies avant 7 ans.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "chirurgie_maxillaire",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_dp"
            }
          ]
        },
        {
          "id": "helsana_dentaplus_argent",
          "code_produit": null,
          "nom": "DENTAplus ARGENT",
          "type": "dentaire",
          "niveau": "argent",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 6,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_dp",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 2000
            }
          ],
          "remarque": "Souscription sans examen pour LIGHT. Pas d'examen de sante pour les enfants de moins de 3 ans, pas de radiographies avant 7 ans.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "chirurgie_maxillaire",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            }
          ]
        },
        {
          "id": "helsana_dentaplus_or",
          "code_produit": null,
          "nom": "DENTAplus OR",
          "type": "dentaire",
          "niveau": "or",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 6,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_dp",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 3000
            }
          ],
          "remarque": "Souscription sans examen pour LIGHT. Pas d'examen de sante pour les enfants de moins de 3 ans, pas de radiographies avant 7 ans.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "chirurgie_maxillaire",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_dp"
            }
          ]
        },
        {
          "id": "helsana_dentaplus_combi",
          "code_produit": null,
          "nom": "DENTAplus COMBI",
          "type": "dentaire",
          "niveau": "combi",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 6,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "50% jusqu'a CHF 2'000 de dommages, puis 80% au-dela, sans limite annuelle. Bareme a deux paliers non representable en un taux unique."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Meme bareme a deux paliers."
            },
            {
              "prestation_id": "chirurgie_maxillaire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Meme bareme a deux paliers."
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Meme bareme a deux paliers."
            }
          ]
        },
        {
          "id": "helsana_hospital_eco",
          "code_produit": null,
          "nom": "HOSPITAL ECO",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "jours": 365
            }
          ],
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "100% des frais en division commune dans toute la Suisse, libre choix de l'hopital."
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 500,
              "nb_jours_max_annuel": 60
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Nanny et KidsCare, 30 heures par an."
            }
          ]
        },
        {
          "id": "helsana_flex1",
          "code_produit": null,
          "nom": "HOSPITAL FLEX 1",
          "type": "hospitalisation",
          "niveau": "flex1",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Choix de la division au cas par cas, parmi les hopitaux et medecins reconnus Helsana.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 0.35,
              "plafond_annuel": 3000
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 0.5,
              "plafond_annuel": 9000
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "CHF 500 a 1'000 par jour selon la formule. La source ne precise pas le montant propre a chaque niveau."
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Forfait accouchement ambulatoire de CHF 500 a 1'000 selon la formule."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "CHF 50 a 100 par jour selon la formule."
            }
          ]
        },
        {
          "id": "helsana_flex2",
          "code_produit": null,
          "nom": "HOSPITAL FLEX 2",
          "type": "hospitalisation",
          "niveau": "flex2",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Choix de la division au cas par cas, parmi les hopitaux et medecins reconnus Helsana.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 0.2,
              "plafond_annuel": 2000
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 0.35,
              "plafond_annuel": 4000
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "CHF 500 a 1'000 par jour selon la formule. La source ne precise pas le montant propre a chaque niveau."
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Forfait accouchement ambulatoire de CHF 500 a 1'000 selon la formule."
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "CHF 50 a 100 par jour selon la formule."
            }
          ]
        },
        {
          "id": "helsana_hospital_demi_privee",
          "code_produit": null,
          "nom": "HOSPITAL Demi-Privee",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "jours": 365
            }
          ],
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale, chambre a 2 lits, dans toute la Suisse."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 1500,
              "conditions": "En cas d'urgence."
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": 1,
              "plafond_annuel": 1500
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 15
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 21
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Nanny et KidsCare, 60 heures par an."
            },
            {
              "prestation_id": "acces_prioritaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Fast Track."
            },
            {
              "prestation_id": "deuxieme_avis_medical",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "helsana_hospital_privee",
          "code_produit": null,
          "nom": "HOSPITAL Privee",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "jours": 365
            }
          ],
          "remarque": "Couverture sans faille en combinaison avec PRIMEO.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale, chambre individuelle, dans toute la Suisse."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale a l'etranger."
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": 1,
              "plafond_annuel": 3000
            },
            {
              "prestation_id": "rooming_in",
              "taux_remboursement": 1,
              "plafond_par_jour": 200,
              "nb_jours_max_annuel": 15
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 200,
              "nb_jours_max_annuel": 21
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 200,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "garde_enfants_malades",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Nanny et KidsCare, 120 heures par an."
            },
            {
              "prestation_id": "acces_prioritaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Fast Track."
            },
            {
              "prestation_id": "deuxieme_avis_medical",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "helsana_advocare_plus",
          "code_produit": null,
          "nom": "Helsana Advocare PLUS",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Tarif preferentiel en combinaison avec TOP, COMPLETA ou OMNIA. Rabais famille jusqu'a 25%.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 300000,
              "conditions": "Droit prive et circulation en Europe, sommes assurees jusqu'a CHF 300'000. Consultation juridique jusqu'a CHF 300. Libre choix de l'avocat."
            }
          ]
        },
        {
          "id": "helsana_advocare_extra",
          "code_produit": null,
          "nom": "Helsana Advocare EXTRA",
          "type": "protection_juridique",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Aucune valeur litigieuse minimale.",
          "couvertures": [
            {
              "prestation_id": "protection_juridique",
              "taux_remboursement": 1,
              "plafond_annuel": 1000000,
              "conditions": "Protection mondiale. Sommes assurees jusqu'a CHF 1 million en Europe et CHF 100'000 hors d'Europe. Consultation juridique jusqu'a CHF 1'000. Inclut cyberharcelement, phishing, hacking et droit d'auteur."
            }
          ]
        },
        {
          "id": "helsana_cura",
          "code_produit": null,
          "nom": "CURA",
          "type": "longue_duree",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Delai d'attente de 180, 360, 720 ou 1080 jours selon le choix.",
          "couvertures": [
            {
              "prestation_id": "soins_longue_duree",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Forfait journalier au choix de CHF 10 a CHF 300. Participation aux frais d'hotellerie en EMS ou a l'aide menagere en ambulatoire."
            }
          ]
        },
        {
          "id": "helsana_vivante",
          "code_produit": null,
          "nom": "VIVANTE",
          "type": "longue_duree",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Aucun delai d'attente. Carence maladie de 3 ans.",
          "couvertures": [
            {
              "prestation_id": "indemnite_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Indemnite journaliere librement disponible de CHF 40 a 180 par jour, soit CHF 1'200 a 5'400 par mois, en cas de necessite de soins d'au moins 25% (indice de Barthel) durant 6 mois ou plus."
            }
          ]
        },
        {
          "id": "helsana_hospital_extra",
          "code_produit": null,
          "nom": "HOSPITAL EXTRA",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "delais_attente_specifiques": [
            {
              "motif": "maternite",
              "jours": 365
            }
          ],
          "couvertures": [
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_jour": 300,
              "nb_jours_max_annuel": 30,
              "conditions": "Indemnite journaliere de CHF 50, 100, 150 ou 200, ou jusqu'a CHF 300 par jour selon l'option souscrite. Versee independamment des autres assurances."
            }
          ]
        },
        {
          "id": "helsana_salaria",
          "code_produit": null,
          "nom": "SALARIA",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Delais d'attente au choix de 3 a 360 jours. Maternite : 16 semaines en LAMal, non couverte en LCA.",
          "couvertures": [
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Perte de gain maladie et accident. En LCA, CHF 10 a 600 par jour, au maximum CHF 18'000 par mois, pendant 365 ou 730 jours. Incapacite d'au moins 25% requise."
            }
          ]
        },
        {
          "id": "helsana_prevea",
          "code_produit": null,
          "nom": "PREVEA Accident / Maladie",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Prestations complementaires accident : mobilite CHF 1'000 par an, reconversion a hauteur de 10% de la somme AI. Resiliables a tout moment avec un preavis de 3 mois.",
          "couvertures": [
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 300000,
              "conditions": "Par tranches de CHF 10'000 jusqu'a CHF 300'000, avec progression jusqu'a 350%, soit au maximum CHF 1'050'000. Montant selon l'option souscrite."
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 300000,
              "conditions": "Meme bareme par tranches que l'invalidite."
            },
            {
              "prestation_id": "capital_invalidite_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 500000,
              "conditions": "Jusqu'a CHF 300'000 de 0 a 20 ans, CHF 500'000 des 21 ans."
            },
            {
              "prestation_id": "capital_deces_maladie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 500000,
              "conditions": "Meme bareme."
            },
            {
              "prestation_id": "liberation_primes",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Liberation des primes des enfants (volet accident)."
            }
          ]
        }
      ]
    },
    {
      "schema_version": "1.0",
      "id": "sanitas",
      "nom": "Sanitas",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "Sanitas, pages produits officielles (Vital, Dental, Hospital, Easy, Medical Private, Capital, Salary, Planning a Family)",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : la source ne traite que des complementaires. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "Les montants indiques sont des prestations maximales et, sauf mention contraire, valables par annee civile.",
        "Un supplement de prime individuel permet une couverture complete meme en cas d'antecedent de sante.",
        "Le passage a une categorie superieure necessite un examen de sante ; le passage a une categorie inferieure non."
      ],
      "produits_lca": [
        {
          "id": "sanitas_vital_basic",
          "code_produit": null,
          "nom": "Vital Basic",
          "type": "ambulatoire",
          "niveau": "basic",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_prev",
              "libelle": "Prevention",
              "plafond_annuel": 500
            }
          ],
          "remarque": "Entree de gamme. Ni medecine alternative ni promotion de la sante.",
          "couvertures": [
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Transport d'urgence et sauvetage, 100% illimite dans le monde."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1,
              "plafond_annuel": 50000,
              "conditions": "Recherche et degagement en Suisse, par evenement."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Urgences a l'etranger, 100% illimite, 180 jours au maximum."
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "conditions": "Assistance Sanitas."
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 1,
              "plafond_annuel": 2000,
              "conditions": "Hebergement jusqu'a 10 nuits a CHF 200, medicaments."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "conditions": "Sans plafond."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 300,
              "conditions": "CHF 300 sur 3 ans."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "plafond_annuel": 10000,
              "conditions": "Jusqu'a 20 ans."
            }
          ]
        },
        {
          "id": "sanitas_vital_smart",
          "code_produit": null,
          "nom": "Vital Smart",
          "type": "ambulatoire",
          "niveau": "smart",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_prev",
              "libelle": "Prevention",
              "plafond_annuel": 1000
            },
            {
              "id": "env_ma",
              "libelle": "Medecine alternative (option CHF 2'500 ou 5'000)",
              "plafond_annuel": null
            },
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante (option CHF 400 ou 600)",
              "plafond_annuel": null
            },
            {
              "id": "env_tc",
              "libelle": "Therapies et diagnostics complementaires",
              "plafond_annuel": 1000
            }
          ],
          "remarque": "Reprend Vital Basic. Les plafonds de medecine alternative (CHF 2'500 ou 5'000) et de promotion de la sante (CHF 400 ou 600) dependent de l'option souscrite : ils sont laisses a null plutot que de retenir un montant arbitraire. 4,5 etoiles Moneyland 2026.",
          "couvertures": [
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Transport d'urgence et sauvetage, 100% illimite dans le monde."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1,
              "plafond_annuel": 50000,
              "conditions": "Recherche et degagement en Suisse, par evenement."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Urgences a l'etranger, 100% illimite, 180 jours au maximum."
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "conditions": "Assistance Sanitas."
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 1,
              "plafond_annuel": 2000,
              "conditions": "Hebergement jusqu'a 10 nuits a CHF 200, medicaments."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "conditions": "Sans plafond."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 300,
              "conditions": "CHF 300 sur 3 ans."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "conditions": "Sans plafond, jusqu'a 20 ans."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev",
              "conditions": "Depistage du cancer."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "massage_therapeutique",
              "taux_remboursement": 0.8,
              "plafond_a_preciser": true,
              "plafond_annuel": null,
              "conditions": "Sous-plafond de CHF 250 ou CHF 500 selon l'option de medecine alternative choisie."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.8,
              "plafond_annuel": 1000,
              "conditions": "Prestations parentales."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "chirurgie_esthetique_reconstructive",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "podologie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "Sanitas, pages produits officielles (Vital, Dental, Hospital, Easy, Medical Private, Capital, Salary, Planning a Family)"
            }
          ]
        },
        {
          "id": "sanitas_vital_premium",
          "code_produit": null,
          "nom": "Vital Premium",
          "type": "ambulatoire",
          "niveau": "premium",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_prev",
              "libelle": "Prevention",
              "plafond_annuel": 1500
            },
            {
              "id": "env_ma",
              "libelle": "Medecine alternative",
              "plafond_annuel": 10000
            },
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante",
              "plafond_annuel": 800
            },
            {
              "id": "env_tc",
              "libelle": "Therapies et diagnostics complementaires",
              "plafond_annuel": 5000
            }
          ],
          "remarque": "Couverture la plus etendue de la gamme Vital. 4,5 etoiles Moneyland 2026.",
          "couvertures": [
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1,
              "conditions": "Transport d'urgence et sauvetage, 100% illimite dans le monde."
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1,
              "plafond_annuel": 50000,
              "conditions": "Recherche et degagement en Suisse, par evenement."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Urgences a l'etranger, 100% illimite, 180 jours au maximum."
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "conditions": "Assistance Sanitas."
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 1,
              "plafond_annuel": 2000,
              "conditions": "Hebergement jusqu'a 10 nuits a CHF 200, medicaments."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "conditions": "Sans plafond."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 1000
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 300,
              "conditions": "CHF 300 sur 3 ans."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 600,
              "conditions": "CHF 600 sur 3 ans."
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.8,
              "conditions": "Sans plafond, jusqu'a 20 ans."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev"
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev",
              "conditions": "Depistage du cancer, controle des grains de beaute en ligne, prevention de la cataracte."
            },
            {
              "prestation_id": "tests_genetiques",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_prev",
              "conditions": "Autotests."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "massage_therapeutique",
              "taux_remboursement": 0.8,
              "plafond_annuel": 750,
              "enveloppe_id": "env_ma"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.8,
              "plafond_annuel": 400,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.8,
              "plafond_annuel": 400,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.8,
              "plafond_annuel": 1000,
              "conditions": "Prestations parentales."
            },
            {
              "prestation_id": "forfait_accouchement",
              "taux_remboursement": 1,
              "plafond_annuel": 1000,
              "conditions": "Indemnite journaliere jusqu'a CHF 1'000 par naissance ou adoption."
            },
            {
              "prestation_id": "therapies_digitales",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "tests_prenataux_genetiques",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.8,
              "plafond_annuel": 500,
              "conditions": "Transports planifies."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "sterilisation",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "chirurgie_esthetique_reconstructive",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "podologie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_tc"
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "Sanitas, pages produits officielles (Vital, Dental, Hospital, Easy, Medical Private, Capital, Salary, Planning a Family)"
            }
          ]
        },
        {
          "id": "sanitas_dental_basic",
          "code_produit": null,
          "nom": "Dental Basic",
          "type": "dentaire",
          "niveau": "basic",
          "age_adhesion_min": null,
          "age_adhesion_max": 65,
          "franchises_produit": [
            250
          ],
          "delai_attente_mois": 6,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "protheses et facettes",
              "mois": 12
            }
          ],
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 2000
            }
          ],
          "remarque": "Franchise de CHF 250 par an, hors prevention. Suisse et pays limitrophes.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d",
              "conditions": "Bridges, couronnes, pivots. Facettes et parodontologie incluses."
            },
            {
              "prestation_id": "dentaire_esthetique",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d",
              "conditions": "Facettes."
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 1,
              "plafond_annuel": 100,
              "conditions": "Controles et hygiene dentaire, CHF 100 par an, hors franchise."
            }
          ]
        },
        {
          "id": "sanitas_dental",
          "code_produit": null,
          "nom": "Dental",
          "type": "dentaire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": 59,
          "franchises_produit": [
            350
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "general",
              "jours": 180
            }
          ],
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 5000
            }
          ],
          "remarque": "Franchise de CHF 350 par an et par cause (maladie ou accident). Aucune carence en cas d'accident. Rapport dentaire requis des le 5e anniversaire. Suisse et monde entier.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "chirurgie_maxillaire",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.8,
              "enveloppe_id": "env_d",
              "conditions": "Un controle ou une visite d'hygiene dentaire par an."
            }
          ]
        },
        {
          "id": "sanitas_hospital_standard",
          "code_produit": null,
          "nom": "Hospital Standard Liberty",
          "type": "hospitalisation",
          "niveau": "standard",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Surclassement possible via Hospital Upgrade.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Libre choix de l'hopital en division commune parmi les hopitaux partenaires Sanitas."
            }
          ]
        },
        {
          "id": "sanitas_hospital_extra",
          "code_produit": null,
          "nom": "Hospital Extra Liberty",
          "type": "hospitalisation",
          "niveau": "extra",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Conseiller personnel.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Chambre a 2 lits, parmi les hopitaux partenaires accredites."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "acces_prioritaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Priority Access."
            },
            {
              "prestation_id": "deuxieme_avis_medical",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "sanitas_hospital_top",
          "code_produit": null,
          "nom": "Hospital Top Liberty",
          "type": "hospitalisation",
          "niveau": "top",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Couverture la plus elevee de la gamme hospitalisation.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Chambre individuelle, libre choix du medecin et de l'hopital."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "acces_prioritaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Priority Access."
            },
            {
              "prestation_id": "deuxieme_avis_medical",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "innovations_medicales",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Procedures innovantes."
            },
            {
              "prestation_id": "implants_medicaux",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "sanitas_hospital_day_comfort",
          "code_produit": null,
          "nom": "Hospital Day Comfort",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Concue pour les interventions ambulatoires sans nuitee.",
          "couvertures": [
            {
              "prestation_id": "libre_choix_medecin_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Parmi les partenaires Sanitas, pour les interventions realisees dans la journee."
            },
            {
              "prestation_id": "acces_prioritaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "deuxieme_avis_medical",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "confort_chirurgie_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Confort avant, pendant et apres l'intervention."
            }
          ]
        },
        {
          "id": "sanitas_accident_extra",
          "code_produit": null,
          "nom": "Accident Extra Liberty",
          "type": "accident",
          "niveau": "extra",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "En cas d'accident."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Traitements d'urgence a l'etranger."
            }
          ]
        },
        {
          "id": "sanitas_accident_top",
          "code_produit": null,
          "nom": "Accident Top Liberty",
          "type": "accident",
          "niveau": "top",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "En cas d'accident."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Traitements d'urgence a l'etranger."
            }
          ]
        },
        {
          "id": "sanitas_easy",
          "code_produit": null,
          "nom": "Easy",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Necessite l'assurance de base Sanitas ou l'un des produits Dental, Dental Basic, Planning a Family, Salary ou Capital. Non combinable avec Vital, Classic ou les assurances d'hospitalisation (double assurance).",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 20000,
              "conditions": "Participation aux frais de traitement d'urgence a l'etranger, jusqu'a CHF 20'000 par annee civile. Taux non precise."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "sanitas_medical_private",
          "code_produit": null,
          "nom": "Medical Private",
          "type": "choix_medecin",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "libre_choix_medecin_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Libre choix du medecin en ambulatoire dans le monde entier, y compris chez des medecins facturant a leurs propres tarifs en Suisse."
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Traitements ambulatoires planifies et therapies prescrites a l'etranger."
            }
          ]
        },
        {
          "id": "sanitas_planning_family",
          "code_produit": null,
          "nom": "Planning a Family",
          "type": "desir_enfant",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Acces aux cliniques de fertilite dans toute la Suisse.",
          "couvertures": [
            {
              "prestation_id": "procreation_assistee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Cycles supplementaires de procreation medicalement assistee."
            },
            {
              "prestation_id": "tests_prenataux_genetiques",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "sanitas_capital",
          "code_produit": null,
          "nom": "Capital",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Montants selon contrat, non precises dans la source. Usage libre des prestations.",
          "couvertures": [
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "capital_invalidite_maladie",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "capital_deces_maladie",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        },
        {
          "id": "sanitas_salary",
          "code_produit": null,
          "nom": "Salary",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "couvertures": [
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_jour": 500,
              "conditions": "Jusqu'a CHF 500 par jour pendant 720 jours sur une periode de 900 jours. Maladie, accident et complications liees a la grossesse. Montant et delai d'attente selon contrat."
            }
          ]
        }
      ]
    },
    {
      "schema_version": "1.0",
      "id": "swica",
      "nom": "SWICA",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "SWICA, « Recapitulatif des prestations 2027 » et pages produits officielles swica.ch",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : la source ne traite que des complementaires. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "La medecine complementaire de base LAMal couvre deja la medecine anthroposophique, l'acupuncture, la pharmacotherapie MTC, l'homeopathie et la phytotherapie.",
        "Le programme de bonus Benevita accorde des remises de prime pour un mode de vie actif.",
        "Franchise a option sur toute la gamme Hospita : CHF 1'000 (rabais de prime 15%), CHF 2'000 (35%) ou CHF 5'000 (50%), par annee civile."
      ],
      "produits_lca": [
        {
          "id": "swica_completa_top",
          "code_produit": null,
          "nom": "Completa Top",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            600
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante et prevention",
              "plafond_annuel": 500
            }
          ],
          "remarque": "Franchise au choix CHF 0 ou 600 pour les adultes. Quote-part de 10%, au maximum CHF 700 par an (CHF 350 pour les enfants).",
          "couvertures": [
            {
              "prestation_id": "libre_choix_medecin_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Medecine classique par des medecins non conventionnes, monde entier."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 80,
              "conditions": "Therapeutes reconnus SWICA, jusqu'a CHF 80 de l'heure. Taux non precise dans la source."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": 500,
              "conditions": "Sur 3 ans."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "indemnite_allaitement",
              "taux_remboursement": 1,
              "plafond_annuel": 200,
              "conditions": "CHF 200 par enfant."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "nb_jours_max_annuel": 30,
              "conditions": "Cures thermales et de convalescence, contribution journaliere."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 50,
              "nb_seances_max_annuel": 60
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 0.9,
              "plafond_annuel": 200,
              "conditions": "Sur 3 ans."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9,
              "plafond_annuel": 20000,
              "conditions": "En Suisse."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 0.9,
              "plafond_annuel": 50000,
              "conditions": "Transport a l'etranger."
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "plafond_annuel": 100
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "plafond_annuel": 10000,
              "conditions": "Jusqu'a 26 ans."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 80,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 80,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 80,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 80,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 80,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "SWICA, « Recapitulatif des prestations 2027 » et pages produits officielles swica.ch"
            }
          ]
        },
        {
          "id": "swica_completa_forte",
          "code_produit": null,
          "nom": "Completa Forte",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            600
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ps",
              "libelle": "Promotion de la sante et prevention",
              "plafond_annuel": 500
            }
          ],
          "remarque": "Version etendue de Completa Top. Combinable avec Optima pour une couverture integrale. Franchise au choix CHF 0 ou 600 pour les adultes. Quote-part de 10%, au maximum CHF 700 par an (CHF 350 pour les enfants).",
          "couvertures": [
            {
              "prestation_id": "libre_choix_medecin_ambulatoire",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Medecine classique par des medecins non conventionnes, monde entier."
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 120,
              "conditions": "Therapeutes reconnus SWICA, jusqu'a CHF 120 de l'heure. Taux non precise dans la source."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": null,
              "conditions": "Montant illimite sur 3 ans."
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "enveloppe_id": "env_ps"
            },
            {
              "prestation_id": "indemnite_allaitement",
              "taux_remboursement": 1,
              "plafond_annuel": 200,
              "conditions": "CHF 200 par enfant."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "nb_jours_max_annuel": 30,
              "conditions": "Cures thermales et de convalescence, contribution journaliere."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.9,
              "plafond_par_seance": 75,
              "nb_seances_max_annuel": 60
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 0.9,
              "plafond_annuel": 900,
              "conditions": "Sur 3 ans."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 500
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9,
              "plafond_annuel": 100000,
              "conditions": "En Suisse."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 0.9,
              "plafond_annuel": 150000,
              "conditions": "Transport a l'etranger."
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "plafond_annuel": 100
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "plafond_annuel": 10000,
              "conditions": "Jusqu'a 26 ans."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 120,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 120,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 120,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 120,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_seance": 120,
              "conditions": "Therapeutes reconnus SWICA."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "conditions": "Gymnastique prenatale et postnatale."
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "SWICA, « Recapitulatif des prestations 2027 » et pages produits officielles swica.ch"
            }
          ]
        },
        {
          "id": "swica_praevita",
          "code_produit": null,
          "nom": "Praevita",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "S'ajoute a Completa Top ou Completa Forte.",
          "couvertures": [
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300
            },
            {
              "prestation_id": "depistage_lca",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "conditions": "Selon liste SWICA."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9,
              "conditions": "Montant illimite."
            }
          ]
        },
        {
          "id": "swica_supplementa",
          "code_produit": null,
          "nom": "Supplementa",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Complete Completa Top ou Forte pour l'optique.",
          "couvertures": [
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "conditions": "CHF 300 sur 3 ans, en plus de Completa."
            }
          ]
        },
        {
          "id": "swica_optima",
          "code_produit": null,
          "nom": "Optima",
          "type": "ambulatoire",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Couverture integrale. Necessite d'etre combine avec Completa Top ou Completa Forte.",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "soins_etranger_planifies",
              "taux_remboursement": 1,
              "conditions": "Traitements ambulatoires a l'etranger, hors dentaire."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "conditions": "Gymnastique prenatale et postnatale."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "swica_denta_1",
          "code_produit": null,
          "nom": "Denta 1",
          "type": "dentaire",
          "niveau": "denta1",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 500
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "plafond_annuel": 1000,
              "conditions": "Corrections dentaires jusqu'a 26 ans, plafond propre."
            }
          ]
        },
        {
          "id": "swica_denta_2",
          "code_produit": null,
          "nom": "Denta 2",
          "type": "dentaire",
          "niveau": "denta2",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 1000
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.5,
              "plafond_annuel": 2000,
              "conditions": "Corrections dentaires jusqu'a 26 ans, plafond propre."
            }
          ]
        },
        {
          "id": "swica_denta_3",
          "code_produit": null,
          "nom": "Denta 3",
          "type": "dentaire",
          "niveau": "denta3",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 1500
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 3000,
              "conditions": "Corrections dentaires jusqu'a 26 ans, plafond propre."
            }
          ]
        },
        {
          "id": "swica_denta_4",
          "code_produit": null,
          "nom": "Denta 4",
          "type": "dentaire",
          "niveau": "denta4",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 2000
            }
          ],
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.75,
              "plafond_annuel": 4000,
              "conditions": "Corrections dentaires jusqu'a 26 ans, plafond propre."
            }
          ]
        },
        {
          "id": "swica_infortuna",
          "code_produit": null,
          "nom": "Infortuna Frais de Guerison",
          "type": "accident",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Assurance-accidents privee complementaire a la LAA, monde entier, couverture integrale.",
          "couvertures": [
            {
              "prestation_id": "consultation_medecin",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "dentaire_accident",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "swica_hospita_privee_monde",
          "code_produit": null,
          "nom": "Hospita Privee Monde Entier (BestMed)",
          "type": "hospitalisation",
          "niveau": "privee_monde",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            1000,
            2000,
            5000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Tarif a l'age de conclusion, prime figee des 50 ans. Franchise a option sur toute la gamme Hospita : CHF 1'000 (rabais de prime 15%), CHF 2'000 (35%) ou CHF 5'000 (50%), par annee civile.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Division privee monde entier, hopitaux publics et prives, couverture integrale."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 150,
              "conditions": "Contribution de pension a l'etranger."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 30000,
              "conditions": "Traitement a l'etranger."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9,
              "conditions": "Transport et transfert, illimite."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 0.9,
              "plafond_annuel": 30000,
              "conditions": "Par evenement."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 140,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "conditions": "Jusqu'a 720 jours sur 900."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 50,
              "nb_jours_max_annuel": 60
            },
            {
              "prestation_id": "acces_prioritaire_soins",
              "taux_remboursement": 1,
              "conditions": "Garantie BestMed, acces 24h/24."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale a l'etranger."
            }
          ]
        },
        {
          "id": "swica_hospita_privee",
          "code_produit": null,
          "nom": "Hospita Privee (tous hopitaux ou liste)",
          "type": "hospitalisation",
          "niveau": "privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            1000,
            2000,
            5000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Franchise a option sur toute la gamme Hospita : CHF 1'000 (rabais de prime 15%), CHF 2'000 (35%) ou CHF 5'000 (50%), par annee civile.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale en division privee, Suisse et Liechtenstein."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 150,
              "conditions": "Contribution de pension a l'etranger."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 30000,
              "conditions": "Traitement a l'etranger."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9,
              "conditions": "Transport et transfert, illimite."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 0.9,
              "plafond_annuel": 30000,
              "conditions": "Par evenement."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 80,
              "conditions": "Jusqu'a 720 jours sur 900."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 40,
              "nb_jours_max_annuel": 60
            }
          ]
        },
        {
          "id": "swica_hospita_demi_privee",
          "code_produit": null,
          "nom": "Hospita Demi-Privee (tous hopitaux ou liste)",
          "type": "hospitalisation",
          "niveau": "demi_privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            1000,
            2000,
            5000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Franchise a option sur toute la gamme Hospita : CHF 1'000 (rabais de prime 15%), CHF 2'000 (35%) ou CHF 5'000 (50%), par annee civile.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale en division demi-privee, Suisse et Liechtenstein."
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "conditions": "Contribution de pension a l'etranger."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 10000,
              "conditions": "Traitement a l'etranger."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9,
              "conditions": "Transport et transfert, illimite."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 0.9,
              "plafond_annuel": 30000,
              "conditions": "Par evenement."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 80,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 60,
              "conditions": "Jusqu'a 720 jours sur 900."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "nb_jours_max_annuel": 60
            }
          ]
        },
        {
          "id": "swica_hospita_commune",
          "code_produit": null,
          "nom": "Hospita Commune",
          "type": "hospitalisation",
          "niveau": "commune",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            1000,
            2000,
            5000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Franchise a option sur toute la gamme Hospita : CHF 1'000 (rabais de prime 15%), CHF 2'000 (35%) ou CHF 5'000 (50%), par annee civile.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Couverture integrale en division commune, hopitaux publics de Suisse et du Liechtenstein."
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 50,
              "conditions": "Contribution de pension a l'etranger."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 5000,
              "conditions": "Traitement a l'etranger."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9,
              "conditions": "En Suisse.",
              "plafond_annuel": 20000
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 0.9,
              "plafond_annuel": 20000,
              "conditions": "Par evenement."
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "nb_jours_max_annuel": 30
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 30,
              "conditions": "Jusqu'a 720 jours sur 900."
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 1,
              "plafond_par_jour": 15,
              "nb_jours_max_annuel": 60
            }
          ]
        },
        {
          "id": "swica_hospita_flex_privee",
          "code_produit": null,
          "nom": "Hospita Flex Privee",
          "type": "hospitalisation",
          "niveau": "flex_privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            1000,
            2000,
            5000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "participation_par_jour": {
            "demi_privee": 300,
            "privee": 400,
            "remarque": "Plafonnee a CHF 6'000 (demi-privee) et CHF 8'000 (privee) par an."
          },
          "remarque": "Libre choix de la division avant chaque hospitalisation. Franchise a option sur toute la gamme Hospita : CHF 1'000 (rabais de prime 15%), CHF 2'000 (35%) ou CHF 5'000 (50%), par annee civile.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Division commune, sans participation."
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Participation de CHF 300 par jour, au maximum CHF 6'000 par an."
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Participation de CHF 400 par jour, au maximum CHF 8'000 par an."
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 150
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 30000
            }
          ]
        },
        {
          "id": "swica_hospita_flex_demi_privee",
          "code_produit": null,
          "nom": "Hospita Flex Demi-Privee",
          "type": "hospitalisation",
          "niveau": "flex_demi_privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0,
            1000,
            2000,
            5000
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "participation_par_jour": {
            "demi_privee": 300,
            "remarque": "Plafonnee a CHF 6'000 par an."
          },
          "remarque": "Libre choix commune ou demi-privee avant chaque hospitalisation. Franchise a option sur toute la gamme Hospita : CHF 1'000 (rabais de prime 15%), CHF 2'000 (35%) ou CHF 5'000 (50%), par annee civile.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Division commune, sans participation."
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Participation de CHF 300 par jour, au maximum CHF 6'000 par an."
            },
            {
              "prestation_id": "indemnite_hospitalisation_etranger",
              "taux_remboursement": 1,
              "plafond_par_jour": 100
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": 10000
            }
          ]
        },
        {
          "id": "swica_hospita_plus",
          "code_produit": null,
          "nom": "Hospita Plus",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "A conclure avant 18 ans revolus, option a exercer avant 40 ans revolus.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Garantie de surclassement vers la division demi-privee ou privee, independamment de l'etat de sante. Option, pas une prise en charge directe."
            }
          ]
        }
      ]
    },
    {
      "schema_version": "1.0",
      "id": "visana",
      "nom": "Visana",
      "actif": true,
      "source": {
        "origine": "recapitulatif produits fourni par le conseiller",
        "reference": "Visana, pages produits officielles visana.ch et conditions complementaires publiees",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "a_verifier",
        "remarque": "Saisi depuis un recapitulatif de brochure. Les couvertures au statut 'a_completer' sont connues comme couvertes mais sans taux exploitable dans la source. Verifier les CGA/CC avant tout engagement contractuel."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": null,
        "remarque": "Non renseigne : la source ne traite que des complementaires. Les parametres legaux de data/meta.json s'appliquent."
      },
      "notes_generales": [
        "Rabais famille : 50% sur les primes complementaires des le 2e enfant assure chez Visana (jusqu'a 18 ans), sur Traitements ambulatoires, Medecine complementaire, Hopital, Basic et Soins dentaires.",
        "Contrats pluriannuels : 3 ans (-2%) ou 5 ans (-3%).",
        "Souscription possible jusqu'a 70 ans.",
        "Une gamme VIVA existe (complementaires en soins integres), combinable uniquement avec l'assurance de base VIVA, avec un rabais de 5% sur les primes. Non saisie ici."
      ],
      "produits_lca": [
        {
          "id": "visana_ambulatoire_1",
          "code_produit": null,
          "nom": "Traitements ambulatoires I",
          "type": "ambulatoire",
          "niveau": "i",
          "age_adhesion_min": null,
          "age_adhesion_max": 70,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Niveau d'entree. Taux et plafonds non chiffres dans la source. Rabais familial de 50% des le 2e enfant.",
          "couvertures": [
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Participation aux frais."
            },
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Corrections dentaires."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Medicaments non couverts par la LAMal."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Examens preventifs."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "visana_ambulatoire_2",
          "code_produit": null,
          "nom": "Traitements ambulatoires II",
          "type": "ambulatoire",
          "niveau": "ii",
          "age_adhesion_min": null,
          "age_adhesion_max": 70,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Niveau intermediaire, inclus dans le paquet Basic. Contrats pluriannuels : 3 ans (-2%) ou 5 ans (-3%).",
          "couvertures": [
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.8,
              "plafond_annuel": 10000,
              "conditions": "Correction de la position des dents, 80% du montant de la facture."
            },
            {
              "prestation_id": "moyens_auxiliaires_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Prescrits par un medecin."
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Aide et soins a domicile."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Controles et gymnastique."
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Abonnements fitness et cheques wellness."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "visana_ambulatoire_3",
          "code_produit": null,
          "nom": "Traitements ambulatoires III",
          "type": "ambulatoire",
          "niveau": "iii",
          "age_adhesion_min": null,
          "age_adhesion_max": 70,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "delais_attente_specifiques": [
            {
              "motif": "cours prenataux",
              "jours": 270
            }
          ],
          "remarque": "Niveau le plus complet de la gamme ambulatoire.",
          "couvertures": [
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 0.9,
              "plafond_annuel": 250,
              "conditions": "Correction superieure a 10 dioptries : 90% jusqu'a CHF 750 par an."
            },
            {
              "prestation_id": "vaccins_prevention_lca",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": 600,
              "conditions": "Sur 3 ans."
            },
            {
              "prestation_id": "gynecologie_preventive",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 1,
              "plafond_annuel": 200,
              "conditions": "Bon de CHF 200 par an."
            },
            {
              "prestation_id": "activite_physique_cours",
              "taux_remboursement": 1,
              "plafond_annuel": 150,
              "conditions": "Cheques de CHF 150 pour des cours."
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.8,
              "plafond_annuel": 5000
            },
            {
              "prestation_id": "soins_domicile_lca",
              "taux_remboursement": 1,
              "plafond_par_jour": 100,
              "nb_jours_max_annuel": 30,
              "conditions": "CHF 100 par jour pendant 30 jours, puis CHF 50 par jour pendant 30 jours supplementaires."
            },
            {
              "prestation_id": "chirurgie_ambulatoire",
              "taux_remboursement": 0.5,
              "plafond_annuel": 1000,
              "conditions": "Interventions chirurgicales."
            },
            {
              "prestation_id": "maternite_complements",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300,
              "conditions": "Echographies et controles 90%. Cours prenataux 90% jusqu'a CHF 300 par grossesse, carence de 270 jours."
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9
            },
            {
              "prestation_id": "sauvetage",
              "taux_remboursement": 0.9,
              "plafond_annuel": 25000,
              "conditions": "Recherche et sauvetage."
            },
            {
              "prestation_id": "voyage_frais_annexes",
              "taux_remboursement": 0.5,
              "plafond_annuel": 2000,
              "conditions": "Frais de voyage."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "psychotherapie_medicale",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "La source decrit une prestation de psychotherapie sans preciser si elle complete aussi une psychotherapie PRESCRITE, prise en charge par la base depuis le 1er juillet 2022. A verifier dans les conditions du produit : l'absence d'information n'est pas une absence de couverture.",
              "source_page": "Visana, pages produits officielles visana.ch et conditions complementaires publiees"
            }
          ]
        },
        {
          "id": "visana_med_compl_1",
          "code_produit": null,
          "nom": "Medecine complementaire I",
          "type": "medecine_alternative",
          "niveau": "n1",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [],
          "remarque": "Prise en charge jusqu'a CHF 10'000 par an selon le niveau ; la source ne donne le plafond que pour le niveau le plus eleve. Visana applique ses propres criteres de reconnaissance des therapeutes, distincts du RME et de l'ASCA.",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Medicaments de medecine complementaire."
            }
          ]
        },
        {
          "id": "visana_med_compl_2",
          "code_produit": null,
          "nom": "Medecine complementaire II",
          "type": "medecine_alternative",
          "niveau": "n2",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [],
          "remarque": "Prise en charge jusqu'a CHF 10'000 par an selon le niveau ; la source ne donne le plafond que pour le niveau le plus eleve. Visana applique ses propres criteres de reconnaissance des therapeutes, distincts du RME et de l'ASCA.",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": null,
              "enveloppe_id": null,
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Medicaments de medecine complementaire."
            }
          ]
        },
        {
          "id": "visana_med_compl_3",
          "code_produit": null,
          "nom": "Medecine complementaire III",
          "type": "medecine_alternative",
          "niveau": "n3",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_ma",
              "libelle": "Medecine complementaire",
              "plafond_annuel": 10000
            }
          ],
          "remarque": "Prise en charge jusqu'a CHF 10'000 par an selon le niveau ; la source ne donne le plafond que pour le niveau le plus eleve. Visana applique ses propres criteres de reconnaissance des therapeutes, distincts du RME et de l'ASCA.",
          "couvertures": [
            {
              "prestation_id": "autres_med_alternatives",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 10000,
              "enveloppe_id": "env_ma",
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 10000,
              "enveloppe_id": "env_ma",
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 10000,
              "enveloppe_id": "env_ma",
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "homeopathie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 10000,
              "enveloppe_id": "env_ma",
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 10000,
              "enveloppe_id": "env_ma",
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "medecine_chinoise",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 10000,
              "enveloppe_id": "env_ma",
              "conditions": "Traitements possibles sans prescription medicale. Environ 50 methodes reconnues. Le taux n'est pas indique dans la source."
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Medicaments de medecine complementaire."
            }
          ]
        },
        {
          "id": "visana_hopital_commune",
          "code_produit": null,
          "nom": "Hopital division commune",
          "type": "hospitalisation",
          "niveau": "commune",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "conditions": "Libre acces aux hopitaux de soins aigus en Suisse, y compris hors du canton de residence. Couverture des couts non pris en charge par la LAMal."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "visana_hopital_mi_privee",
          "code_produit": null,
          "nom": "Hopital division mi-privee",
          "type": "hospitalisation",
          "niveau": "mi_privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "conditions": "Chambre a deux lits, libre choix du medecin, traitement par le medecin-chef, acces libre a tous les hopitaux suisses de soins aigus."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "visana_hopital_privee",
          "code_produit": null,
          "nom": "Hopital division privee",
          "type": "hospitalisation",
          "niveau": "privee",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "couvertures": [
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": 1,
              "conditions": "Chambre individuelle, libre choix du medecin, traitement par le medecin-chef."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "visana_hopital_flexible",
          "code_produit": null,
          "nom": "Hopital choix flexible",
          "type": "hospitalisation",
          "niveau": "flexible",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Flexibilite par sejour.",
          "couvertures": [
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division choisie avant chaque hospitalisation."
            },
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division choisie avant chaque hospitalisation."
            },
            {
              "prestation_id": "hospitalisation_privee",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Division choisie avant chaque hospitalisation."
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "visana_basic",
          "code_produit": null,
          "nom": "Paquet combine Basic",
          "type": "global",
          "niveau": null,
          "age_adhesion_min": 19,
          "age_adhesion_max": 65,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Ce produit est un regroupement : ses prestations sont celles des 4 assurances qui le composent. Rabais familial applicable.",
          "couvertures": [
            {
              "prestation_id": "consultation_medecin",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Paquet regroupant 4 produits : Traitements ambulatoires II, Medecine complementaire II, une assurance complementaire d'hospitalisation au choix et Vacanza. Se referer a chacun de ces produits pour le detail des prestations."
            }
          ]
        },
        {
          "id": "visana_dentaire_3",
          "code_produit": null,
          "nom": "Soins dentaires niveau 3",
          "type": "dentaire",
          "niveau": "n3",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 600
            }
          ],
          "remarque": "La source ne cite que quelques niveaux a titre d'exemple (niveau 3, niveau 7, classe 4 a 75% max CHF 600). La grille complete des niveaux reste a saisir. Cumulable avec Traitements ambulatoires pour couvrir le solde. Pas d'examen de sante si l'enfant est assure avant son 4e anniversaire.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Examens de controle et hygiene dentaire."
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.5,
              "enveloppe_id": "env_d",
              "conditions": "Appareils dentaires et remplacement de dents."
            }
          ]
        },
        {
          "id": "visana_dentaire_7",
          "code_produit": null,
          "nom": "Soins dentaires niveau 7",
          "type": "dentaire",
          "niveau": "n7",
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "enveloppes": [
            {
              "id": "env_d",
              "libelle": "Plafond annuel dentaire",
              "plafond_annuel": 1500
            }
          ],
          "remarque": "La source ne cite que quelques niveaux a titre d'exemple (niveau 3, niveau 7, classe 4 a 75% max CHF 600). La grille complete des niveaux reste a saisir. Cumulable avec Traitements ambulatoires pour couvrir le solde. Pas d'examen de sante si l'enfant est assure avant son 4e anniversaire.",
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d"
            },
            {
              "prestation_id": "dentaire_prophylaxie",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Examens de controle et hygiene dentaire."
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.75,
              "enveloppe_id": "env_d",
              "conditions": "Appareils dentaires et remplacement de dents."
            }
          ]
        },
        {
          "id": "visana_vacanza",
          "code_produit": null,
          "nom": "Vacanza",
          "type": "voyage",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": false,
          "remarque": "Incluse dans les assurances Traitements ambulatoires, Hopital et le paquet Basic. Version longue duree disponible pour les sejours prolonges.",
          "couvertures": [
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "conditions": "Vacanza incluse : couverture integrale des urgences ambulatoires et stationnaires a l'etranger, 8 semaines par voyage."
            },
            {
              "prestation_id": "recherche_sauvetage_etranger",
              "taux_remboursement": 1,
              "plafond_annuel": 25000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 1
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1
            }
          ]
        },
        {
          "id": "visana_ij_hospitalisation",
          "code_produit": null,
          "nom": "Indemnites journalieres d'hospitalisation",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Risque accident excluable.",
          "couvertures": [
            {
              "prestation_id": "indemnite_hospitalisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_par_jour": 500,
              "conditions": "Montant fixe par jour d'hospitalisation (sejour d'au moins 24 heures), echelonne par tranches de CHF 50, de CHF 50 a CHF 500 par jour. Debut des prestations au choix des le 2e ou le 4e jour, duree au choix de 30, 60 ou 90 jours par an."
            }
          ]
        },
        {
          "id": "visana_ij_lca",
          "code_produit": null,
          "nom": "Indemnites journalieres LCA (perte de gain)",
          "type": "indemnites",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "couvertures": [
            {
              "prestation_id": "indemnite_journaliere",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Garantie du revenu en cas d'incapacite de travail pour maladie ou accident, pendant 730 jours au maximum, apres le delai d'attente fixe au contrat."
            }
          ]
        },
        {
          "id": "visana_ij_soins",
          "code_produit": null,
          "nom": "Indemnites journalieres de soins",
          "type": "longue_duree",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "couvertures": [
            {
              "prestation_id": "indemnite_soins",
              "taux_remboursement": null,
              "statut": "a_completer",
              "conditions": "Prise en charge des couts non couverts en cas de sejour en etablissement medico-social."
            }
          ]
        },
        {
          "id": "visana_capital_hopital",
          "code_produit": null,
          "nom": "Capital Hopital",
          "type": "hospitalisation",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Alternative aux indemnites journalieres. Duree contractuelle de 30 a 90 jours.",
          "couvertures": [
            {
              "prestation_id": "capital_hospitalisation",
              "taux_remboursement": null,
              "statut": "a_completer",
              "plafond_annuel": 15000,
              "conditions": "Somme forfaitaire fixee a l'avance en cas d'hospitalisation, utilisable librement, jusqu'a CHF 15'000."
            }
          ]
        },
        {
          "id": "visana_capital_accident",
          "code_produit": null,
          "nom": "Assurance-accidents sous forme de capital",
          "type": "capital",
          "niveau": null,
          "age_adhesion_min": null,
          "age_adhesion_max": null,
          "franchises_produit": [
            0
          ],
          "delai_attente_mois": 0,
          "hors_perimetre_facture": true,
          "remarque": "Montants selon contrat, non precises dans la source.",
          "couvertures": [
            {
              "prestation_id": "capital_invalidite_accident",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "capital_deces_accident",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "capital_invalidite_maladie",
              "taux_remboursement": null,
              "statut": "a_completer"
            },
            {
              "prestation_id": "capital_deces_maladie",
              "taux_remboursement": null,
              "statut": "a_completer"
            }
          ]
        }
      ]
    }
  ],
  "logos": {
    "assura": "assets/logos/assura.png",
    "axa": "assets/logos/axa.png",
    "concordia": "assets/logos/concordia.png",
    "css": "assets/logos/css.png",
    "groupe_mutuel": "assets/logos/groupe_mutuel.png",
    "helsana": "assets/logos/helsana.png",
    "sanitas": "assets/logos/sanitas.png",
    "swica": "assets/logos/swica.png",
    "visana": "assets/logos/visana.png"
  },
  "genere_le": "2026-09-07T12:40:31.917Z"
};
