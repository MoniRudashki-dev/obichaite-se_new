/**
 * CLI entry for the durable Placed Order retry sweep.
 *
 * Usage: pnpm klaviyo:retry-placed-orders
 */

import { retryPendingPlacedOrders } from '@/Klaviyo/jobs/retry-placed-orders'

const summary = await retryPendingPlacedOrders()

// eslint-disable-next-line no-console
console.log('[klaviyo:retry-placed-orders]', summary)

process.exit(summary.failed > 0 ? 1 : 0)
