import GenericHeading from '@/components/Generic/GenericHeading'
import GenericParagraph from '@/components/Generic/GenericParagraph'
import { LandingBonuses } from '@/payload-types'
import React from 'react'

export const LandingBonusesComponent: React.FC<LandingBonuses> = ({
  heading,
  description,
  bonuses,
}) => {
  return (
    <section className="bg-pinkShade/30 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <GenericHeading
            headingType="h2"
            fontStyle="font-sansation font-[700]"
            textColor="text-brown"
            align="text-center"
          >
            {heading}
          </GenericHeading>
          <GenericParagraph
            pType="large"
            fontStyle="font-sansation font-[400]"
            textColor="text-brown"
            extraClass="mt-4 text-center"
          >
            {description}
          </GenericParagraph>
        </div>

        {bonuses && bonuses.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {bonuses.map((bonus, i) => (
              <div
                key={bonus.id ?? i}
                className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-brown/15"
              >
                <GenericHeading
                  headingType="h4"
                  fontStyle="font-sansation font-[700]"
                  textColor="text-bordo"
                  customStyles={true}
                  extraClass="text-[20px] md:text-[22px] leading-[120%]"
                >
                  {bonus.title}
                </GenericHeading>
                <GenericParagraph
                  pType="regular"
                  fontStyle="font-sansation font-[400]"
                  textColor="text-brown"
                  extraClass="mt-3 leading-7"
                >
                  {bonus.text}
                </GenericParagraph>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
