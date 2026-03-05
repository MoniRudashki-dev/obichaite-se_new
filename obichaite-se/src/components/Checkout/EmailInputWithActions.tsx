import React from 'react'

import { EyeIcon } from '@/assets/icons'
import ErrorMessageBox from '../Generic/ErrorMessage'
import { useDiscount } from '@/hooks/useDiscount'

export type EmailInputWithActionProps<T> = {
  name: string
  label: string
  formValues: object
  setFormValues: React.Dispatch<React.SetStateAction<T>>
  placeholder: string
  error?: string
  extraClass?: string
  required?: boolean
  voice?: boolean
  autoFocus?: boolean
  type?: 'text' | 'password' | 'number'
}

const EmailInputWithAction = <T,>({
  name,
  label,
  formValues,
  setFormValues,
  placeholder,
  error,
  extraClass,
  required = false,
  autoFocus = false,
  type = 'text',
}: EmailInputWithActionProps<T>) => {
  const { handleCheckDiscount } = useDiscount()
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+']

    if (name === 'phoneNumber' || name === 'phone') {
      const isPass = e.target.value.split('').every((char) => validNumbers.includes(char))

      if (isPass) {
        setFormValues((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }))
      } else {
        return
      }
    }

    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const [showResult, setShowResult] = React.useState(false)

  const handleBlur = async () => {
    handleCheckDiscount(formValues[name as keyof object] as string)
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={name} className="font-kolka font-[500] text-brown">
        {label}
        {required && <span className="text-primaryBlue"> *</span>}
      </label>

      <div className="relative flex w-full items-center justify-between">
        <input
          name={name}
          id={name}
          type={type === 'password' && !showResult ? 'password' : 'text'}
          placeholder={placeholder}
          value={formValues[name as keyof object]}
          onChange={(e) => onChangeHandler(e)}
          autoFocus={autoFocus}
          className={`${
            type === 'password' ? 'pl-10' : ''
          } w-full rounded-[12px] border bg-brown/20 border-brown/20 p-3 font-sansation font-[400] !text-brown outline-none 
          placeholder:text-brown/80
          ${extraClass}`}
          maxLength={50}
          onBlur={() => handleBlur()}
        />

        {type === 'password' && (
          <button
            className="absolute left-2 top-[50%] flex translate-y-[-50%] items-center justify-center"
            type="button"
            onClick={() => setShowResult((prev) => !prev)}
          >
            <EyeIcon />
          </button>
        )}
      </div>

      {!!error && <ErrorMessageBox error={error} />}
    </div>
  )
}

export default EmailInputWithAction
