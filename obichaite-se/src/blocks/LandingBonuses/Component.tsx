import { LandingBonuses } from '@/payload-types'
import React from 'react'

export const LandingBonusesComponent: React.FC<LandingBonuses> = ({
  heading,
  description,
  bonuses,
}) => {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
          <p className="mt-4 text-lg text-slate-600">{description}</p>
        </div>

        {bonuses && bonuses.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {bonuses.map((bonus, i) => (
              <div
                key={bonus.id ?? i}
                className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
              >
                <h3 className="text-xl font-semibold">{bonus.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{bonus.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
