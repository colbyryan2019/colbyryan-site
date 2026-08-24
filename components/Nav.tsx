import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { contact } from '@/lib/content'

const links = [
  { href: '/', label: 'Games' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="hidden font-semibold tracking-wide sm:block">
          {contact.name.toUpperCase()}
        </Link>
        <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm sm:gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
