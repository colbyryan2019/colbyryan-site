import type { Metadata } from 'next'
import ColbyWordle from '@/components/ColbyWordle'

export const metadata: Metadata = {
  title: 'Colby Wordle',
  description: "Guess the secret word. Hint: it never changes.",
  alternates: { canonical: '/games/colby-wordle' },
}

export default function ColbyWordlePage() {
  return (
    <section className="fade-in-section space-y-6">
      <ColbyWordle />
    </section>
  )
}
