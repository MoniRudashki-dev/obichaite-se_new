'use client'

import { useAppSelector } from '@/hooks/redux-hooks'
import { Product } from '@/payload-types'
import React, { useEffect, useState } from 'react'
import { PromotionsCardsGrid } from '../Product'
import { getSuggestions } from '@/action/checkout'

const CheckoutSuggestions = () => {
  const products = useAppSelector((state) => state.checkout.products)
  const [suggestions, setSuggestions] = useState<Product[]>([])

  const getSuggestionsHandler = async () => {
    const currentSuggestions = await getSuggestions(products)

    setSuggestions(currentSuggestions.data)
  }

  useEffect(() => {
    if (products.length === 0) {
      setSuggestions([])
      return
    }
    getSuggestionsHandler()
  }, [products.length])

  if (suggestions.length === 0) return null
  return (
    <PromotionsCardsGrid
      products={suggestions}
      heading={`Други предложения за теб от "Обичайте се"`}
    />
  )
}

export default CheckoutSuggestions
