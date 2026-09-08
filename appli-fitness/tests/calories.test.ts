import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CALORIES_MINIMUM,
  objectifCalorique,
  pourcentagePerdu,
  repartitionMacros,
  resumeJournee,
} from '../src/metier/calories.ts';

describe('objectif calorique', () => {
  it('place la perte de poids sous le maintien, et la prise de muscle au-dessus', () => {
    const perte = objectifCalorique(80, 180, 'perte_poids');
    const maintien = objectifCalorique(80, 180, 'maintien');
    const muscle = objectifCalorique(80, 180, 'prise_muscle');

    assert.ok(perte < maintien, `${perte} devrait etre sous ${maintien}`);
    assert.ok(muscle > maintien, `${muscle} devrait depasser ${maintien}`);
  });

  it('ne descend jamais sous le plancher de securite', () => {
    assert.ok(objectifCalorique(35, 140, 'perte_poids') >= CALORIES_MINIMUM);
  });

  it('augmente avec le poids', () => {
    assert.ok(
      objectifCalorique(90, 180, 'maintien') > objectifCalorique(70, 180, 'maintien'),
    );
  });
});

describe('repartition des macros', () => {
  it('couvre approximativement les calories visees', () => {
    const calories = 2400;
    const { proteines, glucides, lipides } = repartitionMacros(calories, 80, 'maintien');
    const total = proteines * 4 + glucides * 4 + lipides * 9;

    assert.ok(Math.abs(total - calories) <= 10, `total ${total} loin de ${calories}`);
  });

  it('donne plus de proteines en perte de poids qu\'en maintien', () => {
    const perte = repartitionMacros(2000, 80, 'perte_poids');
    const maintien = repartitionMacros(2000, 80, 'maintien');

    assert.ok(perte.proteines > maintien.proteines);
  });

  it('ne renvoie jamais de glucides negatifs', () => {
    const { glucides } = repartitionMacros(1200, 120, 'perte_poids');
    assert.ok(glucides >= 0);
  });
});

describe('resume de la journee', () => {
  const repas = [
    { calories: 600, proteines: 40, glucides: 60, lipides: 20 },
    { calories: 750, proteines: 35, glucides: 80, lipides: 25 },
  ];

  it('additionne les repas', () => {
    const resume = resumeJournee(2200, repas);

    assert.equal(resume.consommees, 1350);
    assert.equal(resume.restantes, 850);
    assert.equal(resume.depassement, false);
    assert.equal(resume.macros.proteines, 75);
  });

  it('signale le depassement', () => {
    const resume = resumeJournee(1000, repas);

    assert.equal(resume.depassement, true);
    assert.equal(resume.restantes, -350);
    assert.equal(resume.progression, 1, 'la barre reste bornee a 1');
  });

  it('gere une journee vide', () => {
    const resume = resumeJournee(2000, []);

    assert.equal(resume.consommees, 0);
    assert.equal(resume.restantes, 2000);
    assert.equal(resume.progression, 0);
  });
});

describe('pourcentage perdu', () => {
  it('compte une perte comme positive', () => {
    assert.equal(pourcentagePerdu(80, 76), 5);
  });

  it('compte une prise comme negative', () => {
    assert.equal(pourcentagePerdu(80, 84), -5);
  });

  it('resiste a un poids de depart absurde', () => {
    assert.equal(pourcentagePerdu(0, 70), 0);
  });
});
