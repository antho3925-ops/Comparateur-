import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAbonnement } from '../src/abonnement/AbonnementContext';
import {
  AchatAnnule,
  acheter,
  offreCourante,
  palierDuPaquet,
  restaurer,
  type PurchasesPackage,
} from '../src/abonnement/revenuecat';
import { ORDRE_PALIERS, PALIERS, type Palier } from '../src/metier/paliers';
import {
  Bouton,
  Carte,
  Chargement,
  Ecran,
  Message,
  SousTitre,
  Titre,
} from '../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../src/ui/theme';

export default function Paywall() {
  const router = useRouter();
  const { palierReel, achatsDisponibles, modeToutDebloque, rafraichir } = useAbonnement();

  const [paquets, setPaquets] = useState<PurchasesPackage[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;

    void offreCourante().then((offre) => {
      if (!actif) return;
      setPaquets(offre?.availablePackages ?? []);
      setChargement(false);
    });

    return () => {
      actif = false;
    };
  }, []);

  async function souscrire(paquet: PurchasesPackage) {
    setErreur(null);
    setEnCours(paquet.identifier);

    try {
      const palier = await acheter(paquet);
      await rafraichir();
      setMessage(`Vous etes maintenant au palier ${PALIERS[palier].nom}.`);
    } catch (e) {
      if (!(e instanceof AchatAnnule)) {
        console.warn('achat en echec', e);
        setErreur("L'achat n'a pas abouti.");
      }
    } finally {
      setEnCours(null);
    }
  }

  async function restaurerAchats() {
    setErreur(null);
    setEnCours('restauration');

    try {
      const palier = await restaurer();
      await rafraichir();
      setMessage(
        palier === 'gratuit'
          ? 'Aucun abonnement actif retrouve.'
          : `Abonnement ${PALIERS[palier].nom} restaure.`,
      );
    } catch (e) {
      console.warn('restauration en echec', e);
      setErreur("La restauration n'a pas abouti.");
    } finally {
      setEnCours(null);
    }
  }

  return (
    <Ecran>
      <Titre>Trois formules</Titre>

      {modeToutDebloque ? (
        <Message
          ton="info"
          texte="Mode developpement actif : tout est deja deverrouille dans l'interface."
        />
      ) : null}

      {ORDRE_PALIERS.map((cle) => (
        <CartePalier key={cle} palier={cle} actuel={palierReel === cle} />
      ))}

      {chargement ? (
        <Chargement libelle="Chargement des offres..." />
      ) : !achatsDisponibles || paquets.length === 0 ? (
        <Message
          ton="info"
          texte={
            "Les achats ne sont pas disponibles ici. Ils demandent une version compilee " +
            "de l'app (development build ou store), avec les cles RevenueCat renseignees."
          }
        />
      ) : (
        paquets.map((paquet) => (
          <Bouton
            key={paquet.identifier}
            titre={`${PALIERS[palierDuPaquet(paquet)].nom} — ${paquet.product.priceString}`}
            onPress={() => void souscrire(paquet)}
            chargement={enCours === paquet.identifier}
            desactive={enCours !== null}
          />
        ))
      )}

      {message ? <Message ton="info" texte={message} /> : null}
      {erreur ? <Message texte={erreur} /> : null}

      {achatsDisponibles ? (
        <Bouton
          titre="Restaurer mes achats"
          variante="secondaire"
          onPress={() => void restaurerAchats()}
          chargement={enCours === 'restauration'}
        />
      ) : null}

      <Bouton titre="Fermer" variante="discret" onPress={() => router.back()} />
    </Ecran>
  );
}

function CartePalier({ palier, actuel }: { palier: Palier; actuel: boolean }) {
  const definition = PALIERS[palier];

  return (
    <Carte style={actuel ? styles.actuelle : undefined}>
      <View style={styles.entete}>
        <SousTitre>{definition.nom}</SousTitre>
        <Text style={styles.prix}>
          {definition.prixMensuel === 0 ? 'Gratuit' : `${definition.prixMensuel} €/mois`}
        </Text>
      </View>

      {definition.arguments.map((argument) => (
        <Text key={argument} style={styles.argument}>
          · {argument}
        </Text>
      ))}

      {actuel ? <Text style={styles.badge}>Votre formule actuelle</Text> : null}
    </Carte>
  );
}

const styles = StyleSheet.create({
  actuelle: { borderColor: couleurs.accent },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prix: { ...typo.corps, color: couleurs.accent, fontWeight: '700' },
  argument: { ...typo.petit, color: couleurs.texteAttenue },
  badge: {
    ...typo.petit,
    color: couleurs.fond,
    backgroundColor: couleurs.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: espace.m,
    paddingVertical: espace.xs,
    borderRadius: rayon.rond,
    fontWeight: '600',
  },
});
