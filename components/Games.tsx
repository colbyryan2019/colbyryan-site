import Link from 'next/link'
import { games } from '@/lib/content'

export default function Games() {
  return (
    <section className="fade-in-section space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Games</h1>
      <ul className="grid gap-6 sm:grid-cols-2">
        {games.map((game) => (
          <li
            key={game.title}
            className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 p-6 transition-colors hover:border-accent dark:border-gray-800"
          >
            <div>
              <h2 className="text-lg font-semibold">{game.title}</h2>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{game.description}</p>
            </div>
            <Link href={game.href} className="text-sm font-medium text-accent hover:underline">
              Play {game.title} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
