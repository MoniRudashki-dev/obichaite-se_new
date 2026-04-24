import GenericHeading from '@/components/Generic/GenericHeading'
import GenericParagraph from '@/components/Generic/GenericParagraph'
import { LandingTestimonials } from '@/payload-types'
import React from 'react'

export const LandingTestimonialsComponent: React.FC<LandingTestimonials> = ({
  heading,
  testimonials,
}) => {
  return (
    <section className="bg-pink/10 py-20">
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
        </div>

        {testimonials && testimonials.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((item, i) => (
              <div
                key={item.id ?? i}
                className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-brown/15"
              >
                <GenericParagraph
                  pType="large"
                  fontStyle="font-sansation font-[400] italic"
                  textColor="text-brown"
                  extraClass="leading-8"
                >
                  &ldquo;{item.text}&rdquo;
                </GenericParagraph>
                <GenericParagraph
                  pType="small"
                  fontStyle="font-sansation font-[700]"
                  textColor="text-bordo"
                  extraClass="mt-6"
                >
                  {item.name}
                </GenericParagraph>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
