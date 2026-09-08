import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ConnexionAnnulee,
  appleDisponible,
  connexionApple,
  connexionGoogle,
} from '../../src/auth/connexion';
import { Bouton, Ecran, Message, Titre } from '../../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../../src/ui/theme';

export default function Connexion() {
  const router = useRouter();
  const [apple, setApple] = useState(false);
  const [enCours, setEnCours] = useState<'apple' | 'google' | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    void appleDisponible().then(setApple);
  }, []);

  async function lancer(fournisseur: 'apple' | 'google') {
    setErreur(null);
    setEnCours(fournisseur);

    try {
      if (fournisseur === 'apple') await connexionApple();
      else await connexionGoogle();
      // La redirection est portee par l'aiguillage une fois la session posee.
      router.replace('/');
    } catch (e) {
      if (!(e instanceof ConnexionAnnulee)) {
        setErreur("La connexion n'a pas abouti. Reessayez dans un instant.");
        console.warn('connexion en echec', e);
      }
    } finally {
      setEnCours(null);
    }
  }

  return (
    <Ecran style={styles.ecran}>
      <View style={styles.entete}>
        <View style={styles.pastille}>
          <Text style={styles.pastilleTexte}>F</Text>
        </View>
        <Titre>Suivez vos calories, sans les compter</Titre>
        <Text style={styles.accroche}>
          Une photo de votre assiette suffit. Le reste se remplit tout seul.
        </Text>
      </View>

      <View style={styles.actions}>
        {apple ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={rayon.m}
            style={styles.boutonApple}
            onPress={() => void lancer('apple')}
          />
        ) : null}

        <Bouton
          titre="Continuer avec Google"
          variante={apple ? 'secondaire' : 'principal'}
          chargement={enCours === 'google'}
          desactive={enCours !== null}
          onPress={() => void lancer('google')}
        />

        {erreur ? <Message texte={erreur} /> : null}

        <Text style={styles.mentions}>
          En continuant, vous acceptez que vos mesures et vos photos de repas soient
          conservees dans votre compte.
        </Text>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, justifyContent: 'space-between', paddingVertical: espace.xxl },
  entete: { gap: espace.m, marginTop: espace.xxl },
  pastille: {
    width: 56,
    height: 56,
    borderRadius: rayon.l,
    backgroundColor: couleurs.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espace.s,
  },
  pastilleTexte: { ...typo.sousTitre, color: couleurs.fond, fontSize: 28 },
  accroche: { ...typo.corps, color: couleurs.texteAttenue, lineHeight: 22 },
  actions: { gap: espace.m },
  boutonApple: { height: 50 },
  mentions: { ...typo.petit, color: couleurs.texteAttenue, textAlign: 'center' },
});
