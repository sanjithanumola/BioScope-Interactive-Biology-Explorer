import React from 'react';
import { AppSettings } from '../types/biology';
import { sound } from '../utils/soundEffects';
import {
  Settings,
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  Type,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const toggleTheme = () => {
    sound.playClick();
    onUpdateSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const toggleReducedMotion = () => {
    sound.playClick();
    onUpdateSettings((prev) => ({
      ...prev,
      reducedMotion: !prev.reducedMotion,
    }));
  };

  const toggleSound = () => {
    sound.playClick();
    sound.enabled = !settings.soundEnabled;
    onUpdateSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleFontSizeChange = (size: 'normal' | 'large' | 'xlarge') => {
    sound.playClick();
    onUpdateSettings((prev) => ({
      ...prev,
      fontSize: size,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Application Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6">
          {/* Theme Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                {settings.theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span>Interface Theme</span>
              </span>
              <p className="text-[11px] text-slate-400">
                {settings.theme === 'dark' ? 'Deep Navy Scientific Museum (Dark)' : 'Publication Laboratory (Light)'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-400" />
                <span>Reduced Motion</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Disables animated rotations, pulsing, and transitions
              </p>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.reducedMotion ? 'bg-teal-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Synthesizer Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Scientific Audio Effects</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Subtle Web Audio chimes for organ selection and quiz feedback
              </p>
            </div>
            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.soundEnabled ? 'bg-teal-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Text Font Scale */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-violet-400" />
              <span>Reading Font Scale</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleFontSizeChange(s)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border capitalize ${
                    settings.fontSize === s
                      ? 'bg-violet-600 border-violet-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Educational Disclaimer:</strong> BioScope is designed for student learning and scientific education. It is not intended for medical diagnosis, treatment planning, or clinical practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
