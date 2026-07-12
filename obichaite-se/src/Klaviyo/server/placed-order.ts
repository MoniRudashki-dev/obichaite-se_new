/**
 * Shared "Placed Order" delivery logic.
 *
 * Used by both the immediate order afterChange hook and the durable retry sweep,
 * so the event payload and the idempotency marking live in exactly one place.
 * Delivery is idempotent: Klaviyo de-duplicates by `unique_id` (order number),
 * and success marks `klaviyoPlacedOrderSentAt` on the order.
 */

import type { Payload } from 'payload'
import { Order } from '@/payload-types'
import { getKlaviyoEnvironment } from '../config'
import { KLAVIYO_METRICS } from '../constants'
import { mapOrderToKlaviyo } from '../mappers/order.mapper'
import { trackEvent } from './events'

export const buildPlacedOrderProperties = (order: Order): Record<string, unknown> => {
  const mapped = mapOrderToKlaviyo(order)
  const categories = [...new Set(mapped.items.flatMap((item) => item.categories ?? []))]

  return {
    OrderId: mapped.orderId,
    Categories: categories,
    ItemNames: mapped.items.map((item) => item.title),
    Items: mapped.items.map((item) => ({
      ProductID: item.productId,
      ProductName: item.title,
      Price: item.price,
      Quantity: item.quantity ?? 1,
      URL: item.url || undefined,
      ImageURL: item.imageUrl,
      Categories: item.categories,
    })),
    PaymentStatus: mapped.paymentStatus,
    OrderStatus: mapped.orderStatus,
    DeliveryMethod: mapped.deliveryMethod,
    ShippingTotal: mapped.shippingTotal,
    Currency: mapped.currency,
    Environment: getKlaviyoEnvironment(),
  }
}

/**
 * Sends the Placed Order event for one order and, on success, marks it sent.
 * Returns whether the event was delivered. Assumes the order is populated
 * (depth) by the caller for full product URLs/images/categories.
 */
export async function sendPlacedOrderEvent(order: Order, payload: Payload): Promise<boolean> {
  const mapped = mapOrderToKlaviyo(order)

  const result = await trackEvent({
    metric: KLAVIYO_METRICS.PLACED_ORDER,
    profile: mapped.customer,
    properties: buildPlacedOrderProperties(order),
    value: mapped.value,
    currency: mapped.currency,
    uniqueId: mapped.orderId,
    time: mapped.createdAt,
  })

  if (!result.ok) return false

  // Mark as sent (idempotency). `disableRevalidate` avoids the order revalidate
  // hook calling `revalidateTag` outside a request scope, which could roll back
  // this write.
  await payload.update({
    collection: 'order',
    id: order.id,
    data: { klaviyoPlacedOrderSentAt: new Date().toISOString() },
    depth: 0,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  return true
}
