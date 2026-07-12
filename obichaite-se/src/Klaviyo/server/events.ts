/**
 * Event service — sends server-side metric events to Klaviyo (`POST /api/events`).
 *
 * Primary use is the reliable `Placed Order` event, but it is generic enough for
 * any server-emitted metric. Never throws: returns a {@link KlaviyoResult}.
 */

import { isKlaviyoServerEnabled } from '../config'
import type { KlaviyoProfileInput, KlaviyoResult } from '../types'
import { KlaviyoApiError, klaviyoFetch } from './klaviyo-api'
import { klaviyoLogger, maskEmail } from './logger'
import { buildProfileAttributes, compact, hasIdentifier } from './serializers'

export type TrackEventParams = {
  /** Standard metric name, e.g. "Placed Order". */
  metric: string
  /** Profile the event belongs to — must carry at least one identifier. */
  profile: KlaviyoProfileInput
  /** Event properties (already normalised through a mapper). */
  properties: Record<string, unknown>
  /** Monetary value of the event, if applicable. */
  value?: number
  /** Currency for `value`. */
  currency?: string
  /** Deterministic id used by Klaviyo to de-duplicate events (e.g. order number). */
  uniqueId?: string
  /** ISO timestamp; defaults to now on Klaviyo's side when omitted. */
  time?: string
}

export async function trackEvent(params: TrackEventParams): Promise<KlaviyoResult> {
  if (!isKlaviyoServerEnabled()) return { ok: false, skipped: true }

  if (!hasIdentifier(params.profile)) {
    klaviyoLogger.warn('Skipping event: no profile identifier', { metric: params.metric })
    return { ok: false, error: 'missing identifier' }
  }

  try {
    await klaviyoFetch('/api/events', {
      method: 'POST',
      body: {
        data: {
          type: 'event',
          attributes: compact({
            properties: params.properties,
            value: params.value,
            value_currency: params.currency,
            unique_id: params.uniqueId,
            time: params.time,
            metric: {
              data: { type: 'metric', attributes: { name: params.metric } },
            },
            profile: {
              data: { type: 'profile', attributes: buildProfileAttributes(params.profile) },
            },
          }),
        },
      },
    })
    klaviyoLogger.debug('Event sent', {
      metric: params.metric,
      email: maskEmail(params.profile.email),
      uniqueId: params.uniqueId,
    })
    return { ok: true, data: null }
  } catch (err) {
    const status = err instanceof KlaviyoApiError ? err.status : undefined
    klaviyoLogger.error('Event send failed', { metric: params.metric, status })
    return { ok: false, error: (err as Error).message, status }
  }
}
