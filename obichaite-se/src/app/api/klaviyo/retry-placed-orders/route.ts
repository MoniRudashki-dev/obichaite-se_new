import { NextRequest, NextResponse } from 'next/server'
import { retryPendingPlacedOrders } from '@/Klaviyo/jobs/retry-placed-orders'

export const runtime = 'nodejs' // Node runtime for server work (mirrors daily-cron)

/**
 * Durable retry sweep for the Klaviyo Placed Order event. Intended to be pinged
 * on a schedule (e.g. by the existing cron pinger). Guarded by `?token=`
 * compared to KLAVIYO_CATALOG_SYNC_SECRET (falls back to CRON_SECRET).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const secret = process.env.KLAVIYO_CATALOG_SYNC_SECRET || process.env.CRON_SECRET

  if (!secret || token !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await retryPendingPlacedOrders()
    const status = summary.failed > 0 ? 500 : 200
    return NextResponse.json({ ok: summary.failed === 0, summary }, { status })
  } catch (error) {
    console.error('[klaviyo-retry-placed-orders] failed:', error)
    return NextResponse.json({ ok: false, error: 'Retry failed' }, { status: 500 })
  }
}
