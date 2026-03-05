// app/checkout/payment/PaymentSection.tsx
'use client'

import { ExtendedProduct } from '@/store/features/checkout'

import { useEffect, useState, useTransition } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js'

import { PaymentForm } from './PaymentForm'
import { createPaymentIntentAction } from '../action'
import { GenericHeading } from '@/components/Generic'
import { useAppSelector } from '@/hooks/redux-hooks'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
type PaymentSectionProps = {
  items: ExtendedProduct[]
  createPaymentIntentAction: (
    items: ExtendedProduct[],
    discount: number,
  ) => Promise<{ clientSecret: string | null }>
}

export default function PaymentSection({ items }: PaymentSectionProps) {
  const { userHaveDiscount } = useAppSelector((state) => state.checkout)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const discount = userHaveDiscount ? 0.9 : 1

    startTransition(async () => {
      try {
        const result = await createPaymentIntentAction(items, discount)

        if (!result.clientSecret) {
          setError('Грешка при създаване на плащането. Моля, опитайте отново по-късно.')
        }

        setClientSecret(result.clientSecret)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Грешка при създаване на плащането.')
      }
    })
  }, [items, userHaveDiscount])

  if (error) {
    return <div>Грешка: {error}</div>
  }

  if (!clientSecret || isPending) {
    return <div>Зареждане на плащането...</div>
  }

  const options: StripeElementsOptions = {
    clientSecret,
  }

  return (
    <div>
      <GenericHeading align="text-center" headingType="h4" textColor="text-bordo">
        Плащане
      </GenericHeading>

      <Elements stripe={stripePromise} options={options}>
        <PaymentForm />
      </Elements>
    </div>
  )
}
