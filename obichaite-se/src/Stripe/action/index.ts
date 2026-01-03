'use server'

import { ExtendedProduct } from '@/store/features/checkout'
import { stripe } from '..'

function calculateTotalAmount(items: ExtendedProduct[], discount: number = 0): number {
  let total = 0

  for (const item of items) {
    if (item.orderQuantity <= 0) continue

    const unitPrice = item?.promoPrice ? item.promoPrice : item.price || 0

    total += unitPrice * item.orderQuantity
  }

  if (total <= 0) {
    return 0
  }

  if (discount > 0) {
    total *= discount
  }

  total = Math.round(total * 100)

  return total
}

const BGN_PER_EUR = 1.95583

function bgnMinorToEurMinor(bgnMinor: number) {
  return Math.round(bgnMinor / BGN_PER_EUR)
}

export async function createPaymentIntentAction(products: ExtendedProduct[], discount: number = 0) {
  const amount = calculateTotalAmount(products, discount)
  const amountEUR = bgnMinorToEurMinor(amount)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountEUR,
    currency: 'eur',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      products: JSON.stringify(
        products.map(({ title, orderQuantity }) => ({ title, orderQuantity })),
      ),
      amount_bgn_minor: String((amount / 100).toFixed(2)) + ' BGN',
      fx_rate_bgn_per_eur: String(BGN_PER_EUR),
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
  }
}
