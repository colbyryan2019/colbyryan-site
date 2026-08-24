export interface FallingWord {
  id: number
  word: string
  typed: number
  x: number
  fallDurationMs: number
}

export interface WordRainState {
  words: FallingWord[]
  score: number
  lives: number
  finished: boolean
  nextId: number
  activeWordId: number | null
}

export interface Difficulty {
  level: number
  fallDurationMinMs: number
  fallDurationMaxMs: number
  spawnIntervalMs: number
  maxConcurrent: number
  maxWordLength: number
}

export const MAX_LIVES = 3

export const WORDS = [
  'cat',
  'dog',
  'sun',
  'run',
  'jam',
  'fox',
  'owl',
  'bee',
  'ice',
  'key',
  'play',
  'code',
  'jump',
  'wave',
  'star',
  'moon',
  'fire',
  'rain',
  'leaf',
  'wind',
  'brave',
  'quick',
  'happy',
  'giant',
  'coder',
  'ocean',
  'cloud',
  'spark',
  'toast',
  'quiet',
  'bright',
  'dragon',
  'castle',
  'wizard',
  'summer',
  'winter',
  'garden',
  'planet',
  'rocket',
  'puzzle',
  'freedom',
  'harmony',
  'journey',
  'compass',
  'thunder',
  'crystal',
  'diamond',
  'keyboard',
  'mountain',
  'sunshine',
  'elephant',
  'triangle',
]

export const THEMED_WORDS = ['colby', 'ryan', 'union', 'panoramix']

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

export function createInitialState(): WordRainState {
  return {
    words: [],
    score: 0,
    lives: MAX_LIVES,
    finished: false,
    nextId: 1,
    activeWordId: null,
  }
}

export function getDifficulty(score: number): Difficulty {
  const level = Math.floor(score / 100)
  return {
    level,
    fallDurationMinMs: Math.max(1800, 4200 - level * 400),
    fallDurationMaxMs: Math.max(2600, 6000 - level * 400),
    spawnIntervalMs: Math.max(700, 1500 - level * 150),
    maxConcurrent: Math.min(5, 2 + Math.floor(level / 2)),
    maxWordLength: Math.min(10, 3 + level),
  }
}

function pickWord(maxLength: number): string {
  const pool = [...WORDS, ...THEMED_WORDS, ...LETTERS].filter((word) => word.length <= maxLength)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function spawnWord(state: WordRainState, x: number): WordRainState {
  if (state.finished) return state
  const { maxConcurrent, maxWordLength, fallDurationMinMs, fallDurationMaxMs } = getDifficulty(state.score)
  if (state.words.length >= maxConcurrent) return state
  const fallDurationMs = fallDurationMinMs + Math.random() * (fallDurationMaxMs - fallDurationMinMs)
  const word: FallingWord = { id: state.nextId, word: pickWord(maxWordLength), typed: 0, x, fallDurationMs }
  return { ...state, words: [...state.words, word], nextId: state.nextId + 1 }
}

export function typeChar(state: WordRainState, char: string): WordRainState {
  if (state.finished) return state

  const key = char.toLowerCase()
  const active = state.activeWordId != null ? state.words.find((w) => w.id === state.activeWordId) : undefined
  const target = active ?? state.words.find((w) => w.typed === 0 && w.word[0] === key)

  if (!target || target.word[target.typed] !== key) return state

  const typed = target.typed + 1

  if (typed === target.word.length) {
    return {
      ...state,
      words: state.words.filter((w) => w.id !== target.id),
      score: state.score + target.word.length * 10,
      activeWordId: null,
    }
  }

  return {
    ...state,
    words: state.words.map((w) => (w.id === target.id ? { ...w, typed } : w)),
    activeWordId: target.id,
  }
}

export function missWord(state: WordRainState, id: number): WordRainState {
  if (state.finished) return state
  const word = state.words.find((w) => w.id === id)
  if (!word) return state

  const lives = state.lives - 1
  return {
    ...state,
    words: state.words.filter((w) => w.id !== id),
    lives,
    finished: lives <= 0,
    activeWordId: state.activeWordId === id ? null : state.activeWordId,
  }
}

export function resetGame(): WordRainState {
  return createInitialState()
}
