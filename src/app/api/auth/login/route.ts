import { NextRequest, NextResponse } from 'next/server'
import { findAccount, createSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const account = findAccount(email || '', password || '')
  if (!account) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  const token = await createSessionToken(account.email, account.role)
  const res = NextResponse.json({ ok: true, role: account.role })

  res.cookies.set('hr_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  // Cookie lisible côté client uniquement pour adapter l'UI (lecture seule)
  res.cookies.set('hr_role', account.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
