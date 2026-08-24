import { contact } from '@/lib/content'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 py-10 dark:border-gray-800">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap items-center justify-center gap-4">
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
        <div className="flex items-center gap-4">
          <a href={contact.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
            GitHub
          </a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
            LinkedIn
          </a>
          <a href={contact.resumeHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
            Resume
          </a>
        </div>
        <p>
          © {new Date().getFullYear()} {contact.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
