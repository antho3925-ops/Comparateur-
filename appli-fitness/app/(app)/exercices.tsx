import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAbonnement } from '../../src/abonnement/AbonnementContext';
import { useAuth } from '../../src/auth/AuthContext';
import {
  enregistrerPerf,
  historiqueExercice,
  perfsDuJour,
} from '../../src/donnees/exercices';
import { libelleCourt } from '../../src/metier/dates';
import { accesExercices } from '../../src/metier/paliers';
import { seanceDuJour, unRmEstime } from '../../src/metier/programme';
import {
  Bouton,
  Carte,
  Champ,
  Chargement,
  Ecran,
  EtatVide,
  Message,
  SousTitre,
  Titre,
} from '../../src/ui/composants';
import { Verrou } from '../../src/ui/Verrou';
import { couleurs, espace, rayon, typo } from '../../src/ui/theme';
import type { PerfExercice } from '../../src/supabase/types';

export default function Exercices() {
  const { session, profil } = useAuth();
  const { palier } = useAbonnement();

  const [perfs, setPerfs] = useState<PerfExercice[]>([]);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  const debloque = accesExercices(palier);
  const seance = seanceDuJour(profil?.objectif ?? 'maintien');

  const charger = useCallback(async () => {
    if (!session || !debloque) {
      setChargement(false);
      return;
    }

    try {
      setPerfs(await perfsDuJour(session.user.id));
    } catch (e) {
      console.warn('seances illisibles', e);
    } finally {
      setChargement(false);
    }
  }, [session, debloque]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  if (!debloque) {
    return (
      <Ecran>
        <Titre>Exercices</Titre>
        <Verrou
          titre="Programme reserve au palier Premium"
          detail="Seance du jour, suivi des charges et progression dans le temps."
          palierRequis="premium"
        />
      </Ecran>
    );
  }

  return (
    <Ecran>
      <Titre>Seance du jour</Titre>
      <Text style={styles.attenue}>{seance.nom}</Text>

      {seance.repos ? (
        <Carte>
          <EtatVide
            titre="Jour de repos"
            detail="La recuperation fait partie du programme. A demain."
          />
        </Carte>
      ) : chargement ? (
        <Chargement />
      ) : (
        seance.exercices.map((exercice) => (
          <LigneExercice
            key={exercice.nom}
            nom={exercice.nom}
            series={exercice.series}
            reps={exercice.reps}
            faites={perfs.filter((p) => p.exercice.toLowerCase() === exercice.nom.toLowerCase())}
            ouvert={ouvert === exercice.nom}
            onBascule={() => setOuvert((o) => (o === exercice.nom ? null : exercice.nom))}
            onEnregistre={charger}
            idUtilisateur={session!.user.id}
          />
        ))
      )}
    </Ecran>
  );
}

function LigneExercice({
  nom,
  series,
  reps,
  faites,
  ouvert,
  onBascule,
  onEnregistre,
  idUtilisateur,
}: {
  nom: string;
  series: number;
  reps: string;
  faites: PerfExercice[];
  ouvert: boolean;
  onBascule: () => void;
  onEnregistre: () => Promise<void>;
  idUtilisateur: string;
}) {
  const [poids, setPoids] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [historique, setHistorique] = useState<PerfExercice[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const poidsNum = Number(poids.replace(',', '.'));
  const repsNum = Number(repetitions);
  const valide = poidsNum > 0 && repsNum >= 1 && repsNum <= 100;

  async function ouvrirHistorique() {
    onBascule();
    if (historique === null) {
      try {
        setHistorique(await historiqueExercice(idUtilisateur, nom, 10));
      } catch (e) {
        console.warn('historique illisible', e);
        setHistorique([]);
      }
    }
  }

  async function ajouter() {
    setErreur(null);
    setEnCours(true);

    try {
      await enregistrerPerf(idUtilisateur, {
        exercice: nom,
        poids_souleve: poidsNum,
        reps: repsNum,
      });
      setPoids('');
      setRepetitions('');
      setHistorique(null);
      await onEnregistre();
    } catch (e) {
      console.warn('enregistrement de perf en echec', e);
      setErreur("La serie n'a pas ete enregistree.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Carte>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }}
        onPress={() => void ouvrirHistorique()}
        style={styles.entete}
      >
        <View style={styles.enteteTexte}>
          <SousTitre>{nom}</SousTitre>
          <Text style={styles.attenue}>
            {series} series × {reps} reps
          </Text>
        </View>
        <View style={styles.compteur}>
          <Text style={styles.compteurTexte}>
            {faites.length}/{series}
          </Text>
        </View>
      </Pressable>

      {faites.length > 0 ? (
        <View style={styles.series}>
          {faites.map((p, i) => (
            <Text key={p.id} style={styles.serie}>
              S{i + 1} · {p.poids_souleve} kg × {p.reps}
            </Text>
          ))}
        </View>
      ) : null}

      {ouvert ? (
        <View style={styles.saisie}>
          <View style={styles.saisieLigne}>
            <View style={styles.saisieChamp}>
              <Champ
                libelle="Charge"
                suffixe="kg"
                value={poids}
                onChangeText={setPoids}
                keyboardType="numeric"
                placeholder="60"
              />
            </View>
            <View style={styles.saisieChamp}>
              <Champ
                libelle="Repetitions"
                value={repetitions}
                onChangeText={setRepetitions}
                keyboardType="numeric"
                placeholder="8"
              />
            </View>
          </View>

          {valide ? (
            <Text style={styles.attenue}>
              1RM estime : {unRmEstime(poidsNum, repsNum)} kg
            </Text>
          ) : null}

          {erreur ? <Message texte={erreur} /> : null}

          <Bouton
            titre="Valider la serie"
            onPress={() => void ajouter()}
            desactive={!valide}
            chargement={enCours}
          />

          {historique && historique.length > 0 ? (
            <View style={styles.historique}>
              <Text style={styles.attenue}>Progression</Text>
              {historique.map((p) => (
                <Text key={p.id} style={styles.serie}>
                  {libelleCourt(p.date)} · {p.poids_souleve} kg × {p.reps}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Carte>
  );
}

const styles = StyleSheet.create({
  attenue: { ...typo.petit, color: couleurs.texteAttenue },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  enteteTexte: { flex: 1, gap: espace.xs },
  compteur: {
    paddingHorizontal: espace.m,
    paddingVertical: espace.s,
    borderRadius: rayon.rond,
    backgroundColor: couleurs.surfaceHaute,
  },
  compteurTexte: { ...typo.petit, color: couleurs.texte, fontWeight: '600' },
  series: { gap: espace.xs },
  serie: { ...typo.petit, color: couleurs.texte },
  saisie: {
    gap: espace.m,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    paddingTop: espace.m,
  },
  saisieLigne: { flexDirection: 'row', gap: espace.m },
  saisieChamp: { flex: 1 },
  historique: { gap: espace.xs, marginTop: espace.s },
});
