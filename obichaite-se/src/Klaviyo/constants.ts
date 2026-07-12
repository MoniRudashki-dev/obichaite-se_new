/**
 * Klaviyo integration constants.
 *
 * Centralises metric names, catalog identifiers and API defaults so they are
 * not scattered across the module. Keep event names aligned with Klaviyo's
 * standard ecommerce metrics (see plan section 5).
 */

/** Default Klaviyo API revision. Can be overridden via KLAVIYO_API_REVISION. */
export const DEFAULT_KLAVIYO_REVISION = '2026-04-15'

/** Base URL for the Klaviyo REST API. */
export const KLAVIYO_API_BASE_URL = 'https://a.klaviyo.com'

/**
 * Onsite (browser) script URL. Klaviyo's current format embeds the public key
 * in the path: `/onsite/js/<PUBLIC_API_KEY>/klaviyo.js`.
 * https://developers.klaviyo.com/en/docs/javascript_api
 */
export const buildKlaviyoOnsiteScriptUrl = (publicApiKey: string): string =>
  `https://static.klaviyo.com/onsite/js/${publicApiKey}/klaviyo.js`

/**
 * Standard Klaviyo ecommerce metric names. Do NOT invent alternatives — these
 * exact strings are what Klaviyo flows and analytics expect.
 */
export const KLAVIYO_METRICS = {
  VIEWED_PRODUCT: 'Viewed Product',
  ADDED_TO_CART: 'Added to Cart',
  STARTED_CHECKOUT: 'Started Checkout',
  PLACED_ORDER: 'Placed Order',
} as const

/** Klaviyo custom catalog identifiers (custom integration, default catalog). */
export const KLAVIYO_CATALOG = {
  INTEGRATION_TYPE: '$custom',
  CATALOG_TYPE: '$default',
} as const

/** Max items per catalog bulk job request (Klaviyo hard limit is 100). */
export const KLAVIYO_CATALOG_BATCH_SIZE = 100

/**
 * Builds the composite Klaviyo catalog item id for a product.
 * Pattern: `$custom:::$default:::<externalId>`.
 */
export const buildCatalogItemId = (externalId: string | number): string =>
  `${KLAVIYO_CATALOG.INTEGRATION_TYPE}:::${KLAVIYO_CATALOG.CATALOG_TYPE}:::${externalId}`
