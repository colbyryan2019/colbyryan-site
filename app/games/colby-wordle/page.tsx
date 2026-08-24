import type { Metadata } from 'next'
import ColbyWordle from '@/components/ColbyWordle'

export const metadata: Metadata = {
  title: 'Colbordle',
  description: "Guess the secret word.",
  alternates: { canonical: '/games/colby-wordle' },
}

export default function ColbyWordlePage() {
  return (
    <section className="fade-in-section space-y-6">
      <ColbyWordle />
    </section>
  )
}
