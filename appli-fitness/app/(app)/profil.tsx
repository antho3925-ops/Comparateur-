import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAbonnement } from '../../src/abonnement/AbonnementContext';
import { useAuth } from '../../src/auth/AuthContext';
import { deconnexion } from '../../src/auth/connexion';
import { enregistrerPoids, historiquePoids } from '../../src/donnees/poids';
import { majProfil, supprimerCompte } from '../../src/donnees/profil';
import { libelleCourt } from '../../src/metier/dates';
import {
  LIBELLES_OBJECTIF,
  objectifCalorique,
  pourcentagePerdu,
  type Objectif,
} from '../../src/metier/calories';
import {
  Bouton,
  Carte,
  Champ,
  Ecran,
  EtatVide,
  Message,
  SousTitre,
  Titre,
} from '../../src/ui/composants';
import { couleurs, espace, rayon, typo } from '../../src/ui/theme';
import type { MesurePoids } from '../../src/supabase/types';

const OBJECTIFS: Objectif[] = ['perte_poids', 'prise_muscle', 'maintien'];

export default function Profil() {
  const router = useRouter();
  const { session, profil, rechargerProfil } = useAuth();
  const { palierReel, definition, modeToutDebloque } = useAbonnement();

  const [historique, setHistorique] = useState<MesurePoids[]>([]);
  const [nouveauPoids, setNouveauPoids] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    if (!session) return;
    try {
      setHistorique(await historiquePoids(session.user.id, 30));
    } catch (e) {
      console.warn('historique illisible', e);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  const dernier = historique[0];
  const premier = historique[historique.length - 1];
  const evolution =
    premier && dernier ? pourcentagePerdu(premier.poids, dernier.poids) : null;

  const objectifCalcule =
    dernier && profil?.taille_cm
      ? objectifCalorique(dernier.poids, profil.taille_cm, profil.objectif)
      : null;

  async function ajouterPoids() {
    if (!session) return;
    const valeur = Number(nouveauPoids.replace(',', '.'));
    if (!(valeur >= 25 && valeur <= 400)) return;

    setErreur(null);
    setEnCours(true);

    try {
      await enregistrerPoids(session.user.id, valeur);
      setNouveauPoids('');
      setMessage('Poids enregistre.');
      await charger();
    } catch (e) {
      console.warn('poids non enregistre', e);
      setErreur("Le poids n'a pas ete enregistre.");
    } finally {
      setEnCours(false);
    }
  }

  async function changerObjectif(objectif: Objectif) {
    if (!session) return;
    try {
      await majProfil(session.user.id, { objectif });
      await rechargerProfil();
    } catch (e) {
      console.warn('objectif non modifie', e);
      setErreur("L'objectif n'a pas pu etre modifie.");
    }
  }

  function confirmerSuppression() {
    Alert.alert(
      'Supprimer votre compte ?',
      'Vos repas, vos pesees et vos seances seront effaces definitivement. '
        + 'Cette action est irreversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await supprimerCompte();
              } catch (e) {
                console.warn('suppression de compte en echec', e);
                setErreur("Le compte n'a pas pu etre supprime.");
              }
            })();
          },
        },
      ],
    );
  }

  return (
    <Ecran>
      <Titre>Profil</Titre>
      <Text style={styles.attenue}>
        {profil?.username} · {profil?.email ?? 'sans e-mail'}
      </Text>

      <Carte>
        <View style={styles.abonnementEntete}>
          <View>
            <SousTitre>Palier {definition.nom}</SousTitre>
            <Text style={styles.attenue}>
              {definition.prixMensuel === 0
                ? 'Gratuit'
                : `${definition.prixMensuel} €/mois`}
            </Text>
          </View>
          <Bouton
            titre={palierReel === 'premium' ? 'Gerer' : 'Ameliorer'}
            variante="secondaire"
            onPress={() => router.push('/paywall')}
          />
        </View>

        {modeToutDebloque ? (
          <Message
            ton="info"
            texte={`Mode developpement : tout est deverrouille dans l'interface. Palier reel : ${palierReel}.`}
          />
        ) : null}
      </Carte>

      <Carte>
        <SousTitre>Mensurations</SousTitre>
        <View style={styles.mesures}>
          <Mesure libelle="Taille" valeur={profil?.taille_cm ? `${profil.taille_cm} cm` : '—'} />
          <Mesure libelle="Poids" valeur={dernier ? `${dernier.poids} kg` : '—'} />
          <Mesure
            libelle="Evolution"
            valeur={evolution === null ? '—' : `${evolution > 0 ? '-' : '+'}${Math.abs(evolution)} %`}
          />
        </View>

        <Champ
          libelle="Nouveau poids"
          suffixe="kg"
          value={nouveauPoids}
          onChangeText={setNouveauPoids}
          keyboardType="numeric"
          placeholder={dernier ? String(dernier.poids) : '72'}
        />
        <Bouton
          titre="Enregistrer le poids du jour"
          onPress={() => void ajouterPoids()}
          chargement={enCours}
          desactive={!nouveauPoids}
        />
      </Carte>

      <Carte>
        <SousTitre>Objectif</SousTitre>
        <View style={styles.choix}>
          {OBJECTIFS.map((cle) => {
            const actif = profil?.objectif === cle;
            return (
              <Pressable
                key={cle}
                accessibilityRole="radio"
                accessibilityState={{ selected: actif }}
                onPress={() => void changerObjectif(cle)}
                style={[styles.option, actif && styles.optionActive]}
              >
                <Text style={[styles.optionTexte, actif && styles.optionTexteActif]}>
                  {LIBELLES_OBJECTIF[cle]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {objectifCalcule ? (
          <Text style={styles.attenue}>
            Objectif calorique :{' '}
            {profil?.calories_objectif ?? objectifCalcule} kcal par jour
            {profil?.calories_objectif ? ' (valeur que vous avez fixee)' : ' (estime)'}
          </Text>
        ) : null}
      </Carte>

      <Carte>
        <SousTitre>Historique du poids</SousTitre>
        {historique.length === 0 ? (
          <EtatVide titre="Aucune pesee enregistree" />
        ) : (
          historique.slice(0, 10).map((mesure) => (
            <View key={mesure.id} style={styles.ligneHistorique}>
              <Text style={styles.attenue}>{libelleCourt(mesure.date)}</Text>
              <Text style={styles.poidsHistorique}>{mesure.poids} kg</Text>
            </View>
          ))
        )}
      </Carte>

      {message ? <Message ton="info" texte={message} /> : null}
      {erreur ? <Message texte={erreur} /> : null}

      <Bouton
        titre="Se deconnecter"
        variante="discret"
        onPress={() => {
          void deconnexion();
        }}
      />

      <Pressable accessibilityRole="button" onPress={confirmerSuppression}>
        <Text style={styles.supprimer}>Supprimer mon compte</Text>
      </Pressable>
    </Ecran>
  );
}

function Mesure({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <View style={styles.mesure}>
      <Text style={styles.attenue}>{libelle}</Text>
      <Text style={styles.mesureValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  attenue: { ...typo.petit, color: couleurs.texteAttenue },
  abonnementEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espace.m,
  },
  mesures: { flexDirection: 'row', justifyContent: 'space-between', gap: espace.s },
  mesure: { flex: 1, gap: espace.xs },
  mesureValeur: { ...typo.corps, color: couleurs.texte, fontWeight: '600' },
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
  ligneHistorique: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: espace.s,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.bordure,
  },
  poidsHistorique: { ...typo.corps, color: couleurs.texte },
  supprimer: {
    ...typo.petit,
    color: couleurs.alerte,
    textAlign: 'center',
    paddingVertical: espace.m,
  },
});
