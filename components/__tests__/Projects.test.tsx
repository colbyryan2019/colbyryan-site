import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Projects from '../Projects'
import { projects } from '@/lib/content'

describe('Projects', () => {
  it('renders every project with a working link', () => {
    render(<Projects />)

    for (const project of projects) {
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument()
      const links = screen.getAllByRole('link', { name: `${project.linkLabel} →` })
      const link = links.find((l) => l.getAttribute('href') === project.href)
      expect(link).toBeDefined()
      expect(link).toHaveAttribute('href', project.href)
    }
  })
})
