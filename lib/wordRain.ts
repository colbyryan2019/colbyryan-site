export interface FallingWord {
  id: number
  word: string
  typed: number
  x: number
  fallDurationMs: number
}

export interface BonusEvent {
  x: number
  points: number
}

export interface WordRainState {
  words: FallingWord[]
  score: number
  lives: number
  finished: boolean
  nextId: number
  activeWordId: number | null
  bonusEvent: BonusEvent | null
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
  'bed',
  'cup',
  'pen',
  'red',
  'box',
  'egg',
  'hat',
  'ink',
  'jar',
  'log',
  'map',
  'net',
  'pig',
  'rug',
  'van',
  'web',
  'bear',
  'bird',
  'boat',
  'book',
  'cake',
  'door',
  'duck',
  'fish',
  'frog',
  'gift',
  'gold',
  'lamp',
  'lion',
  'milk',
  'nest',
  'road',
  'rope',
  'shoe',
  'snow',
  'song',
  'tree',
  'apple',
  'beach',
  'chair',
  'chest',
  'clock',
  'coast',
  'eagle',
  'field',
  'flame',
  'glove',
  'grape',
  'heart',
  'house',
  'light',
  'money',
  'paint',
  'river',
  'robot',
  'shark',
  'shirt',
  'stone',
  'sword',
  'table',
  'tiger',
  'train',
  'water',
  'basket',
  'bottle',
  'bridge',
  'camera',
  'candle',
  'circle',
  'desert',
  'guitar',
  'island',
  'jacket',
  'jungle',
  'ladder',
  'market',
  'mirror',
  'monkey',
  'pencil',
  'purple',
  'rabbit',
  'ribbon',
  'silver',
  'temple',
  'turtle',
  'valley',
  'window',
  'blanket',
  'chicken',
  'costume',
  'holiday',
  'kitchen',
  'library',
  'meadow',
  'octopus',
  'peacock',
  'penguin',
  'popcorn',
  'pumpkin',
  'rainbow',
  'stadium',
  'volcano',
]

export const THEMED_WORDS = ['colby', 'ryan', 'union', 'panoramix']

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

// Rough per-character width for the text-3xl bold falling text, with a
// safety margin - used to keep spawn positions from running off-screen
// rather than to pixel-match the rendered font exactly.
export const CHAR_WIDTH_PX = 22
export const WORD_HORIZONTAL_PADDING_PX = 24

// Fraction of spawns drawn from the word/themed-word pool rather than the
// single-letter pool, so words show up far more often than lone letters.
export const WORD_PICK_CHANCE = 0.75

export const BONUS_WORD = 'colby'
export const BONUS_MULTIPLIER = 5
// Extra copies of the bonus word added to the pick pool so it comes up
// noticeably more often than any other single word, without guaranteeing it.
export const BONUS_WORD_EXTRA_ENTRIES = 3

export interface LeaderboardEntry {
  initials: string
  score: number
}

export const MAX_LEADERBOARD_ENTRIES = 5
export const LEADERBOARD_STORAGE_KEY = 'word-rain-leaderboard'

export function createInitialState(): WordRainState {
  return {
    words: [],
    score: 0,
    lives: MAX_LIVES,
    finished: false,
    nextId: 1,
    activeWordId: null,
    bonusEvent: null,
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

export function buildWordPool(maxLength: number): string[] {
  const words = [...WORDS, ...THEMED_WORDS, ...Array(BONUS_WORD_EXTRA_ENTRIES).fill(BONUS_WORD)]
  return words.filter((word) => word.length <= maxLength)
}

function pickWord(maxLength: number): string {
  const words = buildWordPool(maxLength)
  const pool = words.length > 0 && Math.random() < WORD_PICK_CHANCE ? words : LETTERS
  return pool[Math.floor(Math.random() * pool.length)]
}

function estimateWordWidthPx(word: string): number {
  return word.length * CHAR_WIDTH_PX + WORD_HORIZONTAL_PADDING_PX
}

export function spawnWord(state: WordRainState, containerWidthPx: number): WordRainState {
  if (state.finished) return state
  const { maxConcurrent, maxWordLength, fallDurationMinMs, fallDurationMaxMs } = getDifficulty(state.score)
  if (state.words.length >= maxConcurrent) return state
  const fallDurationMs = fallDurationMinMs + Math.random() * (fallDurationMaxMs - fallDurationMinMs)
  const pickedWord = pickWord(maxWordLength)
  const maxX = Math.max(0, containerWidthPx - estimateWordWidthPx(pickedWord))
  const x = Math.random() * maxX
  const word: FallingWord = { id: state.nextId, word: pickedWord, typed: 0, x, fallDurationMs }
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
    const isBonus = target.word === BONUS_WORD
    const points = target.word.length * 10 * (isBonus ? BONUS_MULTIPLIER : 1)
    return {
      ...state,
      words: state.words.filter((w) => w.id !== target.id),
      score: state.score + points,
      activeWordId: null,
      bonusEvent: isBonus ? { x: target.x, points } : state.bonusEvent,
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

export function clearBonusEvent(state: WordRainState): WordRainState {
  return { ...state, bonusEvent: null }
}

export function qualifiesForLeaderboard(leaderboard: LeaderboardEntry[], score: number): boolean {
  if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) return true
  return score > Math.min(...leaderboard.map((entry) => entry.score))
}

export function addLeaderboardEntry(
  leaderboard: LeaderboardEntry[],
  entry: LeaderboardEntry,
): LeaderboardEntry[] {
  return [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, MAX_LEADERBOARD_ENTRIES)
}
