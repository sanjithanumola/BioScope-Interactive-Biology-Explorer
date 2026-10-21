import React from 'react';
import { SectionId, UserProgress } from '../types/biology';
import { DAILY_FACTS } from '../data/biologyData';
import { calculateUserLevel } from '../utils/biologyLogic';
import { sound } from '../utils/soundEffects';
import {
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Heart,
  Dna,
  Activity,
  Search,
  FlaskConical,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (section: SectionId) => void;
  progress: UserProgress;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, progress }) => {
  const userLevel = calculateUserLevel(progress.xp);

  // Rotating daily fact based on day of month
  const todayIndex = new Date().getDate() % DAILY_FACTS.length;
  const dailyFact = DAILY_FACTS[todayIndex];

  const topicCards: {
    id: SectionId;
    title: string;
    description: string;
    icon: React.ReactNode;
    tag: string;
    progressKey: string;
  }[] = [
    {
      id: 'anatomy',
      title: 'Human Anatomy Explorer',
      description:
        'Inspect major human organs, anatomical relationships, functions, and cross-system physiology with interactive SVG models.',
      icon: <Heart className="w-6 h-6 text-rose-400" />,
      tag: '10 Major Organs',
      progressKey: 'anatomy',
    },
    {
      id: 'cell',
      title: 'Cellular Explorer',
      description:
        'Compare plant and animal cells, zoom into organelles, and investigate how cells synthesize proteins and ATP.',
      icon: <Layers className="w-6 h-6 text-teal-400" />,
      tag: 'Animal vs Plant',
      progressKey: 'cell',
    },
    {
      id: 'dna',
      title: 'DNA & Genetics Lab',
      description:
        'Examine the double helix, Watson-Crick base-pairing, DNA replication forks, and calculate Mendelian Punnett squares.',
      icon: <Dna className="w-6 h-6 text-violet-400" />,
      tag: 'Helix & Punnett Square',
      progressKey: 'dna',
    },
    {
      id: 'systems',
      title: 'Body Systems Lab',
      description:
        'Explore step-by-step animated models of blood circulation, alveolar respiration, peristalsis, and nerve conduction.',
      icon: <Activity className="w-6 h-6 text-cyan-400" />,
      tag: '9 Organ Systems',
      progressKey: 'systems',
    },
    {
      id: 'microscopic',
      title: 'Microscopic World',
      description:
        'Zoom across biological scales from atoms and DNA up to bacteria, mammalian red blood cells, and tissues.',
      icon: <Search className="w-6 h-6 text-amber-400" />,
      tag: 'Scale from 0.1nm to 1m',
      progressKey: 'microscopic',
    },
    {
      id: 'lab',
      title: 'Virtual Biology Lab',
      description:
        'Operate an adjustable virtual microscope, run semipermeable osmosis experiments, and test natural selection simulations.',
      icon: <FlaskConical className="w-6 h-6 text-emerald-400" />,
      tag: 'Interactive Simulations',
      progressKey: 'lab',
    },
  ];

  const handleCardClick = (id: SectionId) => {
    sound.playClick();
    onNavigate(id);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Scientific Learning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Explore Life from Molecules to Organisms in <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">BioScope</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Delve into interactive human anatomy, zoom into microscopic plant and animal cells, simulate DNA replication and inheritance, and run virtual laboratory experiments.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleCardClick('anatomy')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all hover:scale-102"
            >
              <span>Explore Biology</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCardClick('quizzes')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <span>Test Your Knowledge</span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs text-slate-400">Total Organs</span>
              <p className="text-xl font-bold text-white font-mono">10 Detailed</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs text-slate-400">Cell Modes</span>
              <p className="text-xl font-bold text-teal-400 font-mono">Animal & Plant</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs text-slate-400">Body Systems</span>
              <p className="text-xl font-bold text-cyan-400 font-mono">9 Animated</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-xs text-slate-400">Virtual Labs</span>
              <p className="text-xl font-bold text-emerald-400 font-mono">4 Experiments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Biology Fact Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-5 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-wider uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daily Biology Fact · {dailyFact.category}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">
              "{dailyFact.fact}"
            </p>
          </div>
          <button
            onClick={() => handleCardClick('microscopic')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium whitespace-nowrap self-end sm:self-center shrink-0 flex items-center gap-1"
          >
            Explore Micro World →
          </button>
        </div>
      </section>

      {/* Continue Learning Strip (if user has previous section) */}
      {progress.lastVisitedSection && progress.lastVisitedSection !== 'home' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Continue where you left off</span>
                <p className="text-sm font-semibold text-white capitalize">
                  {progress.lastVisitedSection} Module
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCardClick(progress.lastVisitedSection)}
              className="px-4 py-2 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* Core Topics Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Core Learning Modules</h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose an area of biological science to explore visual models and interactive experiments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topicCards.map((card) => {
            const completion = progress.topicProgress[card.progressKey] || 0;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="group p-5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-teal-400 transition-colors">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-teal-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <span className="text-slate-500 font-mono">{completion}%</span>
                  </div>
                  <span className="text-teal-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Enter <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Scientific Discoveries & Quick Quiz Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scientific Discoveries */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Milestones in Biology</span>
          </div>
          <h3 className="text-lg font-bold text-white">How We Decoded Life</h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="font-mono text-cyan-400 font-bold">1665</span>
              <span>Robert Hooke observes cork with an early microscope and coins the biological term <em>"cell"</em>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-cyan-400 font-bold">1865</span>
              <span>Gregor Mendel discovers hereditary segregation and independent assortment through pea plant crosses.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-cyan-400 font-bold">1953</span>
              <span>Watson, Crick, and Franklin discover the DNA double helix and base-pairing mechanism.</span>
            </li>
          </ul>
        </div>

        {/* Quick Quiz Banner */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-teal-950/30 border border-teal-500/20 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Biology Mastery Quiz</span>
            </div>
            <h3 className="text-lg font-bold text-white">Challenge Your Biology Knowledge</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Earn XP, unlock achievements, and test your understanding of human organs, cell organelles, genetics, and body systems.
            </p>
          </div>
          <button
            onClick={() => handleCardClick('quizzes')}
            className="w-full py-2.5 px-4 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Start Practice Quiz (+50 XP)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
