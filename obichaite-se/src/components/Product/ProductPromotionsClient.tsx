'use client'

import { getPromotionsAndBestSellers } from '@/action/products/promotions'
import type { Product } from '@/payload-types'
import { useEffect, useState } from 'react'

import { GenericButton, GenericParagraph } from '../Generic'
import { GlobalLoader } from '../Loader'
import PromotionsCardsGrid from './PromotionsCardsGrid'

type ProductPromotionsState = {
  products: Product[]
  status: 'error' | 'loading' | 'success'
}

const initialPromotionsState: ProductPromotionsState = {
  products: [],
  status: 'loading',
}

const ProductPromotionsLoader = () => {
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

const ProductPromotionsError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <section className="w-full white-pink-background py-10 md:py-20">
      <div className="content_wrapper flex flex-col items-center gap-5 text-center">
        <GenericParagraph
          pType="regular"
          fontStyle="font-sansation font-[700]"
          textColor="text-bordo"
        >
          Не успяхме да заредим промоциите и най-продаваните продукти.
        </GenericParagraph>

        <GenericButton click={onRetry} variant="primary" ariaLabel="Опитай отново">
          Опитай отново
        </GenericButton>
      </div>
    </section>
  )
}

const ProductPromotionsClient = ({
  categoryId,
  heading = 'Промоции и Най-продавани',
}: {
  categoryId: number
  heading?: string
}) => {
  const [promotionsState, setPromotionsState] =
    useState<ProductPromotionsState>(initialPromotionsState)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    const loadPromotionsAndBestSellers = async () => {
      if (!Number.isFinite(categoryId) || categoryId <= 0) {
        setPromotionsState({ products: [], status: 'success' })
        return
      }

      setPromotionsState({ products: [], status: 'loading' })

      try {
        const response = await getPromotionsAndBestSellers(categoryId)

        if (!isCurrentRequest) return

        if (response.error) {
          setPromotionsState({ products: [], status: 'error' })
          return
        }

        setPromotionsState({ products: response.data, status: 'success' })
      } catch (error) {
        console.error('[ProductPromotionsClient] failed:', error)

        if (isCurrentRequest) {
          setPromotionsState({ products: [], status: 'error' })
        }
      }
    }

    loadPromotionsAndBestSellers()

    return () => {
      isCurrentRequest = false
    }
  }, [categoryId, retryKey])

  if (!Number.isFinite(categoryId) || categoryId <= 0) return null

  if (promotionsState.status === 'loading') {
    return <ProductPromotionsLoader />
  }

  if (promotionsState.status === 'error') {
    return (
      <ProductPromotionsError
        onRetry={() => {
          setRetryKey((previousRetryKey) => previousRetryKey + 1)
        }}
      />
    )
  }

  if (promotionsState.products.length === 0) return null

  return <PromotionsCardsGrid products={promotionsState.products} heading={heading} />
}

export default ProductPromotionsClient
