import { greatVibes } from '@/app/fonts'
import { FixedCheckboxIcon } from '@/assets/icons'
import { RichText } from '@/components/Custom'
import Background from '@/components/Custom/Background'
import { GenericImage, GenericParagraph } from '@/components/Generic'
import { CommonHero, Media } from '@/payload-types'
import React from 'react'

const HeroCommon: React.FC<CommonHero> = (props) => {
  const { heading, description, mediaMobile, media } = props

  return (
    <section
      className={`w-full min-h-[100svh] flex relative ${greatVibes.variable} flex pt-[84px] md:pt-[144px]`}
      id="hero"
    >
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <Background />
      </div>

      <div className="w-full content_wrapper flex flex-col z-[2] py-10 md:py-20">
        <div className="w-full min-h-[307px] bg-white flex flex-col-reverse md:flex-row">
          <div className="flex-1 bg-pink/20 flex flex-col justify-center items-center gap-2">
            {description && (
              <GenericParagraph
                fontStyle="font-kolka font-[500]"
                pType="semi"
                textColor="text-brown"
                extraClass="p-6"
              >
                <RichText data={description}></RichText>
              </GenericParagraph>
            )}

            <div className="flex flex-col md:flex-row gap-2 w-full px-6 pb-6 md:pb-[unset]">
              <div className="flex items-center gap-1">
                <div className="flex justify-center items-center">
                  <FixedCheckboxIcon />
                </div>
                <GenericParagraph>Бърза и сигурна доставка</GenericParagraph>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex justify-center items-center">
                  <FixedCheckboxIcon />
                </div>
                <GenericParagraph>Изработка по твоя идея</GenericParagraph>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center py-6 md:py-[unset]">
            {!!heading && (
              <h1 className="font-great-vibes text-[42px] xl:text-[84px] text-bordo text-center leading-[100%] rotate-[-6deg]">
                <RichText data={heading}></RichText>
              </h1>
            )}
          </div>
        </div>
        <>
          <div className="w-full h-[474px] hidden md:block">
            <GenericImage
              src={(media as Media).url || ''}
              alt={(media as Media).alt || ''}
              wrapperClassName="w-full h-full relative"
              fill={true}
              priority={true}
              focalX={(media as Media).focalX || 50}
              focalY={(media as Media).focalY || 50}
              imageClassName="w-full h-full object-cover"
              sizes="100vw"
              fetchPriority="high"
            />
          </div>
          <div className="w-full h-[400px] md:hidden">
            <GenericImage
              src={(mediaMobile as Media).url || ''}
              alt={(mediaMobile as Media).alt || ''}
              wrapperClassName="w-full h-full relative"
              fill={true}
              priority={true}
              focalX={(mediaMobile as Media).focalX || 50}
              focalY={(mediaMobile as Media).focalY || 50}
              imageClassName="w-full h-full object-cover"
              sizes="100vw"
              fetchPriority="high"
            />
          </div>
        </>
      </div>
    </section>
  )
}

export default HeroCommon
