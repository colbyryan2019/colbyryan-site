import { NextResponse } from 'next/server'
import { getWordRainLeaderboard, submitWordRainScore } from '@/lib/leaderboardStore'
import { INITIALS_LENGTH } from '@/lib/wordRain'

export async function GET() {
  const leaderboard = await getWordRainLeaderboard()
  return NextResponse.json(leaderboard)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const initials =
    typeof body?.initials === 'string' ? body.initials.trim().toUpperCase().slice(0, INITIALS_LENGTH) : ''
  const score = typeof body?.score === 'number' ? Math.trunc(body.score) : NaN

  if (!initials || !Number.isFinite(score) || score < 0) {
    return NextResponse.json({ error: 'Invalid initials or score' }, { status: 400 })
  }

  const leaderboard = await submitWordRainScore({ initials, score })
  return NextResponse.json(leaderboard)
}
