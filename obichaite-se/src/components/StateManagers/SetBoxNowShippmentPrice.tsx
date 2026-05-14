'use client'

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
