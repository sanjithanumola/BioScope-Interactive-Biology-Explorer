import React, { useState } from 'react';
import { GLOSSARY_TERMS, ORGANS, ORGANELLES } from '../data/biologyData';
import { GlossaryEntry, SectionId } from '../types/biology';
import { sound } from '../utils/soundEffects';
import {
  Search,
  X,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    'all',
    'Anatomy',
    'Cytology',
    'Genetics',
    'Physiology',
    'Microbiology',
  ];

  // Combined searchable entries: glossary terms + organs + organelles
  const filteredGlossary = GLOSSARY_TERMS.filter((entry) => {
    if (selectedCategory !== 'all' && entry.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      entry.term.toLowerCase().includes(q) ||
      entry.simpleDefinition.toLowerCase().includes(q) ||
      entry.detailedExplanation.toLowerCase().includes(q) ||
      entry.relatedTerms.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleJump = (section: SectionId) => {
    sound.playClick();
    onNavigate(section);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            type="text"
            placeholder="Search biology concepts, organs, organelles, or terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-md capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-3 divide-y divide-slate-800/60 flex-1">
          {filteredGlossary.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">No biology terms matched "{searchQuery}"</p>
              <p className="text-xs text-slate-500">
                Try searching for "Mitochondria", "Nephron", "Alveoli", or "DNA".
              </p>
            </div>
          ) : (
            filteredGlossary.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-3' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{item.term}</h3>
                      {item.pronunciation && (
                        <span className="text-[11px] font-mono text-slate-400 italic">
                          {item.pronunciation}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {item.simpleDefinition}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.detailedExplanation}
                    </p>
                  </div>

                  <button
                    onClick={() => handleJump(item.relatedSection)}
                    className="shrink-0 p-2 text-xs font-semibold text-teal-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg flex items-center gap-1"
                    title={`Jump to ${item.relatedSection} module`}
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
