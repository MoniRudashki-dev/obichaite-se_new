'use client'

import React from 'react'
import { EcontCity, EcontOffice } from '../types'
import { EcontOfficeDropdown } from '.'
import EcontAddressDropdown from './EcontAddressDropdown'

type EcontWrapperProps = {
  activeInnerShipping: 'econt-office' | 'econt-address'
  currentShippingCity: EcontCity | null
  address: string
  office: EcontOffice | null
  handleCityChange: (city: EcontCity) => void
  handleOfficeChange: (office: EcontOffice) => void
  handleAddressChange: (address: string) => void
  econtCities: {
    id: number
    name: string
  }[]
}

const EcontWrapper = ({
  activeInnerShipping,
  currentShippingCity,
  address,
  handleCityChange,
  handleAddressChange,
  econtCities,
}: EcontWrapperProps) => {
  return (
    <>
      {activeInnerShipping === 'econt-office' ? (
        <EcontOfficeDropdown
          cities={econtCities}
          setter={handleCityChange}
          city={currentShippingCity as EcontCity}
        />
      ) : (
        <EcontAddressDropdown
          cities={econtCities}
          setter={handleCityChange}
          city={currentShippingCity as EcontCity}
          address={address}
          setAdrress={handleAddressChange}
        />
      )}
    </>
  )
}

export default EcontWrapper
