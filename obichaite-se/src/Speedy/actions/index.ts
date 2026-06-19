'use server'

import 'server-only'
import { unstable_cache } from 'next/cache'
import { SpeedyOffice, SpeedyOfficeRaw, SpeedySite } from '../types'

import fs from 'node:fs/promises'
import path from 'node:path'

const ECONT_CITIES_JSON_PATH = path.join(process.cwd(), 'speedy-cities.json')

const { SPEEDY_BASE_URL, SPEEDY_USERNAME, SPEEDY_PASSWORD, SPEEDY_LANGUAGE } = process.env

if (!SPEEDY_BASE_URL || !SPEEDY_USERNAME || !SPEEDY_PASSWORD) {
  throw new Error('Missing Speedy env variables')
}

async function persistEcontCities(cities: SpeedySite[]) {
  try {
    await fs.writeFile(ECONT_CITIES_JSON_PATH, JSON.stringify(cities, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to write Econt cities JSON:', error)
  }
}

function buildSpeedyUrl(path: string) {
  const base = SPEEDY_BASE_URL!.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  return `${base}/${cleanPath}`
}

export async function callSpeedy<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const url = buildSpeedyUrl(path)

  const payload = {
    userName: SPEEDY_USERNAME,
    password: SPEEDY_PASSWORD,
    language: SPEEDY_LANGUAGE ?? 'BG',
    ...body,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Speedy error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}
const getAllSpeedySitesCached = unstable_cache(
  async (): Promise<SpeedySite[]> => {
    const url = buildSpeedyUrl('location/site/csv/100') // 100 = BG

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        userName: SPEEDY_USERNAME,
        password: SPEEDY_PASSWORD,
        language: SPEEDY_LANGUAGE ?? 'BG',
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Speedy CSV error ${res.status}: ${text}`)
    }

    const csv = await res.text()

    const lines = csv
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    // първият ред е header → пропускаме го
    const [, ...dataLines] = lines

    const sites: SpeedySite[] = dataLines.map((line) => {
      const cols = line.split(',') // тук може да донастроиш според реалния формат

      const id = cols[0]
      const name = cols[5]
      const region = cols[9]

      return {
        id: Number(id),
        name: `${name} (${region})`,
      }
    })

    const sorted = sites.sort((a, b) => {
      //a.name.localeCompare(b.name)
      const aName = a.name.split('(')[1].trim()
      const bName = b.name.split('(')[1].trim()
      return aName.localeCompare(bName)
    })
    const allOffices = []
    // let count = 0
    const testSlice = sorted
    for (const city of testSlice) {
      try {
        const offices = await getSpeedyOfficesCached(city.id)

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

    return sites
  },
  ['speedy-sites-all'],
  { revalidate: 60 * 60 * 24 }, // 24h
)

export async function getAllSpeedySitesAction() {
  return getAllSpeedySitesCached()
}

const getSpeedyOfficesCached = unstable_cache(
  async (siteId: number): Promise<SpeedyOffice[]> => {
    const rawOffices = await callSpeedy<SpeedyOfficeRaw[]>('location/office', { siteId })

    const resources = 'offices' in rawOffices ? rawOffices.offices : []

    return (resources as SpeedyOfficeRaw[]).map((o): SpeedyOffice => {
      const workTime =
        o.workTimeFrom || o.workTimeTo
          ? `${o.workTimeFrom ?? ''} - ${o.workTimeTo ?? ''}`.trim()
          : null

      return {
        id: o.id,
        siteId: o.siteId,
        name: o.name,
        address: o.address,
        workTime,
        location: {
          lat: o.latitude ?? null,
          lng: o.longitude ?? null,
        },
      }
    })
  },
  ['speedy-offices'],
  {
    revalidate: 60 * 60 * 6,
  },
)

export async function getSpeedyOfficesAction(siteId: number): Promise<SpeedyOffice[]> {
  if (!siteId) throw new Error('siteId is required')
  return getSpeedyOfficesCached(siteId)
}
