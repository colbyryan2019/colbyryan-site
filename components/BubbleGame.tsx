'use client'

import { useEffect, useReducer, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import Link from 'next/link'
import {
  createInitialState,
  expireBubble,
  getResultWord,
  popBubble,
  resetGame,
  spawnBubble,
  type BubbleGameState,
} from '@/lib/bubbleGame'

const SEQUENCE = ['C', 'O', 'L', 'B', 'Y']
const SPAWN_INTERVAL_MS = 1200
const MAX_BUBBLES = 6
const FLOAT_DURATION_MS = 2200

type Action =
  | { type: 'spawn'; x: number }
  | { type: 'pop'; id: number; letter: string; x: number }
  | { type: 'expire'; id: number }
  | { type: 'reset' }

function reducer(state: BubbleGameState, action: Action): BubbleGameState {
  switch (action.type) {
    case 'spawn':
      return state.bubbles.length >= MAX_BUBBLES ? state : spawnBubble(state, action.x)
    case 'pop':
      return popBubble(state, action.id, action.letter, action.x)
    case 'expire':
      return expireBubble(state, action.id)
    case 'reset':
      return resetGame(state)
  }
}

function init(): BubbleGameState {
  return createInitialState(SEQUENCE)
}

const FIREWORK_BURSTS = [
  { left: '35%', top: '38%', delay: 0 },
  { left: '65%', top: '28%', delay: 250 },
  { left: '50%', top: '55%', delay: 500 },
]
const FIREWORK_COLORS = ['bg-accent', 'bg-pink-400', 'bg-yellow-300', 'bg-emerald-400']
const FIREWORK_PARTICLES = 10

const POP_BURST_PARTICLES = 6
const POP_BURST_DURATION_MS = 380

function PopBurst({ left, top }: { left: number; top: number }) {
  return (
    <div className="pointer-events-none absolute" style={{ left: `${left}%`, top: `${top}%` }}>
      <span className="pop-burst-ring" />
      {Array.from({ length: POP_BURST_PARTICLES }, (_, i) => (
        <span
          key={i}
          style={{ '--angle': `${(360 / POP_BURST_PARTICLES) * i}deg` } as CSSProperties}
          className="pop-burst-particle"
        />
      ))}
    </div>
  )
}

function Fireworks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {FIREWORK_BURSTS.map((burst, burstIndex) => (
        <div key={burstIndex} style={{ left: burst.left, top: burst.top }} className="absolute">
          {Array.from({ length: FIREWORK_PARTICLES }, (_, i) => (
            <span
              key={i}
              style={
                {
                  '--angle': `${(360 / FIREWORK_PARTICLES) * i}deg`,
                  animationDelay: `${burst.delay}ms`,
                } as CSSProperties
              }
              className={`firework-particle ${FIREWORK_COLORS[i % FIREWORK_COLORS.length]}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function BubbleGame() {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const containerRef = useRef<HTMLDivElement>(null)
  const [bursts, setBursts] = useState<{ id: number; left: number; top: number }[]>([])

  useEffect(() => {
    if (state.finished) return
    const interval = setInterval(() => {
      dispatch({ type: 'spawn', x: Math.random() * 100 })
    }, SPAWN_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [state.finished])

  function popAt(bubble: BubbleGameState['bubbles'][number], clientY: number) {
    dispatch({ type: 'pop', id: bubble.id, letter: bubble.letter, x: bubble.x })

    const rect = containerRef.current?.getBoundingClientRect()
    const top = rect && clientY > 0 ? ((clientY - rect.top) / rect.height) * 100 : 45
    const burstId = bubble.id
    setBursts((prev) => [...prev, { id: burstId, left: bubble.x, top }])
    setTimeout(() => {
      setBursts((prev) => prev.filter((burst) => burst.id !== burstId))
    }, POP_BURST_DURATION_MS)
  }

  return (
    <div ref={containerRef} className="relative left-1/2 h-[70vh] max-h-[600px] w-screen -translate-x-1/2 overflow-hidden border-y border-gray-200 bg-gradient-to-b from-sky-50 to-sky-100 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full border border-accent bg-white/70 px-3 py-1.5 text-sm font-medium text-accent backdrop-blur transition-colors hover:bg-accent hover:text-gray-950 dark:bg-gray-950/70"
      >
        ← Back
      </Link>

      {state.bubbles.map((bubble) => (
        <div
          key={bubble.id}
          onAnimationEnd={() => dispatch({ type: 'expire', id: bubble.id })}
          style={{ left: `${bubble.x}%`, animationDuration: `${FLOAT_DURATION_MS}ms` }}
          className="bubble-rise absolute"
        >
          <div
            style={{
              animationDuration: `${1100 + (bubble.id % 5) * 150}ms`,
              animationDelay: `-${(bubble.id * 137) % 1600}ms`,
            }}
            className="bubble-sway"
          >
            <button
              type="button"
              aria-label={`Pop bubble ${bubble.letter}`}
              onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                if (event.button !== 0) return
                popAt(bubble, event.clientY)
              }}
              onClick={(event) => popAt(bubble, event.clientY)}
              className="flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border border-accent bg-accent/20 text-2xl font-bold text-accent backdrop-blur transition-transform hover:scale-110"
            >
              {bubble.letter}
            </button>
          </div>
        </div>
      ))}

      {bursts.map((burst) => (
        <PopBurst key={burst.id} left={burst.left} top={burst.top} />
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 border-t border-gray-200 bg-white/70 dark:border-gray-800 dark:bg-gray-950/70">
        {[...state.collected]
          .sort((a, b) => a.x - b.x)
          .map((entry) => (
            <span
              key={`${entry.x}-${entry.letter}`}
              style={{ left: `${entry.x}%` }}
              className="letter-fall absolute top-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-gray-950"
            >
              {entry.letter}
            </span>
          ))}
      </div>

      {state.finished && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-950/90">
          {state.won && <Fireworks />}
          <h1 className="word-rise relative text-5xl font-bold tracking-tight text-accent sm:text-6xl">
            {getResultWord(state)}
          </h1>
          <p className="relative text-sm text-gray-600 dark:text-gray-400">Try again?</p>
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="relative rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-gray-950"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
