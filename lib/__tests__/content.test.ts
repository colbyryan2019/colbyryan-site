import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { contact, experience, education, projects } from '../content'

describe('content data', () => {
  it('has complete contact info', () => {
    expect(contact.name).toBe('Colby Ryan')
    expect(contact.email).toBe('colbyryan2019@gmail.com')
    expect(contact.github).toBe('https://github.com/colbyryan2019')
    expect(contact.linkedin).toBe('https://www.linkedin.com/in/colby-ryan/')
    expect(contact.resumeHref).toBe('/resume/Colby_Ryan_Resume.pdf')
  })

  it('lists three experience entries in reverse-chronological order', () => {
    expect(experience.map((e) => e.company)).toEqual([
      'Panoramix Financial',
      'PanAgora Asset Management',
      'TandemAI',
    ])
    for (const entry of experience) {
      expect(entry.bullets.length).toBeGreaterThan(0)
    }
  })

  it('lists two education entries starting with Union College', () => {
    expect(education).toHaveLength(2)
    expect(education[0].school).toBe('Union College')
    expect(education[1].school).toBe('TEFL Iberia')
  })

  it('lists four projects with non-empty links', () => {
    expect(projects).toHaveLength(4)
    for (const project of projects) {
      expect(project.href.length).toBeGreaterThan(0)
    }
    expect(projects[2].href).toBe('/theses/Math%20Thesis.pdf')
    expect(projects[3].href).toBe('/theses/Computer%20Science%20Thesis.pdf')
  })

  it('every local asset path resolves to a real file in public/', () => {
    const localPaths = [
      contact.resumeHref,
      ...experience.map((e) => e.logo),
      ...education.map((e) => e.logo),
      ...projects.map((p) => p.href),
      '/images/headshot.jpg',
    ].filter((href): href is string => !!href && href.startsWith('/'))

    for (const href of localPaths) {
      const filePath = path.join(process.cwd(), 'public', decodeURIComponent(href))
      expect(existsSync(filePath), href).toBe(true)
    }
  })
})
