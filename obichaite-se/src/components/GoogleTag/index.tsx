'use client'

import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

export const GoogleTag = () => {
  if (!GOOGLE_ADS_ID && !GA_MEASUREMENT_ID) return null

  const primaryId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID

  return (
    <>
      <Script
        id="google-gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />

      <Script id="google-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ''}
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
        `}
      </Script>
    </>
  )
}

// <>
//   Load gtag.js for Google Ads
//   <Script
//     id="google-ads-global"
//     src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
//     strategy="afterInteractive"
//   />
//   {/* Init gtag + config for AW */}
//   <Script id="google-ads-gtag-init" strategy="afterInteractive">
//     {`
//       window.dataLayer = window.dataLayer || [];
//       function gtag(){dataLayer.push(arguments);}
//       gtag('js', new Date());
//       gtag('config', '${GOOGLE_ADS_ID}');
//     `}
//   </Script>
// </>
