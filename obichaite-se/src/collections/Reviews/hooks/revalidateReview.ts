import { Product, Review } from '@/payload-types'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const revalidateReview: CollectionAfterChangeHook<Review> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc.isInHomePage) {
      const path = `/`
      revalidatePath(path)
      revalidateTag('pages-sitemap')
    }

    const extraPath = (doc.product as Product).slug

    const path = `/produkt/${extraPath}`

    revalidatePath(path)
    revalidateTag('product-sitemap')

    payload.logger.info(`Revalidating post at path: ${path}`)
  }

  return doc
}

export const revalidateDeleteReview: CollectionAfterDeleteHook<Review> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/`
    revalidatePath(path)
    revalidateTag('pages-sitemap')

    const extraPath = (doc.product as Product).slug

    const fullPath = `/produkt/${extraPath}`

    revalidatePath(fullPath)
    revalidateTag('product-sitemap')
  }

  return doc
}
