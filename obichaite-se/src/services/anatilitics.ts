const isBrowser = typeof window !== 'undefined'

export const ADD_TO_CART = (
  currency: string,
  value: string,
  items: {
    item_id: number
    item_name: string
    price: number
    quantity: number
  }[],
) => {
  if (!isBrowser) return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
      currency: currency,
      value: value,
      items: items,
    },
  })
}

export const PURCHASE = (
  currency: string,
  value: string,
  order_id: string,
  items: {
    item_id: string
    item_name: string
    price: number
    quantity: number
  }[],
) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: order_id,
      currency,
      value,
      items,
    },
  })
}

export const VIEW_CONTENT = (
  currency: string,
  value: string,
  items: {
    item_id: string
    item_name: string
    price: number
    quantity: number
  }[],
) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'view_content',
    ecommerce: {
      currency,
      value,
      items,
    },
  })
}

export const INITIATE_CHECKOUT = (
  currency: string,
  value: string,
  items: {
    item_id: string
    item_name: string
    price: number
    quantity: number
  }[],
) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'initiate_checkout',
    ecommerce: {
      currency,
      value,
      items,
    },
  })
}
