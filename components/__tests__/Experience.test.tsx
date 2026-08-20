import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Experience from '../Experience'
import { experience } from '@/lib/content'

describe('Experience', () => {
  it('renders every experience entry with its role and dates', () => {
    render(<Experience />)

    for (const entry of experience) {
      expect(screen.getByRole('heading', { name: entry.company })).toBeInTheDocument()
      expect(screen.getByText(entry.role)).toBeInTheDocument()
      expect(screen.getByText(entry.dates)).toBeInTheDocument()
    }
  })
})
