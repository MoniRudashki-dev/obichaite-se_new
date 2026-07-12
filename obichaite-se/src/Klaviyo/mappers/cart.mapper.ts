/**
 * Cart mapper: Redux cart items (`ExtendedProduct[]`) -> `KlaviyoCartInput`.
 *
 * Runs client-side for Added to Cart / Started Checkout. Cart value is derived
 * from the same EUR price logic used everywhere else so it matches the UI.
 */

import type { ExtendedProduct } from '@/store/features/checkout'
import { SITE_CURRENCY } from './shared'
import { mapProductToKlaviyo } from './product.mapper'
import type { KlaviyoCartInput, KlaviyoProductInput } from '../types'

const round2 = (value: number): number => Math.round(value * 100) / 100

export const mapCartToKlaviyo = (
  items: ExtendedProduct[],
  options?: { checkoutUrl?: string },
): KlaviyoCartInput => {
  const mappedItems: KlaviyoProductInput[] = items.map((item) => {
    const quantity = item.orderQuantity > 0 ? item.orderQuantity : 1
    return mapProductToKlaviyo(item, quantity)
  })

  const value = round2(
    mappedItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
  )

  return {
    value,
    currency: SITE_CURRENCY,
    items: mappedItems,
    checkoutUrl: options?.checkoutUrl,
  }
}
