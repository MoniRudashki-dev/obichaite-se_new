import { CheckoutSuggestions } from '@/components/Checkout'
import Checkout from '@/components/Checkout/Checkout'
import CheckoutForm from '@/components/Checkout/CheckoutForm'
import { GenericImage } from '@/components/Generic'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Завършване на поръчката | Обичайте се',
  description: 'Страница за завършване на поръчката',
}

const CheckoutPage = () => {
  return (
    <section className="w-full relative py-10 md:py-20 flex mt-[52px] md:mt-[140px] flex-col gap-10">
      <GenericImage
        src="/static/auth-background.png"
        alt="auth-background"
        wrapperClassName="w-full h-full fixed top-0 left-0 z-[0]"
        imageClassName="w-full h-full object-cover"
        fill={true}
        sizes="100vw"
        fetchPriority="high"
      />

      <div className="md:px-6 w-full content_wrapper white_background_bubble py-6 md:py-10 relative z-[1] rounded-[24px] flex flex-col-reverse md:flex-row">
        <div className="flex-1 md:px-4">
          <Checkout />
        </div>

        <div className="flex-1 px-4">
          <CheckoutForm />
        </div>
      </div>

      <div className="w-full relative z-[2] flex">
        <CheckoutSuggestions />
      </div>
    </section>
  )
}

export default CheckoutPage
