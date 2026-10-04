import React, { useRef, useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Upload,
  CheckCircle,
  Play,
  RotateCcw,
  Palette,
  Keyboard,
  Sliders,
  Type,
  Eye,
} from 'lucide-react';
import {
  UserSettings,
  SoundTheme,
  CaretStyle,
  AppTheme,
  AccentColor,
  FontFamily,
  BackspaceMode,
} from '../types';
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
  const [activeTab, setActiveTab] = useState<'theme' | 'sound' | 'engine'>('theme');
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

  const themes: { id: AppTheme; label: string; bg: string; border: string; desc: string }[] = [
    { id: 'slate-dark', label: 'Midnight Slate', bg: '#020617', border: '#06b6d4', desc: 'Deep cosmic slate with electric cyan glow' },
    { id: 'light-clean', label: 'Clean Paper', bg: '#f8fafc', border: '#0284c7', desc: 'Crisp, high-contrast light typing surface' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', bg: '#0a0518', border: '#d946ef', desc: 'Vibrant ultraviolet and neon magenta' },
    { id: 'terminal', label: 'Matrix Terminal', bg: '#050d05', border: '#22c55e', desc: 'Phosphor green CRT hacker aesthetic' },
    { id: 'sepia', label: 'Vintage Sepia', bg: '#231c16', border: '#e5a458', desc: 'Warm aged parchment and typewriter tones' },
    { id: 'dracula', label: 'Dracula Dark', bg: '#21222c', border: '#bd93f9', desc: 'Popular code editor gothic purple theme' },
    { id: 'nord', label: 'Nordic Frost', bg: '#242933', border: '#88c0d0', desc: 'Arctic deep blue with frost blue accents' },
    { id: 'monokai', label: 'Monokai Pro', bg: '#1e1f1c', border: '#a6e22e', desc: 'Warm charcoal with electric lime highlights' },
  ];

  const accentColors: { id: AccentColor; label: string; bgClass: string; hex: string }[] = [
    { id: 'cyan', label: 'Cyan', bgClass: 'bg-cyan-500', hex: '#06b6d4' },
    { id: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500', hex: '#10b981' },
    { id: 'amber', label: 'Amber', bgClass: 'bg-amber-500', hex: '#f59e0b' },
    { id: 'violet', label: 'Violet', bgClass: 'bg-purple-500', hex: '#8b5cf6' },
    { id: 'rose', label: 'Rose', bgClass: 'bg-rose-500', hex: '#f43f5e' },
    { id: 'sky', label: 'Sky Blue', bgClass: 'bg-sky-500', hex: '#0284c7' },
  ];

  const fontFamilies: { id: FontFamily; label: string; sample: string }[] = [
    { id: 'mono', label: 'Monospace (Default)', sample: 'function solve() { return true; }' },
    { id: 'jetbrains', label: 'JetBrains Mono', sample: 'const speed = 120; // fast' },
    { id: 'fira', label: 'Fira Code', sample: 'a !== b => result' },
    { id: 'sans', label: 'Clean Modern Sans', sample: 'Touch typing mastery' },
  ];

  const caretStyles: { id: CaretStyle; label: string; preview: string }[] = [
    { id: 'bar', label: 'Smooth Bar', preview: '|' },
    { id: 'glow-bar', label: 'Neon Glow', preview: '❙' },
    { id: 'block', label: 'Block', preview: '█' },
    { id: 'underline', label: 'Underline', preview: '_' },
    { id: 'box', label: 'Outline Box', preview: '▢' },
  ];

  const soundThemes: { id: SoundTheme; label: string; desc: string }[] = [
    { id: 'clicky-kailh', label: '⚡ Kailh Box White (Click Bar)', desc: 'Sharp, crystal-clear click bar snap with zero lag' },
    { id: 'clicky-clack', label: '💥 Double Impact Mechanical', desc: 'Crisp tactile leaf click + mechanical bottom-out' },
    { id: 'cherry-blue', label: 'Cherry MX Blue (Classic Click)', desc: 'Authentic tactile snap & crisp high frequency click' },
    { id: 'holy-panda', label: '🐼 Holy Panda (Tactile Pop)', desc: 'Satisfying rounded tactile snap favored in enthusiast builds' },
    { id: 'gateron-black', label: '🖤 Gateron Ink Black (Deep Thock)', desc: 'Deep, buttery, linear acoustic bottom-out' },
    { id: 'cherry-brown', label: 'Cherry MX Brown (Light Tactile)', desc: 'Gentle tactile feedback with subtle dampened thud' },
    { id: 'thocky', label: 'Thocky Cream Switch', desc: 'Deep, lubricated, creamy satisfying acoustic tone' },
    { id: 'typewriter', label: 'Vintage Typewriter', desc: 'Heavy metallic strike with carriage resonance' },
    { id: 'digital-pop', label: 'Digital Bubble Pop', desc: 'Clean bouncy bubble tone' },
    { id: 'laptop', label: 'Laptop Scissor Switch', desc: 'Gentle, low-profile quiet cushioned tap' },
    { id: 'custom', label: 'Custom Uploaded Audio', desc: 'Use your own audio file for keystrokes' },
    { id: 'off', label: 'Muted', desc: 'Silent typing without sound effects' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Customization & Settings</h2>
              <p className="text-xs text-slate-400">Personalize themes, accent colors, caret, and mechanical sounds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-2 px-5 border-b border-slate-800/60 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Colors</span>
          </button>

          <button
            onClick={() => setActiveTab('sound')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sound'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Sound & Switches</span>
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'engine'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Typing Engine</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: THEME & APPEARANCE */}
          {activeTab === 'theme' && (
            <>
              {/* 1. Theme Palette Selector */}
              <div>
                <div className="mb-2.5">
                  <h3 className="text-sm font-semibold text-white">App Color Theme</h3>
                  <p className="text-xs text-slate-400">Choose from 8 tuned visual color schemes</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {themes.map((t) => {
                    const isSelected = settings.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onUpdateSettings({ theme: t.id })}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'border-cyan-400 bg-slate-800/90 ring-2 ring-cyan-500/30 shadow-md'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: t.border }}
                          />
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white">{t.label}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{t.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Accent Colors */}
              <div>
                <div className="mb-2.5">
                  <h3 className="text-sm font-semibold text-white">Custom Accent Color</h3>
                  <p className="text-xs text-slate-400">Personalize speed badges, carets, and illumination glow</p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {accentColors.map((c) => {
                    const isSelected = (settings.accentColor || 'cyan') === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onUpdateSettings({ accentColor: c.id })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-slate-800 shadow-md'
                            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full shadow-md transition-transform ${isSelected ? 'scale-110 ring-2 ring-white/40' : ''}`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[11px] font-medium text-slate-300">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Typography & Font Family */}
              <div>
                <div className="mb-2.5">
                  <h3 className="text-sm font-semibold text-white">Typography & Font Family</h3>
                  <p className="text-xs text-slate-400">Select your preferred coding & prose font</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fontFamilies.map((f) => {
                    const isSelected = (settings.fontFamily || 'mono') === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => onUpdateSettings({ fontFamily: f.id })}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-xs'
                            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{f.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{f.sample}</span>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Caret Styles & Font Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Caret Style */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">Animated Caret</h3>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.smoothCaret}
                        onChange={(e) => onUpdateSettings({ smoothCaret: e.target.checked })}
                        className="rounded border-slate-700 text-cyan-500 h-3.5 w-3.5 bg-slate-800"
                      />
                      <span>Smooth</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {caretStyles.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onUpdateSettings({ caretStyle: item.id })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          settings.caretStyle === item.id
                            ? 'border-cyan-400 bg-cyan-500/15 text-cyan-400 font-bold'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-base font-mono">{item.preview}</span>
                        <span className="text-[9px] uppercase tracking-wider">{item.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Typing Text Size</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['md', 'lg', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => onUpdateSettings({ fontSize: size })}
                        className={`p-2.5 rounded-xl border font-bold text-xs capitalize transition-all cursor-pointer ${
                          settings.fontSize === size
                            ? 'border-cyan-400 bg-cyan-500/15 text-cyan-400'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                        }`}
                      >
                        {size === 'md' ? 'Medium' : size === 'lg' ? 'Large (Default)' : 'Extra Large'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Preview:</span>
                </div>
                <div className="font-mono text-sm flex items-center gap-0.5">
                  <span className="text-white font-bold">quick</span>
                  <span className="inline-block w-0.5 h-4 bg-cyan-400 animate-pulse mx-0.5" />
                  <span className="text-slate-500">brown fox</span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: SOUND & AUDIO */}
          {activeTab === 'sound' && (
            <>
              {/* Sound Theme Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Mechanical Switch Sound Profiles</h3>
                    <p className="text-xs text-slate-400">Acoustic response synthesized with Web Audio</p>
                  </div>

                  <button
                    onClick={handleTestKeySound}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                  >
                    <Play className="w-3 h-3" />
                    <span>Test Sound</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {soundThemes.map((item) => {
                    const isSelected = settings.soundTheme === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onUpdateSettings({
                            soundTheme: item.id,
                            soundEnabled: item.id !== 'off',
                          });
                          soundEngine.setSoundTheme(item.id);
                          if (item.id !== 'off') {
                            soundEngine.setSoundEnabled(true);
                            soundEngine.playKeySound(false);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-white">{item.label}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
                {/* Keystroke Volume */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">Keystroke Click Volume</span>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
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
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Error Volume */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">Typo / Error Buzz Volume</span>
                    <span className="font-mono text-rose-400 font-bold">{Math.round(settings.errorSoundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.errorSoundVolume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      onUpdateSettings({ errorSoundVolume: vol });
                      soundEngine.setErrorVolume(vol);
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              {/* Custom Audio Upload */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-semibold text-white">Upload Custom Switch Sound (.wav / .mp3)</h4>
                  <p className="text-slate-400 text-[11px]">Use your own mechanical key sound sample</p>
                </div>
                <input
                  type="file"
                  ref={keystrokeFileInputRef}
                  onChange={handleKeystrokeUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  onClick={() => keystrokeFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Audio</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 3: TYPING ENGINE */}
          {activeTab === 'engine' && (
            <>
              {/* Backspace Mode */}
              <div>
                <div className="mb-2.5">
                  <h3 className="text-sm font-semibold text-white">Backspace Mode</h3>
                  <p className="text-xs text-slate-400">Strict mode prevents proceeding past mistakes</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onUpdateSettings({ backspaceMode: 'free' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.backspaceMode === 'free'
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Free Backspacing</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Typing.com / standard speed test behavior</div>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ backspaceMode: 'strict' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.backspaceMode === 'strict'
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Strict Lockout</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Must fix errors before advancing</div>
                  </button>
                </div>
              </div>

              {/* Hardware & Assistive Features */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-white block">Virtual Key Matrix Display</span>
                    <span className="text-slate-400 text-[11px] block">Show the on-screen physical keycap board</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showKeyboard}
                    onChange={(e) => onUpdateSettings({ showKeyboard: e.target.checked })}
                    className="rounded border-slate-700 text-cyan-500 h-4 w-4 bg-slate-800"
                  />
                </label>

                <div className="border-t border-slate-800/80 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Finger Placement Guidance</span>
                      <span className="text-slate-400 text-[11px] block">Highlight home-row finger to press next key</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showHandsGuide}
                      onChange={(e) => onUpdateSettings({ showHandsGuide: e.target.checked })}
                      className="rounded border-slate-700 text-cyan-500 h-4 w-4 bg-slate-800"
                    />
                  </label>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Space Advances to Next Word</span>
                      <span className="text-slate-400 text-[11px] block">Monkeytype style: pressing space skips remaining word</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.spaceJumpsWord}
                      onChange={(e) => onUpdateSettings({ spaceJumpsWord: e.target.checked })}
                      className="rounded border-slate-700 text-cyan-500 h-4 w-4 bg-slate-800"
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
          <span className="text-slate-400">All configurations save automatically</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
