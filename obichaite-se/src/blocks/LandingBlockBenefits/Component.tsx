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
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
        <p className="mt-4 text-lg text-slate-600">{description}</p>
      </div>

      {benefits && benefits.length > 0 && (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map((item, i) => (
            <div
              key={item.id ?? i}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
