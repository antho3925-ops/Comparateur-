import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PALIERS, type Palier } from '../metier/paliers';

import { Bouton, Carte } from './composants';
import { couleurs, espace, typo } from './theme';

/** Ecran affiche a la place d'une fonctionnalite reservee a un palier superieur. */
export function Verrou({
  titre,
  detail,
  palierRequis,
}: {
  titre: string;
  detail: string;
  palierRequis: Palier;
}) {
  const router = useRouter();
  const definition = PALIERS[palierRequis];

  return (
    <Carte style={styles.carte}>
      <Text style={styles.glyphe}>🔒</Text>
      <Text style={styles.titre}>{titre}</Text>
      <Text style={styles.detail}>{detail}</Text>

      <View style={styles.arguments}>
        {definition.arguments.map((argument) => (
          <Text key={argument} style={styles.argument}>
            · {argument}
          </Text>
        ))}
      </View>

      <Bouton
        titre={`Passer a ${definition.nom} — ${definition.prixMensuel} €/mois`}
        onPress={() => router.push('/paywall')}
      />
    </Carte>
  );
}

const styles = StyleSheet.create({
  carte: { alignItems: 'center', gap: espace.m, paddingVertical: espace.xl },
  glyphe: { fontSize: 32 },
  titre: { ...typo.sousTitre, color: couleurs.texte, textAlign: 'center' },
  detail: { ...typo.petit, color: couleurs.texteAttenue, textAlign: 'center' },
  arguments: { gap: espace.xs, alignSelf: 'stretch' },
  argument: { ...typo.petit, color: couleurs.texteAttenue },
});
