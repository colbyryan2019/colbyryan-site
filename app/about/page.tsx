import type { Metadata } from 'next'
import AboutIntro from '@/components/AboutIntro'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Education from '@/components/Education'
import Projects from '@/components/Projects'

export const metadata: Metadata = {
  title: 'About',
  description:
    "Software Engineer at Panoramix Financial in New York City, Union College '24 grad in Computer Science and Mathematics. Experience, education, and projects.",
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="space-y-20">
      <AboutIntro />
      <About />
      <Experience />
      <Education />
      <Projects />
    </div>
  )
}
