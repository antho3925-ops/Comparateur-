<?php
// Copie ce fichier en "config.php" (dans ce même dossier) puis remplis-le.
// config.php n'est jamais envoyé sur GitHub : il contient tes clés secrètes.

return [
    // Nom affiché sur le site
    'shop_name' => 'Pokestocks',

    // Adresse complète du site, sans "/" à la fin
    'site_url' => 'https://www.monsite.com',

    // E-mail qui reçoit une notification à chaque commande
    'owner_email' => 'contact@monsite.com',

    // Mot de passe de la page d'administration (www.monsite.com/admin/).
    // Au moins 12 caractères, et différent de tes autres mots de passe.
    // Tant qu'il est vide, l'administration reste fermée.
    'admin_password' => '',

    // Clés Stripe (tableau de bord Stripe > Développeurs > Clés API).
    // Laisse vide tant que ton compte Stripe n'est pas créé : le site
    // fonctionne, mais le bouton de paiement affiche un message d'attente.
    // Commence par la clé de test (sk_test_...), puis passe à sk_live_...
    'stripe_secret_key' => '',

    // Secret du webhook (Stripe > Développeurs > Webhooks), commence par whsec_
    'stripe_webhook_secret' => '',

    // Livraison (montants en centimes : 690 = 6,90 €)
    'shipping_countries' => ['FR', 'BE', 'LU', 'MC', 'CH'],
    'shipping_label' => 'Colissimo suivi',
    'shipping_price' => 690,
    'free_shipping_from' => 10000, // livraison offerte dès 100 €, 0 pour désactiver
];
