/**
 * Опреснява статичния списък с населени места на Econt.
 *
 * Употреба:
 *   pnpm econt:settlements
 *
 * Записва `src/Econt/json/econt-settlements.json`, който чекаутът import-ва.
 * Комитни резултата.
 */

import { generateEcontSettlements } from '@/Econt/jobs/generate-settlements'

const result = await generateEcontSettlements()

// eslint-disable-next-line no-console
console.log('[econt:settlements]', result)

process.exit(0)
