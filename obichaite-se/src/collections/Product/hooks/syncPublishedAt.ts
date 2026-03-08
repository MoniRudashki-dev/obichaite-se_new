import type { CollectionBeforeChangeHook } from 'payload'

export const syncPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data) return data

  const now = new Date().toISOString()

  const legacyPublishedMissing =
    operation === 'update' &&
    originalDoc?._status === 'published' &&
    !originalDoc?.publishedAt &&
    !data?.publishedAt

  if (legacyPublishedMissing) {
    data.publishedAt = now
    return data
  }

  const isPublishingNow =
    operation === 'update' &&
    data?._status === 'published' &&
    originalDoc?._status !== 'published' &&
    !data?.publishedAt

  if (isPublishingNow) {
    data.publishedAt = now
  }

  return data
}
