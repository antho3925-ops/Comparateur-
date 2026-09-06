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
      "quote_part_taux_medicament_sans_generique": 0.2,
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
      ]
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
        "libelle": "Psychotherapie medicale ou psychologique prescrite",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
      },
      {
        "id": "psychotherapie_non_medicale",
        "libelle": "Psychotherapie non prescrite / therapeute non reconnu LAMal",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true,
        "nature": "remboursement"
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
        "remarque": "La LAMal prend en charge le tarif de la division commune ; la LCA couvre le surcout. Saisir si possible les deux montants separement (montant_part_lamal).",
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
      }
    ]
  },
  "assureurs": [
    {
      "schema_version": "1.0",
      "id": "demo",
      "nom": "Caisse Demo (fictive)",
      "actif": true,
      "source": {
        "origine": "exemple pedagogique",
        "reference": "AUCUNE - donnees inventees",
        "date_extraction": "2026-09-06",
        "annee_tarifaire": 2026,
        "fiabilite": "fictif",
        "remarque": "ATTENTION : caisse imaginaire servant uniquement a illustrer le format et a tester le moteur de calcul. Ne represente aucun assureur reel. A supprimer une fois les vraies caisses saisies."
      },
      "lamal": {
        "franchises_adulte": null,
        "franchises_enfant": null,
        "quote_part_taux": null,
        "quote_part_plafond_annuel_adulte": null,
        "quote_part_plafond_annuel_enfant": null,
        "contribution_hospitaliere_par_jour_adulte": null,
        "modeles_proposes": [
          "standard",
          "medecin_famille",
          "telmed"
        ]
      },
      "produits_lca": [
        {
          "id": "demo_ambu_plus",
          "nom": "Ambulatoire Plus",
          "type": "ambulatoire",
          "niveau": "plus",
          "prime_mensuelle_indicative": 42,
          "franchise_produit": 0,
          "delai_attente_mois": 0,
          "enveloppes": [
            {
              "id": "env_med_alt",
              "libelle": "Medecines alternatives",
              "plafond_annuel": 1500
            }
          ],
          "couvertures": [
            {
              "prestation_id": "osteopathie",
              "taux_remboursement": 0.75,
              "plafond_par_seance": 60,
              "plafond_annuel": null,
              "enveloppe_id": "env_med_alt",
              "conditions": "Therapeute ASCA/RME"
            },
            {
              "prestation_id": "acupuncture",
              "taux_remboursement": 0.75,
              "plafond_par_seance": 60,
              "plafond_annuel": null,
              "enveloppe_id": "env_med_alt"
            },
            {
              "prestation_id": "naturopathie_phytotherapie",
              "taux_remboursement": 0.75,
              "plafond_par_seance": 60,
              "plafond_annuel": null,
              "enveloppe_id": "env_med_alt"
            },
            {
              "prestation_id": "massage_therapeutique",
              "taux_remboursement": 0.5,
              "plafond_par_seance": 40,
              "plafond_annuel": null,
              "enveloppe_id": "env_med_alt"
            },
            {
              "prestation_id": "psychotherapie_non_medicale",
              "taux_remboursement": 0.75,
              "plafond_par_seance": 100,
              "plafond_annuel": 3000
            },
            {
              "prestation_id": "lunettes_lentilles_adulte",
              "taux_remboursement": 1,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "checkup_preventif",
              "taux_remboursement": 0.9,
              "plafond_annuel": 500
            },
            {
              "prestation_id": "vaccins_voyage",
              "taux_remboursement": 0.9,
              "plafond_annuel": 300
            },
            {
              "prestation_id": "fitness_prevention",
              "taux_remboursement": 0.5,
              "plafond_annuel": 200
            },
            {
              "prestation_id": "medicaments_hors_liste",
              "taux_remboursement": 0.9,
              "plafond_annuel": 3000
            },
            {
              "prestation_id": "transport_urgence",
              "taux_remboursement": 0.9,
              "plafond_annuel": 5000
            },
            {
              "prestation_id": "rapatriement",
              "taux_remboursement": 1,
              "plafond_annuel": null
            },
            {
              "prestation_id": "soins_etranger_urgence",
              "taux_remboursement": 1,
              "plafond_annuel": null
            }
          ]
        },
        {
          "id": "demo_dentaire_70",
          "nom": "Dentaire 70",
          "type": "dentaire",
          "niveau": "plus",
          "prime_mensuelle_indicative": 38,
          "franchise_produit": 0,
          "delai_attente_mois": 6,
          "couvertures": [
            {
              "prestation_id": "dentaire_soins",
              "taux_remboursement": 0.7,
              "plafond_annuel": 3000
            },
            {
              "prestation_id": "dentaire_prothese_implant",
              "taux_remboursement": 0.7,
              "plafond_annuel": 3000
            },
            {
              "prestation_id": "dentaire_orthodontie",
              "taux_remboursement": 0.7,
              "plafond_annuel": 10000,
              "conditions": "Plafond cumule sur toute la duree du traitement"
            }
          ]
        },
        {
          "id": "demo_hospi_semi",
          "nom": "Hospitalisation mi-privee",
          "type": "hospitalisation",
          "niveau": "semi_prive",
          "prime_mensuelle_indicative": 95,
          "franchise_produit": 0,
          "delai_attente_mois": 3,
          "couvertures": [
            {
              "prestation_id": "hospitalisation_demi_privee",
              "taux_remboursement": 1,
              "plafond_annuel": null,
              "conditions": "Surcout au-dela du tarif LAMal division commune"
            },
            {
              "prestation_id": "hospitalisation_hors_canton",
              "taux_remboursement": 1,
              "plafond_annuel": null
            },
            {
              "prestation_id": "libre_choix_medecin_hopital",
              "taux_remboursement": 1,
              "plafond_annuel": null
            },
            {
              "prestation_id": "confort_hospitalier",
              "taux_remboursement": 1,
              "plafond_par_jour": 50
            },
            {
              "prestation_id": "readaptation_cure",
              "taux_remboursement": 0.9,
              "plafond_par_jour": 100,
              "nb_seances_max_annuel": null
            },
            {
              "prestation_id": "aide_menage",
              "taux_remboursement": 0.8,
              "plafond_annuel": 1000,
              "conditions": "Apres hospitalisation uniquement"
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
    }
  ],
  "genere_le": "2026-09-06T19:32:29.421Z"
};
