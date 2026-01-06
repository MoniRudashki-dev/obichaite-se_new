import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { generateMeta } from '@/utils/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import HeroCommon from '@/Hero/Common'
import { CategoriesSection } from '@/components/Categories'
import { Category, Product, Review } from '@/payload-types'
import { PromotionsCardsGrid } from '@/components/Product'
import BenefitsSection from '@/components/Custom/BenefitsSection'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import ReviewSection from '@/components/Reviews/ReviewSection'
import RepresentationSection from '@/components/Custom/RepresentationSection'
// import { AboutUsJsonLd, HomePageJsonLd, OrganizationJsonLd } from '@/components/SEO'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
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

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
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

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const url = '/' + slug

  const page = await queryPageBySlug({
    slug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'category',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    select: {
      title: true,
      slug: true,
      media: true,
      description: true,
      heading: true,
      mediaMobile: true,
    },
    sort: 'createdAt',
  })

  const itIsHome = slug === 'home'

  const hero = page.commonHero
  const layout = page.layout

  let promotionProducts: Product[] = []

  let bestSellers: Product[] = []

  let reviews: Review[] = []

  if (!!itIsHome) {
    try {
      const currentPromotionProducts = await payload.find({
        collection: 'product',
        draft: false,
        limit: 2000,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            {
              promoPrice: {
                exists: true,
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

      const currentBestSellers = await payload.find({
        collection: 'product',
        draft: false,
        limit: 2000,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            {
              bestSeller: {
                equals: true,
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

      if (currentPromotionProducts.docs.filter((doc) => !!doc.promoPrice).length > 0) {
        promotionProducts = currentPromotionProducts.docs?.filter(
          (doc) => !!doc.promoPrice,
        ) as Product[]
      }
      if (currentBestSellers.docs.filter((doc) => !!doc.bestSeller).length > 0) {
        bestSellers = currentBestSellers.docs?.filter((doc) => !!doc.bestSeller) as Product[]
      }
    } catch (error) {
      console.log('error', error)
    }

    try {
      const currentReviews = await payload.find({
        collection: 'reviews',
        draft: false,
        limit: 2000,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            {
              isInHomePage: {
                equals: true,
              },
            },
            {
              approved: {
                equals: true,
              },
            },
          ],
        },
        //get only the reviews with property 'itIsHome' set to true
      })

      if (currentReviews.docs.length > 0) {
        reviews = currentReviews.docs
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <>
      <article className="w-full">
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}
        {!page.regulatoryPage && <HeroCommon {...hero} />}

        {!!itIsHome && <CategoriesSection categories={categories.docs as Category[]} />}

        {!!promotionProducts?.length && (
          <PromotionsCardsGrid products={promotionProducts} heading="Нашите Промоции" />
        )}

        {!!page.benefits && page.benefits?.length > 0 && (
          <BenefitsSection benefits={page.benefits} />
        )}

        {!!bestSellers?.length && (
          <PromotionsCardsGrid products={bestSellers} heading="Най-продавани продукти" />
        )}

        {!!layout?.length && (
          <div className="pt-[76px] md:pt-[164px]">
            <RenderBlocks blocks={layout} />
          </div>
        )}

        {!!page.representatives?.title && itIsHome && (
          <RepresentationSection representatives={page.representatives} />
        )}

        {!!reviews?.length && <ReviewSection reviews={reviews} />}
      </article>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
