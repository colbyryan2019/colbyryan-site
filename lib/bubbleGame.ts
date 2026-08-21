export interface Bubble {
  id: number
  x: number
  letter: string
}

export interface CollectedLetter {
  letter: string
  x: number
}

export interface BubbleGameState {
  sequence: string[]
  available: string[]
  bubbles: Bubble[]
  collected: CollectedLetter[]
  finished: boolean
  won: boolean
  nextId: number
}

export function createInitialState(sequence: string[]): BubbleGameState {
  return {
    sequence,
    available: [...sequence],
    bubbles: [],
    collected: [],
    finished: false,
    won: false,
    nextId: 1,
  }
}

export function spawnBubble(state: BubbleGameState, x: number): BubbleGameState {
  if (state.finished || state.available.length === 0) return state
  const index = Math.floor(Math.random() * state.available.length)
  const letter = state.available[index]
  const available = [...state.available.slice(0, index), ...state.available.slice(index + 1)]
  const bubble: Bubble = { id: state.nextId, x, letter }
  return { ...state, available, bubbles: [...state.bubbles, bubble], nextId: state.nextId + 1 }
}

export function getResultWord(state: BubbleGameState): string {
  return [...state.collected]
    .sort((a, b) => a.x - b.x)
    .map((c) => c.letter)
    .join('')
}

export function popBubble(state: BubbleGameState, id: number, letter: string, x: number): BubbleGameState {
  if (state.finished) return state

  const collected = [...state.collected, { letter, x }]
  const bubbles = state.bubbles.filter((bubble) => bubble.id !== id)
  const finished = collected.length >= state.sequence.length
  const next = { ...state, collected, bubbles, finished, won: false }
  return { ...next, won: finished && getResultWord(next) === state.sequence.join('') }
}

export function expireBubble(state: BubbleGameState, id: number): BubbleGameState {
  const bubble = state.bubbles.find((b) => b.id === id)
  if (!bubble) return state
  return {
    ...state,
    bubbles: state.bubbles.filter((b) => b.id !== id),
    available: [...state.available, bubble.letter],
  }
}

export function resetGame(state: BubbleGameState): BubbleGameState {
  return createInitialState(state.sequence)
}
