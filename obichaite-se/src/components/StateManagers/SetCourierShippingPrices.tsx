'use client'

import { useAppDispatch } from '@/hooks/redux-hooks'
import { setBoxNowShipmentPrice, setEcontPrices, setSpeedyPrices } from '@/store/features/checkout'
import { useEffect } from 'react'

export const SetCourierShippingPrices = ({
  boxNowPrice,
  econtOfficePrice,
  econtAddressPrice,
  speedyOfficePrice,
  speedyAddressPrice,
}: {
  boxNowPrice: number
  econtOfficePrice: number
  econtAddressPrice: number
  speedyOfficePrice: number
  speedyAddressPrice: number
}) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBoxNowShipmentPrice(boxNowPrice))
    dispatch(setEcontPrices({ office: econtOfficePrice, address: econtAddressPrice }))
    dispatch(setSpeedyPrices({ office: speedyOfficePrice, address: speedyAddressPrice }))
  }, [
    boxNowPrice,
    econtOfficePrice,
    econtAddressPrice,
    speedyOfficePrice,
    speedyAddressPrice,
    dispatch,
  ])

  return null
}

export default SetCourierShippingPrices
