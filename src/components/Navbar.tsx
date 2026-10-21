import React from 'react';
import { SectionId, UserProgress } from '../types/biology';
import { calculateUserLevel } from '../utils/biologyLogic';
import { sound } from '../utils/soundEffects';
import {
  Compass,
  Search,
  Bookmark,
  Settings,
  Sparkles,
  Flame,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  progress: UserProgress;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  progress,
  onOpenSearch,
  onOpenSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const userLevel = calculateUserLevel(progress.xp);

  const navLinks: { id: SectionId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'anatomy', label: 'Anatomy' },
    { id: 'cell', label: 'Cell Explorer' },
    { id: 'dna', label: 'DNA & Genetics' },
    { id: 'systems', label: 'Body Systems' },
    { id: 'microscopic', label: 'Microscopic' },
    { id: 'lab', label: 'Biology Lab' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'progress', label: 'My Progress' },
  ];

  const handleNavClick = (section: SectionId) => {
    sound.playClick();
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Brand Zone - Strict single wordmark adhering to Top Bar Contract */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          aria-label="BioScope Home"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition-colors">
            <Compass className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors whitespace-nowrap">
            BioScope
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300"
          aria-label="Main Navigation"
        >
          {navLinks.slice(0, 7).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 relative py-1 ${
                activeSection === item.id
                  ? 'text-teal-300 font-semibold'
                  : 'text-slate-300'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
              )}
            </button>
          ))}

          {/* More menu items */}
          <button
            onClick={() => handleNavClick('quizzes')}
            className={`hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 relative py-1 ${
              activeSection === 'quizzes'
                ? 'text-teal-300 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Quizzes
            {activeSection === 'quizzes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleNavClick('progress')}
            className={`hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 relative py-1 ${
              activeSection === 'progress'
                ? 'text-teal-300 font-semibold'
                : 'text-slate-300'
            }`}
          >
            Progress
            {activeSection === 'progress' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Action Zone: Search, Streak/XP Indicator, Settings */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSearch();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Search biology glossary, organs & concepts"
            aria-label="Search biology database"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline text-[10px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono">
              /
            </kbd>
          </button>

          {/* User XP & Streak Indicator */}
          <button
            onClick={() => handleNavClick('progress')}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-200 transition-colors"
            title={`Level ${userLevel.level}: ${userLevel.title}`}
          >
            <div className="flex items-center gap-1 text-amber-400 font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{progress.xp} XP</span>
            </div>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <div className="flex items-center gap-1 text-orange-400 font-mono">
              <Flame className="w-3.5 h-3.5" />
              <span>{progress.streakDays}d</span>
            </div>
          </button>

          {/* Bookmarks Quick Link */}
          {progress.bookmarkedItems.length > 0 && (
            <button
              onClick={() => handleNavClick('progress')}
              className="p-2 text-slate-400 hover:text-teal-300 transition-colors rounded-lg hover:bg-slate-900"
              title={`${progress.bookmarkedItems.length} bookmarked items`}
              aria-label="View bookmarked items"
            >
              <Bookmark className="w-4 h-4 fill-teal-400/20 text-teal-400" />
            </button>
          )}

          {/* Settings Modal Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-900"
            title="Application Settings & Themes"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-1">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-teal-500/15 text-teal-300'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-3 py-2">
            <span>
              Lvl {userLevel.level} {userLevel.title}
            </span>
            <span className="font-mono text-teal-400">{progress.xp} XP</span>
          </div>
        </div>
      )}
    </header>
  );
};
