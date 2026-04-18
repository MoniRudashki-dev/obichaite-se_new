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
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
            <p className="mt-4 text-lg text-slate-600">{description}</p>

            {steps && steps.length > 0 && (
              <div className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id ?? index}
                    className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="pt-2 text-slate-700">{step.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-2xl font-semibold">{occasionsHeading}</h3>

            {occasions && occasions.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {occasions.map((occasion, i) => (
                  <div
                    key={occasion.id ?? i}
                    className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-slate-800 ring-1 ring-rose-100"
                  >
                    {occasion.label}
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
