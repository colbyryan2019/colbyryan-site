export type LetterStatus = 'correct' | 'present' | 'absent'

export type GameStatus = 'playing' | 'won' | 'lost'

export interface ColbordleState {
  guesses: string[]
  results: LetterStatus[][]
  currentGuess: string
  status: GameStatus
}

export const ANSWER = 'colby'
export const WORD_LENGTH = ANSWER.length
export const MAX_GUESSES = 6

export interface WordleStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  lastPlayedDate: string | null
}

export function dateKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function storageKey(date: Date = new Date()): string {
  return `colbordle-${dateKey(date)}`
}

export function statsStorageKey(): string {
  return 'colbordle-stats'
}

export function createInitialState(): ColbordleState {
  return { guesses: [], results: [], currentGuess: '', status: 'playing' }
}

export function createInitialStats(): WordleStats {
  return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, lastPlayedDate: null }
}

function isNextDay(previous: string, today: string): boolean {
  const previousDate = new Date(`${previous}T00:00:00`)
  const todayDate = new Date(`${today}T00:00:00`)
  const dayMs = 24 * 60 * 60 * 1000
  return Math.round((todayDate.getTime() - previousDate.getTime()) / dayMs) === 1
}

export function updateStats(stats: WordleStats, status: 'won' | 'lost', today: string): WordleStats {
  const won = status === 'won'
  const isConsecutive = stats.lastPlayedDate !== null && isNextDay(stats.lastPlayedDate, today)
  const currentStreak = won ? (isConsecutive ? stats.currentStreak + 1 : 1) : 0

  return {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastPlayedDate: today,
  }
}

export function evaluateGuess(guess: string, answer: string): LetterStatus[] {
  const result: LetterStatus[] = new Array(answer.length).fill('absent')
  const remaining = new Map<string, number>()

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
    } else {
      remaining.set(answer[i], (remaining.get(answer[i]) ?? 0) + 1)
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue
    const count = remaining.get(guess[i]) ?? 0
    if (count > 0) {
      result[i] = 'present'
      remaining.set(guess[i], count - 1)
    }
  }

  return result
}

export function addLetter(state: ColbordleState, letter: string): ColbordleState {
  if (state.status !== 'playing') return state
  if (state.currentGuess.length >= WORD_LENGTH) return state
  if (!/^[a-zA-Z]$/.test(letter)) return state

  return { ...state, currentGuess: state.currentGuess + letter.toLowerCase() }
}

export function removeLetter(state: ColbordleState): ColbordleState {
  if (state.status !== 'playing') return state
  if (state.currentGuess.length === 0) return state

  return { ...state, currentGuess: state.currentGuess.slice(0, -1) }
}

export function submitGuess(state: ColbordleState): ColbordleState {
  if (state.status !== 'playing') return state
  if (state.currentGuess.length !== WORD_LENGTH) return state

  const guess = state.currentGuess
  const result = evaluateGuess(guess, ANSWER)
  const guesses = [...state.guesses, guess]
  const results = [...state.results, result]
  const status: GameStatus = guess === ANSWER ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing'

  return { guesses, results, currentGuess: '', status }
}
