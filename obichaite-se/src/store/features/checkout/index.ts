import { Product } from '@/payload-types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ExtendedProduct = Product & { orderQuantity: number }

export interface CheckoutInitialState {
  shoppingCardOpen: boolean
  products: ExtendedProduct[]
  tryToMakePayment: boolean
  needToMakeOrder: boolean
  userHaveDiscount: boolean
  boxNowShipmentPrice: number
  courier: 'econt' | 'speedy' | 'boxnow'
}

const checkoutInitialState: CheckoutInitialState = {
  shoppingCardOpen: false,
  products: [],
  tryToMakePayment: false,
  needToMakeOrder: false,
  userHaveDiscount: false,
  boxNowShipmentPrice: 0,
  courier: 'econt',
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
    setCourier: (state, { payload }: PayloadAction<'econt' | 'speedy' | 'boxnow'>) => {
      state.courier = payload
    },
  },
})

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
  setCourier,
} = checkoutSlice.actions

export default checkoutSlice.reducer
