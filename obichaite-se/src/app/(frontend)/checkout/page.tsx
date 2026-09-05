import { getBoxnowCitiesAction } from '@/BoxNow/action'
import { CheckoutSuggestions } from '@/components/Checkout'
import Checkout from '@/components/Checkout/Checkout'
import CheckoutForm from '@/components/Checkout/CheckoutForm'
import { GenericImage } from '@/components/Generic'
import SetCourierShippingPrices from '@/components/StateManagers/SetCourierShippingPrices'
import { getCachedGlobal } from '@/utils/getGlobals'
import type { BoxNow, Econt, Speedy } from '@/payload-types'
import { Metadata } from 'next'
import React from 'react'
import econtCities from '../../../Econt/json/econt-cities.json'
import speedySites from '../../../Speedy/json/speedy-cities.json'
import econtSettlements from '../../../Econt/json/econt-settlements.json'
import { extractSpeedySettlements } from '@/Speedy/utils/extractSettlements'

export const dynamic = 'force-dynamic'

// И двата списъка идват от статични JSON-и, така че се смятат веднъж при
// зареждане на модула — страницата е force-dynamic и иначе това щеше да се
// повтаря на всяка заявка.
//
// `speedy-cities.json` е плосък списък от офиси и автомати, затова населените
// места се възстановяват от имената им. Econt ги пази вече готови —
// `pnpm econt:settlements` ги опреснява.
const speedySettlements = extractSpeedySettlements(speedySites)

export const metadata: Metadata = {
  title: 'Завършване на поръчката | Обичайте се',
  description: 'Страница за завършване на поръчката',
}

const CheckoutPage = async () => {
  const boxNowCities = await getBoxnowCitiesAction()
  const boxNowGlobal = (await getCachedGlobal('box-now', 0)()) as BoxNow
  const boxNowShipmentPrice = boxNowGlobal.shippingPrice

  const econtGlobal = (await getCachedGlobal('econt', 0)()) as Econt
  const speedyGlobal = (await getCachedGlobal('speedy', 0)()) as Speedy
  return (
    <section className="w-full relative py-10 md:py-20 flex mt-[52px] md:mt-[140px] flex-col gap-10">
      <GenericImage
        src="/static/auth-background.png"
        alt="auth-background"
        wrapperClassName="w-full h-full fixed top-0 left-0 z-[0]"
        imageClassName="w-full h-full object-cover"
        fill={true}
        sizes="100vw"
        fetchPriority="high"
      />

      <div className="md:px-6 w-full content_wrapper white_background_bubble py-6 md:py-10 relative z-[1] rounded-[24px] flex flex-col-reverse lg:flex-row">
        <div className="flex-1 md:px-4">
          <Checkout />
        </div>

        <div className="flex-1 px-4">
          <CheckoutForm
            boxNowCities={boxNowCities}
            boxNowShipmentPrice={boxNowShipmentPrice}
            econtOfficePrice={econtGlobal.officeShippingPrice}
            econtAddressPrice={econtGlobal.addressShippingPrice}
            speedyOfficePrice={speedyGlobal.officeShippingPrice}
            speedyAddressPrice={speedyGlobal.addressShippingPrice}
            econtCities={econtCities}
            speedySites={speedySites}
            econtSettlements={econtSettlements}
            speedySettlements={speedySettlements}
          />
        </div>
      </div>

      <div className="w-full relative z-[2] flex">
        <CheckoutSuggestions />
      </div>

      <SetCourierShippingPrices
        boxNowPrice={boxNowShipmentPrice}
        econtOfficePrice={econtGlobal.officeShippingPrice}
        econtAddressPrice={econtGlobal.addressShippingPrice}
        speedyOfficePrice={speedyGlobal.officeShippingPrice}
        speedyAddressPrice={speedyGlobal.addressShippingPrice}
      />
    </section>
  )
}

export default CheckoutPage
