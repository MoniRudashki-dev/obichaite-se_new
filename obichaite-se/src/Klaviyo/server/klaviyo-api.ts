/**
 * Low-level HTTP client for the Klaviyo private (server-side) API.
 *
 * Server-only by convention: imported only from Payload hooks, route handlers,
 * `'use server'` actions and CLI scripts — never from client components. (A
 * `server-only` import is intentionally avoided because these modules are also
 * loaded by the Payload CLI/tsx, where that package cannot resolve.)
 *
 * Responsibilities: base URL + auth/revision headers, JSON (de)serialisation,
 * timeout, error parsing, and conservative retries for transient failures.
 * It throws a typed {@link KlaviyoApiError} on failure — the service layer is
 * responsible for catching so that Klaviyo problems never break commerce flows.
 */

import { getKlaviyoApiBaseUrl, getKlaviyoPrivateApiKey, getKlaviyoRevision } from '../config'
import { klaviyoLogger } from './logger'

const REQUEST_TIMEOUT_MS = 10_000
const MAX_RETRIES = 2

export class KlaviyoApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'KlaviyoApiError'
    this.status = status
  }
}

type KlaviyoFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  /** JSON body — serialised automatically. */
  body?: unknown
  /** Extra query string (already encoded), without leading `?`. */
  query?: string
}

const buildUrl = (path: string, query?: string): string => {
  const base = getKlaviyoApiBaseUrl().replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  const url = `${base}/${cleanPath}`
  return query ? `${url}?${query}` : url
}

const getAuthHeader = (): string => {
  const key = getKlaviyoPrivateApiKey()
  if (!key) {
    // Guard: enabled but misconfigured. Surfaced as a typed error, not a crash.
    throw new KlaviyoApiError('Missing KLAVIYO_PRIVATE_API_KEY')
  }
  return `Klaviyo-API-Key ${key}`
}

/** Retryable = transient network/timeout, 429 rate limit, or 5xx server error. */
const isRetryableStatus = (status: number): boolean => status === 429 || status >= 500

/**
 * Builds a PII-safe summary from a Klaviyo JSON:API error body.
 *
 * Uses only the generic `code`/`title` and the `source.pointer` (the field that
 * failed) — never `detail`, which can echo submitted values like email/phone.
 * Returns '' when the body can't be parsed into errors.
 */
const summarizeErrorBody = (rawBody: string): string => {
  try {
    const parsed = JSON.parse(rawBody) as {
      errors?: { code?: string; title?: string; source?: { pointer?: string } }[]
    }
    if (!Array.isArray(parsed.errors)) return ''
    return parsed.errors
      .map((err) => {
        const label = err.code || err.title || 'error'
        return err.source?.pointer ? `${label} @ ${err.source.pointer}` : label
      })
      .join('; ')
  } catch {
    return ''
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Performs a single request to the Klaviyo API with retries.
 * Returns the parsed JSON body (or `null` for empty 2xx responses like 202).
 */
export async function klaviyoFetch<T = unknown>(
  path: string,
  options: KlaviyoFetchOptions = {},
): Promise<T> {
  const { method = 'POST', body, query } = options
  const url = buildUrl(path, query)

  let lastError: KlaviyoApiError | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: getAuthHeader(),
          revision: getKlaviyoRevision(),
          // Klaviyo's JSON:API endpoints require the vnd.api+json media type.
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        signal: controller.signal,
      })

      if (res.ok) {
        const text = await res.text()
        return (text ? JSON.parse(text) : null) as T
      }

      const errorText = await res.text().catch(() => '')
      // Raw body may contain submitted identifiers — keep it out of the thrown
      // message (which can surface via KlaviyoResult.error). Debug-only, gated.
      klaviyoLogger.debug('Klaviyo error body', { path, status: res.status, body: errorText.slice(0, 500) })
      const summary = summarizeErrorBody(errorText)
      lastError = new KlaviyoApiError(
        `Klaviyo ${method} ${path} -> ${res.status}${summary ? `: ${summary}` : ''}`,
        res.status,
      )

      // Do not retry client errors (400/401/403/404 etc).
      if (!isRetryableStatus(res.status) || attempt === MAX_RETRIES) {
        throw lastError
      }

      const retryAfter = Number(res.headers.get('Retry-After'))
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 500 * Math.pow(2, attempt)
      klaviyoLogger.warn('Retrying Klaviyo request', { path, status: res.status, attempt })
      await sleep(backoff)
    } catch (err) {
      // AbortError / network error — retryable up to the cap.
      if (err instanceof KlaviyoApiError) {
        if (err.status && !isRetryableStatus(err.status)) throw err
        lastError = err
      } else {
        lastError = new KlaviyoApiError(
          `Klaviyo ${method} ${path} network error: ${(err as Error).message}`,
        )
      }
      if (attempt === MAX_RETRIES) throw lastError
      await sleep(500 * Math.pow(2, attempt))
    } finally {
      clearTimeout(timeout)
    }
  }

  // Unreachable, but keeps the type checker satisfied.
  throw lastError ?? new KlaviyoApiError(`Klaviyo ${method} ${path} failed`)
}
