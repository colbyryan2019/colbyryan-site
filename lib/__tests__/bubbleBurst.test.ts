import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createInitialState,
  spawnBubble,
  popBubble,
  expireBubble,
  resetGame,
  getResultWord,
  type Bubble,
  type BubbleGameState,
} from '../bubbleBurst'

function withBubbles(state: BubbleGameState, bubbles: Bubble[]): BubbleGameState {
  return { ...state, bubbles }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('bubbleBurst', () => {
  it('starts with no bubbles, nothing collected, not finished', () => {
    const state = createInitialState(['C', 'O'])

    expect(state.bubbles).toEqual([])
    expect(state.collected).toEqual([])
    expect(state.finished).toBe(false)
  })

  it('spawns a bubble with a letter from the sequence at the given position', () => {
    const state = createInitialState(['C', 'O'])

    const next = spawnBubble(state, 42)

    expect(next.bubbles).toHaveLength(1)
    expect(next.bubbles[0].x).toBe(42)
    expect(state.sequence).toContain(next.bubbles[0].letter)
  })

  it('can spawn the same letter more than once at a time, since letters are drawn with replacement', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    let state = createInitialState(['C', 'O', 'L'])

    state = spawnBubble(state, 10)
    state = spawnBubble(state, 20)
    state = spawnBubble(state, 30)

    expect(state.bubbles.map((b) => b.letter)).toEqual(['C', 'C', 'C'])
  })

  it('does not spawn bubbles once the game is finished', () => {
    const state = { ...createInitialState(['C']), finished: true }

    const next = spawnBubble(state, 42)

    expect(next.bubbles).toEqual([])
  })

  it('popping any bubble collects its letter and removes it, regardless of which letter it is', () => {
    let state = createInitialState(['C', 'O', 'L', 'B', 'Y'])
    state = withBubbles(state, [
      { id: 1, x: 10, letter: 'O' },
      { id: 2, x: 20, letter: 'O' },
    ])

    const next = popBubble(state, 1, 'O', 10)

    expect(next.collected).toEqual([{ id: 1, letter: 'O', x: 10 }])
    expect(next.bubbles).toEqual([{ id: 2, x: 20, letter: 'O' }])
    expect(next.finished).toBe(false)
  })

  it('collects letters in any order, not just the sequence order', () => {
    let state = createInitialState(['C', 'O', 'L', 'B', 'Y'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'Y' }])

    const next = popBubble(state, 1, 'Y', 10)

    expect(next.collected).toEqual([{ id: 1, letter: 'Y', x: 10 }])
  })

  it('is idempotent per bubble id, so a repeated pop of an already-collected bubble does not double-collect the letter', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'C' }])
    state = popBubble(state, 1, 'C', 10)

    const next = popBubble(state, 1, 'C', 10)

    expect(next.collected).toEqual([{ id: 1, letter: 'C', x: 10 }])
    expect(next.finished).toBe(false)
  })

  it('finishes once a bubble has been popped for every letter in the sequence, whatever those letters turned out to be', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'O' }])
    state = popBubble(state, 1, 'O', 10)
    state = withBubbles(state, [{ id: 2, x: 60, letter: 'O' }])

    const next = popBubble(state, 2, 'O', 60)

    expect(next.collected).toEqual([
      { id: 1, letter: 'O', x: 10 },
      { id: 2, letter: 'O', x: 60 },
    ])
    expect(next.finished).toBe(true)
  })

  it('ignores pops once the game is already finished', () => {
    let state = createInitialState(['C'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'C' }])
    state = popBubble(state, 1, 'C', 10)

    const next = popBubble(state, 1, 'C', 10)

    expect(next).toEqual(state)
  })

  it('removes an unpopped bubble that floats off screen without affecting progress', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [
      { id: 1, x: 10, letter: 'C' },
      { id: 2, x: 20, letter: 'O' },
    ])

    const next = expireBubble(state, 1)

    expect(next.bubbles).toEqual([{ id: 2, x: 20, letter: 'O' }])
    expect(next.collected).toEqual([])
  })

  it('resets to the initial state for the same sequence', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'C' }])
    state = popBubble(state, 1, 'C', 10)

    const next = resetGame(state)

    expect(next).toEqual(createInitialState(['C', 'O']))
  })

  it('reads the result word left-to-right by the x position each letter was popped at, regardless of pop order', () => {
    let state = createInitialState(['C', 'O', 'L'])
    state = popBubble(state, 1, 'C', 50)
    state = popBubble(state, 2, 'O', 10)
    state = popBubble(state, 3, 'L', 30)

    expect(getResultWord(state)).toBe('OLC')
  })
})
