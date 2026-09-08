import { CameraView, useCameraPermissions } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../src/auth/AuthContext';
import { analyserPhoto, televerserPhoto } from '../src/donnees/repas';
import { poserBrouillon } from '../src/etat/brouillon';
import { Bouton, Chargement, Message } from '../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../src/ui/theme';

/** Largeur envoyee au modele : au-dela, on paie des pixels sans gagner en precision. */
const LARGEUR_ANALYSE = 1024;

export default function Photo() {
  const router = useRouter();
  const { session } = useAuth();
  const camera = useRef<CameraView>(null);
  const [permission, demanderPermission] = useCameraPermissions();
  const [etape, setEtape] = useState<'cadrage' | 'analyse'>('cadrage');
  const [erreur, setErreur] = useState<string | null>(null);

  async function capturer() {
    if (!camera.current || !session) return;
    setErreur(null);

    try {
      const prise = await camera.current.takePictureAsync({ quality: 0.8 });
      if (!prise?.uri) throw new Error('capture_vide');

      setEtape('analyse');

      // Redimensionnement avant envoi : moins de reseau, moins de jetons.
      const image = await ImageManipulator.manipulate(prise.uri)
        .resize({ width: LARGEUR_ANALYSE })
        .renderAsync();

      const reduite = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.7,
        base64: true,
      });

      if (!reduite.base64) throw new Error('base64_absent');

      // Le televersement ne doit pas faire echouer l'analyse : sans photo
      // stockee, le repas reste enregistrable.
      const cheminPhoto = await televerserPhoto(session.user.id, reduite.uri).catch(
        (e) => {
          console.warn('televersement en echec', e);
          return null;
        },
      );

      const analyse = await analyserPhoto(reduite.base64);

      poserBrouillon({ analyse, cheminPhoto, uriLocale: reduite.uri });
      router.replace('/correction');
    } catch (e) {
      console.warn('analyse en echec', e);
      setEtape('cadrage');
      setErreur(messageErreur(e));
    }
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.plein}>
        <Chargement />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.plein, styles.centre]}>
        <Text style={styles.consigne}>
          L'appareil photo sert a estimer les calories de votre assiette.
        </Text>
        <Bouton titre="Autoriser l'appareil photo" onPress={() => void demanderPermission()} />
        <Bouton titre="Retour" variante="discret" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.plein}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />

      <SafeAreaView style={styles.calque} edges={['top', 'bottom']}>
        <View style={styles.barreHaute}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.fermer}
          >
            <Text style={styles.fermerTexte}>✕</Text>
          </Pressable>
          <Text style={styles.consigneHaute}>Cadrez l'assiette entiere</Text>
        </View>

        <View style={styles.barreBasse}>
          {erreur ? <Message texte={erreur} /> : null}

          {etape === 'analyse' ? (
            <Chargement libelle="Analyse de votre repas..." />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Prendre la photo"
              onPress={() => void capturer()}
              style={({ pressed }) => [styles.declencheur, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.declencheurInterieur} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function messageErreur(e: unknown): string {
  const message = e instanceof Error ? e.message : '';
  if (message.includes('quota_photos_atteint')) {
    return 'Vous avez atteint votre quota de photos du jour.';
  }
  if (message.includes('image_trop_lourde')) {
    return 'Photo trop lourde. Reessayez en reculant un peu.';
  }
  return "L'analyse n'a pas abouti. Reessayez dans un instant.";
}

const styles = StyleSheet.create({
  plein: { flex: 1, backgroundColor: '#000' },
  centre: { justifyContent: 'center', gap: espace.l, padding: espace.l },
  consigne: { ...typo.corps, color: couleurs.texte, textAlign: 'center' },
  calque: { flex: 1, justifyContent: 'space-between' },
  barreHaute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    padding: espace.l,
  },
  fermer: {
    width: 40,
    height: 40,
    borderRadius: rayon.rond,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fermerTexte: { color: '#FFF', fontSize: 18 },
  consigneHaute: {
    ...typo.petit,
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: espace.m,
    paddingVertical: espace.s,
    borderRadius: rayon.rond,
  },
  barreBasse: { padding: espace.xl, gap: espace.m, alignItems: 'center' },
  declencheur: {
    width: 76,
    height: 76,
    borderRadius: rayon.rond,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declencheurInterieur: {
    width: 58,
    height: 58,
    borderRadius: rayon.rond,
    backgroundColor: '#FFF',
  },
});
