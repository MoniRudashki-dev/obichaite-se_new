import { RenderLandingBlocks } from '@/blocks/RenderLandingBlocks'
import GenericHeading from '@/components/Generic/GenericHeading'
import GenericParagraph from '@/components/Generic/GenericParagraph'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import PageViewComponent from '@/components/PageViewComponent'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PromotionsCardsGrid } from '@/components/Product'
import ProductInquiryForm from '@/components/Product/ProductInquiryForm'
import SingleProduct from '@/components/Product/SingleProduct'
import ReviewForm from '@/components/Reviews/ReviewForm'
import ReviewSection from '@/components/Reviews/ReviewSection'
import { Category, Product, Review } from '@/payload-types'
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

  let reviews: Review[] = []

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
          {
            product: {
              equals: product.id,
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

  const isLandingMode =
    Boolean(product.showInquiryForm) && (product.landingBlocks?.length ?? 0) >= 2

  return (
    <>
      <article className="w-full">
        {/* TODO move? */}
        <PageViewComponent {...product} />

        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        {isLandingMode ? (
          <>
            <div className="w-full pt-[76px] md:pt-[164px]">
              <RenderLandingBlocks blocks={product.landingBlocks} />
            </div>

            <section
              id="inquiry-form"
              className="scroll-mt-[96px] md:scroll-mt-[180px] bg-pinkShade/20 py-16 md:py-24"
            >
              <div className="content_wrapper">
                <div className="mx-auto max-w-3xl text-center mb-8">
                  <GenericHeading
                    headingType="h2"
                    fontStyle="font-sansation font-[700]"
                    textColor="text-brown"
                    align="text-center"
                  >
                    Готови ли сте да създадете вълнуващ момент?
                  </GenericHeading>
                  <GenericParagraph
                    pType="large"
                    fontStyle="font-sansation font-[400]"
                    textColor="text-brown"
                    extraClass="mt-4 text-center"
                  >
                    Свържете се с нас и ще подготвим персонална изненада, съобразена с повода,
                    мястото и вашето послание.
                  </GenericParagraph>
                </div>
                <div className="mx-auto max-w-2xl rounded-[28px] border border-brown/15 bg-white p-6 md:p-8 shadow-sm">
                  <ProductInquiryForm
                    variant="inline"
                    productId={String(product.id)}
                    productTitle={product.title}
                    fields={product.inquiryFormFields ?? []}
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="w-full pt-[76px] md:pt-[164px] bg-pink/30">
              <SingleProduct product={product} />
            </div>

            {!!product.landingBlocks?.length && (
              <RenderLandingBlocks blocks={product.landingBlocks} />
            )}

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

            {!!reviews?.length && <ReviewSection reviews={reviews} />}

            <div className="w-full white-pink-background px-4 md:px-6 xl:px-10">
              <ReviewForm productId={product.id} />
            </div>
          </>
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
