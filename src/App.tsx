import React, { useState, useEffect } from 'react';
import { SectionId, UserProgress, AppSettings } from './types/biology';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { AnatomyExplorer } from './components/AnatomyExplorer';
import { CellExplorer } from './components/CellExplorer';
import { DnaGeneticsLab } from './components/DnaGeneticsLab';
import { BodySystemsLab } from './components/BodySystemsLab';
import { MicroscopicWorld } from './components/MicroscopicWorld';
import { BiologyLab } from './components/BiologyLab';
import { QuizzesEngine } from './components/QuizzesEngine';
import { ProgressDashboard } from './components/ProgressDashboard';
import { GlossaryModal } from './components/GlossaryModal';
import { SettingsModal } from './components/SettingsModal';
import { sound } from './utils/soundEffects';

const DEFAULT_PROGRESS: UserProgress = {
  xp: 120,
  completedTopics: {},
  topicProgress: {
    anatomy: 20,
    cell: 15,
    dna: 25,
    systems: 10,
    microscopic: 10,
    lab: 0,
  },
  streakDays: 2,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedAchievements: ['first_steps'],
  bookmarkedItems: [
    { id: 'heart', title: 'Heart', section: 'anatomy', category: 'circulatory' },
    { id: 'mitochondria', title: 'Mitochondria', section: 'cell', category: 'both' },
  ],
  quizHistory: [
    {
      id: 'quiz_seed_1',
      topic: 'Cell Biology',
      score: 4,
      total: 5,
      percentage: 80,
      date: new Date().toLocaleDateString(),
    },
  ],
  lastVisitedSection: 'anatomy',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  reducedMotion: false,
  soundEnabled: true,
  fontSize: 'normal',
};

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize Progress from localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('bioscope_progress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROGRESS;
  });

  // Initialize Settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('bioscope_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Check URL query param ?autostart=1 or ?section=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autostart = params.get('autostart');
    const sec = params.get('section') as SectionId;
    if (autostart === '1') {
      setActiveSection('anatomy');
    } else if (sec) {
      setActiveSection(sec);
    }
  }, []);

  // Update streak on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setProgress((prev) => {
      if (prev.lastActiveDate === today) return prev;

      const lastDate = new Date(prev.lastActiveDate);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = prev.streakDays;
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }

      return {
        ...prev,
        streakDays: newStreak,
        lastActiveDate: today,
      };
    });
  }, []);

  // Sync Progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bioscope_progress', JSON.stringify(progress));
    } catch {
      // Ignore storage errors
    }
  }, [progress]);

  // Sync Settings to localStorage and document classes
  useEffect(() => {
    try {
      localStorage.setItem('bioscope_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }

    sound.enabled = settings.soundEnabled;

    if (settings.theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [settings]);

  // Keyboard shortcut to open search with '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && (isSearchOpen || isSettingsOpen)) {
        setIsSearchOpen(false);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isSettingsOpen]);

  // Bookmark handlers
  const handleAddBookmark = (item: { id: string; title: string; section: SectionId; category: string }) => {
    setProgress((prev) => {
      if (prev.bookmarkedItems.some((b) => b.id === item.id)) return prev;
      return {
        ...prev,
        bookmarkedItems: [...prev.bookmarkedItems, item],
      };
    });
  };

  const handleRemoveBookmark = (id: string) => {
    setProgress((prev) => ({
      ...prev,
      bookmarkedItems: prev.bookmarkedItems.filter((b) => b.id !== id),
    }));
  };

  const handleResetProgress = () => {
    setProgress({
      ...DEFAULT_PROGRESS,
      xp: 0,
      topicProgress: {
        anatomy: 0,
        cell: 0,
        dna: 0,
        systems: 0,
        microscopic: 0,
        lab: 0,
      },
      completedTopics: {},
      unlockedAchievements: [],
      bookmarkedItems: [],
      quizHistory: [],
      streakDays: 1,
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        settings.theme === 'light'
          ? 'bg-slate-50 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      } ${
        settings.fontSize === 'large'
          ? 'text-base'
          : settings.fontSize === 'xlarge'
          ? 'text-lg'
          : 'text-sm'
      }`}
    >
      {/* Universal Top Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        progress={progress}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-8">
        {activeSection === 'home' && (
          <HomeView
            onNavigate={setActiveSection}
            progress={progress}
          />
        )}

        {activeSection === 'anatomy' && (
          <AnatomyExplorer
            progress={progress}
            onUpdateProgress={setProgress}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}

        {activeSection === 'cell' && (
          <CellExplorer
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}

        {activeSection === 'dna' && (
          <DnaGeneticsLab
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}

        {activeSection === 'systems' && (
          <BodySystemsLab
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}

        {activeSection === 'microscopic' && (
          <MicroscopicWorld
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}

        {activeSection === 'lab' && (
          <BiologyLab
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}

        {activeSection === 'quizzes' && (
          <QuizzesEngine
            progress={progress}
            onUpdateProgress={setProgress}
          />
        )}

        {activeSection === 'progress' && (
          <ProgressDashboard
            progress={progress}
            onNavigate={setActiveSection}
            onResetProgress={handleResetProgress}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}

        {activeSection === 'settings' && (
          <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
            <p className="text-sm text-slate-400 mb-6">Use the Settings dialog to customize themes and accessibility.</p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Open Settings Modal
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-400 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">BioScope</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Biology Learning Platform</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <span>For educational and scientific exploration only · Not medical advice</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <GlossaryModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setActiveSection}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
