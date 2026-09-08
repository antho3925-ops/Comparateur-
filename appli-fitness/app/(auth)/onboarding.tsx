import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { deconnexion } from '../../src/auth/connexion';
import {
  UsernamePris,
  creerProfil,
  normaliserUsername,
  usernameValide,
} from '../../src/donnees/profil';
import { enregistrerPoids } from '../../src/donnees/poids';
import {
  LIBELLES_OBJECTIF,
  objectifCalorique,
  type Objectif,
} from '../../src/metier/calories';
import {
  Bouton,
  Carte,
  Champ,
  Ecran,
  Message,
  SousTitre,
  Titre,
} from '../../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../../src/ui/theme';

const OBJECTIFS: Objectif[] = ['perte_poids', 'prise_muscle', 'maintien'];

export default function Onboarding() {
  const router = useRouter();
  const { session, rechargerProfil } = useAuth();

  const [username, setUsername] = useState('');
  const [objectif, setObjectif] = useState<Objectif>('perte_poids');
  const [taille, setTaille] = useState('');
  const [poids, setPoids] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const tailleNum = Number(taille.replace(',', '.'));
  const poidsNum = Number(poids.replace(',', '.'));

  const complet =
    usernameValide(username) &&
    tailleNum >= 100 &&
    tailleNum <= 250 &&
    poidsNum >= 25 &&
    poidsNum <= 400;

  const apercu = useMemo(
    () => (complet ? objectifCalorique(poidsNum, tailleNum, objectif) : null),
    [complet, poidsNum, tailleNum, objectif],
  );

  async function valider() {
    if (!session) return;
    setErreur(null);
    setEnCours(true);

    try {
      await creerProfil(session.user.id, {
        username,
        email: session.user.email ?? null,
        auth_provider: session.user.app_metadata.provider ?? null,
        objectif,
        taille_cm: Math.round(tailleNum),
      });

      await enregistrerPoids(session.user.id, poidsNum);
      await rechargerProfil();
      router.replace('/(app)/accueil');
    } catch (e) {
      if (e instanceof UsernamePris) {
        setErreur('Ce nom est deja pris. Essayez-en un autre.');
      } else {
        setErreur("L'enregistrement a echoue. Reessayez dans un instant.");
        console.warn('onboarding en echec', e);
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Ecran>
      <Titre>Votre profil</Titre>
      <Text style={styles.intro}>
        Quatre informations, et l'appli sait quoi vous afficher chaque jour.
      </Text>

      <Carte>
        <Champ
          libelle="Nom public (visible dans les classements)"
          value={username}
          onChangeText={(t) => setUsername(normaliserUsername(t))}
          placeholder="sarah_92"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {username.length > 0 && !usernameValide(username) ? (
          <Text style={styles.aide}>3 a 20 caracteres : lettres, chiffres, tirets bas.</Text>
        ) : null}
      </Carte>

      <Carte>
        <SousTitre>Votre objectif</SousTitre>
        <View style={styles.choix}>
          {OBJECTIFS.map((cle) => {
            const actif = objectif === cle;
            return (
              <Pressable
                key={cle}
                accessibilityRole="radio"
                accessibilityState={{ selected: actif }}
                onPress={() => setObjectif(cle)}
                style={[styles.option, actif && styles.optionActive]}
              >
                <Text style={[styles.optionTexte, actif && styles.optionTexteActif]}>
                  {LIBELLES_OBJECTIF[cle]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Carte>

      <Carte>
        <SousTitre>Mensurations de depart</SousTitre>
        <Champ
          libelle="Taille"
          suffixe="cm"
          value={taille}
          onChangeText={setTaille}
          keyboardType="numeric"
          placeholder="175"
        />
        <Champ
          libelle="Poids"
          suffixe="kg"
          value={poids}
          onChangeText={setPoids}
          keyboardType="numeric"
          placeholder="72"
        />
      </Carte>

      {apercu ? (
        <Message
          ton="info"
          texte={`Objectif de depart : environ ${apercu} kcal par jour. Vous pourrez l'ajuster depuis votre profil.`}
        />
      ) : null}

      {erreur ? <Message texte={erreur} /> : null}

      <Bouton
        titre="Commencer"
        onPress={() => void valider()}
        desactive={!complet}
        chargement={enCours}
      />

      <Bouton
        titre="Se deconnecter"
        variante="discret"
        onPress={() => {
          void deconnexion();
        }}
      />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  intro: { ...typo.corps, color: couleurs.texteAttenue, marginTop: -espace.s },
  aide: { ...typo.petit, color: couleurs.attention },
  choix: { gap: espace.s },
  option: {
    padding: espace.m,
    borderRadius: rayon.m,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.surfaceHaute,
  },
  optionActive: { borderColor: couleurs.accent, backgroundColor: couleurs.accentSombre },
  optionTexte: { ...typo.corps, color: couleurs.texteAttenue },
  optionTexteActif: { color: couleurs.texte, fontWeight: '600' },
});
