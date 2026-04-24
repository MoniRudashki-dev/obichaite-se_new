import GenericHeading from '@/components/Generic/GenericHeading'
import GenericImage from '@/components/Generic/GenericImage'
import GenericParagraph from '@/components/Generic/GenericParagraph'
import { LandingGallery, Media } from '@/payload-types'
import React from 'react'

export const LandingGalleryComponent: React.FC<LandingGallery> = ({
  heading,
  description,
  items,
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

      {items && items.length > 0 && (
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => {
            const media = typeof item.image === 'object' ? (item.image as Media) : null
            const src = media?.url ?? ''
            const alt = media?.alt ?? item.title

            return (
              <div
                key={item.id ?? i}
                className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-brown/15"
              >
                {src && (
                  <GenericImage
                    src={src}
                    alt={alt}
                    wrapperClassName="relative h-72 w-full"
                    imageClassName="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                )}
                <div className="p-6">
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
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
