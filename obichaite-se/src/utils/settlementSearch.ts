/**
 * Търсене и подредба на населени места за куриерските dropdown-и при доставка до адрес.
 *
 * Двете изисквания, които този модул покрива:
 *  - областните градове имат абсолютен приоритет при търсене (напр. "Пловдив" → гр. Пловдив
 *    е първи, не след 50 села и офиса);
 *  - търсенето работи и на латиница ("plovdiv", "sofia").
 */

export type Settlement = {
  id: number
  /** Базовото име, по което се търси (без региона). */
  name: string
  /** Каквото се показва в списъка — с региона, за да се различават едноименните села. */
  label: string
  region: string | null
}

/**
 * 27-те областни центъра (28 области, но София е център на две от тях).
 * Фиксиран административен списък — не се извлича от куриерските данни, защото
 * там няма поле за област.
 */
export const BG_REGION_CENTERS: readonly string[] = [
  'Благоевград',
  'Бургас',
  'Варна',
  'Велико Търново',
  'Видин',
  'Враца',
  'Габрово',
  'Добрич',
  'Кърджали',
  'Кюстендил',
  'Ловеч',
  'Монтана',
  'Пазарджик',
  'Перник',
  'Плевен',
  'Пловдив',
  'Разград',
  'Русе',
  'Силистра',
  'Сливен',
  'Смолян',
  'София',
  'Стара Загора',
  'Търговище',
  'Хасково',
  'Шумен',
  'Ямбол',
]

/** Официалната транслитерация (Закон за транслитерацията): я→ya, ю→yu, ъ→a. */
const TRANSLIT_OFFICIAL: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
}

/** Разговорният вариант, който хората често пишат: Sofia, Iambol, Turnovo. */
const TRANSLIT_COMMON: Record<string, string> = {
  ...TRANSLIT_OFFICIAL,
  й: 'i',
  ъ: 'u',
  ю: 'iu',
  я: 'ia',
  х: 'kh',
}

const transliterate = (value: string, table: Record<string, string>) => {
  let result = ''
  for (const char of value) {
    result += table[char] ?? char
  }
  return result
}

/**
 * Свива повтарящите се букви: 'София' -> 'sofiia' (и->i, я->ia), а хората пишат 'Sofia'.
 * Прилага се само върху латинските форми, за да не пипаме кирилицата.
 */
const collapseRepeats = (value: string) =>
  value.replace(/([a-z])\1+/g, (_match, char: string) => char)

/** lowercase + trim + събиране на повтарящите се интервали. */
export const normalizeSearchValue = (value: string) =>
  value.toLocaleLowerCase('bg').trim().replace(/\s+/g, ' ')

type IndexedSettlement = {
  settlement: Settlement
  /** Всички форми, срещу които се сравнява заявката: кирилица + двата латински варианта. */
  haystacks: string[]
  isRegionCenter: boolean
}

export type SettlementIndex = {
  items: IndexedSettlement[]
  /** Списъкът при празна заявка: областните центрове азбучно, после всички останали. */
  defaultOrder: Settlement[]
}

const regionCenterKeys = new Set(BG_REGION_CENTERS.map((name) => normalizeSearchValue(name)))

/**
 * Само истинският областен град, не всяко село със същото име.
 *
 * В България има село Добрич в обл. Хасково и село Добрич в обл. Ямбол — те не
 * бива да получават приоритета на града. Областният център или няма посочена
 * област (Speedy не я добавя за градовете с офиси), или областта носи неговото
 * име ("Пловдив" в обл. Пловдив, "София" в обл. "София (столица)").
 */
export const isRegionCenterSettlement = (rawName: string, region: string | null) => {
  const name = normalizeSearchValue(rawName)
  if (!regionCenterKeys.has(name)) return false
  if (!region) return true

  const normalizedRegion = normalizeSearchValue(region)
  return normalizedRegion === name || normalizedRegion.startsWith(`${name} `)
}

const compareByName = (a: IndexedSettlement, b: IndexedSettlement) =>
  a.settlement.name.localeCompare(b.settlement.name, 'bg')

/**
 * Строи индекса веднъж за даден списък (транслитерацията на ~5000 имена не бива да
 * се случва на всеки натиснат клавиш). Извиква се от `useMemo` по списъка.
 */
export const buildSettlementIndex = (items: Settlement[]): SettlementIndex => {
  const indexed = items.map((settlement): IndexedSettlement => {
    const cyrillic = normalizeSearchValue(settlement.name)

    // Кирилицата плюс двете транслитерации и свитите им форми, за да хванем
    // 'Sofiya', 'Sofiia' и 'Sofia' с една и съща заявка.
    const official = transliterate(cyrillic, TRANSLIT_OFFICIAL)
    const common = transliterate(cyrillic, TRANSLIT_COMMON)
    const haystacks = Array.from(
      new Set([cyrillic, official, common, collapseRepeats(official), collapseRepeats(common)]),
    )

    return {
      settlement,
      haystacks,
      isRegionCenter: isRegionCenterSettlement(settlement.name, settlement.region),
    }
  })

  // Подредбата при празна заявка се смята веднъж — dropdown-ът я иска при всяко
  // отваряне и при изчистване на полето.
  const regionCenters = indexed.filter((item) => item.isRegionCenter).sort(compareByName)
  const rest = indexed.filter((item) => !item.isRegionCenter).sort(compareByName)

  return {
    items: indexed,
    defaultOrder: [...regionCenters, ...rest].map((item) => item.settlement),
  }
}

/** Не е намерено — подредбата отговаря на таблицата в `searchSettlements`. */
const NO_MATCH = 99

const scoreHaystack = (haystack: string, query: string, isRegionCenter: boolean) => {
  if (haystack === query) return isRegionCenter ? 0 : 2
  if (haystack.startsWith(query)) return isRegionCenter ? 1 : 3
  // Prefix на дума: "загора" → "стара загора".
  if (haystack.includes(` ${query}`)) return 4
  if (haystack.includes(query)) return 5
  return NO_MATCH
}

/**
 * Резултатите, подредени по:
 *   0 точно съвпадение + областен център   3 prefix
 *   1 prefix + областен център             4 prefix на дума
 *   2 точно съвпадение                     5 substring
 * В рамките на едно ниво: областните центрове първи, после азбучно.
 *
 * При празна заявка списъкът започва с 27-те областни града.
 */
export const searchSettlements = (index: SettlementIndex, rawQuery: string): Settlement[] => {
  const query = normalizeSearchValue(rawQuery)

  if (!query) return index.defaultOrder

  const matches: { item: IndexedSettlement; score: number }[] = []

  for (const item of index.items) {
    let best = NO_MATCH
    for (const haystack of item.haystacks) {
      const score = scoreHaystack(haystack, query, item.isRegionCenter)
      if (score < best) best = score
      if (best === 0) break
    }
    if (best !== NO_MATCH) matches.push({ item, score: best })
  }

  matches.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score
    if (a.item.isRegionCenter !== b.item.isRegionCenter) return a.item.isRegionCenter ? -1 : 1
    return compareByName(a.item, b.item)
  })

  return matches.map((match) => match.item.settlement)
}
