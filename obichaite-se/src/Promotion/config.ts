import type { GlobalConfig } from 'payload'
import { revalidatePromotion } from './hooks/revalidateBanner'
import { linkGroup } from '@/fields/linkGroup'

export const Promotion: GlobalConfig = {
  slug: 'promotion',
  label: {
    singular: 'Промоция',
    plural: 'Промоции',
  },
  admin: {
    description: 'Появяващ се елемент, които показва текущи промоции/акции',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    linkGroup({
      overrides: {
        maxRows: 1,
      },
    }),
    {
      name: 'isActive',
      label: 'Aктивна',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Ако това поле бъде активирано, промоцията ще бъде видима',
      },
    },
  ],
  hooks: {
    afterChange: [revalidatePromotion],
  },
}
