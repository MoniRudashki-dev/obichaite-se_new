/**
 * Profile mapper: loose customer input -> `KlaviyoProfileInput`.
 *
 * Accepts a full name (split into first/last) plus optional identifiers and
 * custom properties. Callers must ensure at least one identifier (email/phone)
 * is present before sending to Klaviyo.
 */

import { getKlaviyoEnvironment } from '../config'
import type { KlaviyoProfileInput } from '../types'
import { splitFullName } from './shared'

export type ProfileMapperInput = {
  email?: string | null
  phone?: string | null
  fullName?: string | null
  externalId?: string | null
  properties?: Record<string, unknown>
}

export const mapProfileToKlaviyo = (input: ProfileMapperInput): KlaviyoProfileInput => {
  const { firstName, lastName } = splitFullName(input.fullName)

  return {
    email: input.email?.trim().toLowerCase() || undefined,
    phoneNumber: input.phone?.trim() || undefined,
    firstName,
    lastName,
    externalId: input.externalId ?? undefined,
    properties: {
      source: 'website',
      environment: getKlaviyoEnvironment(),
      ...input.properties,
    },
  }
}
