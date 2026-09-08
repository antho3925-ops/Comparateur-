import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useAuth } from '../src/auth/AuthContext';
import { QuotaAtteint, enregistrerRepas, totauxAliments } from '../src/donnees/repas';
import { lireBrouillon, viderBrouillon } from '../src/etat/brouillon';
import {
  Bouton,
  Carte,
  Ecran,
  EtatVide,
  Message,
  SousTitre,
} from '../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../src/ui/theme';
import type { Aliment } from '../src/supabase/types';

const ALIMENT_VIDE: Aliment = {
  nom: '',
  quantite: '',
  calories: 0,
  proteines: 0,
  glucides: 0,
  lipides: 0,
};

export default function Correction() {
  const router = useRouter();
  const { session } = useAuth();
  const brouillon = useMemo(lireBrouillon, []);

  const [aliments, setAliments] = useState<Aliment[]>(brouillon?.analyse.aliments ?? []);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const totaux = totauxAliments(aliments);

  function modifier(index: number, champ: keyof Aliment, valeur: string) {
    setAliments((precedents) =>
      precedents.map((aliment, i) => {
        if (i !== index) return aliment;
        if (champ === 'nom' || champ === 'quantite') return { ...aliment, [champ]: valeur };
        return { ...aliment, [champ]: Number(valeur.replace(',', '.')) || 0 };
      }),
    );
  }

  function retirer(index: number) {
    setAliments((precedents) => precedents.filter((_, i) => i !== index));
  }

  async function enregistrer() {
    if (!session) return;
    setErreur(null);
    setEnCours(true);

    try {
      await enregistrerRepas(session.user.id, {
        photo_url: brouillon?.cheminPhoto ?? null,
        aliments,
        ...totaux,
      });

      viderBrouillon();
      router.replace('/(app)/accueil');
    } catch (e) {
      if (e instanceof QuotaAtteint) {
        setErreur('Quota de photos atteint pour aujourd’hui.');
      } else {
        console.warn('enregistrement en echec', e);
        setErreur("L'enregistrement a echoue. Reessayez dans un instant.");
      }
    } finally {
      setEnCours(false);
    }
  }

  if (!brouillon) {
    return (
      <Ecran>
        <EtatVide
          titre="Aucun repas en attente"
          detail="Reprenez une photo depuis l'accueil."
        />
        <Bouton titre="Retour a l'accueil" onPress={() => router.replace('/(app)/accueil')} />
      </Ecran>
    );
  }

  return (
    <Ecran>
      <Image source={{ uri: brouillon.uriLocale }} style={styles.photo} />

      <View style={styles.entete}>
        <SousTitre>{brouillon.analyse.plat || 'Repas'}</SousTitre>
        {brouillon.analyse.confiance !== 'haute' ? (
          <Message
            ton="info"
            texte={
              brouillon.analyse.confiance === 'basse'
                ? "Photo difficile a lire : verifiez surtout les quantites."
                : 'Estimation moyennement sure : un coup d’oeil aux quantites ne fait pas de mal.'
            }
          />
        ) : null}
      </View>

      <Carte>
        <View style={styles.totaux}>
          <Text style={styles.totalKcal}>{totaux.calories} kcal</Text>
          <Text style={styles.attenue}>
            P {totaux.proteines} g · G {totaux.glucides} g · L {totaux.lipides} g
          </Text>
        </View>
      </Carte>

      {aliments.length === 0 ? (
        <EtatVide
          titre="Aucun aliment detecte"
          detail="Ajoutez-les a la main : le repas sera compte quand meme."
        />
      ) : (
        aliments.map((aliment, index) => (
          <Carte key={index} style={styles.aliment}>
            <View style={styles.alimentEntete}>
              <SaisieLigne
                valeur={aliment.nom}
                placeholder="Aliment"
                onChange={(v) => modifier(index, 'nom', v)}
                style={styles.saisieNom}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Retirer ${aliment.nom || 'cet aliment'}`}
                onPress={() => retirer(index)}
                style={styles.retirer}
              >
                <Text style={styles.retirerTexte}>✕</Text>
              </Pressable>
            </View>

            <SaisieLigne
              valeur={aliment.quantite}
              placeholder="Quantite (ex. 150 g)"
              onChange={(v) => modifier(index, 'quantite', v)}
            />

            <View style={styles.grille}>
              <Nombre
                libelle="kcal"
                valeur={aliment.calories}
                onChange={(v) => modifier(index, 'calories', v)}
              />
              <Nombre
                libelle="P (g)"
                valeur={aliment.proteines}
                onChange={(v) => modifier(index, 'proteines', v)}
              />
              <Nombre
                libelle="G (g)"
                valeur={aliment.glucides}
                onChange={(v) => modifier(index, 'glucides', v)}
              />
              <Nombre
                libelle="L (g)"
                valeur={aliment.lipides}
                onChange={(v) => modifier(index, 'lipides', v)}
              />
            </View>
          </Carte>
        ))
      )}

      <Bouton
        titre="Ajouter un aliment"
        variante="secondaire"
        onPress={() => setAliments((p) => [...p, { ...ALIMENT_VIDE }])}
      />

      {erreur ? <Message texte={erreur} /> : null}

      <Bouton
        titre="Enregistrer le repas"
        onPress={() => void enregistrer()}
        chargement={enCours}
        desactive={aliments.length === 0}
      />

      <Bouton
        titre="Annuler"
        variante="discret"
        onPress={() => {
          viderBrouillon();
          router.replace('/(app)/accueil');
        }}
      />
    </Ecran>
  );
}

function SaisieLigne({
  valeur,
  placeholder,
  onChange,
  style,
}: {
  valeur: string;
  placeholder: string;
  onChange: (v: string) => void;
  style?: object;
}) {
  return (
    <TextInputStyle
      value={valeur}
      placeholder={placeholder}
      onChangeText={onChange}
      style={style}
    />
  );
}

function Nombre({
  libelle,
  valeur,
  onChange,
}: {
  libelle: string;
  valeur: number;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.nombre}>
      <Text style={styles.nombreLibelle}>{libelle}</Text>
      <TextInputStyle
        value={String(valeur)}
        keyboardType="numeric"
        onChangeText={onChange}
        style={styles.nombreSaisie}
      />
    </View>
  );
}

function TextInputStyle(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={couleurs.texteAttenue}
      {...props}
      style={[styles.saisie, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: 200, borderRadius: rayon.l, backgroundColor: couleurs.surface },
  entete: { gap: espace.s },
  attenue: { ...typo.petit, color: couleurs.texteAttenue },
  totaux: { alignItems: 'center', gap: espace.xs },
  totalKcal: { ...typo.chiffre, fontSize: 32, color: couleurs.accent },
  aliment: { gap: espace.s },
  alimentEntete: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  saisieNom: { flex: 1, fontWeight: '600' },
  retirer: {
    width: 32,
    height: 32,
    borderRadius: rayon.rond,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.surfaceHaute,
  },
  retirerTexte: { color: couleurs.texteAttenue, fontSize: 14 },
  saisie: {
    ...typo.corps,
    color: couleurs.texte,
    backgroundColor: couleurs.surfaceHaute,
    borderRadius: rayon.s,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingHorizontal: espace.m,
    paddingVertical: espace.s,
  },
  grille: { flexDirection: 'row', gap: espace.s },
  nombre: { flex: 1, gap: espace.xs },
  nombreLibelle: { ...typo.petit, color: couleurs.texteAttenue },
  nombreSaisie: { textAlign: 'center', paddingHorizontal: espace.xs },
});
