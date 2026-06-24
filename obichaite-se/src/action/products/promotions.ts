'use server'

import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import configPromise from '@/payload.config'
import type { Product } from '@/payload-types'

const PRODUCT_PROMOTIONS_CACHE_SECONDS = 300

const getCachedPromotionsAndBestSellers = unstable_cache(
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
          {
            or: [{ bestSeller: { equals: true } }, { promoPrice: { exists: true } }],
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
        priceInEuro: true,
        promoPriceInEuro: true,
        bestSeller: true,
        promoPrice: true,
        havePriceRange: true,
        mediaArray: true,
        priceRange: true,
        shortDescription: true,
        quantity: true,
        subCategory: true,
        showInquiryForm: true,
      },
    })

    return products.docs as Product[]
  },
  ['product-promotions-and-best-sellers'],
  {
    revalidate: PRODUCT_PROMOTIONS_CACHE_SECONDS,
    tags: ['product-promotions-and-best-sellers'],
  },
)

export async function getPromotionsAndBestSellers(
  categoryId: number,
): Promise<{ data: Product[]; error?: string }> {
  const normalizedCategoryId = Number(categoryId)

  if (!Number.isFinite(normalizedCategoryId) || normalizedCategoryId <= 0) {
    return { data: [] }
  }

  try {
    const products = await getCachedPromotionsAndBestSellers(normalizedCategoryId)

    return { data: products }
  } catch (error) {
    console.error('[getPromotionsAndBestSellers] failed:', error)
    return { data: [], error: 'Unable to load promotions and best sellers.' }
  }
}
