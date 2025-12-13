import type { GlobalConfig } from 'payload'
import { revalidateBanner } from './hooks/revalidateBanner'

export const Banner: GlobalConfig = {
  slug: 'banner',
  label: {
    singular: 'Банер',
    plural: 'Банери',
  },
  admin: {
    description: 'Движеща се лента с информация за Обичайте се',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'messages',
      label: 'Съобщения',
      type: 'array',
      fields: [
        {
          name: 'message',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateBanner],
  },
}
