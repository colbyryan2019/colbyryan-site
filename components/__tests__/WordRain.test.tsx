import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import WordRain, { BonusConfetti, BONUS_ANIMATION_MS } from '../WordRain'
import { CHAR_WIDTH_PX, WORD_HORIZONTAL_PADDING_PX } from '@/lib/wordRain'

// spawnWord makes four Math.random() calls per spawn: fall duration, the
// word-pool-vs-letter-pool draw, the pool index, and the x position.
// Forcing all of them to a tiny value picks the words pool (the draw is
// biased toward it) and index 0 of that pool every time, which is 'cat'
// while maxWordLength stays at the starting difficulty (3). x lands near
// the left edge of its safe range.
function mockFirstWordInPool() {
  vi.spyOn(Math, 'random').mockReturnValue(0.001)
}

function mockContainerWidth(width: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  } as DOMRect)
}

function typeWord(word: string) {
  for (const char of word) {
    fireEvent.keyDown(window, { key: char })
  }
}

const INTRO_DURATION_MS = 2500

// The intro overlay's dismiss timer is scheduled on mount, before any fake
// time has been advanced, so a single act() call safely fires it - unlike a
// timer that gets scheduled *during* an advance (see the `tick` helper
// below).
function dismissIntro() {
  act(() => {
    vi.advanceTimersByTime(INTRO_DURATION_MS)
  })
}

// Advancing fake timers by one large jump only flushes the word's
// miss-timeout *scheduling* effect at the very end of that jump, by which
// point the fake clock has already passed it - so the timeout requested
// from inside that effect fires later than intended and is missed by this
// call entirely. Stepping in small increments gives React a chance to flush
// effects (and therefore register each word's timeout at the right virtual
// time) between ticks, so multi-phase sequences (spawn, then miss) resolve
// the way they would in a browser.
function tick(totalMs: number, stepMs = 200) {
  let elapsed = 0
  while (elapsed < totalMs) {
    const step = Math.min(stepMs, totalMs - elapsed)
    act(() => {
      vi.advanceTimersByTime(step)
    })
    elapsed += step
  }
}

describe('WordRain', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    cleanup()
  })

  it('shows a brief intro explaining how to play before the round starts', () => {
    render(<WordRain />)

    expect(screen.getByText('Type the words and letters as they fall!')).toBeInTheDocument()
  })

  it('does not spawn anything while the intro is still showing', () => {
    mockFirstWordInPool()
    render(<WordRain />)

    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS - 1)
    })

    expect(screen.queryByLabelText('Falling word cat')).not.toBeInTheDocument()
  })

  it('dismisses the intro and starts spawning once it has run its course', () => {
    mockFirstWordInPool()
    render(<WordRain />)

    dismissIntro()

    expect(screen.queryByText('Type the words and letters as they fall!')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.getByLabelText('Falling word cat')).toBeInTheDocument()
  })

  it('renders a falling item as plain text, with no icon next to it', () => {
    mockFirstWordInPool()
    render(<WordRain />)
    dismissIntro()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    const item = screen.getByLabelText('Falling word cat')
    expect(item.textContent).toBe('cat')
  })

  it('clears a word letter by letter as it is typed, and adds to the score once complete', () => {
    mockFirstWordInPool()
    render(<WordRain />)
    dismissIntro()
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    typeWord('cat')

    expect(screen.queryByLabelText('Falling word cat')).not.toBeInTheDocument()
    expect(screen.getByText('Score: 30')).toBeInTheDocument()
  })

  it('ignores keys that do not match any falling word', () => {
    mockFirstWordInPool()
    render(<WordRain />)
    dismissIntro()
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    fireEvent.keyDown(window, { key: 'z' })

    expect(screen.getByLabelText('Falling word cat')).toBeInTheDocument()
    expect(screen.getByText('Score: 0')).toBeInTheDocument()
  })

  it('costs a life for each word that reaches the bottom untyped, and shows the finished screen once all three lives are lost', () => {
    mockFirstWordInPool()
    render(<WordRain />)

    // Concurrency is capped at 2 at the starting difficulty, so misses can
    // land faster than one-at-a-time, but never slower than a fully
    // sequential spawn-then-fall cycle (spawn interval + min fall
    // duration). Three such cycles plus a buffer safely guarantees three
    // misses land, on top of the one-time intro delay before spawning
    // even begins.
    tick(INTRO_DURATION_MS + 3 * (1500 + 4200) + 2000)

    expect(screen.getByRole('heading', { name: 'Word Rain' })).toBeInTheDocument()
    expect(screen.getByText('Final score: 0')).toBeInTheDocument()
  })

  it('does not show the title while a round is actively being played', () => {
    render(<WordRain />)

    expect(screen.queryByRole('heading', { name: 'Word Rain' })).not.toBeInTheDocument()
  })

  it('lets the player play again after finishing, resetting words, score, and lives, and shows the intro again', () => {
    mockFirstWordInPool()
    render(<WordRain />)

    tick(INTRO_DURATION_MS + 3 * (1500 + 4200) + 2000)

    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))

    expect(screen.queryByRole('heading', { name: 'Word Rain' })).not.toBeInTheDocument()
    expect(screen.getByText('Score: 0')).toBeInTheDocument()
    expect(screen.getByText('Type the words and letters as they fall!')).toBeInTheDocument()

    dismissIntro()
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByLabelText('Falling word cat')).toBeInTheDocument()
  })

  it('never spawns more falling words at once than the starting difficulty allows', () => {
    mockFirstWordInPool()
    render(<WordRain />)
    dismissIntro()

    // The starting difficulty allows 2 concurrent items. Three
    // spawn-interval ticks (1500ms each) elapse while both are still
    // mid-fall (the minimum fall duration is 4200ms), so this proves the
    // third tick was blocked by the concurrency cap rather than just that
    // only two ticks have fired so far.
    act(() => {
      vi.advanceTimersByTime(1500 * 3)
    })

    expect(screen.getAllByLabelText('Falling word cat')).toHaveLength(2)
  })

  it('measures the real play area width and never positions a falling word so it would run off the right edge', () => {
    mockContainerWidth(400)
    render(<WordRain />)
    dismissIntro()

    act(() => {
      vi.advanceTimersByTime(1500 * 5)
    })

    const items = screen.getAllByLabelText(/^Falling word /)
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      const word = item.getAttribute('aria-label')!.replace('Falling word ', '')
      const left = parseFloat(item.style.left)
      const estimatedWidth = word.length * CHAR_WIDTH_PX + WORD_HORIZONTAL_PADDING_PX
      expect(left + estimatedWidth).toBeLessThanOrEqual(400)
    }
    // Proves the measured 400px width is actually reaching spawnWord,
    // rather than every word merely clamping to x=0 by coincidence.
    expect(items.some((item) => parseFloat(item.style.left) > 0)).toBe(true)
  })
})

describe('BonusConfetti', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    cleanup()
  })

  it('renders nothing when there is no bonus event', () => {
    const { container } = render(<BonusConfetti event={null} onDone={() => {}} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a confetti burst and the bonus point total for a bonus event', () => {
    render(<BonusConfetti event={{ x: 42, points: 250 }} onDone={() => {}} />)

    expect(screen.getByText('+250')).toBeInTheDocument()
    expect(document.querySelectorAll('.firework-particle').length).toBeGreaterThan(0)
  })

  it('calls onDone once the animation window elapses', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<BonusConfetti event={{ x: 0, points: 250 }} onDone={onDone} />)

    act(() => {
      vi.advanceTimersByTime(BONUS_ANIMATION_MS)
    })

    expect(onDone).toHaveBeenCalled()
  })
})
