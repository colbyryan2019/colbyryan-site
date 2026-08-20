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
  currentIndex: number
  bubbles: Bubble[]
  collected: CollectedLetter[]
  finished: boolean
  won: boolean
  nextId: number
}

export function createInitialState(sequence: string[]): BubbleGameState {
  return {
    sequence,
    currentIndex: 0,
    bubbles: [],
    collected: [],
    finished: false,
    won: false,
    nextId: 1,
  }
}

export function spawnBubble(state: BubbleGameState, x: number): BubbleGameState {
  if (state.finished) return state
  const bubble: Bubble = { id: state.nextId, x, letter: state.sequence[state.currentIndex] }
  return { ...state, bubbles: [...state.bubbles, bubble], nextId: state.nextId + 1 }
}

export function getResultWord(state: BubbleGameState): string {
  return [...state.collected]
    .sort((a, b) => a.x - b.x)
    .map((c) => c.letter)
    .join('')
}

export function popBubble(state: BubbleGameState, letter: string, x: number): BubbleGameState {
  if (state.finished) return state

  const collected = [...state.collected, { letter, x }]
  const currentIndex = state.currentIndex + 1
  const finished = currentIndex >= state.sequence.length
  const next = { ...state, collected, currentIndex, bubbles: [], finished, won: false }
  return { ...next, won: finished && getResultWord(next) === state.sequence.join('') }
}

export function expireBubble(state: BubbleGameState, id: number): BubbleGameState {
  return { ...state, bubbles: state.bubbles.filter((bubble) => bubble.id !== id) }
}

export function resetGame(state: BubbleGameState): BubbleGameState {
  return createInitialState(state.sequence)
}
