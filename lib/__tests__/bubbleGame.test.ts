import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  spawnBubble,
  popBubble,
  expireBubble,
  resetGame,
  getResultWord,
} from '../bubbleGame'

describe('bubbleGame', () => {
  it('starts on the first letter with no bubbles, nothing collected, not finished', () => {
    const state = createInitialState(['C', 'O'])

    expect(state.currentIndex).toBe(0)
    expect(state.bubbles).toEqual([])
    expect(state.collected).toEqual([])
    expect(state.finished).toBe(false)
    expect(state.won).toBe(false)
  })

  it('spawns a bubble showing the current letter at the given position', () => {
    const state = createInitialState(['C', 'O'])

    const next = spawnBubble(state, 42)

    expect(next.bubbles).toHaveLength(1)
    expect(next.bubbles[0]).toMatchObject({ x: 42, letter: 'C' })
  })

  it('does not spawn bubbles once the game is finished', () => {
    const state = { ...createInitialState(['C']), finished: true }

    const next = spawnBubble(state, 42)

    expect(next.bubbles).toEqual([])
  })

  it('popping a bubble collects its letter and position, advances the round, and clears the other bubbles', () => {
    let state = createInitialState(['C', 'O'])
    state = spawnBubble(state, 10)
    state = spawnBubble(state, 20)
    const popped = state.bubbles[0]

    const next = popBubble(state, popped.letter, popped.x)

    expect(next.collected).toEqual([{ letter: 'C', x: 10 }])
    expect(next.currentIndex).toBe(1)
    expect(next.bubbles).toEqual([])
    expect(next.finished).toBe(false)
  })

  it('finishes and wins when the last letter is popped with positions left-to-right in sequence order', () => {
    let state = createInitialState(['C', 'O'])
    state = spawnBubble(state, 10)
    state = popBubble(state, 'C', 10)
    state = spawnBubble(state, 60)

    const next = popBubble(state, 'O', 60)

    expect(next.collected).toEqual([
      { letter: 'C', x: 10 },
      { letter: 'O', x: 60 },
    ])
    expect(next.finished).toBe(true)
    expect(next.won).toBe(true)
  })

  it('finishes without winning when a later letter is popped further left than an earlier one', () => {
    let state = createInitialState(['C', 'O'])
    state = spawnBubble(state, 60)
    state = popBubble(state, 'C', 60)
    state = spawnBubble(state, 10)

    const next = popBubble(state, 'O', 10)

    expect(next.finished).toBe(true)
    expect(next.won).toBe(false)
    expect(getResultWord(next)).toBe('OC')
  })

  it('still counts a pop even if that bubble already expired first (click/expire race)', () => {
    // A click and the bubble's natural CSS-animation expiry are two independent
    // browser events on the same element. If the expiry event happens to get
    // processed a beat before the click, the bubble is gone from state.bubbles
    // by the time the click's dispatch runs. The pop must not depend on the
    // bubble still being present, or the click silently does nothing.
    let state = createInitialState(['C'])
    state = spawnBubble(state, 33)
    const bubble = state.bubbles[0]
    state = expireBubble(state, bubble.id)
    expect(state.bubbles).toEqual([])

    const next = popBubble(state, bubble.letter, bubble.x)

    expect(next.collected).toEqual([{ letter: 'C', x: 33 }])
    expect(next.finished).toBe(true)
  })

  it('ignores pops once the game is already finished', () => {
    let state = createInitialState(['C'])
    state = spawnBubble(state, 10)
    state = popBubble(state, 'C', 10)

    const next = popBubble(state, 'C', 10)

    expect(next).toEqual(state)
  })

  it('removes an unpopped bubble that floats off screen without affecting progress', () => {
    let state = createInitialState(['C', 'O'])
    state = spawnBubble(state, 10)
    state = spawnBubble(state, 20)
    const expiredId = state.bubbles[0].id

    const next = expireBubble(state, expiredId)

    expect(next.bubbles).toHaveLength(1)
    expect(next.bubbles[0].x).toBe(20)
    expect(next.collected).toEqual([])
    expect(next.currentIndex).toBe(0)
  })

  it('resets to the initial state for the same sequence', () => {
    let state = createInitialState(['C', 'O'])
    state = spawnBubble(state, 10)
    state = popBubble(state, 'C', 10)

    const next = resetGame(state)

    expect(next).toEqual(createInitialState(['C', 'O']))
  })

  it('reads the result word left-to-right by x position regardless of pop order', () => {
    let state = createInitialState(['C', 'O', 'L'])
    state = popBubble(state, 'C', 50)
    state = popBubble(state, 'O', 10)
    state = popBubble(state, 'L', 30)

    expect(getResultWord(state)).toBe('OLC')
  })
})
