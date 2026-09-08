import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAbonnement } from '../../src/abonnement/AbonnementContext';
import { classementExercice, classementPertePoids } from '../../src/donnees/classements';
import { libelleMois } from '../../src/metier/dates';
import { participeAuxClassements } from '../../src/metier/paliers';
import { EXERCICES_PHARES } from '../../src/metier/programme';
import {
  Carte,
  Chargement,
  Ecran,
  EtatVide,
  Message,
  Titre,
} from '../../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../../src/ui/theme';
import type {
  LigneClassementExercice,
  LigneClassementPoids,
} from '../../src/supabase/types';

type Onglet = 'poids' | 'exercice';

export default function Classements() {
  const { palier } = useAbonnement();
  const [onglet, setOnglet] = useState<Onglet>('poids');
  const [exercice, setExercice] = useState<string>(EXERCICES_PHARES[0]);

  const [poids, setPoids] = useState<LigneClassementPoids[]>([]);
  const [perfs, setPerfs] = useState<LigneClassementExercice[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const participe = participeAuxClassements(palier);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      if (onglet === 'poids') setPoids(await classementPertePoids());
      else setPerfs(await classementExercice(exercice));
    } catch (e) {
      console.warn('classement illisible', e);
      setErreur('Le classement est momentanement indisponible.');
    } finally {
      setChargement(false);
    }
  }, [onglet, exercice]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  return (
    <Ecran>
      <Titre>Classements</Titre>

      {!participe ? (
        <Message
          ton="info"
          texte={
            'Compte gratuit : vous consultez les classements sans y figurer. ' +
            'Le palier Standard vous y fait entrer.'
          }
        />
      ) : null}

      <View style={styles.onglets}>
        <OngletBouton
          titre="Perte de poids"
          actif={onglet === 'poids'}
          onPress={() => setOnglet('poids')}
        />
        <OngletBouton
          titre="Performance"
          actif={onglet === 'exercice'}
          onPress={() => setOnglet('exercice')}
        />
      </View>

      {onglet === 'poids' ? (
        <Text style={styles.attenue}>
          Pourcentage perdu depuis le debut du mois · {libelleMois()}
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.puces}>
            {EXERCICES_PHARES.map((nom) => (
              <Pressable
                key={nom}
                accessibilityRole="button"
                accessibilityState={{ selected: exercice === nom }}
                onPress={() => setExercice(nom)}
                style={[styles.puce, exercice === nom && styles.puceActive]}
              >
                <Text
                  style={[styles.puceTexte, exercice === nom && styles.puceTexteActif]}
                >
                  {nom}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {erreur ? <Message texte={erreur} /> : null}

      {chargement ? (
        <Chargement />
      ) : onglet === 'poids' ? (
        poids.length === 0 ? (
          <EtatVide
            titre="Classement vide ce mois-ci"
            detail="Pesez-vous deux fois dans le mois pour y apparaitre."
          />
        ) : (
          poids.map((ligne) => (
            <Rang
              key={`${ligne.rang}-${ligne.username}`}
              rang={ligne.rang}
              nom={ligne.username}
              moi={ligne.est_moi}
              valeur={`${ligne.pct_perdu.toFixed(1)} %`}
              detail={`${ligne.poids_depart} kg → ${ligne.poids_actuel} kg`}
            />
          ))
        )
      ) : perfs.length === 0 ? (
        <EtatVide
          titre={`Aucune perf sur ${exercice}`}
          detail="Enregistrez une serie depuis l'onglet Exercices."
        />
      ) : (
        perfs.map((ligne) => (
          <Rang
            key={`${ligne.rang}-${ligne.username}`}
            rang={ligne.rang}
            nom={ligne.username}
            moi={ligne.est_moi}
            valeur={`${ligne.un_rm_estime} kg`}
            detail={`${ligne.poids_souleve} kg × ${ligne.reps} reps`}
          />
        ))
      )}
    </Ecran>
  );
}

function OngletBouton({
  titre,
  actif,
  onPress,
}: {
  titre: string;
  actif: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: actif }}
      onPress={onPress}
      style={[styles.onglet, actif && styles.ongletActif]}
    >
      <Text style={[styles.ongletTexte, actif && styles.ongletTexteActif]}>{titre}</Text>
    </Pressable>
  );
}

function Rang({
  rang,
  nom,
  moi,
  valeur,
  detail,
}: {
  rang: number;
  nom: string;
  moi: boolean;
  valeur: string;
  detail: string;
}) {
  const medaille = rang === 1 ? couleurs.or : rang === 2 ? couleurs.argent : rang === 3 ? couleurs.bronze : couleurs.texteAttenue;

  return (
    <Carte style={[styles.rang, moi && styles.rangMoi]}>
      <Text style={[styles.rangNumero, { color: medaille }]}>{rang}</Text>
      <View style={styles.rangTexte}>
        <Text style={styles.rangNom}>
          {nom}
          {moi ? ' · vous' : ''}
        </Text>
        <Text style={styles.attenue}>{detail}</Text>
      </View>
      <Text style={styles.rangValeur}>{valeur}</Text>
    </Carte>
  );
}

const styles = StyleSheet.create({
  attenue: { ...typo.petit, color: couleurs.texteAttenue },
  onglets: { flexDirection: 'row', gap: espace.s },
  onglet: {
    flex: 1,
    paddingVertical: espace.m,
    borderRadius: rayon.m,
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    alignItems: 'center',
  },
  ongletActif: { backgroundColor: couleurs.accentSombre, borderColor: couleurs.accent },
  ongletTexte: { ...typo.corps, color: couleurs.texteAttenue },
  ongletTexteActif: { color: couleurs.texte, fontWeight: '600' },
  puces: { flexDirection: 'row', gap: espace.s, paddingVertical: espace.xs },
  puce: {
    paddingHorizontal: espace.m,
    paddingVertical: espace.s,
    borderRadius: rayon.rond,
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  puceActive: { backgroundColor: couleurs.accentSombre, borderColor: couleurs.accent },
  puceTexte: { ...typo.petit, color: couleurs.texteAttenue },
  puceTexteActif: { color: couleurs.texte, fontWeight: '600' },
  rang: { flexDirection: 'row', alignItems: 'center', gap: espace.m, paddingVertical: espace.m },
  rangMoi: { borderColor: couleurs.accent },
  rangNumero: { ...typo.sousTitre, width: 28, textAlign: 'center' },
  rangTexte: { flex: 1, gap: espace.xs },
  rangNom: { ...typo.corps, color: couleurs.texte, fontWeight: '600' },
  rangValeur: { ...typo.corps, color: couleurs.accent, fontWeight: '700' },
});
