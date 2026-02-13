'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { sendProductInquiryEmailAction } from '@/action/mail'
import type { Product } from '@/payload-types'

import ErrorMessageBox from '../Generic/ErrorMessage'

type InquiryField = NonNullable<NonNullable<Product['inquiryFormFields']>[number]>

type InquiryAnswer = {
  question: string
  type: InquiryField['type']
  required: boolean
  value: string | { date: string; text: string }
}

type FieldErrors = Record<string, string>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_REGEX = /^\d+$/
const SUCCESS_TITLE = 'Благодарим ви за доверието!'
const SUCCESS_DESCRIPTION =
  'Нашият екип ще се свърже с вас до 24 часа с персонално предложение.'

const toStr = (value: FormDataEntryValue | null) => String(value ?? '').trim()
const getQuestionTitle = (field: InquiryField, idx: number) => field.title?.trim() || `Въпрос ${idx + 1}`

const getFieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border bg-white px-4 py-3 text-brown outline-none ${
    hasError ? 'border-red-500 focus:border-red-500' : 'border-brown/20 focus:border-bordo'
  }`

type Props = {
  open: boolean
  onClose: () => void
  productId: string
  productTitle: string
  fields: NonNullable<Product['inquiryFormFields']>
}

export const ProductInquiryFormModal = ({
  open,
  onClose,
  productId,
  productTitle,
  fields,
}: Props) => {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const backdropPressStarted = useRef(false)

  useEffect(() => {
    if (open) return
    setSending(false)
    setError('')
    setFieldErrors({})
    setIsSubmitted(false)
  }, [open])

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  if (!open || typeof document === 'undefined') return null

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending) return

    setError('')
    setFieldErrors({})
    setIsSubmitted(false)

    const form = e.currentTarget
    const fd = new FormData(form)
    const nextErrors: FieldErrors = {}

    const email = toStr(fd.get('email'))
    const phone = toStr(fd.get('phone'))
    const consent = fd.get('consent') === 'on'
    const additionalInfo = toStr(fd.get('additionalInfo'))

    if (!email || !EMAIL_REGEX.test(email)) {
      nextErrors.email = 'Моля, въведете валиден имейл адрес.'
    }

    if (!phone) {
      nextErrors.phone = 'Моля, въведете телефон.'
    } else if (!PHONE_REGEX.test(phone)) {
      nextErrors.phone = 'Телефонът трябва да съдържа само цифри.'
    }

    if (!consent) {
      nextErrors.consent = 'Трябва да дадете съгласие за контакт.'
    }

    if (additionalInfo.length > 1000) {
      nextErrors.additionalInfo = 'Допълнителната информация е твърде дълга (макс. 1000 символа).'
    }

    const answers: InquiryAnswer[] = []

    for (const [idx, field] of fields.entries()) {
      const key = `q_${idx}`
      const question = getQuestionTitle(field, idx)
      const required = Boolean(field.required)

      if (field.type === 'date_text') {
        const date = toStr(fd.get(`${key}_date`))
        const text = toStr(fd.get(`${key}_text`))

        if (required && !date) {
          nextErrors[`${key}_date`] = `Изберете дата за: ${question}`
        }

        answers.push({
          question,
          type: field.type,
          required,
          value: { date, text },
        })
        continue
      }

      const value = toStr(fd.get(key))

      if (required && !value) {
        nextErrors[key] = `Попълнете: ${question}`
      }

      if (field.type === 'select' && value) {
        const allowedValues = new Set((field.options ?? []).map((option) => option.value))
        if (!allowedValues.has(value)) {
          nextErrors[key] = `Невалидна опция за: ${question}`
        }
      }

      answers.push({
        question,
        type: field.type,
        required,
        value,
      })
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setError('Моля, коригирайте отбелязаните полета.')
      return
    }

    setSending(true)

    try {
      const result = await sendProductInquiryEmailAction({
        productId,
        productTitle,
        email,
        phone,
        consent,
        additionalInfo,
        answers,
      })

      if (!result.ok) {
        setError(result.error || 'Грешка при изпращане. Моля, опитайте отново.')
        return
      }

      setFieldErrors({})
      setError('')
      setIsSubmitted(true)
      form.reset()
    } catch (submitError) {
      console.error(submitError)
      setError('Грешка при изпращане. Моля, опитайте отново.')
    } finally {
      setSending(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px] p-3 sm:p-6"
      onPointerDown={(e) => {
        backdropPressStarted.current = e.target === e.currentTarget
      }}
      onPointerUp={(e) => {
        const shouldClose = backdropPressStarted.current && e.target === e.currentTarget
        backdropPressStarted.current = false
        if (shouldClose) onClose()
      }}
    >
      <div
        className="md:mx-auto mt-4 sm:mt-10 w-full max-w-2xl max-h-[90svh] overflow-hidden rounded-[28px] border border-brown/20 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-brown/10">
          <h3 className="font-sansation font-[700] text-[22px] sm:text-[28px] leading-none text-brown">
            {isSubmitted ? 'Благодарим' : 'Запитване'}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-brown/20 text-brown hover:bg-brown/5"
            aria-label="Затвори"
          >
            x
          </button>
        </div>

        {isSubmitted ? (
          <div className="flex h-[calc(90svh-92px)] items-center justify-center px-5 sm:px-7 py-6">
            <div className="w-full rounded-[24px] border border-brown/15 bg-[#F6EEE6] px-6 py-8 sm:px-8 text-center">
              <p className="font-sansation font-[700] text-[24px] sm:text-[30px] leading-tight text-bordo">
                {SUCCESS_TITLE}
              </p>
              <p className="mt-4 font-kolka text-[16px] leading-relaxed text-brown">
                {SUCCESS_DESCRIPTION}
              </p>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="flex h-[calc(90svh-92px)] min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">
              {fields.map((field, idx) => {
                const key = `q_${idx}`
                const title = field.title ?? `Въпрос ${idx + 1}`
                const mainFieldError = fieldErrors[key]
                const dateFieldError = fieldErrors[`${key}_date`]

                return (
                  <div key={key} className="space-y-2.5">
                    <label className="block font-sansation font-[700] text-brown">
                      {title} {field.required ? '*' : ''}
                    </label>

                    {field.type === 'select' && (
                      <>
                        <select
                          name={key}
                          required={Boolean(field.required)}
                          defaultValue=""
                          aria-invalid={Boolean(mainFieldError)}
                          onChange={() => clearFieldError(key)}
                          className={getFieldClass(Boolean(mainFieldError))}
                        >
                          <option value="" disabled>
                            Избери...
                          </option>
                          {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {mainFieldError ? <ErrorMessageBox error={mainFieldError} /> : null}
                      </>
                    )}

                    {field.type === 'text' && (
                      <>
                        <input
                          name={key}
                          type="text"
                          required={Boolean(field.required)}
                          placeholder={field.placeholder ?? undefined}
                          aria-invalid={Boolean(mainFieldError)}
                          onChange={() => clearFieldError(key)}
                          className={getFieldClass(Boolean(mainFieldError))}
                        />
                        {mainFieldError ? <ErrorMessageBox error={mainFieldError} /> : null}
                      </>
                    )}

                    {field.type === 'date_text' && (
                      <>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <input
                            name={`${key}_date`}
                            type="date"
                            required={Boolean(field.required)}
                            aria-invalid={Boolean(dateFieldError)}
                            onChange={() => clearFieldError(`${key}_date`)}
                            className={getFieldClass(Boolean(dateFieldError))}
                          />
                          <input
                            name={`${key}_text`}
                            type="text"
                            required={false}
                            placeholder={field.placeholder ?? undefined}
                            className={getFieldClass(false)}
                          />
                        </div>
                        {dateFieldError ? <ErrorMessageBox error={dateFieldError} /> : null}
                      </>
                    )}
                  </div>
                )
              })}

              <div className="space-y-2.5">
                <label className="block font-sansation font-[700] text-brown">Имейл *</label>
                <input
                  name="email"
                  type="email"
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                  onChange={() => clearFieldError('email')}
                  className={getFieldClass(Boolean(fieldErrors.email))}
                />
                {fieldErrors.email ? <ErrorMessageBox error={fieldErrors.email} /> : null}
              </div>

              <div className="space-y-2.5">
                <label className="block font-sansation font-[700] text-brown">Телефон *</label>
                <input
                  name="phone"
                  type="text"
                  inputMode="numeric"
                  required
                  aria-invalid={Boolean(fieldErrors.phone)}
                  onChange={() => clearFieldError('phone')}
                  className={getFieldClass(Boolean(fieldErrors.phone))}
                />
                {fieldErrors.phone ? <ErrorMessageBox error={fieldErrors.phone} /> : null}
              </div>

              <div className="space-y-2.5">
                <label className="block font-sansation font-[700] text-brown">
                  Допълнителна информация
                </label>
                <input
                  name="additionalInfo"
                  type="text"
                  aria-invalid={Boolean(fieldErrors.additionalInfo)}
                  onChange={() => clearFieldError('additionalInfo')}
                  className={getFieldClass(Boolean(fieldErrors.additionalInfo))}
                />
                {fieldErrors.additionalInfo ? <ErrorMessageBox error={fieldErrors.additionalInfo} /> : null}
              </div>

              <label className="flex items-start gap-2 text-[14px] text-brown">
                <input
                  name="consent"
                  type="checkbox"
                  required
                  className="mt-1 accent-[#A3132C]"
                  onChange={() => clearFieldError('consent')}
                />
                <span>Съгласен/на съм да се свържете с мен във връзка със запитването</span>
              </label>
              {fieldErrors.consent ? <ErrorMessageBox error={fieldErrors.consent} /> : null}
            </div>

            <div className="shrink-0 border-t border-brown/10 bg-white px-5 sm:px-7 py-3">
              {error ? <p className="mb-2 text-sm font-[700] text-red-600">{error}</p> : null}

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto rounded-[24px] red_background px-6 py-3 font-sansation font-[700] uppercase text-white disabled:opacity-60"
                >
                  {sending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Изпращане...
                    </span>
                  ) : (
                    'Изпрати'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-[24px] border border-brown/20 px-6 py-3 font-sansation font-[700] text-brown hover:bg-brown/5"
                >
                  Отказ
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
