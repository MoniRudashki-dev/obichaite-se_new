import type { CollectionAfterChangeHook } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Order } from '@/payload-types'
import { isKlaviyoServerEnabled } from '@/Klaviyo/config'
import { sendPlacedOrderEvent } from '@/Klaviyo/server/placed-order'
import { klaviyoLogger } from '@/Klaviyo/server/logger'

/**
 * Sends the Klaviyo "Placed Order" event for every newly created order.
 *
 * Design:
 * - Fires on `create` only (covers both the storefront `makeOrder` action and
 *   admin-created orders). Payment status (paid / unpaid / needBankTransfer) is
 *   sent as a property — an order is "placed" regardless of payment method.
 * - Idempotent: Klaviyo de-duplicates by the unique order number, and success
 *   marks `klaviyoPlacedOrderSentAt`.
 * - This is the fast, non-blocking *immediate* attempt (fire-and-forget so it
 *   never blocks order creation). Durable delivery is guaranteed by the retry
 *   sweep (`jobs/retry-placed-orders`), which resends any order left unmarked —
 *   covering dropped fire-and-forget calls, transient failures, or a disabled
 *   integration at create time.
 */
export const syncKlaviyoPlacedOrder: CollectionAfterChangeHook<Order> = ({ doc, operation }) => {
  if (operation !== 'create') return doc
  if (!isKlaviyoServerEnabled()) return doc
  if (doc.klaviyoPlacedOrderSentAt) return doc
  if (!doc.customerEmail) return doc

  // Do not await — order creation must not depend on the Klaviyo request.
  void (async () => {
    try {
      const payload = await getPayload({ config: configPromise })
      // Re-read (post-commit) with depth so item products are populated, giving
      // the event proper URLs / images / categories. Falls back to the hook doc.
      const fresh = (await payload
        .findByID({ collection: 'order', id: doc.id, depth: 2, overrideAccess: true })
        .catch(() => null)) as Order | null

      await sendPlacedOrderEvent(fresh ?? doc, payload)
    } catch (error) {
      klaviyoLogger.error('Placed Order immediate send failed', {
        orderId: doc.orderNumber ?? doc.id,
        message: (error as Error).message,
      })
    }
  })()

  return doc
}
