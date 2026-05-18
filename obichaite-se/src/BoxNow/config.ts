import type { GlobalConfig } from 'payload'
import { revalidateBoxNow } from './hooks/revalidateBoxNow'

export const BoxNow: GlobalConfig = {
  slug: 'box-now',
  label: {
    singular: 'Box Now доставка',
    plural: 'Box Now доставка',
  },
  admin: {
    description: 'Настройки за доставка чрез Box Now. Цената се прилага към всяка поръчка с избран куриер Box Now.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'shippingPrice',
      label: 'Цена за доставка (EUR)',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 1.56,
      admin: {
        description: 'Цената на доставка чрез Box Now в евро.',
        step: 0.01,
      },
    },
  ],
  hooks: {
    afterChange: [revalidateBoxNow],
  },
}
