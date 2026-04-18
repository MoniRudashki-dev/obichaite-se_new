import type { Block } from 'payload'

export const LandingBonuses: Block = {
  slug: 'landingBonuses',
  interfaceName: 'LandingBonuses',
  labels: {
    singular: 'Бонуси секция',
    plural: 'Бонуси секции',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заглавие',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      required: true,
    },
    {
      name: 'bonuses',
      type: 'array',
      label: 'Бонуси',
      minRows: 1,
      maxRows: 6,
      admin: {
        description: 'Картите с бонуси, показвани в решетка (препоръчително 3)',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Заглавие',
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Текст',
          required: true,
        },
      ],
    },
  ],
}
