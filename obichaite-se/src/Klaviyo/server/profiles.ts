/**
 * Profile service — create or update a Klaviyo profile.
 *
 * Uses the `profile-import` upsert endpoint (200 update / 201 create). Never
 * throws to callers: returns a {@link KlaviyoResult} so commerce flows are
 * unaffected by Klaviyo problems.
 */

import { isKlaviyoServerEnabled } from '../config'
import type { KlaviyoProfileInput, KlaviyoResult } from '../types'
import { KlaviyoApiError, klaviyoFetch } from './klaviyo-api'
import { klaviyoLogger, maskEmail } from './logger'
import { buildProfileAttributes, hasIdentifier } from './serializers'

export async function upsertProfile(
  profile: KlaviyoProfileInput,
): Promise<KlaviyoResult<{ id?: string }>> {
  if (!isKlaviyoServerEnabled()) return { ok: false, skipped: true }

  if (!hasIdentifier(profile)) {
    klaviyoLogger.warn('Skipping profile upsert: no identifier')
    return { ok: false, error: 'missing identifier' }
  }

  try {
    const response = await klaviyoFetch<{ data?: { id?: string } }>('/api/profile-import', {
      method: 'POST',
      body: {
        data: {
          type: 'profile',
          attributes: buildProfileAttributes(profile),
        },
      },
    })
    klaviyoLogger.debug('Profile upserted', { email: maskEmail(profile.email) })
    return { ok: true, data: { id: response?.data?.id } }
  } catch (err) {
    const status = err instanceof KlaviyoApiError ? err.status : undefined
    klaviyoLogger.error('Profile upsert failed', {
      email: maskEmail(profile.email),
      status,
    })
    return { ok: false, error: (err as Error).message, status }
  }
}
