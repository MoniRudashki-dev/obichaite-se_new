/**
 * Newsletter service — subscribes a profile to the configured list with explicit
 * email-marketing consent (`POST /api/profile-subscription-bulk-create-jobs`).
 *
 * Only ever called when the user has given explicit consent. Also records the
 * consent source/timestamp on the profile. Never throws.
 */

import { getKlaviyoNewsletterListId, isKlaviyoServerEnabled } from '../config'
import type { KlaviyoResult } from '../types'
import { KlaviyoApiError, klaviyoFetch } from './klaviyo-api'
import { klaviyoLogger, maskEmail } from './logger'
import { compact } from './serializers'
import { upsertProfile } from './profiles'
import { mapProfileToKlaviyo } from '../mappers/profile.mapper'

export type SubscribeInput = {
  email: string
  fullName?: string | null
  phone?: string | null
  /** Where the consent was collected, e.g. "checkout". */
  source: string
}

export async function subscribeToNewsletter(input: SubscribeInput): Promise<KlaviyoResult> {
  if (!isKlaviyoServerEnabled()) return { ok: false, skipped: true }

  const listId = getKlaviyoNewsletterListId()
  if (!listId) {
    klaviyoLogger.warn('Skipping newsletter subscribe: KLAVIYO_NEWSLETTER_LIST_ID not set')
    return { ok: false, error: 'missing list id' }
  }

  const email = input.email?.trim().toLowerCase()
  if (!email) return { ok: false, error: 'missing email' }

  const consentAt = new Date().toISOString()

  // Record consent metadata on the profile (best-effort; subscription is the primary action).
  await upsertProfile(
    mapProfileToKlaviyo({
      email,
      fullName: input.fullName,
      phone: input.phone,
      properties: {
        marketing_consent_source: input.source,
        marketing_consent_at: consentAt,
      },
    }),
  )

  try {
    await klaviyoFetch('/api/profile-subscription-bulk-create-jobs', {
      method: 'POST',
      body: {
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            custom_source: input.source,
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: compact({
                    email,
                    phone_number: input.phone?.trim() || undefined,
                    subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                  }),
                },
              ],
            },
          },
          relationships: {
            list: { data: { type: 'list', id: listId } },
          },
        },
      },
    })
    klaviyoLogger.info('Newsletter subscription requested', {
      email: maskEmail(email),
      source: input.source,
    })
    return { ok: true, data: null }
  } catch (err) {
    const status = err instanceof KlaviyoApiError ? err.status : undefined
    klaviyoLogger.error('Newsletter subscribe failed', { email: maskEmail(email), status })
    return { ok: false, error: (err as Error).message, status }
  }
}
