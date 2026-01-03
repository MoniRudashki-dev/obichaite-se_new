import { priceToEuro } from '@/utils/calculatePriceFromLvToEuro'

type OrderItem = {
  name: string
  quantity: number
}

type NewOrderEmailArgs = {
  orderId: number
  items: OrderItem[]
  total: number
  currency?: string
  adminOrderUrl: string
}

const getBaseUrl = () => process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const getLogoUrl = () => `${getBaseUrl()}/_next/image?url=%2Flogo-full.png&w=1920&q=75`

export const OrderToAdmin = {
  subject: ({ orderId }: { orderId: number }) => `Нова поръчка #${orderId}`,
  html: ({ orderId, items, total, currency = 'eu/лв.', adminOrderUrl }: NewOrderEmailArgs) => {
    const logoUrl = getLogoUrl()

    const itemsRows =
      items && items.length
        ? items
            .map(
              (item) => `
                  <tr>
                    <td style="padding:6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4;color:#111111;">
                      ${item.name}
                    </td>
                    <td align="right" style="padding:6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4;color:#111111;">
                      ${item.quantity}
                    </td>
                  </tr>`,
            )
            .join('')
        : `
              <tr>
                <td colspan="2" style="padding:6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4;color:#666666;">
                  (Няма налични артикули за показване)
                </td>
              </tr>
            `

    return `<!DOCTYPE html>
<html lang="bg">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Нова поръчка #${orderId}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;border:1px solid #e5e5e5;">
            <tr>
              <td align="center" style="padding:24px 24px 8px 24px;">
                <img src="${logoUrl}" alt="Лого" style="max-width:160px;height:auto;display:block;" />
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:8px 24px 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:1.4;color:#111111;font-weight:600;">
                Нова поръчка #${orderId}
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:12px 24px 8px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#333333;">
                Получихте нова поръчка през уебсайта. По-долу е кратко обобщение:
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:8px 24px 0 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <th align="left" style="padding:4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;color:#666666;border-bottom:1px solid #f0f0f0;">
                      Артикул
                    </th>
                    <th align="right" style="padding:4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;color:#666666;border-bottom:1px solid #f0f0f0;">
                      Количество
                    </th>
                  </tr>
                  ${itemsRows}
                </table>
              </td>
            </tr>
            <tr>
              <td align="right" style="padding:12px 24px 8px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#111111;font-weight:600;border-top:1px solid #f0f0f0;">
                Обща стойност: ${priceToEuro(total)} ${total.toFixed(2)} ${currency}
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:12px 24px 16px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#333333;">
                Можеш да прегледаш детайлите на поръчката и да я обработиш директно от админ панела:
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 24px 16px 24px;">
                <a href="${adminOrderUrl}" style="display:inline-block;padding:10px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;background-color:#1d4ed8;border-radius:6px;">
                  Отвори поръчката в админ панела
                </a>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:0 24px 16px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#666666;">
                Този линк води към страницата с детайлите за поръчката в админ панела и е достъпен само за потребители с необходимите права.
                <br />
                <a href="${adminOrderUrl}" style="color:#1d4ed8;text-decoration:underline;word-break:break-all;">${adminOrderUrl}</a>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:16px 24px 24px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#999999;border-top:1px solid #f0f0f0;">
                Това е автоматично уведомление за нова поръчка.
                <br /><br />
                &copy; ${new Date().getFullYear()} Обичаите се. Всички права запазени.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
  },
}
