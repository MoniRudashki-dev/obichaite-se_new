export interface SpeedySiteRaw {
  id: number
  type: string // TOWN, VILLAGE и т.н.
  name: string
  nameEn?: string
  postCode?: string
  municipality?: string
  region?: string
  countryId?: number
  countryName?: string
}

export interface SpeedyOfficeRaw {
  id: number
  siteId: number
  name: string
  address: string
  workTimeFrom?: string
  workTimeTo?: string
  latitude?: number
  longitude?: number
  // има още полета, но не ни трябват за избор
}

export interface SpeedySite {
  id: number
  name: string
}

export interface SpeedyOffice {
  id: number
  siteId: number
  name: string
  address: string
  workTime: string | null
  location: {
    lat: number | null
    lng: number | null
  }
}
