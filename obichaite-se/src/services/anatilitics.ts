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
