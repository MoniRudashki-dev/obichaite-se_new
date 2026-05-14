'use client'

import React from 'react'
import { CheckoutFormValues } from '../Checkout/CheckoutForm'

export type SelectProps<T> = {
  options: { label: string; value: string }[]
  label: string
  formValues: object
  setFormValues: React.Dispatch<React.SetStateAction<T>>
  name: string
  required?: boolean
}

const RadioSelect = <T,>({
  options,
  label,
  formValues,
  setFormValues,
  name,
  required,
}: SelectProps<T>) => {
  const isFirstSelected = formValues[name as keyof object] === options[0].value
  const isSecondSelected = formValues[name as keyof object] === options[1].value
  const isThirdSelected = formValues[name as keyof object] === options[2].value

  const isBoxNowSelectedAsCourier = (formValues as CheckoutFormValues).courier === 'boxnow'

  const onSelectHandler = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <label htmlFor={name} className="font-kolka font-[500] text-brown">
        {label}
        {required && <span className="text-primaryBlue"> *</span>}
      </label>

      <div className="w-full flex">
        <button
          className={`flex-1 border-[1px] border-brown/80 rounded-tl-[8px] rounded-bl-[8px] h-[50px] text-brown
          ${isFirstSelected ? 'bg-brown text-white' : ''} hover:opacity-80 hover:shadow-sm transition-color duration-300 ease-in-out
        `}
          type="button"
          onClick={() => onSelectHandler(options[0].value)}
          disabled={isBoxNowSelectedAsCourier}
        >
          {options[0].label}
        </button>
        <button
          className={`flex-1 border-[1px] border-brown/80 h-[50px] text-brown
          ${isSecondSelected ? 'bg-brown text-white' : ''} hover:opacity-80 hover:shadow-sm transition-color duration-300 ease-in-out
        `}
          type="button"
          onClick={() => onSelectHandler(options[1].value)}
          disabled={isBoxNowSelectedAsCourier}
        >
          {options[1].label}
        </button>
        <button
          className={`flex-1 border-[1px] border-brown/80 h-[50px] rounded-tr-[8px] rounded-br-[8px] text-brown
          ${isThirdSelected ? 'bg-brown text-white' : ''} hover:opacity-80 hover:shadow-sm transition-color duration-300 ease-in-out
        `}
          type="button"
          onClick={() => onSelectHandler(options[2].value)}
          disabled={true}
        >
          {options[2].label}
        </button>
      </div>
    </div>
  )
}

export default RadioSelect
