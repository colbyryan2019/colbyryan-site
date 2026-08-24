'use client'

import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from 'react'
import KitchenScene from './KitchenScene'
import {
  MAX_LIVES,
  clearBonusEvent,
  createInitialState,
  getDifficulty,
  missWord,
  resetGame,
  spawnWord,
  typeChar,
  type BonusEvent,
  type WordRainState,
} from '@/lib/wordRain'

const INTRO_DURATION_MS = 2500
export const BONUS_ANIMATION_MS = 900
const BONUS_PARTICLES = 10
const BONUS_COLORS = ['bg-accent', 'bg-pink-400', 'bg-yellow-300', 'bg-emerald-400']

type Action =
  | { type: 'spawn'; containerWidth: number }
  | { type: 'type'; char: string }
  | { type: 'miss'; id: number }
  | { type: 'clearBonus' }
  | { type: 'reset' }

function reducer(state: WordRainState, action: Action): WordRainState {
  switch (action.type) {
    case 'spawn':
      return spawnWord(state, action.containerWidth)
    case 'type':
      return typeChar(state, action.char)
    case 'miss':
      return missWord(state, action.id)
    case 'clearBonus':
      return clearBonusEvent(state)
    case 'reset':
      return resetGame()
  }
}

export function BonusConfetti({ event, onDone }: { event: BonusEvent | null; onDone: () => void }) {
  useEffect(() => {
    if (!event) return
    const timer = setTimeout(onDone, BONUS_ANIMATION_MS)
    return () => clearTimeout(timer)
  }, [event, onDone])

  if (!event) return null

  return (
    <div className="pointer-events-none absolute top-1/3" style={{ left: `${event.x}px` }}>
      {Array.from({ length: BONUS_PARTICLES }, (_, i) => (
        <span
          key={i}
          style={{ '--angle': `${(360 / BONUS_PARTICLES) * i}deg` } as CSSProperties}
          className={`firework-particle ${BONUS_COLORS[i % BONUS_COLORS.length]}`}
        />
      ))}
      <span className="score-pop absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-bold text-accent">
        +{event.points}
      </span>
    </div>
  )
}

export default function WordRain() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [showIntro, setShowIntro] = useState(true)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const missTimersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const { level, spawnIntervalMs } = getDifficulty(state.score)

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return
      setContainerWidth(containerRef.current.getBoundingClientRect().width)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    if (!showIntro) return
    const timer = setTimeout(() => setShowIntro(false), INTRO_DURATION_MS)
    return () => clearTimeout(timer)
  }, [showIntro])

  useEffect(() => {
    if (state.finished || showIntro) return
    const interval = setInterval(() => {
      dispatch({ type: 'spawn', containerWidth })
    }, spawnIntervalMs)
    return () => clearInterval(interval)
  }, [state.finished, showIntro, spawnIntervalMs, level, containerWidth])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.length === 1) dispatch({ type: 'type', char: event.key })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // jsdom has no AnimationEvent, so onAnimationEnd never fires reliably in
  // tests. A word's "reached the bottom" moment is driven by a JS timer
  // instead, using the fall duration frozen onto the word at spawn time.
  useEffect(() => {
    const currentIds = new Set(state.words.map((w) => w.id))

    for (const word of state.words) {
      if (missTimersRef.current.has(word.id)) continue
      missTimersRef.current.set(
        word.id,
        setTimeout(() => {
          missTimersRef.current.delete(word.id)
          dispatch({ type: 'miss', id: word.id })
        }, word.fallDurationMs),
      )
    }

    for (const [id, timer] of missTimersRef.current) {
      if (!currentIds.has(id)) {
        clearTimeout(timer)
        missTimersRef.current.delete(id)
      }
    }
  }, [state.words])

  useEffect(() => {
    const timers = missTimersRef.current
    return () => {
      for (const timer of timers.values()) clearTimeout(timer)
      timers.clear()
    }
  }, [])

  const livesDisplay = useMemo(
    () => '♥'.repeat(state.lives) + '♡'.repeat(MAX_LIVES - state.lives),
    [state.lives],
  )

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 -mt-16 -mb-16 h-[70vh] max-h-[600px] w-screen -translate-x-1/2 overflow-hidden border-y border-gray-200 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950"
    >
      <KitchenScene />
      <span className="pointer-events-none absolute left-4 top-3 z-10 text-sm font-medium text-gray-700 dark:text-gray-300">
        Score: {state.score}
      </span>
      <span aria-label="Lives" className="pointer-events-none absolute right-4 top-3 z-10 text-sm font-medium text-accent">
        {livesDisplay}
      </span>

      {state.words.map((word) => (
        <div
          key={word.id}
          aria-label={`Falling word ${word.word}`}
          style={{ left: `${word.x}px`, animationDuration: `${word.fallDurationMs}ms` }}
          className="word-fall absolute text-3xl font-bold"
        >
          <span className="text-accent">{word.word.slice(0, word.typed)}</span>
          <span>{word.word.slice(word.typed)}</span>
        </div>
      ))}

      <BonusConfetti event={state.bonusEvent} onDone={() => dispatch({ type: 'clearBonus' })} />

      {showIntro && !state.finished && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-white/90 px-6 text-center dark:bg-gray-950/90">
          <p className="max-w-xs text-lg font-semibold">Type the words and letters as they fall!</p>
        </div>
      )}

      {state.finished && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 dark:bg-gray-950/90">
          <h1 className="text-3xl font-bold tracking-tight">Word Rain</h1>
          <p className="text-xl font-bold text-accent">Final score: {state.score}</p>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'reset' })
              setShowIntro(true)
            }}
            className="rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-gray-950"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
