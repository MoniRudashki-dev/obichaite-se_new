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

const removeCommasAndNewlines = (val?: string | null): string => {
  if (!val) return "";

  return String(val)
    .replace(/\r?\n|\r/g, " ") // replace newlines with space
    .replace(/,/g, "")         // remove commas
    .replace(/\s+/g, " ")      // collapse multiple spaces
    .trim();
};

const exportProducts = async () => {
  const products = await payload.find({
    collection: 'product',
    depth: 3,
    limit: 1000,
  })

  // map product fields
  const mapped = products.docs.map((product) => {
    return {
      id: product.id,
      title: removeCommasAndNewlines(product.title),
      description: removeCommasAndNewlines(product.shortDescription.replaceAll(',', '')),
      availability: 'in stock',
      condition: 'new',
      price: !!product?.priceRange ? `${product.priceRange} BGN` : `${product.price} BGN`,
      link: `https://www.obichaite-se.com/produkt/${product.slug}`,
      image_link: (product.mediaArray?.[0].file as Media)?.url,
      brand: 'obichaite-se',
      google_product_category: '',
      fb_product_category: '',
      quantity_to_sell_on_facebook: product.quantity,
      sale_price: !!product.promoPrice ? `${product.promoPrice} BGN` : '',
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
      product_tags1: "",
      product_tags2: '',
      style: ''

    }
  })
  // console.log('mapped->', mapped)

  // Use keys from the first object as headers (order matters)
  const headers = Object.keys(mapped[0]);

  // content lines 
  const contentLines = mapped.map((product) =>
    Object.values(product).join(",")
  );

  const csv = [headers.join(","), ...contentLines].join("\n");


  console.log("products =>", mapped.length)

  // mapped.forEach((product) => {
  //   console.log(product.image_link)
  // })
  // write to csv file
  fs.writeFileSync(path.join(outDir, 'productsExport.csv'), csv)
}

await exportProducts()


// Long description
// # Required | A unique content ID for the item.Use the item's SKU if you can. Each content ID must appear only once in your catalog. To run dynamic ads this ID must exactly match the content ID for the same item in your Meta Pixel code. Character limit: 100,
// # Required | A specific and relevant title for the item.See title specifications: https://www.facebook.com/business/help/2104231189874655 Character limit: 200,
// # Required | A short and relevant description of the item.Include specific or unique product features like material or color.Use plain text and don't enter text in all capital letters. See description specifications: https://www.facebook.com/business/help/2302017289821154 Character limit: 9999,
// # Required | The current availability of the item. | Поддържани стойности: in stock; out of stock,
// # Required | The current condition of the item. | Поддържани стойности: new; used,
// # Required | The price of the item.Format the price as a number followed by the 3 - letter currency code(ISO 4217 standards).Use a period(.) as the decimal point; don't use a comma.,
// # Required | The URL of the specific product page where people can buy the item.,
// # Required | The URL for the main image of your item.Images must be in a supported format(JPG / GIF / PNG) and at least 500 x 500 pixels.,
// # Required | The brand name of the item.Character limit: 100.,
// # По избор | The Google product category for the item.Learn more about product categories: https://www.facebook.com/business/help/526764014610932.,
// # По избор | The Facebook product category for the item.Learn more about product categories: https://www.facebook.com/business/help/526764014610932.,
// # По избор | The quantity of this item you have to sell on Facebook and Instagram with checkout.Must be 1 or higher or the item won't be buyable,
// # По избор | The discounted price of the item if it's on sale. Format the price as a number followed by the 3-letter currency code (ISO 4217 standards). Use a period (.) as the decimal point; don't use a comma.A sale price is required if you want to use an overlay for discounted prices.,
// # По избор | The time range for your sale period.Includes the date and time / time zone when your sale starts and ends.If this field is blank any items with a sale_price remain on sale until you remove the sale price.Use this format: YYYY - MM - DDT23: 59 +00:00 / YYYY - MM - DDT23: 59 +00:00.Enter the start date as YYYY - MM - DD.Enter a 'T'.Enter the start time in 24 - hour format(00:00 to 23: 59) followed by the UTC time zone(-12:00 to + 14:00).Enter '/' and then repeat the same format for your end date and time.The example row below uses PST time zone(-08:00).,
// # По избор | Use this field to create variants of the same item.Enter the same group ID for all variants within a group.Learn more about variants: https://www.facebook.com/business/help/2256580051262113 Character limit: 100.,
// # По избор | The gender of a person that the item is targeted towards. | Поддържани стойности: female; male; unisex,
// # По избор | The color of the item.Use one or more words to describe the color.Don't use a hex code. Character limit: 200.,
// # По избор | The size of the item written as a word or abbreviation or number.For example: small; XL; 12. Character limit: 200.,
// # По избор | The age group that the item is targeted towards. | Поддържани стойности: adult; all ages; infant; kids; newborn; teen; toddler,
// # По избор | The material the item is made from; such as cotton; denim or leather.Character limit: 200.,
// # По избор | The pattern or graphic print on the item.Character limit: 100.,
// # По избор | Shipping details for the item.Format as Country: Region: Service: Price.Include the 3 - letter ISO 4217 currency code in the price.Enter the price as 0.0 to use the free shipping overlay in your ads.Use a semi - colon ';' or a comma ";" to separate multiple shipping details for different regions or countries.Only people in the specified region or country will see shipping details for that region or country.You can leave out the region(keep the double '::') if your shipping details are the same for an entire country.,
// # По избор | The shipping weight of the item.Include the unit of measurement(lb / oz / g / kg).,
// # Optional | The URL for a video of your product.Link should be a videos file on a file hosting website; not a video player.Videos must be in a supported format(.3g2; .3gp; .3gpp; .asf; .avi; .dat; .divx; .dv; .f4v; .flv; .gif; .m2ts; .m4v; .mkv; .mod; .mov; .mp4; .mpe; .mpeg; .mpeg4; .mpg; .mts; .nsv; .ogm; .ogv; .qt; .tod; .ts; .vob or.wmv).,
// # Optional | The URL for a video of your product.Link should be a videos file on a file hosting website; not a video player.Videos must be in a supported format(.3g2; .3gp; .3gpp; .asf; .avi; .dat; .divx; .dv; .f4v; .flv; .gif; .m2ts; .m4v; .mkv; .mod; .mov; .mp4; .mpe; .mpeg; .mpeg4; .mpg; .mts; .nsv; .ogm; .ogv; .qt; .tod; .ts; .vob or.wmv).,
// # По избор | The item’s Global Trade Item Number(GTIN).Recommended to help classify the item.May appear on the barcode; packaging or book cover.Only provide GTIN if you’re sure it’s correct.GTIN types include UPC(12 digits); EAN(13 digits); JAN(8 or 13 digits); ISBN(13 digits) or ITF - 14(14 digits),
// # По избор | Add labels to products to help filter them into product sets.Max characters: 110 per label; 5000 labels per product,
// # По избор | Add labels to products to help filter them into product sets.Max characters: 110 per label; 5000 labels per product,
// # По избор | Describe the fashion style of this item.

// fields name
//  id, REQUIRED
//  title, REQUIRED
//  description, REQUIRED
//  availability, REQUIRED
//  condition, REQUIRED
//  price, REQUIRED
//  link, REQUIRED
//  image_link, REQUIRED
//  brand, REQUIRED
//  google_product_category,
//  fb_product_category,
//  quantity_to_sell_on_facebook,
//  sale_price,
//  sale_price_effective_date,
//  item_group_id,
//  gender,
//  color,
//  size,
//  age_group,
//  material,
//  pattern,
//  shipping,
//  shipping_weight,
//  video[0].url,
//  video[0].tag[0],
//  gtin,
//  product_tags[0],
//  product_tags[1],
//  style[0]

// Example data
// 0,
// Blue Facebook T - Shirt(Unisex),
// A vibrant blue crewneck T - shirt for all shapes and sizes.Made from 100 % cotton.,
// in stock,
// new,
// "10,00 USD",
// https://www.facebook.com/facebook_t_shirt,https://www.facebook.com/t_shirt_image_001.jpg,
// Facebook,
// Apparel & Accessories > Clothing,
// Clothing & Accessories > Clothing,
// 75,
// "10,00 USD",
// 2020-04 - 30T09: 30 -08:00 / 2020-05 - 30T23: 59 -08:00,
// ,
// unisex,
// royal blue,
// M,
// adult,
// cotton,
// stripes,
// US: CA: Ground: 9.99 USD; US: NY: Air: 15.99 USD,
// 10 kg,
// http://www.facebook.com/a0.mp4,
// Gym,
// 8806088573892,
// some_string,
// other,
// Bodycon