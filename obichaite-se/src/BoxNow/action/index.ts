'use server'

import 'server-only'
import { unstable_cache } from 'next/cache'
import { BoxnowDestinationRaw, BoxnowLocker } from '../types'

const { BOXNOW_API_URL, BOXNOW_CLIENT_ID, BOXNOW_CLIENT_SECRET } = process.env

if (!BOXNOW_API_URL || !BOXNOW_CLIENT_ID || !BOXNOW_CLIENT_SECRET) {
  throw new Error('Missing BoxNow env variables')
}

function buildBoxnowUrl(path: string) {
  const base = BOXNOW_API_URL!.replace(/\/$/, '')
  const clean = path.replace(/^\//, '')

  return `${base}/${clean}`
}

async function getBoxnowAccessToken(): Promise<string> {
  const url = buildBoxnowUrl('auth-sessions')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: BOXNOW_CLIENT_ID,
      client_secret: BOXNOW_CLIENT_SECRET,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`BoxNow auth error ${res.status}: ${text}`)
  }

  const json = (await res.json()) as {
    access_token: string
    token_type: string
    expires_in: number
  }

  return json.access_token
}

export async function callBoxnow<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getBoxnowAccessToken()
  const url = buildBoxnowUrl(path)

  const res = await fetch(url, {
    method: init?.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
    body: init?.body,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`BoxNow error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

// Тук може да се наложи да смениш 'destinations' с точния path от BoxNow документацията
const getBoxnowLockersCached = unstable_cache(
  async (): Promise<BoxnowLocker[]> => {
    try {
      const raw = await callBoxnow<BoxnowDestinationRaw[]>('destinations')

      const resources: BoxnowDestinationRaw[] =
        'data' in raw ? (raw.data as BoxnowDestinationRaw[]) : []

      return resources.map(
        (d): BoxnowLocker => ({
          id: d.id,
          name: d.name,
        }),
      )
    } catch (error) {
      console.log(error)
      return []
    }
  },
  ['boxnow-lockers'],
  {
    revalidate: 60 * 60 * 24,
  },
)

export async function getBoxnowCitiesAction(): Promise<BoxnowLocker[]> {
  const lockers = await getBoxnowLockersCached()

  const unique = lockers.map((locker) => {
    return {
      id: locker.id,
      name: locker.name,
    }
  })

  return unique.sort((a, b) => a.name.localeCompare(b.name, 'bg'))
}
