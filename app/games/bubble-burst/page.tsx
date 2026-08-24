import type { Metadata } from 'next'
import BubbleBurst from '@/components/BubbleBurst'

export const metadata: Metadata = {
  title: 'Bubble Burst',
  description: 'Pop the rising bubbles before they float away.',
  alternates: { canonical: '/games/bubble-burst' },
}

export default function BubbleBurstPage() {
  return (
    <section className="fade-in-section space-y-6">
      <BubbleBurst />
    </section>
  )
}
