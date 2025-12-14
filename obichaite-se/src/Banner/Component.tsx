import { Banner } from '@/payload-types'
import { getCachedGlobal } from '@/utils/getGlobals'
import React from 'react'
import { AnnouncementBar } from './AnnouncementBar'

export async function BannerComponent() {
  const bannerData: Banner = await getCachedGlobal('banner', 1)()

  if (!bannerData?.messages?.length) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[10]">
      <AnnouncementBar
        messages={bannerData.messages.map((m) => m.message)}
        className="bg-bordo text-white"
        textClassName="text-sm font-medium"
      />
    </div>
  )
}

export default BannerComponent
