'use client'
import { Product } from '@/payload-types'
import { VIEW_CONTENT } from '@/services/anatilitics'
import { trackViewedProduct } from '@/Klaviyo/client/klaviyo-events'
import React, { useEffect } from 'react'

const PageViewComponent = (product: Product) => {
  useEffect(() => {
    VIEW_CONTENT(
      'EUR',
      String(product.promoPriceInEuro ? product.promoPriceInEuro : product.priceInEuro || 0),
      [
        {
          item_id: String(product.id),
          item_name: product.title,
          price: product.promoPriceInEuro ? product.promoPriceInEuro : product.priceInEuro || 0,
          quantity: 1,
        },
      ],
    )

    // Klaviyo "Viewed Product" (no-op unless the integration is enabled).
    trackViewedProduct(product)
  }, [product])
  return <></>
}

export default PageViewComponent
