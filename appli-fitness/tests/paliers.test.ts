import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  PALIERS,
  accesExercices,
  palierRequisPour,
  participeAuxClassements,
  peutPrendrePhoto,
  photosRestantes,
} from '../src/metier/paliers.ts';

describe('paliers', () => {
  it('applique les quotas de photos de la spec', () => {
    assert.equal(PALIERS.gratuit.photosParJour, 1);
    assert.equal(PALIERS.standard.photosParJour, 6);
    assert.equal(PALIERS.premium.photosParJour, null);
  });

  it('applique les prix de la spec', () => {
    assert.equal(PALIERS.gratuit.prixMensuel, 0);
    assert.equal(PALIERS.standard.prixMensuel, 5);
    assert.equal(PALIERS.premium.prixMensuel, 15);
  });

  it('decompte les photos restantes', () => {
    assert.equal(photosRestantes('gratuit', 0), 1);
    assert.equal(photosRestantes('gratuit', 1), 0);
    assert.equal(photosRestantes('standard', 4), 2);
    assert.equal(photosRestantes('premium', 99), null);
  });

  it('ne descend jamais sous zero', () => {
    assert.equal(photosRestantes('gratuit', 5), 0);
  });

  it('autorise la photo tant que le quota n\'est pas atteint', () => {
    assert.equal(peutPrendrePhoto('gratuit', 0), true);
    assert.equal(peutPrendrePhoto('gratuit', 1), false);
    assert.equal(peutPrendrePhoto('standard', 5), true);
    assert.equal(peutPrendrePhoto('standard', 6), false);
    assert.equal(peutPrendrePhoto('premium', 1000), true);
  });

  it('reserve les exercices au premium', () => {
    assert.equal(accesExercices('gratuit'), false);
    assert.equal(accesExercices('standard'), false);
    assert.equal(accesExercices('premium'), true);
  });

  it('fait participer standard et premium aux classements', () => {
    assert.equal(participeAuxClassements('gratuit'), false);
    assert.equal(participeAuxClassements('standard'), true);
    assert.equal(participeAuxClassements('premium'), true);
  });

  it('designe le palier minimal a vendre', () => {
    assert.equal(palierRequisPour('exercices'), 'premium');
    assert.equal(palierRequisPour('classements'), 'standard');
  });
});
