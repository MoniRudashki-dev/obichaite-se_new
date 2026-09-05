/**
 * HTTP клиентът към Econt.
 *
 * Отделен от `Econt/action`, защото онзи файл е `'use server'` и всеки негов
 * export става извикваем от браузъра. `callEcont` приема произволен път и body,
 * така че не бива да се публикува като server action — оттук го ползват и
 * server action-ите, и генераторът на `econt-settlements.json`.
 */

const { ECONT_BASE_URL, ECONT_USERNAME, ECONT_PASSWORD } = process.env

if (!ECONT_BASE_URL || !ECONT_USERNAME || !ECONT_PASSWORD) {
  throw new Error('Missing Econt env variables')
}

export function buildEcontUrl(path: string) {
  const base = ECONT_BASE_URL!.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  return `${base}/${cleanPath}`
}

export async function callEcont<T>(path: string, body: unknown): Promise<T> {
  const url = buildEcontUrl(path)

  const auth = Buffer.from(`${ECONT_USERNAME}:${ECONT_PASSWORD}`).toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Econt error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}
