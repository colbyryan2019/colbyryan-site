import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test harness smoke test', () => {
  it('renders a component and finds it in the DOM', () => {
    render(<p>ok</p>)
    expect(screen.getByText('ok')).toBeInTheDocument()
  })
})
