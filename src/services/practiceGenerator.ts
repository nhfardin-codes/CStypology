import { Lesson } from '../types';

export const COMMON_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'great', 'between', 'need', 'large', 'under', 'never', 'state', 'world', 'system', 'build',
  'code', 'flow', 'press', 'pulse', 'react', 'fast', 'quick', 'clear', 'focus', 'power',
  'clean', 'pixel', 'smooth', 'sound', 'click', 'switch', 'light', 'point', 'speed', 'right',
];

export const PRACTICE_QUOTES = [
  {
    title: 'Marcus Aurelius on Morning Purpose',
    author: 'Marcus Aurelius',
    length: 'short',
    text: 'When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love.',
  },
  {
    title: 'Steve Jobs on Connecting the Dots',
    author: 'Steve Jobs',
    length: 'medium',
    text: 'You cannot connect the dots looking forward; you can only connect them looking backward. So you have to trust that the dots will somehow connect in your future.',
  },
  {
    title: 'Alan Turing on Discovery',
    author: 'Alan Turing',
    length: 'short',
    text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
  },
  {
    title: 'Ada Lovelace on Poetic Science',
    author: 'Ada Lovelace',
    length: 'medium',
    text: 'The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.',
  },
  {
    title: 'Seneca on Time & Living',
    author: 'Seneca',
    length: 'long',
    text: 'It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and a sufficiently generous estimate has been given to us for the highest achievements if it were all well invested.',
  },
];

export const PRACTICE_CODE = [
  {
    title: 'JavaScript Async Fetcher',
    lang: 'js',
    text: 'async function fetchTypingMetrics(userId) {\n  const res = await fetch(`/api/stats/${userId}`);\n  const data = await res.json();\n  return data.filter(item => item.accuracy >= 95);\n}',
  },
  {
    title: 'Python List Comprehension & Filter',
    lang: 'python',
    text: 'def calculate_speed_percentile(speeds: list[int], target: int) -> float:\n    valid = [s for s in speeds if s > 0]\n    below = len([s for s in valid if s < target])\n    return round((below / len(valid)) * 100, 2)',
  },
  {
    title: 'HTML & Tailwind Modern Button',
    lang: 'html',
    text: '<button class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md active:scale-95">\n  Start Speed Drill\n</button>',
  },
  {
    title: 'SQL Analytics Query',
    lang: 'sql',
    text: 'SELECT user_id, AVG(net_wpm) AS average_speed, MAX(accuracy) AS best_accuracy\nFROM typing_sessions\nWHERE created_at >= NOW() - INTERVAL "30 days"\nGROUP BY user_id\nHAVING COUNT(*) >= 5\nORDER BY average_speed DESC;',
  },
  {
    title: 'C++ Fast Math Algorithm',
    lang: 'cpp',
    text: 'template <typename T>\nT clampValue(T val, T minVal, T maxVal) {\n    if (val < minVal) return minVal;\n    if (val > maxVal) return maxVal;\n    return val;\n}',
  },
];

export function generateWordsPractice(count: number): Lesson {
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
    selected.push(COMMON_WORDS[randomIndex]);
  }
  const text = selected.join(' ');

  return {
    id: `practice-words-${count}-${Date.now()}`,
    title: `Words Sprint (${count} Words)`,
    category: 'words',
    difficulty: count > 50 ? 'Hard' : count > 20 ? 'Medium' : 'Easy',
    description: `Type ${count} frequently used English vocabulary words with rhythm and precision.`,
    text,
    targetWpm: 60,
  };
}

export function generateTimePractice(seconds: number): Lesson {
  // Generate enough words to comfortably exceed the target time (e.g. 150-250 words)
  const wordCount = Math.max(80, Math.round((seconds / 60) * 120));
  const selected: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
    selected.push(COMMON_WORDS[randomIndex]);
  }
  const text = selected.join(' ');

  return {
    id: `practice-time-${seconds}-${Date.now()}`,
    title: `${seconds} Seconds Time Attack`,
    category: 'speed',
    difficulty: seconds >= 60 ? 'Hard' : 'Medium',
    description: `Push your limits in a ${seconds}-second countdown sprint. Accuracy and pace are key!`,
    text,
    targetWpm: 70,
  };
}

export function generateQuotePractice(filter: 'all' | 'short' | 'medium' | 'long'): Lesson {
  const filtered = PRACTICE_QUOTES.filter((q) => (filter === 'all' ? true : q.length === filter));
  const quote = filtered[Math.floor(Math.random() * filtered.length)] || PRACTICE_QUOTES[0];

  return {
    id: `practice-quote-${Date.now()}`,
    title: quote.title,
    category: 'quotes',
    difficulty: quote.length === 'long' ? 'Hard' : quote.length === 'medium' ? 'Medium' : 'Easy',
    description: `"${quote.text.slice(0, 45)}..." — ${quote.author}`,
    text: quote.text,
    targetWpm: 55,
  };
}

export function generateCodePractice(lang?: string): Lesson {
  const filtered = lang ? PRACTICE_CODE.filter((c) => c.lang === lang) : PRACTICE_CODE;
  const item = filtered[Math.floor(Math.random() * filtered.length)] || PRACTICE_CODE[0];

  return {
    id: `practice-code-${Date.now()}`,
    title: item.title,
    category: 'code',
    difficulty: 'Hard',
    description: `Code syntax practice with symbols, camelCase, and punctuation.`,
    text: item.text,
    targetWpm: 45,
  };
}
