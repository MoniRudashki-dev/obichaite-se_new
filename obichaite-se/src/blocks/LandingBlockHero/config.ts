import type { Block } from 'payload'

export const LandingBlockHero: Block = {
  slug: 'landingBlockHero',
  interfaceName: 'LandingBlockHero',
  labels: {
    singular: 'Hero секция',
    plural: 'Hero секции',
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
      label: 'Бадж',
      required: false,
      admin: {
        description: 'Малък надпис над заглавието (напр. "Емоционални изненади на работното място")',
      },
    },
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
      name: 'primaryButton',
      type: 'group',
      label: 'Основен бутон',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Текст',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Линк',
          required: true,
        },
      ],
    },
    {
      name: 'secondaryButton',
      type: 'group',
      label: 'Вторичен бутон',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Текст',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Линк',
          required: true,
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Статистики',
      minRows: 1,
      maxRows: 3,
      admin: {
        description: 'До 3 статистики, показвани под бутоните',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Стойност',
          required: true,
          admin: {
            description: 'Напр. "100%", "1 ден", "Без стрес"',
          },
        },
        {
          name: 'description',
          type: 'text',
          label: 'Описание',
          required: true,
        },
      ],
    },
    {
      name: 'previewCardRows',
      type: 'array',
      label: 'Карта (дясна колона)',
      minRows: 1,
      maxRows: 3,
      admin: {
        description: 'Редове в декоративната карта вдясно. Последният ред може да е с тъмен фон.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Етикет',
          required: true,
          admin: {
            description: 'Напр. "Повод", "Какво включва", "Ефект"',
          },
        },
        {
          name: 'value',
          type: 'text',
          label: 'Стойност',
          required: true,
        },
        {
          name: 'highlighted',
          type: 'checkbox',
          label: 'Тъмен фон',
          defaultValue: false,
          admin: {
            description: 'Показва реда с тъмен (slate-900) фон и бял текст',
          },
        },
      ],
    },
  ],
}
