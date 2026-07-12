# Klaviyo Integration

Isolated, plugin-style Klaviyo integration for the storefront (Next.js 15 +
Payload 3 + Neon). Klaviyo-specific logic lives here; only minimal calls are
wired into product, cart, checkout, order and product-catalog flows.

## Layout

```
src/Klaviyo/
  config.ts        # env access + feature flags (server & client)
  constants.ts     # metric names, catalog id pattern, batch size, revision
  types.ts         # plugin contracts (profile/product/cart/order/catalog)
  server/          # private-API code (never imported by client components)
    klaviyo-api.ts # fetch wrapper: auth + revision headers, timeout, retries
    serializers.ts # JSON:API attribute builders
    profiles.ts    # profile upsert (POST /api/profile-import)
    events.ts      # metric events (POST /api/events)
    newsletter.ts  # list subscription with consent
    catalog.ts     # bulk + single catalog item upsert
    logger.ts      # redacting logger (masks email/phone)
  client/          # browser code
    KlaviyoScript.tsx    # onsite script loader (next/script)
    klaviyo-browser.ts   # klaviyo.js identify/track wrapper
    klaviyo-events.ts    # Viewed Product / Added to Cart / Started Checkout
  mappers/         # Payload objects -> plugin types
  actions/         # 'use server' actions callable from client (newsletter)
  jobs/            # full catalog sync core
  tests/           # mapper unit tests (vitest)
```

> Note: `server/` modules are server-only **by convention** (imported only from
> Payload hooks, route handlers, `'use server'` actions and CLI scripts). A
> `server-only` import is intentionally avoided because these modules are also
> loaded by the Payload CLI (`payload generate:types`, `payload run`), where that
> package cannot resolve. The private key is read via `config.ts` and, being a
> non-`NEXT_PUBLIC` env var, is stripped from any client bundle by Next.js.

## Environment

See `.env.example`. Key flags:

- `KLAVIYO_ENABLED` — server master switch (all outbound calls no-op when `false`).
- `NEXT_PUBLIC_KLAVIYO_ENABLED` + `NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY` — load the onsite script.
- `KLAVIYO_PRIVATE_API_KEY` — server only.
- `KLAVIYO_NEWSLETTER_LIST_ID`, `KLAVIYO_API_REVISION`, `KLAVIYO_ENVIRONMENT`,
  `KLAVIYO_CATALOG_SYNC_SECRET`, `KLAVIYO_DEBUG`.

## Events & wiring points

| Event | Where | Type |
|---|---|---|
| Onsite script | `app/(frontend)/layout.tsx` → `<KlaviyoScript />` | client |
| Viewed Product | `components/PageViewComponent` | client |
| Added to Cart | `components/Product/SingleCardMain`, `ProductCard` | client |
| Started Checkout | `components/Checkout/CheckoutForm` (valid email + cart) | client |
| Placed Order | `collections/Order/hooks/syncKlaviyoPlacedOrder` | server |
| Newsletter subscribe | `CheckoutForm` (consent checkbox) → `actions/newsletter` | server |
| Catalog (incremental) | `collections/Product/hooks/syncKlaviyoCatalogItem` | server |
| Catalog (full) | `app/api/klaviyo/sync-catalog` route / `pnpm klaviyo:sync-catalog` | server |

Placed Order fires for **every** created order (card / cash-on-delivery / bank
transfer); `paymentStatus` is sent as a property. It is idempotent via the
`klaviyoPlacedOrderSentAt` order field and the unique order number as `unique_id`.

### Placed Order durability

The order afterChange hook makes a fast, non-blocking *immediate* attempt. Durable
delivery is guaranteed by an **outbox retry sweep** (`jobs/retry-placed-orders`,
route `/api/klaviyo/retry-placed-orders`, `pnpm klaviyo:retry-placed-orders`): the
order row is the outbox — an empty `klaviyoPlacedOrderSentAt` means "still to
send". The sweep resends any such order created in the last 72h (and older than
2 min), covering dropped fire-and-forget calls, transient failures, or a disabled
integration at create time. Run it on a schedule (same cron pinger as `daily-cron`).
Klaviyo de-duplicates by `unique_id`, so the immediate attempt and the sweep are
safe to overlap.

## Catalog sync

```
pnpm klaviyo:sync-catalog            # create (first import)
pnpm klaviyo:sync-catalog -- update  # bulk refresh existing items
# or: GET /api/klaviyo/sync-catalog?token=<KLAVIYO_CATALOG_SYNC_SECRET>[&mode=update]
```

Batches of 100. Inquiry-only products without a price are skipped. Ongoing edits
to a published product are pushed automatically by the incremental hook.

## Failure behaviour

Klaviyo never breaks commerce flows: server calls return a typed result and log
errors (masked) instead of throwing; client calls are no-ops when disabled.
Retries apply only to transient failures (timeout / 429 / 5xx).

## Tests

`pnpm vitest run src/Klaviyo` — mapper unit tests.
