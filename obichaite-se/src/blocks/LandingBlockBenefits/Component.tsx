import GenericHeading from '@/components/Generic/GenericHeading'
import GenericParagraph from '@/components/Generic/GenericParagraph'
import { LandingBlockBenefits } from '@/payload-types'
import React from 'react'

export const LandingBlockBenefitsComponent: React.FC<LandingBlockBenefits> = ({
  heading,
  description,
  benefits,
}) => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
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

      {benefits && benefits.length > 0 && (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map((item, i) => (
            <div
              key={item.id ?? i}
              className="rounded-3xl border border-brown/15 bg-white p-8 shadow-sm"
            >
              <GenericHeading
                headingType="h4"
                fontStyle="font-sansation font-[700]"
                textColor="text-bordo"
                customStyles={true}
                extraClass="text-[20px] md:text-[22px] leading-[120%]"
              >
                {item.title}
              </GenericHeading>
              <GenericParagraph
                pType="regular"
                fontStyle="font-sansation font-[400]"
                textColor="text-brown"
                extraClass="mt-3 leading-7"
              >
                {item.text}
              </GenericParagraph>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
