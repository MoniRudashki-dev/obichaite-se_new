'use server'

import { cookies } from "next/headers"

// cookie consent
const CONSENT_COOKIE_NAME = 'cookie-consent'
const CONSENT_COOKIE_VALUE = 'granted'

export default async function cookieConsent() {
  const cookieStore = await cookies()
  const cookieConsent = cookieStore.get(CONSENT_COOKIE_NAME)?.value === CONSENT_COOKIE_VALUE


  return cookieConsent
}
