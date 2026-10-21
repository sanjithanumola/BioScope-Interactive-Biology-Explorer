import React, { useState } from 'react';
import { UserProgress } from '../types/biology';
import { calculateOsmosisDynamics, TonicityType } from '../utils/biologyLogic';
import { sound } from '../utils/soundEffects';
import {
  FlaskConical,
  Search,
  Droplet,
  Dna,
  Sun,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface BiologyLabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const BiologyLab: React.FC<BiologyLabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [activeLabTab, setActiveLabTab] = useState<'microscope' | 'osmosis' | 'selection' | 'foodchain'>('microscope');

  // 1. Virtual Microscope State
  const microscopeSlides = [
    {
      id: 'onion_root',
      name: 'Onion Root Tip (Allium cepa)',
      stain: 'Feulgen Stain (Chromosomes)',
      description: 'Actively dividing meristematic cells displaying distinct mitotic phases: prophase, metaphase, anaphase, and telophase.',
      optimalFocus: 50,
      zoomDetail: 'Brick-like cell walls enclosing condensed chromatin and spindle fibers.',
    },
    {
      id: 'blood_smear',
      name: 'Human Blood Smear (Wright Stain)',
      stain: 'Wright-Giemsa',
      description: 'Dense field of biconcave red blood cells with occasional nucleated white blood cells (neutrophils and lymphocytes) and tiny platelets.',
      optimalFocus: 45,
      zoomDetail: 'Biconcave circular discs with clear centers and lobed purple leukocyte nuclei.',
    },
    {
      id: 'leaf_stomata',
      name: 'Lower Leaf Epidermis (Stomata)',
      stain: 'Toluidine Blue',
      description: 'Pairs of bean-shaped photosynthetic guard cells regulating stomatal gas exchange pores for carbon dioxide uptake and transpiration.',
      optimalFocus: 55,
      zoomDetail: 'Kidney-shaped guard cells packed with green chloroplasts surrounding stomatal pores.',
    },
    {
      id: 'motor_neuron',
      name: 'Spinal Cord Motor Neuron',
      stain: 'Cresyl Violet (Nissl Bodies)',
      description: 'Large star-shaped multipolar soma with radiating dendritic arbors and axonal projections.',
      optimalFocus: 50,
      zoomDetail: 'Dark purple Nissl bodies in cytoplasm with pale nucleus and dark nucleolus.',
    },
  ];

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const selectedSlide = microscopeSlides[selectedSlideIndex];
  const [objectivePower, setObjectivePower] = useState<number>(10); // 4x, 10x, 40x, 100x
  const [focusKnob, setFocusKnob] = useState<number>(50); // 0 to 100 (50 is optimal)
  const [lightIntensity, setLightIntensity] = useState<number>(80);

  // Focus blur calculation: 0 blur when focusKnob matches optimalFocus
  const focusOffset = Math.abs(focusKnob - selectedSlide.optimalFocus);
  const blurPixels = (focusOffset / 10).toFixed(1);

  // 2. Osmosis State
  const [soluteOutside, setSoluteOutside] = useState<number>(1); // 1%, 5%, 12%
  const soluteInside = 5; // Fixed intracellular solute ~5%
  const osmosisData = calculateOsmosisDynamics(soluteOutside, soluteInside);

  // 3. Natural Selection State
  const [environmentBark, setEnvironmentBark] = useState<'light' | 'dark'>('dark');
  const [generation, setGeneration] = useState<number>(1);
  const [lightMothsPercent, setLightMothsPercent] = useState<number>(50);

  const handleNextGeneration = () => {
    sound.playClick();
    if (generation >= 5) return;

    setGeneration((g) => g + 1);
    if (environmentBark === 'dark') {
      // In dark bark, light moths get predated -> dark moths survive and increase
      setLightMothsPercent((prev) => Math.max(10, prev - 18));
    } else {
      // In light bark, dark moths get predated -> light moths increase
      setLightMothsPercent((prev) => Math.min(90, prev + 18));
    }

    onUpdateProgress((prev) => ({
      ...prev,
      xp: prev.xp + 20,
    }));
  };

  const handleResetSelection = () => {
    sound.playClick();
    setGeneration(1);
    setLightMothsPercent(50);
  };

  // 4. Food Chain Energy Pyramid
  const [trophicLevel, setTrophicLevel] = useState<number>(0);
  const energyPyramid = [
    { level: 'Primary Producers', organism: 'Phytoplankton & Grass', energy: '10,000 Joules', rule: '100% (Solar radiation conversion)' },
    { level: 'Primary Consumers', organism: 'Zooplankton, Grasshoppers & Rabbits', energy: '1,000 Joules', rule: '10% (Herbivore assimilation)' },
    { level: 'Secondary Consumers', organism: 'Frogs, Small Fish & Foxes', energy: '100 Joules', rule: '1% (Carnivore predation)' },
    { level: 'Tertiary Apex Predators', organism: 'Hawks, Sharks & Wolves', energy: '10 Joules', rule: '0.1% (Top predator limit)' },
  ];

  const handleTabSwitch = (tab: 'microscope' | 'osmosis' | 'selection' | 'foodchain') => {
    sound.playClick();
    setActiveLabTab(tab);

    onUpdateProgress((prev) => ({
      ...prev,
      lastVisitedSection: 'lab',
      topicProgress: {
        ...prev.topicProgress,
        lab: Math.min(100, (prev.topicProgress.lab || 0) + 20),
      },
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Virtual Biology Lab</span>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Interactive Science Simulations
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conduct virtual laboratory investigations: adjust objective lenses, manipulate osmotic gradients, and test natural selection.
          </p>
        </div>

        {/* Lab Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => handleTabSwitch('microscope')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeLabTab === 'microscope'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Virtual Microscope</span>
          </button>
          <button
            onClick={() => handleTabSwitch('osmosis')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeLabTab === 'osmosis'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Osmosis Lab</span>
          </button>
          <button
            onClick={() => handleTabSwitch('selection')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeLabTab === 'selection'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Natural Selection</span>
          </button>
          <button
            onClick={() => handleTabSwitch('foodchain')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeLabTab === 'foodchain'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Energy Pyramid</span>
          </button>
        </div>
      </div>

      {/* 1. VIRTUAL MICROSCOPE SIMULATOR */}
      {activeLabTab === 'microscope' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Eyepiece Viewport (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center space-y-4">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Microscope Eyepiece (10x Ocular)</span>
              </span>
              <span className="font-mono text-white">
                Total Magnification: <strong className="text-teal-400">{10 * objectivePower}x</strong>
              </span>
            </div>

            {/* Circular Circular Lens Field of View */}
            <div
              className="w-full max-w-[420px] aspect-square rounded-full border-8 border-slate-800 p-6 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all"
              style={{
                backgroundColor: `rgba(15, 23, 42, ${1 - lightIntensity / 200})`,
                boxShadow: `inset 0 0 60px rgba(0,0,0,0.9), 0 0 ${lightIntensity / 4}px rgba(45, 212, 191, 0.2)`,
              }}
            >
              {/* Specimen Slide Visual under Dynamic Blur Focus Filter */}
              <div
                className="w-full h-full flex items-center justify-center transition-all select-none"
                style={{
                  filter: `blur(${blurPixels}px)`,
                  transform: `scale(${objectivePower / 10})`,
                  opacity: Math.max(0.3, lightIntensity / 100),
                }}
              >
                {/* 1. ONION ROOT TIP (Mitosis stages) */}
                {selectedSlide.id === 'onion_root' && (
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Brick grid of plant cells */}
                    {[0, 60, 120, 180, 240].map((y) =>
                      [0, 60, 120, 180, 240].map((x) => (
                        <g key={`${x}-${y}`}>
                          <rect x={x} y={y} width="56" height="56" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="2" opacity="0.6" />
                          {/* Condensed chromosome thread in center */}
                          <circle cx={x + 28} cy={y + 28} r="10" fill="#a855f7" />
                        </g>
                      ))
                    )}
                  </svg>
                )}

                {/* 2. HUMAN BLOOD SMEAR */}
                {selectedSlide.id === 'blood_smear' && (
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Multiple red blood cells */}
                    {[
                      [50, 60], [100, 80], [160, 50], [220, 90], [70, 140],
                      [130, 150], [190, 130], [250, 170], [60, 220], [120, 240], [200, 230],
                    ].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="18" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
                    ))}
                    {/* Single white blood cell with lobed nucleus */}
                    <circle cx="150" cy="180" r="28" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
                    <circle cx="145" cy="175" r="9" fill="#c084fc" />
                    <circle cx="158" cy="185" r="8" fill="#c084fc" />
                  </svg>
                )}

                {/* 3. LEAF STOMATA */}
                {selectedSlide.id === 'leaf_stomata' && (
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Epidermal puzzle cells */}
                    <path d="M 50 50 Q 150 20 250 50 Q 280 150 250 250 Q 150 280 50 250 Z" fill="#047857" fillOpacity="0.3" stroke="#10b981" strokeWidth="2" />
                    {/* Guard cell pair flanking pore */}
                    <ellipse cx="135" cy="150" rx="16" ry="32" fill="#059669" stroke="#6ee7b7" strokeWidth="2" transform="rotate(-10 135 150)" />
                    <ellipse cx="165" cy="150" rx="16" ry="32" fill="#059669" stroke="#6ee7b7" strokeWidth="2" transform="rotate(10 165 150)" />
                    {/* Stomatal aperture pore */}
                    <ellipse cx="150" cy="150" rx="4" ry="16" fill="#0f172a" />
                  </svg>
                )}

                {/* 4. MOTOR NEURON */}
                {selectedSlide.id === 'motor_neuron' && (
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    <circle cx="150" cy="150" r="44" fill="#6b21a8" stroke="#c084fc" strokeWidth="3" />
                    <circle cx="150" cy="150" r="14" fill="#a855f7" />
                    <path d="M 120 120 L 50 60 M 180 120 L 250 60 M 150 194 L 150 290" stroke="#c084fc" strokeWidth="4" />
                  </svg>
                )}
              </div>

              {/* Central Reticle Crosshairs & Scale Bar */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-8 h-8 border border-teal-400/30 rounded-full" />
                <div className="absolute bottom-4 right-8 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-teal-300">
                  Scale: {objectivePower === 100 ? '10 µm' : objectivePower === 40 ? '25 µm' : '100 µm'}
                </div>
              </div>
            </div>

            {/* Focus Quality Indicator */}
            <div className="w-full flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400">Image Clarity:</span>
              <span
                className={`font-semibold font-mono ${
                  Number(blurPixels) === 0
                    ? 'text-emerald-400'
                    : Number(blurPixels) < 1.5
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {Number(blurPixels) === 0
                  ? 'Crisp Focus (100%)'
                  : `Blurred (${blurPixels}px dispersion)`}
              </span>
            </div>
          </div>

          {/* Microscope Controls & Slide Selector Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Slide Specimen
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {selectedSlide.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Stain: {selectedSlide.stain}
                </p>
              </div>

              {/* Slide Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Choose Slide:</label>
                <div className="grid grid-cols-1 gap-2">
                  {microscopeSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedSlideIndex(idx);
                      }}
                      className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                        selectedSlideIndex === idx
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {slide.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objective Lens Turret */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Revolving Objective Turret:</label>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { power: 4, label: '4x' },
                    { power: 10, label: '10x' },
                    { power: 40, label: '40x' },
                    { power: 100, label: '100x Oil' },
                  ].map((obj) => (
                    <button
                      key={obj.power}
                      onClick={() => {
                        sound.playClick();
                        setObjectivePower(obj.power);
                      }}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                        objectivePower === obj.power
                          ? 'bg-teal-600 border-teal-400 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {obj.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coarse & Fine Focus Adjustment Knob */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">Focus Knob (Coarse/Fine):</label>
                  <span className="font-mono text-slate-400">{focusKnob} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={focusKnob}
                  onChange={(e) => setFocusKnob(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <button
                  onClick={() => setFocusKnob(selectedSlide.optimalFocus)}
                  className="text-[11px] text-teal-400 hover:underline"
                >
                  Auto-Focus to Sharpest Image
                </button>
              </div>

              {/* Sub-Stage Condenser / Iris Diaphragm Brightness */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Illumination Diaphragm:</span>
                  </label>
                  <span className="font-mono text-slate-400">{lightIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OSMOSIS SIMULATOR */}
      {activeLabTab === 'osmosis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                <span>Cell Semipermeable Membrane Beaker</span>
              </span>
              <span className="font-mono text-xs text-white uppercase font-bold">
                Tonicity: <strong className="text-cyan-400">{osmosisData.tonicity}</strong>
              </span>
            </div>

            {/* Beaker & Cell Simulation Canvas */}
            <div className="w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 500 280" className="w-full h-full select-none">
                {/* Glass Beaker */}
                <rect x="70" y="30" width="360" height="230" rx="18" fill="#032b30" fillOpacity="0.4" stroke="#475569" strokeWidth="3" />
                {/* Fluid level */}
                <rect x="75" y="60" width="350" height="195" rx="10" fill="#0284c7" fillOpacity="0.25" />

                {/* External Solute Particles (Salt) */}
                {Array.from({ length: Math.round(soluteOutside * 3) }).map((_, i) => (
                  <circle
                    key={i}
                    cx={90 + (i * 35) % 320}
                    cy={80 + (i * 25) % 150}
                    r="4"
                    fill="#facc15"
                  />
                ))}

                {/* Cell in Center (scales with relativeVolumeDelta) */}
                <g transform="translate(250, 160)">
                  <circle
                    cx="0"
                    cy="0"
                    r={60 + osmosisData.relativeVolumeDelta}
                    fill="#dc2626"
                    fillOpacity="0.85"
                    stroke="#fca5a5"
                    strokeWidth="3.5"
                    className="transition-all duration-500"
                  />
                  {/* Internal solute particles */}
                  <circle cx="-15" cy="-10" r="4" fill="#facc15" />
                  <circle cx="15" cy="15" r="4" fill="#facc15" />
                  <circle cx="-10" cy="20" r="4" fill="#facc15" />
                  <text x="0" y="5" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Cell ({soluteInside}% Solute)
                  </text>
                </g>

                {/* Flow arrows */}
                {osmosisData.flowDirection === 'inward' && (
                  <g stroke="#38bdf8" strokeWidth="2.5" fill="none">
                    <path d="M 140 160 L 175 160" />
                    <path d="M 360 160 L 325 160" />
                    <text x="250" y="240" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                      Net Water Inflow (Cell Swelling)
                    </text>
                  </g>
                )}
                {osmosisData.flowDirection === 'outward' && (
                  <g stroke="#f59e0b" strokeWidth="2.5" fill="none">
                    <path d="M 180 160 L 145 160" />
                    <path d="M 320 160 L 355 160" />
                    <text x="250" y="240" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                      Net Water Outflow (Plasmolysis / Shriveling)
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Scientific Explanation */}
            <p className="text-xs text-slate-300 leading-relaxed p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              {osmosisData.waterMovementDescription}
            </p>
          </div>

          {/* Osmosis Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Tonicity Simulator
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Solute & Water Potential
                </h2>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Quick Environmental Conditions:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSoluteOutside(1);
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      soluteOutside === 1
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hypotonic (1%)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSoluteOutside(5);
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      soluteOutside === 5
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Isotonic (5%)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSoluteOutside(12);
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      soluteOutside === 12
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hypertonic (12%)
                  </button>
                </div>
              </div>

              {/* Fine Solute Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">External Solution Concentration:</label>
                  <span className="font-mono text-cyan-400 font-bold">{soluteOutside}% Solute</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={soluteOutside}
                  onChange={(e) => setSoluteOutside(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Status Outcome Metric Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">Cell Physical Outcome:</span>
                <p className="text-sm font-bold text-white capitalize">
                  {osmosisData.cellOutcome}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                  <span>Relative Volume:</span>
                  <span className={osmosisData.relativeVolumeDelta > 0 ? 'text-emerald-400' : osmosisData.relativeVolumeDelta < 0 ? 'text-rose-400' : 'text-slate-200'}>
                    {osmosisData.relativeVolumeDelta > 0 ? `+${osmosisData.relativeVolumeDelta}%` : `${osmosisData.relativeVolumeDelta}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. NATURAL SELECTION SIMULATOR */}
      {activeLabTab === 'selection' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Darwinian Evolution
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                Industrial Melanism: The Peppered Moth (Biston betularia)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSelection}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Population</span>
              </button>
              <button
                onClick={handleNextGeneration}
                disabled={generation >= 5}
                className="px-4 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Advance Generation ({generation}/5)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tree Bark Environment Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Tree Trunk Environment:</span>
            <button
              onClick={() => {
                sound.playClick();
                setEnvironmentBark('light');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                environmentBark === 'light'
                  ? 'bg-slate-200 text-slate-950 border-white'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Pre-Industrial (Light Lichen Bark)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setEnvironmentBark('dark');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                environmentBark === 'dark'
                  ? 'bg-slate-950 text-white border-teal-400 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Industrial Soot (Dark Polluted Bark)
            </button>
          </div>

          {/* Population Frequency Chart */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Generation {generation} Population Distribution:</span>
              <div className="flex items-center gap-4 font-mono">
                <span className="text-slate-300">Light Moths: {lightMothsPercent}%</span>
                <span className="text-emerald-400">Dark Moths: {100 - lightMothsPercent}%</span>
              </div>
            </div>

            {/* Frequency Ratio Bar */}
            <div className="w-full h-8 bg-slate-800 rounded-lg overflow-hidden flex border border-slate-700">
              <div
                className="h-full bg-slate-300 transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-slate-950"
                style={{ width: `${lightMothsPercent}%` }}
              >
                {lightMothsPercent}% Light
              </div>
              <div
                className="h-full bg-slate-900 transition-all duration-500 flex items-center justify-center text-[11px] font-bold text-emerald-400"
                style={{ width: `${100 - lightMothsPercent}%` }}
              >
                {100 - lightMothsPercent}% Dark
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {environmentBark === 'dark'
                ? 'On dark soot-covered bark, light-colored moths stand out distinctly to predatory birds and suffer heavy predation. Dark melanic moths are camouflaged, survive at higher rates, and pass the dark pigmentation allele to subsequent generations.'
                : 'On pale lichen-covered bark, light moths are perfectly camouflaged against visual predators, whereas dark moths are easily spotted and predated, leading to a resurgence of the light phenotype.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. FOOD CHAIN ENERGY PYRAMID */}
      {activeLabTab === 'foodchain' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Ecological Thermodynamics
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">
              The 10% Energy Transfer Law
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Only approximately 10% of chemical energy transfers from one trophic level to the next; 90% is dissipated as metabolic heat and waste.
            </p>
          </div>

          <div className="space-y-3">
            {energyPyramid.map((tier, idx) => (
              <div
                key={idx}
                onClick={() => setTrophicLevel(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  trophicLevel === idx
                    ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
                style={{ marginLeft: `${idx * 16}px`, marginRight: `${idx * 16}px` }}
              >
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    Level {idx + 1}: {tier.level}
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{tier.organism}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-bold text-teal-300">{tier.energy}</span>
                  <p className="text-[11px] text-slate-400">{tier.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
