import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'
import { contact } from '@/lib/content'

describe('Footer', () => {
  it('renders contact, GitHub, LinkedIn, and resume links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: contact.email })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`,
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', contact.github)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', contact.linkedin)
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', contact.resumeHref)
  })
})
