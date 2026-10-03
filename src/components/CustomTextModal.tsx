import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, FileText } from 'lucide-react';
import { Lesson } from '../types';

interface CustomTextModalProps {
  onSaveAndStart: (lesson: Lesson) => void;
  onClose: () => void;
}

const PRESETS = [
  {
    title: 'The Art of Computer Programming',
    text: 'An algorithm must be seen to be believed, and the best way to understand how an algorithm behaves is to see it in action on various kinds of inputs.',
  },
  {
    title: 'Touch Typing Mantras',
    text: 'Slow is smooth, and smooth is fast. Keep your wrists resting gently above the desk and let your fingers glide without tension.',
  },
  {
    title: 'Pangram Medley',
    text: 'Sphinx of black quartz, judge my vow! The quick onyx goblin jumps over the lazy dwarf. Pack my box with five dozen liquor jugs.',
  },
];

export const CustomTextModal: React.FC<CustomTextModalProps> = ({ onSaveAndStart, onClose }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please provide some text to practice.');
      return;
    }
    if (text.length < 5) {
      setError('Text should be at least 5 characters long.');
      return;
    }

    const cleanTitle = title.trim() || `Custom Practice (${wordCount} words)`;
    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: cleanTitle,
      category: 'custom',
      description: `Custom text with ${wordCount} words and ${charCount} characters.`,
      difficulty: wordCount > 80 ? 'Hard' : wordCount > 30 ? 'Medium' : 'Easy',
      text: text.trim().replace(/\r\n/g, '\n'),
      targetWpm: 50,
    };

    onSaveAndStart(newLesson);
    onClose();
  };

  const handleApplyPreset = (presetText: string, presetTitle: string) => {
    setText(presetText);
    setTitle(presetTitle);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Create Custom Lesson</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Lesson Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. My Favorite Speech or Chapter 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Practice Text
              </label>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount} chars</span>
              </div>
            </div>
            <textarea
              rows={6}
              placeholder="Paste or type any paragraph, code, or article you want to practice typing..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              className="w-full p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none leading-relaxed"
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-2">Or load a quick preset:</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p.text, p.title)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Start Practice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
