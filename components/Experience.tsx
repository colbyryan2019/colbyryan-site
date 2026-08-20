import Image from 'next/image'
import { experience } from '@/lib/content'

export default function Experience() {
  return (
    <section className="fade-in-section space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
      <ol className="space-y-10">
        {experience.map((entry) => (
          <li
            key={entry.company}
            className="rounded-xl border border-gray-200 p-6 transition-colors hover:border-accent dark:border-gray-800"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {entry.logo && (
                  <Image
                    src={entry.logo}
                    alt={`${entry.company} logo`}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{entry.company}</h2>
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
