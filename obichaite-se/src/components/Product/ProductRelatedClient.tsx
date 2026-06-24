'use client'

import { getRelatedProducts } from '@/action/products/related'
import type { Product } from '@/payload-types'
import shuffle from '@/utils/seedShuffle'
import { useEffect, useState } from 'react'

import { GenericButton, GenericParagraph } from '../Generic'
import { GlobalLoader } from '../Loader'
import PromotionsCardsGrid from './PromotionsCardsGrid'

type ProductRelatedState = {
  products: Product[]
  status: 'error' | 'loading' | 'success'
}

const RELATED_PRODUCTS_LIMIT = 6

const initialRelatedState: ProductRelatedState = {
  products: [],
  status: 'loading',
}

const ProductRelatedLoader = () => {
  return (
    <section className="w-full white-pink-background py-10 md:py-20 min-h-[50svh] flex items-center">
      <div className="content_wrapper">
        <div className="mx-auto h-[250px] w-[250px]">
          <GlobalLoader color="#64182f" />
        </div>
      </div>
    </section>
  )
}

const ProductRelatedError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <section className="w-full white-pink-background py-10 md:py-20">
      <div className="content_wrapper flex flex-col items-center gap-5 text-center">
        <GenericParagraph
          pType="regular"
          fontStyle="font-sansation font-[700]"
          textColor="text-bordo"
        >
          Не успяхме да заредим свързаните продукти.
        </GenericParagraph>

        <GenericButton click={onRetry} variant="primary" ariaLabel="Опитай отново">
          Опитай отново
        </GenericButton>
      </div>
    </section>
  )
}

const getProductsToRender = (products: Product[]) => {
  if (products.length <= RELATED_PRODUCTS_LIMIT) return products

  return shuffle(products).slice(0, RELATED_PRODUCTS_LIMIT)
}

const ProductRelatedClient = ({
  categoryId,
  heading = 'Свързани продукти',
}: {
  categoryId: number
  heading?: string
}) => {
  const [relatedState, setRelatedState] = useState<ProductRelatedState>(initialRelatedState)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    const loadRelatedProducts = async () => {
      if (!Number.isFinite(categoryId) || categoryId <= 0) {
        setRelatedState({ products: [], status: 'success' })
        return
      }

      setRelatedState({ products: [], status: 'loading' })

      try {
        const response = await getRelatedProducts(categoryId)

        if (!isCurrentRequest) return

        if (response.error) {
          setRelatedState({ products: [], status: 'error' })
          return
        }

        setRelatedState({ products: getProductsToRender(response.data), status: 'success' })
      } catch (error) {
        console.error('[ProductRelatedClient] failed:', error)

        if (isCurrentRequest) {
          setRelatedState({ products: [], status: 'error' })
        }
      }
    }

    loadRelatedProducts()

    return () => {
      isCurrentRequest = false
    }
  }, [categoryId, retryKey])

  if (!Number.isFinite(categoryId) || categoryId <= 0) return null

  if (relatedState.status === 'loading') {
    return <ProductRelatedLoader />
  }

  if (relatedState.status === 'error') {
    return (
      <ProductRelatedError
        onRetry={() => {
          setRetryKey((previousRetryKey) => previousRetryKey + 1)
        }}
      />
    )
  }

  if (relatedState.products.length === 0) return null

  return <PromotionsCardsGrid products={relatedState.products} heading={heading} />
}

export default ProductRelatedClient
