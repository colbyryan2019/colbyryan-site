import Image from 'next/image'
import { education } from '@/lib/content'

export default function Education() {
  return (
    <section id="education" className="fade-in-section scroll-mt-24 space-y-6">
      <h2 className="text-xl font-semibold tracking-tight text-gray-600 dark:text-gray-400">Education</h2>
      <ol className="space-y-6">
        {education.map((entry) => (
          <li key={entry.school} className="rounded-xl border border-gray-100 p-6 dark:border-gray-900">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {entry.logo && (
                  <Image
                    src={entry.logo}
                    alt={`${entry.school} logo`}
                    width={80}
                    height={40}
                    className="h-10 w-auto rounded object-contain"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{entry.school}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.credential} · {entry.location}
                  </p>
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
