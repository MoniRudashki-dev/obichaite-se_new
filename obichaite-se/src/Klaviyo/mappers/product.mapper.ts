/**
 * Product mapper: Payload `Product` -> `KlaviyoProductInput`.
 *
 * Used by Viewed Product / Added to Cart events. `productId` is always the
 * string form of the numeric Payload id so it matches the catalog `external_id`.
 */

import type { Product } from '@/payload-types'
import { getKlaviyoEnvironment } from '../config'
import type { KlaviyoProductInput } from '../types'
import {
  SITE_CURRENCY,
  isProductAvailable,
  resolveProductCategories,
  resolveProductImageUrl,
  resolveProductPrice,
  resolveProductUrl,
} from './shared'

export const mapProductToKlaviyo = (
  product: Product,
  quantity?: number,
): KlaviyoProductInput => ({
  productId: String(product.id),
  title: product.title,
  url: resolveProductUrl(product),
  imageUrl: resolveProductImageUrl(product),
  price: resolveProductPrice(product),
  currency: SITE_CURRENCY,
  quantity,
  categories: resolveProductCategories(product),
  isAvailable: isProductAvailable(product),
  metadata: {
    slug: product.slug ?? undefined,
    sku: product.sku ?? undefined,
    source: 'website',
    environment: getKlaviyoEnvironment(),
  },
})
