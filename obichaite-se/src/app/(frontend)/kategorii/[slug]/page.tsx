import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Category, Product } from '@/payload-types'

import { generateMeta } from '@/utils/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import ProductsCardGridWithFilters from '@/components/Product/ProductsCardGridWithFilters'
import { SubCategorySlider } from '@/components/Product'

const THEMATIC_ID = 3

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'category',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const params = categories.docs
    .filter((doc) => !!doc.slug)
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Category({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/kategorii/' + slug
  const category = await queryCategoryBySlug({ slug })

  if (!category) return <PayloadRedirects url={url} />

  //get all products in this category
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
            equals: category.id,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  let otherThematicProducts: Product[] = []
  if (category.id === THEMATIC_ID) {
    const thematics = await payload.find({
      collection: 'product',
      draft: false,
      limit: 2000,
      overrideAccess: false,
      pagination: false,
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            isInThematic: {
              equals: true,
            },
          },
        ],
      },
    })
    otherThematicProducts = thematics.docs
  }

  //get all subcategories in this category
  const subcategories = await payload.find({
    collection: 'sub-category',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    where: {
      parentCategory: {
        equals: category.id,
      },
    },
  })

  let subCategoryLoopDuration = 28
  if (subcategories?.docs?.length <= 10) subCategoryLoopDuration = 10
  if (subcategories?.docs?.length > 10) subCategoryLoopDuration = 30
  if (subcategories?.docs?.length >= 20) subCategoryLoopDuration = 60

  const productsToRender = [...products.docs, ...otherThematicProducts]

  return (
    <article className="w-full bg-brown">
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="w-full pt-[76px] md:pt-[164px]">
        <ProductsCardGridWithFilters products={productsToRender} heading={category.title} />
      </div>

      {!!subcategories?.docs && (
        <div className="sticky bottom-[0px] w-full py-3 bg-brown z-[8]">
          <div
            className="content_wrapper_mobile-full mx-auto
  [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
  [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
"
          >
            <SubCategorySlider
              subCategories={subcategories.docs}
              durationSec={subCategoryLoopDuration}
            />
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const category = await queryCategoryBySlug({ slug })

  return generateMeta({ doc: category })
}

const queryCategoryBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'category',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
