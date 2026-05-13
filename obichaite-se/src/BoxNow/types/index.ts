export interface BoxnowDestinationRaw {
  id: string
  type: string
  image: string
  lat: string
  lng: string
  region: string
  title: string
  name: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  country: string
  note: string
  expectedDeliveryTime: string
  isActive: boolean
}

export interface BoxnowLocker {
  id: string
  name: string
}
