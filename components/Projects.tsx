import { projects } from '@/lib/content'

export default function Projects() {
  return (
    <section className="fade-in-section space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <ul className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <li
            key={project.title}
            className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 p-6 transition-colors hover:border-accent dark:border-gray-800"
          >
            <div>
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{project.description}</p>
            </div>
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-accent hover:underline"
            >
              {project.linkLabel} →
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
