import GenericHeading from '@/components/Generic/GenericHeading'
import GenericParagraph from '@/components/Generic/GenericParagraph'
import { LandingBlockHowItWork } from '@/payload-types'
import React from 'react'

export const LandingBlockHowItWorkComponent: React.FC<LandingBlockHowItWork> = ({
  heading,
  description,
  steps,
  occasionsHeading,
  occasions,
}) => {
  return (
    <section className="bg-pinkShade/30 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <GenericHeading
              headingType="h2"
              fontStyle="font-sansation font-[700]"
              textColor="text-brown"
              align="text-left"
            >
              {heading}
            </GenericHeading>
            <GenericParagraph
              pType="large"
              fontStyle="font-sansation font-[400]"
              textColor="text-brown"
              extraClass="mt-4"
            >
              {description}
            </GenericParagraph>

            {steps && steps.length > 0 && (
              <div className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id ?? index}
                    className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/15"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full red_background text-white font-sansation font-[700] text-sm">
                      {index + 1}
                    </div>
                    <GenericParagraph
                      pType="regular"
                      fontStyle="font-sansation font-[400]"
                      textColor="text-brown"
                      extraClass="pt-2"
                    >
                      {step.text}
                    </GenericParagraph>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-brown/15">
            <GenericHeading
              headingType="h3"
              fontStyle="font-sansation font-[700]"
              textColor="text-bordo"
              customStyles={true}
              extraClass="text-[22px] md:text-[26px] leading-[120%]"
            >
              {occasionsHeading}
            </GenericHeading>

            {occasions && occasions.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {occasions.map((occasion, i) => (
                  <div
                    key={occasion.id ?? i}
                    className="rounded-2xl bg-pink/15 px-4 py-3 ring-1 ring-pink/40"
                  >
                    <GenericParagraph
                      pType="small"
                      fontStyle="font-sansation font-[700]"
                      textColor="text-brown"
                    >
                      {occasion.label}
                    </GenericParagraph>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
