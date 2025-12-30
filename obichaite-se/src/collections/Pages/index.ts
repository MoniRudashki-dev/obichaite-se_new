import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { slugField } from '@/fields/slug'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { generatePreviewPath } from '@/utils/generatePreviewPath'
import { heroCommon } from '@/Hero/Common/config'
import { Content } from '@/blocks/Content/config'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Заглавие на страницата',
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [heroCommon],
          label: 'Главна Секция',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [MediaBlock, Content],
              defaultValue: [],
              required: false,
              admin: {
                initCollapsed: false,
              },
            },
            {
              name: 'benefits',
              type: 'array',
              label: 'Бенефити на сайта',
              //I need to show that section only if the page slug === home
              admin: {
                initCollapsed: false,
                condition: (data) => data.slug === 'home',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Снимка',
                  maxDepth: 2,
                },
              ],
            },
            {
              name: 'representatives',
              type: 'group',
              label: 'Представители',
              //I need to show that section only if the page slug === home
              admin: {
                condition: (data) => data.slug === 'home',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'content',
                  type: 'array',
                  label: 'Съдържание',
                  required: true,
                  admin: {
                    initCollapsed: true,
                    description:
                      'Всяко едно изречение от съдържанието, което ще бъде изобразено трябва да бъде в този масив от текстове.',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'mediaArray',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Снимки',
                  maxDepth: 2,
                  hasMany: true,
                },
              ],
            },
          ],
          label: 'Съдържание',
        },
        {
          name: 'meta',
          label: 'SEO - Мета информация',
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
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
      label: 'Дата на публикуване',
    },
    {
      name: 'regulatoryPage',
      type: 'checkbox',
      label: 'Регулаторна страница',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 20,
  },
}
