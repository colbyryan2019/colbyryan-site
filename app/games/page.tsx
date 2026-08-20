import type { Metadata } from 'next'
import Games from '@/components/Games'

export const metadata: Metadata = {
  title: 'Games',
  description: 'Games: Bubble Pop and more to come.',
  alternates: { canonical: '/games' },
}

export default function GamesPage() {
  return <Games />
}
