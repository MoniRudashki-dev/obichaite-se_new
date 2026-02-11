import type { CollectionConfig, Field } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { slugField } from '@/fields/slug'
import { generatePreviewPath } from '@/utils/generatePreviewPath'
import {
  OverviewField,
  MetaTitleField,
  MetaImageField,
  MetaDescriptionField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  lexicalEditor,
  HeadingFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { revalidateDeleteProduct, revalidateProduct } from './hooks/revalidateProduct'
import { ensureInquiryDefaults } from './hooks/ensureInquiryDefaults'
import { getDefaultInquiryQuestions } from './hooks/inquiryDefaults'

export const Product: CollectionConfig = {
  slug: 'product',
  labels: {
    singular: 'Продукт',
    plural: 'Продукти',
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
    heading: true,
    description: true,
    shortDescription: true,
    media: true,
  },
  admin: {
    defaultColumns: ['title', 'category', 'promoPrice', 'bestSeller'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'product',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'product',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'heading',
      type: 'richText',
      label: 'Heading',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      required: true,
      admin: {
        description: 'Заглавие на секцията с Продукта',
      },
    },
    {
      name: 'shortDescription',
      type: 'text',
      label: 'Кратко описание',
      required: true,
      admin: {
        description: 'Описание на Продукта (под заглавието)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      required: true,
      admin: {
        description: 'Описание на Продукта (под заглавието)',
      },
    },
    {
      name: 'mediaArray',
      type: 'array',
      label: 'Снимки',
      minRows: 1,
      maxRows: 5,
      fields: [
        {
          name: 'file',
          type: 'upload',
          label: 'Снимка',
          relationTo: 'media',
          required: true,
        } as Field,
      ],
    },
    {
      name: 'inquiryFormFields',
      type: 'array',
      label: 'Полетата във формата за запитване',
      defaultValue: getDefaultInquiryQuestions,
      admin: {
        condition: (data) => Boolean(data?.showInquiryForm),
        initCollapsed: true,
      },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Заглавие' },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Падащо меню', value: 'select' },
            { label: 'Текст', value: 'text' },
            { label: 'Дата + текст', value: 'date_text' },
          ],
        },
        { name: 'required', type: 'checkbox', defaultValue: true, label: 'Задължително' },
        {
          name: 'placeholder',
          type: 'text',
          label: 'Placeholder',
          admin: { condition: (_, s) => s?.type === 'text' || s?.type === 'date_text' },
        },
        {
          name: 'options',
          type: 'array',
          label: 'Опции',
          admin: {
            condition: (_, s) => s?.type === 'select',
            initCollapsed: true,
          },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'category',
      required: true,
      admin: {
        position: 'sidebar',
        allowCreate: false,
        allowEdit: false,
        appearance: 'drawer',
      },
    },
    {
      name: 'subCategory',
      type: 'relationship',
      relationTo: 'sub-category',
      required: true,
      admin: {
        position: 'sidebar',
        allowCreate: false,
        allowEdit: false,
        appearance: 'drawer',
      },
    },
    {
      name: 'otherSubCategories',
      type: 'relationship',
      relationTo: 'sub-category',
      hasMany: true,
      admin: {
        position: 'sidebar',
        allowCreate: false,
        allowEdit: false,
        appearance: 'drawer',
      },
    },
    {
      name: 'showInquiryForm',
      type: 'checkbox',
      label: 'Показване на формата за запитване',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Ако това поле бъде активно, вместо цена ще показва бутон за запитване, който ще отваря формата за запитване.',
        condition: (data) => {
          return data.category === 2
        },
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
        condition: (data) => {
          return data.category !== 6
        },
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'promoPrice',
      type: 'number',
      required: false,
      admin: {
        position: 'sidebar',
        //admin condition if the category is "Организиране на събития" to not show the field
        condition: (data) => {
          return data.category !== 6
        },
      },
    },
    {
      name: 'bestSeller',
      type: 'checkbox',
      label: 'Най-продавани продукт',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Ако това поле бъде активирано, продуктър ще излиза в секция най-продавани',
      },
    },
    {
      name: 'havePriceRange',
      type: 'checkbox',
      label: 'Има ли цена в диапазон',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priceRange',
      type: 'text',
      required: false,
      admin: {
        position: 'sidebar',
        description:
          'Задължително, потребителя да раздели цената с тире Пример: 350-500 | 800-1200',
        condition: (data) => data?.havePriceRange,
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isInThematic',
      label: 'Присъства в страница Тематични',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Ако това поле бъде активирано, продуктът ще излиза в страница Тематични',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  hooks: {
    beforeValidate: [ensureInquiryDefaults],
    afterChange: [revalidateProduct],
    afterDelete: [revalidateDeleteProduct],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
