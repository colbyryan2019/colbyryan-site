import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import BubbleBurst from '../BubbleBurst'

function mockDeterministicSpawns() {
  let call = 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    call += 1
    return call % 2 === 1 ? 0 : 0.5 // letter: always index 0 (C); x within its band: midpoint roll
  })
}

function popRound() {
  act(() => {
    vi.advanceTimersByTime(1200)
  })
  const [bubble] = screen.getAllByRole('button', { name: /^Pop bubble /i })
  fireEvent.click(bubble)
}

// Spawns letters C, O, L, B, Y in that order, each rolled to the low end of
// its own left-to-right position band (0, 20, 25, 30, 50), so popping each
// bubble as soon as it appears both collects them in COLBY order and lands
// them left-to-right - a perfect spell.
function mockPerfectSpawnOrder() {
  let call = 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    call += 1
    const pairIndex = Math.floor((call - 1) / 2)
    return call % 2 === 1 ? pairIndex / 5 : 0
  })
}

describe('BubbleBurst', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    cleanup()
  })

  it('spawns a bubble showing one of the sequence letters', () => {
    render(<BubbleBurst />)

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    const [bubble] = screen.getAllByRole('button', { name: /^Pop bubble /i })
    expect(['C', 'O', 'L', 'B', 'Y']).toContain(bubble.getAttribute('aria-label')?.replace('Pop bubble ', ''))
  })

  it('collects a letter as soon as its bubble is popped, whatever letter it is', () => {
    mockDeterministicSpawns()
    render(<BubbleBurst />)

    popRound()

    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('pops a bubble on pointerdown alone, without needing a matching click (fixes missed pops on a continuously-swaying bubble)', () => {
    render(<BubbleBurst />)

    act(() => {
      vi.advanceTimersByTime(1200)
    })
    const [bubble] = screen.getAllByRole('button', { name: /^Pop bubble /i })

    fireEvent.pointerDown(bubble, { button: 0, clientY: 100 })

    expect(bubble).not.toBeInTheDocument()
  })

  it('collects bubbles in whatever order the player pops them, not just sequence order', () => {
    render(<BubbleBurst />)

    act(() => {
      vi.advanceTimersByTime(1200)
    })
    const [bubble] = screen.getAllByRole('button', { name: /^Pop bubble /i })
    const letter = bubble.getAttribute('aria-label')?.replace('Pop bubble ', '')

    fireEvent.click(bubble)

    expect(bubble).not.toBeInTheDocument()
    expect(screen.getByText(letter as string)).toBeInTheDocument()
  })

  it('shows the spelled-out result heading, celebrates every finish, and lets the player play again', () => {
    mockDeterministicSpawns()
    render(<BubbleBurst />)

    for (let i = 0; i < 5; i++) popRound()

    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(document.querySelectorAll('.firework-particle').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))

    act(() => {
      vi.advanceTimersByTime(1200)
    })
    expect(screen.getAllByRole('button', { name: /^Pop bubble /i }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('always celebrates the finish even when the collected letters do not spell COLBY', () => {
    // Every spawn is forced to letter index 0 (C), so five pops always
    // collect 'CCCCC' - never the target word - yet the finish must still
    // celebrate rather than reading as a loss.
    mockDeterministicSpawns()
    render(<BubbleBurst />)

    for (let i = 0; i < 5; i++) popRound()

    expect(screen.getByRole('heading', { name: 'CCCCC' })).toBeInTheDocument()
    expect(document.querySelectorAll('.firework-particle').length).toBeGreaterThan(0)
  })

  it('does not show a "try again" prompt on the result screen', () => {
    mockDeterministicSpawns()
    render(<BubbleBurst />)

    for (let i = 0; i < 5; i++) popRound()

    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument()
  })

  it('gives an extra celebration when the collected letters spell COLBY exactly', () => {
    mockPerfectSpawnOrder()
    render(<BubbleBurst />)

    for (let i = 0; i < 5; i++) popRound()

    expect(screen.getByRole('heading', { name: 'COLBY' })).toBeInTheDocument()
    expect(screen.getByText(/perfect/i)).toBeInTheDocument()
  })

  it('does not show the perfect-spell celebration extras for a non-COLBY result', () => {
    mockDeterministicSpawns()
    render(<BubbleBurst />)

    for (let i = 0; i < 5; i++) popRound()

    expect(screen.queryByText(/perfect/i)).not.toBeInTheDocument()
  })

  it('shows more firework particles for a perfect COLBY spell than a regular finish', () => {
    mockDeterministicSpawns()
    render(<BubbleBurst />)
    for (let i = 0; i < 5; i++) popRound()
    const normalCount = document.querySelectorAll('.firework-particle').length
    cleanup()
    vi.restoreAllMocks()

    mockPerfectSpawnOrder()
    render(<BubbleBurst />)
    for (let i = 0; i < 5; i++) popRound()
    const perfectCount = document.querySelectorAll('.firework-particle').length

    expect(perfectCount).toBeGreaterThan(normalCount)
  })

  it('does not show a result heading while a round is actively being played', () => {
    render(<BubbleBurst />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('always shows a back link to the games hub', () => {
    render(<BubbleBurst />)

    const back = screen.getByRole('link', { name: /back/i })
    expect(back).toHaveAttribute('href', '/')
  })

  it('never hints the target word before the player has spelled it', () => {
    render(<BubbleBurst />)

    expect(document.body.textContent).not.toMatch(/COLBY/)
  })

  it('shows a caption telling the player there is no penalty for missed bubbles while the round is in progress', () => {
    render(<BubbleBurst />)

    expect(screen.getByText(/no penalty/i)).toBeInTheDocument()
  })

  it('hides the no-penalty caption once the round is finished', () => {
    mockDeterministicSpawns()
    render(<BubbleBurst />)

    for (let i = 0; i < 5; i++) popRound()

    expect(screen.queryByText(/no penalty/i)).not.toBeInTheDocument()
  })

  it('allows more than one bubble of the same letter to be on screen at once', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<BubbleBurst />)

    act(() => {
      vi.advanceTimersByTime(1200 * 3)
    })

    const buttons = screen.getAllByRole('button', { name: 'Pop bubble C' })
    expect(buttons.length).toBeGreaterThan(1)
  })

  it('never spawns more bubbles than the configured cap', () => {
    render(<BubbleBurst />)

    act(() => {
      vi.advanceTimersByTime(1200 * 20)
    })

    const buttons = screen.getAllByRole('button', { name: /^Pop bubble /i })
    expect(buttons.length).toBeLessThanOrEqual(6)
  })
})
