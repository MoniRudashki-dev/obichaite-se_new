import { LandingTestimonials } from '@/payload-types'
import React from 'react'

export const LandingTestimonialsComponent: React.FC<LandingTestimonials> = ({
  heading,
  testimonials,
}) => {
  return (
    <section className="bg-rose-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
        </div>

        {testimonials && testimonials.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((item, i) => (
              <div
                key={item.id ?? i}
                className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
              >
                <p className="text-lg leading-8 text-slate-700">"{item.text}"</p>
                <p className="mt-6 text-sm font-semibold text-slate-900">{item.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
