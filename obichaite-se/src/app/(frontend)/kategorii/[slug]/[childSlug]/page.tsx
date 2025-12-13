import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Category } from '@/payload-types'

import { generateMeta } from '@/utils/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import ProductsCardGridWithFilters from '@/components/Product/ProductsCardGridWithFilters'
import { SubCategorySlider } from '@/components/Product'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const subCategories = await payload.find({
    collection: 'sub-category',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      parentCategory: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const params = subCategories.docs.map(({ slug, parentCategory }) => {
    return { slug: `${(parentCategory as Category)?.slug}`, childSlug: slug }
  })
  return params
}

type Args = {
  params: Promise<{
    slug?: string
    childSlug?: string
  }>
}

export default async function SubCategory({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '', childSlug = '' } = await paramsPromise
  const url = '/kategorii/' + slug + '/' + childSlug
  const subCategory = await queryCategoryBySlug({ slug: childSlug })

  if (!subCategory) return <PayloadRedirects url={url} />

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
          _status: {
            equals: 'published',
          },
        },
        {
          or: [
            {
              subCategory: {
                equals: subCategory?.id,
              },
            },
            {
              otherSubCategories: {
                contains: subCategory?.id,
              },
            },
          ],
        },
      ],
    },
  })

  // const otherProducts = await payload.find({
  //   collection: 'product',
  //   draft: false,
  //   limit: 2000,
  //   overrideAccess: false,
  //   pagination: false,
  //   where: {
  //     and: [
  //       {
  //         otherSubCategories: {
  //           contains: subCategory?.id,
  //         },
  //       },
  //       {
  //         _status: {
  //           equals: 'published',
  //         },
  //       },
  //     ],
  //   },
  // })

  //get all subcategories in this category
  const otherSubcategories = await payload.find({
    collection: 'sub-category',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    where: {
      parentCategory: {
        equals: (subCategory.parentCategory as Category).id,
      },
    },
  })

  let subCategoryLoopDuration = 28
  if (otherSubcategories?.docs?.length <= 10) subCategoryLoopDuration = 10
  if (otherSubcategories?.docs?.length > 10) subCategoryLoopDuration = 30
  if (otherSubcategories?.docs?.length >= 20) subCategoryLoopDuration = 60

  return (
    <article className="w-full bg-brown">
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="w-full pt-[76px] md:pt-[164px]">
        <ProductsCardGridWithFilters
          products={[...products.docs]}
          heading={subCategory.title}
        />
      </div>

      {!!otherSubcategories?.docs && (
        <div className="sticky bottom-[0px] w-full py-3 bg-brown z-[8]">
          <div
            className="content_wrapper_mobile-full mx-auto
  [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
  [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
"
          >
            <SubCategorySlider
              subCategories={otherSubcategories.docs}
              durationSec={subCategoryLoopDuration}
            />
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { childSlug = '' } = await paramsPromise
  const category = await queryCategoryBySlug({ slug: childSlug })

  return generateMeta({ doc: category })
}

const queryCategoryBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'sub-category',
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
