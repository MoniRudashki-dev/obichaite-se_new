import type { Product } from '@/payload-types'

function shuffle(array: Product[]) {
  // return array
  const shuffled = array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  return shuffled
}

export default shuffle
