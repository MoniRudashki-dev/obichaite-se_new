'use client'

import React from 'react'
import GenericImage from './GenericImage'

export type SelectProps<T> = {
  options: { label: string; value: string }[]
  label: string
  formValues: object
  setFormValues: React.Dispatch<React.SetStateAction<T>>
  name: string
  required?: boolean
}

const RadioSelectCouriers = <T,>({
  options,
  label,
  formValues,
  setFormValues,
  name,
  required,
}: SelectProps<T>) => {
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
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <label htmlFor={name} className="font-kolka font-[500] text-brown">
        {label}
        {required && <span className="text-primaryBlue"> *</span>}
      </label>

      <div className="flex flex-col midxl:flex-row gap-4">
        <button
          className={`w-full relative h-[100px] border-[8px] bg-white rounded-[8px] overflow-hidden ${
            isBoxNowSelected ? 'border-brown/80' : 'border-transparent'
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
        </button>
        <button
          className={`w-full relative h-[100px] border-[8px] bg-white rounded-[8px] overflow-hidden ${
            isFirstSelected ? 'border-brown/80' : 'border-transparent'
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
          className={`w-full relative h-[100px] border-[8px] bg-white rounded-[8px] overflow-hidden ${
            isSecondSelected ? 'border-brown/80' : 'border-transparent'
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
