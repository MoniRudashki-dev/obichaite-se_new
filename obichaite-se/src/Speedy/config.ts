import type { GlobalConfig } from 'payload'
import { revalidateSpeedy } from './hooks/revalidateSpeedy'

export const Speedy: GlobalConfig = {
  slug: 'speedy',
  label: {
    singular: 'Speedy доставка',
    plural: 'Speedy доставка',
  },
  admin: {
    description:
      'Настройки за доставка чрез Speedy. Цената се прилага според избрания вид доставка (офис или адрес).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'officeShippingPrice',
      label: 'Цена за доставка до офис (EUR)',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Цената на доставка до офис на Speedy в евро.',
        step: 0.01,
      },
    },
    {
      name: 'addressShippingPrice',
      label: 'Цена за доставка до адрес (EUR)',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Цената на доставка до адрес чрез Speedy в евро.',
        step: 0.01,
      },
    },
  ],
  hooks: {
    afterChange: [revalidateSpeedy],
  },
}
