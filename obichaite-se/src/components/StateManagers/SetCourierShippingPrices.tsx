'use client'

import { useAppDispatch } from '@/hooks/redux-hooks'
import { setEcontPrices, setSpeedyPrices } from '@/store/features/checkout'
import { useEffect } from 'react'

export const SetCourierShippingPrices = ({
  econtOfficePrice,
  econtAddressPrice,
  speedyOfficePrice,
  speedyAddressPrice,
}: {
  econtOfficePrice: number
  econtAddressPrice: number
  speedyOfficePrice: number
  speedyAddressPrice: number
}) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setEcontPrices({ office: econtOfficePrice, address: econtAddressPrice }))
    dispatch(setSpeedyPrices({ office: speedyOfficePrice, address: speedyAddressPrice }))
  }, [econtOfficePrice, econtAddressPrice, speedyOfficePrice, speedyAddressPrice, dispatch])

  return null
}

export default SetCourierShippingPrices
