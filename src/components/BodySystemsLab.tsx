import React, { useState } from 'react';
import { BODY_SYSTEMS } from '../data/biologyData';
import { BodySystemData, BodySystemCategory, UserProgress } from '../types/biology';
import { sound } from '../utils/soundEffects';
import {
  Activity,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Layers,
} from 'lucide-react';

interface BodySystemsLabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const BodySystemsLab: React.FC<BodySystemsLabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState<BodySystemCategory>('circulatory');
  const [animationPlaying, setAnimationPlaying] = useState<boolean>(true);
  const [animationStep, setAnimationStep] = useState<number>(0);

  // Knowledge check quiz state per system
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  const selectedSystem =
    BODY_SYSTEMS.find((s) => s.id === selectedSystemId) || BODY_SYSTEMS[0];

  const handleSelectSystem = (id: BodySystemCategory) => {
    sound.playClick();
    setSelectedSystemId(id);
    setSelectedOption(null);
    setHasAnswered(false);
    setAnimationStep(0);

    onUpdateProgress((prev) => ({
      ...prev,
      lastVisitedSection: 'systems',
      topicProgress: {
        ...prev.topicProgress,
        systems: Math.min(100, (prev.topicProgress.systems || 0) + 12),
      },
    }));
  };

  const handleAnswerQuestion = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    if (idx === selectedSystem.knowledgeCheck.correctIndex) {
      sound.playSuccess();
      onUpdateProgress((prev) => {
        const unlocked = [...prev.unlockedAchievements];
        if (!unlocked.includes('physiologist')) {
          unlocked.push('physiologist');
        }
        return {
          ...prev,
          xp: prev.xp + 30,
          unlockedAchievements: unlocked,
        };
      });
    } else {
      sound.playError();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <span>Body Systems Lab</span>
          <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Systemic Physiology
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Observe how the circulatory, respiratory, digestive, and nervous systems interact through visual step-by-step simulations.
        </p>
      </div>

      {/* System Selector Carousel / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {BODY_SYSTEMS.map((system) => {
          const isSelected = selectedSystemId === system.id;
          return (
            <button
              key={system.id}
              onClick={() => handleSelectSystem(system.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {system.name}
            </button>
          );
        })}
      </div>

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone: Interactive Animated Physiological Demonstration (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Animated Process Simulation</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAnimationPlaying(!animationPlaying)}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
              >
                {animationPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{animationPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => setAnimationStep(0)}
                className="p-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Reset animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* DYNAMIC SVG PROCESS VISUALIZERS */}
          <div className="w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex items-center justify-center relative overflow-hidden">
            {/* CIRCULATORY SYSTEM: Heart & Double Circulation Loop */}
            {selectedSystemId === 'circulatory' && (
              <svg viewBox="0 0 500 300" className="w-full h-full select-none">
                {/* Lungs Capillary Bed (Top) */}
                <ellipse cx="250" cy="50" rx="90" ry="24" fill="#0369a1" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="250" y="54" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Pulmonary Capillaries (Lungs: Gas Exchange)
                </text>

                {/* Body Tissues Capillary Bed (Bottom) */}
                <ellipse cx="250" cy="255" rx="100" ry="26" fill="#047857" fillOpacity="0.2" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="250" y="259" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Systemic Capillaries (Muscles, Organs & Brain)
                </text>

                {/* Heart in Center */}
                <g transform="translate(190, 110)">
                  <rect x="0" y="0" width="120" height="90" rx="16" fill="#1e293b" stroke="#e11d48" strokeWidth="2.5" />
                  {/* Left & Right Atria and Ventricles */}
                  <line x1="60" y1="0" x2="60" y2="90" stroke="#475569" strokeWidth="2" />
                  <line x1="0" y1="45" x2="120" y2="45" stroke="#475569" strokeWidth="2" />
                  <text x="30" y="28" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">RA</text>
                  <text x="90" y="28" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle">LA</text>
                  <text x="30" y="72" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">RV</text>
                  <text x="90" y="72" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle">LV</text>
                </g>

                {/* Pulmonary Circuit (Deoxygenated Blue to lungs, Oxygenated Red from lungs) */}
                <path d="M 220 110 C 220 70, 200 70, 200 65" fill="none" stroke="#0284c7" strokeWidth="4" />
                <path d="M 300 65 C 300 70, 280 70, 280 110" fill="none" stroke="#ef4444" strokeWidth="4" />

                {/* Systemic Circuit (Oxygenated Red to body, Deoxygenated Blue from body) */}
                <path d="M 280 200 C 280 230, 310 230, 310 235" fill="none" stroke="#ef4444" strokeWidth="4" />
                <path d="M 190 235 C 190 230, 220 230, 220 200" fill="none" stroke="#0284c7" strokeWidth="4" />

                {/* Pulsing blood flow indicator dots */}
                <circle cx="210" cy="80" r="5" fill="#38bdf8" className={animationPlaying ? 'animate-pulse' : ''} />
                <circle cx="290" cy="80" r="5" fill="#f43f5e" className={animationPlaying ? 'animate-pulse' : ''} />
                <circle cx="295" cy="220" r="5" fill="#f43f5e" className={animationPlaying ? 'animate-pulse' : ''} />
                <circle cx="205" cy="220" r="5" fill="#38bdf8" className={animationPlaying ? 'animate-pulse' : ''} />
              </svg>
            )}

            {/* RESPIRATORY SYSTEM: Breathing Mechanics & Alveolar Gas Exchange */}
            {selectedSystemId === 'respiratory' && (
              <svg viewBox="0 0 500 300" className="w-full h-full select-none">
                {/* Trachea and Bronchial Tree */}
                <path d="M 250 20 L 250 90 M 250 90 Q 200 120 160 160 M 250 90 Q 300 120 340 160" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />

                {/* Lungs Outline */}
                <path d="M 140 130 C 80 140, 70 210, 110 230 C 140 245, 180 230, 180 180 Z" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 360 130 C 420 140, 430 210, 390 230 C 360 245, 320 230, 320 180 Z" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" />

                {/* Diaphragm Muscle Arch at bottom */}
                <path d="M 100 260 Q 250 220 400 260" fill="none" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
                <text x="250" y="278" fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Diaphragm: Moves down during Inhalation, relaxes up in Exhalation
                </text>

                {/* Moving Oxygen / Carbon Dioxide particles */}
                <circle cx="250" cy="50" r="6" fill="#38bdf8" className={animationPlaying ? 'animate-bounce' : ''} />
                <text x="268" y="54" fill="#38bdf8" fontSize="10" fontWeight="bold">O₂ Inhaled</text>
              </svg>
            )}

            {/* DIGESTIVE SYSTEM: Bolus Transit & Peristalsis */}
            {selectedSystemId === 'digestive' && (
              <svg viewBox="0 0 500 300" className="w-full h-full select-none">
                {/* Digestive Tube Track */}
                <path d="M 120 40 L 120 100 Q 120 150 180 140 Q 240 130 230 180 Q 220 230 320 230" fill="none" stroke="#475569" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 120 40 L 120 100 Q 120 150 180 140 Q 240 130 230 180 Q 220 230 320 230" fill="none" stroke="#334155" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />

                {/* Food Bolus moving */}
                <circle cx="170" cy="138" r="8" fill="#f59e0b" className={animationPlaying ? 'animate-pulse' : ''} />
                <text x="170" y="115" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Chyme Bolus (Peristalsis)
                </text>

                {/* Organs Labels */}
                <text x="60" y="70" fill="#cbd5e1" fontSize="10">Esophagus</text>
                <text x="220" y="110" fill="#f97316" fontSize="10" fontWeight="bold">Stomach (HCl + Pepsin)</text>
                <text x="340" y="235" fill="#38bdf8" fontSize="10" fontWeight="bold">Intestine (Villi Absorption)</text>
              </svg>
            )}

            {/* NERVOUS SYSTEM: Action Potential Propagation down Axon */}
            {selectedSystemId === 'nervous' && (
              <svg viewBox="0 0 500 300" className="w-full h-full select-none">
                {/* Soma / Cell body */}
                <ellipse cx="80" cy="150" rx="36" ry="30" fill="#581c87" stroke="#c084fc" strokeWidth="2.5" />
                <text x="80" y="154" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">Soma</text>

                {/* Dendrites */}
                <line x1="44" y1="140" x2="15" y2="120" stroke="#c084fc" strokeWidth="2.5" />
                <line x1="44" y1="160" x2="15" y2="180" stroke="#c084fc" strokeWidth="2.5" />
                <line x1="60" y1="120" x2="40" y2="90" stroke="#c084fc" strokeWidth="2.5" />

                {/* Axon line */}
                <line x1="116" y1="150" x2="440" y2="150" stroke="#38bdf8" strokeWidth="4" />

                {/* Myelin Sheaths */}
                <rect x="140" y="138" width="55" height="24" rx="6" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
                <rect x="220" y="138" width="55" height="24" rx="6" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
                <rect x="300" y="138" width="55" height="24" rx="6" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />

                {/* Action potential pulse */}
                <circle cx="205" cy="150" r="7" fill="#facc15" className={animationPlaying ? 'animate-ping' : ''} />
                <text x="250" y="200" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
                  ⚡ Saltatory Conduction (Nodes of Ranvier: ~120 m/s)
                </text>
              </svg>
            )}

            {/* SKELETAL & MUSCULAR: Arm Flexion Antagonistic Pair */}
            {(selectedSystemId === 'muscular' || selectedSystemId === 'skeletal') && (
              <svg viewBox="0 0 500 300" className="w-full h-full select-none">
                {/* Humerus Bone */}
                <line x1="120" y1="180" x2="250" y2="180" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
                <text x="180" y="165" fill="#94a3b8" fontSize="10">Humerus Bone</text>

                {/* Radius / Forearm Bone */}
                <line x1="250" y1="180" x2="360" y2="100" stroke="#e2e8f0" strokeWidth="11" strokeLinecap="round" />
                <text x="320" y="145" fill="#94a3b8" fontSize="10">Radius / Forearm</text>

                {/* Elbow Joint Pivot */}
                <circle cx="250" cy="180" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />

                {/* Biceps Muscle (Contracted, thick) */}
                <path d="M 150 165 Q 200 120 280 140" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                <text x="210" y="110" fill="#ef4444" fontSize="11" fontWeight="bold">Biceps (CONTRACTED)</text>

                {/* Triceps Muscle (Extended, relaxed) */}
                <path d="M 140 195 Q 200 215 255 190" fill="none" stroke="#f87171" strokeWidth="6" strokeLinecap="round" />
                <text x="200" y="235" fill="#f87171" fontSize="11" fontWeight="bold">Triceps (RELAXED)</text>
              </svg>
            )}

            {/* URINARY, ENDOCRINE, IMMUNE GENERIC SYSTEM DIAGRAM */}
            {(selectedSystemId === 'urinary' || selectedSystemId === 'endocrine' || selectedSystemId === 'immune') && (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <span className="text-sm font-bold text-white">{selectedSystem.name} Pathway</span>
                <p className="text-xs text-slate-300 max-w-md">
                  {selectedSystem.tagline}. Coordinates specialized homeostatic cellular pathways across organs and vessels.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  {selectedSystem.majorOrgans.map((organ, idx) => (
                    <span key={idx} className="px-2 py-1 text-[11px] bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {organ}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Mechanical Breakdown */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Step-by-Step Physiological Process
            </h3>
            <div className="space-y-2">
              {selectedSystem.howItWorks.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setAnimationStep(idx)}
                  className={`p-3 rounded-lg border text-xs leading-relaxed cursor-pointer transition-all ${
                    animationStep === idx
                      ? 'bg-slate-800 border-cyan-400 text-white font-medium'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Zone: System Connections, Vocabulary & Knowledge Check (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* System Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Organ System Overview
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {selectedSystem.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {selectedSystem.tagline}
              </p>
            </div>

            {/* Main Purpose */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Primary Biological Function</span>
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedSystem.purpose}
              </p>
            </div>

            {/* Inter-System Connections */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Interconnections with Other Systems
              </h3>
              <div className="space-y-2 text-xs">
                {selectedSystem.connections.map((conn, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="font-bold text-cyan-300 shrink-0">
                      {conn.system} System:
                    </span>
                    <span className="text-slate-300">{conn.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Vocabulary */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Essential Vocabulary
              </h3>
              <div className="space-y-2 text-xs">
                {selectedSystem.keyVocabulary.map((vocab, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <p className="font-semibold text-white">{vocab.term}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{vocab.definition}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge Check Mini-Quiz */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Knowledge Check (+30 XP)</span>
              </div>
              <p className="text-xs font-medium text-white">
                {selectedSystem.knowledgeCheck.question}
              </p>

              <div className="space-y-1.5">
                {selectedSystem.knowledgeCheck.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === selectedSystem.knowledgeCheck.correctIndex;

                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800';
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-slate-950/50 border-slate-900 text-slate-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuestion(idx)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-2.5 text-xs rounded-lg border transition-colors flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {hasAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <p className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800 leading-relaxed">
                  {selectedSystem.knowledgeCheck.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
