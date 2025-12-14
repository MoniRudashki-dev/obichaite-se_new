// src/actions/orders/makeOrder.ts
'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { ExtendedProduct } from '@/store/features/checkout'
import { Product, SubCategory } from '@/payload-types'

export type MakeOrderInput = {
  items: ExtendedProduct[]

  customerName: string
  customerEmail: string
  customerPhone: string

  deliveryMethod: 'econt' | 'speedy-dpd'
  shippingAddress: {
    line1: string
    city: string
    postalCode: string
  }
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
  clientNotes?: string
}

export async function makeOrder(
  input: MakeOrderInput,
  userId: number | null,
): Promise<{
  ok: boolean
  orderId: number | null
  orderNumber: string | null
}> {
  const {
    items,
    customerName,
    customerEmail,
    customerPhone,
    deliveryMethod,
    shippingAddress,
    clientNotes,
    paymentStatus = 'unpaid',
  } = input

  if (!items || items.length === 0) {
    return { ok: false, orderId: null, orderNumber: null }
  }

  if (!customerName || !customerEmail || !customerPhone) {
    return { ok: false, orderId: null, orderNumber: null }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const orderItems = items.map((item) => {
      const quantity = item.orderQuantity > 0 ? item.orderQuantity : 1

      let unitPrice = 0
      if (!!item.promoPrice || !!item.price) {
        unitPrice =
          typeof item.promoPrice === 'number' && item.promoPrice > 0
            ? item.promoPrice
            : item.price || 0
      }

      const lineTotal = unitPrice * quantity

      return {
        product: item.id,
        productTitle: item.title,
        unitPrice,
        quantity,
        lineTotal,
      }
    })

    const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0)

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0')}`

    const itsFreeShipping = total >= 100

    const payloadBody: {
      collection: 'order'
      data: {
        orderDate: string
        orderNumber: string
        status: 'pending'
        paymentStatus: 'paid' | 'unpaid' | 'refunded'
        items: {
          product: number
          productTitle: string
          unitPrice: number
          quantity: number
          lineTotal: number
        }[]
        total: number
        customerName: string
        customerEmail: string
        customerPhone: string
        deliveryMethod: 'econt' | 'speedy-dpd'
        shippingAddress: {
          line1: string
          city: string
          postalCode: string
        }
        clientNotes: string | undefined
        user?: number
        freeShipping?: boolean
      }
      overrideAccess: true
    } = {
      collection: 'order',
      data: {
        orderDate: new Date().toISOString(),
        orderNumber,
        status: 'pending',
        paymentStatus: paymentStatus,

        items: orderItems,
        total,
        freeShipping: itsFreeShipping,
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        shippingAddress,
        clientNotes,
      },
      overrideAccess: true,
    } as const

    if (userId) {
      payloadBody.data.user = userId
    }

    const order = await payload.create(payloadBody)

    return {
      ok: true,
      orderId: order.id,
      orderNumber: orderNumber,
    }
  } catch (error) {
    console.log(error)
    return { ok: false, orderId: null, orderNumber: null }
  }
}

export async function checkForDiscount(email: string): Promise<{ data: boolean }> {
  const clean = String(email).trim().toLowerCase()
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'order',
      where: { customerEmail: { like: clean } },
      depth: 1,
      pagination: false,
      limit: 1,
    })

    if (result.docs.length > 0) {
      return { data: false }
    }

    return { data: true }
  } catch (error) {
    console.log(error)
    return { data: false }
  }
}

export async function getSuggestions(products: Product[]): Promise<{ data: Product[] }> {
  try {
    const payload = await getPayload({ config: configPromise })

    const subCategoriesIds = products.map((product) => (product.subCategory as SubCategory).id)

    if (subCategoriesIds.length === 0) return { data: [] }

    const limit = subCategoriesIds.length * 6

    const result = await payload.find({
      collection: 'product',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            subCategory: {
              in: subCategoriesIds,
            },
          },
        ],
      },
      depth: 1,
      pagination: false,
      limit: limit,
    })

    if (result.docs.length === 0) return { data: [] }

    return { data: result.docs }
  } catch (error) {
    console.log(error)
    return { data: [] }
  }
}
