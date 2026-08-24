'use client'

import { useEffect, useMemo, useReducer, useState } from 'react'
import {
  ANSWER,
  MAX_GUESSES,
  WORD_LENGTH,
  addLetter,
  createInitialStats,
  createInitialState,
  dateKey,
  removeLetter,
  statsStorageKey,
  storageKey,
  submitGuess,
  updateStats,
  type ColbyWordleState,
  type LetterStatus,
  type WordleStats,
} from '@/lib/colbyWordle'

type Action =
  | { type: 'type'; letter: string }
  | { type: 'backspace' }
  | { type: 'submit' }
  | { type: 'restore'; state: ColbyWordleState }

function reducer(state: ColbyWordleState, action: Action): ColbyWordleState {
  switch (action.type) {
    case 'type':
      return addLetter(state, action.letter)
    case 'backspace':
      return removeLetter(state)
    case 'submit':
      return submitGuess(state)
    case 'restore':
      return action.state
  }
}

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

const STATUS_RANK: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 }

const TILE_CLASSES: Record<LetterStatus, string> = {
  correct: 'border-accent bg-accent text-gray-950',
  present: 'border-yellow-500 bg-yellow-500 text-gray-950',
  absent: 'border-gray-400 bg-gray-400 text-white dark:border-gray-700 dark:bg-gray-700',
}

const KEY_CLASSES: Record<LetterStatus, string> = {
  correct: 'border-accent bg-accent text-gray-950',
  present: 'border-yellow-500 bg-yellow-500 text-gray-950',
  absent: 'border-gray-400 bg-gray-400 text-white dark:border-gray-700 dark:bg-gray-700',
}

function tileLabel(row: number, col: number, letter: string | undefined, status: LetterStatus | undefined) {
  if (!letter) return `Row ${row + 1} letter ${col + 1}: empty`
  const suffix = status ? `, ${status}` : ''
  return `Row ${row + 1} letter ${col + 1}: ${letter.toUpperCase()}${suffix}`
}

export default function ColbyWordle() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const [stats, setStats] = useState<WordleStats>(createInitialStats)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey())
    if (raw) {
      try {
        dispatch({ type: 'restore', state: JSON.parse(raw) as ColbyWordleState })
      } catch {
        // ignore malformed storage and start fresh
      }
    }
    const rawStats = window.localStorage.getItem(statsStorageKey())
    if (rawStats) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydration guard: must set after mount to avoid SSR/client mismatch
        setStats(JSON.parse(rawStats) as WordleStats)
      } catch {
        // ignore malformed storage and start fresh
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(storageKey(), JSON.stringify(state))
  }, [state, hydrated])

  useEffect(() => {
    if (!hydrated || state.status === 'playing') return
    const today = dateKey()
    if (stats.lastPlayedDate === today) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- records today's finished result once, guarded by lastPlayedDate
    setStats((prev) => updateStats(prev, state.status as 'won' | 'lost', today))
  }, [hydrated, state.status, stats.lastPlayedDate])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(statsStorageKey(), JSON.stringify(stats))
  }, [stats, hydrated])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') dispatch({ type: 'submit' })
      else if (event.key === 'Backspace') dispatch({ type: 'backspace' })
      else if (event.key.length === 1) dispatch({ type: 'type', letter: event.key })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const keyStatus = useMemo(() => {
    const map = new Map<string, LetterStatus>()
    state.guesses.forEach((guess, i) => {
      const result = state.results[i]
      for (let c = 0; c < guess.length; c++) {
        const letter = guess[c]
        const status = result[c]
        const existing = map.get(letter)
        if (!existing || STATUS_RANK[status] > STATUS_RANK[existing]) {
          map.set(letter, status)
        }
      }
    })
    return map
  }, [state.guesses, state.results])

  const finished = state.status !== 'playing'

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
      {finished && (
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Colbordle</h1>
          <p className="mt-2 text-lg font-semibold text-accent">
            {state.status === 'won'
              ? `Got it in ${state.guesses.length}/${MAX_GUESSES}!`
              : `The word was ${ANSWER.toUpperCase()}.`}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Come back tomorrow for another round.</p>

          <div className="mt-4 flex justify-center gap-6">
            {[
              { label: 'Streak', value: stats.currentStreak },
              { label: 'Max Streak', value: stats.maxStreak },
              { label: 'Played', value: stats.gamesPlayed },
              {
                label: 'Win %',
                value: stats.gamesPlayed === 0 ? 0 : Math.round((stats.gamesWon / stats.gamesPlayed) * 100),
              },
            ].map(({ label, value }) => (
              <div key={label} aria-label={`${label}: ${value}`}>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!finished && <p className="text-sm text-gray-600 dark:text-gray-400">Guess the secret word in six tries.</p>}

      <div className="flex flex-col gap-1.5">
        {Array.from({ length: MAX_GUESSES }, (_, row) => {
          const guess = state.guesses[row]
          const result = state.results[row]
          const isCurrentRow = row === state.guesses.length && !finished

          return (
            <div key={row} className="flex gap-1.5">
              {Array.from({ length: WORD_LENGTH }, (_, col) => {
                const letter = guess ? guess[col] : isCurrentRow ? state.currentGuess[col] : undefined
                const status = result ? result[col] : undefined

                return (
                  <span
                    key={col}
                    aria-label={tileLabel(row, col, letter, status)}
                    className={`flex h-12 w-12 items-center justify-center rounded border text-xl font-bold uppercase ${status ? TILE_CLASSES[status] : 'border-gray-300 dark:border-gray-700'
                      }`}
                  >
                    {letter ?? ''}
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>

      {!finished && (
        <div className="flex flex-col items-center gap-1.5">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.split('').map((letter) => {
                const status = keyStatus.get(letter)
                return (
                  <button
                    key={letter}
                    type="button"
                    aria-label={status ? `${letter.toUpperCase()}, ${status}` : letter.toUpperCase()}
                    onClick={() => dispatch({ type: 'type', letter })}
                    className={`flex h-10 w-8 items-center justify-center rounded text-sm font-semibold uppercase transition-colors ${status ? KEY_CLASSES[status] : 'border border-gray-300 dark:border-gray-700'
                      }`}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          ))}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => dispatch({ type: 'submit' })}
              className="flex h-10 items-center justify-center rounded border border-gray-300 px-3 text-sm font-semibold dark:border-gray-700"
            >
              Enter
            </button>
            <button
              type="button"
              aria-label="Backspace"
              onClick={() => dispatch({ type: 'backspace' })}
              className="flex h-10 items-center justify-center rounded border border-gray-300 px-3 text-sm font-semibold dark:border-gray-700"
            >
              ⌫
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
