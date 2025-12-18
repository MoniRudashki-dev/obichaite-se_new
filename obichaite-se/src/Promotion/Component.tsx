import { Promotion } from '@/payload-types'
import { getCachedGlobal } from '@/utils/getGlobals'
import React from 'react'
import PromotionModal from './Component.client'

export async function PromotionComponent() {
  const promotionData = await getCachedGlobal('promotion', 1)()
  const resources = promotionData as Promotion

  const isActive = resources?.isActive

  if (!isActive) return null

  return (
    <>
      <PromotionModal data={resources} />
    </>
  )
}

export default PromotionComponent
