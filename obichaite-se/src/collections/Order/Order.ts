import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { anyone } from '@/access/anyone'
import { setOrderNumber } from './hooks/setOrderNumber'
import { revalidateOrdersAfterChange, revalidateOrdersAfterDelete } from './hooks/revalidateOrder'
import { afterChangeOrderStatus } from './hooks/afterChangeOrderStatus'

export const Order: CollectionConfig = {
  slug: 'order',
  labels: {
    singular: 'Поръчка',
    plural: 'Поръчки',
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'paymentStatus', 'orderEmail', 'createdAt', 'user'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    id: true,
  },
  fields: [
    {
      name: 'orderDate',
      type: 'date',
      label: 'Дата на поръчка',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'freeShipping',
      type: 'checkbox',
      label: 'Безплатна доставка',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'orderNumber',
      type: 'text',
      label: 'Номер на поръчка',
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Статус на поръчка',
      defaultValue: 'pending',
      options: [
        { label: 'Очаква обработка', value: 'pending' },
        { label: 'Обработва се', value: 'processing' },
        { label: 'Изпратена', value: 'shipped' },
        { label: 'Доставена', value: 'delivered' },
        { label: 'Върната', value: 'returned' },
        { label: 'Отказана', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Статус на плащането',
      defaultValue: 'unpaid',
      options: [
        { label: 'Неплатена', value: 'unpaid' },
        { label: 'Платена', value: 'paid' },
        { label: 'Възстановена сума', value: 'refunded' },
        { label: 'Очаква плащане по банков път', value: 'needBankTransfer' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Продукти',
          fields: [
            {
              name: 'items',
              type: 'array',
              label: 'Items',
              labels: {
                singular: 'Item',
                plural: 'Items',
              },
              required: true,
              fields: [
                {
                  name: 'product',
                  type: 'relationship',
                  relationTo: 'product',
                  label: 'Product',
                  required: true,
                },
                {
                  name: 'productTitle',
                  type: 'text',
                  label: 'Product Title (Snapshot)',
                  required: true,
                },
                {
                  name: 'unitPrice',
                  type: 'number',
                  label: 'Единична цена',
                  required: true,
                },
                {
                  name: 'quantity',
                  type: 'number',
                  label: 'Количество',
                  required: true,
                  defaultValue: 1,
                },
                {
                  name: 'lineTotal',
                  type: 'number',
                  label: 'Сума',
                  required: true,
                },
              ],
            },
            {
              name: 'total',
              type: 'number',
              label: 'Общо',
              required: true,
            },
          ],
        },
        {
          label: 'Данни за поръчката',
          fields: [
            {
              name: 'user',
              type: 'relationship',
              relationTo: 'users',
              label: 'Потребител (ако е влязъл)',
            },
            {
              name: 'customerName',
              type: 'text',
              label: 'Име',
              required: true,
            },
            {
              name: 'customerEmail',
              type: 'email',
              label: 'Email',
              required: true,
            },
            {
              name: 'customerPhone',
              type: 'text',
              label: 'Телефон',
              required: true,
            },
            {
              name: 'deliveryMethod',
              type: 'select',
              label: 'Доставчик',
              options: [
                { label: 'Еконт', value: 'econt' },
                { label: 'Спиди', value: 'speedy-dpd' },
                { label: 'Box Now', value: 'boxnow' },
              ],
            },
            {
              name: 'boxNowOfficeId',
              type: 'text',
              label: 'Box Now автомат (ID)',
              admin: {
                description: 'ID на избрания Box Now автомат от клиента.',
                condition: (data) => data?.deliveryMethod === 'boxnow',
              },
            },
            {
              name: 'shippingPrice',
              type: 'number',
              label: 'Цена за доставка (EUR)',
              min: 0,
              admin: {
                description: 'Цена на доставка при поръчка',
                readOnly: true,
              },
            },
            {
              name: 'shippingAddress',
              type: 'group',
              label: 'Адрес за доставка',
              fields: [
                { name: 'line1', type: 'text', label: 'Адрес' },
                { name: 'city', type: 'text', label: 'Град' },
                { name: 'postalCode', type: 'text', label: 'Пощенски код' },
              ],
            },
            {
              name: 'clientNotes',
              type: 'textarea',
              label: 'Бележки от клиента',
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              label: 'Вътрешна бележка',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [setOrderNumber, revalidateOrdersAfterChange, afterChangeOrderStatus],
    afterDelete: [revalidateOrdersAfterDelete],
  },
  versions: {
    drafts: false,
    maxPerDoc: 50,
  },
}
