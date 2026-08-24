const FISH = [
  { top: '16%', size: 32, duration: 15000, delay: -3000, bobDuration: 2600, colorClass: 'text-sky-500/60 dark:text-sky-300/40' },
  { top: '36%', size: 22, duration: 21000, delay: -9000, bobDuration: 3100, colorClass: 'text-cyan-400/50 dark:text-cyan-200/35' },
  { top: '56%', size: 26, duration: 17000, delay: -5000, bobDuration: 2200, colorClass: 'text-sky-400/45 dark:text-sky-400/30' },
  { top: '72%', size: 18, duration: 24000, delay: -13000, bobDuration: 3400, colorClass: 'text-cyan-500/50 dark:text-cyan-300/35' },
]

function Fish({ size, colorClass }: { size: number; colorClass: string }) {
  return (
    <svg width={size} height={Math.round(size * 0.625)} viewBox="0 0 32 20" className={colorClass} fill="currentColor">
      <ellipse cx="18" cy="10" rx="11" ry="7" />
      <polygon points="8,10 0,3 0,17" />
      <circle cx="24.5" cy="8" r="1.4" className="fill-white/80 dark:fill-gray-950/70" />
    </svg>
  )
}

const SEAWEED_PATH =
  'M9 60 C2 45 16 35 6 22 C-2 10 12 4 9 0 L11 0 C16 6 4 12 12 22 C20 32 6 42 11 60 Z'

export default function UnderwaterScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-white/25 to-transparent dark:from-white/5" />

      {FISH.map((fish, i) => (
        <div
          key={i}
          className="fish-drift absolute"
          style={{ top: fish.top, animationDuration: `${fish.duration}ms`, animationDelay: `${fish.delay}ms` }}
        >
          <div className="fish-bob" style={{ animationDuration: `${fish.bobDuration}ms` }}>
            <Fish size={fish.size} colorClass={fish.colorClass} />
          </div>
        </div>
      ))}

      <div className="seaweed-sway absolute bottom-0 left-[8%]" style={{ animationDelay: '-1s' }}>
        <svg width="18" height="58" viewBox="0 0 18 60" className="text-emerald-600/40 dark:text-emerald-500/25" fill="currentColor">
          <path d={SEAWEED_PATH} />
        </svg>
      </div>
      <div className="seaweed-sway absolute bottom-0 right-[10%]" style={{ animationDelay: '-2.4s' }}>
        <svg width="14" height="46" viewBox="0 0 18 60" className="text-emerald-500/40 dark:text-emerald-400/20" fill="currentColor">
          <path d={SEAWEED_PATH} />
        </svg>
      </div>
    </div>
  )
}
