'use client'

import React, { useEffect, useState } from 'react'
import { GenericHeading } from '../Generic'
import { useAppSelector } from '@/hooks/redux-hooks'
import CheckoutProduct from './CheckoutProduct'

const Checkout = () => {
  const [isClient, setIsClient] = useState(false)

  const { products } = useAppSelector((state) => state.checkout)

  const productsContent = products.map((product) => {
    return <CheckoutProduct key={product.id} product={product} />
  })

  useEffect(() => setIsClient(true), [])

  if (!isClient) return null

  return (
    <div className="w-full flex flex-col gap-m">
      <div className="w-full flex flex-col gap-s">
        <GenericHeading
          headingType="h4"
          fontStyle="font-sansation font-[700]"
          textColor="text-bordo"
          extraClass="border-b-[1px] border-b-bordo/80 text-center"
        >
          <h2>Продукти</h2>
        </GenericHeading>
      </div>

      {products.length === 0 && (
        <GenericHeading
          headingType="h5"
          fontStyle="font-sansation font-[700]"
          textColor="text-bordo"
          extraClass="text-center"
        >
          <h2>Няма продукти в кошницата</h2>
        </GenericHeading>
      )}

      <ul className="w-full flex flex-col md:min-w-[500px] xl:min-w-[600px] gap-m md:max-h-screen overflow-y-auto">
        {productsContent}
      </ul>
    </div>
  )
}

export default Checkout
