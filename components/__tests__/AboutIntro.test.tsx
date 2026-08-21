import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutIntro from '../AboutIntro'
import { contact } from '@/lib/content'

describe('AboutIntro', () => {
  it('renders name, title, and contact links', () => {
    render(<AboutIntro />)

    expect(screen.getByRole('heading', { name: contact.name })).toBeInTheDocument()
    expect(screen.getByText(contact.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: contact.email })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`,
    )
    expect(screen.getByRole('link', { name: 'View Resume →' })).toHaveAttribute(
      'href',
      contact.resumeHref,
    )
    expect(screen.getByRole('link', { name: 'Play Games' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '#experience')
    expect(screen.getByRole('link', { name: 'Education' })).toHaveAttribute('href', '#education')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '#projects')
  })
})
