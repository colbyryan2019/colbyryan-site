import type { Metadata } from 'next'
import BubbleGame from '@/components/BubbleGame'

export const metadata: Metadata = {
  title: 'Bubble Pop',
  description: 'Pop the rising bubbles in the right order before they float away.',
  alternates: { canonical: '/games/bubble-pop' },
}

export default function BubblePopPage() {
  return (
    <section className="fade-in-section space-y-6">
      <BubbleGame />
    </section>
  )
}
