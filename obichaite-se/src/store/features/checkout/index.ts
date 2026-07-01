import { Product } from '@/payload-types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ExtendedProduct = Product & { orderQuantity: number }

export type DeliveryKind = 'office' | 'address' | 'automat'

export interface CheckoutInitialState {
  shoppingCardOpen: boolean
  products: ExtendedProduct[]
  tryToMakePayment: boolean
  needToMakeOrder: boolean
  userHaveDiscount: boolean
  boxNowShipmentPrice: number
  econtOfficePrice: number
  econtAddressPrice: number
  speedyOfficePrice: number
  speedyAddressPrice: number
  courier: 'econt' | 'speedy' | 'boxnow'
  deliveryKind: DeliveryKind
}

const checkoutInitialState: CheckoutInitialState = {
  shoppingCardOpen: false,
  products: [],
  tryToMakePayment: false,
  needToMakeOrder: false,
  userHaveDiscount: false,
  boxNowShipmentPrice: 0,
  econtOfficePrice: 0,
  econtAddressPrice: 0,
  speedyOfficePrice: 0,
  speedyAddressPrice: 0,
  courier: 'boxnow',
  deliveryKind: 'automat',
}

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: checkoutInitialState,
  reducers: {
    setShoppingCardOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.shoppingCardOpen = payload
    },
    setProducts: (state, { payload }: PayloadAction<ExtendedProduct[]>) => {
      state.products = payload
    },
    clearProducts: (state) => {
      state.products = []
      // Reset the selected delivery option so an emptied cart doesn't keep a
      // previously chosen courier's price in the total (e.g. header after checkout).
      state.courier = checkoutInitialState.courier
      state.deliveryKind = checkoutInitialState.deliveryKind
    },
    addProductToShoppingCart: (state, { payload }: PayloadAction<ExtendedProduct>) => {
      if (state.products.find((product) => product.id === payload.id)) {
        state.products = state.products.map((product) => {
          if (product.id === payload.id) product.orderQuantity += payload.orderQuantity
          return product
        })
        return
      }
      state.products.push(payload)
    },
    removeProductFromShoppingCart: (state, { payload }: PayloadAction<Product>) => {
      if (!state.products.find((product) => product.id === payload.id)) return
      state.products = state.products.filter((product) => product.id !== payload.id)
    },
    addOrderQuantity: (state, { payload }: PayloadAction<{ id: number }>) => {
      state.products = state.products.map((product) => {
        if (product.id === payload.id) product.orderQuantity += 1
        return product
      })
    },
    removeOrderQuantity: (state, { payload }: PayloadAction<{ id: number }>) => {
      state.products = state.products.map((product) => {
        if (product.id === payload.id) product.orderQuantity -= 1
        return product
      })
    },
    setTryToMakePayment: (state, { payload }: PayloadAction<boolean>) => {
      state.tryToMakePayment = payload
    },
    setNeedToMakeOrder: (state, { payload }: PayloadAction<boolean>) => {
      state.needToMakeOrder = payload
    },
    setUserHaveDiscount: (state, { payload }: PayloadAction<boolean>) => {
      state.userHaveDiscount = payload
    },
    setBoxNowShipmentPrice: (state, { payload }: PayloadAction<number>) => {
      state.boxNowShipmentPrice = payload
    },
    setEcontPrices: (
      state,
      { payload }: PayloadAction<{ office: number; address: number }>,
    ) => {
      state.econtOfficePrice = payload.office
      state.econtAddressPrice = payload.address
    },
    setSpeedyPrices: (
      state,
      { payload }: PayloadAction<{ office: number; address: number }>,
    ) => {
      state.speedyOfficePrice = payload.office
      state.speedyAddressPrice = payload.address
    },
    setCourier: (state, { payload }: PayloadAction<'econt' | 'speedy' | 'boxnow'>) => {
      state.courier = payload
    },
    setDeliveryKind: (state, { payload }: PayloadAction<DeliveryKind>) => {
      state.deliveryKind = payload
    },
  },
})

/**
 * Returns the active shipping price for the currently selected courier and
 * delivery kind. The free-shipping threshold is applied elsewhere.
 */
export const selectShipmentPrice = (checkout: CheckoutInitialState): number => {
  const { courier, deliveryKind } = checkout

  if (courier === 'boxnow') return checkout.boxNowShipmentPrice
  if (courier === 'econt') {
    return deliveryKind === 'address' ? checkout.econtAddressPrice : checkout.econtOfficePrice
  }
  if (courier === 'speedy') {
    return deliveryKind === 'address' ? checkout.speedyAddressPrice : checkout.speedyOfficePrice
  }
  return 0
}

export const {
  setShoppingCardOpen,
  setProducts,
  clearProducts,
  addProductToShoppingCart,
  removeProductFromShoppingCart,
  addOrderQuantity,
  removeOrderQuantity,
  setTryToMakePayment,
  setNeedToMakeOrder,
  setUserHaveDiscount,
  setBoxNowShipmentPrice,
  setEcontPrices,
  setSpeedyPrices,
  setCourier,
  setDeliveryKind,
} = checkoutSlice.actions

export default checkoutSlice.reducer
