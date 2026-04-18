import type { Block } from 'payload'

export const LandingTestimonials: Block = {
  slug: 'landingTestimonials',
  interfaceName: 'LandingTestimonials',
  labels: {
    singular: 'Отзиви секция',
    plural: 'Отзиви секции',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заглавие',
      required: true,
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Отзиви',
      minRows: 1,
      maxRows: 12,
      admin: {
        description: 'Клиентските отзиви, показвани в решетка',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Име на клиента',
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Текст на отзива',
          required: true,
        },
      ],
    },
  ],
}
