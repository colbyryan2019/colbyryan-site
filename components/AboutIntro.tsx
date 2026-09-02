import Image from 'next/image'
import Link from 'next/link'
import { contact } from '@/lib/content'

export default function AboutIntro() {
  return (
    <section className="fade-in-section flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:text-left">
      <Image
        src="/images/headshot.jpg"
        alt={contact.name}
        width={144}
        height={144}
        className="shrink-0 rounded-full object-cover"
        priority
      />
      <div className="flex flex-col items-center gap-6 sm:items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{contact.name}</h1>
          <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">{contact.title}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{contact.location}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
          <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent">
            {contact.email}
          </a>
          <span>·</span>
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
            className="transition-colors hover:text-accent"
          >
            {contact.phone}
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          <Link
            href="#experience"
            className="rounded-full border border-accent px-8 py-3 text-base font-semibold text-accent transition-colors hover:bg-accent hover:text-gray-950"
          >
            Experience
          </Link>
          <Link
            href="#education"
            className="rounded-full border border-accent px-8 py-3 text-base font-semibold text-accent transition-colors hover:bg-accent hover:text-gray-950"
          >
            Education
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
          <Link href="#projects" className="transition-colors hover:text-accent">
            Projects
          </Link>
        </div>
      </div>
    </section>
  )
}
