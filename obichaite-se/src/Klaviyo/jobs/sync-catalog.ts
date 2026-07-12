/**
 * Full catalog sync job.
 *
 * Reads all published products from Payload/Neon, maps them to Klaviyo catalog
 * items and submits them in batches (<=100). Inquiry-only products without a
 * price are skipped. Never throws — returns a summary and logs batch failures.
 *
 * Mode:
 * - `create` (default): first import of items.
 * - `update`: bulk refresh of already-existing items.
 * Ongoing per-product changes are handled automatically by the incremental
 * Product afterChange hook (see collections/Product/hooks/syncKlaviyoCatalogItem).
 */

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Product } from '@/payload-types'
import { isKlaviyoServerEnabled } from '../config'
import { mapProductToCatalogItem } from '../mappers/catalog.mapper'
import { isInquiryOnlyProduct } from '../mappers/shared'
import { bulkSyncCatalogItems } from '../server/catalog'
import { klaviyoLogger } from '../server/logger'

export type CatalogSyncMode = 'create' | 'update'

export type CatalogSyncSummary = {
  enabled: boolean
  total: number
  eligible: number
  skipped: number
  submitted: number
  failedBatches: number
}

export async function runCatalogSync(
  mode: CatalogSyncMode = 'create',
): Promise<CatalogSyncSummary> {
  if (!isKlaviyoServerEnabled()) {
    return { enabled: false, total: 0, eligible: 0, skipped: 0, submitted: 0, failedBatches: 0 }
  }

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'product',
    where: { _status: { equals: 'published' } },
    pagination: false,
    depth: 2,
    overrideAccess: true,
  })

  const products = result.docs as Product[]
  const eligibleProducts = products.filter((product) => !isInquiryOnlyProduct(product))
  const skipped = products.length - eligibleProducts.length

  const items = eligibleProducts.map(mapProductToCatalogItem)

  const sync = await bulkSyncCatalogItems(mode, items)
  const submitted = sync.ok ? sync.data.submitted : 0
  const failedBatches = sync.ok ? sync.data.failedBatches : 0

  const summary: CatalogSyncSummary = {
    enabled: true,
    total: products.length,
    eligible: eligibleProducts.length,
    skipped,
    submitted,
    failedBatches,
  }

  klaviyoLogger.info('Catalog sync finished', { mode, ...summary })
  return summary
}
