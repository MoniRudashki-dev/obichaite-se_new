# Klaviyo Plugin Implementation Plan — Next.js 15 + Payload CMS + Neon

**Audience:** Claude / Codex coding agents working inside VS Code under developer supervision  
**Goal:** Implement the agreed Klaviyo MVP as a production-ready, plugin-style integration.  
**Primary rule:** Keep Klaviyo-specific logic isolated in a dedicated `Klaviyo` module/folder as much as possible. Only wire minimal hooks/calls into the existing product, cart, checkout, order, user, and newsletter flows.

---

## 0. Implementation Philosophy

This integration must behave like an internal plugin, not scattered one-off API calls.

Core principles:

1. **Isolation:** Klaviyo logic belongs in one module.
2. **Typed contracts:** Use shared TypeScript types for all payloads.
3. **Server-first for critical events:** Revenue/order events must be sent from the backend.
4. **Client only for onsite behavior:** Browser tracking is acceptable for page/cart behavior.
5. **No hardcoded secrets:** Use environment variables only.
6. **Graceful failure:** Klaviyo failures must not break checkout or order placement.
7. **Idempotency:** Avoid duplicate events, especially `Placed Order`.
8. **Observability:** Log enough for debugging without leaking PII/secrets.
9. **Feature flag:** Integration can be disabled via env.
10. **Production safety:** Staging/test events must be distinguishable from production events.

---

## 1. MVP Features

Implement these features:

1. Customer profile sync
2. Viewed Product
3. Added to Cart
4. Started Checkout
5. Placed Order
6. Product catalog sync
7. Event/data support for basic automated emails

Flows themselves may be configured manually in Klaviyo, but the code must send all required triggers and data.

---

## 2. Proposed File Structure

Preferred folder:

```text
src/integrations/Klaviyo/
  index.ts
  config.ts
  constants.ts
  types.ts
  client/
    KlaviyoScript.tsx
    klaviyo-browser.ts
    useKlaviyoIdentify.ts
    useViewedProductTracking.ts
  server/
    klaviyo-api.ts
    profiles.ts
    events.ts
    catalog.ts
    consent.ts
    logger.ts
    retry.ts
    idempotency.ts
  mappers/
    profile.mapper.ts
    product.mapper.ts
    cart.mapper.ts
    checkout.mapper.ts
    order.mapper.ts
    catalog.mapper.ts
  services/
    profile.service.ts
    event.service.ts
    catalog-sync.service.ts
    newsletter.service.ts
  jobs/
    sync-catalog.job.ts
    backfill-profiles.job.ts
  tests/
    mappers.test.ts
    events.test.ts
    catalog.test.ts
  README.md
```

Acceptable alternatives:

- `src/plugins/Klaviyo/`
- `src/lib/Klaviyo/`
- `src/modules/Klaviyo/`

Use whichever structure best matches the existing project conventions.

Only wire into existing app code from:

```text
app/layout.tsx
product page/component
cart action/store
checkout start handler
payment success/order creation handler
newsletter signup handler
Payload hooks or admin actions for product sync
cron/job route if available
```

Do not spread raw Klaviyo API calls across the app.

---

## 3. Environment Variables

Add validation for these env vars:

```env
NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY=
KLAVIYO_PRIVATE_API_KEY=
KLAVIYO_NEWSLETTER_LIST_ID=
KLAVIYO_API_REVISION=2026-04-15
KLAVIYO_ENABLED=true
KLAVIYO_DEBUG=false
KLAVIYO_ENVIRONMENT=production
```

Optional:

```env
KLAVIYO_EVENT_PREFIX=
KLAVIYO_CATALOG_SYNC_SECRET=
KLAVIYO_CATALOG_SYNC_BATCH_SIZE=100
KLAVIYO_API_BASE_URL=https://a.klaviyo.com
```

Rules:

- `NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY` can be used in browser code.
- `KLAVIYO_PRIVATE_API_KEY` must never be imported into client components.
- `KLAVIYO_ENABLED=false` must disable all outbound Klaviyo calls.
- `KLAVIYO_ENVIRONMENT` should be included in custom properties for QA/debugging.

---

## 4. API Usage Rules

### 4.1 Client-side

Use Klaviyo client-side APIs only for browser-safe behavior:

- Load Klaviyo script
- Identify known users in browser
- Viewed Product
- Added to Cart if product/cart state exists in browser

Never use private API keys client-side.

### 4.2 Server-side

Use server-side API for:

- Profile create/update
- Subscription/consent where backend-controlled
- Started Checkout if checkout is persisted server-side
- Placed Order
- Catalog sync
- QA validation queries, if needed

Server-side event endpoint:

```text
POST https://a.klaviyo.com/api/events
```

Client-side event endpoint, if not using `klaviyo.js` object:

```text
POST https://a.klaviyo.com/client/events
```

Profile import endpoint:

```text
POST https://a.klaviyo.com/api/profile-import
```

Catalog bulk endpoints:

```text
POST https://a.klaviyo.com/api/catalog-item-bulk-create-jobs
POST https://a.klaviyo.com/api/catalog-item-bulk-update-jobs
POST https://a.klaviyo.com/api/catalog-item-bulk-delete-jobs
```

Use the current configured revision header from env:

```http
revision: 2026-04-15
Authorization: Klaviyo-API-Key <private-key>
Content-Type: application/json
Accept: application/json
```

---

## 5. Event Naming

Use standard Klaviyo ecommerce metric names where possible:

```text
Viewed Product
Added to Cart
Started Checkout
Placed Order
```

Do not invent names like:

```text
Product Viewed
Cart Added
Checkout Started
Order Created
```

Reason:

- Standard names are easier for Klaviyo flows, analytics, and ecommerce patterns.
- Klaviyo custom integration guidance references these ecommerce events.

Optional internal/debug events:

```text
Signed Up for Newsletter
Created Customer Profile
```

Only add debug events if needed; avoid noisy metrics.

---

## 6. Data Model Contracts

Create strict TypeScript types.

### 6.1 KlaviyoProfileInput

```ts
type KlaviyoProfileInput = {
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  properties?: Record<string, unknown>;
};
```

At least one identifier is required:

- email
- phone number
- Klaviyo profile ID
- external ID, only if already reliable in the account design

For this project, prefer email when available.

### 6.2 KlaviyoProductInput

```ts
type KlaviyoProductInput = {
  productId: string;
  variantId?: string;
  title: string;
  url: string;
  imageUrl?: string;
  price: number;
  currency: string;
  categories?: string[];
  productType?: 'article' | 'experience' | 'event_service' | 'poster' | 'other';
  isAvailable?: boolean;
  metadata?: Record<string, unknown>;
};
```

### 6.3 KlaviyoCartInput

```ts
type KlaviyoCartInput = {
  cartId?: string;
  checkoutUrl?: string;
  value: number;
  currency: string;
  items: KlaviyoProductInput[];
};
```

### 6.4 KlaviyoOrderInput

```ts
type KlaviyoOrderInput = {
  orderId: string;
  customer: KlaviyoProfileInput;
  value: number;
  currency: string;
  items: KlaviyoProductInput[];
  paymentStatus: string;
  orderStatus: string;
  deliveryMethod?: 'box_now' | 'manual_courier' | 'other';
  shippingTotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  createdAt: string;
};
```

---

## 7. Mapper Requirements

All app-specific data must be converted through mappers.

Do not build Klaviyo payloads directly in React components, checkout handlers, or Payload hooks.

Required mappers:

```text
profile.mapper.ts
product.mapper.ts
cart.mapper.ts
checkout.mapper.ts
order.mapper.ts
catalog.mapper.ts
```

Each mapper should:

- Accept internal app/Payload/DB objects
- Return Klaviyo plugin types
- Normalize currency
- Normalize image URLs to absolute URLs
- Normalize product URLs to absolute URLs
- Remove undefined/null where inappropriate
- Keep PII minimal
- Include `source: 'website'`
- Include `environment: KLAVIYO_ENVIRONMENT`

---

## 8. Client Integration

### 8.1 Klaviyo Script

Create:

```text
src/integrations/Klaviyo/client/KlaviyoScript.tsx
```

Responsibilities:

- Load Klaviyo script only when enabled
- Use `NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY`
- Avoid duplicate script insertion
- Work with Next.js App Router
- Use `next/script` if project convention allows

Wire into:

```text
app/layout.tsx
```

Only add one small import/component to layout.

### 8.2 Identify Known User

Create:

```text
useKlaviyoIdentify.ts
```

Use when:

- User is logged in
- User enters email in checkout
- User subscribes to newsletter

Rules:

- Do not identify anonymous users without email/phone.
- Do not include excessive PII.
- Do not run repeatedly on every render.

### 8.3 Viewed Product

Trigger:

```text
Product detail page view
```

Implementation:

- Use a small client component or hook on product detail pages.
- Send once per page load/product ID.
- Include product ID, name, price, image, URL, category.

Important Klaviyo compatibility:

- Include top-level `ProductID` matching the catalog item ID.
- Include `URL`, `ImageURL`, `ProductName`, `Price`, `Categories` where available.

Pseudo payload properties:

```ts
{
  ProductID: product.productId,
  ProductName: product.title,
  URL: product.url,
  ImageURL: product.imageUrl,
  Price: product.price,
  Currency: product.currency,
  Categories: product.categories,
  ProductType: product.productType,
  Environment: env.KLAVIYO_ENVIRONMENT,
}
```

### 8.4 Added to Cart

Trigger:

```text
Successful add-to-cart action
```

Implementation options:

1. Client-side event immediately after cart mutation succeeds.
2. Server-side event if add-to-cart is persisted through a server action/API route.

Preferred:

- If the cart action is server-backed, send server-side for reliability.
- If cart is primarily client state, send browser event after confirmed cart update.

Payload should include:

- Product item
- Cart value
- Cart items
- Checkout/cart URL if available

Avoid duplicate event firing on:

- Quantity update, unless intentional
- Page refresh
- Cart hydration

---

## 9. Server Integration

### 9.1 HTTP Client

Create:

```text
src/integrations/Klaviyo/server/klaviyo-api.ts
```

Responsibilities:

- Base URL handling
- Headers
- Revision header
- JSON serialization
- Timeout handling
- Error parsing
- Safe logging
- Retry only when safe

Do not expose raw responses to frontend.

Recommended behavior:

- Throw typed internal errors for service layer.
- In checkout/order flows, catch and log Klaviyo errors without failing the business action.

### 9.2 Profile Service

Create:

```text
src/integrations/Klaviyo/services/profile.service.ts
```

Responsibilities:

- Create/update profile
- Attach useful profile properties
- Avoid clearing fields accidentally
- Never send `null` unless intentionally clearing a field

Profile sources:

- Registration
- Newsletter signup
- Checkout email step
- Successful order

Suggested properties:

```text
website_customer_id
customer_type
last_seen_at
last_checkout_started_at
last_order_id
last_order_at
last_delivery_method
marketing_consent_source
marketing_consent_at
```

### 9.3 Newsletter Service

Create:

```text
src/integrations/Klaviyo/services/newsletter.service.ts
```

Responsibilities:

- Subscribe profile to newsletter list when explicit consent exists
- Use configured `KLAVIYO_NEWSLETTER_LIST_ID`
- Respect double opt-in/client settings
- Do not subscribe users from checkout unless checkbox is checked

### 9.4 Event Service

Create:

```text
src/integrations/Klaviyo/services/event.service.ts
```

Responsibilities:

- Send `Viewed Product`, if server-side path is used
- Send `Added to Cart`, if server-side path is used
- Send `Started Checkout`
- Send `Placed Order`
- Handle idempotency keys/properties
- Normalize payloads through mappers

### 9.5 Started Checkout

Trigger when checkout is meaningfully started.

Recommended trigger point:

- Checkout session created, or
- Customer enters email and cart is known, or
- First persisted checkout step is completed

Do not trigger just because `/checkout` page is viewed if no contact/cart data exists.

Payload must include:

- Customer email/phone if available
- Cart items
- Cart value
- Currency
- Checkout URL if checkout can be restored
- Delivery method if already selected

Flow purpose:

- Abandoned Checkout automation

### 9.6 Placed Order

Trigger only after the order is successful according to the agreed business rule.

Recommended for this project:

```text
Send Placed Order after successful card payment OR after confirmed successful order status if non-card/manual path exists.
```

Confirm with real checkout/payment implementation.

Hard requirements:

- Must be server-side.
- Must not block checkout success page if Klaviyo fails.
- Must be idempotent per `orderId`.
- Must not fire for failed/cancelled payments.
- Must include value/currency/items.

Recommended idempotency strategy:

1. Add DB field to order if allowed:

```text
klaviyoPlacedOrderSentAt
klaviyoPlacedOrderEventId / klaviyoSyncStatus
```

2. Before sending, check whether already sent.
3. After success, mark as sent.
4. If failure, log and allow retry job/manual retry.

If DB schema cannot be changed:

- Use existing job/log table if available.
- At minimum include deterministic `unique_id`/event property based on order ID and guard in app logic.

---

## 10. Product Catalog Sync

### 10.1 Source of Truth

Use Payload/Neon product data as source of truth.

The sync must support:

- Create new products in Klaviyo
- Update existing products
- Mark unavailable/out of stock products
- Optionally delete archived products only if client approves

### 10.2 Catalog ID Format

Klaviyo custom catalog items generally use custom/default catalog identifiers.

Use stable IDs consistently.

Recommended ID pattern:

```text
$custom:::$default:::<productId>
```

For variants, use a stable variant ID tied to product ID.

If products do not have variants, create catalog items only.

If products have variants, create items + variants.

### 10.3 Sync Strategy

For MVP, implement both:

1. **Manual/route-triggered full sync**
2. **Incremental sync hooks** if project architecture allows

Minimum production-ready implementation:

- Admin-only route or script for full catalog sync
- Product create/update hook to sync changed product
- Logging for failed syncs
- Batch size max 100 items per request

Possible trigger route:

```text
POST /api/integrations/klaviyo/sync-catalog
Header: x-klaviyo-sync-secret: <secret>
```

Only if this matches project security conventions.

Alternative:

```text
pnpm klaviyo:sync-catalog
```

Use whichever is more appropriate for the project.

### 10.4 Required Catalog Data

Map each product to:

```ts
{
  external_id: productId,
  title: productName,
  description: shortDescription,
  url: absoluteProductUrl,
  image_full_url: absoluteImageUrl,
  price: price,
  catalog_type: '$default',
  integration_type: '$custom',
  custom_metadata: {
    category,
    productType,
    isAvailable,
    slug,
    environment,
  }
}
```

Adapt exact property names to Klaviyo current API schema.

### 10.5 Catalog QA

After sync:

- Validate product count
- Validate random product sample
- Validate URLs
- Validate images
- Validate price/currency
- Validate availability
- Validate Viewed Product `ProductID` matches catalog item ID

---

## 11. Flow Support Data

The code does not need to create flows, but it must provide enough data for flows to work.

### Welcome Flow

Needed:

- Newsletter list subscription
- Consent timestamp/source
- Email profile

### Abandoned Cart

Needed:

- Added to Cart event
- Product/cart data
- Profile email if known
- Filterable `Placed Order` event after purchase

### Abandoned Checkout

Needed:

- Started Checkout event
- Cart/checkout data
- Profile email
- Checkout recovery URL if available
- Filterable `Placed Order` event after purchase

### Post-Purchase

Needed:

- Placed Order event
- Order value
- Product data
- Delivery method
- Payment/order status

---

## 12. Integration Wiring Points

Find real project locations and wire minimally.

### 12.1 App Layout

Add:

```tsx
<KlaviyoScript />
```

Only in root layout or equivalent.

### 12.2 Product Detail Page

Add client tracking component:

```tsx
<KlaviyoViewedProduct product={mappedProduct} />
```

or hook inside existing product detail client component.

### 12.3 Cart Add Action

After successful add-to-cart:

```ts
await klaviyo.trackAddedToCart(...)
```

or client-side equivalent.

### 12.4 Checkout Start

At checkout session creation / first persisted checkout step:

```ts
await klaviyo.trackStartedCheckout(...)
```

### 12.5 Order Success / Payment Webhook

At successful payment/order confirmation:

```ts
await klaviyo.trackPlacedOrder(...)
```

Important:

- If payment provider uses webhooks, the webhook is usually more reliable than success-page tracking.
- Success page alone is not enough for production reliability.

### 12.6 Newsletter Signup

After successful newsletter form submit:

```ts
await klaviyo.subscribeToNewsletter(...)
```

---

## 13. Error Handling

Klaviyo must never break core commerce flows.

Rules:

- Product view tracking failure: ignore + debug log
- Add to cart tracking failure: ignore + warning log
- Started checkout failure: ignore + warning log
- Placed order failure: log error + mark retry needed if retry mechanism exists
- Catalog sync failure: fail the sync job, not the website
- Newsletter subscription failure: return user-friendly error only if newsletter signup itself is the primary action

Do not expose raw Klaviyo error bodies to end users.

---

## 14. Retry Strategy

Implement conservative retry only for server-side calls.

Retry on:

- Network timeout
- 429 rate limit
- 5xx responses

Do not retry blindly on:

- 400 validation errors
- 401/403 auth errors
- Missing required profile identifiers

Suggested:

- 2 retries max
- Exponential backoff
- Respect `Retry-After` if provided

For `Placed Order`, retry must remain idempotent.

---

## 15. Logging

Create:

```text
server/logger.ts
```

Log fields:

```text
event_name
order_id
cart_id
product_id
profile_email_hash or redacted email
status
klaviyo_status_code
error_code
```

Do not log:

- Private API key
- Full request authorization header
- Full phone numbers
- Full sensitive customer data
- Full payment data

Recommended email logging:

```text
jo***@example.com
```

or hash.

---

## 16. Testing Plan

### 16.1 Unit Tests

Test all mappers:

- Product mapper
- Cart mapper
- Checkout mapper
- Order mapper
- Profile mapper
- Catalog mapper

Test cases:

- Missing optional image
- Missing category
- Product with variant
- Product without variant
- Free/zero price item if allowed
- BGN/EUR currency
- Box Now delivery
- Manual courier delivery
- User with email only
- User with phone only
- Guest checkout

### 16.2 Integration Tests / Manual QA

Run controlled flows:

1. Visit product page as anonymous user
2. Identify by newsletter signup
3. Visit product page as known user
4. Add product to cart
5. Start checkout
6. Abandon checkout
7. Complete order
8. Confirm `Placed Order` exists
9. Confirm abandoned flows would be filtered by `Placed Order`
10. Sync product catalog and validate in Klaviyo

### 16.3 Klaviyo Dashboard QA

Validate in:

```text
Klaviyo → Profiles
Klaviyo → Analytics → Metrics
Klaviyo → Catalog / Products
Klaviyo → Flows
```

For each test profile, inspect timeline.

Expected timeline example:

```text
Viewed Product
Added to Cart
Started Checkout
Placed Order
```

---

## 17. Production Readiness Checklist

Code:

- [ ] Klaviyo module isolated
- [ ] Env validation implemented
- [ ] Private key server-only
- [ ] Public key client-only
- [ ] Feature flag implemented
- [ ] Typed mappers implemented
- [ ] Customer profile sync implemented
- [ ] Viewed Product implemented
- [ ] Added to Cart implemented
- [ ] Started Checkout implemented
- [ ] Placed Order implemented server-side
- [ ] Product catalog sync implemented
- [ ] Newsletter list subscription implemented if part of current website flow
- [ ] Idempotency guard for Placed Order
- [ ] Safe logging
- [ ] Error handling does not break checkout
- [ ] Retry for safe server-side failures
- [ ] Tests for mappers/services

Klaviyo account:

- [ ] Public API key/Site ID configured
- [ ] Private API key configured
- [ ] Newsletter list ID configured
- [ ] Sending domain verified
- [ ] Flows configured and reviewed
- [ ] Catalog visible and correct
- [ ] Metrics visible and correct

Deployment:

- [ ] Production env vars set
- [ ] Staging env vars set
- [ ] Test data marked with environment
- [ ] Logs monitored after release
- [ ] First production order checked manually

---

## 18. Suggested Task Breakdown for Agents

### Task 1 — Create Klaviyo module skeleton

Create folder structure, config, env validation, types, exports.

Acceptance criteria:

- No app behavior changes yet
- Module compiles
- Env validation works
- Private env is not imported client-side

### Task 2 — Implement server API client

Build reusable fetch wrapper for Klaviyo private API.

Acceptance criteria:

- Adds Authorization and revision headers
- Handles JSON errors
- Supports enabled/disabled mode
- Supports safe logging

### Task 3 — Implement mappers

Build profile/product/cart/checkout/order/catalog mappers.

Acceptance criteria:

- Unit tests pass
- Absolute URLs generated
- Currency normalized
- ProductID consistency enforced

### Task 4 — Implement profile + newsletter services

Build profile import/update and newsletter subscription.

Acceptance criteria:

- Explicit consent supported
- Newsletter list ID used
- Missing email handled safely

### Task 5 — Implement client script + Viewed Product

Add frontend script and product view tracking.

Acceptance criteria:

- Script loads once
- Event fires once per product page view
- No server secret in client bundle

### Task 6 — Implement Added to Cart

Wire into real add-to-cart flow.

Acceptance criteria:

- Event fires only after successful cart update
- Product/cart data is present
- No duplicate event on hydration/refresh

### Task 7 — Implement Started Checkout

Wire into real checkout start point.

Acceptance criteria:

- Event fires when checkout is meaningful
- Profile identifier exists when possible
- Cart value/items present

### Task 8 — Implement Placed Order

Wire into payment success/order success backend flow.

Acceptance criteria:

- Server-side only
- Fires only for successful orders
- Idempotent per order ID
- Failure does not break order flow

### Task 9 — Implement catalog sync

Create bulk sync service/job/route/script.

Acceptance criteria:

- Batch size max 100
- Products sync to Klaviyo
- Images/URLs/prices valid
- Failed syncs logged

### Task 10 — QA and production hardening

Run full matrix and fix gaps.

Acceptance criteria:

- Test profile timeline is correct
- Test catalog products correct
- No duplicate `Placed Order`
- Flows can be safely enabled

---

## 19. Important Warnings for Agents

Do not:

- Put private API key in client code
- Fire `Placed Order` from success page only
- Send order events before payment success unless business logic says order is final
- Subscribe users to marketing without explicit consent
- Hardcode product URLs or image domains
- Create many different metric names for the same action
- Let Klaviyo failures break checkout
- Delete catalog items unless explicitly approved
- Send full payment data to Klaviyo
- Scatter raw Klaviyo calls throughout the app

Do:

- Keep plugin boundaries clean
- Use mappers
- Use standard metric names
- Add environment/debug properties
- Validate in Klaviyo dashboard
- Keep code reversible and feature-flagged

---

## 20. Reference Links

Use the latest Klaviyo docs when implementing. These links are the starting point:

- Custom ecommerce integration guide: https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration
- JavaScript API: https://developers.klaviyo.com/en/docs/javascript_api
- Events API overview: https://developers.klaviyo.com/en/reference/events_api_overview
- Create Event: https://developers.klaviyo.com/en/reference/create_event
- Create Client Event: https://developers.klaviyo.com/en/reference/create_client_event
- Profiles API overview: https://developers.klaviyo.com/en/reference/profiles_api_overview
- Create or Update Profile: https://developers.klaviyo.com/en/reference/create_or_update_profile
- Lists API overview: https://developers.klaviyo.com/en/reference/lists_api_overview
- Catalogs API overview: https://developers.klaviyo.com/en/reference/catalogs_api_overview
- Bulk Create Catalog Items: https://developers.klaviyo.com/en/reference/bulk_create_catalog_items
- Bulk Update Catalog Items: https://developers.klaviyo.com/en/reference/bulk_update_catalog_items
