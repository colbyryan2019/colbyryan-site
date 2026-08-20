import type { Metadata } from 'next'
import About from '@/components/About'

export const metadata: Metadata = {
  title: 'About',
  description:
    "Software Engineer at Panoramix Financial in New York City, Union College '24 grad in Computer Science and Mathematics.",
}

export default function AboutPage() {
  return <About />
}
