import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Education from '../Education'
import { education } from '@/lib/content'

describe('Education', () => {
  it('renders every education entry with its credential and dates', () => {
    render(<Education />)

    for (const entry of education) {
      expect(screen.getByRole('heading', { name: entry.school })).toBeInTheDocument()
      expect(screen.getByText(entry.dates)).toBeInTheDocument()
    }
  })
})
