import { priceToEuro } from "@/utils/calculatePriceFromLvToEuro"

type OrderItem = {
  name: string
  quantity: number
}

type NewOrderEmailArgs = {
  orderId: number
  items: OrderItem[]
  total: number
  currency?: string
  userName: string
  orderNumber?: string
}

const getBaseUrl = () => process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const getLogoUrl = () => `${getBaseUrl()}/_next/image?url=%2Flogo-full.png&w=1920&q=75`
const getPdfLink = () => `${getBaseUrl}/pdf-obichaite-se.pdf`
const pdfLink = getPdfLink()

export const OrderConfirmed = {
  subject: ({ orderId }: { orderId: number }) => `Поръчката ви е потвърдена #${orderId}`,
  html: ({ orderId, items, total, currency = 'eu/лв.', userName, orderNumber }: NewOrderEmailArgs) => {
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
    <title>Поръчката ви е потвърдена #${orderId}</title>
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
                Поръчката ви е потвърдена #${orderId}
              </td>
            </tr>
            <tr>
            <td style="padding:0 24px 24px 24px; font-family:Arial, sans-serif; color:#111111;">
              <h1 style="margin:0 0 12px 0; font-size:22px; line-height:1.4; font-weight:bold; text-align:left;">
                ${userName}, поръчката ви е потвърдена
              </h1>
              <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6;">
                Благодарим ви, че избрахте <strong>Obichaite-se</strong>. Поръчка № <strong>${orderNumber}</strong> беше успешно приета и в момента се подготвя от нашия екип.
              </p>
              <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6;">
                Ще получите допълнителен имейл, когато поръчката бъде предадена на куриер. Ако имате въпроси или желаете промени, просто ни пишете или се обадете.
              </p>
              <p style="margin:0; font-size:14px; line-height:1.6;">
                Пазете този имейл за справка – той съдържа важна информация за вашата поръчка.
              </p>
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
            <td style="padding:16px 24px 24px 24px; font-family:Arial, sans-serif; font-size:12px; line-height:1.6; color:#555555; border-top:1px solid #eeeeee;">
              <p style="margin:0 0 6px 0;">
                ✉ <a href="mailto:office@obichaite-se.com" style="color:#555555; text-decoration:none;">office@obichaite-se.com</a><br />
                🕿 <a href="tel:+359879003588" style="color:#555555; text-decoration:none;">+359 879 003 588</a><br />
                🌐 <a href="https://obichaite-se.com" style="color:#555555; text-decoration:none;">https://obichaite-se.com</a>
              </p>

              <p style="margin:6px 0;">
                С подробните условия за ползване можете да се запознаете тук: 
                <a href="https://obichaite-se.com/usloviya-za-polzvane" style="color:#555555; text-decoration:underline;">
                  Общи условия
                </a>
              </p>

              <a href=${pdfLink}>
                Изтегли Общите условия (PDF)
              </a>

              <p style="margin:10px 0 0 0; font-style:italic;">
                С обич и внимание към всеки детайл – екипът на Obichaite-se.
              </p>
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
