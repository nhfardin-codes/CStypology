import React, { useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Upload,
  CheckCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { UserSettings, SoundTheme, CaretStyle, AppTheme, BackspaceMode } from '../types';
import { soundEngine } from '../services/soundEngine';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const keystrokeFileInputRef = useRef<HTMLInputElement>(null);
  const errorFileInputRef = useRef<HTMLInputElement>(null);

  const handleTestKeySound = () => {
    soundEngine.playKeySound(false);
  };

  const handleTestErrorSound = () => {
    soundEngine.playErrorSound();
  };

  const handleKeystrokeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await soundEngine.loadCustomAudio(file, 'keystroke');
    if (ok) {
      onUpdateSettings({
        soundTheme: 'custom',
        hasCustomKeystrokeAudio: true,
        soundEnabled: true,
      });
      soundEngine.setSoundTheme('custom');
      soundEngine.playKeySound(false);
    }
  };

  const handleErrorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await soundEngine.loadCustomAudio(file, 'error');
    if (ok) {
      onUpdateSettings({
        hasCustomErrorAudio: true,
        errorSoundEnabled: true,
      });
      soundEngine.playErrorSound();
    }
  };

  const soundThemes: { id: SoundTheme; label: string; desc: string }[] = [
    { id: 'clicky-kailh', label: '⚡ Kailh Box White (Ultra-Clicky)', desc: 'Sharp, crystal-clear click bar snap with zero lag' },
    { id: 'clicky-clack', label: '💥 Clicky Clack (Double Impact)', desc: 'Crisp tactile leaf click + mechanical bottom-out' },
    { id: 'cherry-blue', label: 'Cherry MX Blue (Classic Click)', desc: 'Authentic tactile snap & crisp high frequency click' },
    { id: 'holy-panda', label: '🐼 Holy Panda (Tactile Pop)', desc: 'Satisfying rounded tactile snap favored in enthusiast builds' },
    { id: 'gateron-black', label: '🖤 Gateron Ink Black (Deep Thock)', desc: 'Deep, buttery, linear acoustic bottom-out' },
    { id: 'cherry-brown', label: 'Cherry MX Brown (Light Tactile)', desc: 'Gentle tactile feedback with subtle dampened thud' },
    { id: 'thocky', label: 'Thocky Cream Switch', desc: 'Deep, lubricated, creamy satisfying acoustic tone' },
    { id: 'typewriter', label: 'Vintage Typewriter', desc: 'Heavy metallic strike with carriage resonance' },
    { id: 'digital-pop', label: 'Digital Pop (Bubble)', desc: 'Typing.com clean bouncy bubble tone' },
    { id: 'laptop', label: 'Laptop Scissor', desc: 'Gentle, low-profile quiet cushioned tap' },
    { id: 'custom', label: 'Custom Uploaded Sound', desc: 'Use your own audio file for keystrokes' },
    { id: 'off', label: 'Muted', desc: 'Silent typing without sound effects' },
  ];

  const caretStyles: { id: CaretStyle; label: string; preview: string }[] = [
    { id: 'bar', label: 'Smooth Bar', preview: '|' },
    { id: 'glow-bar', label: 'Neon Glow', preview: '❙' },
    { id: 'block', label: 'Block', preview: '█' },
    { id: 'underline', label: 'Underline', preview: '_' },
    { id: 'box', label: 'Outline Box', preview: '▢' },
  ];

  const themes: { id: AppTheme; label: string; color: string }[] = [
    { id: 'slate-dark', label: 'Slate Carbon (Dark)', color: 'bg-slate-900 border-cyan-500' },
    { id: 'light-clean', label: 'Typing.com Clean (Light)', color: 'bg-slate-100 border-blue-600' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', color: 'bg-zinc-950 border-fuchsia-500' },
    { id: 'terminal', label: 'Matrix Terminal', color: 'bg-black border-emerald-500' },
    { id: 'sepia', label: 'Vintage Sepia', color: 'bg-[#2b241e] border-amber-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Typing & Audio Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-7">
          {/* Section 1: Animated Caret Styles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Animated Caret Style</h3>
                <p className="text-xs text-slate-400">Typing.com-inspired smooth moving cursor styles</p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.smoothCaret}
                  onChange={(e) => onUpdateSettings({ smoothCaret: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 h-4 w-4 bg-slate-800"
                />
                <span>Smooth sliding transition</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {caretStyles.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateSettings({ caretStyle: item.id })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    settings.caretStyle === item.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono text-xl font-bold">{item.preview}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Typing Sound Profiles (Web Audio API) */}
          <div className="border-t border-slate-800/80 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Typing Keystroke Sound</h3>
                <p className="text-xs text-slate-400">Synthesized real mechanical profiles via Web Audio API</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestKeySound}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-cyan-400" />
                  <span>Audition Sound</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {soundThemes.map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => {
                    onUpdateSettings({
                      soundTheme: snd.id,
                      soundEnabled: snd.id !== 'off',
                    });
                    soundEngine.setSoundTheme(snd.id);
                    soundEngine.setSoundEnabled(snd.id !== 'off');
                    if (snd.id !== 'off') soundEngine.playKeySound(false);
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    settings.soundTheme === snd.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-100">{snd.label}</span>
                    {settings.soundTheme === snd.id && (
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{snd.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Sound Upload Options */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Custom Keystroke Audio File</span>
                  <p className="text-[11px] text-slate-400">Upload your own .mp3, .wav, or .ogg keystroke sound</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={keystrokeFileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleKeystrokeUpload}
                  />
                  <button
                    onClick={() => keystrokeFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{settings.hasCustomKeystrokeAudio ? 'Replace Keystroke File' : 'Upload Keystroke File'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Custom Error Audio File</span>
                  <p className="text-[11px] text-slate-400">Upload your own error click or buzzer audio file</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={errorFileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleErrorUpload}
                  />
                  <button
                    onClick={() => errorFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>{settings.hasCustomErrorAudio ? 'Replace Error File' : 'Upload Error File'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Volume Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Keystroke Volume</span>
                  <span className="font-mono text-cyan-400">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    onUpdateSettings({ soundVolume: vol });
                    soundEngine.setVolume(vol);
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-medium">Error Sound</span>
                    <button
                      onClick={handleTestErrorSound}
                      className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      (Test error)
                    </button>
                  </div>
                  <span className="font-mono text-rose-400">
                    {settings.errorSoundEnabled ? `${Math.round(settings.errorSoundVolume * 100)}%` : 'Off'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    disabled={!settings.errorSoundEnabled}
                    value={settings.errorSoundVolume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      onUpdateSettings({ errorSoundVolume: vol });
                      soundEngine.setErrorVolume(vol);
                    }}
                    className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30"
                  />
                  <button
                    onClick={() => {
                      const next = !settings.errorSoundEnabled;
                      onUpdateSettings({ errorSoundEnabled: next });
                      soundEngine.setErrorSoundEnabled(next);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer ${
                      settings.errorSoundEnabled
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {settings.errorSoundEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Typing Mechanics & Backspace Mode */}
          <div className="border-t border-slate-800/80 pt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Typing Mechanics & Backspace</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ backspaceMode: 'free' })}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                  settings.backspaceMode === 'free'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold text-white">Free Backspace (Standard)</span>
                <span className="text-[11px] text-slate-400">
                  Allow pressing backspace to correct past mistakes anytime.
                </span>
              </button>

              <button
                onClick={() => onUpdateSettings({ backspaceMode: 'strict' })}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                  settings.backspaceMode === 'strict'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold text-white">Strict Lock Mode</span>
                <span className="text-[11px] text-slate-400">
                  You must fix an incorrect character with backspace before you can proceed.
                </span>
              </button>
            </div>
          </div>

          {/* Section 4: Visual Themes & Typography */}
          <div className="border-t border-slate-800/80 pt-6">
            <h3 className="text-sm font-semibold text-white mb-3">Theme & Typography</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ theme: th.id })}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    settings.theme === th.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-medium">{th.label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 ${th.color}`} />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-2">
              <span className="font-medium">Typing Font Size</span>
              <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-lg border border-slate-700">
                {(['md', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => onUpdateSettings({ fontSize: sz })}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                      settings.fontSize === sz
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
