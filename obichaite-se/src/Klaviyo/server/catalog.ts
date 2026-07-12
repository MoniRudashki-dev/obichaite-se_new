/**
 * Catalog service — creates/updates Klaviyo catalog items.
 *
 * Full sync uses the async bulk jobs (<=100 items each). Incremental updates
 * (single product change) use the single-item endpoints with update-first /
 * create-on-404 so a product edit is idempotent. Never throws.
 */

import {
  KLAVIYO_CATALOG,
  KLAVIYO_CATALOG_BATCH_SIZE,
  buildCatalogItemId,
} from '../constants'
import { isKlaviyoServerEnabled } from '../config'
import type { KlaviyoCatalogItemInput, KlaviyoResult } from '../types'
import { KlaviyoApiError, klaviyoFetch } from './klaviyo-api'
import { klaviyoLogger } from './logger'
import { compact } from './serializers'

/** Builds catalog-item attributes. On update the immutable id fields are omitted. */
const buildItemAttributes = (
  item: KlaviyoCatalogItemInput,
  forUpdate: boolean,
): Record<string, unknown> =>
  compact({
    ...(forUpdate
      ? {}
      : {
          external_id: item.externalId,
          catalog_type: KLAVIYO_CATALOG.CATALOG_TYPE,
          integration_type: KLAVIYO_CATALOG.INTEGRATION_TYPE,
        }),
    title: item.title,
    description: item.description ?? '',
    url: item.url,
    image_full_url: item.imageFullUrl,
    price: item.price,
    published: item.published,
    custom_metadata: item.customMetadata,
  })

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

type BulkKind = 'create' | 'update'

async function submitBulkJob(kind: BulkKind, items: KlaviyoCatalogItemInput[]): Promise<void> {
  const path =
    kind === 'create'
      ? '/api/catalog-item-bulk-create-jobs'
      : '/api/catalog-item-bulk-update-jobs'

  await klaviyoFetch(path, {
    method: 'POST',
    body: {
      data: {
        type: `catalog-item-bulk-${kind}-job`,
        attributes: {
          // Klaviyo wraps the items array in a `data` object (JSON:API resource list).
          items: {
            data: items.map((item) => ({
              type: 'catalog-item',
              ...(kind === 'update' ? { id: buildCatalogItemId(item.externalId) } : {}),
              attributes: buildItemAttributes(item, kind === 'update'),
            })),
          },
        },
      },
    },
  })
}

export type BulkSyncResult = { submitted: number; failedBatches: number }

/**
 * Submits catalog items in batches. Used by the full-sync job. Each batch failure
 * is logged and counted but does not abort the whole run.
 */
export async function bulkSyncCatalogItems(
  kind: BulkKind,
  items: KlaviyoCatalogItemInput[],
): Promise<KlaviyoResult<BulkSyncResult>> {
  if (!isKlaviyoServerEnabled()) return { ok: false, skipped: true }
  if (items.length === 0) return { ok: true, data: { submitted: 0, failedBatches: 0 } }

  let submitted = 0
  let failedBatches = 0

  for (const batch of chunk(items, KLAVIYO_CATALOG_BATCH_SIZE)) {
    try {
      await submitBulkJob(kind, batch)
      submitted += batch.length
    } catch (err) {
      failedBatches += 1
      const status = err instanceof KlaviyoApiError ? err.status : undefined
      klaviyoLogger.error('Catalog batch failed', { kind, size: batch.length, status })
    }
  }

  return { ok: true, data: { submitted, failedBatches } }
}

/**
 * Upserts a single catalog item (incremental sync). Tries update first, and
 * creates the item if it does not exist yet (404).
 */
export async function upsertCatalogItem(
  item: KlaviyoCatalogItemInput,
): Promise<KlaviyoResult> {
  if (!isKlaviyoServerEnabled()) return { ok: false, skipped: true }

  const itemId = buildCatalogItemId(item.externalId)

  try {
    await klaviyoFetch(`/api/catalog-items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      body: {
        data: { type: 'catalog-item', id: itemId, attributes: buildItemAttributes(item, true) },
      },
    })
    return { ok: true, data: null }
  } catch (err) {
    const status = err instanceof KlaviyoApiError ? err.status : undefined
    if (status !== 404) {
      klaviyoLogger.error('Catalog item update failed', { externalId: item.externalId, status })
      return { ok: false, error: (err as Error).message, status }
    }
  }

  // Not found -> create it.
  try {
    await klaviyoFetch('/api/catalog-items', {
      method: 'POST',
      body: {
        data: { type: 'catalog-item', attributes: buildItemAttributes(item, false) },
      },
    })
    return { ok: true, data: null }
  } catch (err) {
    const status = err instanceof KlaviyoApiError ? err.status : undefined
    klaviyoLogger.error('Catalog item create failed', { externalId: item.externalId, status })
    return { ok: false, error: (err as Error).message, status }
  }
}
