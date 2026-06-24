'use server'

import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Product } from '@/payload-types'

const RELATED_PRODUCTS_CACHE_SECONDS = 300

const getCachedRelatedProducts = unstable_cache(
  async (categoryId: number): Promise<Product[]> => {
    const payload = await getPayload({ config: configPromise })

    const products = await payload.find({
      collection: 'product',
      draft: false,
      limit: 2000,
      overrideAccess: false,
      pagination: false,
      where: {
        and: [
          {
            category: {
              equals: categoryId,
            },
          },
          {
            _status: {
              equals: 'published',
            },
          },
        ],
      },
      select: {
        title: true,
        slug: true,
        description: true,
        heading: true,
        category: true,
        price: true,
        bestSeller: true,
        promoPrice: true,
        havePriceRange: true,
        mediaArray: true,
        priceRange: true,
        shortDescription: true,
        quantity: true,
        subCategory: true,
        showInquiryForm: true,
        priceInEuro: true,
        promoPriceInEuro: true,
      },
    })

    return products.docs as Product[]
  },
  ['related-products'],
  {
    revalidate: RELATED_PRODUCTS_CACHE_SECONDS,
    tags: ['related-products'],
  },
)

export async function getRelatedProducts(
  categoryId: number,
): Promise<{ data: Product[]; error?: string }> {
  const normalizedCategoryId = Number(categoryId)

  if (!Number.isFinite(normalizedCategoryId) || normalizedCategoryId <= 0) {
    return { data: [] }
  }

  try {
    const products = await getCachedRelatedProducts(normalizedCategoryId)

    return { data: products }
  } catch (error) {
    console.error('[getRelatedProducts] failed:', error)
    return { data: [], error: 'Unable to load related products.' }
  }
}
