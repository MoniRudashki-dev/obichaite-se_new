import type { CollectionAfterChangeHook } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Product } from '@/payload-types'
import { isKlaviyoServerEnabled } from '@/Klaviyo/config'
import { mapProductToCatalogItem } from '@/Klaviyo/mappers/catalog.mapper'
import { isInquiryOnlyProduct } from '@/Klaviyo/mappers/shared'
import { upsertCatalogItem } from '@/Klaviyo/server/catalog'
import { klaviyoLogger } from '@/Klaviyo/server/logger'

/**
 * Incrementally upserts a single product into the Klaviyo catalog when it is
 * published.
 *
 * Guards:
 * - Published only. Products use drafts + autosave, so acting on drafts would
 *   spam Klaviyo on every autosave; unpublish/availability is reconciled by the
 *   full sync (`pnpm klaviyo:sync-catalog`).
 * - Skips inquiry-only products with no price.
 * - Fire-and-forget + error-safe: never blocks or fails the product save.
 */
export const syncKlaviyoCatalogItem: CollectionAfterChangeHook<Product> = ({ doc }) => {
  if (!isKlaviyoServerEnabled()) return doc
  if (doc._status !== 'published') return doc
  if (isInquiryOnlyProduct(doc)) return doc

  void (async () => {
    try {
      // Re-read (post-commit) with depth so mediaArray.file / category /
      // subCategory are populated — the afterChange doc isn't guaranteed to be.
      const payload = await getPayload({ config: configPromise })
      const fresh = (await payload
        .findByID({ collection: 'product', id: doc.id, depth: 2, overrideAccess: true })
        .catch(() => null)) as Product | null
      await upsertCatalogItem(mapProductToCatalogItem(fresh ?? doc))
    } catch (error) {
      klaviyoLogger.error('Catalog incremental sync failed', {
        productId: doc.id,
        message: (error as Error).message,
      })
    }
  })()

  return doc
}
