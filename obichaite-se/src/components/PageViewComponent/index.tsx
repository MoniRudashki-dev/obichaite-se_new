'use client'
import { Product } from '@/payload-types'
import { VIEW_CONTENT } from '@/services/anatilitics'
import React, { useEffect } from 'react'

const PageViewComponent = (product: Product) => {
  useEffect(() => {
    VIEW_CONTENT('BGN', String(product.promoPrice ? product.promoPrice : product.price || 0), [
      {
        item_id: String(product.id),
        item_name: product.title,
        price: product.promoPrice ? product.promoPrice : product.price || 0,
        quantity: 1,
      },
    ])
  }, [])
  return <></>
}

export default PageViewComponent
