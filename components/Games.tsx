import Link from 'next/link'
import { games } from '@/lib/content'

export default function Games() {
  const [featuredGame, ...otherGames] = games

  return (
    <section className="fade-in-section space-y-10">
      <Link
        href={featuredGame.href}
        className="group flex flex-col justify-between gap-6 rounded-2xl border border-accent bg-accent/5 p-8 transition-colors hover:bg-accent/10 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{featuredGame.title}</h2>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-300">{featuredGame.description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-accent bg-accent px-8 py-3 text-center text-base font-semibold text-gray-950 transition-colors group-hover:bg-transparent group-hover:text-accent">
          Play {featuredGame.title} →
        </span>
      </Link>
      <ul className="grid gap-6 sm:grid-cols-2">
        {otherGames.map((game) => (
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
