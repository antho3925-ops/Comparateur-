# Synchronisation en direct (Firebase, gratuit)

Le commercial note sur son téléphone, tu vois tout sur le tien. Sans réseau, tout est gardé et envoyé dès que la connexion revient.

## À faire une fois (5 minutes, sur ordinateur)
1. Va sur https://console.firebase.google.com avec un compte Google, puis « Ajouter un projet » (nom libre, sans Google Analytics).
2. Menu « Build », puis **Firestore Database**, « Créer une base de données ». Choisis le **mode production** et une région en Europe.
3. Onglet **Règles** : remplace tout par le texte ci-dessous, puis « Publier ». Ne choisis pas le mode test (il expire au bout de 30 jours).
4. Roue dentée, **Paramètres du projet**, onglet Général, « Vos applications », icône **</>** (Web). Donne un nom, puis relève **apiKey** et **projectId**.
5. Dans l'appli : Admin, Données, **Configurer**. Colle ces deux valeurs et garde le code d'équipe proposé, puis « Connecter ».

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/{team}/items/{item} {
      allow read, write: if true;
    }
  }
}
```

## Connecter le téléphone du commercial
Admin, Données, **Copier le lien**, puis envoie-le-lui. Il l'ouvre, touche « Connecter ce téléphone », et c'est réglé.

## À savoir
- Le **code d'équipe** sert de mot de passe : ne le partage qu'avec le commercial.
- La synchro se fait toutes les 30 secondes quand l'appli est ouverte, et dès le retour du réseau.
- Le quota gratuit de Firebase est très largement suffisant pour ce usage.
- Les données personnelles des prospects (noms, téléphones) sont stockées chez Google : pense à le mentionner dans tes mentions légales.
