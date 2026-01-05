// app/(shop)/checkout/actions.ts
'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { emailTemplates } from '@/emails/OrderToAdminEmail'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL

type OrderItem = {
  name: string
  quantity: number
}

type SendNewOrderEmailInput = {
  orderId: number
  items: OrderItem[]
  total: number
  userName?: string
  userEmail?: string
  orderNumber?: string
  orderStatus?: string
}

export async function sendNewOrderEmailAction({ orderId, items, total }: SendNewOrderEmailInput) {
  const payload = await getPayload({ config: configPromise })

  const adminOrderUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/order/${orderId}`
  const to = process.env.ADMIN_EMAIL!

  const subject = emailTemplates.orders.newOrderNotification.subject({ orderId })
  const html = emailTemplates.orders.newOrderNotification.html({
    orderId,
    items,
    total,
    currency: 'eu/лв.',
    adminOrderUrl,
  })

  await payload.sendEmail({
    to,
    subject,
    html,
  })

  return { ok: true }
}
export async function sendConfirmedOrderEmail({
  orderId,
  items,
  total,
  userName,
  userEmail,
  orderNumber,
}: SendNewOrderEmailInput) {
  const payload = await getPayload({ config: configPromise })

  const subject = emailTemplates.orders.orderConfirmed.subject({ orderId })
  const html = emailTemplates.orders.orderConfirmed.html({
    orderId,
    items,
    total,
    currency: 'eu/лв.',
    userName: userName!,
    orderNumber,
  })

  await payload.sendEmail({
    to: userEmail,
    subject,
    html,
    attachments: [
      {
        filename: 'pdf-obichaite-se.pdf',
        path: `${baseUrl}/pdf-obichaite-se.pdf`,
        contentType: 'application/pdf',
      },
    ],
  })

  return { ok: true }
}

export async function sendChangeStatusOrderEmail({
  orderId,
  items,
  total,
  userName,
  userEmail,
  orderStatus,
}: SendNewOrderEmailInput) {
  const payload = await getPayload({ config: configPromise })

  const subject = emailTemplates.orders.orderStatus.subject({
    orderId,
    orderStatus: orderStatus as string,
  })
  const html = emailTemplates.orders.orderStatus.html({
    orderId,
    items,
    total,
    currency: 'eu/лв.',
    userName: userName!,
    orderStatus: orderStatus as string,
  })

  await payload.sendEmail({
    to: userEmail,
    subject,
    html,
  })

  return { ok: true }
}
