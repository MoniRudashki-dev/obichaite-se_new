import { isRegionCenterSettlement, type Settlement } from '@/utils/settlementSearch'
import type { EcontSettlementRaw } from '../types'

/**
 * Мапва населените места на Econt към формата на dropdown-а.
 *
 * Етикетът трябва да е уникален, защото по него се разпознава избраното в
 * чекаута. Уточнява се на стъпки, само когато е нужно:
 *
 *   Пловдив                    – уникално име
 *   Косово (Благоевград)       – четири различни села "Косово" в страната
 *   Тополовец (Видин, 3828)    – две села "Тополовец" в една и съща област
 *
 * Областните градове винаги остават с чисто име — никой не търси "Добрич (Добрич)".
 */
export const mapEcontSettlements = (cities: EcontSettlementRaw[]): Settlement[] => {
  const countBy = <T>(items: T[], key: (item: T) => string) => {
    const counts = new Map<string, number>()
    for (const item of items) {
      const k = key(item)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    return counts
  }

  const labelKey = (label: string) => label.toLocaleLowerCase('bg')

  const nameCounts = countBy(cities, (city) => labelKey(city.name))

  // Стъпка 1: добавяме областта на съименните села.
  const withRegion = cities.map((city) => {
    const isDuplicated = (nameCounts.get(labelKey(city.name)) ?? 0) > 1
    const needsRegion =
      isDuplicated && !!city.regionName && !isRegionCenterSettlement(city.name, city.regionName)

    return {
      city,
      label: needsRegion ? `${city.name} (${city.regionName})` : city.name,
    }
  })

  // Стъпка 2: там, където и областта не стига (две села с едно име в една област),
  // разделяме по пощенски код.
  const labelCounts = countBy(withRegion, (item) => labelKey(item.label))

  const withPostCode = (label: string, postCode: string) =>
    // "Тополовец (Видин)" → "Тополовец (Видин, 3828)", а голо име → "Име (3828)".
    label.endsWith(')') ? `${label.slice(0, -1)}, ${postCode})` : `${label} (${postCode})`

  return withRegion.map(({ city, label }): Settlement => {
    const stillAmbiguous = (labelCounts.get(labelKey(label)) ?? 0) > 1

    return {
      id: city.id,
      name: city.name,
      label: stillAmbiguous && city.postCode ? withPostCode(label, city.postCode) : label,
      region: city.regionName,
    }
  })
}
