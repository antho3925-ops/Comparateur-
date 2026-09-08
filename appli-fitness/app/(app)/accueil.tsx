import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAbonnement } from '../../src/abonnement/AbonnementContext';
import { useAuth } from '../../src/auth/AuthContext';
import { useJournee } from '../../src/etat/useJournee';
import { photosRestantes } from '../../src/metier/paliers';
import {
  BarreProgression,
  Bouton,
  Carte,
  Chargement,
  Ecran,
  EtatVide,
  Message,
  SousTitre,
  Titre,
} from '../../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../../src/ui/theme';

export default function Accueil() {
  const router = useRouter();
  const { profil } = useAuth();
  const { palier, modeToutDebloque } = useAbonnement();
  const { repas, resume, objectifKcal, ciblesMacros, chargement, erreur } = useJournee();

  const restantes = photosRestantes(palier, repas.length);
  const quotaAtteint = restantes !== null && restantes === 0;

  return (
    <Ecran>
      <View style={styles.entete}>
        <Text style={styles.salutation}>Bonjour {profil?.username ?? ''}</Text>
        <Titre>Aujourd’hui</Titre>
      </View>

      {erreur ? <Message texte={erreur} /> : null}

      <Carte>
        <View style={styles.bilan}>
          <View>
            <Text style={styles.chiffre}>{resume.consommees}</Text>
            <Text style={styles.attenue}>kcal consommees</Text>
          </View>
          <View style={styles.bilanDroite}>
            <Text
              style={[styles.chiffreSecondaire, resume.depassement && styles.depassement]}
            >
              {resume.depassement ? `+${-resume.restantes}` : resume.restantes}
            </Text>
            <Text style={styles.attenue}>
              {resume.depassement ? 'kcal au-dessus' : 'kcal restantes'}
            </Text>
          </View>
        </View>

        <BarreProgression
          valeur={resume.progression}
          couleur={resume.depassement ? couleurs.alerte : couleurs.accent}
        />
        <Text style={styles.attenue}>Objectif : {objectifKcal} kcal</Text>

        <View style={styles.macros}>
          <Macro
            nom="Proteines"
            valeur={resume.macros.proteines}
            cible={ciblesMacros.proteines}
          />
          <Macro
            nom="Glucides"
            valeur={resume.macros.glucides}
            cible={ciblesMacros.glucides}
          />
          <Macro nom="Lipides" valeur={resume.macros.lipides} cible={ciblesMacros.lipides} />
        </View>
      </Carte>

      <View style={styles.actionPhoto}>
        <Bouton
          titre={quotaAtteint ? 'Quota du jour atteint' : 'Prendre une photo'}
          onPress={() => router.push(quotaAtteint ? '/paywall' : '/photo')}
        />
        <Text style={styles.attenue}>
          {restantes === null
            ? 'Photos illimitees'
            : `${restantes} photo${restantes > 1 ? 's' : ''} restante${restantes > 1 ? 's' : ''} aujourd’hui`}
          {modeToutDebloque ? ' — mode developpement, tout est deverrouille' : ''}
        </Text>
      </View>

      <View style={styles.raccourcis}>
        <Raccourci
          glyphe="🏋️"
          titre="Exercices"
          onPress={() => router.push('/(app)/exercices')}
        />
        <Raccourci
          glyphe="🏆"
          titre="Classements"
          onPress={() => router.push('/(app)/classements')}
        />
      </View>

      <SousTitre>Repas du jour</SousTitre>

      {chargement ? (
        <Chargement />
      ) : repas.length === 0 ? (
        <EtatVide
          titre="Aucun repas enregistre"
          detail="Photographiez votre assiette, l'estimation se remplit toute seule."
        />
      ) : (
        repas.map((r) => (
          <Carte key={r.id} style={styles.repas}>
            <View style={styles.repasLigne}>
              <Text style={styles.repasNom} numberOfLines={1}>
                {r.aliments[0]?.nom ?? 'Repas'}
                {r.aliments.length > 1 ? ` +${r.aliments.length - 1}` : ''}
              </Text>
              <Text style={styles.repasKcal}>{r.calories} kcal</Text>
            </View>
            <Text style={styles.attenue}>
              P {Math.round(r.proteines)} g · G {Math.round(r.glucides)} g · L{' '}
              {Math.round(r.lipides)} g
            </Text>
          </Carte>
        ))
      )}
    </Ecran>
  );
}

function Macro({ nom, valeur, cible }: { nom: string; valeur: number; cible: number }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroNom}>{nom}</Text>
      <Text style={styles.macroValeur}>
        {valeur}
        <Text style={styles.attenue}> / {cible} g</Text>
      </Text>
    </View>
  );
}

function Raccourci({
  glyphe,
  titre,
  onPress,
}: {
  glyphe: string;
  titre: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.raccourci, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.raccourciGlyphe}>{glyphe}</Text>
      <Text style={styles.raccourciTitre}>{titre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  entete: { gap: espace.xs },
  salutation: { ...typo.petit, color: couleurs.texteAttenue },
  attenue: { ...typo.petit, color: couleurs.texteAttenue },
  bilan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bilanDroite: { alignItems: 'flex-end' },
  chiffre: { ...typo.chiffre, color: couleurs.texte },
  chiffreSecondaire: { ...typo.sousTitre, fontSize: 24, color: couleurs.accent },
  depassement: { color: couleurs.alerte },
  macros: { flexDirection: 'row', justifyContent: 'space-between', gap: espace.s },
  macro: { flex: 1, gap: espace.xs },
  macroNom: { ...typo.petit, color: couleurs.texteAttenue },
  macroValeur: { ...typo.corps, color: couleurs.texte, fontWeight: '600' },
  actionPhoto: { gap: espace.s, alignItems: 'center' },
  raccourcis: { flexDirection: 'row', gap: espace.m },
  raccourci: {
    flex: 1,
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.l,
    padding: espace.l,
    alignItems: 'center',
    gap: espace.xs,
  },
  raccourciGlyphe: { fontSize: 24 },
  raccourciTitre: { ...typo.corps, color: couleurs.texte, fontWeight: '600' },
  repas: { gap: espace.xs },
  repasLigne: { flexDirection: 'row', justifyContent: 'space-between', gap: espace.m },
  repasNom: { ...typo.corps, color: couleurs.texte, flex: 1 },
  repasKcal: { ...typo.corps, color: couleurs.accent, fontWeight: '600' },
});
