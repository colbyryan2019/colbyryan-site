export interface Bubble {
  id: number
  x: number
  letter: string
}

export interface CollectedLetter {
  id: number
  letter: string
  x: number
}

export interface BubbleGameState {
  sequence: string[]
  bubbles: Bubble[]
  collected: CollectedLetter[]
  finished: boolean
  nextId: number
}

export function createInitialState(sequence: string[]): BubbleGameState {
  return {
    sequence,
    bubbles: [],
    collected: [],
    finished: false,
    nextId: 1,
  }
}

export function spawnBubble(state: BubbleGameState, x: number): BubbleGameState {
  if (state.finished) return state
  const letter = state.sequence[Math.floor(Math.random() * state.sequence.length)]
  const bubble: Bubble = { id: state.nextId, x, letter }
  return { ...state, bubbles: [...state.bubbles, bubble], nextId: state.nextId + 1 }
}

export function getResultWord(state: BubbleGameState): string {
  return [...state.collected]
    .sort((a, b) => a.x - b.x)
    .map((c) => c.letter)
    .join('')
}

export function popBubble(state: BubbleGameState, id: number, letter: string, x: number): BubbleGameState {
  if (state.finished) return state
  // A pop can be triggered twice for the same bubble (pointerdown fires it
  // immediately for mouse/touch, onClick fires it again for keyboard
  // activation) - this guard makes a repeat pop for an id a no-op instead of
  // double-collecting the letter.
  if (state.collected.some((entry) => entry.id === id)) return state

  const collected = [...state.collected, { id, letter, x }]
  const bubbles = state.bubbles.filter((bubble) => bubble.id !== id)
  const finished = collected.length >= state.sequence.length
  return { ...state, collected, bubbles, finished }
}

export function expireBubble(state: BubbleGameState, id: number): BubbleGameState {
  return { ...state, bubbles: state.bubbles.filter((b) => b.id !== id) }
}

export function resetGame(state: BubbleGameState): BubbleGameState {
  return createInitialState(state.sequence)
}
