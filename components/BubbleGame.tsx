'use client'

import { useEffect, useReducer, type CSSProperties } from 'react'
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

  useEffect(() => {
    if (state.finished) return
    const interval = setInterval(() => {
      dispatch({ type: 'spawn', x: Math.random() * 100 })
    }, SPAWN_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [state.finished])

  return (
    <div className="relative left-1/2 h-[70vh] max-h-[600px] w-screen -translate-x-1/2 overflow-hidden border-y border-gray-200 bg-gradient-to-b from-sky-50 to-sky-100 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
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
              onClick={() => dispatch({ type: 'pop', id: bubble.id, letter: bubble.letter, x: bubble.x })}
              className="flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border border-accent bg-accent/20 text-2xl font-bold text-accent backdrop-blur transition-transform hover:scale-110"
            >
              {bubble.letter}
            </button>
          </div>
        </div>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 dark:bg-gray-950/90">
          {state.won && <Fireworks />}
          <h1 className="relative text-3xl font-bold tracking-tight">Bubble Pop</h1>
          <p className="relative max-w-sm text-center text-xl font-bold text-accent">
            You spelled {getResultWord(state)}!
          </p>
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
