/**
 * Catalog mapper: Payload `Product` -> `KlaviyoCatalogItemInput`.
 *
 * `externalId` is the string product id (matches event `ProductID`). Stock is
 * not a native catalog concept, so availability is exposed via custom_metadata.
 */

import type { Product } from '@/payload-types'
import { getKlaviyoEnvironment } from '../config'
import type { KlaviyoCatalogItemInput } from '../types'
import {
  isProductAvailable,
  resolveProductCategories,
  resolveProductImageUrl,
  resolveProductPrice,
  resolveProductUrl,
} from './shared'

export const mapProductToCatalogItem = (product: Product): KlaviyoCatalogItemInput => ({
  externalId: String(product.id),
  title: product.title,
  description: product.shortDescription || undefined,
  url: resolveProductUrl(product),
  imageFullUrl: resolveProductImageUrl(product),
  price: resolveProductPrice(product),
  published: product._status === 'published',
  customMetadata: {
    slug: product.slug ?? undefined,
    sku: product.sku ?? undefined,
    categories: resolveProductCategories(product),
    isAvailable: isProductAvailable(product),
    quantity: product.quantity ?? 0,
    environment: getKlaviyoEnvironment(),
  },
})
