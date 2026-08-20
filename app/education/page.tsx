import type { Metadata } from 'next'
import Education from '@/components/Education'

export const metadata: Metadata = {
  title: 'Education',
  description: 'Education: Union College (B.S. Computer Science & Mathematics) and TEFL Iberia.',
}

export default function EducationPage() {
  return <Education />
}
