'use client'

import React from 'react'
import { BoxnowLocker } from '../types'
import BoxNowOfficeDropdown from './BoxNowOffice'

type BoxNowWrapperProps = {
  activeInnerShipping: 'boxnow'
  currentShippingCity: BoxnowLocker | null
  office: BoxnowLocker | null
  handleCityChange: (city: BoxnowLocker) => void
  handleOfficeChange: (office: BoxnowLocker) => void
  boxNowCities: BoxnowLocker[]
}

const BoxNowWrapper = ({
  currentShippingCity,
  office,
  handleCityChange,
  handleOfficeChange,
  boxNowCities,
}: BoxNowWrapperProps) => {
  return (
    <BoxNowOfficeDropdown
      cities={boxNowCities}
      setter={handleCityChange}
      office={office}
      city={currentShippingCity as BoxnowLocker}
      setOffice={handleOfficeChange}
    />
  )
}

export default BoxNowWrapper
