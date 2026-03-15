const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export type AdminSessionPayload = {
  sub: string
  username: string
  exp: number
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function base64ToBytes(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function toBase64Url(input: string | Uint8Array) {
  const bytes = typeof input === 'string' ? textEncoder.encode(input) : input

  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const normalized = `${padded}${'='.repeat((4 - (padded.length % 4 || 4)) % 4)}`
  return base64ToBytes(normalized)
}

async function signValue(value: string, secret: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(value))
  return toBase64Url(new Uint8Array(signature))
}

function equalInConstantTime(left: string, right: string) {
  const leftBytes = textEncoder.encode(left)
  const rightBytes = textEncoder.encode(right)

  if (leftBytes.length !== rightBytes.length) {
    return false
  }

  let difference = 0

  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index]
  }

  return difference === 0
}

export async function createAdminSessionToken(
  session: { userId: string; username: string },
  secret: string,
  expiresInSeconds = 60 * 60 * 12
) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload: AdminSessionPayload = {
    sub: session.userId,
    username: session.username,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  }
  const payloadEncoded = toBase64Url(JSON.stringify(payload))
  const unsignedToken = `${header}.${payloadEncoded}`
  const signature = await signValue(unsignedToken, secret)

  return {
    token: `${unsignedToken}.${signature}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  }
}

export async function verifyAdminSessionToken(token: string, secret: string) {
  const [header, payloadEncoded, signature] = token.split('.')

  if (!header || !payloadEncoded || !signature) {
    return null
  }

  const expectedSignature = await signValue(`${header}.${payloadEncoded}`, secret)

  if (!equalInConstantTime(expectedSignature, signature)) {
    return null
  }

  try {
    const payload = JSON.parse(textDecoder.decode(fromBase64Url(payloadEncoded))) as AdminSessionPayload

    if (!payload.sub || !payload.username || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
