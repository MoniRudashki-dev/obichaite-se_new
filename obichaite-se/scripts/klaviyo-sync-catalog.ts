/**
 * CLI entry for a full Klaviyo catalog sync.
 *
 * Usage:
 *   pnpm klaviyo:sync-catalog            # create mode
 *   pnpm klaviyo:sync-catalog -- update  # bulk update existing items
 */

import { runCatalogSync, type CatalogSyncMode } from '@/Klaviyo/jobs/sync-catalog'

const modeArg = process.argv.find((arg) => arg === 'create' || arg === 'update')
const mode: CatalogSyncMode = modeArg === 'update' ? 'update' : 'create'

const summary = await runCatalogSync(mode)

// eslint-disable-next-line no-console
console.log('[klaviyo:sync-catalog]', { mode, ...summary })

process.exit(summary.failedBatches > 0 ? 1 : 0)
