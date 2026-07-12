import { describe, expect, it } from 'vitest'
import type { Category, Media, Product } from '@/payload-types'
import type { ExtendedProduct } from '@/store/features/checkout'
import { mapCartToKlaviyo } from '../mappers/cart.mapper'

const item = (overrides: Partial<ExtendedProduct> = {}): ExtendedProduct =>
  ({
    id: 1,
    title: 'Продукт',
    slug: 'produkt',
    quantity: 10,
    priceInEuro: 10,
    promoPriceInEuro: null,
    orderQuantity: 1,
    mediaArray: [{ file: { id: 1, alt: 'a', url: 'https://cdn/x.jpg' } as Media }],
    category: { id: 3, title: 'Кутии' } as Category,
    ...overrides,
  }) as unknown as ExtendedProduct

describe('mapCartToKlaviyo', () => {
  it('computes cart value as sum(price * quantity) rounded to 2 decimals', () => {
    const cart = mapCartToKlaviyo([
      item({ id: 1, priceInEuro: 20, orderQuantity: 1 }),
      item({ id: 2, priceInEuro: 9.95, orderQuantity: 2 }),
    ])
    expect(cart.value).toBe(39.9)
    expect(cart.currency).toBe('EUR')
    expect(cart.items).toHaveLength(2)
  })

  it('rounds floating point totals cleanly', () => {
    const cart = mapCartToKlaviyo([item({ priceInEuro: 10.1, orderQuantity: 3 })])
    expect(cart.value).toBe(30.3)
  })

  it('falls back to quantity 1 when orderQuantity is 0 or negative', () => {
    const zero = mapCartToKlaviyo([item({ priceInEuro: 15, orderQuantity: 0 })])
    expect(zero.items[0].quantity).toBe(1)
    expect(zero.value).toBe(15)

    const negative = mapCartToKlaviyo([item({ priceInEuro: 15, orderQuantity: -2 })])
    expect(negative.items[0].quantity).toBe(1)
  })

  it('passes through the checkout url when provided', () => {
    const cart = mapCartToKlaviyo([item()], { checkoutUrl: 'https://site/checkout' })
    expect(cart.checkoutUrl).toBe('https://site/checkout')
  })

  it('returns an empty, zero-value cart for no items', () => {
    const cart = mapCartToKlaviyo([])
    expect(cart.value).toBe(0)
    expect(cart.items).toEqual([])
  })
})
