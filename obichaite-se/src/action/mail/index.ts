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

type ProductInquiryAnswerInput = {
  question: string
  type: 'select' | 'text' | 'date_text'
  required: boolean
  value: string | { date: string; text: string }
}

type SendProductInquiryEmailInput = {
  productId: number | string
  productTitle: string
  email: string
  phone: string
  consent: boolean
  additionalInfo?: string
  answers: ProductInquiryAnswerInput[]
}

type SendProductInquiryEmailResult =
  | { ok: true }
  | {
      ok: false
      error: string
    }

const INQUIRY_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const INQUIRY_PHONE_REGEX = /^\d+$/

const safeString = (value: unknown) => String(value ?? '').trim()
const isDateTextValue = (value: unknown): value is { date?: unknown; text?: unknown } =>
  typeof value === 'object' && value !== null
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const buildInquiryAnswersHtml = (answers: ProductInquiryAnswerInput[]) =>
  answers
    .map((answer) => {
      const safeQuestion = escapeHtml(answer.question)

      if (answer.type === 'date_text') {
        const dateTextValue = answer.value as { date?: string; text?: string }
        const date = escapeHtml(dateTextValue.date || 'Не е посочена')
        const text = escapeHtml(dateTextValue.text || '')

        return `
          <li style="margin:0 0 12px; padding:12px 14px; border:1px solid #e7d7c6; border-radius:12px; background:#fff;">
            <div style="font-size:15px; line-height:1.4; font-weight:700; color:#5A3B2A; margin-bottom:6px;">${safeQuestion}</div>
            <div style="font-size:14px; line-height:1.5; color:#3d2a20;"><strong>Дата:</strong> ${date}</div>
            ${text ? `<div style="font-size:14px; line-height:1.5; color:#3d2a20;"><strong>Бележка:</strong> ${text}</div>` : ''}
          </li>
        `
      }

      const safeValue = escapeHtml(String(answer.value || '-'))
      return `
        <li style="margin:0 0 12px; padding:12px 14px; border:1px solid #e7d7c6; border-radius:12px; background:#fff;">
          <div style="font-size:15px; line-height:1.4; font-weight:700; color:#5A3B2A; margin-bottom:6px;">${safeQuestion}</div>
          <div style="font-size:14px; line-height:1.5; color:#3d2a20;">${safeValue}</div>
        </li>
      `
    })
    .join('')

const buildInquiryEmailHtml = ({
  safeProductTitle,
  safeProductId,
  safeEmail,
  safePhone,
  safeAdditionalInfo,
  answersHtml,
}: {
  safeProductTitle: string
  safeProductId: string
  safeEmail: string
  safePhone: string
  safeAdditionalInfo: string
  answersHtml: string
}) => `
  <div style="margin:0; padding:24px; background:#f5eee5; font-family:Arial, Helvetica, sans-serif; color:#3d2a20;">
    <div style="max-width:680px; margin:0 auto; border:1px solid #e7d7c6; border-radius:16px; overflow:hidden; background:#fff;">
      <div style="padding:18px 22px; background:#A3132C; color:#fff;">
        <h2 style="margin:0; font-size:22px; line-height:1.2;">Ново запитване</h2>
      </div>

      <div style="padding:18px 22px; border-bottom:1px solid #f0e4d9;">
        <p style="margin:0 0 8px; font-size:14px;"><strong>Продукт:</strong> ${safeProductTitle}</p>
        <p style="margin:0 0 8px; font-size:14px;"><strong>Product ID:</strong> ${safeProductId}</p>
        <p style="margin:0 0 8px; font-size:14px;"><strong>Имейл:</strong> ${safeEmail}</p>
        <p style="margin:0 0 8px; font-size:14px;"><strong>Телефон:</strong> ${safePhone}</p>
        <p style="margin:0; font-size:14px;"><strong>Допълнителна информация:</strong> ${safeAdditionalInfo}</p>
      </div>

      <div style="padding:18px 22px;">
        <h3 style="margin:0 0 12px; font-size:18px; line-height:1.3; color:#5A3B2A;">Отговори от формата</h3>
        <ul style="padding:0; margin:0; list-style:none;">
          ${answersHtml}
        </ul>
      </div>
    </div>
  </div>
`

export async function sendProductInquiryEmailAction(
  input: SendProductInquiryEmailInput,
): Promise<SendProductInquiryEmailResult> {
  const email = safeString(input?.email)
  const phone = safeString(input?.phone)
  const consent = input?.consent === true
  const additionalInfo = safeString(input?.additionalInfo)

  if (!input?.productId) return { ok: false, error: 'Липсва продукт.' }
  if (!email || !INQUIRY_EMAIL_REGEX.test(email)) {
    return { ok: false, error: 'Невалиден имейл.' }
  }
  if (!phone || !INQUIRY_PHONE_REGEX.test(phone)) {
    return { ok: false, error: 'Телефонът трябва да съдържа само цифри.' }
  }
  if (!consent) return { ok: false, error: 'Липсва съгласие за контакт.' }
  if (additionalInfo.length > 1000) {
    return { ok: false, error: 'Допълнителната информация е твърде дълга.' }
  }
  if (!Array.isArray(input?.answers)) {
    return { ok: false, error: 'Липсват отговори.' }
  }

  const payload = await getPayload({ config: configPromise })
  const to = process.env.INQUIRY_EMAIL_TO || process.env.ADMIN_EMAIL

  if (!to) {
    return { ok: false, error: 'Липсва получател за запитвания (INQUIRY_EMAIL_TO / ADMIN_EMAIL).' }
  }

  const product = await payload.findByID({
    collection: 'product',
    id: input.productId,
    depth: 0,
  })

  if (!product) return { ok: false, error: 'Продуктът не е намерен.' }
  if (!product.showInquiryForm) {
    return { ok: false, error: 'Формата за запитване не е активна за този продукт.' }
  }

  const configuredFields = product.inquiryFormFields ?? []
  const normalizedAnswers: ProductInquiryAnswerInput[] = []

  for (const [idx, field] of configuredFields.entries()) {
    const question = safeString(field.title) || `Въпрос ${idx + 1}`
    const required = Boolean(field.required)
    const incomingAnswer = input.answers[idx]

    if (field.type === 'date_text') {
      const rawDateTextValue = incomingAnswer?.value
      const date = isDateTextValue(rawDateTextValue) ? safeString(rawDateTextValue.date) : ''
      const text = isDateTextValue(rawDateTextValue) ? safeString(rawDateTextValue.text) : ''

      if (required && !date) {
        return { ok: false, error: `Липсва дата за: ${question}` }
      }

      normalizedAnswers.push({
        question,
        type: field.type,
        required,
        value: { date, text },
      })

      continue
    }

    const rawValue = incomingAnswer?.value
    const value = typeof rawValue === 'string' ? safeString(rawValue) : ''

    if (required && !value) {
      return { ok: false, error: `Липсва отговор за: ${question}` }
    }

    if (field.type === 'select' && value) {
      const allowedValues = new Set((field.options ?? []).map((option) => option.value))
      if (!allowedValues.has(value)) {
        return { ok: false, error: `Невалидна стойност за: ${question}` }
      }
    }

    normalizedAnswers.push({
      question,
      type: field.type,
      required,
      value,
    })
  }

  const answersHtml = buildInquiryAnswersHtml(normalizedAnswers)

  const productTitleForSubject = safeString(product.title || input.productTitle || 'Продукт')
  const safeProductTitle = escapeHtml(productTitleForSubject)
  const safeProductId = escapeHtml(String(product.id))
  const safeEmail = escapeHtml(email)
  const safePhone = escapeHtml(phone)
  const safeAdditionalInfo = escapeHtml(additionalInfo || '-')

  await payload.sendEmail({
    to,
    replyTo: email,
    subject: `Ново запитване за ${productTitleForSubject}`,
    html: buildInquiryEmailHtml({
      safeProductTitle,
      safeProductId,
      safeEmail,
      safePhone,
      safeAdditionalInfo,
      answersHtml,
    }),
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
