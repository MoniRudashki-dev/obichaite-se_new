import { NextRequest, NextResponse } from 'next/server'
import { runCatalogSync, type CatalogSyncMode } from '@/Klaviyo/jobs/sync-catalog'

export const runtime = 'nodejs' // Node runtime for server work (mirrors daily-cron)

/**
 * Admin-triggered full Klaviyo catalog sync.
 *
 * Guarded by `?token=` compared to KLAVIYO_CATALOG_SYNC_SECRET (falls back to
 * CRON_SECRET to reuse existing infra). Optional `?mode=create|update`.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const secret = process.env.KLAVIYO_CATALOG_SYNC_SECRET || process.env.CRON_SECRET

  if (!secret || token !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const modeParam = req.nextUrl.searchParams.get('mode')
  const mode: CatalogSyncMode = modeParam === 'update' ? 'update' : 'create'

  try {
    const summary = await runCatalogSync(mode)
    // Mirror the CLI: a partial/total batch failure is not a success.
    const status = summary.failedBatches > 0 ? 500 : 200
    return NextResponse.json({ ok: summary.failedBatches === 0, mode, summary }, { status })
  } catch (error) {
    console.error('[klaviyo-sync-catalog] failed:', error)
    return NextResponse.json({ ok: false, error: 'Sync failed' }, { status: 500 })
  }
}
