// src/app/_actions/econt.ts
'use server'

import 'server-only'
import {
  EcontCitiesCache,
  EcontCitiesResponseRaw,
  EcontCity,
  EcontOffice,
  EcontOfficesResponseRaw,
} from '../types'
import { unstable_cache } from 'next/cache'

import fs from 'node:fs/promises'
import path from 'node:path'

const ECONT_CITIES_JSON_PATH = path.join(process.cwd(), 'econt-cities.json')

const { ECONT_BASE_URL, ECONT_USERNAME, ECONT_PASSWORD } = process.env

if (!ECONT_BASE_URL || !ECONT_USERNAME || !ECONT_PASSWORD) {
  throw new Error('Missing Econt env variables')
}

function buildEcontUrl(path: string) {
  const base = ECONT_BASE_URL!.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  return `${base}/${cleanPath}`
}

async function persistEcontCities(cities: any) {
  try {
    await fs.writeFile(ECONT_CITIES_JSON_PATH, JSON.stringify(cities, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to write Econt cities JSON:', error)
  }
}

async function callEcont<T>(path: string, body: unknown): Promise<T> {
  const url = buildEcontUrl(path)

  const auth = Buffer.from(`${ECONT_USERNAME}:${ECONT_PASSWORD}`).toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Econt error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export async function getEcontCitiesRawAction(
  countryCode = process.env.ECONT_COUNTRY_CODE ?? 'BGR',
) {
  return callEcont<EcontCitiesResponseRaw>('Nomenclatures/NomenclaturesService.getCities.json', {
    countryCode,
  })
}

export async function getEcontOfficesRawAction(cityId: number) {
  if (!cityId) {
    throw new Error('cityId is required')
  }

  return callEcont<EcontOfficesResponseRaw>('Nomenclatures/NomenclaturesService.getOffices.json', {
    cityID: cityId,
  })
}

let econtCitiesCache: EcontCitiesCache = null

const getEcontOfficesCached = unstable_cache(
  async (cityId: number): Promise<EcontOffice[]> => {
    const raw = await callEcont<EcontOfficesResponseRaw>(
      'Nomenclatures/NomenclaturesService.getOffices.json',
      { cityID: cityId },
    )

    return (raw?.offices ?? []).map((o): EcontOffice => {
      const workTime =
        o.workBegin || o.workEnd ? `${o.workBegin ?? ''} - ${o.workEnd ?? ''}`.trim() : null

      return {
        id: o.id,
        code: o.code,
        name: o.name,
        address: o.address ?? null,
        cityId: o.cityID,
        cityName: o.cityName ?? null,
        workTime,
        location: {
          lat: o.latitude ?? null,
          lng: o.longitude ?? null,
        },
      }
    })
  },
  ['econt-offices'],
  { revalidate: 60 * 60 * 24 },
)

export async function getEcontCitiesAction(
  countryCode = process.env.ECONT_COUNTRY_CODE ?? 'BGR',
): Promise<EcontCity[]> {
  const now = Date.now()

  if (econtCitiesCache && econtCitiesCache.expiresAt > now) {
    return econtCitiesCache.value
  }

  const raw = await callEcont<EcontCitiesResponseRaw>(
    'Nomenclatures/NomenclaturesService.getCities.json',
    { countryCode },
  )

  const cities = (raw?.cities ?? [])
    .map((c): any => ({
      id: c.id,
      name: c.name ?? '',
      postCode: c.postCode ?? null,
      regionName: c.regionName ?? null,
    }))
    .filter((c) => c.name.trim().length > 0)

  econtCitiesCache = {
    value: cities,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24h
  }

  //I need to use groupBy regionName
  // const regionNames = cities.map((c) => c.regionName)
  // const regionNameSet = new Set(regionNames)
  // const regionNamesArray = Array.from(regionNameSet)

  // const groupedByRegionName = regionNamesArray.map((regionName) => {
  //   return {
  //     regionName,
  //     cities: cities.filter(
  //       (c) => c.regionName?.trim().toLocaleLowerCase() === regionName?.trim().toLocaleLowerCase(),
  //     ),
  //   }
  // })
  // persistEcontCities(groupedByRegionName).catch(() => {})

  const testSlice = cities

  const allOffices = []

  //I need to get every city offices
  for (const city of testSlice) {
    try {
      const offices = await getEcontOfficesAction(city.id)

      if (!offices.length) {
        allOffices.push({
          id: city.id,
          name: city.name,
        })
        continue
      }

      allOffices.push(
        ...offices.map((o) => {
          return {
            id: o.id,
            name: `${o.name}`,
          }
        }),
      )

      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error(error)
    }
  }

  persistEcontCities(allOffices).catch(() => {})

  return cities
}

export async function getEcontOfficesAction(cityId: number) {
  if (!cityId) throw new Error('cityId is required')
  return getEcontOfficesCached(cityId)
}
