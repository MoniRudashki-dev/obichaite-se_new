import { describe, expect, it } from 'vitest'
import type { Category, Media, Product, SubCategory } from '@/payload-types'
import { mapProductToKlaviyo } from '../mappers/product.mapper'

const media = (url: string | null): Media =>
  ({ id: 1, alt: 'alt', url, updatedAt: '', createdAt: '' }) as Media

const baseProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 42,
    title: 'Подаръчна кутия',
    slug: 'podaruchna-kutia',
    quantity: 5,
    priceInEuro: 20,
    promoPriceInEuro: null,
    mediaArray: [{ file: media('https://cdn.example.com/box.jpg') }],
    category: { id: 3, title: 'Кутии' } as Category,
    subCategory: { id: 7, title: 'Празнични' } as SubCategory,
    otherSubCategories: null,
    ...overrides,
  }) as unknown as Product

describe('mapProductToKlaviyo', () => {
  it('maps core fields with the numeric id as a string', () => {
    const result = mapProductToKlaviyo(baseProduct(), 2)
    expect(result.productId).toBe('42')
    expect(result.title).toBe('Подаръчна кутия')
    expect(result.currency).toBe('EUR')
    expect(result.quantity).toBe(2)
    expect(result.url).toContain('/produkt/podaruchna-kutia')
    expect(result.imageUrl).toBe('https://cdn.example.com/box.jpg')
  })

  it('prefers the promo price when it is set and positive', () => {
    const result = mapProductToKlaviyo(baseProduct({ promoPriceInEuro: 15 }))
    expect(result.price).toBe(15)
  })

  it('falls back to the base price when promo is null or zero', () => {
    expect(mapProductToKlaviyo(baseProduct({ promoPriceInEuro: 0 })).price).toBe(20)
    expect(mapProductToKlaviyo(baseProduct({ promoPriceInEuro: null })).price).toBe(20)
  })

  it('resolves categories only from populated relationships', () => {
    const result = mapProductToKlaviyo(baseProduct())
    expect(result.categories).toEqual(['Кутии', 'Празнични'])

    const unpopulated = mapProductToKlaviyo(
      baseProduct({ category: 3 as unknown as Category, subCategory: 7 as unknown as SubCategory }),
    )
    expect(unpopulated.categories).toEqual([])
  })

  it('reflects availability from stock quantity', () => {
    expect(mapProductToKlaviyo(baseProduct({ quantity: 0 })).isAvailable).toBe(false)
    expect(mapProductToKlaviyo(baseProduct({ quantity: 1 })).isAvailable).toBe(true)
  })

  it('returns undefined imageUrl when there is no gallery image', () => {
    const result = mapProductToKlaviyo(baseProduct({ mediaArray: null }))
    expect(result.imageUrl).toBeUndefined()
  })
})
