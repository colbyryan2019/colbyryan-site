import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Games from '../Games'
import { games } from '@/lib/content'

describe('Games', () => {
  it('renders every game with a working link', () => {
    render(<Games />)

    for (const game of games) {
      expect(screen.getByRole('heading', { name: game.title })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: `Play ${game.title} →` })).toHaveAttribute(
        'href',
        game.href,
      )
    }
  })
})
