import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { seanceDuJour, unRmEstime } from '../src/metier/programme.ts';
import { debutDuMois, jourLocal, libelleCourt } from '../src/metier/dates.ts';

describe('seance du jour', () => {
  it('donne la meme seance a tout le monde un jour donne', () => {
    const jour = new Date(2026, 8, 8);
    assert.equal(seanceDuJour('maintien', jour).nom, seanceDuJour('maintien', jour).nom);
  });

  it('alterne pousser, tirer et jambes sur des jours consecutifs', () => {
    const noms = [0, 1, 2].map(
      (decalage) => seanceDuJour('maintien', new Date(2026, 8, 7 + decalage)).nom,
    );
    assert.equal(new Set(noms).size, 3, `noms repetes : ${noms.join(', ')}`);
  });

  it('prevoit deux jours de repos par cycle de sept', () => {
    const repos = Array.from({ length: 7 }, (_, i) =>
      seanceDuJour('maintien', new Date(2026, 8, 7 + i)).repos,
    ).filter(Boolean);

    assert.equal(repos.length, 2);
  });

  it('ne propose aucun exercice un jour de repos', () => {
    for (let i = 0; i < 7; i += 1) {
      const seance = seanceDuJour('maintien', new Date(2026, 8, 7 + i));
      if (seance.repos) assert.equal(seance.exercices.length, 0);
      else assert.ok(seance.exercices.length > 0);
    }
  });

  it('allonge les series en perte de poids et les alourdit en prise de muscle', () => {
    const jour = new Date(2026, 8, 7);
    assert.equal(seanceDuJour('perte_poids', jour).exercices[0].reps, '12-15');
    assert.equal(seanceDuJour('prise_muscle', jour).exercices[0].reps, '5-8');
  });
});

describe('1RM estime', () => {
  it('vaut la charge elle-meme a une repetition', () => {
    assert.equal(unRmEstime(100, 1), 103.3);
  });

  it('croit avec le nombre de repetitions', () => {
    assert.ok(unRmEstime(100, 10) > unRmEstime(100, 5));
  });

  it('renvoie zero sur une saisie vide', () => {
    assert.equal(unRmEstime(0, 10), 0);
    assert.equal(unRmEstime(100, 0), 0);
  });
});

describe('dates', () => {
  it('formate le jour en heure locale', () => {
    assert.equal(jourLocal(new Date(2026, 8, 8)), '2026-09-08');
  });

  it('ne decale pas la date en fin de journee', () => {
    assert.equal(jourLocal(new Date(2026, 8, 8, 23, 30)), '2026-09-08');
  });

  it('ramene au premier du mois', () => {
    assert.equal(debutDuMois(new Date(2026, 8, 22)), '2026-09-01');
  });

  it('abrege une date pour l\'historique', () => {
    assert.equal(libelleCourt('2026-09-08'), '8 sept.');
  });
});
