/**
 * JSON:API serialisers shared by the profile and event endpoints.
 *
 * Kept separate so the exact Klaviyo request shapes live in one place. `null`
 * values are omitted (Klaviyo treats `null` as "clear this field").
 */

import type { KlaviyoProfileInput } from '../types'

/** Strips undefined/null keys from an object (shallow). */
export const compact = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) out[key] = value
  }
  return out as Partial<T>
}

/** True when a profile carries at least one usable identifier. */
export const hasIdentifier = (profile: KlaviyoProfileInput): boolean =>
  !!(profile.email || profile.phoneNumber || profile.externalId)

/** Builds the `attributes` object for a Klaviyo profile from the plugin type. */
export const buildProfileAttributes = (profile: KlaviyoProfileInput): Record<string, unknown> =>
  compact({
    email: profile.email,
    phone_number: profile.phoneNumber,
    first_name: profile.firstName,
    last_name: profile.lastName,
    external_id: profile.externalId,
    properties: profile.properties && Object.keys(profile.properties).length > 0
      ? profile.properties
      : undefined,
  })
