import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'

describe('sitemap', () => {
  it('includes all five routes with the production domain', () => {
    const entries = sitemap()

    expect(entries).toHaveLength(5)
    const urls = entries.map((entry) => entry.url)
    expect(urls).toEqual([
      'https://colbyryan.com',
      'https://colbyryan.com/about',
      'https://colbyryan.com/experience',
      'https://colbyryan.com/education',
      'https://colbyryan.com/projects',
    ])
  })
})
