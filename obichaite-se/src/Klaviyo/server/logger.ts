/**
 * Redacting logger for the Klaviyo integration.
 *
 * Wraps `console.*` with a `[Klaviyo]` tag (consistent with the rest of the
 * codebase) and provides helpers that keep PII/secrets out of logs. Never pass
 * raw payloads, API keys or full emails/phones here.
 */

import { isKlaviyoDebug } from '../config'

/** Masks an email for logs: `john@example.com` -> `jo***@example.com`. */
export const maskEmail = (email?: string | null): string => {
  if (!email) return '(none)'
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`
}

/** Keeps only the last 3 digits of a phone number. */
export const maskPhone = (phone?: string | null): string => {
  if (!phone) return '(none)'
  const last = phone.slice(-3)
  return `***${last}`
}

type LogContext = Record<string, unknown>

const format = (message: string, context?: LogContext): string => {
  if (!context || Object.keys(context).length === 0) return `[Klaviyo] ${message}`
  return `[Klaviyo] ${message} ${JSON.stringify(context)}`
}

export const klaviyoLogger = {
  debug(message: string, context?: LogContext): void {
    if (isKlaviyoDebug()) console.log(format(message, context))
  },
  info(message: string, context?: LogContext): void {
    console.log(format(message, context))
  },
  warn(message: string, context?: LogContext): void {
    console.warn(format(message, context))
  },
  error(message: string, context?: LogContext): void {
    console.error(format(message, context))
  },
}
