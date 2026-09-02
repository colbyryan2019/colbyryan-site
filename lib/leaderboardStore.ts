import { get, put, BlobPreconditionFailedError } from '@vercel/blob'
import { addLeaderboardEntry, type LeaderboardEntry } from './wordRain'

const PATHNAME = 'leaderboards/word-rain.json'
const MAX_WRITE_ATTEMPTS = 3

async function readLeaderboard(): Promise<{ entries: LeaderboardEntry[]; etag?: string }> {
  const result = await get(PATHNAME, { access: 'private', useCache: false })
  if (!result) return { entries: [] }
  const text = await new Response(result.stream).text()
  return { entries: JSON.parse(text) as LeaderboardEntry[], etag: result.blob.etag }
}

export async function getWordRainLeaderboard(): Promise<LeaderboardEntry[]> {
  return (await readLeaderboard()).entries
}

// Read-modify-write against a single JSON blob, using the ETag as an
// optimistic lock so two near-simultaneous submissions don't clobber each
// other - retried a couple of times on conflict before giving up. (The very
// first write, when no blob exists yet, has no ETag to guard with; at this
// site's traffic level that race isn't worth the extra complexity to close.)
export async function submitWordRainScore(entry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
  for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt++) {
    const { entries, etag } = await readLeaderboard()
    const updated = addLeaderboardEntry(entries, entry)
    try {
      await put(PATHNAME, JSON.stringify(updated), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        ifMatch: etag,
      })
      return updated
    } catch (error) {
      const isConflict = error instanceof BlobPreconditionFailedError
      if (!isConflict || attempt === MAX_WRITE_ATTEMPTS) throw error
    }
  }
  throw new Error('unreachable')
}
