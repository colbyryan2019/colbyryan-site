import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import BubbleGame from '../BubbleGame'

// Each spawned bubble's x comes from Math.random(). To make win/lose
// outcomes deterministic regardless of how many bubbles a round spawns
// (spawn timing can drift), mock it to return a strictly monotonic
// sequence across calls: increasing guarantees left-to-right pop order
// (a win), decreasing guarantees the opposite (never a win).
function mockMonotonicRandom(direction: 'increasing' | 'decreasing') {
  let counter = 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    counter += 1
    const step = counter * 0.01
    return direction === 'increasing' ? Math.min(0.99, step) : Math.max(0.01, 0.99 - step)
  })
}

function popRound(letter: string) {
  act(() => {
    vi.advanceTimersByTime(1500)
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

  it('spawns a bubble showing the first letter of the sequence', () => {
    render(<BubbleGame />)

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.getByRole('button', { name: 'Pop bubble C' })).toBeInTheDocument()
  })

  it('collects a letter and advances to the next one when a bubble is popped', () => {
    render(<BubbleGame />)

    popRound('C')

    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pop bubble C' })).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByRole('button', { name: 'Pop bubble O' })).toBeInTheDocument()
  })

  it('shows a win message and lets the player play again after spelling COLBY left-to-right', () => {
    mockMonotonicRandom('increasing')
    render(<BubbleGame />)

    for (const letter of ['C', 'O', 'L', 'B', 'Y']) popRound(letter)

    expect(screen.getByText('You spelled COLBY!')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByRole('button', { name: 'Pop bubble C' })).toBeInTheDocument()
    expect(screen.queryByText('You spelled COLBY!')).not.toBeInTheDocument()
  })

  it('shows the scrambled result instead of a win, without ever revealing the target word, when letters are popped out of left-to-right order', () => {
    mockMonotonicRandom('decreasing')
    render(<BubbleGame />)

    for (const letter of ['C', 'O', 'L', 'B', 'Y']) popRound(letter)

    expect(screen.queryByText('You spelled COLBY!')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/COLBY/)
  })

  it('never hints the target word before the player has spelled it', () => {
    render(<BubbleGame />)

    expect(document.body.textContent).not.toMatch(/COLBY/)
  })

  it('never shows more than 6 bubbles on screen at once', () => {
    render(<BubbleGame />)

    act(() => {
      vi.advanceTimersByTime(1200 * 20)
    })

    expect(screen.getAllByRole('button', { name: 'Pop bubble C' }).length).toBeLessThanOrEqual(6)
  })
})
