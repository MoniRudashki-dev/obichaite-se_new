import { describe, expect, it } from 'vitest'
import type { Category, Media, Product } from '@/payload-types'
import { mapProductToCatalogItem } from '../mappers/catalog.mapper'
import { buildCatalogItemId } from '../constants'
import { isInquiryOnlyProduct } from '../mappers/shared'

const baseProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 42,
    title: 'Кутия',
    slug: 'kutia',
    shortDescription: 'Кратко описание',
    quantity: 5,
    priceInEuro: 20,
    promoPriceInEuro: null,
    _status: 'published',
    mediaArray: [
      { file: { id: 1, alt: 'a', url: 'https://cdn.example.com/box.jpg' } as Media },
    ],
    category: { id: 3, title: 'Кутии' } as Category,
    ...overrides,
  }) as unknown as Product

describe('mapProductToCatalogItem', () => {
  it('maps external id, price and description', () => {
    const item = mapProductToCatalogItem(baseProduct())
    expect(item.externalId).toBe('42')
    expect(item.price).toBe(20)
    expect(item.description).toBe('Кратко описание')
    expect(item.imageFullUrl).toBe('https://cdn.example.com/box.jpg')
    expect(item.url).toContain('/produkt/kutia')
  })

  it('sets published from _status', () => {
    expect(mapProductToCatalogItem(baseProduct()).published).toBe(true)
    expect(mapProductToCatalogItem(baseProduct({ _status: 'draft' })).published).toBe(false)
  })

  it('exposes availability and categories in custom metadata', () => {
    const item = mapProductToCatalogItem(baseProduct({ quantity: 0 }))
    expect(item.customMetadata?.isAvailable).toBe(false)
    expect(item.customMetadata?.categories).toEqual(['Кутии'])
  })

  it('builds the composite catalog id in the expected pattern', () => {
    expect(buildCatalogItemId('42')).toBe('$custom:::$default:::42')
  })

  it('flags inquiry-only products without a price for skipping', () => {
    expect(
      isInquiryOnlyProduct(
        baseProduct({ showInquiryForm: true, priceInEuro: null, promoPriceInEuro: null }),
      ),
    ).toBe(true)
    expect(isInquiryOnlyProduct(baseProduct())).toBe(false)
  })
})
