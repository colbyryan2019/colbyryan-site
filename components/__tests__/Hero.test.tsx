import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Hero from '../Hero'
import { contact } from '@/lib/content'

describe('Hero', () => {
  it('renders name, title, and contact links', () => {
    render(<Hero />)

    expect(screen.getByRole('heading', { name: contact.name })).toBeInTheDocument()
    expect(screen.getByText(contact.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: contact.email })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`,
    )
    expect(screen.getByRole('link', { name: 'View Projects' })).toHaveAttribute('href', '/projects')
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/experience')
    expect(screen.getByRole('link', { name: 'Education' })).toHaveAttribute('href', '/education')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })
})
