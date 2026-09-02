import Image from 'next/image'
import { experience } from '@/lib/content'

export default function Experience() {
  return (
    <section id="experience" className="fade-in-section scroll-mt-24 space-y-6">
      <h2 className="text-xl font-semibold tracking-tight text-gray-600 dark:text-gray-400">Experience</h2>
      <ol className="space-y-6">
        {experience.map((entry) => (
          <li key={entry.company} className="rounded-xl border border-gray-100 p-6 dark:border-gray-900">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {entry.logo && (
                  <Image
                    src={entry.logo}
                    alt={`${entry.company} logo`}
                    width={80}
                    height={40}
                    className="h-10 w-auto rounded object-contain"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{entry.company}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{entry.role}</p>
                </div>
              </div>
              <p className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">{entry.dates}</p>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
