import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Media } from '@/payload-types'

export const runtime = 'nodejs'

const removeCommasAndNewlines = (val?: string | null): string => {
  if (!val) return ''
  return String(val)
    .replace(/\r?\n|\r/g, ' ')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const products = await payload.find({
    collection: 'product',
    depth: 3,
    limit: 1000,
    where: {
      publishedAt: {
        not_equals: null,
      },
    },
  })

  const mapped = products.docs.map((product) => ({
    id: product.id,
    title: removeCommasAndNewlines(product.title).slice(0, 65),
    description: removeCommasAndNewlines(product.shortDescription.replaceAll(',', '')),
    availability: 'in stock',
    condition: 'new',
    price: `${product.priceInEuro} EUR`,
    link: `https://www.obichaite-se.com/produkt/${product.slug}`,
    image_link: (product.mediaArray?.[0].file as Media)?.url,
    brand: 'obichaite-se',
    google_product_category: '',
    fb_product_category: '',
    quantity_to_sell_on_facebook: product.quantity,
    sale_price: !!product.promoPriceInEuro ? `${product.promoPriceInEuro} EUR` : '',
    sale_price_effective_date: '',
    item_group_id: '',
    gender: '',
    color: '',
    size: '',
    age_group: '',
    material: '',
    pattern: '',
    shipping: '',
    shipping_weight: '',
    video_url: '',
    video_tag: '',
    gtin: product?.sku || '',
    product_tags1: '',
    product_tags2: '',
    style: '',
  }))

  const headers = Object.keys(mapped[0])
  const contentLines = mapped.map((product) => Object.values(product).join(','))
  const csv = [headers.join(','), ...contentLines].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="productsExport.csv"',
    },
  })
}
