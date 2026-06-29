import type { GlobalConfig } from 'payload'
import { revalidateEcont } from './hooks/revalidateEcont'

export const Econt: GlobalConfig = {
  slug: 'econt',
  label: {
    singular: 'Econt доставка',
    plural: 'Econt доставка',
  },
  admin: {
    description:
      'Настройки за доставка чрез Econt. Цената се прилага според избрания вид доставка (офис или адрес).',
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
        description: 'Цената на доставка до офис на Econt в евро.',
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
        description: 'Цената на доставка до адрес чрез Econt в евро.',
        step: 0.01,
      },
    },
  ],
  hooks: {
    afterChange: [revalidateEcont],
  },
}
