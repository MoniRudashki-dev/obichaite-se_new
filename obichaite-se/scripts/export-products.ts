import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { Category, Media, SubCategory } from '@/payload-types'

const payload = await getPayload({ config })

const outDir = path.resolve(process.cwd(), 'exports')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const exportProducts = async () => {
  const products = await payload.find({
    collection: 'product',
    depth: 3,
    limit: 1000,
  })

  const mapped = products.docs.map((product) => {
    return {
      id: product.id,
      title: product.title,
      description: product.shortDescription,
      link: `https://www.obichaite-se.com/produkt/${product.slug}`,
      image_link: (product.mediaArray?.[0].file as Media)?.url,
      availability: product.quantity,
      price: !!product?.priceRange ? `${product.priceRange} BGN` : `${product.price} BGN`,
      brand: '',
      condition: 'new',
      sale_price: !!product.promoPrice ? `${product.promoPrice} BGN` : '',
      currency: '',
      category: (product.category as Category).title,
      additional_image_link: (product.mediaArray?.[1]?.file as Media)?.url || '',
      product_type: (product.subCategory as SubCategory).title,
    }
  })
  // write to csv file
  console.log('mapped->', mapped)

  const csv = mapped.map((product) => Object.values(product).join(',')).join('\n')
  fs.writeFileSync(path.join(outDir, 'productsExport.csv'), csv)
}

await exportProducts()

// id – уникален идентификатор на продукта (напр. артикулен номер)

// title / name – име на продукта
// description – описание на продукта
// link / url – линк към продукта в магазина
// image_link – линк към основната снимка на продукта
// availability – наличност (in stock / out of stock / preorder)
// price – цена с валута (напр. 49.99 BGN)
// brand – марка на продукта ??
// condition – състояние (new / refurbished / used)
// sale_price – ако продуктът е на намаление
// currency – валута (ако не е вградено в полето price)
// category / google_product_category – категория на продукта (според Google taxonomy, ако имате)
// additional_image_link – допълнителни снимки
// product_type – вътрешна категория в сайта
