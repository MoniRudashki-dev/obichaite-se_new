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
    event: 'purchase',
    ecommerce: {
      currency: currency,
      value: value,
      items: items,
    },
  })
}

// export const CONTENT_VIEW = (
//   currency: string,
//   value: string,
//   items: {
//     item_id: number
//     item_name: string
//     price: number
//   }
// ) => {
//   if (!isBrowser) return

//   window.dataLayer = window.dataLayer || []
//   window.dataLayer.push({
//     event: 'content_view',
//     ecommerce: {
//       currency: currency,
//       value: value,
//       items: [items],
//     },
//   })
// }
