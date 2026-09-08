import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { couleurs, espace, rayon, typo } from './theme';

export function Ecran({
  children,
  defilant = true,
  style,
}: {
  children: ReactNode;
  defilant?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const contenu = defilant ? (
    <ScrollView
      contentContainerStyle={[styles.contenu, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.contenu, styles.plein, style]}>{children}</View>
  );

  return <SafeAreaView style={styles.ecran} edges={['top']}>{contenu}</SafeAreaView>;
}

export function Titre({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.titre, style]}>{children}</Text>;
}

export function SousTitre({ children }: { children: ReactNode }) {
  return <Text style={styles.sousTitre}>{children}</Text>;
}

export function Attenue({ children }: { children: ReactNode }) {
  return <Text style={styles.attenue}>{children}</Text>;
}

export function Carte({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.carte, style]}>{children}</View>;
}

export function Bouton({
  titre,
  onPress,
  variante = 'principal',
  desactive = false,
  chargement = false,
}: {
  titre: string;
  onPress: () => void;
  variante?: 'principal' | 'secondaire' | 'discret';
  desactive?: boolean;
  chargement?: boolean;
}) {
  const inactif = desactive || chargement;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactif }}
      onPress={onPress}
      disabled={inactif}
      style={({ pressed }) => [
        styles.bouton,
        variante === 'principal' && styles.boutonPrincipal,
        variante === 'secondaire' && styles.boutonSecondaire,
        variante === 'discret' && styles.boutonDiscret,
        pressed && styles.boutonPresse,
        inactif && styles.boutonInactif,
      ]}
    >
      {chargement ? (
        <ActivityIndicator color={variante === 'principal' ? couleurs.fond : couleurs.texte} />
      ) : (
        <Text
          style={[
            styles.boutonTexte,
            variante === 'principal' && styles.boutonTextePrincipal,
            variante === 'discret' && styles.boutonTexteDiscret,
          ]}
        >
          {titre}
        </Text>
      )}
    </Pressable>
  );
}

export function Champ({
  libelle,
  suffixe,
  ...props
}: TextInputProps & { libelle: string; suffixe?: string }) {
  return (
    <View style={styles.champ}>
      <Text style={styles.champLibelle}>{libelle}</Text>
      <View style={styles.champLigne}>
        <TextInput
          placeholderTextColor={couleurs.texteAttenue}
          style={styles.champSaisie}
          {...props}
        />
        {suffixe ? <Text style={styles.champSuffixe}>{suffixe}</Text> : null}
      </View>
    </View>
  );
}

export function BarreProgression({
  valeur,
  couleur = couleurs.accent,
}: {
  valeur: number;
  couleur?: string;
}) {
  const largeur = `${Math.min(100, Math.max(0, valeur * 100))}%` as const;
  return (
    <View style={styles.barreFond}>
      <View style={[styles.barreRemplie, { width: largeur, backgroundColor: couleur }]} />
    </View>
  );
}

export function EtatVide({ titre, detail }: { titre: string; detail?: string }) {
  return (
    <View style={styles.vide}>
      <Text style={styles.videTitre}>{titre}</Text>
      {detail ? <Text style={styles.attenue}>{detail}</Text> : null}
    </View>
  );
}

export function Chargement({ libelle }: { libelle?: string }) {
  return (
    <View style={styles.chargement}>
      <ActivityIndicator color={couleurs.accent} />
      {libelle ? <Text style={styles.attenue}>{libelle}</Text> : null}
    </View>
  );
}

export function Message({
  texte,
  ton = 'alerte',
}: {
  texte: string;
  ton?: 'alerte' | 'info';
}) {
  return (
    <View style={[styles.message, ton === 'info' && styles.messageInfo]}>
      <Text style={styles.messageTexte}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: espace.l, gap: espace.l, paddingBottom: espace.xxl },
  plein: { flex: 1 },
  titre: { ...typo.titre, color: couleurs.texte },
  sousTitre: { ...typo.sousTitre, color: couleurs.texte },
  attenue: { ...typo.petit, color: couleurs.texteAttenue },
  carte: {
    backgroundColor: couleurs.surface,
    borderRadius: rayon.l,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espace.l,
    gap: espace.m,
  },
  bouton: {
    minHeight: 50,
    borderRadius: rayon.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espace.l,
  },
  boutonPrincipal: { backgroundColor: couleurs.accent },
  boutonSecondaire: {
    backgroundColor: couleurs.surfaceHaute,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  boutonDiscret: { backgroundColor: 'transparent', minHeight: 40 },
  boutonPresse: { opacity: 0.75 },
  boutonInactif: { opacity: 0.45 },
  boutonTexte: { ...typo.corps, fontWeight: '600', color: couleurs.texte },
  boutonTextePrincipal: { color: couleurs.fond },
  boutonTexteDiscret: { color: couleurs.texteAttenue },
  champ: { gap: espace.s },
  champLibelle: { ...typo.petit, color: couleurs.texteAttenue },
  champLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.surfaceHaute,
    borderRadius: rayon.m,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: espace.m,
  },
  champSaisie: { flex: 1, ...typo.corps, color: couleurs.texte, paddingVertical: espace.m },
  champSuffixe: { ...typo.petit, color: couleurs.texteAttenue },
  barreFond: {
    height: 10,
    borderRadius: rayon.rond,
    backgroundColor: couleurs.surfaceHaute,
    overflow: 'hidden',
  },
  barreRemplie: { height: '100%', borderRadius: rayon.rond },
  vide: { alignItems: 'center', gap: espace.s, paddingVertical: espace.xl },
  videTitre: { ...typo.corps, color: couleurs.texte, fontWeight: '600' },
  chargement: { alignItems: 'center', gap: espace.s, paddingVertical: espace.xl },
  message: {
    backgroundColor: '#3B1D1D',
    borderRadius: rayon.m,
    padding: espace.m,
    borderWidth: 1,
    borderColor: couleurs.alerte,
  },
  messageInfo: { backgroundColor: couleurs.surfaceHaute, borderColor: couleurs.bordure },
  messageTexte: { ...typo.petit, color: couleurs.texte },
});
