/**
 * Pure biology calculation and rule-validation utilities
 */

export interface PunnettResult {
  matrix: [string, string, string, string]; // [p1a1+p2a1, p1a1+p2a2, p1a2+p2a1, p1a2+p2a2]
  genotypeFrequencies: Record<string, { count: number; percentage: number }>;
  phenotypeFrequencies: {
    dominant: { count: number; percentage: number };
    recessive: { count: number; percentage: number };
  };
}

/**
 * Standardizes a 2-allele genotype string so uppercase (dominant) appears first, e.g. "bB" -> "Bb"
 */
export function normalizeGenotype(alleles: string): string {
  if (alleles.length !== 2) return alleles;
  const a = alleles[0];
  const b = alleles[1];
  // If first is lowercase and second is uppercase, swap them
  if (a === a.toLowerCase() && b === b.toUpperCase()) {
    return b + a;
  }
  return alleles;
}

/**
 * Calculates a standard monohybrid Punnett square for two 2-allele parents
 */
export function calculatePunnettSquare(parent1: string, parent2: string): PunnettResult {
  const p1 = parent1.trim();
  const p2 = parent2.trim();

  if (p1.length !== 2 || p2.length !== 2) {
    throw new Error('Both parents must have exactly 2 alleles (e.g. "Bb")');
  }

  const p1a1 = p1[0];
  const p1a2 = p1[1];
  const p2a1 = p2[0];
  const p2a2 = p2[1];

  // Raw combinations: [Row1Col1, Row1Col2, Row2Col1, Row2Col2]
  const matrix: [string, string, string, string] = [
    normalizeGenotype(p1a1 + p2a1),
    normalizeGenotype(p1a1 + p2a2),
    normalizeGenotype(p1a2 + p2a1),
    normalizeGenotype(p1a2 + p2a2),
  ];

  const genotypeCounts: Record<string, number> = {};
  let dominantCount = 0;
  let recessiveCount = 0;

  for (const geno of matrix) {
    genotypeCounts[geno] = (genotypeCounts[geno] || 0) + 1;
    // Dominant if at least one uppercase letter exists
    const hasDominant = geno.split('').some((char) => char === char.toUpperCase() && char !== char.toLowerCase());
    if (hasDominant) {
      dominantCount++;
    } else {
      recessiveCount++;
    }
  }

  const genotypeFrequencies: Record<string, { count: number; percentage: number }> = {};
  for (const [geno, count] of Object.entries(genotypeCounts)) {
    genotypeFrequencies[geno] = {
      count,
      percentage: (count / 4) * 100,
    };
  }

  return {
    matrix,
    genotypeFrequencies,
    phenotypeFrequencies: {
      dominant: {
        count: dominantCount,
        percentage: (dominantCount / 4) * 100,
      },
      recessive: {
        count: recessiveCount,
        percentage: (recessiveCount / 4) * 100,
      },
    },
  };
}

/**
 * Generates the complementary DNA strand following canonical base-pairing rules:
 * A <-> T, C <-> G
 */
export function getComplementaryDnaStrand(sequence: string): string {
  const compMap: Record<string, string> = {
    A: 'T',
    T: 'A',
    C: 'G',
    G: 'C',
    a: 't',
    t: 'a',
    c: 'g',
    g: 'c',
  };

  return sequence
    .split('')
    .map((char) => {
      const comp = compMap[char];
      if (!comp) {
        throw new Error(`Invalid nucleotide base: "${char}". Must be A, T, C, or G.`);
      }
      return comp;
    })
    .join('');
}

/**
 * Validates whether two nucleotide bases correctly pair
 */
export function validateBasePair(base1: string, base2: string): boolean {
  const b1 = base1.toUpperCase();
  const b2 = base2.toUpperCase();
  return (
    (b1 === 'A' && b2 === 'T') ||
    (b1 === 'T' && b2 === 'A') ||
    (b1 === 'C' && b2 === 'G') ||
    (b1 === 'G' && b2 === 'C')
  );
}

export type TonicityType = 'hypotonic' | 'isotonic' | 'hypertonic';

export interface OsmosisState {
  tonicity: TonicityType;
  flowDirection: 'inward' | 'equilibrium' | 'outward';
  cellOutcome: 'swelling/lysis' | 'normal/dynamic equilibrium' | 'shriveling/plasmolysis';
  waterMovementDescription: string;
  relativeVolumeDelta: number; // e.g. +20%, 0%, -20%
}

/**
 * Calculates osmosis state given external and internal solute concentrations (%)
 */
export function calculateOsmosisDynamics(soluteOutside: number, soluteInside: number): OsmosisState {
  const diff = soluteOutside - soluteInside;

  if (Math.abs(diff) < 0.1) {
    return {
      tonicity: 'isotonic',
      flowDirection: 'equilibrium',
      cellOutcome: 'normal/dynamic equilibrium',
      waterMovementDescription: 'Water enters and leaves the cell at equal rates. Cell maintains normal osmotic pressure and volume.',
      relativeVolumeDelta: 0,
    };
  }

  if (diff < 0) {
    // Solute outside is lower -> water concentration outside is higher -> water flows IN
    const swellPercent = Math.min(30, Math.round(Math.abs(diff) * 2.5));
    return {
      tonicity: 'hypotonic',
      flowDirection: 'inward',
      cellOutcome: 'swelling/lysis',
      waterMovementDescription: 'External solution has lower solute concentration. Osmotic gradient drives water INTO the cell, causing cell expansion and potential lysis in animal cells or high turgor pressure in plant cells.',
      relativeVolumeDelta: swellPercent,
    };
  }

  // Solute outside is higher -> water concentration outside is lower -> water flows OUT
  const shrinkPercent = -Math.min(30, Math.round(diff * 2.5));
  return {
    tonicity: 'hypertonic',
    flowDirection: 'outward',
    cellOutcome: 'shriveling/plasmolysis',
    waterMovementDescription: 'External solution has higher solute concentration. Water moves OUT of the cell down its water potential gradient, causing animal cells to crenate and plant cell membranes to pull away from the cell wall (plasmolysis).',
    relativeVolumeDelta: shrinkPercent,
  };
}

export interface UserLevelInfo {
  level: number;
  title: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

const LEVEL_THRESHOLDS = [
  { level: 1, xpNeeded: 0, title: 'Novice Naturalist' },
  { level: 2, xpNeeded: 100, title: 'Apprentice Biologist' },
  { level: 3, xpNeeded: 250, title: 'Cellular Specialist' },
  { level: 4, xpNeeded: 500, title: 'Genetics Scholar' },
  { level: 5, xpNeeded: 850, title: 'Master Anatomist' },
  { level: 6, xpNeeded: 1300, title: 'Chief Bioscientist' },
];

export function calculateUserLevel(xp: number): UserLevelInfo {
  let currentTier = LEVEL_THRESHOLDS[0];
  let nextTier = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xpNeeded) {
      currentTier = LEVEL_THRESHOLDS[i];
      nextTier = LEVEL_THRESHOLDS[i + 1] || { level: currentTier.level + 1, xpNeeded: currentTier.xpNeeded + 600, title: 'Elite Laureate' };
      break;
    }
  }

  const range = nextTier.xpNeeded - currentTier.xpNeeded;
  const progressInsideTier = Math.max(0, xp - currentTier.xpNeeded);
  const progressPercent = Math.min(100, Math.round((progressInsideTier / range) * 100));

  return {
    level: currentTier.level,
    title: currentTier.title,
    currentXp: xp,
    nextLevelXp: nextTier.xpNeeded,
    progressPercent,
  };
}
