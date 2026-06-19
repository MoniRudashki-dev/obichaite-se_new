'use client'

import React from 'react'
import { SpeedyOffice, SpeedySite } from '../types'
import SpeedyOfficeDropdown from './SpeedyOfficeDropdown'
import SpeedyAddressDropdown from './SpeedyAddressDropdown'

type SpeedyWrapperProps = {
  activeInnerShipping: 'speedy-office' | 'speedy-address'
  currentShippingCity: SpeedySite | null
  address: string
  office: SpeedyOffice | null
  handleCityChange: (city: SpeedySite) => void
  handleOfficeChange: (office: SpeedyOffice) => void
  handleAddressChange: (address: string) => void
  speedySites: SpeedySite[]
}

const SpeedyWrapper = ({
  activeInnerShipping,
  currentShippingCity,
  address,
  handleCityChange,
  handleAddressChange,
  speedySites,
}: SpeedyWrapperProps) => {
  return (
    <>
      {activeInnerShipping === 'speedy-office' ? (
        <SpeedyOfficeDropdown
          cities={speedySites}
          setter={handleCityChange}
          city={currentShippingCity as SpeedySite}
        />
      ) : (
        <SpeedyAddressDropdown
          cities={speedySites}
          setter={handleCityChange}
          city={currentShippingCity as SpeedySite}
          address={address}
          setAdrress={handleAddressChange}
        />
      )}
    </>
  )
}

export default SpeedyWrapper
