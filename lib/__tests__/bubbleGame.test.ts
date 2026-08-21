import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  spawnBubble,
  popBubble,
  expireBubble,
  resetGame,
  getResultWord,
  type Bubble,
  type BubbleGameState,
} from '../bubbleGame'

function withBubbles(state: BubbleGameState, bubbles: Bubble[]): BubbleGameState {
  const available = state.available.filter((letter) => !bubbles.some((b) => b.letter === letter))
  return { ...state, available, bubbles }
}

describe('bubbleGame', () => {
  it('starts with every letter available, no bubbles, nothing collected, not finished', () => {
    const state = createInitialState(['C', 'O'])

    expect(state.available).toEqual(['C', 'O'])
    expect(state.bubbles).toEqual([])
    expect(state.collected).toEqual([])
    expect(state.finished).toBe(false)
    expect(state.won).toBe(false)
  })

  it('spawns a bubble with one of the available letters at the given position, and removes that letter from the pool', () => {
    const state = createInitialState(['C', 'O'])

    const next = spawnBubble(state, 42)

    expect(next.bubbles).toHaveLength(1)
    expect(next.bubbles[0].x).toBe(42)
    expect(state.available).toContain(next.bubbles[0].letter)
    expect(next.available).toEqual(state.available.filter((letter) => letter !== next.bubbles[0].letter))
  })

  it('never has the same letter available twice at once, so repeated spawns cover the whole pool without duplicates', () => {
    let state = createInitialState(['C', 'O', 'L'])
    state = spawnBubble(state, 10)
    state = spawnBubble(state, 20)
    state = spawnBubble(state, 30)

    expect(state.bubbles.map((b) => b.letter).sort()).toEqual(['C', 'L', 'O'])
    expect(state.available).toEqual([])
  })

  it('does not spawn bubbles once the game is finished', () => {
    const state = { ...createInitialState(['C']), finished: true }

    const next = spawnBubble(state, 42)

    expect(next.bubbles).toEqual([])
  })

  it('does not spawn bubbles once every letter has already been used', () => {
    const state = { ...createInitialState(['C']), available: [] }

    const next = spawnBubble(state, 42)

    expect(next.bubbles).toEqual([])
  })

  it('popping a bubble collects its letter and position by id, leaving other bubbles untouched', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [
      { id: 1, x: 10, letter: 'C' },
      { id: 2, x: 20, letter: 'O' },
    ])

    const next = popBubble(state, 1, 'C', 10)

    expect(next.collected).toEqual([{ id: 1, letter: 'C', x: 10 }])
    expect(next.bubbles).toEqual([{ id: 2, x: 20, letter: 'O' }])
    expect(next.finished).toBe(false)
  })

  it('is idempotent per bubble id, so a repeated pop (e.g. pointerdown firing it, then a keyboard-triggered click firing it again) does not double-collect the letter', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'C' }])
    state = popBubble(state, 1, 'C', 10)

    const next = popBubble(state, 1, 'C', 10)

    expect(next.collected).toEqual([{ id: 1, letter: 'C', x: 10 }])
    expect(next.finished).toBe(false)
  })

  it('finishes and wins when the last letter is popped with positions left-to-right in sequence order', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'C' }])
    state = popBubble(state, 1, 'C', 10)
    state = withBubbles(state, [{ id: 2, x: 60, letter: 'O' }])

    const next = popBubble(state, 2, 'O', 60)

    expect(next.collected).toEqual([
      { id: 1, letter: 'C', x: 10 },
      { id: 2, letter: 'O', x: 60 },
    ])
    expect(next.finished).toBe(true)
    expect(next.won).toBe(true)
  })

  it('finishes without winning when a later letter is popped further left than an earlier one', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [{ id: 1, x: 60, letter: 'C' }])
    state = popBubble(state, 1, 'C', 60)
    state = withBubbles(state, [{ id: 2, x: 10, letter: 'O' }])

    const next = popBubble(state, 2, 'O', 10)

    expect(next.finished).toBe(true)
    expect(next.won).toBe(false)
    expect(getResultWord(next)).toBe('OC')
  })

  it('letters can be collected in any order and still win if their positions land left-to-right in sequence order', () => {
    let state = createInitialState(['C', 'O', 'L'])
    state = withBubbles(state, [{ id: 1, x: 60, letter: 'L' }])
    state = popBubble(state, 1, 'L', 60)
    state = withBubbles(state, [{ id: 2, x: 10, letter: 'C' }])
    state = popBubble(state, 2, 'C', 10)
    state = withBubbles(state, [{ id: 3, x: 35, letter: 'O' }])

    const next = popBubble(state, 3, 'O', 35)

    expect(next.finished).toBe(true)
    expect(next.won).toBe(true)
    expect(getResultWord(next)).toBe('COL')
  })

  it('still counts a pop even if that bubble already expired first (click/expire race)', () => {
    // A click and the bubble's natural CSS-animation expiry are two independent
    // browser events on the same element. If the expiry event happens to get
    // processed a beat before the click, the bubble is gone from state.bubbles
    // by the time the click's dispatch runs. The pop must not depend on the
    // bubble still being present, or the click silently does nothing.
    let state = createInitialState(['C'])
    state = withBubbles(state, [{ id: 1, x: 33, letter: 'C' }])
    state = expireBubble(state, 1)
    expect(state.bubbles).toEqual([])

    const next = popBubble(state, 1, 'C', 33)

    expect(next.collected).toEqual([{ id: 1, letter: 'C', x: 33 }])
    expect(next.finished).toBe(true)
  })

  it('ignores pops once the game is already finished', () => {
    let state = createInitialState(['C'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'C' }])
    state = popBubble(state, 1, 'C', 10)

    const next = popBubble(state, 1, 'C', 10)

    expect(next).toEqual(state)
  })

  it('removes an unpopped bubble that floats off screen without affecting progress, and returns its letter to the pool', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [
      { id: 1, x: 10, letter: 'C' },
      { id: 2, x: 20, letter: 'O' },
    ])

    const next = expireBubble(state, 1)

    expect(next.bubbles).toEqual([{ id: 2, x: 20, letter: 'O' }])
    expect(next.collected).toEqual([])
    expect(next.available).toEqual(['C'])
  })

  it('resets to the initial state for the same sequence', () => {
    let state = createInitialState(['C', 'O'])
    state = withBubbles(state, [{ id: 1, x: 10, letter: 'C' }])
    state = popBubble(state, 1, 'C', 10)

    const next = resetGame(state)

    expect(next).toEqual(createInitialState(['C', 'O']))
  })

  it('reads the result word left-to-right by x position regardless of pop order', () => {
    let state = createInitialState(['C', 'O', 'L'])
    state = popBubble(state, 1, 'C', 50)
    state = popBubble(state, 2, 'O', 10)
    state = popBubble(state, 3, 'L', 30)

    expect(getResultWord(state)).toBe('OLC')
  })
})
