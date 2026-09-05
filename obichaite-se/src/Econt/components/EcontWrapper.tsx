'use client'

import React from 'react'
import { EcontCity, EcontOffice } from '../types'
import { EcontOfficeDropdown } from '.'
import EcontAddressDropdown from './EcontAddressDropdown'
import type { Settlement } from '@/utils/settlementSearch'

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
  /** Само населени места — за доставка до адрес, без офиси и еконтомати. */
  econtSettlements: Settlement[]
}

const EcontWrapper = ({
  activeInnerShipping,
  currentShippingCity,
  address,
  handleCityChange,
  handleAddressChange,
  econtCities,
  econtSettlements,
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
          settlements={econtSettlements}
          setter={handleCityChange}
          city={currentShippingCity}
          address={address}
          setAdrress={handleAddressChange}
        />
      )}
    </>
  )
}

export default EcontWrapper
