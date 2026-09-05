/**
 * Генератор на `src/Econt/json/econt-settlements.json`.
 *
 * Населените места на Econt се сменят рядко, затова ги пазим статично и чекаутът
 * не прави мрежова заявка. Пуска се ръчно, когато номенклатурата трябва да се
 * опресни: `pnpm econt:settlements`.
 *
 * Не се вика от приложението — само от `scripts/econt-settlements.ts`.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

import { callEcont } from '../utils/econtClient'
import { mapEcontSettlements } from '../utils/mapSettlements'
import type { EcontCitiesResponseRaw, EcontSettlementRaw } from '../types'
import type { Settlement } from '@/utils/settlementSearch'

export const ECONT_SETTLEMENTS_JSON_PATH = path.join(
  process.cwd(),
  'src',
  'Econt',
  'json',
  'econt-settlements.json',
)

/**
 * Записи в номенклатурата, които не са населено място.
 *
 * Умишлено е тесен списък. Останалите записи без област — местности, вилни зони
 * и къмпинги (Боровец, Мальовица, Цигов чарк, Златните мостове) — са реални
 * адреси за доставка и трябва да останат.
 */
const NOT_A_SETTLEMENT = [
  /еконтомат/i, // "Свищов еконтомат" — офис, попаднал в списъка с градове
  /^мобилен\s/i, // "Мобилен РЦ", "Мобилен РЦ (Ружинци)" — подвижни центрове
  /^(тест|test)$/i, // тестов запис от demo номенклатурата
]

export type GenerateSettlementsResult = {
  total: number
  withRegion: number
  outputPath: string
}

export const generateEcontSettlements = async (
  countryCode = process.env.ECONT_COUNTRY_CODE ?? 'BGR',
): Promise<GenerateSettlementsResult> => {
  const raw = await callEcont<EcontCitiesResponseRaw>(
    'Nomenclatures/NomenclaturesService.getCities.json',
    { countryCode },
  )

  const cities: EcontSettlementRaw[] = (raw?.cities ?? [])
    .map((c) => ({
      id: c.id,
      name: c.name?.trim() ?? '',
      postCode: c.postCode ?? null,
      regionName: c.regionName?.trim() || null,
    }))
    .filter((c) => c.name.length > 0)
    .filter((c) => !NOT_A_SETTLEMENT.some((pattern) => pattern.test(c.name)))

  if (cities.length === 0) {
    // Празен отговор значи счупени креденшъли или променено API — по-добре да
    // гръмне, отколкото да презапишем работещия JSON с празен масив.
    throw new Error('Econt returned no cities — refusing to overwrite the existing JSON')
  }

  const settlements: Settlement[] = mapEcontSettlements(cities).sort((a, b) =>
    a.label.localeCompare(b.label, 'bg'),
  )

  await fs.writeFile(
    ECONT_SETTLEMENTS_JSON_PATH,
    `${JSON.stringify(settlements, null, 2)}\n`,
    'utf8',
  )

  return {
    total: settlements.length,
    withRegion: settlements.filter((s) => s.region).length,
    outputPath: ECONT_SETTLEMENTS_JSON_PATH,
  }
}
