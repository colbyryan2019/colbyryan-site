import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  evaluateGuess,
  addLetter,
  removeLetter,
  submitGuess,
  storageKey,
  ANSWER,
  WORD_LENGTH,
  MAX_GUESSES,
  type ColbyWordleState,
} from '../colbyWordle'

describe('colbyWordle', () => {
  describe('createInitialState', () => {
    it('starts with no guesses, an empty current guess, and playing status', () => {
      const state = createInitialState()

      expect(state.guesses).toEqual([])
      expect(state.results).toEqual([])
      expect(state.currentGuess).toBe('')
      expect(state.status).toBe('playing')
    })
  })

  describe('evaluateGuess', () => {
    it('marks every letter correct for an exact match', () => {
      expect(evaluateGuess('colby', 'colby')).toEqual([
        'correct',
        'correct',
        'correct',
        'correct',
        'correct',
      ])
    })

    it('marks a letter absent from the answer entirely as absent', () => {
      expect(evaluateGuess('zzzzz', 'colby')).toEqual([
        'absent',
        'absent',
        'absent',
        'absent',
        'absent',
      ])
    })

    it('marks letters present but in the wrong position when none line up', () => {
      expect(evaluateGuess('bbowl', 'colby')).toEqual([
        'present',
        'absent',
        'present',
        'absent',
        'present',
      ])
    })

    it('only credits a repeated guess letter once when the answer has it once, preferring the correctly placed occurrence', () => {
      expect(evaluateGuess('lolly', 'colby')).toEqual([
        'absent',
        'correct',
        'correct',
        'absent',
        'correct',
      ])
    })
  })

  describe('addLetter', () => {
    it('appends a lowercase letter to the current guess', () => {
      const state = addLetter(createInitialState(), 'C')

      expect(state.currentGuess).toBe('c')
    })

    it('ignores non-letter input', () => {
      const state = addLetter(createInitialState(), '1')

      expect(state.currentGuess).toBe('')
    })

    it('does not grow the current guess past the word length', () => {
      let state = createInitialState()
      for (const letter of 'colbyx') state = addLetter(state, letter)

      expect(state.currentGuess).toBe('colby')
    })

    it('does nothing once the game is no longer playing', () => {
      const state: ColbyWordleState = { ...createInitialState(), status: 'won' }

      expect(addLetter(state, 'c')).toEqual(state)
    })
  })

  describe('removeLetter', () => {
    it('removes the last letter of the current guess', () => {
      const state = removeLetter({ ...createInitialState(), currentGuess: 'col' })

      expect(state.currentGuess).toBe('co')
    })

    it('does nothing when the current guess is empty', () => {
      const state = createInitialState()

      expect(removeLetter(state)).toEqual(state)
    })

    it('does nothing once the game is no longer playing', () => {
      const state: ColbyWordleState = { ...createInitialState(), currentGuess: 'col', status: 'lost' }

      expect(removeLetter(state)).toEqual(state)
    })
  })

  describe('submitGuess', () => {
    it('does nothing when the current guess is shorter than the word length', () => {
      const state = { ...createInitialState(), currentGuess: 'col' }

      expect(submitGuess(state)).toEqual(state)
    })

    it('records the guess and its evaluation, then clears the current guess', () => {
      let state = createInitialState()
      for (const letter of 'zzzzz') state = addLetter(state, letter)

      const next = submitGuess(state)

      expect(next.guesses).toEqual(['zzzzz'])
      expect(next.results).toEqual([['absent', 'absent', 'absent', 'absent', 'absent']])
      expect(next.currentGuess).toBe('')
    })

    it('sets status to won when the guess matches the answer', () => {
      let state = createInitialState()
      for (const letter of ANSWER) state = addLetter(state, letter)

      const next = submitGuess(state)

      expect(next.status).toBe('won')
    })

    it('keeps playing after a wrong guess with guesses remaining', () => {
      let state = createInitialState()
      for (const letter of 'zzzzz') state = addLetter(state, letter)

      const next = submitGuess(state)

      expect(next.status).toBe('playing')
    })

    it('sets status to lost after the final wrong guess', () => {
      let state = createInitialState()
      for (let i = 0; i < MAX_GUESSES; i++) {
        for (const letter of 'zzzzz') state = addLetter(state, letter)
        state = submitGuess(state)
      }

      expect(state.status).toBe('lost')
      expect(state.guesses).toHaveLength(MAX_GUESSES)
    })

    it('does nothing once the game is no longer playing', () => {
      const state: ColbyWordleState = { ...createInitialState(), currentGuess: 'zzzzz', status: 'won' }

      expect(submitGuess(state)).toEqual(state)
    })
  })

  describe('storageKey', () => {
    it('formats a zero-padded local date into the key', () => {
      expect(storageKey(new Date(2026, 0, 5))).toBe('colby-wordle-2026-01-05')
    })

    it('produces a different key for a different day', () => {
      expect(storageKey(new Date(2026, 0, 5))).not.toBe(storageKey(new Date(2026, 0, 6)))
    })
  })

  describe('constants', () => {
    it('sets the answer to colby', () => {
      expect(ANSWER).toBe('colby')
      expect(ANSWER).toHaveLength(WORD_LENGTH)
    })
  })
})
