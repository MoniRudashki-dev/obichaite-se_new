import type { Block } from 'payload'

export const LandingBlockBenefits: Block = {
  slug: 'landingBlockBenefits',
  interfaceName: 'LandingBlockBenefits',
  labels: {
    singular: 'Ползи секция',
    plural: 'Ползи секции',
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
      name: 'benefits',
      type: 'array',
      label: 'Ползи',
      minRows: 1,
      maxRows: 6,
      admin: {
        description: 'Картите с ползи, показвани в решетка (препоръчително 3)',
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
