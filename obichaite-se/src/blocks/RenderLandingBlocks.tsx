import React, { Fragment } from 'react'

import type {
  LandingBlockHero,
  LandingBlockBenefits,
  LandingBlockHowItWork,
  LandingGallery,
  LandingBonuses,
  LandingTestimonials,
} from '@/payload-types'

import { LandingBlockHeroComponent } from './LandingBlockHero/Component'
import { LandingBlockBenefitsComponent } from './LandingBlockBenefits/Component'
import { LandingBlockHowItWorkComponent } from './LandingBlockHowItWork/Component'
import { LandingGalleryComponent } from './LandingGallery/Component'
import { LandingBonusesComponent } from './LandingBonuses/Component'
import { LandingTestimonialsComponent } from './LandingTestimonials/Component'

type LandingBlock =
  | LandingBlockHero
  | LandingBlockBenefits
  | LandingBlockHowItWork
  | LandingGallery
  | LandingBonuses
  | LandingTestimonials

const blockComponents = {
  landingBlockHero: LandingBlockHeroComponent,
  landingBlockBenefits: LandingBlockBenefitsComponent,
  landingBlockHowItWork: LandingBlockHowItWorkComponent,
  landingGallery: LandingGalleryComponent,
  landingBonuses: LandingBonusesComponent,
  landingTestimonials: LandingTestimonialsComponent,
}

export const RenderLandingBlocks: React.FC<{
  blocks: LandingBlock[] | null | undefined
}> = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType as keyof typeof blockComponents]

          if (Block) {
            return (
              <div key={`${blockType}-${index}`} className="w-full">
                <Block {...(block as any)} />
              </div>
            )
          }
        }

        return null
      })}
    </Fragment>
  )
}
