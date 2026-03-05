import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Product } from '@/payload-types'

const BGN_PER_EUR = 1.95583
const round2 = (n: number) => Math.round(n * 100) / 100

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

console.log('SCRIPT..')

async function main() {
  const payload = await getPayload({ config: configPromise })

  const limit = 100
  let page = 1
  let updated = 0

  const failed = []

  console.log('script running', page, updated)

  while (true) {
    const res = await payload.find({
      collection: 'product',
      depth: 0,
      limit,
      page,
      where: {
        and: [{ _status: { equals: 'published' } }],
      },
    })

    if (!res.docs.length) break

    for (const doc of res.docs as Product[]) {
      const data: Partial<Product> = {}

      // publishedAt backfill
      if (!doc.publishedAt) {
        data.publishedAt = doc.createdAt ?? new Date().toISOString()
        console.log('publishedAt backfill', doc.id)
      }

      // EUR backfill (only if fields exist in schema; safe to set anyway)
      if (!isNum(doc.priceInEuro) && isNum(doc.price)) {
        data.priceInEuro = round2(doc.price / BGN_PER_EUR)
      }
      if (!isNum(doc.promoPriceInEuro) && isNum(doc.promoPrice) && doc.promoPrice > 0) {
        data.promoPriceInEuro = round2(doc.promoPrice / BGN_PER_EUR)
      }

      if (Object.keys(data).length) {
        try {
          await payload.update({
            collection: 'product',
            id: doc.id,
            data,
            overrideAccess: true,
          })
          updated += 1
        } catch (err: any) {
          console.error('FAILED product:', doc.id, doc.title)
          // show the field path Payload complains about
          const errors = err?.data?.errors ?? err?.cause?.errors
          if (errors) console.error(JSON.stringify(errors, null, 2))
          failed.push(doc.id)
        }
      }
    }

    if (!res.hasNextPage) break
    page += 1
  }

  if (failed.length) console.log('FAILED', failed.length, failed)

  console.log(`Done. Updated: ${updated}`)
}

await main()
