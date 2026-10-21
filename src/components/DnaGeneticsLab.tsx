import React, { useState, useEffect, useRef } from 'react';
import { UserProgress } from '../types/biology';
import {
  calculatePunnettSquare,
  validateBasePair,
  getComplementaryDnaStrand,
} from '../utils/biologyLogic';
import { sound } from '../utils/soundEffects';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Dna,
  GitBranch,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface DnaGeneticsLabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const DnaGeneticsLab: React.FC<DnaGeneticsLabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'helix' | 'replication' | 'matching' | 'punnett'>('helix');

  // Helix Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);

  // Replication Walkthrough Step
  const [replicationStep, setReplicationStep] = useState(0);

  // DNA Sequence Matching Game State
  const templateStrands = [
    'ATGCCAT',
    'TACGGTA',
    'GCATTCG',
    'CGTAAGC',
  ];
  const [currentStrandIndex, setCurrentStrandIndex] = useState(0);
  const templateStrand = templateStrands[currentStrandIndex];
  const [userMatchedBases, setUserMatchedBases] = useState<string[]>([]);
  const [matchFeedback, setMatchFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Punnett Square State
  const [traitName, setTraitName] = useState('Eye Color (Brown B vs Blue b)');
  const [parent1Genotype, setParent1Genotype] = useState('Bb');
  const [parent2Genotype, setParent2Genotype] = useState('Bb');

  // DNA Canvas Animation Loop
  useEffect(() => {
    if (activeTab !== 'helix') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const numRungs = 24;
      const rungSpacing = 16;
      const startY = centerY - (numRungs * rungSpacing) / 2;
      const helixRadius = 75;

      const baseColors: Record<string, string> = {
        A: '#10b981', // Emerald
        T: '#f43f5e', // Rose
        G: '#f59e0b', // Amber
        C: '#06b6d4', // Cyan
      };

      const sequence = ['A', 'T', 'G', 'C', 'T', 'A', 'C', 'G', 'A', 'G', 'T', 'C', 'A', 'T', 'G', 'C', 'T', 'A', 'C', 'G', 'A', 'G', 'T', 'C'];
      const compSequence = ['T', 'A', 'C', 'G', 'A', 'T', 'G', 'C', 'T', 'C', 'A', 'G', 'T', 'A', 'C', 'G', 'A', 'T', 'G', 'C', 'T', 'C', 'A', 'G'];

      // Draw Double Helix rungs
      for (let i = 0; i < numRungs; i++) {
        const y = startY + i * rungSpacing;
        const currentAngle = angle + i * 0.32;

        const x1 = centerX + Math.cos(currentAngle) * helixRadius;
        const z1 = Math.sin(currentAngle); // Depth (-1 to 1)

        const x2 = centerX + Math.cos(currentAngle + Math.PI) * helixRadius;
        const z2 = Math.sin(currentAngle + Math.PI);

        // Alpha & scale based on z-depth
        const scale1 = 0.8 + (z1 + 1) * 0.2;
        const scale2 = 0.8 + (z2 + 1) * 0.2;

        // Hydrogen bonds connecting rung
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Left base sphere
        const base1 = sequence[i % sequence.length];
        ctx.beginPath();
        ctx.arc(x1, y, 7 * scale1, 0, Math.PI * 2);
        ctx.fillStyle = baseColors[base1] || '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Right base sphere
        const base2 = compSequence[i % compSequence.length];
        ctx.beginPath();
        ctx.arc(x2, y, 7 * scale2, 0, Math.PI * 2);
        ctx.fillStyle = baseColors[base2] || '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw backbone ribbon links
        if (i > 0) {
          const prevY = startY + (i - 1) * rungSpacing;
          const prevAngle = angle + (i - 1) * 0.32;
          const prevX1 = centerX + Math.cos(prevAngle) * helixRadius;
          const prevX2 = centerX + Math.cos(prevAngle + Math.PI) * helixRadius;

          ctx.beginPath();
          ctx.moveTo(prevX1, prevY);
          ctx.lineTo(x1, y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(prevX2, prevY);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      if (isAnimating) {
        angle += 0.02 * rotationSpeed;
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, isAnimating, rotationSpeed]);

  // Handle Base Click in Matching Game
  const handleSelectMatchingBase = (base: string) => {
    sound.playClick();
    if (userMatchedBases.length >= templateStrand.length) return;

    const nextBases = [...userMatchedBases, base];
    setUserMatchedBases(nextBases);

    // If completed full sequence, validate!
    if (nextBases.length === templateStrand.length) {
      const correctStrand = getComplementaryDnaStrand(templateStrand);
      const isAllCorrect = nextBases.join('') === correctStrand;

      if (isAllCorrect) {
        sound.playSuccess();
        setMatchFeedback('correct');
        onUpdateProgress((prev) => {
          const unlocked = [...prev.unlockedAchievements];
          if (!unlocked.includes('double_helix')) {
            unlocked.push('double_helix');
          }
          return {
            ...prev,
            xp: prev.xp + 40,
            unlockedAchievements: unlocked,
            topicProgress: { ...prev.topicProgress, dna: Math.min(100, (prev.topicProgress.dna || 0) + 25) },
            lastVisitedSection: 'dna',
          };
        });
      } else {
        sound.playError();
        setMatchFeedback('incorrect');
      }
    }
  };

  const handleResetMatching = () => {
    sound.playClick();
    setUserMatchedBases([]);
    setMatchFeedback(null);
  };

  const handleNextStrand = () => {
    sound.playClick();
    setUserMatchedBases([]);
    setMatchFeedback(null);
    setCurrentStrandIndex((idx) => (idx + 1) % templateStrands.length);
  };

  // Calculate Punnett Square
  let punnettData;
  try {
    punnettData = calculatePunnettSquare(parent1Genotype, parent2Genotype);
  } catch {
    punnettData = calculatePunnettSquare('Bb', 'Bb');
  }

  const replicationSteps = [
    {
      title: 'Step 1: Helicase Unwinds the Double Helix',
      description:
        'The enzyme DNA Helicase breaks the weak hydrogen bonds holding complementary nitrogenous bases together, unzipping the double helix into two single template strands and forming the replication fork.',
      enzyme: 'DNA Helicase',
      badge: 'Unzipping Phase',
    },
    {
      title: 'Step 2: RNA Primase Lays Primers',
      description:
        'DNA Polymerase cannot start synthesis from scratch. RNA Primase creates short RNA primer sequences to provide a 3\'-OH group where DNA Polymerase can begin adding nucleotides.',
      enzyme: 'RNA Primase',
      badge: 'Initiation Phase',
    },
    {
      title: 'Step 3: DNA Polymerase III Synthesizes New Strands',
      description:
        'DNA Polymerase reads the template strand in the 3\' to 5\' direction and synthesizes new DNA continuously on the Leading Strand and discontinuously in short Okazaki fragments on the Lagging Strand.',
      enzyme: 'DNA Polymerase III',
      badge: 'Elongation Phase',
    },
    {
      title: 'Step 4: DNA Ligase Seals the Strands',
      description:
        'DNA Polymerase I replaces the RNA primers with DNA nucleotides, and DNA Ligase seals the nicks in the phosphodiester sugar-phosphate backbone, producing two identical sister chromatid double helices.',
      enzyme: 'DNA Ligase',
      badge: 'Termination Phase',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header and Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>DNA & Genetics Lab</span>
            <span className="text-xs font-mono font-medium text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
              Molecular Genetics
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore the double helix, practice complementary base pairing, trace replication forks, and calculate inheritance.
          </p>
        </div>

        {/* Lab Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('helix');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'helix'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Double Helix</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('replication');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'replication'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Replication</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('matching');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'matching'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Base Matching</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('punnett');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'punnett'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Punnett Square</span>
          </button>
        </div>
      </div>

      {/* 1. DOUBLE HELIX TAB */}
      {activeTab === 'helix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Canvas Stage (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800 mb-2">
              <span className="font-mono text-teal-400 font-semibold">3D Double Helix Model</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-200 flex items-center gap-1"
                >
                  {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAnimating ? 'Pause' : 'Rotate'}</span>
                </button>
                <button
                  onClick={() => setRotationSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-mono"
                >
                  {rotationSpeed}x Speed
                </button>
              </div>
            </div>

            {/* Helix Canvas */}
            <div className="w-full max-w-[420px] aspect-square relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={420}
                height={420}
                className="w-full h-full select-none"
              />
            </div>

            {/* Color Legend */}
            <div className="w-full mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-mono">Adenine (A)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-300 font-mono">Thymine (T)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-300 font-mono">Guanine (G)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-300 font-mono">Cytosine (C)</span>
              </div>
            </div>
          </div>

          {/* DNA Mechanics & Rules Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-semibold">
                  Watson-Crick Model (1953)
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Complementary Base Pairing
                </h2>
              </div>

              {/* Pairing Rules Card */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">Adenine (A)</span>
                    <span className="text-slate-500 font-mono">·· 2 H-Bonds ··</span>
                    <span className="font-mono font-bold text-rose-400">Thymine (T)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Purine + Pyrimidine</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">Guanine (G)</span>
                    <span className="text-slate-500 font-mono">··· 3 H-Bonds ···</span>
                    <span className="font-mono font-bold text-cyan-400">Cytosine (C)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Purine + Pyrimidine</span>
                </div>
              </div>

              {/* DNA Concepts */}
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>Antiparallel Strands:</strong> One strand runs in the 5' to 3' direction, while the opposite complementary strand runs 3' to 5'.
                </p>
                <p>
                  <strong>Sugar-Phosphate Backbone:</strong> Alternating deoxyribose sugar and phosphate groups joined by strong covalent phosphodiester bonds.
                </p>
                <p>
                  <strong>Genes & Chromosomes:</strong> A gene is a functional unit of DNA coding for a polypeptide; 23 pairs of human chromosomes pack over 3 billion base pairs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chargaff's Rules</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In any double-stranded DNA sample, the percentage of Adenine always equals Thymine (%A = %T), and Guanine equals Cytosine (%G = %C).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REPLICATION FORK WALKTHROUGH */}
      {activeTab === 'replication' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-teal-400 font-semibold">
                Semiconservative Replication
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                Step-by-Step DNA Replication
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReplicationStep((s) => Math.max(0, s - 1))}
                disabled={replicationStep === 0}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded"
              >
                Previous Step
              </button>
              <span className="text-xs font-mono text-slate-400">
                {replicationStep + 1} / {replicationSteps.length}
              </span>
              <button
                onClick={() => setReplicationStep((s) => Math.min(replicationSteps.length - 1, s + 1))}
                disabled={replicationStep === replicationSteps.length - 1}
                className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium rounded"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Active Step Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-violet-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                {replicationSteps[replicationStep].badge}
              </span>
              <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                Key Enzyme: {replicationSteps[replicationStep].enzyme}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {replicationSteps[replicationStep].title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {replicationSteps[replicationStep].description}
            </p>
          </div>

          {/* Diagram of Replication Fork */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <svg viewBox="0 0 600 220" className="w-full max-w-2xl h-auto select-none">
              {/* Unwound Double Helix on Left */}
              <path d="M 50 60 L 220 60 Q 280 60 350 30 L 550 30" fill="none" stroke="#38bdf8" strokeWidth="3" />
              <path d="M 50 160 L 220 160 Q 280 160 350 190 L 550 190" fill="none" stroke="#818cf8" strokeWidth="3" />

              {/* Hydrogen Bonds before fork */}
              <line x1="80" y1="60" x2="80" y2="160" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="120" y1="60" x2="120" y2="160" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="160" y1="60" x2="160" y2="160" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="200" y1="60" x2="200" y2="160" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Helicase Wedge */}
              <polygon points="230,110 270,75 270,145" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <text x="250" y="114" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">
                Helicase
              </text>

              {/* Leading Strand Synthesis (top) */}
              <path d="M 280 42 L 530 42" fill="none" stroke="#10b981" strokeWidth="3.5" />
              <text x="400" y="24" fill="#38bdf8" fontSize="11" fontWeight="bold">
                Leading Strand (Continuous 5' → 3')
              </text>

              {/* Lagging Strand Synthesis with Okazaki Fragments (bottom) */}
              <path d="M 320 178 L 380 178" fill="none" stroke="#f43f5e" strokeWidth="3.5" />
              <path d="M 410 178 L 470 178" fill="none" stroke="#f43f5e" strokeWidth="3.5" />
              <text x="400" y="208" fill="#818cf8" fontSize="11" fontWeight="bold">
                Lagging Strand (Okazaki Fragments)
              </text>

              {/* DNA Polymerase Enzyme Blocks */}
              <circle cx="360" cy="42" r="12" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
              <circle cx="440" cy="178" r="12" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
            </svg>
            <p className="text-[11px] text-slate-400 mt-2">
              DNA Polymerase (pink) moves continuously on the leading strand and discontinuously on the lagging strand.
            </p>
          </div>
        </div>
      )}

      {/* 3. SEQUENCE MATCHING ACTIVITY */}
      {activeTab === 'matching' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-teal-400 font-semibold">
                Interactive Sequence Puzzle
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                DNA Base-Pair Matching Game
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Construct the complementary DNA strand for the template sequence below. Remember: A pairs with T, and G pairs with C!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetMatching}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleNextStrand}
                className="px-3 py-1.5 text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded"
              >
                New Sequence
              </button>
            </div>
          </div>

          {/* Template Strand Display */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400">Template Strand (5' → 3')</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {templateStrand.split('').map((base, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-14 rounded-lg bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center font-mono font-bold text-lg text-white shrink-0"
                  >
                    <span>{base}</span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      {base === 'A' || base === 'T' ? '2 bonds' : '3 bonds'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Complementary Strand */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-teal-400">Your Complementary Strand (3' → 5')</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 min-h-[56px]">
                {templateStrand.split('').map((_, idx) => {
                  const base = userMatchedBases[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-lg shrink-0 transition-all ${
                        base
                          ? 'bg-teal-950/80 border-teal-400 text-teal-300'
                          : 'bg-slate-900 border-dashed border-slate-700 text-slate-600'
                      }`}
                    >
                      {base || '?'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          {matchFeedback && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                matchFeedback === 'correct'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              }`}
            >
              {matchFeedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-sm">Perfect match! (+40 XP awarded)</p>
                    <p>Every nucleotide correctly follows Watson-Crick base-pairing (A-T and G-C).</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-sm">Mismatch detected!</p>
                    <p>Double check your sequence: Adenine (A) always pairs with Thymine (T), and Guanine (G) always pairs with Cytosine (C).</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Base Selection Palette */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400">Click a base to append to your strand:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleSelectMatchingBase('A')}
                className="p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center justify-center gap-2 transition-transform hover:scale-102"
              >
                <span>Adenine (A)</span>
              </button>
              <button
                onClick={() => handleSelectMatchingBase('T')}
                className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono font-bold flex items-center justify-center gap-2 transition-transform hover:scale-102"
              >
                <span>Thymine (T)</span>
              </button>
              <button
                onClick={() => handleSelectMatchingBase('G')}
                className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center gap-2 transition-transform hover:scale-102"
              >
                <span>Guanine (G)</span>
              </button>
              <button
                onClick={() => handleSelectMatchingBase('C')}
                className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center justify-center gap-2 transition-transform hover:scale-102"
              >
                <span>Cytosine (C)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PUNNETT SQUARE INHERITANCE CALCULATOR */}
      {activeTab === 'punnett' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Punnett Matrix Stage (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-violet-400 font-semibold">
                  Mendelian Monohybrid Cross
                </span>
                <h2 className="text-2xl font-bold text-white mt-0.5">
                  Punnett Square Calculator
                </h2>
              </div>
            </div>

            {/* Parent Genotype Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Parent 1 Genotype (Maternal)
                </label>
                <div className="flex items-center gap-2">
                  {['BB', 'Bb', 'bb'].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        sound.playClick();
                        setParent1Genotype(g);
                      }}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                        parent1Genotype === g
                          ? 'bg-violet-600 border-violet-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Parent 2 Genotype (Paternal)
                </label>
                <div className="flex items-center gap-2">
                  {['BB', 'Bb', 'bb'].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        sound.playClick();
                        setParent2Genotype(g);
                      }}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                        parent2Genotype === g
                          ? 'bg-violet-600 border-violet-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2x2 Punnett Grid Rendering */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <div className="grid grid-cols-3 gap-2 text-center max-w-xs w-full">
                {/* Empty corner */}
                <div className="p-2 text-xs text-slate-600 font-mono">P1 \ P2</div>
                <div className="p-2 text-sm font-mono font-bold text-violet-400 bg-slate-900 rounded-lg border border-slate-800">
                  {parent2Genotype[0]}
                </div>
                <div className="p-2 text-sm font-mono font-bold text-violet-400 bg-slate-900 rounded-lg border border-slate-800">
                  {parent2Genotype[1]}
                </div>

                {/* Row 1 */}
                <div className="p-2 text-sm font-mono font-bold text-cyan-400 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center">
                  {parent1Genotype[0]}
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border-2 border-violet-500/40 text-center font-mono font-bold text-lg text-white shadow-sm">
                  {punnettData.matrix[0]}
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border-2 border-violet-500/40 text-center font-mono font-bold text-lg text-white shadow-sm">
                  {punnettData.matrix[1]}
                </div>

                {/* Row 2 */}
                <div className="p-2 text-sm font-mono font-bold text-cyan-400 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center">
                  {parent1Genotype[1]}
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border-2 border-violet-500/40 text-center font-mono font-bold text-lg text-white shadow-sm">
                  {punnettData.matrix[2]}
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border-2 border-violet-500/40 text-center font-mono font-bold text-lg text-white shadow-sm">
                  {punnettData.matrix[3]}
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Probabilities & Phenotype Ratios Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                  Statistical Outcomes
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Offspring Frequencies
                </h2>
              </div>

              {/* Genotype Breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Genotypic Ratio
                </h3>
                <div className="space-y-1.5 text-xs font-mono">
                  {Object.entries(punnettData.genotypeFrequencies).map(([geno, info]) => (
                    <div
                      key={geno}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <span className="font-bold text-white">{geno}</span>
                      <span className="text-slate-400">
                        {info.count}/4 ({info.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phenotype Breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Phenotypic Probabilities
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-300">Dominant Trait [B_]</p>
                      <p className="text-[11px] text-emerald-400/80">E.g., Brown Eyes</p>
                    </div>
                    <span className="font-mono text-base font-bold text-emerald-300">
                      {punnettData.phenotypeFrequencies.dominant.percentage}%
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-300">Recessive Trait [bb]</p>
                      <p className="text-[11px] text-blue-400/80">E.g., Blue Eyes</p>
                    </div>
                    <span className="font-mono text-base font-bold text-blue-300">
                      {punnettData.phenotypeFrequencies.recessive.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Trait Presets */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400">Example Classical Traits:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setTraitName('Eye Color (Brown B vs Blue b)');
                      setParent1Genotype('Bb');
                      setParent2Genotype('Bb');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Eye Color (Bb x Bb)
                  </button>
                  <button
                    onClick={() => {
                      setTraitName('Pea Plant Height (Tall T vs Short t)');
                      setParent1Genotype('BB');
                      setParent2Genotype('bb');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Mendel's F1 Cross (BB x bb)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
