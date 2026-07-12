/**
 * Thin wrapper over the Klaviyo onsite object (`klaviyo.js`).
 *
 * All browser identify/track calls go through here so gating (feature flag,
 * SSR guard) and the onsite queue live in one place — analogous to
 * `src/services/anatilitics.ts` for GTM.
 *
 * Queueing: `klaviyo.js` is loaded async, so calls can happen before it is
 * ready. We install Klaviyo's official bootstrap stub on demand — a Proxy over
 * `window._klOnsite` — so early calls are queued (not dropped) and replayed when
 * the script loads. This mirrors the snippet documented at
 * https://developers.klaviyo.com/en/docs/introduction_to_the_klaviyo_object
 */

import { isKlaviyoClientEnabled } from '../config'

type KlaviyoObject = {
  identify?: (properties: Record<string, unknown>, callback?: (result: unknown) => void) => unknown
  track?: (metric: string, properties?: Record<string, unknown>) => unknown
  push?: (...args: unknown[]) => void
}

declare global {
  interface Window {
    klaviyo?: KlaviyoObject
    _klOnsite?: unknown[]
  }
}

const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Installs Klaviyo's onsite stub if the object isn't present yet, so calls made
 * before `klaviyo.js` loads are queued into `window._klOnsite` and processed on
 * load. Faithful re-implementation of the official bootstrap snippet.
 */
const ensureKlaviyoQueue = (): void => {
  if (window.klaviyo) return
  window._klOnsite = window._klOnsite || []
  try {
    window.klaviyo = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'push') {
            return (...args: unknown[]) => {
              window._klOnsite!.push(...args)
            }
          }
          return (...args: unknown[]) => {
            const maybeCallback = args[args.length - 1]
            const callback =
              typeof maybeCallback === 'function'
                ? (args.pop() as (result: unknown) => void)
                : undefined
            return new Promise((resolve) => {
              window._klOnsite!.push([
                String(prop),
                ...args,
                (result: unknown) => {
                  callback?.(result)
                  resolve(result)
                },
              ])
            })
          }
        },
      },
    ) as KlaviyoObject
  } catch {
    // Proxy unsupported — fall back to a plain queue (legacy behaviour).
    const queue = [] as unknown as KlaviyoObject
    queue.push = (...args: unknown[]) => {
      window._klOnsite!.push(...args)
    }
    window.klaviyo = queue
  }
}

export type KlaviyoIdentifyInput = {
  email?: string
  phoneNumber?: string
  firstName?: string
  lastName?: string
  properties?: Record<string, unknown>
}

/** Removes undefined/null values so we don't send empty keys. */
const compact = (obj: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) out[key] = value
  }
  return out
}

/**
 * Identifies the current visitor with Klaviyo (known email/phone only).
 * `onComplete` runs after identification resolves — use it to guarantee
 * identify-before-track ordering.
 */
export const klaviyoIdentify = (
  input: KlaviyoIdentifyInput,
  onComplete?: () => void,
): void => {
  if (!isBrowser() || !isKlaviyoClientEnabled()) return
  if (!input.email && !input.phoneNumber) return

  ensureKlaviyoQueue()

  const payload = compact({
    email: input.email,
    phone_number: input.phoneNumber,
    first_name: input.firstName,
    last_name: input.lastName,
    ...input.properties,
  })

  window.klaviyo?.identify?.(payload, onComplete ? () => onComplete() : undefined)
}

/** Sends a browser metric event to Klaviyo. */
export const klaviyoTrack = (metric: string, properties: Record<string, unknown>): void => {
  if (!isBrowser() || !isKlaviyoClientEnabled()) return

  ensureKlaviyoQueue()
  window.klaviyo?.track?.(metric, properties)
}
