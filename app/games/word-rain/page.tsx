import type { Metadata } from 'next'
import WordRain from '@/components/WordRain'

export const metadata: Metadata = {
  title: 'Word Rain',
  description: 'Type the falling words before they hit the bottom. Three lives, and it gets faster as you go.',
  alternates: { canonical: '/games/word-rain' },
}

export default function WordRainPage() {
  return (
    <section className="fade-in-section space-y-6">
      <WordRain />
    </section>
  )
}
