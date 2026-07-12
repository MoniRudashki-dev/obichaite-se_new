import { describe, expect, it } from 'vitest'
import type { Order, Product } from '@/payload-types'
import { mapOrderToKlaviyo } from '../mappers/order.mapper'

const baseOrder = (overrides: Partial<Order> = {}): Order =>
  ({
    id: 100,
    orderNumber: 'ORD-1700000000-0001',
    status: 'pending',
    paymentStatus: 'unpaid',
    total: 59.9,
    customerName: 'Иван Петров',
    customerEmail: 'ivan@example.com',
    customerPhone: '+359888123456',
    deliveryMethod: 'boxnow',
    shippingPrice: 3.5,
    orderDate: '2026-07-12T10:00:00.000Z',
    createdAt: '2026-07-12T10:00:00.000Z',
    updatedAt: '2026-07-12T10:00:00.000Z',
    items: [
      { product: 42, productTitle: 'Кутия', unitPrice: 20, quantity: 2, lineTotal: 40 },
      { product: 43, productTitle: 'Картичка', unitPrice: 9.95, quantity: 2, lineTotal: 19.9 },
    ],
    ...overrides,
  }) as unknown as Order

describe('mapOrderToKlaviyo', () => {
  it('maps identifiers, totals and currency', () => {
    const result = mapOrderToKlaviyo(baseOrder())
    expect(result.orderId).toBe('ORD-1700000000-0001')
    expect(result.value).toBe(59.9)
    expect(result.currency).toBe('EUR')
    expect(result.deliveryMethod).toBe('boxnow')
    expect(result.shippingTotal).toBe(3.5)
  })

  it('splits the customer name into first and last', () => {
    const { customer } = mapOrderToKlaviyo(baseOrder())
    expect(customer.email).toBe('ivan@example.com')
    expect(customer.firstName).toBe('Иван')
    expect(customer.lastName).toBe('Петров')
    expect(customer.phoneNumber).toBe('+359888123456')
  })

  it('preserves non-card payment statuses like needBankTransfer', () => {
    const result = mapOrderToKlaviyo(baseOrder({ paymentStatus: 'needBankTransfer' }))
    expect(result.paymentStatus).toBe('needBankTransfer')
  })

  it('uses order snapshot price/title for line items', () => {
    const result = mapOrderToKlaviyo(baseOrder())
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toMatchObject({
      productId: '42',
      title: 'Кутия',
      price: 20,
      quantity: 2,
      currency: 'EUR',
    })
  })

  it('enriches url/categories when the product relationship is populated', () => {
    const populated = baseOrder({
      items: [
        {
          product: { id: 42, slug: 'kutia', title: 'Кутия' } as unknown as Product,
          productTitle: 'Кутия',
          unitPrice: 20,
          quantity: 1,
          lineTotal: 20,
        },
      ],
    })
    const result = mapOrderToKlaviyo(populated)
    expect(result.items[0].url).toContain('/produkt/kutia')
  })

  it('falls back to numeric id when orderNumber is missing', () => {
    const result = mapOrderToKlaviyo(baseOrder({ orderNumber: null }))
    expect(result.orderId).toBe('100')
  })
})
