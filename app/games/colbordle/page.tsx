import type { Metadata } from 'next'
import Colbordle from '@/components/Colbordle'

export const metadata: Metadata = {
  title: 'Colbordle',
  description: "Guess the secret word.",
  alternates: { canonical: '/games/colbordle' },
}

export default function ColbordlePage() {
  return (
    <section className="fade-in-section space-y-6">
      <Colbordle />
    </section>
  )
}
