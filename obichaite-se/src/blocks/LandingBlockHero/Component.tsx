import { LandingBlockHero } from '@/payload-types'
import React from 'react'

export const LandingBlockHeroComponent: React.FC<LandingBlockHero> = ({
  badge,
  heading,
  description,
  primaryButton,
  secondaryButton,
  stats,
  previewCardRows,
}) => {
  return (
    <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          {badge && (
            <span className="inline-flex rounded-full bg-rose-100 px-4 py-1 text-sm font-medium text-rose-700">
              {badge}
            </span>
          )}
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={primaryButton.href}
              className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              {primaryButton.label}
            </a>
            <a
              href={secondaryButton.href}
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              {secondaryButton.label}
            </a>
          </div>

          {stats && stats.length > 0 && (
            <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <div
                  key={stat.id ?? i}
                  className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{stat.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {previewCardRows && previewCardRows.length > 0 && (
          <div className="relative">
            <div className="rounded-[2rem] bg-white p-4 shadow-2xl ring-1 ring-slate-200">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-rose-100 via-pink-50 to-white p-8">
                <div className="grid gap-4">
                  {previewCardRows.map((row, i) =>
                    row.highlighted ? (
                      <div
                        key={row.id ?? i}
                        className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm"
                      >
                        <p className="text-sm text-white/70">{row.label}</p>
                        <p className="mt-1 text-lg font-semibold">{row.value}</p>
                      </div>
                    ) : (
                      <div key={row.id ?? i} className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{row.label}</p>
                        <p className="mt-1 text-lg font-semibold">{row.value}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
