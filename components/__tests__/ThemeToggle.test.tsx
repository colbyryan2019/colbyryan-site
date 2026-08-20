import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import ThemeToggle from '../ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  it('starts in dark mode and switches to light on click', async () => {
    renderToggle()
    const button = await screen.findByRole('button', { name: /toggle theme/i })

    await waitFor(() => expect(button).toHaveTextContent('☀️'))

    fireEvent.click(button)

    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false))
    expect(button).toHaveTextContent('🌙')
  })
})
