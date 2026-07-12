/**
 * Shared mapping helpers used by product/catalog/cart/order mappers.
 *
 * These normalise the app's Payload `Product` shape (flat products, EUR pricing,
 * media with absolute urls) into the values Klaviyo needs. Kept framework-free
 * so mappers can run both server-side (events/catalog) and client-side
 * (browser events).
 */

import type { Category, Media, Product, SubCategory } from '@/payload-types'
import { getServerSideURL } from '@/utils/getServerSideUrl'

/** Currency used across the whole site (see plan — everything is EUR). */
export const SITE_CURRENCY = 'EUR'

/** True when a relationship field has been populated into a full object. */
const isPopulated = <T>(value: number | T | null | undefined): value is T =>
  typeof value === 'object' && value !== null

/**
 * Final EUR unit price: promo price when set and positive, otherwise base price.
 * Returns 0 for inquiry-only products with no price (guarded by callers).
 */
export const resolveProductPrice = (product: Product): number => {
  if (typeof product.promoPriceInEuro === 'number' && product.promoPriceInEuro > 0) {
    return product.promoPriceInEuro
  }
  return product.priceInEuro ?? 0
}

/** Absolute image url of the first gallery item (already absolute in Media.url). */
export const resolveProductImageUrl = (product: Product): string | undefined => {
  const first = product.mediaArray?.[0]?.file
  if (isPopulated<Media>(first) && first.url) return first.url
  return undefined
}

/** Absolute product detail url: `<serverUrl>/produkt/<slug>`. */
export const resolveProductUrl = (product: Product): string => {
  const base = getServerSideURL().replace(/\/$/, '')
  return product.slug ? `${base}/produkt/${product.slug}` : base
}

/** Category + subcategory titles (only those populated into objects). */
export const resolveProductCategories = (product: Product): string[] => {
  const titles: string[] = []

  if (isPopulated<Category>(product.category)) titles.push(product.category.title)
  if (isPopulated<SubCategory>(product.subCategory)) titles.push(product.subCategory.title)

  for (const other of product.otherSubCategories ?? []) {
    if (isPopulated<SubCategory>(other)) titles.push(other.title)
  }

  // De-duplicate while preserving order.
  return [...new Set(titles.filter(Boolean))]
}

/** Availability is modelled purely by stock quantity (no boolean inStock field). */
export const isProductAvailable = (product: Product): boolean => (product.quantity ?? 0) > 0

/** Inquiry-only products (no purchase path / no price) should be skipped by catalog sync. */
export const isInquiryOnlyProduct = (product: Product): boolean =>
  product.showInquiryForm === true && resolveProductPrice(product) <= 0

/** Splits a single "First Last" string into first/last name parts. */
export const splitFullName = (
  fullName?: string | null,
): { firstName?: string; lastName?: string } => {
  const trimmed = (fullName ?? '').trim()
  if (!trimmed) return {}
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0] }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}
