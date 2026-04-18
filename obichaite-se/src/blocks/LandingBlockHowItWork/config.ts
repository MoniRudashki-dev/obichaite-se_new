import type { Block } from 'payload'

export const LandingBlockHowItWork: Block = {
  slug: 'landingBlockHowItWork',
  interfaceName: 'LandingBlockHowItWork',
  labels: {
    singular: 'Как работи секция',
    plural: 'Как работи секции',
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
      name: 'steps',
      type: 'array',
      label: 'Стъпки',
      minRows: 1,
      maxRows: 6,
      admin: {
        description: 'Номерираните стъпки в лявата колона (наредбата определя номера)',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Текст на стъпката',
          required: true,
        },
      ],
    },
    {
      name: 'occasionsHeading',
      type: 'text',
      label: 'Заглавие на поводите',
      required: true,
      admin: {
        description: 'Заглавието на дясната карта (напр. "Подходящо за:")',
      },
    },
    {
      name: 'occasions',
      type: 'array',
      label: 'Поводи',
      minRows: 1,
      maxRows: 12,
      admin: {
        description: 'Поводите, показвани в решетка вдясно',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Повод',
          required: true,
        },
      ],
    },
  ],
}
