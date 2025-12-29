// app/_actions/review.ts
'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function createReview(formData: FormData) {
  const payload = await getPayload({ config: configPromise })

  const author = (formData.get('author') as string | null) ?? ''
  const message = (formData.get('message') as string | null) ?? ''
  const imageFile = formData.get('image') as File | null
  const rating = (formData.get('rating') as string | null) ?? ''
  const productId = (formData.get('productId') as string | null) ?? ''
  const productIdAsNumber = Number(productId)

  let imageId: number | null = null

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    try {
      const upload = await payload.create({
        collection: 'media',
        data: {
          alt: imageFile.name,
        },
        file: {
          data: buffer,
          name: imageFile.name,
          size: imageFile.size,
          mimetype: imageFile.type,
        },
      })
      imageId = upload.id
    } catch {
      console.log('Failed to upload image')
    }
  }

  console.log(imageId)

  await payload.create({
    collection: 'reviews',
    data: {
      author,
      message,
      media: imageId,
      rating: (rating as '1' | '2' | '3' | '4' | '5') || '5',
      product: productIdAsNumber as number,
      title: author ?? 'Нов Отзив',
    },
  })

  return { ok: true }
}
