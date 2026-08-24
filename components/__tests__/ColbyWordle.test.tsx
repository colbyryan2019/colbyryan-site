import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import ColbyWordle from '../ColbyWordle'

function typeWord(word: string) {
  for (const char of word) {
    fireEvent.keyDown(window, { key: char })
  }
}

function submit() {
  fireEvent.keyDown(window, { key: 'Enter' })
}

describe('ColbyWordle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('does not show the title while a round is actively being played', () => {
    render(<ColbyWordle />)

    expect(screen.queryByRole('heading', { name: 'Colby Wordle' })).not.toBeInTheDocument()
  })

  it('fills the first guess row as letters are typed', () => {
    render(<ColbyWordle />)

    typeWord('col')

    expect(screen.getByLabelText('Row 1 letter 1: C')).toBeInTheDocument()
    expect(screen.getByLabelText('Row 1 letter 2: O')).toBeInTheDocument()
    expect(screen.getByLabelText('Row 1 letter 3: L')).toBeInTheDocument()
    expect(screen.getByLabelText('Row 1 letter 4: empty')).toBeInTheDocument()
  })

  it('removes the last typed letter on backspace', () => {
    render(<ColbyWordle />)
    typeWord('col')

    fireEvent.keyDown(window, { key: 'Backspace' })

    expect(screen.getByLabelText('Row 1 letter 3: empty')).toBeInTheDocument()
  })

  it('does not submit a guess shorter than five letters', () => {
    render(<ColbyWordle />)
    typeWord('col')

    submit()

    expect(screen.getByLabelText('Row 1 letter 1: C')).toBeInTheDocument()
  })

  it('evaluates a submitted guess letter by letter', () => {
    render(<ColbyWordle />)
    typeWord('zzzzz')
    submit()

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`Row 1 letter ${i}: Z, absent`)).toBeInTheDocument()
    }
  })

  it('colors the on-screen keyboard to match the best status seen for each letter', () => {
    render(<ColbyWordle />)
    typeWord('zzzzz')
    submit()

    expect(screen.getByRole('button', { name: 'Z, absent' })).toBeInTheDocument()
  })

  it('lets the on-screen keyboard type letters just like the physical keyboard', () => {
    render(<ColbyWordle />)

    fireEvent.click(screen.getByRole('button', { name: 'C' }))

    expect(screen.getByLabelText('Row 1 letter 1: C')).toBeInTheDocument()
  })

  it('shows the win screen once the guess matches the answer', () => {
    render(<ColbyWordle />)
    typeWord('colby')
    submit()

    expect(screen.getByRole('heading', { name: 'Colby Wordle' })).toBeInTheDocument()
    expect(screen.getByText(/got it in 1\/6/i)).toBeInTheDocument()
  })

  it('stops accepting input once the game is won', () => {
    render(<ColbyWordle />)
    typeWord('colby')
    submit()

    typeWord('zzzzz')

    expect(screen.queryByLabelText('Row 2 letter 1: Z')).not.toBeInTheDocument()
  })

  it('shows the loss screen revealing the answer after six wrong guesses', () => {
    render(<ColbyWordle />)
    for (let i = 0; i < 6; i++) {
      typeWord('zzzzz')
      submit()
    }

    expect(screen.getByRole('heading', { name: 'Colby Wordle' })).toBeInTheDocument()
    expect(screen.getByText(/the word was colby/i)).toBeInTheDocument()
  })

  it('remembers a finished game across remounts on the same day', () => {
    const { unmount } = render(<ColbyWordle />)
    typeWord('colby')
    submit()
    unmount()

    render(<ColbyWordle />)

    expect(screen.getByRole('heading', { name: 'Colby Wordle' })).toBeInTheDocument()
    expect(screen.getByText(/got it in 1\/6/i)).toBeInTheDocument()
  })

  it('remembers in-progress guesses across remounts on the same day', () => {
    const { unmount } = render(<ColbyWordle />)
    typeWord('zzzzz')
    submit()
    unmount()

    render(<ColbyWordle />)

    expect(screen.getByLabelText('Row 1 letter 1: Z, absent')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Colby Wordle' })).not.toBeInTheDocument()
  })
})
