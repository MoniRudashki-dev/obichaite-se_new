import { Media, Page } from '@/payload-types'
import React from 'react'
import Background from './Background'
import { VerticalPortraitMarquee } from './VerticalPortraitMarquee'
import { RotatingMaskedHeadline } from './MultipleAnimatedText'

//TODO make calculation from the mediaArray length and slide

const RepresentationSection = ({
  representatives,
}: {
  representatives: Page['representatives']
}) => {
  return (
    <section className="w-full py-[10px] md:py-10 relative min-h-[100svh] md:min-h-[80svh] flex">
      <Background />

      <div className="w-full content_wrapper min-h-[calc(100%-20px)] md:min-h-[calc(100%-80px)] z-[2] flex">
        <div className="flex-1 flex justify-center items-center p-4 xl:p-10">
          <div className="p-6 glass bg-brown/20 rounded-[20px] flex justify-center items-center w-full h-full">
            <RotatingMaskedHeadline
              texts={
                representatives?.content2.map((item) => {
                  return item.text
                }) as string[]
              }
              className="text-[20px] md:text-[24px] xl:text-[32px] 2xl:text-[36px] leading-[110%] text-white text-center font-sansation font-bold"
              lineClassName="will-change-transform"
              reserveLines={2}
              holdMs={3000}
              lineInMs={1400}
              lineOutMs={640}
              lineStaggerMs={180}
            />
          </div>
        </div>
        <div className="flex-1 flex gap-6 px-6">
          <div className="flex-1">
            <div className="h-full max-h-[640px] w-full">
              <VerticalPortraitMarquee
                items={representatives?.mediaArray as Media[]}
                durationSec={200}
                direction="up"
                delaySec={0}
                shuffle
                shuffleSeed={11}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="h-full max-h-[640px] w-full">
              <VerticalPortraitMarquee
                items={representatives?.mediaArray as any}
                durationSec={200}
                direction="down"
                delaySec={6}
                // Tip: if you want instant desync instead of “wait then start”
                // delaySec={-40}
                shuffle
                shuffleSeed={22}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RepresentationSection
