import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Games from '../Games'
import { games } from '@/lib/content'

describe('Games', () => {
  it('renders every game with a working link', () => {
    render(<Games />)

    const [featuredGame, ...otherGames] = games

    expect(screen.getByRole('heading', { name: featuredGame.title })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: new RegExp(`Play ${featuredGame.title} →`) }),
    ).toHaveAttribute('href', featuredGame.href)

    for (const game of otherGames) {
      expect(screen.getByRole('heading', { name: game.title })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: `Play ${game.title} →` })).toHaveAttribute(
        'href',
        game.href,
      )
    }
  })

  it('features the first game in the list as the main game', () => {
    render(<Games />)

    const [featuredGame] = games
    const headings = screen.getAllByRole('heading')

    expect(headings[0]).toHaveTextContent(featuredGame.title)
  })
})
