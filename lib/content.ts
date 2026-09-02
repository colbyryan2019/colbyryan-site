export interface ContactInfo {
  name: string
  title: string
  location: string
  email: string
  github: string
  linkedin: string
  resumeHref: string
}

export const contact: ContactInfo = {
  name: 'Colby Ryan',
  title: 'Software Engineer',
  location: 'New York City, NY',
  email: 'colbyryan2019@gmail.com',
  github: 'https://github.com/colbyryan2019',
  linkedin: 'https://www.linkedin.com/in/colby-ryan/',
  resumeHref: '/resume/Colby_Ryan_Resume.pdf',
}

export interface ExperienceEntry {
  company: string
  role: string
  dates: string
  bullets: string[]
  logo?: string
}

export const experience: ExperienceEntry[] = [
  {
    company: 'Panoramix Financial',
    role: 'Software Engineer',
    dates: 'Aug 2024 – Present',
    bullets: [
      'Led development of FacetAI, announced at the T3 conference and now live',
      'Developed and maintained full-stack financial applications using C#, .NET, ASP.NET Core, SQL Server, and modern web technologies',
      'Engineered a nearest-neighbor search system for embedded text retrieval using multivector calculus to improve response precision',
      'Built a Retrieval-Augmented Generation bot from documentation to assist clients',
      'Created user-query tracking in a SQL database to understand common user errors',
      'Built pages for users to create/edit investment models, asset classes, user-defined fields, and more',
    ],
  },
  {
    company: 'PanAgora Asset Management',
    role: 'Data Science Intern',
    dates: 'Summer 2023',
    bullets: [
      'Wrote Python scripts connecting to the FBI API to extract, transform, and load data into a SQL server for Portfolio Manager',
      'Transitioned a daily data-diagnostic email tracking security performance into a full-stack interactive webpage',
    ],
    logo: '/images/panagora_logo.png',
  },
  {
    company: 'TandemAI',
    role: 'Software Engineer Intern',
    dates: 'Summer 2022',
    bullets: [
      'Automated fio storage testing on an HPC cluster',
      'Created flexible scripts to test storage bandwidth/latency; graphed results with matplotlib',
    ],
    logo: '/images/tandemai_logo.png',
  },
]

export interface EducationEntry {
  school: string
  location: string
  credential: string
  dates: string
  bullets: string[]
  logo?: string
}

export const education: EducationEntry[] = [
  {
    school: 'Union College',
    location: 'Schenectady, NY',
    credential: 'B.S. Computer Science & Mathematics (double major)',
    dates: 'Sept 2020 – June 2024',
    bullets: [
      'Elected Class Vice President, Theta Delta Chi Social Chair, Philosophy Club Member',
      'Completed undergraduate theses in both Computer Science and Mathematics',
    ],
    logo: '/images/union_logo.png',
  },
  {
    school: 'TEFL Iberia',
    location: 'Barcelona, Spain',
    credential: 'TEFL Certification & English Instructor',
    dates: 'Sept 2019 – March 2020',
    bullets: [
      'Taught private English classes of all levels part-time',
      'Learned conversational Spanish during an immersive gap year abroad',
    ],
  },
]

export interface GameEntry {
  title: string
  description: string
  href: string
}

export const games: GameEntry[] = [
  {
    title: 'Colbordle',
    description: 'Guess the secret word in six tries.',
    href: '/games/colbordle',
  },
  {
    title: 'Bubble Burst',
    description: 'Pop the rising bubbles before they float away.',
    href: '/games/bubble-burst',
  },
  {
    title: 'Word Rain',
    description: 'Type the falling words before they hit the bottom. Three lives, and it gets faster as you go.',
    href: '/games/word-rain',
  },
]

export interface ProjectEntry {
  title: string
  description: string
  href: string
  linkLabel: string
}

export const projects: ProjectEntry[] = [
  {
    title: 'Mello Life',
    description:
      'Gamified habit-tracking/productivity app with daily challenges and streak-based rewards. Full stack built with React Native, TypeScript, Supabase, RevenueCat.',
    href: 'https://apps.apple.com/us/app/mello-life/id6759076619',
    linkLabel: 'App Store',
  },
  {
    title: 'Mathematica',
    description:
      'Math-based iOS app; handled entire codebase and App Store publishing independently.',
    href: 'https://apps.apple.com/us/app/mathematica-original/id6743127573',
    linkLabel: 'App Store',
  },
  {
    title: 'Mathematics Thesis',
    description:
      'Investigated properties, theorems, and structures of hypergraphs, an extension of graph theory where edges may link multiple vertices simultaneously.',
    href: '/theses/Math%20Thesis.pdf',
    linkLabel: 'Read PDF',
  },
  {
    title: 'Computer Science Thesis',
    description:
      'Compared two leading chess engines on how they evaluated intricately designed chess positions.',
    href: '/theses/Computer%20Science%20Thesis.pdf',
    linkLabel: 'Read PDF',
  },
]
