import type { CollectionBeforeValidateHook } from 'payload'

const BGN_PER_EUR = 1.95583
const round2 = (n: number) => Math.round(n * 100) / 100
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

export const syncEuroPrice: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data
  if (data.category === 6) return data

  // price
  if (!isNum(data.priceInEuro) && isNum(data.price)) {
    data.priceInEuro = round2(data.price / BGN_PER_EUR)
  }
  if (isNum(data.priceInEuro)) {
    data.price = round2(data.priceInEuro * BGN_PER_EUR)
  }

  // promoPrice
  if (data.promoPrice === 0) {
    data.promoPriceInEuro = 0

    return data
  }
  if (!isNum(data.promoPriceInEuro) && isNum(data.promoPrice)) {
    data.promoPriceInEuro = round2(data.promoPrice / BGN_PER_EUR)
  }
  if (isNum(data.promoPriceInEuro)) {
    data.promoPrice = round2(data.promoPriceInEuro * BGN_PER_EUR)
  }

  return data
}
