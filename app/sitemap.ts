import type { MetadataRoute } from 'next'

const routes = ['', '/about', '/experience', '/education', '/projects']

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://colbyryan.com${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.7,
  }))
}
