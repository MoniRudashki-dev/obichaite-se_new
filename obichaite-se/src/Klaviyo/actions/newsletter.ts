'use server'

/**
 * Server action wrapper for newsletter subscription, callable from client
 * components (e.g. the checkout consent checkbox). Returns only a coarse
 * boolean so no Klaviyo internals leak to the client.
 */

import { subscribeToNewsletter } from '../server/newsletter'

export async function subscribeToNewsletterAction(input: {
  email: string
  fullName?: string | null
  phone?: string | null
  source?: string
}): Promise<{ ok: boolean }> {
  const result = await subscribeToNewsletter({
    email: input.email,
    fullName: input.fullName,
    phone: input.phone,
    source: input.source ?? 'checkout',
  })
  return { ok: result.ok }
}
