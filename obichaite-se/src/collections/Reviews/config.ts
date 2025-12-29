import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { CollectionConfig } from 'payload'
import { revalidateDeleteReview, revalidateReview } from './hooks/revalidateReview'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: 'Ревю',
    plural: 'Ревюта',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    id: true,
  },
  admin: {
    defaultColumns: ['author', 'product', 'approved', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'rating',
      type: 'select',
      required: true,
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: '1',
          value: '1',
        },
        {
          label: '2',
          value: '2',
        },
        {
          label: '3',
          value: '3',
        },
        {
          label: '4',
          value: '4',
        },
        {
          label: '5',
          value: '5',
        },
      ],
    },
    {
      name: 'approved',
      type: 'checkbox',
      label: 'Удобрено',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Ако бъде удобренo, ревюто ще бъде видимо в сайтът',
      },
    },
    {
      name: 'isInHomePage',
      type: 'checkbox',
      label: 'Видимо в начална страница',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Ако бъде удобренo, ревюто ще бъде видимо в началната страница',
      },
    },
    {
      name: 'message',
      label: 'Съдържание на съобщение',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'product',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'media',
      type: 'upload',
      label: 'Снимка на Ревюто',
      maxDepth: 2,
      relationTo: 'media',
      admin: {
        description: 'Снимка към Ревюто',
        position: 'sidebar',
      },
      required: false,
    },
  ],
  hooks: {
    afterChange: [revalidateReview],
    afterDelete: [revalidateDeleteReview],
  },
}
