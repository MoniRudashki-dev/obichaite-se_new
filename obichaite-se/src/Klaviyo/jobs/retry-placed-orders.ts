/**
 * Durable retry sweep for the Placed Order event (outbox pattern).
 *
 * The order row is the outbox: an empty `klaviyoPlacedOrderSentAt` means the
 * event still needs sending. This sweep resends those, guaranteeing eventual
 * delivery even if the immediate afterChange attempt was dropped (serverless
 * lifecycle), failed transiently, or ran while the integration was disabled.
 *
 * Safety:
 * - Bounded to a recent window so it NEVER back-fills historical orders created
 *   before the integration existed (which would flood Klaviyo and mis-fire
 *   post-purchase flows).
 * - Skips orders younger than a couple of minutes so it doesn't race the
 *   immediate attempt (and Klaviyo de-duplicates by unique_id regardless).
 * - Skips cancelled orders.
 * Intended to be run on a schedule (secret route / `pnpm klaviyo:retry-placed-orders`).
 */

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Order } from '@/payload-types'
import { isKlaviyoServerEnabled } from '../config'
import { sendPlacedOrderEvent } from '../server/placed-order'
import { klaviyoLogger } from '../server/logger'

/** Only retry orders created within this window (never back-fill old orders). */
const RETRY_WINDOW_MS = 72 * 60 * 60 * 1000 // 72h
/** Give the immediate attempt time to complete before the sweep picks it up. */
const MIN_AGE_MS = 2 * 60 * 1000 // 2 min
/** Cap per run to keep the job bounded. */
const MAX_ORDERS = 200

export type RetryPlacedOrdersSummary = {
  enabled: boolean
  found: number
  sent: number
  failed: number
}

export async function retryPendingPlacedOrders(): Promise<RetryPlacedOrdersSummary> {
  if (!isKlaviyoServerEnabled()) {
    return { enabled: false, found: 0, sent: 0, failed: 0 }
  }

  const payload = await getPayload({ config: configPromise })
  const now = Date.now()
  const createdFrom = new Date(now - RETRY_WINDOW_MS).toISOString()
  const createdUntil = new Date(now - MIN_AGE_MS).toISOString()

  const result = await payload.find({
    collection: 'order',
    where: {
      and: [
        { klaviyoPlacedOrderSentAt: { exists: false } },
        { createdAt: { greater_than_equal: createdFrom } },
        { createdAt: { less_than_equal: createdUntil } },
        { status: { not_equals: 'cancelled' } },
        { customerEmail: { exists: true } },
      ],
    },
    depth: 2,
    limit: MAX_ORDERS,
    pagination: false,
    overrideAccess: true,
  })

  const orders = result.docs as Order[]
  let sent = 0
  let failed = 0

  for (const order of orders) {
    try {
      const ok = await sendPlacedOrderEvent(order, payload)
      if (ok) sent += 1
      else failed += 1
    } catch (error) {
      failed += 1
      klaviyoLogger.error('Placed Order retry failed', {
        orderId: order.orderNumber ?? order.id,
        message: (error as Error).message,
      })
    }
  }

  const summary: RetryPlacedOrdersSummary = { enabled: true, found: orders.length, sent, failed }
  klaviyoLogger.info('Placed Order retry finished', summary)
  return summary
}
