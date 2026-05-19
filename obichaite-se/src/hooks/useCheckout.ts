'use client'

import { ExtendedProduct } from '@/store/features/checkout'
import { useAppSelector } from './redux-hooks'
import { Product } from '@/payload-types'

export function useCheckout() {
  const products = useAppSelector((state) => state.checkout.products)
  const boxNowShippingPrice = useAppSelector((state) => state.checkout.boxNowShipmentPrice)
  const courier = useAppSelector((state) => state.checkout.courier)

  const calculateItemsSubtotal = () => {
    return products.reduce((total, product) => {
      if (!product.priceInEuro) return total
      if (product?.promoPriceInEuro) {
        return total + product.promoPriceInEuro * product.orderQuantity
      }
      return total + product.priceInEuro * product.orderQuantity
    }, 0)
  }

  const calculateTotalPrice = (discountMultiplier: number = 1) => {
    const itemsSubtotal = calculateItemsSubtotal()
    const discountedItemsSubtotal = itemsSubtotal * discountMultiplier
    const needToAddShipmentPrice =
      courier === 'boxnow' && !!boxNowShippingPrice && itemsSubtotal < 50

    return needToAddShipmentPrice
      ? discountedItemsSubtotal + boxNowShippingPrice
      : discountedItemsSubtotal
  }

  const calculateRemainSum = () => {
    const FREE_SHIPPING_THRESHOLD = 50
    return FREE_SHIPPING_THRESHOLD - calculateItemsSubtotal()
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

  return {
    calculateTotalPrice,
    calculateItemsSubtotal,
    calculateRemainSum,
    addToLocalStorage,
    removeFromLocalStorage,
  }
}
