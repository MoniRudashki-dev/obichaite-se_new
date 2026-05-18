'use client'

import React from 'react'
import GenericImage from './GenericImage'
import GenericParagraph from './GenericParagraph'
import { CheckoutFormValues } from '../Checkout/CheckoutForm'
import { useAppDispatch } from '@/hooks/redux-hooks'
import { setCourier } from '@/store/features/checkout'

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
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
      deliveryKind: value === 'boxnow' ? 'automat' : 'office',
    }))
    dispatch(setCourier(value as 'boxnow' | 'econt' | 'speedy'))
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <label htmlFor={name} className="font-kolka font-[500] text-brown">
        {label}
        {required && <span className="text-primaryBlue"> *</span>}
      </label>

      <div className="flex flex-col">
        <div className="w-full flex">
          <button
            className={`flex-1 border-[1px] border-brown/80 rounded-tl-[8px] rounded-bl-[8px] h-[50px] text-brown
          ${isFirstSelected ? 'bg-brown text-white' : ''} hover:opacity-80 hover:shadow-sm transition-color duration-300 ease-in-out
        `}
            type="button"
            onClick={() => onSelectHandler(options[0].value)}
          >
            {options[0].label}
          </button>
          <button
            className={`flex-1 border-[1px] border-brown/80 rounded-tr-[8px] rounded-br-[8px] h-[50px] text-brown
          ${isSecondSelected ? 'bg-brown text-white' : ''} hover:opacity-80 hover:shadow-sm transition-color duration-300 ease-in-out
        `}
            type="button"
            onClick={() => onSelectHandler(options[1].value)}
          >
            {options[1].label}
          </button>
        </div>
        <button
          className={`w-full relative h-[140px] border-[1px] border-brown/80 rounded-[8px] overflow-hidden ${
            isBoxNowSelected ? 'bg-brown text-white' : 'bg-white'
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
              Изберете Box Now и доставката ще е на стойност от {boxNowShipmentPrice.toFixed(2)} euro.
            </GenericParagraph>
          </div>
        </button>
      </div>
    </div>
  )
}

export default RadioSelectCouriers
