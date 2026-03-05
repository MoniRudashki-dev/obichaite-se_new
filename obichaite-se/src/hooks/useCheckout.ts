'use client'

import { ExtendedProduct } from '@/store/features/checkout'
import { useAppSelector } from './redux-hooks'
import { Product } from '@/payload-types'

export function useCheckout() {
  const products = useAppSelector((state) => state.checkout.products)

  const calculateTotalPrice = () => {
    return products.reduce((total, product) => {
      if (!product.priceInEuro) return total
      if (product?.promoPriceInEuro) {
        return total + product.promoPriceInEuro * product.orderQuantity
      }

      return total + product.priceInEuro * product.orderQuantity
    }, 0)
  }

  const calculateRemainSum = () => {
    const BASE_SUM = 100

    const differences = BASE_SUM - calculateTotalPrice()

    return differences
  }

  const addToLocalStorage = (product: Product) => {
    const currentLocalStorageProducts = JSON.parse(
      localStorage.getItem('cardProductsObichaiteSe') || '[]',
    )

    if (currentLocalStorageProducts.length === 0) {
      localStorage.setItem(
        'cardProductsObichaiteSe',
        JSON.stringify([{ ...product, orderQuantity: 1 }]),
      )
      return
    }

    const productExistsInLocalStorage = currentLocalStorageProducts.find(
      (x: ExtendedProduct) => x.id === product.id,
    )

    if (productExistsInLocalStorage) {
      productExistsInLocalStorage.orderQuantity++
      localStorage.setItem('cardProductsObichaiteSe', JSON.stringify(currentLocalStorageProducts))
    } else {
      currentLocalStorageProducts.push({ ...product, orderQuantity: 1 })
      localStorage.setItem('cardProductsObichaiteSe', JSON.stringify(currentLocalStorageProducts))
    }
  }

  const removeFromLocalStorage = (product: Product) => {
    const currentLocalStorageProducts = JSON.parse(
      localStorage.getItem('cardProductsObichaiteSe') || '[]',
    )

    const productExistsInLocalStorage = currentLocalStorageProducts.find(
      (x: ExtendedProduct) => x.id === product.id,
    )

    if (productExistsInLocalStorage?.length > 0) {
      currentLocalStorageProducts.splice(
        currentLocalStorageProducts.indexOf(productExistsInLocalStorage),
        1,
      )
      localStorage.setItem('cardProductsObichaiteSe', JSON.stringify(currentLocalStorageProducts))
    } else {
      localStorage.removeItem('cardProductsObichaiteSe')
    }
  }

  return { calculateTotalPrice, calculateRemainSum, addToLocalStorage, removeFromLocalStorage }
}
