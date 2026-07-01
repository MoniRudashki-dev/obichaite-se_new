'use client'

/**
 * @deprecated Not in use for now. Box Now's shipment price is hydrated through
 * the unified `SetCourierShippingPrices` setter along with the other couriers.
 * Kept here in case we need the standalone Box Now setter again.
 */

import { useAppDispatch } from '@/hooks/redux-hooks'
import { setBoxNowShipmentPrice } from '@/store/features/checkout'
import { useEffect } from 'react'

export const SetBoxNowShipmentPriceSetter = ({ price }: { price: number }) => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!price) return
    dispatch(setBoxNowShipmentPrice(price))
  }, [price, dispatch])

  return null
}

export default SetBoxNowShipmentPriceSetter
