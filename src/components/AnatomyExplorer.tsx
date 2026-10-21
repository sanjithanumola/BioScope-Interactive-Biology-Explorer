import React, { useState } from 'react';
import { ORGANS } from '../data/biologyData';
import { OrganData, BodySystemCategory, UserProgress } from '../types/biology';
import { sound } from '../utils/soundEffects';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Bookmark,
  Check,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AnatomyExplorerProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onAddBookmark: (item: { id: string; title: string; section: 'anatomy'; category: string }) => void;
  onRemoveBookmark: (id: string) => void;
}

export const AnatomyExplorer: React.FC<AnatomyExplorerProps> = ({
  progress,
  onUpdateProgress,
  onAddBookmark,
  onRemoveBookmark,
}) => {
  const [selectedOrganId, setSelectedOrganId] = useState<string>('heart');
  const [activeSystemFilter, setActiveSystemFilter] = useState<string>('all');
  const [hiddenOrganIds, setHiddenOrganIds] = useState<Set<string>>(new Set());

  const selectedOrgan = ORGANS.find((o) => o.id === selectedOrganId) || ORGANS[1];

  const systemFilters: { id: string; label: string }[] = [
    { id: 'all', label: 'All Organs' },
    { id: 'circulatory', label: 'Circulatory' },
    { id: 'respiratory', label: 'Respiratory' },
    { id: 'digestive', label: 'Digestive' },
    { id: 'nervous', label: 'Nervous' },
    { id: 'urinary', label: 'Urinary' },
    { id: 'endocrine', label: 'Endocrine' },
    { id: 'immune', label: 'Immune' },
  ];

  const handleSelectOrgan = (organ: OrganData) => {
    sound.playSelect();
    setSelectedOrganId(organ.id);

    // Track progress and grant achievement XP
    onUpdateProgress((prev) => {
      const completed = { ...prev.completedTopics, [`organ_${organ.id}`]: true };
      const organCount = ORGANS.filter((o) => completed[`organ_${o.id}`]).length;
      const progressPercent = Math.round((organCount / ORGANS.length) * 100);

      const unlocked = [...prev.unlockedAchievements];
      let xpBonus = 0;

      if (!unlocked.includes('first_steps')) {
        unlocked.push('first_steps');
        xpBonus += 30;
      }
      if (organCount === ORGANS.length && !unlocked.includes('anatomist')) {
        unlocked.push('anatomist');
        xpBonus += 100;
      }

      return {
        ...prev,
        xp: prev.xp + 10 + xpBonus,
        completedTopics: completed,
        topicProgress: {
          ...prev.topicProgress,
          anatomy: progressPercent,
        },
        unlockedAchievements: unlocked,
        lastVisitedSection: 'anatomy',
      };
    });
  };

  const handleToggleHide = (organId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setHiddenOrganIds((prev) => {
      const next = new Set(prev);
      if (next.has(organId)) {
        next.delete(organId);
      } else {
        next.add(organId);
      }
      return next;
    });
  };

  const handleReset = () => {
    sound.playClick();
    setHiddenOrganIds(new Set());
    setActiveSystemFilter('all');
    setSelectedOrganId('heart');
  };

  const isBookmarked = progress.bookmarkedItems.some((b) => b.id === selectedOrgan.id);

  const toggleBookmark = () => {
    sound.playClick();
    if (isBookmarked) {
      onRemoveBookmark(selectedOrgan.id);
    } else {
      onAddBookmark({
        id: selectedOrgan.id,
        title: selectedOrgan.name,
        section: 'anatomy',
        category: selectedOrgan.system,
      });
    }
  };

  // Color mapping per organ
  const getOrganVisuals = (organId: string) => {
    switch (organId) {
      case 'brain':
        return { fill: '#c084fc', stroke: '#a855f7', label: 'Brain' };
      case 'heart':
        return { fill: '#f43f5e', stroke: '#e11d48', label: 'Heart' };
      case 'lungs':
        return { fill: '#38bdf8', stroke: '#0284c7', label: 'Lungs' };
      case 'liver':
        return { fill: '#b45309', stroke: '#92400e', label: 'Liver' };
      case 'stomach':
        return { fill: '#fb923c', stroke: '#ea580c', label: 'Stomach' };
      case 'kidneys':
        return { fill: '#a855f7', stroke: '#9333ea', label: 'Kidneys' };
      case 'intestines':
        return { fill: '#fbbf24', stroke: '#d97706', label: 'Intestines' };
      case 'bladder':
        return { fill: '#facc15', stroke: '#eab308', label: 'Bladder' };
      case 'pancreas':
        return { fill: '#f472b6', stroke: '#db2777', label: 'Pancreas' };
      case 'spleen':
        return { fill: '#818cf8', stroke: '#6366f1', label: 'Spleen' };
      default:
        return { fill: '#14b8a6', stroke: '#0d9488', label: 'Organ' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Human Anatomy Explorer</span>
            <span className="text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              Interactive SVG
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Click any organ or system to inspect its physiological function, anatomical landmarks, and biological role.
          </p>
        </div>

        {/* Reset View Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* System Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {systemFilters.map((sys) => (
          <button
            key={sys.id}
            onClick={() => {
              sound.playClick();
              setActiveSystemFilter(sys.id);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeSystemFilter === sys.id
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            {sys.label}
          </button>
        ))}
      </div>

      {/* Two-Zone Sandbox Layout (Interactive Stage + Concept Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone: Interactive SVG Anatomy Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
          {/* Top Canvas Toolbar */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80 mb-2">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Coronal Plane · Anterior View</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Selected: <strong className="text-white">{selectedOrgan.name}</strong>
            </span>
          </div>

          {/* SVG Body Viewport */}
          <div className="w-full max-w-[420px] aspect-[400/580] relative flex items-center justify-center">
            <svg
              viewBox="0 0 400 580"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Glow Filter for Active Selection */}
                <filter id="organGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Body Outline Gradient */}
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Human Silhouette Blueprint */}
              <g className="opacity-70 transition-opacity">
                {/* Head */}
                <ellipse cx="200" cy="72" rx="42" ry="52" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.5" />
                {/* Neck */}
                <path d="M 184 122 L 184 145 L 216 145 L 216 122" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.5" />
                {/* Torso & Shoulders */}
                <path
                  d="M 130 152 C 150 144, 250 144, 270 152 C 290 160, 278 220, 270 280 C 265 330, 260 380, 250 440 L 150 440 C 140 380, 135 330, 130 280 C 122 220, 110 160, 130 152 Z"
                  fill="url(#bodyGrad)"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                {/* Arms Silhouette */}
                <path
                  d="M 125 156 C 105 180, 95 240, 90 320 L 105 322 C 112 250, 120 190, 132 165 Z"
                  fill="url(#bodyGrad)"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <path
                  d="M 275 156 C 295 180, 305 240, 310 320 L 295 322 C 288 250, 280 190, 268 165 Z"
                  fill="url(#bodyGrad)"
                  stroke="#334155"
                  strokeWidth="1"
                />
                {/* Legs Base Silhouette */}
                <path
                  d="M 150 440 L 140 560 L 180 560 L 195 470 L 205 470 L 220 560 L 260 560 L 250 440 Z"
                  fill="url(#bodyGrad)"
                  stroke="#334155"
                  strokeWidth="1"
                />

                {/* Subtle anatomical landmarks (clavicles and ribcage guide) */}
                <path d="M 150 155 Q 200 165 250 155" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <ellipse cx="200" cy="220" rx="60" ry="40" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 4" />
              </g>

              {/* ANATOMICAL ORGANS */}

              {/* 1. BRAIN */}
              {(!hiddenOrganIds.has('brain') && (activeSystemFilter === 'all' || activeSystemFilter === 'nervous')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[0])}
                  className="cursor-pointer group"
                >
                  <path
                    d="M 175 65 C 175 42, 225 42, 225 65 C 228 78, 220 95, 200 95 C 180 95, 172 78, 175 65 Z"
                    fill={selectedOrganId === 'brain' ? '#c084fc' : '#a855f7'}
                    stroke={selectedOrganId === 'brain' ? '#ffffff' : '#9333ea'}
                    strokeWidth={selectedOrganId === 'brain' ? '2.5' : '1.5'}
                    filter={selectedOrganId === 'brain' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-90"
                  />
                  {/* Cerebellum */}
                  <ellipse cx="200" cy="98" rx="14" ry="7" fill="#7e22ce" />
                </g>
              )}

              {/* 2. LUNGS */}
              {(!hiddenOrganIds.has('lungs') && (activeSystemFilter === 'all' || activeSystemFilter === 'respiratory')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[2])}
                  className="cursor-pointer group"
                >
                  {/* Trachea */}
                  <path d="M 200 135 L 200 170 M 194 175 L 180 185 M 206 175 L 220 185" fill="none" stroke="#64748b" strokeWidth="2.5" />
                  {/* Right Lung (Viewer's Left) */}
                  <path
                    d="M 188 180 C 160 178, 148 200, 150 238 C 152 265, 170 270, 188 268 C 190 230, 192 195, 188 180 Z"
                    fill={selectedOrganId === 'lungs' ? '#38bdf8' : '#0284c7'}
                    stroke={selectedOrganId === 'lungs' ? '#ffffff' : '#0369a1'}
                    strokeWidth={selectedOrganId === 'lungs' ? '2.5' : '1.5'}
                    filter={selectedOrganId === 'lungs' ? 'url(#organGlow)' : undefined}
                    opacity="0.88"
                    className="transition-all hover:opacity-100"
                  />
                  {/* Left Lung with Cardiac Notch (Viewer's Right) */}
                  <path
                    d="M 212 180 C 240 178, 252 200, 250 238 C 248 265, 230 268, 218 268 C 214 245, 222 225, 212 210 Z"
                    fill={selectedOrganId === 'lungs' ? '#38bdf8' : '#0284c7'}
                    stroke={selectedOrganId === 'lungs' ? '#ffffff' : '#0369a1'}
                    strokeWidth={selectedOrganId === 'lungs' ? '2.5' : '1.5'}
                    filter={selectedOrganId === 'lungs' ? 'url(#organGlow)' : undefined}
                    opacity="0.88"
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* 3. HEART */}
              {(!hiddenOrganIds.has('heart') && (activeSystemFilter === 'all' || activeSystemFilter === 'circulatory')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[1])}
                  className="cursor-pointer group"
                >
                  {/* Aorta Arch */}
                  <path d="M 198 186 C 198 174, 212 174, 214 186" fill="none" stroke="#ef4444" strokeWidth="4" />
                  {/* Heart Muscle Cone */}
                  <path
                    d="M 202 188 C 220 188, 226 200, 224 216 C 222 230, 210 242, 204 246 C 196 242, 188 230, 188 212 C 188 196, 196 188, 202 188 Z"
                    fill={selectedOrganId === 'heart' ? '#f43f5e' : '#e11d48'}
                    stroke={selectedOrganId === 'heart' ? '#ffffff' : '#be123c'}
                    strokeWidth={selectedOrganId === 'heart' ? '2.5' : '1.5'}
                    filter={selectedOrganId === 'heart' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* 4. LIVER */}
              {(!hiddenOrganIds.has('liver') && (activeSystemFilter === 'all' || activeSystemFilter === 'digestive')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[3])}
                  className="cursor-pointer group"
                >
                  <path
                    d="M 160 252 C 180 248, 224 248, 220 262 C 218 274, 204 286, 172 284 C 158 280, 154 265, 160 252 Z"
                    fill={selectedOrganId === 'liver' ? '#b45309' : '#92400e'}
                    stroke={selectedOrganId === 'liver' ? '#ffffff' : '#78350f'}
                    strokeWidth={selectedOrganId === 'liver' ? '2.5' : '1.5'}
                    filter={selectedOrganId === 'liver' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* 5. STOMACH */}
              {(!hiddenOrganIds.has('stomach') && (activeSystemFilter === 'all' || activeSystemFilter === 'digestive')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[4])}
                  className="cursor-pointer group"
                >
                  <path
                    d="M 218 255 C 235 254, 245 264, 242 278 C 238 290, 224 294, 214 286 C 210 278, 214 265, 218 255 Z"
                    fill={selectedOrganId === 'stomach' ? '#fb923c' : '#ea580c'}
                    stroke={selectedOrganId === 'stomach' ? '#ffffff' : '#c2410c'}
                    strokeWidth={selectedOrganId === 'stomach' ? '2.5' : '1.5'}
                    filter={selectedOrganId === 'stomach' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* 6. PANCREAS */}
              {(!hiddenOrganIds.has('pancreas') && (activeSystemFilter === 'all' || activeSystemFilter === 'endocrine' || activeSystemFilter === 'digestive')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[8])}
                  className="cursor-pointer group"
                >
                  <path
                    d="M 198 285 C 212 283, 230 285, 236 290 C 228 294, 210 293, 198 289 Z"
                    fill={selectedOrganId === 'pancreas' ? '#f472b6' : '#db2777'}
                    stroke={selectedOrganId === 'pancreas' ? '#ffffff' : '#be185d'}
                    strokeWidth={selectedOrganId === 'pancreas' ? '2' : '1'}
                    filter={selectedOrganId === 'pancreas' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* 7. SPLEEN */}
              {(!hiddenOrganIds.has('spleen') && (activeSystemFilter === 'all' || activeSystemFilter === 'immune')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[9])}
                  className="cursor-pointer group"
                >
                  <ellipse
                    cx="246"
                    cy="268"
                    rx="9"
                    ry="14"
                    fill={selectedOrganId === 'spleen' ? '#818cf8' : '#6366f1'}
                    stroke={selectedOrganId === 'spleen' ? '#ffffff' : '#4f46e5'}
                    strokeWidth={selectedOrganId === 'spleen' ? '2' : '1'}
                    filter={selectedOrganId === 'spleen' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* 8. KIDNEYS */}
              {(!hiddenOrganIds.has('kidneys') && (activeSystemFilter === 'all' || activeSystemFilter === 'urinary')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[5])}
                  className="cursor-pointer group"
                >
                  {/* Left Kidney (Viewer's Right) */}
                  <path
                    d="M 232 295 C 242 295, 246 304, 244 314 C 242 322, 232 322, 230 312 C 228 304, 226 295, 232 295 Z"
                    fill={selectedOrganId === 'kidneys' ? '#c084fc' : '#9333ea'}
                    stroke={selectedOrganId === 'kidneys' ? '#ffffff' : '#7e22ce'}
                    strokeWidth={selectedOrganId === 'kidneys' ? '2' : '1'}
                    filter={selectedOrganId === 'kidneys' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                  {/* Right Kidney (Viewer's Left - slightly lower due to liver) */}
                  <path
                    d="M 166 302 C 176 302, 178 311, 176 321 C 174 329, 164 329, 162 319 C 160 311, 160 302, 166 302 Z"
                    fill={selectedOrganId === 'kidneys' ? '#c084fc' : '#9333ea'}
                    stroke={selectedOrganId === 'kidneys' ? '#ffffff' : '#7e22ce'}
                    strokeWidth={selectedOrganId === 'kidneys' ? '2' : '1'}
                    filter={selectedOrganId === 'kidneys' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                  {/* Ureters running to bladder */}
                  <path d="M 170 321 Q 185 360 196 385 M 238 314 Q 215 360 204 385" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />
                </g>
              )}

              {/* 9. INTESTINES */}
              {(!hiddenOrganIds.has('intestines') && (activeSystemFilter === 'all' || activeSystemFilter === 'digestive')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[6])}
                  className="cursor-pointer group"
                >
                  {/* Large Intestine Framing */}
                  <path
                    d="M 168 375 L 168 315 C 168 305, 232 305, 232 315 L 232 375"
                    fill="none"
                    stroke={selectedOrganId === 'intestines' ? '#fbbf24' : '#d97706'}
                    strokeWidth={selectedOrganId === 'intestines' ? '14' : '12'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={selectedOrganId === 'intestines' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                  {/* Small Intestine Coils */}
                  <path
                    d="M 180 325 Q 220 330 185 340 Q 220 348 185 358 Q 215 365 200 375"
                    fill="none"
                    stroke={selectedOrganId === 'intestines' ? '#fde047' : '#f59e0b'}
                    strokeWidth={selectedOrganId === 'intestines' ? '9' : '7'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* 10. BLADDER */}
              {(!hiddenOrganIds.has('bladder') && (activeSystemFilter === 'all' || activeSystemFilter === 'urinary')) && (
                <g
                  onClick={() => handleSelectOrgan(ORGANS[7])}
                  className="cursor-pointer group"
                >
                  <ellipse
                    cx="200"
                    cy="392"
                    rx="18"
                    ry="14"
                    fill={selectedOrganId === 'bladder' ? '#facc15' : '#eab308'}
                    stroke={selectedOrganId === 'bladder' ? '#ffffff' : '#ca8a04'}
                    strokeWidth={selectedOrganId === 'bladder' ? '2.5' : '1.5'}
                    filter={selectedOrganId === 'bladder' ? 'url(#organGlow)' : undefined}
                    className="transition-all hover:opacity-100"
                  />
                </g>
              )}

              {/* Target Pointer Ring on Selected Organ */}
              <circle
                cx={selectedOrgan.coordinates.x}
                cy={selectedOrgan.coordinates.y}
                r="18"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="animate-spin"
                style={{ transformOrigin: `${selectedOrgan.coordinates.x}px ${selectedOrgan.coordinates.y}px`, animationDuration: '8s' }}
              />
            </svg>
          </div>

          {/* Canvas Legend & Quick Organ List */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
            {ORGANS.map((organ) => {
              const isHidden = hiddenOrganIds.has(organ.id);
              const isSelected = selectedOrganId === organ.id;
              const visuals = getOrganVisuals(organ.id);
              return (
                <button
                  key={organ.id}
                  onClick={() => handleSelectOrgan(organ)}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-slate-800 text-white border-teal-400 font-semibold shadow-sm'
                      : isHidden
                      ? 'bg-slate-950/60 text-slate-500 border-slate-800 line-through'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: visuals.fill }}
                  />
                  <span>{organ.name}</span>
                  <span
                    onClick={(e) => handleToggleHide(organ.id, e)}
                    className="ml-1 text-slate-500 hover:text-white"
                    title={isHidden ? 'Show organ' : 'Hide organ'}
                  >
                    {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Zone: Organ Details Inspector & Biological Deck (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            {/* Title Lockup */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold">
                  {selectedOrgan.system} System
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  {selectedOrgan.name}
                </h2>
                <p className="text-xs text-slate-400 italic">
                  Anatomical Term: {selectedOrgan.latinName}
                </p>
              </div>

              {/* Bookmark Button */}
              <button
                onClick={toggleBookmark}
                className={`p-2.5 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this organ'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-teal-300' : ''}`} />
              </button>
            </div>

            {/* Anatomical Location */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Anatomical Location
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedOrgan.location}
              </p>
            </div>

            {/* Primary Physiological Function */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-400" />
                <span>Primary Biological Function</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedOrgan.primaryFunction}
              </p>
            </div>

            {/* Key Anatomical Structures */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Key Structures & Sub-Regions
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedOrgan.structures.map((struct, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                    <span>{struct}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scientific Facts */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Did You Know?</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {selectedOrgan.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono text-[11px]">·</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-800">
              * BioScope models are simplified for educational visualization and learning, not for clinical diagnosis or surgery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
