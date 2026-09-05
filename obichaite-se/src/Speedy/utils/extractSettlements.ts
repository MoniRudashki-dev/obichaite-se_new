import type { Settlement } from '@/utils/settlementSearch'
import type { SpeedySite } from '../types'

/**
 * `speedy-cities.json` е плосък списък от офиси, автомати и само онези населени места,
 * които нямат офис. Градовете с офиси липсват като самостоятелни записи — в него няма
 * ред "ПЛОВДИВ", а 87 реда "ПЛОВДИВ - <офис>".
 *
 * За доставка до адрес ни трябват само населените места, затова ги възстановяваме от
 * имената. Работи, защото Speedy разделя града от офиса с тире, обградено с интервали:
 *
 *   "ПЛОВДИВ - КОМАТЕВО"          → ПЛОВДИВ
 *   "ПЛОВДИВ - МЕТРО 1 (АВТОМАТ)" → ПЛОВДИВ
 *   "КЪРНАЛОВО (АВТОМАТ)"         → КЪРНАЛОВО
 *   "АБЛАНИЦА (БЛАГОЕВГРАД)"      → АБЛАНИЦА, област БЛАГОЕВГРАД
 *   "БАЛША (СОФИЯ (СТОЛИЦА))"     → БАЛША, област СОФИЯ (СТОЛИЦА)
 *
 * Регионът в скоби идва само при населените места без офис, но точно там е нужен —
 * едноименните села иначе са неразличими.
 */

// Speedy ползва и обикновено тире, и en dash, винаги обградени с интервали.
const OFFICE_SUFFIX = /\s[-–]\s/
// Последната група в скоби — `(.*)` е ненаситено отдясно, за да хване и вложените
// скоби на "СОФИЯ (СТОЛИЦА)".
const TRAILING_PARENS = /^(.*?)\s*\((.*)\)$/

export const extractSpeedySettlements = (sites: SpeedySite[]): Settlement[] => {
  const byKey = new Map<string, Settlement>()

  for (const site of sites) {
    const raw = site.name?.trim()
    if (!raw) continue

    const withoutOffice = raw.split(OFFICE_SUFFIX)[0].trim()
    if (!withoutOffice) continue

    const parsed = withoutOffice.match(TRAILING_PARENS)

    let name = withoutOffice
    let region: string | null = null

    if (parsed) {
      name = parsed[1].trim()
      const captured = parsed[2].trim()
      // "(АВТОМАТ)" е маркер за тип точка, не за област.
      region = /АВТОМАТ/i.test(captured) ? null : captured
    }

    if (!name) continue

    const key = region ? `${name}|${region}` : name
    if (byKey.has(key)) continue

    byKey.set(key, {
      id: site.id,
      name,
      label: region ? `${name} (${region})` : name,
      region,
    })
  }

  return Array.from(byKey.values())
}
