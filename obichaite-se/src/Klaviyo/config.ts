/**
 * Klaviyo configuration & feature flags.
 *
 * All env access for the integration goes through here. Only NEXT_PUBLIC_*
 * values are safe in the browser; the private API key is read lazily and only
 * ever used from server-only modules (see server/klaviyo-api.ts). Non-public
 * env vars are replaced with `undefined` in the client bundle by Next.js, so
 * referencing them here does not leak the key.
 */

import { DEFAULT_KLAVIYO_REVISION, KLAVIYO_API_BASE_URL } from './constants'

/** Server-side master switch. When false, all outbound Klaviyo calls are no-ops. */
export const isKlaviyoServerEnabled = (): boolean => process.env.KLAVIYO_ENABLED === 'true'

/** Client-side switch. Requires both the flag and a public key to be present. */
export const isKlaviyoClientEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_KLAVIYO_ENABLED === 'true' &&
  !!process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY

/** Public API key / Site ID — safe to expose in the browser. */
export const getKlaviyoPublicApiKey = (): string | undefined =>
  process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY

/** Private API key — server only. Never import this into a client component. */
export const getKlaviyoPrivateApiKey = (): string | undefined =>
  process.env.KLAVIYO_PRIVATE_API_KEY

/** API revision date sent on every private API request. */
export const getKlaviyoRevision = (): string =>
  process.env.KLAVIYO_API_REVISION || DEFAULT_KLAVIYO_REVISION

/** Base URL for the private API (override only for testing/proxies). */
export const getKlaviyoApiBaseUrl = (): string =>
  process.env.KLAVIYO_API_BASE_URL || KLAVIYO_API_BASE_URL

/**
 * Environment marker attached to event/profile properties for QA separation.
 * Prefers the public var so browser events are tagged correctly too (the
 * server-only var is undefined in the client bundle).
 */
export const getKlaviyoEnvironment = (): string =>
  process.env.NEXT_PUBLIC_KLAVIYO_ENVIRONMENT ||
  process.env.KLAVIYO_ENVIRONMENT ||
  'production'

/** Newsletter / welcome-flow list id. */
export const getKlaviyoNewsletterListId = (): string | undefined =>
  process.env.KLAVIYO_NEWSLETTER_LIST_ID

/** Enables verbose (redacted) logging when troubleshooting. */
export const isKlaviyoDebug = (): boolean => process.env.KLAVIYO_DEBUG === 'true'
