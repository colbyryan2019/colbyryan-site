import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import About from '../About'

describe('About', () => {
  it('mentions Panoramix Financial, Union College, and FacetAI', () => {
    render(<About />)

    expect(screen.getByText(/Panoramix Financial/)).toBeInTheDocument()
    expect(screen.getByText(/Union College/)).toBeInTheDocument()
    expect(screen.getByText(/FacetAI/)).toBeInTheDocument()
  })
})
