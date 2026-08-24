import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  getDifficulty,
  spawnWord,
  typeChar,
  missWord,
  resetGame,
  WORDS,
  THEMED_WORDS,
  LETTERS,
  MAX_LIVES,
  type WordRainState,
  type FallingWord,
} from '../wordRain'

const DEFAULT_FALL_MS = 5000

function withWords(
  state: WordRainState,
  words: Array<Omit<FallingWord, 'fallDurationMs'> & { fallDurationMs?: number }>,
): WordRainState {
  return { ...state, words: words.map((word) => ({ fallDurationMs: DEFAULT_FALL_MS, ...word })) }
}

describe('wordRain', () => {
  describe('createInitialState', () => {
    it('starts with no words, zero score, full lives, and not finished', () => {
      const state = createInitialState()

      expect(state.words).toEqual([])
      expect(state.score).toBe(0)
      expect(state.lives).toBe(MAX_LIVES)
      expect(state.finished).toBe(false)
      expect(state.activeWordId).toBeNull()
    })
  })

  describe('getDifficulty', () => {
    it('starts at a quick pace, with two concurrent items at zero score', () => {
      const difficulty = getDifficulty(0)

      expect(difficulty.level).toBe(0)
      expect(difficulty.fallDurationMinMs).toBe(4200)
      expect(difficulty.fallDurationMaxMs).toBe(6000)
      expect(difficulty.spawnIntervalMs).toBe(1500)
      expect(difficulty.maxConcurrent).toBe(2)
      expect(difficulty.maxWordLength).toBe(3)
    })

    it('ramps fall speed, concurrency, and word length as score rises', () => {
      const difficulty = getDifficulty(250)

      expect(difficulty.level).toBe(2)
      expect(difficulty.fallDurationMinMs).toBe(3400)
      expect(difficulty.fallDurationMaxMs).toBe(5200)
      expect(difficulty.spawnIntervalMs).toBe(1200)
      expect(difficulty.maxConcurrent).toBe(3)
      expect(difficulty.maxWordLength).toBe(5)
    })

    it('clamps fall speed, concurrency, and word length at high score so it never becomes unplayable or exceeds the word list', () => {
      const difficulty = getDifficulty(5000)

      expect(difficulty.fallDurationMinMs).toBe(1800)
      expect(difficulty.fallDurationMaxMs).toBe(2600)
      expect(difficulty.spawnIntervalMs).toBe(700)
      expect(difficulty.maxConcurrent).toBe(5)
      expect(difficulty.maxWordLength).toBe(10)
    })
  })

  describe('spawnWord', () => {
    it('adds an item from the word or letter pool at the given x position', () => {
      const state = createInitialState()

      const next = spawnWord(state, 42)

      expect(next.words).toHaveLength(1)
      expect(next.words[0].x).toBe(42)
      expect(next.words[0].typed).toBe(0)
      expect([...WORDS, ...THEMED_WORDS, ...LETTERS]).toContain(next.words[0].word)
    })

    it('never spawns a word longer than the current difficulty allows', () => {
      const state = createInitialState()

      for (let i = 0; i < 30; i++) {
        const next = spawnWord(state, i)
        expect(next.words[0].word.length).toBeLessThanOrEqual(getDifficulty(0).maxWordLength)
      }
    })

    it('can spawn single letters, not just multi-character words', () => {
      const state = createInitialState()
      const spawned = new Set<string>()

      for (let i = 0; i < 200; i++) {
        spawned.add(spawnWord(state, i).words[0].word)
      }

      expect([...spawned].some((word) => word.length === 1)).toBe(true)
    })

    it('does not spawn past the current difficulty concurrency cap', () => {
      const state = withWords(createInitialState(), [
        { id: 1, word: 'cat', typed: 0, x: 10 },
        { id: 2, word: 'dog', typed: 0, x: 20 },
      ])

      const next = spawnWord(state, 30)

      expect(next.words).toHaveLength(2)
    })

    it('picks a fall duration within the current difficulty range, varying between spawns', () => {
      const state = createInitialState()
      const { fallDurationMinMs, fallDurationMaxMs } = getDifficulty(0)
      const durations = new Set<number>()

      for (let i = 0; i < 30; i++) {
        const duration = spawnWord(state, i).words[0].fallDurationMs
        expect(duration).toBeGreaterThanOrEqual(fallDurationMinMs)
        expect(duration).toBeLessThanOrEqual(fallDurationMaxMs)
        durations.add(duration)
      }

      expect(durations.size).toBeGreaterThan(1)
    })

    it('does not spawn once the game is finished', () => {
      const state = { ...createInitialState(), finished: true }

      const next = spawnWord(state, 42)

      expect(next.words).toEqual([])
    })

    it('assigns increasing unique ids across spawns', () => {
      let state = createInitialState()
      state = spawnWord(state, 10)
      state = { ...state, score: 500 }
      state = spawnWord(state, 20)

      expect(state.words.map((w) => w.id)).toEqual([1, 2])
    })
  })

  describe('typeChar', () => {
    it('locks onto and advances a word whose next letter matches the typed key', () => {
      const state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])

      const next = typeChar(state, 'c')

      expect(next.words[0].typed).toBe(1)
      expect(next.activeWordId).toBe(1)
    })

    it('is case-insensitive', () => {
      const state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])

      const next = typeChar(state, 'C')

      expect(next.words[0].typed).toBe(1)
    })

    it('ignores a key that matches no word, leaving state unchanged', () => {
      const state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])

      const next = typeChar(state, 'z')

      expect(next).toEqual(state)
    })

    it('continues advancing the already-active word on the next correct key', () => {
      let state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])
      state = typeChar(state, 'c')

      const next = typeChar(state, 'a')

      expect(next.words[0].typed).toBe(2)
      expect(next.activeWordId).toBe(1)
    })

    it('ignores a mismatched key while a word is actively being typed, without losing its progress', () => {
      let state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])
      state = typeChar(state, 'c')

      const next = typeChar(state, 'z')

      expect(next).toEqual(state)
    })

    it('clears the word and awards score for its length once fully typed, freeing the active slot', () => {
      let state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])
      state = typeChar(state, 'c')
      state = typeChar(state, 'a')

      const next = typeChar(state, 't')

      expect(next.words).toEqual([])
      expect(next.score).toBe(30)
      expect(next.activeWordId).toBeNull()
    })

    it('can lock onto a different word after the active one is cleared', () => {
      let state = withWords(createInitialState(), [
        { id: 1, word: 'cat', typed: 0, x: 10 },
        { id: 2, word: 'dog', typed: 0, x: 20 },
      ])
      state = typeChar(state, 'c')
      state = typeChar(state, 'a')
      state = typeChar(state, 't')

      const next = typeChar(state, 'd')

      expect(next.words).toEqual([{ id: 2, word: 'dog', typed: 1, x: 20, fallDurationMs: DEFAULT_FALL_MS }])
      expect(next.activeWordId).toBe(2)
    })

    it('ignores all keys once the game is finished', () => {
      const state = { ...withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }]), finished: true }

      const next = typeChar(state, 'c')

      expect(next).toEqual(state)
    })
  })

  describe('missWord', () => {
    it('removes the word and costs a life', () => {
      const state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])

      const next = missWord(state, 1)

      expect(next.words).toEqual([])
      expect(next.lives).toBe(MAX_LIVES - 1)
      expect(next.finished).toBe(false)
    })

    it('finishes the game once lives reach zero', () => {
      const state = { ...withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }]), lives: 1 }

      const next = missWord(state, 1)

      expect(next.lives).toBe(0)
      expect(next.finished).toBe(true)
    })

    it('clears the active word id if the missed word was the active target', () => {
      let state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])
      state = typeChar(state, 'c')

      const next = missWord(state, 1)

      expect(next.activeWordId).toBeNull()
    })

    it('does nothing for an id that is not present', () => {
      const state = withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }])

      const next = missWord(state, 999)

      expect(next).toEqual(state)
    })

    it('does not drop lives below zero for a miss that lands after the game already finished', () => {
      const state = {
        ...withWords(createInitialState(), [{ id: 1, word: 'cat', typed: 0, x: 10 }]),
        lives: 0,
        finished: true,
      }

      const next = missWord(state, 1)

      expect(next).toEqual(state)
    })
  })

  describe('resetGame', () => {
    it('returns to the initial state regardless of prior game state', () => {
      const next = resetGame()

      expect(next).toEqual(createInitialState())
    })
  })

  describe('word list', () => {
    it('does not include mello', () => {
      expect(WORDS).not.toContain('mello')
      expect(THEMED_WORDS).not.toContain('mello')
    })

    it('offers all 26 single letters', () => {
      expect(LETTERS).toHaveLength(26)
      expect(new Set(LETTERS).size).toBe(26)
      expect(LETTERS.every((letter) => /^[a-z]$/.test(letter))).toBe(true)
    })
  })
})
