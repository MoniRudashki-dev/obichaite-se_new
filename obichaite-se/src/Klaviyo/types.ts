/**
 * Typed contracts for the Klaviyo integration.
 *
 * These are the *plugin* types — internal app/Payload objects are converted
 * into these via the mappers, never built inline in components/hooks. Keeping
 * them here means every layer (events, catalog, profiles) shares one shape.
 */

/** A profile identifier bundle. At least one identifier must be present. */
export type KlaviyoProfileInput = {
  email?: string
  phoneNumber?: string
  firstName?: string
  lastName?: string
  externalId?: string
  properties?: Record<string, unknown>
}

/** A single product/line item as Klaviyo expects it in events. */
export type KlaviyoProductInput = {
  productId: string
  title: string
  url: string
  imageUrl?: string
  price: number
  currency: string
  quantity?: number
  categories?: string[]
  isAvailable?: boolean
  metadata?: Record<string, unknown>
}

/** Cart snapshot for Added to Cart / Started Checkout events. */
export type KlaviyoCartInput = {
  cartId?: string
  checkoutUrl?: string
  value: number
  currency: string
  items: KlaviyoProductInput[]
}

/** Order snapshot for the Placed Order event. */
export type KlaviyoOrderInput = {
  orderId: string
  customer: KlaviyoProfileInput
  value: number
  currency: string
  items: KlaviyoProductInput[]
  paymentStatus: string
  orderStatus: string
  deliveryMethod?: string
  shippingTotal?: number
  discountTotal?: number
  createdAt: string
}

/** Catalog item payload (maps 1:1 onto Klaviyo catalog-item attributes). */
export type KlaviyoCatalogItemInput = {
  externalId: string
  title: string
  description?: string
  url: string
  imageFullUrl?: string
  price: number
  published: boolean
  customMetadata?: Record<string, unknown>
}

/** Marketing consent state understood by Klaviyo subscription jobs. */
export type KlaviyoMarketingConsent = 'SUBSCRIBED' | 'UNSUBSCRIBED'

/** Result of a server-side Klaviyo operation. Never throws to callers by default. */
export type KlaviyoResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; skipped: true }
  | { ok: false; skipped?: false; error: string; status?: number }
