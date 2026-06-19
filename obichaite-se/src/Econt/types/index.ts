export interface EcontCityRaw {
  id: number
  idZone?: number
  countryCode?: string
  name?: string
  nameEn?: string
  postCode?: string
  regionName?: string
  regionCode?: string
  municipalityName?: string
  municipalityCode?: string
  // има още полета, но не са ни критични за избора
}

export interface EcontOfficeRaw {
  id: number
  code: string
  name: string
  nameEn?: string
  cityID: number
  cityName?: string
  address?: string
  addressEn?: string
  workBegin?: string
  workEnd?: string
  latitude?: number
  longitude?: number
  isMPS?: boolean
  // пак – съкращаваме до нужните за UI
}

export interface EcontCitiesResponseRaw {
  cities: EcontCityRaw[]
}

export interface EcontOfficesResponseRaw {
  offices: EcontOfficeRaw[]
}

export interface EcontCity {
  id: number
  name: string
}

export interface EcontOffice {
  id: number
  code: string
  name: string
  address: string | null
  cityId: number
  cityName: string | null
  workTime: string | null
  location: {
    lat: number | null
    lng: number | null
  }
}

export type EcontCitiesCache = {
  value: EcontCity[]
  expiresAt: number
} | null
