/**
 * Browser event helpers — build Klaviyo-standard event properties from the
 * app's product/cart data and send them via {@link klaviyoTrack}.
 *
 * Components should call these (thin, declarative) rather than assembling
 * payloads inline. Mirrors how components use `src/services/anatilitics.ts`.
 */

import type { Product } from '@/payload-types'
import type { ExtendedProduct } from '@/store/features/checkout'
import { getKlaviyoEnvironment } from '../config'
import { KLAVIYO_METRICS } from '../constants'
import { mapCartToKlaviyo } from '../mappers/cart.mapper'
import { mapProductToKlaviyo } from '../mappers/product.mapper'
import type { KlaviyoProductInput } from '../types'
import { klaviyoIdentify, klaviyoTrack, type KlaviyoIdentifyInput } from './klaviyo-browser'

const toItemProperties = (item: KlaviyoProductInput) => ({
  ProductID: item.productId,
  ProductName: item.title,
  Price: item.price,
  Quantity: item.quantity ?? 1,
  URL: item.url,
  ImageURL: item.imageUrl,
  Categories: item.categories,
})

/** Fires "Viewed Product" for a product detail page (once per product). */
export const trackViewedProduct = (product: Product): void => {
  const mapped = mapProductToKlaviyo(product)
  klaviyoTrack(KLAVIYO_METRICS.VIEWED_PRODUCT, {
    ProductID: mapped.productId,
    ProductName: mapped.title,
    URL: mapped.url,
    ImageURL: mapped.imageUrl,
    Price: mapped.price,
    Currency: mapped.currency,
    Categories: mapped.categories,
    Environment: getKlaviyoEnvironment(),
  })
}

/** Fires "Added to Cart" after a confirmed cart mutation. */
export const trackAddedToCart = (
  addedProduct: Product,
  cartItems: ExtendedProduct[],
  addedQuantity = 1,
): void => {
  const added = mapProductToKlaviyo(addedProduct, addedQuantity)
  const cart = mapCartToKlaviyo(cartItems)

  klaviyoTrack(KLAVIYO_METRICS.ADDED_TO_CART, {
    $value: cart.value,
    Currency: cart.currency,
    AddedItemProductID: added.productId,
    AddedItemProductName: added.title,
    AddedItemPrice: added.price,
    AddedItemQuantity: addedQuantity,
    AddedItemURL: added.url,
    AddedItemImageURL: added.imageUrl,
    ItemNames: cart.items.map((item) => item.title),
    Items: cart.items.map(toItemProperties),
    Environment: getKlaviyoEnvironment(),
  })
}

/** Identifies the visitor and fires "Started Checkout" once contact + cart are known. */
export const trackStartedCheckout = (
  identity: KlaviyoIdentifyInput,
  cartItems: ExtendedProduct[],
  options?: { checkoutUrl?: string },
): void => {
  const cart = mapCartToKlaviyo(cartItems, { checkoutUrl: options?.checkoutUrl })

  const fireStartedCheckout = () =>
    klaviyoTrack(KLAVIYO_METRICS.STARTED_CHECKOUT, {
      $value: cart.value,
      Currency: cart.currency,
      ItemNames: cart.items.map((item) => item.title),
      Items: cart.items.map(toItemProperties),
      CheckoutURL: cart.checkoutUrl,
      Environment: getKlaviyoEnvironment(),
    })

  // Guarantee the event is attributed to the identified profile: track only
  // after identify completes. Falls back to tracking directly when there is no
  // identifier yet (anonymous cart is still merged on later identify).
  if (identity.email || identity.phoneNumber) {
    klaviyoIdentify(identity, fireStartedCheckout)
  } else {
    fireStartedCheckout()
  }
}
