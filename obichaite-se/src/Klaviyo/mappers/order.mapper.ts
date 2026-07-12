/**
 * Order mapper: Payload `Order` -> `KlaviyoOrderInput`.
 *
 * Runs server-side inside the Placed Order hook. Line items use the order's
 * price snapshot (`unitPrice`/`productTitle`) so historical orders stay correct
 * even if the product later changes; when the product relationship is populated
 * we enrich url/image/categories from it.
 */

import type { Order, Product } from '@/payload-types'
import type { KlaviyoOrderInput, KlaviyoProductInput, KlaviyoProfileInput } from '../types'
import {
  SITE_CURRENCY,
  resolveProductCategories,
  resolveProductImageUrl,
  resolveProductUrl,
  splitFullName,
} from './shared'

const mapOrderItem = (item: Order['items'][number]): KlaviyoProductInput => {
  const product = item.product
  const isPopulated = typeof product === 'object' && product !== null
  const productId = isPopulated ? String((product as Product).id) : String(product)

  const base: KlaviyoProductInput = {
    productId,
    title: item.productTitle,
    url: '',
    price: item.unitPrice,
    currency: SITE_CURRENCY,
    quantity: item.quantity,
  }

  if (isPopulated) {
    const full = product as Product
    base.url = resolveProductUrl(full)
    base.imageUrl = resolveProductImageUrl(full)
    base.categories = resolveProductCategories(full)
  }

  return base
}

export const mapOrderToKlaviyo = (order: Order): KlaviyoOrderInput => {
  const { firstName, lastName } = splitFullName(order.customerName)

  const customer: KlaviyoProfileInput = {
    // Normalise the identifier so the same customer isn't split across profiles
    // by casing/whitespace (consistent with the profile mapper).
    email: order.customerEmail?.trim().toLowerCase() || undefined,
    phoneNumber: order.customerPhone?.trim() || undefined,
    firstName,
    lastName,
  }

  return {
    orderId: order.orderNumber || String(order.id),
    customer,
    value: order.total,
    currency: SITE_CURRENCY,
    items: (order.items ?? []).map(mapOrderItem),
    paymentStatus: order.paymentStatus ?? 'unpaid',
    orderStatus: order.status ?? 'pending',
    deliveryMethod: order.deliveryMethod ?? undefined,
    shippingTotal: order.shippingPrice ?? undefined,
    createdAt: order.orderDate ?? order.createdAt,
  }
}
