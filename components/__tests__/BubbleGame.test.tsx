import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import BubbleGame from '../BubbleGame'

// Each spawn consumes two Math.random() calls in order: one for the
// bubble's x position, one (inside spawnBubble) for which remaining
// letter to pick. Forcing the letter-pick call to always return a tiny
// value selects index 0 of the remaining pool every time, which -
// since letters are only ever removed from the pool, never reordered -
// reproduces the sequence order (C, O, L, B, Y) deterministically. The
// x-position call is left free to follow a monotonic formula so we can
// control win/lose without needing to know how many bubbles a round
// spawns (spawn timing can drift).
function mockDeterministicLetterOrder(xDirection: 'increasing' | 'decreasing') {
  let call = 0
  let xCounter = 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    call += 1
    if (call % 2 === 1) {
      xCounter += 1
      const step = xCounter * 0.01
      return xDirection === 'increasing' ? Math.min(0.99, step) : Math.max(0.01, 0.99 - step)
    }
    return 0.001
  })
}

function popRound(letter: string) {
  act(() => {
    vi.advanceTimersByTime(1200)
  })
  const [bubble] = screen.getAllByRole('button', { name: `Pop bubble ${letter}` })
  fireEvent.click(bubble)
}

describe('BubbleGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    cleanup()
  })

  it('spawns a bubble showing one of the sequence letters', () => {
    mockDeterministicLetterOrder('increasing')
    render(<BubbleGame />)

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.getByRole('button', { name: 'Pop bubble C' })).toBeInTheDocument()
  })

  it('collects a letter when a bubble is popped, and a different letter can spawn next', () => {
    mockDeterministicLetterOrder('increasing')
    render(<BubbleGame />)

    popRound('C')

    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pop bubble C' })).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1200)
    })
    expect(screen.getByRole('button', { name: 'Pop bubble O' })).toBeInTheDocument()
  })

  it('letters can pop in any order, not just sequence order', () => {
    render(<BubbleGame />)

    act(() => {
      vi.advanceTimersByTime(1200)
    })
    const [firstBubble] = screen.getAllByRole('button', { name: /^Pop bubble /i })
    const firstLetter = firstBubble.getAttribute('aria-label')?.replace('Pop bubble ', '')
    fireEvent.click(firstBubble)

    expect(firstLetter).toBeTruthy()
    expect(screen.getByText(firstLetter as string)).toBeInTheDocument()
  })

  it('shows the title, a win message, and lets the player play again after spelling COLBY left-to-right', () => {
    mockDeterministicLetterOrder('increasing')
    render(<BubbleGame />)

    for (const letter of ['C', 'O', 'L', 'B', 'Y']) popRound(letter)

    expect(screen.getByRole('heading', { name: 'Bubble Pop' })).toBeInTheDocument()
    expect(screen.getByText('You spelled COLBY!')).toBeInTheDocument()
    expect(document.querySelectorAll('.firework-particle').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))

    act(() => {
      vi.advanceTimersByTime(1200)
    })
    expect(screen.getByRole('button', { name: 'Pop bubble C' })).toBeInTheDocument()
    expect(screen.queryByText('You spelled COLBY!')).not.toBeInTheDocument()
  })

  it('shows the scrambled result instead of a win, without ever revealing the target word, when letters are popped out of left-to-right order', () => {
    mockDeterministicLetterOrder('decreasing')
    render(<BubbleGame />)

    for (const letter of ['C', 'O', 'L', 'B', 'Y']) popRound(letter)

    expect(screen.queryByText('You spelled COLBY!')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/COLBY/)
    expect(document.querySelectorAll('.firework-particle').length).toBe(0)
  })

  it('does not show the title while a round is actively being played', () => {
    render(<BubbleGame />)

    expect(screen.queryByRole('heading', { name: 'Bubble Pop' })).not.toBeInTheDocument()
  })

  it('never hints the target word before the player has spelled it', () => {
    render(<BubbleGame />)

    expect(document.body.textContent).not.toMatch(/COLBY/)
  })

  it('never shows more than one bubble per letter at once, capping at the number of letters in the sequence', () => {
    render(<BubbleGame />)

    act(() => {
      vi.advanceTimersByTime(1200 * 20)
    })

    const buttons = screen.getAllByRole('button', { name: /^Pop bubble /i })
    const letters = buttons.map((b) => b.getAttribute('aria-label'))
    expect(new Set(letters).size).toBe(letters.length)
    expect(buttons.length).toBeLessThanOrEqual(5)
  })
})
