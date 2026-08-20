import type { Metadata } from 'next'
import Experience from '@/components/Experience'

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Work experience: Panoramix Financial, PanAgora Asset Management, TandemAI.',
}

export default function ExperiencePage() {
  return <Experience />
}
