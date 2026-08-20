'use client'

import { useEffect, useReducer } from 'react'
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
  | { type: 'pop'; letter: string; x: number }
  | { type: 'expire'; id: number }
  | { type: 'reset' }

function reducer(state: BubbleGameState, action: Action): BubbleGameState {
  switch (action.type) {
    case 'spawn':
      return state.bubbles.length >= MAX_BUBBLES ? state : spawnBubble(state, action.x)
    case 'pop':
      return popBubble(state, action.letter, action.x)
    case 'expire':
      return expireBubble(state, action.id)
    case 'reset':
      return resetGame(state)
  }
}

function init(): BubbleGameState {
  return createInitialState(SEQUENCE)
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
        <button
          key={bubble.id}
          type="button"
          aria-label={`Pop bubble ${bubble.letter}`}
          onClick={() => dispatch({ type: 'pop', letter: bubble.letter, x: bubble.x })}
          onAnimationEnd={() => dispatch({ type: 'expire', id: bubble.id })}
          style={{ left: `${bubble.x}%`, animationDuration: `${FLOAT_DURATION_MS}ms` }}
          className="bubble-float absolute flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border border-accent bg-accent/20 text-2xl font-bold text-accent backdrop-blur transition-transform hover:scale-110"
        >
          {bubble.letter}
        </button>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 border-t border-gray-200 bg-white/70 dark:border-gray-800 dark:bg-gray-950/70">
        {state.collected.length === 0 && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-gray-500 dark:text-gray-500">
            Pop the bubbles in order…
          </span>
        )}
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
          {state.won ? (
            <p className="text-2xl font-bold text-accent">You spelled {SEQUENCE.join('')}!</p>
          ) : (
            <p className="max-w-sm text-center text-xl font-bold text-accent">
              You spelled {getResultWord(state)}. Try again!
            </p>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-gray-950"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
