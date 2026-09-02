import type { Metadata } from 'next'
import AboutIntro from '@/components/AboutIntro'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Education from '@/components/Education'
import Projects from '@/components/Projects'
import { contact } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About',
  description:
    "Software Engineer at Panoramix Financial in New York City, Union College '24 grad in Computer Science and Mathematics. Projects, experience, and education.",
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="space-y-20">
      <AboutIntro />
      <About />
      <Projects />
      <Experience />
      <Education />
      <section className="fade-in-section flex justify-center">
        <a
          href={contact.resumeHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-accent bg-accent px-8 py-3 text-base font-semibold text-gray-950 transition-colors hover:bg-transparent hover:text-accent"
        >
          Resume
        </a>
      </section>
    </div>
  )
}
