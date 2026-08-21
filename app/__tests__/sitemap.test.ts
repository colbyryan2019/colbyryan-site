import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'

describe('sitemap', () => {
  it('includes all three routes with the production domain', () => {
    const entries = sitemap()

    expect(entries).toHaveLength(3)
    const urls = entries.map((entry) => entry.url)
    expect(urls).toEqual([
      'https://colbyryan.com',
      'https://colbyryan.com/about',
      'https://colbyryan.com/games/bubble-pop',
    ])
  })
})
