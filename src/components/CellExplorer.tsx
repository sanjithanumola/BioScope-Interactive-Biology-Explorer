import React, { useState } from 'react';
import { ORGANELLES } from '../data/biologyData';
import { OrganelleData, UserProgress } from '../types/biology';
import { sound } from '../utils/soundEffects';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Compass,
  ArrowRight,
  ArrowLeft,
  Columns,
  Trophy,
} from 'lucide-react';

interface CellExplorerProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const CellExplorer: React.FC<CellExplorerProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [cellType, setCellType] = useState<'animal' | 'plant'>('animal');
  const [selectedOrganelleId, setSelectedOrganelleId] = useState<string>('nucleus');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'explore' | 'compare' | 'tour' | 'quiz'>('explore');

  // Tour state
  const [tourStep, setTourStep] = useState<number>(0);

  // Quiz state
  const [targetQuizOrganelle, setTargetQuizOrganelle] = useState<OrganelleData | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const visibleOrganelles = ORGANELLES.filter(
    (o) => o.foundIn === 'both' || o.foundIn === cellType
  );

  const selectedOrganelle =
    ORGANELLES.find((o) => o.id === selectedOrganelleId) || ORGANELLES[3];

  const handleSelectOrganelle = (organelle: OrganelleData) => {
    sound.playSelect();
    setSelectedOrganelleId(organelle.id);

    // If currently in quiz challenge mode, check answer!
    if (viewMode === 'quiz' && targetQuizOrganelle) {
      if (organelle.id === targetQuizOrganelle.id) {
        sound.playSuccess();
        const nextScore = quizScore + 1;
        setQuizScore(nextScore);
        setQuizFeedback(`Correct! You accurately identified the ${organelle.name}.`);

        // Award XP
        onUpdateProgress((prev) => ({
          ...prev,
          xp: prev.xp + 25,
          lastVisitedSection: 'cell',
        }));

        // Pick next random organelle after 1.5s
        setTimeout(() => {
          pickRandomQuizTarget();
        }, 1200);
      } else {
        sound.playError();
        setQuizFeedback(`That was the ${organelle.name}. Try locating the ${targetQuizOrganelle.name}!`);
      }
      return;
    }

    // Standard explore tracking
    onUpdateProgress((prev) => {
      const completed = { ...prev.completedTopics, [`organelle_${organelle.id}`]: true };
      const count = ORGANELLES.filter((o) => completed[`organelle_${o.id}`]).length;
      const progressPercent = Math.round((count / ORGANELLES.length) * 100);

      const unlocked = [...prev.unlockedAchievements];
      let xpBonus = 0;
      if (!unlocked.includes('cytologist')) {
        unlocked.push('cytologist');
        xpBonus += 80;
      }

      return {
        ...prev,
        xp: prev.xp + 10 + xpBonus,
        completedTopics: completed,
        topicProgress: {
          ...prev.topicProgress,
          cell: progressPercent,
        },
        unlockedAchievements: unlocked,
        lastVisitedSection: 'cell',
      };
    });
  };

  const pickRandomQuizTarget = () => {
    setQuizFeedback(null);
    const pool = visibleOrganelles.filter((o) => o.id !== 'cytoplasm' && o.id !== 'membrane');
    const target = pool[Math.floor(Math.random() * pool.length)];
    setTargetQuizOrganelle(target);
  };

  const startQuizMode = () => {
    sound.playClick();
    setViewMode('quiz');
    setQuizScore(0);
    pickRandomQuizTarget();
  };

  // Guided Tour outside-in sequence
  const tourSequence: { id: string; stepTitle: string; narration: string }[] =
    cellType === 'animal'
      ? [
          {
            id: 'membrane',
            stepTitle: 'Step 1: The Outer Border',
            narration:
              'The fluid phospholipid bilayer regulates molecular traffic, transport proteins, and receptor signaling.',
          },
          {
            id: 'cytoplasm',
            stepTitle: 'Step 2: The Cytosol Matrix',
            narration:
              'The fluid matrix suspending organelles, holding structural microtubules, and carrying out glycolysis.',
          },
          {
            id: 'nucleus',
            stepTitle: 'Step 3: The Command Center',
            narration:
              'The double-membrane enclosed nucleus safeguards the cell’s DNA library and orchestrates gene expression.',
          },
          {
            id: 'rough_er',
            stepTitle: 'Step 4: Protein Assembly Lines',
            narration:
              'Rough ER and ribosomes translate mRNA blueprints into functional folding polypeptide proteins.',
          },
          {
            id: 'golgi',
            stepTitle: 'Step 5: Sorting & Distribution',
            narration:
              'The Golgi apparatus modifies, sorts, and packages proteins into vesicles for delivery.',
          },
          {
            id: 'mitochondria',
            stepTitle: 'Step 6: The Energy Powerhouse',
            narration:
              'Mitochondria burn pyruvate via the Krebs cycle and oxidative phosphorylation to synthesize ATP.',
          },
          {
            id: 'lysosome',
            stepTitle: 'Step 7: Cellular Recycling',
            narration:
              'Acidic hydrolytic enzymes break down cellular debris, foreign pathogens, and worn-out components.',
          },
        ]
      : [
          {
            id: 'wall',
            stepTitle: 'Step 1: Rigid Cellulose Wall',
            narration:
              'Tough cellulose microfibrils provide tensile strength, withstand turgor pressure, and protect plant cells.',
          },
          {
            id: 'membrane',
            stepTitle: 'Step 2: Plasma Membrane',
            narration:
              'Just beneath the wall, the selective semipermeable membrane controls solute exchange.',
          },
          {
            id: 'vacuole',
            stepTitle: 'Step 3: Large Central Vacuole',
            narration:
              'Occupying up to 90% of plant volume, this water compartment creates turgor pressure preventing wilting.',
          },
          {
            id: 'chloroplast',
            stepTitle: 'Step 4: Solar Photosynthesis',
            narration:
              'Chlorophyll thylakoids capture photon energy to convert $CO_2$ and water into glucose and oxygen.',
          },
          {
            id: 'nucleus',
            stepTitle: 'Step 5: Genetic Master Controller',
            narration:
              'Encloses plant genetic chromatin to direct cellular differentiation and protein synthesis.',
          },
          {
            id: 'mitochondria',
            stepTitle: 'Step 6: Respiration & ATP',
            narration:
              'Plants respire too! Mitochondria oxidize the sugars made by chloroplasts to provide ATP at night.',
          },
        ];

  const handleNextTour = () => {
    sound.playClick();
    if (tourStep < tourSequence.length - 1) {
      const next = tourStep + 1;
      setTourStep(next);
      setSelectedOrganelleId(tourSequence[next].id);
    }
  };

  const handlePrevTour = () => {
    sound.playClick();
    if (tourStep > 0) {
      const prev = tourStep - 1;
      setTourStep(prev);
      setSelectedOrganelleId(tourSequence[prev].id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header & Modes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Cellular Explorer</span>
            <span className="text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {cellType === 'animal' ? 'Animal Cell Mode' : 'Plant Cell Mode'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Investigate microscopic eukaryotic architecture, compare organelles, and examine ATP and protein synthesis.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('explore');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              viewMode === 'explore'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explore Cell
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('compare');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'compare'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('tour');
              setTourStep(0);
              setSelectedOrganelleId(tourSequence[0].id);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'tour'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Guided Tour</span>
          </button>
          <button
            onClick={startQuizMode}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'quiz'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>ID Challenge</span>
          </button>
        </div>
      </div>

      {/* Switcher Bar: Animal vs Plant */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setCellType('animal');
              if (selectedOrganelleId === 'wall' || selectedOrganelleId === 'chloroplast' || selectedOrganelleId === 'vacuole') {
                setSelectedOrganelleId('nucleus');
              }
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
              cellType === 'animal'
                ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Animal Cell (Spherical)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCellType('plant');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
              cellType === 'plant'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Plant Cell (Rigid Cellulose)
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-slate-400">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.2).toFixed(1))))}
            className="p-1.5 hover:text-white rounded"
            title="Zoom out"
            aria-label="Zoom out cell view"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-xs font-mono">{zoomLevel}x</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, Number((z + 0.2).toFixed(1))))}
            className="p-1.5 hover:text-white rounded"
            title="Zoom in"
            aria-label="Zoom in cell view"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:text-white rounded border-l border-slate-800"
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Guided Tour Banner */}
      {viewMode === 'tour' && (
        <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-teal-400">
              {tourSequence[tourStep].stepTitle}
            </span>
            <p className="text-sm text-slate-200">
              {tourSequence[tourStep].narration}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrevTour}
              disabled={tourStep === 0}
              className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <span className="text-xs font-mono text-slate-400">
              {tourStep + 1}/{tourSequence.length}
            </span>
            <button
              onClick={handleNextTour}
              disabled={tourStep === tourSequence.length - 1}
              className="px-3 py-1.5 text-xs rounded bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-semibold flex items-center gap-1"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quiz Challenge Banner */}
      {viewMode === 'quiz' && targetQuizOrganelle && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                Target Challenge
              </span>
              <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                Score: {quizScore}
              </span>
            </div>
            <p className="text-sm font-bold text-white">
              Can you find and click the: <span className="text-amber-400 underline">{targetQuizOrganelle.name}</span>?
            </p>
            {quizFeedback && (
              <p className="text-xs text-amber-200 font-medium">{quizFeedback}</p>
            )}
          </div>
          <button
            onClick={pickRandomQuizTarget}
            className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0"
          >
            Skip Target
          </button>
        </div>
      )}

      {/* Comparison View Table Mode */}
      {viewMode === 'compare' ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">Plant vs. Animal Cell Comparison</h2>
            <p className="text-xs text-slate-400 mt-1">
              Structural and functional distinctions between plant and animal eukaryotic cells.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Organelle / Feature</th>
                  <th className="py-3 px-4 font-semibold text-teal-400">Animal Cell</th>
                  <th className="py-3 px-4 font-semibold text-emerald-400">Plant Cell</th>
                  <th className="py-3 px-4 font-semibold">Biological Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Outer Boundary</td>
                  <td className="py-3 px-4">Flexible Plasma Membrane only</td>
                  <td className="py-3 px-4 font-medium text-emerald-300">Rigid Cellulose Cell Wall + Membrane</td>
                  <td className="py-3 px-4 text-slate-400">Cell wall provides tensile strength and prevents bursting in hypotonic water.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Energy Conversion</td>
                  <td className="py-3 px-4">Mitochondria only</td>
                  <td className="py-3 px-4 font-medium text-emerald-300">Both Chloroplasts AND Mitochondria</td>
                  <td className="py-3 px-4 text-slate-400">Chloroplasts create sugars from sunlight; mitochondria oxidize sugars to make ATP.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Vacuoles</td>
                  <td className="py-3 px-4">Small, temporary vesicles</td>
                  <td className="py-3 px-4 font-medium text-emerald-300">Large Central Vacuole (up to 90% volume)</td>
                  <td className="py-3 px-4 text-slate-400">Stores water and maintains hydrostatic turgor pressure that keeps stems rigid.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Lysosomes</td>
                  <td className="py-3 px-4 text-teal-300">Prominent & abundant</td>
                  <td className="py-3 px-4 text-slate-500">Rare (Central vacuole carries out digestion)</td>
                  <td className="py-3 px-4 text-slate-400">Hydrolytic recycling of organelles and engulfed foreign microbes.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Shape & Geometry</td>
                  <td className="py-3 px-4">Round, irregular, flexible</td>
                  <td className="py-3 px-4">Rectangular, fixed polygonal prism</td>
                  <td className="py-3 px-4 text-slate-400">Rigid walls stack tightly like masonry bricks to support plant architecture.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Regular Stage + Concept Deck */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Cell Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>{cellType === 'animal' ? 'Animal Cytological Model' : 'Plant Cytological Model'}</span>
              </span>
              <span className="text-slate-500">
                Selected: <strong className="text-white">{selectedOrganelle.name}</strong>
              </span>
            </div>

            {/* SVG Cell Diagram Viewport */}
            <div className="w-full max-w-[480px] aspect-square relative flex items-center justify-center overflow-hidden">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformOrigin: 'center center',
                }}
                className="w-full h-full flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 500 500"
                  className="w-full h-full select-none"
                  style={{ filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.6))' }}
                >
                  <defs>
                    <filter id="organelleGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* 1. PLANT CELL WALL (if plant) */}
                  {cellType === 'plant' && (
                    <g
                      onClick={() => handleSelectOrganelle(ORGANELLES[1])}
                      className="cursor-pointer"
                    >
                      <rect
                        x="30"
                        y="30"
                        width="440"
                        height="440"
                        rx="50"
                        fill="#064e3b"
                        stroke={selectedOrganelleId === 'wall' ? '#34d399' : '#059669'}
                        strokeWidth={selectedOrganelleId === 'wall' ? '12' : '8'}
                        filter={selectedOrganelleId === 'wall' ? 'url(#organelleGlow)' : undefined}
                      />
                    </g>
                  )}

                  {/* 2. CELL MEMBRANE */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[0])}
                    className="cursor-pointer"
                  >
                    {cellType === 'plant' ? (
                      <rect
                        x="50"
                        y="50"
                        width="400"
                        height="400"
                        rx="40"
                        fill="#062828"
                        stroke={selectedOrganelleId === 'membrane' ? '#22d3ee' : '#0891b2'}
                        strokeWidth={selectedOrganelleId === 'membrane' ? '5' : '3'}
                      />
                    ) : (
                      <ellipse
                        cx="250"
                        cy="250"
                        rx="205"
                        ry="195"
                        fill="#0f2027"
                        stroke={selectedOrganelleId === 'membrane' ? '#22d3ee' : '#0891b2'}
                        strokeWidth={selectedOrganelleId === 'membrane' ? '6' : '3.5'}
                        filter={selectedOrganelleId === 'membrane' ? 'url(#organelleGlow)' : undefined}
                      />
                    )}
                  </g>

                  {/* 3. CYTOPLASM & CYTOSOL BACKGROUND */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[2])}
                    className="cursor-pointer"
                  >
                    {cellType === 'plant' ? (
                      <rect x="54" y="54" width="392" height="392" rx="36" fill="#042f2e" opacity="0.45" />
                    ) : (
                      <ellipse cx="250" cy="250" rx="198" ry="188" fill="#032b30" opacity="0.4" />
                    )}
                  </g>

                  {/* 4. LARGE CENTRAL VACUOLE (Plant Only) */}
                  {cellType === 'plant' && (
                    <g
                      onClick={() => handleSelectOrganelle(ORGANELLES[7])}
                      className="cursor-pointer group"
                    >
                      <path
                        d="M 170 180 C 340 160, 420 220, 390 350 C 360 410, 240 430, 180 390 C 130 350, 120 200, 170 180 Z"
                        fill="#0284c7"
                        fillOpacity="0.45"
                        stroke={selectedOrganelleId === 'vacuole' ? '#38bdf8' : '#0369a1'}
                        strokeWidth={selectedOrganelleId === 'vacuole' ? '4' : '2'}
                        filter={selectedOrganelleId === 'vacuole' ? 'url(#organelleGlow)' : undefined}
                      />
                      <text x="260" y="300" fill="#93c5fd" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.7">
                        Vacuole
                      </text>
                    </g>
                  )}

                  {/* 5. NUCLEUS & NUCLEOLUS */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[3])}
                    className="cursor-pointer group"
                  >
                    <ellipse
                      cx={cellType === 'plant' ? '170' : '250'}
                      cy={cellType === 'plant' ? '160' : '240'}
                      rx={cellType === 'plant' ? '50' : '62'}
                      ry={cellType === 'plant' ? '48' : '58'}
                      fill="#581c87"
                      stroke={selectedOrganelleId === 'nucleus' ? '#c084fc' : '#7e22ce'}
                      strokeWidth={selectedOrganelleId === 'nucleus' ? '4' : '2.5'}
                      filter={selectedOrganelleId === 'nucleus' ? 'url(#organelleGlow)' : undefined}
                    />
                    {/* Chromatin threads inside nucleus */}
                    <path
                      d={
                        cellType === 'plant'
                          ? 'M 145 150 Q 170 135 190 155 Q 165 175 145 160'
                          : 'M 220 230 Q 250 215 275 235 Q 245 260 225 240'
                      }
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />

                    {/* Nucleolus */}
                    <circle
                      cx={cellType === 'plant' ? '165' : '245'}
                      cy={cellType === 'plant' ? '155' : '235'}
                      r={cellType === 'plant' ? '16' : '20'}
                      fill={selectedOrganelleId === 'nucleolus' ? '#e9d5ff' : '#9333ea'}
                      stroke={selectedOrganelleId === 'nucleolus' ? '#ffffff' : '#7e22ce'}
                      strokeWidth="2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOrganelle(ORGANELLES[4]);
                      }}
                      className="cursor-pointer hover:scale-105 transition-transform"
                    />
                  </g>

                  {/* 6. ROUGH ENDOPLASMIC RETICULUM */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[8])}
                    className="cursor-pointer"
                  >
                    <path
                      d={
                        cellType === 'plant'
                          ? 'M 110 170 C 100 210, 130 230, 150 225 M 120 185 C 112 215, 140 238, 160 235'
                          : 'M 180 230 C 160 270, 200 300, 240 295 M 190 245 C 175 280, 210 310, 250 305'
                      }
                      fill="none"
                      stroke={selectedOrganelleId === 'rough_er' ? '#f472b6' : '#ec4899'}
                      strokeWidth={selectedOrganelleId === 'rough_er' ? '6' : '4.5'}
                      strokeLinecap="round"
                      filter={selectedOrganelleId === 'rough_er' ? 'url(#organelleGlow)' : undefined}
                    />
                    {/* Ribosome dots on Rough ER */}
                    <circle cx={cellType === 'plant' ? 125 : 195} cy={cellType === 'plant' ? 195 : 265} r="2.5" fill="#facc15" />
                    <circle cx={cellType === 'plant' ? 138 : 210} cy={cellType === 'plant' ? 215 : 285} r="2.5" fill="#facc15" />
                    <circle cx={cellType === 'plant' ? 150 : 230} cy={cellType === 'plant' ? 228 : 298} r="2.5" fill="#facc15" />
                  </g>

                  {/* 7. SMOOTH ENDOPLASMIC RETICULUM */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[9])}
                    className="cursor-pointer"
                  >
                    <path
                      d={
                        cellType === 'plant'
                          ? 'M 190 120 Q 220 110 240 130 Q 220 145 200 135'
                          : 'M 305 210 Q 345 200 360 225 Q 335 245 315 235'
                      }
                      fill="none"
                      stroke={selectedOrganelleId === 'smooth_er' ? '#fb7185' : '#f43f5e'}
                      strokeWidth={selectedOrganelleId === 'smooth_er' ? '5.5' : '4'}
                      strokeLinecap="round"
                    />
                  </g>

                  {/* 8. MITOCHONDRIA */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[5])}
                    className="cursor-pointer group"
                  >
                    {/* Mitochondrion 1 */}
                    <g transform={cellType === 'plant' ? 'translate(90, 320) rotate(-20)' : 'translate(130, 140) rotate(-30)'}>
                      <ellipse
                        cx="30"
                        cy="18"
                        rx="28"
                        ry="16"
                        fill="#ea580c"
                        stroke={selectedOrganelleId === 'mitochondria' ? '#fed7aa' : '#c2410c'}
                        strokeWidth={selectedOrganelleId === 'mitochondria' ? '3' : '1.5'}
                        filter={selectedOrganelleId === 'mitochondria' ? 'url(#organelleGlow)' : undefined}
                      />
                      {/* Inner cristae folds */}
                      <path d="M 12 18 Q 20 10 28 18 Q 36 26 48 18" fill="none" stroke="#ffedd5" strokeWidth="2" />
                    </g>

                    {/* Mitochondrion 2 */}
                    <g transform={cellType === 'plant' ? 'translate(340, 90) rotate(40)' : 'translate(310, 330) rotate(25)'}>
                      <ellipse
                        cx="30"
                        cy="18"
                        rx="26"
                        ry="15"
                        fill="#ea580c"
                        stroke={selectedOrganelleId === 'mitochondria' ? '#fed7aa' : '#c2410c'}
                        strokeWidth={selectedOrganelleId === 'mitochondria' ? '3' : '1.5'}
                      />
                      <path d="M 14 18 Q 22 10 30 18 Q 38 26 46 18" fill="none" stroke="#ffedd5" strokeWidth="2" />
                    </g>
                  </g>

                  {/* 9. CHLOROPLASTS (Plant Only) */}
                  {cellType === 'plant' && (
                    <g
                      onClick={() => handleSelectOrganelle(ORGANELLES[6])}
                      className="cursor-pointer group"
                    >
                      {/* Chloroplast 1 */}
                      <g transform="translate(100, 100) rotate(15)">
                        <ellipse
                          cx="26"
                          cy="16"
                          rx="26"
                          ry="15"
                          fill="#059669"
                          stroke={selectedOrganelleId === 'chloroplast' ? '#6ee7b7' : '#047857'}
                          strokeWidth={selectedOrganelleId === 'chloroplast' ? '3.5' : '1.5'}
                          filter={selectedOrganelleId === 'chloroplast' ? 'url(#organelleGlow)' : undefined}
                        />
                        {/* Thylakoid grana discs */}
                        <line x1="12" y1="12" x2="20" y2="12" stroke="#a7f3d0" strokeWidth="2.5" />
                        <line x1="12" y1="16" x2="20" y2="16" stroke="#a7f3d0" strokeWidth="2.5" />
                        <line x1="28" y1="14" x2="38" y2="14" stroke="#a7f3d0" strokeWidth="2.5" />
                        <line x1="28" y1="18" x2="38" y2="18" stroke="#a7f3d0" strokeWidth="2.5" />
                      </g>
                      {/* Chloroplast 2 */}
                      <g transform="translate(360, 200) rotate(-35)">
                        <ellipse
                          cx="26"
                          cy="16"
                          rx="26"
                          ry="15"
                          fill="#059669"
                          stroke={selectedOrganelleId === 'chloroplast' ? '#6ee7b7' : '#047857'}
                          strokeWidth={selectedOrganelleId === 'chloroplast' ? '3.5' : '1.5'}
                        />
                        <line x1="14" y1="13" x2="22" y2="13" stroke="#a7f3d0" strokeWidth="2.5" />
                        <line x1="26" y1="15" x2="36" y2="15" stroke="#a7f3d0" strokeWidth="2.5" />
                      </g>
                    </g>
                  )}

                  {/* 10. GOLGI APPARATUS */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[10])}
                    className="cursor-pointer"
                  >
                    <g transform={cellType === 'plant' ? 'translate(80, 240) rotate(-10)' : 'translate(130, 310) rotate(-15)'}>
                      <path d="M 10 10 Q 30 18 50 10" fill="none" stroke={selectedOrganelleId === 'golgi' ? '#fde047' : '#eab308'} strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M 8 18 Q 30 26 52 18" fill="none" stroke={selectedOrganelleId === 'golgi' ? '#fde047' : '#eab308'} strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M 12 26 Q 30 34 48 26" fill="none" stroke={selectedOrganelleId === 'golgi' ? '#fde047' : '#eab308'} strokeWidth="4.5" strokeLinecap="round" />
                      {/* Secretory vesicles */}
                      <circle cx="56" cy="12" r="3.5" fill="#facc15" />
                      <circle cx="58" cy="24" r="3" fill="#facc15" />
                    </g>
                  </g>

                  {/* 11. LYSOSOMES (Animal only) */}
                  {cellType === 'animal' && (
                    <g
                      onClick={() => handleSelectOrganelle(ORGANELLES[11])}
                      className="cursor-pointer"
                    >
                      <circle
                        cx="320"
                        cy="150"
                        r="14"
                        fill="#0d9488"
                        stroke={selectedOrganelleId === 'lysosome' ? '#5eead4' : '#115e59'}
                        strokeWidth={selectedOrganelleId === 'lysosome' ? '3' : '1.5'}
                        filter={selectedOrganelleId === 'lysosome' ? 'url(#organelleGlow)' : undefined}
                      />
                      <circle cx="340" cy="280" r="12" fill="#0d9488" stroke="#115e59" strokeWidth="1.5" />
                    </g>
                  )}

                  {/* 12. FREE RIBOSOMES */}
                  <g
                    onClick={() => handleSelectOrganelle(ORGANELLES[12])}
                    className="cursor-pointer"
                  >
                    <circle cx="210" cy="130" r="3" fill="#fbbf24" />
                    <circle cx="280" cy="140" r="3" fill="#fbbf24" />
                    <circle cx="330" cy="180" r="3" fill="#fbbf24" />
                    <circle cx="170" cy="180" r="3" fill="#fbbf24" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Organelle Chips */}
            <div className="w-full mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
              {visibleOrganelles.map((organelle) => {
                const isSelected = selectedOrganelleId === organelle.id;
                return (
                  <button
                    key={organelle.id}
                    onClick={() => handleSelectOrganelle(organelle)}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-800 text-white border-teal-400 font-semibold shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: organelle.color }}
                    />
                    <span>{organelle.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Organelle Inspector Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              {/* Title & Tag */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                    {selectedOrganelle.foundIn === 'both'
                      ? 'Animal & Plant Cells'
                      : selectedOrganelle.foundIn === 'plant'
                      ? 'Plant Exclusive'
                      : 'Animal Exclusive'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  {selectedOrganelle.name}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedOrganelle.role}
                </p>
              </div>

              {/* Primary Function */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-400" />
                  <span>Cellular Function</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedOrganelle.function}
                </p>
              </div>

              {/* ATP & Protein Role */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Role in Energy (ATP) or Protein Synthesis
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedOrganelle.atpOrProteinRole}
                </p>
              </div>

              {/* Scientific Facts */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Key Cytology Facts</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {selectedOrganelle.facts.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-mono text-[11px]">·</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Challenge CTA */}
              <button
                onClick={startQuizMode}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Organelle Identification (+25 XP)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
