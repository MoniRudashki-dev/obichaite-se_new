'use client'

/**
 * Loads the Klaviyo onsite script once, when the integration is enabled and a
 * public key is configured. Renders nothing otherwise. Modelled on the existing
 * `MetaPixel` component (next/script, afterInteractive).
 */

import Script from 'next/script'
import { getKlaviyoPublicApiKey, isKlaviyoClientEnabled } from '../config'
import { buildKlaviyoOnsiteScriptUrl } from '../constants'

export function KlaviyoScript() {
  const publicKey = getKlaviyoPublicApiKey()

  if (!isKlaviyoClientEnabled() || !publicKey) return null

  return (
    <Script
      id="klaviyo-onsite"
      strategy="afterInteractive"
      src={buildKlaviyoOnsiteScriptUrl(publicKey)}
    />
  )
}
