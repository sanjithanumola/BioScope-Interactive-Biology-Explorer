import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePunnettSquare,
  getComplementaryDnaStrand,
  validateBasePair,
  calculateOsmosisDynamics,
  calculateUserLevel,
  normalizeGenotype,
} from './biologyLogic.ts';

test('normalizeGenotype places dominant allele first', () => {
  assert.equal(normalizeGenotype('bB'), 'Bb');
  assert.equal(normalizeGenotype('Bb'), 'Bb');
  assert.equal(normalizeGenotype('BB'), 'BB');
  assert.equal(normalizeGenotype('bb'), 'bb');
});

test('calculatePunnettSquare correctly calculates Bb x Bb monohybrid cross', () => {
  const result = calculatePunnettSquare('Bb', 'Bb');
  // Expected offspring: BB, Bb, Bb, bb
  assert.deepEqual(result.matrix, ['BB', 'Bb', 'Bb', 'bb']);

  // Check genotype frequencies: BB=25%, Bb=50%, bb=25%
  assert.equal(result.genotypeFrequencies['BB']?.percentage, 25);
  assert.equal(result.genotypeFrequencies['Bb']?.percentage, 50);
  assert.equal(result.genotypeFrequencies['bb']?.percentage, 25);

  // Check phenotype frequencies: 75% dominant, 25% recessive
  assert.equal(result.phenotypeFrequencies.dominant.percentage, 75);
  assert.equal(result.phenotypeFrequencies.recessive.percentage, 25);
});

test('calculatePunnettSquare homozygous dominant x homozygous recessive', () => {
  const result = calculatePunnettSquare('BB', 'bb');
  // All should be Bb (100% dominant phenotype)
  assert.deepEqual(result.matrix, ['Bb', 'Bb', 'Bb', 'Bb']);
  assert.equal(result.genotypeFrequencies['Bb']?.percentage, 100);
  assert.equal(result.phenotypeFrequencies.dominant.percentage, 100);
  assert.equal(result.phenotypeFrequencies.recessive.percentage, 0);
});

test('getComplementaryDnaStrand generates complementary base pairs', () => {
  assert.equal(getComplementaryDnaStrand('ATGC'), 'TACG');
  assert.equal(getComplementaryDnaStrand('AAAA'), 'TTTT');
  assert.equal(getComplementaryDnaStrand('GCGC'), 'CGCG');
  assert.throws(() => getComplementaryDnaStrand('ATXG'));
});

test('validateBasePair enforces Watson-Crick pairing rules', () => {
  assert.equal(validateBasePair('A', 'T'), true);
  assert.equal(validateBasePair('T', 'A'), true);
  assert.equal(validateBasePair('G', 'C'), true);
  assert.equal(validateBasePair('C', 'G'), true);
  assert.equal(validateBasePair('A', 'C'), false);
  assert.equal(validateBasePair('T', 'G'), false);
  assert.equal(validateBasePair('A', 'A'), false);
});

test('calculateOsmosisDynamics identifies hypotonic, isotonic, and hypertonic conditions', () => {
  // Isotonic
  const iso = calculateOsmosisDynamics(5, 5);
  assert.equal(iso.tonicity, 'isotonic');
  assert.equal(iso.flowDirection, 'equilibrium');

  // Hypotonic outside (e.g. 1% outside, 5% inside)
  const hypo = calculateOsmosisDynamics(1, 5);
  assert.equal(hypo.tonicity, 'hypotonic');
  assert.equal(hypo.flowDirection, 'inward');
  assert.ok(hypo.relativeVolumeDelta > 0);

  // Hypertonic outside (e.g. 10% outside, 5% inside)
  const hyper = calculateOsmosisDynamics(10, 5);
  assert.equal(hyper.tonicity, 'hypertonic');
  assert.equal(hyper.flowDirection, 'outward');
  assert.ok(hyper.relativeVolumeDelta < 0);
});

test('calculateUserLevel calculates levels and thresholds accurately', () => {
  const l1 = calculateUserLevel(50);
  assert.equal(l1.level, 1);
  assert.equal(l1.title, 'Novice Naturalist');

  const l2 = calculateUserLevel(150);
  assert.equal(l2.level, 2);
  assert.equal(l2.title, 'Apprentice Biologist');

  const l4 = calculateUserLevel(600);
  assert.equal(l4.level, 4);
  assert.equal(l4.title, 'Genetics Scholar');
});
