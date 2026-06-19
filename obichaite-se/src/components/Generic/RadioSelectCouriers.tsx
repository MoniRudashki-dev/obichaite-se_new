'use client'

import { useAppDispatch } from '@/hooks/redux-hooks'
import { setCourier } from '@/store/features/checkout'
import React from 'react'
import GenericImage from './GenericImage'
import GenericParagraph from './GenericParagraph'

export type SelectProps<T> = {
  options: { label: string; value: string }[]
  label: string
  formValues: object
  setFormValues: React.Dispatch<React.SetStateAction<T>>
  name: string
  required?: boolean
  boxNowShipmentPrice: number
}

const RadioSelectCouriers = <T,>({
  options,
  label,
  formValues,
  setFormValues,
  name,
  required,
  boxNowShipmentPrice,
}: SelectProps<T>) => {
  const dispatch = useAppDispatch()
  const isFirstSelected = formValues[name as keyof object] === options[0].value
  const isSecondSelected = formValues[name as keyof object] === options[1].value
  const isBoxNowSelected = formValues[name as keyof object] === options[2].value

  const onSelectHandler = (value: string) => {
    if (formValues[name as keyof object] === value) return

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
      deliveryKind: value === 'boxnow' ? 'automat' : 'office',
      deliveryTown: '',
      deliveryOffice: '',
      boxNowOfficeId: '',
    }))
    dispatch(setCourier(value === 'speedy-dpd' ? 'speedy' : (value as 'boxnow' | 'econt')))
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <label htmlFor={name} className="font-kolka font-[500] text-brown">
        {label}
        {required && <span className="text-primaryBlue"> *</span>}
      </label>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          className={`w-full relative h-[180px] border-[1px] bg-white border-brown/80 rounded-[8px] overflow-hidden ${
            isBoxNowSelected ? 'border-[8px]' : 'border-[1px]'
          }`}
          type="button"
          onClick={() => onSelectHandler('boxnow')}
        >
          <GenericImage
            src="/static/boxnow-logo-wide.png"
            alt="box-now"
            wrapperClassName="w-full h-full absolute top-0 left-0 z-[0]"
            imageClassName="w-full h-full object-contain"
            fill={true}
            sizes="100vw"
          />

          <div className="absolute z-[2] bottom-[0px] left-0 right-0">
            <GenericParagraph
              fontStyle="font-kolka font-[400]"
              textColor={'text-brown'}
              pType="small"
              extraClass="text-center max-w-[90%] mx-auto"
            >
              <span className={`${isBoxNowSelected ? 'text-white' : 'text-brown'} md:text-brown`}>
                {boxNowShipmentPrice === 0
                  ? 'Безплатна доставка (до 30.06.2026).'
                  : `доставката -> ${boxNowShipmentPrice.toFixed(2)} euro.`}
              </span>
            </GenericParagraph>
          </div>
        </button>
        <button
          className={`w-full relative h-[180px] bg-white border-brown/80 rounded-[8px] overflow-hidden ${
            isFirstSelected ? 'border-[8px]' : 'border-[1px]'
          }`}
          type="button"
          onClick={() => onSelectHandler('speedy-dpd')}
        >
          <GenericImage
            src="/static/speedy.png"
            alt="speedy"
            wrapperClassName="w-full h-full absolute top-0 left-0 z-[0]"
            imageClassName="w-full h-full object-contain"
            fill={true}
            sizes="100vw"
          />
        </button>

        <button
          className={`w-full relative h-[180px] bg-white border-brown/80 rounded-[8px] overflow-hidden ${
            isSecondSelected ? 'border-[8px]' : 'border-[1px]'
          }`}
          type="button"
          onClick={() => onSelectHandler('econt')}
        >
          <GenericImage
            src="/static/econt.png"
            alt="econt"
            wrapperClassName="w-full h-full absolute top-0 left-0 z-[0]"
            imageClassName="w-full h-full object-contain"
            fill={true}
            sizes="100vw"
          />
        </button>
      </div>
    </div>
  )
}

export default RadioSelectCouriers
