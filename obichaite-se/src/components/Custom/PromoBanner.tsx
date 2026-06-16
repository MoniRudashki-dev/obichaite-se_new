import React from 'react'
import { GenericImage } from '../Generic'

// --- Timed promotion banner. Swap these three values when the promo changes. ---
const BANNER_LINK =
  'https://boxnowbg.msnd41.com/tracking/lc/027676b4-0bbb-4721-aac3-450581d4d73a/9f11a704-e520-4b3d-a2d2-dadcd201b902/86888c41-0c19-3d11-0f55-0bacb7d3af66/'
const BANNER_DESKTOP = '/static/promo-banner-desktop.webp' // 2470x786
const BANNER_MOBILE = '/static/promo-banner-mobile.webp' // 1080x1350
const BANNER_ALT = 'BOX NOW Giveaway — Story of the Month'
// -------------------------------------------------------------------------------

const PromoBanner = () => {
  return (
    <section className="w-full py-[40px] md:py-[80px]">
      <div className="content_wrapper">
        <a
          href={BANNER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={BANNER_ALT}
          className="block w-full relative aspect-[1080/1350] md:aspect-[2470/786]"
        >
          <GenericImage
            src={BANNER_DESKTOP}
            mobileUrl={BANNER_MOBILE}
            alt={BANNER_ALT}
            wrapperClassName="w-full h-full absolute inset-0"
            imageClassName="w-full h-full object-contain md:object-cover"
            fill={true}
            sizes="(max-width: 1535px) 100vw, 1440px"
            priority={true}
          />
        </a>
      </div>
    </section>
  )
}

export default PromoBanner
