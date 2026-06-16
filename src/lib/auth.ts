export type Role = 'full' | 'readonly'

interface Account {
  email: string
  password: string
  role: Role
}

const ACCOUNTS: Account[] = [
  { email: 'admin@homeresine.fr', password: 'Homeresine0626', role: 'readonly' },
  { email: 'admin@omeo.mg', password: 'admin.1234', role: 'full' },
]

const SECRET = process.env.AUTH_SECRET || 'homeresine-audit-omeo-fallback-secret'

export function findAccount(email: string, password: string): Account | null {
  const acc = ACCOUNTS.find(a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password)
  return acc || null
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return toHex(sig)
}

export async function createSessionToken(email: string, role: Role): Promise<string> {
  const payload = `${email}|${role}|${Date.now()}`
  const b64 = Buffer.from(payload).toString('base64url')
  const sig = await sign(b64)
  return `${b64}.${sig}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<{ email: string; role: Role } | null> {
  if (!token) return null
  const [b64, sig] = token.split('.')
  if (!b64 || !sig) return null
  const expected = await sign(b64)
  if (expected !== sig) return null
  try {
    const payload = Buffer.from(b64, 'base64url').toString('utf-8')
    const [email, role] = payload.split('|')
    if (role !== 'full' && role !== 'readonly') return null
    return { email, role }
  } catch {
    return null
  }
}
