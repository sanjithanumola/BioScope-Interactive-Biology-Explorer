import React, { useState } from 'react';
import { MICROSCOPIC_ENTITIES } from '../data/biologyData';
import { MicroscopicEntity, UserProgress } from '../types/biology';
import { sound } from '../utils/soundEffects';
import {
  Search,
  Sparkles,
  Layers,
  Info,
  Maximize2,
  Sliders,
} from 'lucide-react';

interface MicroscopicWorldProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const MicroscopicWorld: React.FC<MicroscopicWorldProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('red_blood_cell');
  const [scaleSliderValue, setScaleSliderValue] = useState<number>(4); // Index 0 to 7

  const selectedEntity =
    MICROSCOPIC_ENTITIES.find((e) => e.id === selectedEntityId) || MICROSCOPIC_ENTITIES[4];

  // Scale tiers from Macro to Atomic (logarithmic levels)
  const scaleTiers = [
    { label: '1 Meter (1 m)', desc: 'Human body, motor neuron axon length', sample: 'Human / Nerve Axon' },
    { label: '1 Centimeter (10 mm)', desc: 'Large insect, small vertebrate organs', sample: 'Frog Egg / Ant' },
    { label: '100 Micrometers (100 µm)', desc: 'Plant cell (Elodea), cheek epithelial cell', sample: 'Plant Cell / Cheek Cell' },
    { label: '10 Micrometers (10 µm)', desc: 'Red blood cell, white blood cell (neutrophil)', sample: 'RBC / WBC' },
    { label: '1 Micrometer (1 µm)', desc: 'Bacterium (E. coli), mitochondrion organelle', sample: 'E. coli Bacterium' },
    { label: '100 Nanometers (100 nm)', desc: 'Virus (Influenza, SARS-CoV-2), ribosome complex', sample: 'Virion Particle' },
    { label: '2 Nanometers (2 nm)', desc: 'DNA double helix diameter, globular proteins', sample: 'DNA Double Helix' },
    { label: '0.1 Nanometer (0.1 nm / 1 Å)', desc: 'Single carbon atom, chemical covalent bond length', sample: 'Carbon Atom' },
  ];

  const handleSelectEntity = (entity: MicroscopicEntity) => {
    sound.playSelect();
    setSelectedEntityId(entity.id);

    onUpdateProgress((prev) => ({
      ...prev,
      lastVisitedSection: 'microscopic',
      topicProgress: {
        ...prev.topicProgress,
        microscopic: Math.min(100, (prev.topicProgress.microscopic || 0) + 15),
      },
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setScaleSliderValue(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <span>Microscopic World</span>
          <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Scale & Cytology
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Journey across biological dimensions from whole cells down to bacteria, viruses, and the DNA double helix.
        </p>
      </div>

      {/* Logarithmic Scale Comparison Slider Deck */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Interactive Scale Comparison (Macro to Nano)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Tier {scaleSliderValue + 1} of {scaleTiers.length}: <strong className="text-white">{scaleTiers[scaleSliderValue].label}</strong>
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max={scaleTiers.length - 1}
          value={scaleSliderValue}
          onChange={handleSliderChange}
          className="w-full accent-amber-400 cursor-pointer"
        />

        {/* Scale Step Indicators */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>1 Meter (10⁰ m)</span>
          <span>100 µm (10⁻⁴ m)</span>
          <span>1 µm (10⁻⁶ m)</span>
          <span>100 nm (10⁻⁷ m)</span>
          <span>0.1 nm (10⁻¹⁰ m)</span>
        </div>

        {/* Active Scale Description Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-300">
              {scaleTiers[scaleSliderValue].sample}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {scaleTiers[scaleSliderValue].desc}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Relative Dimension
          </span>
        </div>
      </div>

      {/* Microscopic Specimen Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MICROSCOPIC_ENTITIES.map((entity) => {
          const isSelected = selectedEntityId === entity.id;
          return (
            <button
              key={entity.id}
              onClick={() => handleSelectEntity(entity)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase">
                  {entity.type}
                </span>
                <p className="text-xs font-bold text-white mt-0.5 leading-snug">
                  {entity.name}
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-2">
                {entity.sizeString}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-Zone Layout: Specimen Visualizer + Scientific Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone: High-Definition Scientific Visual Graphic (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center space-y-4">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Search className="w-4 h-4" />
              <span>Microscopic Field of View</span>
            </span>
            <span className="font-mono text-xs text-slate-400">
              {selectedEntity.sizeString}
            </span>
          </div>

          {/* Microscopic Circular Reticle Viewport */}
          <div className="w-full max-w-[420px] aspect-square rounded-full border-4 border-slate-800 bg-slate-950 p-6 flex items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Grid Reticle Lines */}
            <div className="absolute inset-0 border border-slate-800/40 rounded-full pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800/50 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-800/50 pointer-events-none" />

            {/* VECTOR GRAPHIC PER SPECIMEN */}

            {/* BACTERIA (E. coli) */}
            {selectedEntity.id === 'bacteria' && (
              <svg viewBox="0 0 200 200" className="w-48 h-48 select-none">
                {/* Rod capsule */}
                <rect x="50" y="70" width="100" height="60" rx="30" fill="#047857" stroke="#34d399" strokeWidth="3" />
                {/* Circular nucleoid plasmid */}
                <path d="M 75 95 Q 100 80 125 100 Q 100 120 75 95" fill="none" stroke="#facc15" strokeWidth="2.5" />
                {/* Flagella tails */}
                <path d="M 40 100 Q 20 80 5 95" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
                <path d="M 40 110 Q 15 130 0 115" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}

            {/* RED BLOOD CELL (Biconcave) */}
            {selectedEntity.id === 'red_blood_cell' && (
              <svg viewBox="0 0 200 200" className="w-52 h-52 select-none">
                <defs>
                  <radialGradient id="rbcGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#991b1b" />
                    <stop offset="65%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="75" fill="url(#rbcGrad)" stroke="#f87171" strokeWidth="2.5" />
                {/* Biconcave depression in center */}
                <ellipse cx="100" cy="100" rx="38" ry="34" fill="#7f1d1d" opacity="0.6" />
              </svg>
            )}

            {/* NEURON */}
            {selectedEntity.id === 'neuron' && (
              <svg viewBox="0 0 200 200" className="w-52 h-52 select-none">
                <circle cx="100" cy="70" r="30" fill="#6b21a8" stroke="#c084fc" strokeWidth="2.5" />
                {/* Dendrites */}
                <path d="M 75 55 L 40 30 M 100 40 L 100 10 M 125 55 L 160 30" stroke="#c084fc" strokeWidth="2" />
                {/* Axon */}
                <path d="M 100 100 L 100 190" stroke="#38bdf8" strokeWidth="3" />
                {/* Myelin wraps */}
                <rect x="88" y="115" width="24" height="20" rx="4" fill="#0284c7" />
                <rect x="88" y="145" width="24" height="20" rx="4" fill="#0284c7" />
              </svg>
            )}

            {/* PLANT CELL */}
            {selectedEntity.id === 'plant_cell' && (
              <svg viewBox="0 0 200 200" className="w-52 h-52 select-none">
                <rect x="25" y="25" width="150" height="150" rx="20" fill="#064e3b" stroke="#34d399" strokeWidth="5" />
                <circle cx="80" cy="80" r="24" fill="#581c87" />
                {/* Chloroplasts */}
                <circle cx="130" cy="60" r="10" fill="#10b981" />
                <circle cx="140" cy="100" r="10" fill="#10b981" />
                <circle cx="60" cy="130" r="10" fill="#10b981" />
              </svg>
            )}

            {/* CHEEK CELL */}
            {selectedEntity.id === 'cheek_cell' && (
              <svg viewBox="0 0 200 200" className="w-52 h-52 select-none">
                <path d="M 40 60 Q 90 30 160 50 Q 180 120 150 160 Q 70 180 30 130 Z" fill="#1e3a8a" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="2" />
                <circle cx="100" cy="100" r="16" fill="#1e40af" stroke="#93c5fd" strokeWidth="1.5" />
              </svg>
            )}

            {/* WHITE BLOOD CELL */}
            {selectedEntity.id === 'white_blood_cell' && (
              <svg viewBox="0 0 200 200" className="w-52 h-52 select-none">
                <circle cx="100" cy="100" r="70" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
                {/* Multi-lobed nucleus */}
                <path d="M 75 75 Q 95 65 115 80 Q 125 105 105 125 Q 85 120 70 100 Z" fill="#581c87" stroke="#c084fc" strokeWidth="2" />
              </svg>
            )}

            {/* VIRUS */}
            {selectedEntity.id === 'virus' && (
              <svg viewBox="0 0 200 200" className="w-48 h-48 select-none">
                <circle cx="100" cy="100" r="50" fill="#312e81" stroke="#818cf8" strokeWidth="2.5" />
                {/* Spikes */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => {
                  const rad = (ang * Math.PI) / 180;
                  const x1 = 100 + Math.cos(rad) * 50;
                  const y1 = 100 + Math.sin(rad) * 50;
                  const x2 = 100 + Math.cos(rad) * 70;
                  const y2 = 100 + Math.sin(rad) * 70;
                  return (
                    <g key={ang}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f43f5e" strokeWidth="3" />
                      <circle cx={x2} cy={y2} r="4" fill="#f43f5e" />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* DNA DOUBLE HELIX */}
            {selectedEntity.id === 'dna_helix' && (
              <svg viewBox="0 0 200 200" className="w-48 h-48 select-none">
                <path d="M 60 20 Q 140 60 60 100 Q 140 140 60 180" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <path d="M 140 20 Q 60 60 140 100 Q 60 140 140 180" fill="none" stroke="#818cf8" strokeWidth="4" />
                <line x1="85" y1="40" x2="115" y2="40" stroke="#facc15" strokeWidth="2" />
                <line x1="75" y1="120" x2="125" y2="120" stroke="#facc15" strokeWidth="2" />
              </svg>
            )}
          </div>

          <p className="text-xs text-slate-400 italic text-center">
            {selectedEntity.microscopeDescription}
          </p>
        </div>

        {/* Right Zone: Structural Breakdown & Facts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                {selectedEntity.type}
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {selectedEntity.name}
              </h2>
              <p className="text-xs font-mono text-teal-400">
                Typical Scale: {selectedEntity.sizeString}
              </p>
            </div>

            {/* Structure Breakdown */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Biological Structure
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedEntity.structure}
              </p>
            </div>

            {/* Physiological Function */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Function in Living Systems
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedEntity.function}
              </p>
            </div>

            {/* Where Found */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Where It Is Found
              </span>
              <p className="text-xs text-slate-200">
                {selectedEntity.whereFound}
              </p>
            </div>

            {/* Scientific Facts */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Microscopy Insights</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {selectedEntity.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono text-[11px]">·</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
