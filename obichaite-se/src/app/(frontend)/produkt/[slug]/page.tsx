import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PromotionsCardsGrid } from '@/components/Product'
import SingleProduct from '@/components/Product/SingleProduct'
import { Category, Product } from '@/payload-types'
import { generateMeta } from '@/utils/generateMeta'
import shuffle from '@/utils/seedShuffle'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const blogs = await payload.find({
    collection: 'product',
    limit: 2000,
    select: {
      slug: true,
    },
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  const params = blogs.docs
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

export default async function ProductSinglePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/produkt/' + slug
  const product = await queryProductBySlug({ slug })
  if (!product) return <PayloadRedirects url={url} />

  //first in one query needs to get all best sellers and promotion in product category
  const payload = await getPayload({ config: configPromise })
  const allPromotionsAndBestSellers = await payload.find({
    collection: 'product',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [
        {
          category: {
            equals: (product.category as Category).id,
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
      bestSeller: true,
      promoPrice: true,
      havePriceRange: true,
      mediaArray: true,
      priceRange: true,
      shortDescription: true,
      quantity: true,
      subCategory: true,
    },
  })

  //related
  const allRelatedProducts = await payload.find({
    collection: 'product',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [
        {
          category: {
            equals: (product?.category as Category)?.id || 7,
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
    },
  })

  let allRelatedToRender = allRelatedProducts.docs
  if (allRelatedToRender.length > 6) {
    const shuffled = shuffle(allRelatedProducts.docs as Product[])

    allRelatedToRender = shuffled.slice(0, 6)
  }

  return (
    <>
      <article className="w-full">
        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <div className="w-full pt-[76px] md:pt-[164px] bg-pink/30">
          <SingleProduct product={product} />
        </div>

        {!!allPromotionsAndBestSellers.docs.length && (
          <PromotionsCardsGrid
            products={allPromotionsAndBestSellers.docs as Product[]}
            heading="Промоции и Най-продавани"
          />
        )}

        {!!allRelatedToRender.length && (
          <PromotionsCardsGrid
            products={allRelatedToRender as Product[]}
            heading="Свързани продукти"
          />
        )}
      </article>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryProductBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryProductBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'product',
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
