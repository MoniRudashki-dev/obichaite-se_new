declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URI: string
      NEXT_PUBLIC_SERVER_URL: string
      PREVIEW_SECRET: string
      SMTP_HOST: string
      SMTP_USER: string
      SMTP_PASS: string
      EMAIL_FROM_NAME: string
      EMAIL_FROM_ADDRESS: string
      ADMIN_EMAIL: string
      NEXT_PUBLIC_APP_URL: string

      // Klaviyo integration
      NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY?: string
      NEXT_PUBLIC_KLAVIYO_ENABLED?: string
      KLAVIYO_PRIVATE_API_KEY?: string
      KLAVIYO_NEWSLETTER_LIST_ID?: string
      KLAVIYO_API_REVISION?: string
      KLAVIYO_API_BASE_URL?: string
      KLAVIYO_ENABLED?: string
      KLAVIYO_ENVIRONMENT?: string
      NEXT_PUBLIC_KLAVIYO_ENVIRONMENT?: string
      KLAVIYO_DEBUG?: string
      KLAVIYO_CATALOG_SYNC_SECRET?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
