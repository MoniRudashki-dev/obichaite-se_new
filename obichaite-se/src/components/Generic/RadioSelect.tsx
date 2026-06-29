'use client'

import React from 'react'

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
        {options.map((option, index) => {
          const isSelected = formValues[name as keyof object] === option.value
          const isFirst = index === 0
          const isLast = index === options.length - 1

          return (
            <button
              key={option.value}
              className={`flex-1 border-[1px] border-brown/80 h-[50px] text-brown
              ${isFirst ? 'rounded-tl-[8px] rounded-bl-[8px]' : ''}
              ${isLast ? 'rounded-tr-[8px] rounded-br-[8px]' : ''}
              ${isSelected ? 'bg-brown text-white' : ''} hover:opacity-80 hover:shadow-sm transition-color duration-300 ease-in-out
            `}
              type="button"
              onClick={() => onSelectHandler(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RadioSelect
