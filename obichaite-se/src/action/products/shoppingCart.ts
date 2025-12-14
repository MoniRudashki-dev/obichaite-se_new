'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Product } from '@/payload-types'

export async function addToCart(productId: number, userId: number) {
  if (!productId) return { ok: false }

  if (!userId) return { ok: false }
  const payload = await getPayload({ config: configPromise })

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
  })

  const current = Array.isArray(user.shoppingCartProducts)
    ? user.shoppingCartProducts.map((x: Product | number) => x).filter(Boolean)
    : []

  if (!current.includes(productId)) {
    current.push(productId)
  }

  //Update with overrideAccess (you denied update in access config)
  await payload.update({
    collection: 'users',
    id: userId,
    data: { shoppingCartProducts: current },
    overrideAccess: true,
    depth: 0,
  })

  return { ok: true }
}

export async function removeFromCart(productId: number, userId: number) {
  if (!productId) throw new Error('Missing product ID')

  const payload = await getPayload({ config: configPromise })

  const doc = await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
  })

  const current: number[] = Array.isArray(doc.shoppingCartProducts)
    ? doc.shoppingCartProducts.map((x: Product | number) => x as number).filter(Boolean)
    : []

  const next = current.filter((id) => id !== productId)

  if (next.length !== current.length) {
    await payload.update({
      collection: 'users',
      id: userId,
      data: { shoppingCartProducts: next },
      overrideAccess: true,
      depth: 0,
    })
  }

  return { ok: true }
}

export const removeAllProductsFromShoppingCart = async (userId: number) => {
  const payload = await getPayload({ config: configPromise })

  await payload.update({
    collection: 'users',
    id: userId,
    data: { shoppingCartProducts: [] },
    overrideAccess: true,
    depth: 0,
  })

  return { ok: true }
}

export async function getCartProductsByUserId(userId: number) {
  const payload = await getPayload({ config: configPromise })

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 4,
    select: { shoppingCartProducts: true },
  })

  const ids: number[] = Array.isArray(user.shoppingCartProducts)
    ? user.shoppingCartProducts
        .map((x: Product | number) => (typeof x === 'number' ? x : x?.id))
        .filter(Boolean)
    : []

  if (ids.length === 0) return []

  const productsRes = await payload.find({
    collection: 'product',
    where: { id: { in: ids } },
    pagination: false,
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
      subCategory: true,
    },
    depth: 1,
  })

  const docs = productsRes.docs

  const byId = new Map(docs.map((d: any) => [d.id, d]))
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean)

  return ordered
}
