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
    "commentaire": "Nomenclature commune. Chaque ligne de facture saisie dans l'outil pointe vers un 'id' de cette liste, et chaque assureur decrit ses remboursements en reference aux memes 'id'. C'est ce qui rend la comparaison possible entre caisses. Ne jamais renommer un 'id' existant : ajouter un nouvel id et marquer l'ancien 'actif': false.",
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
      }
    ],
    "prestations": [
      {
        "id": "consultation_medecin",
        "libelle": "Consultation medecin generaliste",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "consultation_specialiste",
        "libelle": "Consultation medecin specialiste",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "urgence_ambulatoire",
        "libelle": "Urgences ambulatoires (permanence, hopital sans nuitee)",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "analyses_laboratoire",
        "libelle": "Analyses de laboratoire",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "imagerie_medicale",
        "libelle": "Imagerie (radio, IRM, CT, echographie)",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "physiotherapie_prescrite",
        "libelle": "Physiotherapie prescrite",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "remarque": "Prise en charge LAMal sur ordonnance, par series. Au-dela des series prescrites, bascule possible sur la LCA.",
        "actif": true
      },
      {
        "id": "psychotherapie_medicale",
        "libelle": "Psychotherapie medicale ou psychologique prescrite",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "psychotherapie_non_medicale",
        "libelle": "Psychotherapie non prescrite / therapeute non reconnu LAMal",
        "groupe": "ambulatoire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "logopedie_ergotherapie",
        "libelle": "Logopedie / ergotherapie prescrite",
        "groupe": "ambulatoire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "medicaments_liste",
        "libelle": "Medicaments de la liste des specialites (LS)",
        "groupe": "medicaments",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "quote_part_taux_override": null,
        "remarque": "Quote-part 20% possible si un generique existe et que l'original est delivre. Mettre quote_part_taux_override a 0.20 sur la ligne de facture si le cas se presente.",
        "actif": true
      },
      {
        "id": "medicaments_hors_liste",
        "libelle": "Medicaments hors liste / non rembourses par la LAMal",
        "groupe": "medicaments",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "vaccins_lamal",
        "libelle": "Vaccinations recommandees (plan suisse)",
        "groupe": "prevention",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "vaccins_voyage",
        "libelle": "Vaccins de voyage",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "checkup_preventif",
        "libelle": "Check-up / bilan de sante preventif",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "depistage_lamal",
        "libelle": "Depistage pris en charge par la LAMal (mammographie, colon, etc.)",
        "groupe": "prevention",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "fitness_prevention",
        "libelle": "Abonnement fitness / cours de prevention",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "sevrage_tabagique",
        "libelle": "Sevrage tabagique / programmes sante",
        "groupe": "prevention",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "hospitalisation_commune",
        "libelle": "Hospitalisation division commune (canton de domicile)",
        "groupe": "hospitalier",
        "categorie": "LAMal",
        "unite_saisie": "montant_et_jours",
        "remarque": "Soumise a la franchise, a la quote-part et a la contribution journaliere aux frais de sejour.",
        "actif": true
      },
      {
        "id": "hospitalisation_demi_privee",
        "libelle": "Hospitalisation division mi-privee",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "part_lamal_defaut": null,
        "remarque": "La LAMal prend en charge le tarif de la division commune ; la LCA couvre le surcout. Saisir si possible les deux montants separement (montant_part_lamal).",
        "actif": true
      },
      {
        "id": "hospitalisation_privee",
        "libelle": "Hospitalisation division privee",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "part_lamal_defaut": null,
        "actif": true
      },
      {
        "id": "hospitalisation_hors_canton",
        "libelle": "Hospitalisation hors canton / libre choix de l'hopital",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "part_lamal_defaut": null,
        "actif": true
      },
      {
        "id": "libre_choix_medecin_hopital",
        "libelle": "Honoraires du medecin choisi (chef de service, operateur)",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "confort_hospitalier",
        "libelle": "Confort hospitalier (chambre, TV, accompagnant)",
        "groupe": "hospitalier",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "readaptation_cure",
        "libelle": "Readaptation / sejour de convalescence / cure balneaire",
        "groupe": "hospitalier",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_jours",
        "part_lamal_defaut": null,
        "actif": true
      },
      {
        "id": "dentaire_soins",
        "libelle": "Soins dentaires courants (caries, detartrage, controle)",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "remarque": "Hors LAMal sauf accident ou maladie grave non evitable.",
        "actif": true
      },
      {
        "id": "dentaire_orthodontie",
        "libelle": "Orthodontie",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "dentaire_prothese_implant",
        "libelle": "Protheses, couronnes, implants",
        "groupe": "dentaire",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "dentaire_accident",
        "libelle": "Soins dentaires suite a accident",
        "groupe": "dentaire",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "remarque": "Pris en charge par la LAMal si l'accident n'est pas couvert par la LAA.",
        "actif": true
      },
      {
        "id": "osteopathie",
        "libelle": "Osteopathie",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true
      },
      {
        "id": "acupuncture",
        "libelle": "Acupuncture",
        "groupe": "med_alternatives",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_seances",
        "part_lamal_defaut": null,
        "remarque": "Prise en charge LAMal uniquement si pratiquee par un medecin titulaire du titre reconnu ; sinon LCA.",
        "actif": true
      },
      {
        "id": "homeopathie",
        "libelle": "Homeopathie",
        "groupe": "med_alternatives",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_seances",
        "part_lamal_defaut": null,
        "actif": true
      },
      {
        "id": "naturopathie_phytotherapie",
        "libelle": "Naturopathie / phytotherapie",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true
      },
      {
        "id": "medecine_chinoise",
        "libelle": "Medecine traditionnelle chinoise",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true
      },
      {
        "id": "chiropratique",
        "libelle": "Chiropratique",
        "groupe": "med_alternatives",
        "categorie": "MIXTE",
        "unite_saisie": "montant_et_seances",
        "part_lamal_defaut": null,
        "remarque": "Chiropraticien reconnu : prise en charge LAMal. Complements et depassements : LCA.",
        "actif": true
      },
      {
        "id": "massage_therapeutique",
        "libelle": "Massage therapeutique / reflexologie",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true
      },
      {
        "id": "autres_med_alternatives",
        "libelle": "Autre medecine alternative (therapeute reconnu ASCA / RME)",
        "groupe": "med_alternatives",
        "categorie": "LCA",
        "unite_saisie": "montant_et_seances",
        "actif": true
      },
      {
        "id": "lunettes_lentilles_adulte",
        "libelle": "Lunettes et lentilles (adulte)",
        "groupe": "optique",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "lunettes_lentilles_enfant",
        "libelle": "Lunettes et lentilles (enfant)",
        "groupe": "optique",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "part_lamal_defaut": null,
        "remarque": "Forfait LAMal annuel limite jusqu'a 18 ans, complete par la LCA.",
        "actif": true
      },
      {
        "id": "chirurgie_refractive",
        "libelle": "Chirurgie refractive (laser des yeux)",
        "groupe": "optique",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "maternite_controles",
        "libelle": "Controles de grossesse et prestations de maternite",
        "groupe": "maternite",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "exoneration_id": "maternite",
        "actif": true
      },
      {
        "id": "accouchement",
        "libelle": "Accouchement (etablissement, maison de naissance, domicile)",
        "groupe": "maternite",
        "categorie": "LAMal",
        "unite_saisie": "montant_et_jours",
        "exoneration_id": "maternite",
        "actif": true
      },
      {
        "id": "maternite_complements",
        "libelle": "Complements maternite (cours, sage-femme au-dela LAMal, forfait naissance)",
        "groupe": "maternite",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "transport_urgence",
        "libelle": "Transport medicalise / ambulance",
        "groupe": "etranger_urgence",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "part_lamal_defaut": null,
        "remarque": "La LAMal ne prend en charge qu'une part limitee et plafonnee ; le solde releve de la LCA.",
        "actif": true
      },
      {
        "id": "sauvetage",
        "libelle": "Frais de sauvetage (helicoptere, montagne)",
        "groupe": "etranger_urgence",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "part_lamal_defaut": null,
        "actif": true
      },
      {
        "id": "rapatriement",
        "libelle": "Rapatriement sanitaire",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "soins_etranger_urgence",
        "libelle": "Soins d'urgence a l'etranger",
        "groupe": "etranger_urgence",
        "categorie": "MIXTE",
        "unite_saisie": "montant",
        "part_lamal_defaut": null,
        "remarque": "La LAMal rembourse au maximum le double de ce que couterait le traitement en Suisse ; la LCA couvre generalement le surplus.",
        "actif": true
      },
      {
        "id": "assistance_voyage",
        "libelle": "Assistance voyage (frais annexes, retour, hebergement)",
        "groupe": "etranger_urgence",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "soins_domicile_lamal",
        "libelle": "Soins a domicile prescrits (Spitex)",
        "groupe": "aides_soins",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "aide_menage",
        "libelle": "Aide au menage / aide familiale",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "moyens_auxiliaires_lamal",
        "libelle": "Moyens auxiliaires de la liste LiMA",
        "groupe": "aides_soins",
        "categorie": "LAMal",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "moyens_auxiliaires_lca",
        "libelle": "Moyens auxiliaires hors liste (semelles, appareils auditifs, etc.)",
        "groupe": "aides_soins",
        "categorie": "LCA",
        "unite_saisie": "montant",
        "actif": true
      },
      {
        "id": "indemnite_journaliere",
        "libelle": "Indemnite journaliere en cas d'incapacite de travail",
        "groupe": "incapacite",
        "categorie": "LCA",
        "unite_saisie": "montant_et_jours",
        "remarque": "Prestation versee, pas un remboursement de facture. Traitee separement dans le comparatif.",
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
    }
  ],
  "genere_le": "2026-09-06T19:14:41.990Z"
};
