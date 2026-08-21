import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import Nav from '../Nav'
import { contact } from '@/lib/content'

describe('Nav', () => {
  it('renders a link to every section route', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <Nav />
      </ThemeProvider>,
    )

    expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', contact.resumeHref)
  })
})
