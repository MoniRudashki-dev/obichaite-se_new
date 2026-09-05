'use client'

import React from 'react'
import { SpeedyOffice, SpeedySite } from '../types'
import SpeedyOfficeDropdown from './SpeedyOfficeDropdown'
import SpeedyAddressDropdown from './SpeedyAddressDropdown'
import type { Settlement } from '@/utils/settlementSearch'

type SpeedyWrapperProps = {
  activeInnerShipping: 'speedy-office' | 'speedy-address'
  currentShippingCity: SpeedySite | null
  address: string
  office: SpeedyOffice | null
  handleCityChange: (city: SpeedySite) => void
  handleOfficeChange: (office: SpeedyOffice) => void
  handleAddressChange: (address: string) => void
  speedySites: SpeedySite[]
  /** Само населени места — за доставка до адрес, без офиси и автомати. */
  speedySettlements: Settlement[]
}

const SpeedyWrapper = ({
  activeInnerShipping,
  currentShippingCity,
  address,
  handleCityChange,
  handleAddressChange,
  speedySites,
  speedySettlements,
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
          settlements={speedySettlements}
          setter={handleCityChange}
          city={currentShippingCity}
          address={address}
          setAdrress={handleAddressChange}
        />
      )}
    </>
  )
}

export default SpeedyWrapper
