import { Banner } from '@/payload-types'
import { getCachedGlobal } from '@/utils/getGlobals'
import React from 'react'
import { AnnouncementBar } from './AnnouncementBar'

export async function BannerComponent() {
  const bannerData: Banner = await getCachedGlobal('banner', 1)()

  if (!bannerData?.messages?.length) return null

  return (
    <AnnouncementBar
      messages={bannerData.messages.map((m) => m.message)}
      className="bg-bordo text-white"
      textClassName="text-sm font-medium"
    />
  )
}

export default BannerComponent
