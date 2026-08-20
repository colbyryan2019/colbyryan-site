import type { Metadata } from 'next'
import Projects from '@/components/Projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Projects: Mello Life, Mathematica, Mathematics Thesis, Computer Science Thesis.',
  alternates: { canonical: '/projects' },
}

export default function ProjectsPage() {
  return <Projects />
}
