import type { Block } from 'payload'

export const LandingGallery: Block = {
  slug: 'landingGallery',
  interfaceName: 'LandingGallery',
  labels: {
    singular: 'Галерия секция',
    plural: 'Галерия секции',
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
      name: 'items',
      type: 'array',
      label: 'Елементи в галерията',
      minRows: 1,
      maxRows: 12,
      admin: {
        description: 'Картите в галерията — всяка с изображение, заглавие и текст',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение',
          required: true,
        },
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
