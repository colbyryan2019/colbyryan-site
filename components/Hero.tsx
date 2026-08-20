import Image from 'next/image'
import Link from 'next/link'
import { contact } from '@/lib/content'

export default function Hero() {
  return (
    <section className="fade-in-section flex flex-col items-center gap-6 text-center">
      <Image
        src="/images/headshot.jpg"
        alt={contact.name}
        width={144}
        height={144}
        className="rounded-full object-cover"
        priority
      />
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{contact.name}</h1>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">{contact.title}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{contact.location}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
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
      <p className="max-w-xl text-gray-600 dark:text-gray-400">
        Software Engineer at Panoramix Financial in New York City. Boston sports fan. Chess player. App builder.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/projects"
          className="rounded-full border border-accent bg-accent px-8 py-3 text-base font-semibold text-gray-950 transition-colors hover:bg-transparent hover:text-accent"
        >
          View Projects
        </Link>
        <Link
          href="/experience"
          className="rounded-full border border-accent px-8 py-3 text-base font-semibold text-accent transition-colors hover:bg-accent hover:text-gray-950"
        >
          Experience
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link href="/education" className="transition-colors hover:text-accent">
          Education
        </Link>
        <span>·</span>
        <Link href="/about" className="transition-colors hover:text-accent">
          About
        </Link>
      </div>
    </section>
  )
}
