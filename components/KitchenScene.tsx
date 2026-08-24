const AMBIENT_FOOD = [
  { left: '10%', top: '18%', icon: '🍒', size: 22, bobDuration: 3200, delay: -600 },
  { left: '82%', top: '14%', icon: '🍋', size: 20, bobDuration: 2800, delay: -1400 },
  { left: '68%', top: '62%', icon: '🥐', size: 24, bobDuration: 3600, delay: -2200 },
  { left: '18%', top: '68%', icon: '🍩', size: 20, bobDuration: 3000, delay: -800 },
]

const STEAM_WISPS = ['28%', '48%', '68%']

export default function KitchenScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent dark:from-white/5" />

      {AMBIENT_FOOD.map((item, i) => (
        <span
          key={i}
          className="food-bob absolute opacity-35 dark:opacity-20"
          style={{
            left: item.left,
            top: item.top,
            fontSize: item.size,
            animationDuration: `${item.bobDuration}ms`,
            animationDelay: `${item.delay}ms`,
          }}
        >
          {item.icon}
        </span>
      ))}

      {STEAM_WISPS.map((left, i) => (
        <div
          key={left}
          className="steam-rise absolute bottom-4 h-6 w-6 rounded-full bg-white/40 blur-md dark:bg-white/10"
          style={{ left, animationDuration: '2600ms', animationDelay: `${-i * 900}ms` }}
        />
      ))}
    </div>
  )
}
