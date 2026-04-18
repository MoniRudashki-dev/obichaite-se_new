import GenericImage from '@/components/Generic/GenericImage'
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
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
        <p className="mt-4 text-lg text-slate-600">{description}</p>
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
                className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200"
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
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
