'use client'

import GenericHeading from '@/components/Generic/GenericHeading'
import GenericParagraph from '@/components/Generic/GenericParagraph'
import { LandingBlockHero } from '@/payload-types'
import React from 'react'

const scrollToInquiry = () => {
  if (typeof document === 'undefined') return
  const target = document.getElementById('inquiry-form')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export const LandingBlockHeroComponent: React.FC<LandingBlockHero> = ({
  badge,
  heading,
  description,
  primaryButton,
  secondaryButton,
  stats,
  previewCardRows,
}) => {
  const hasSecondary = Boolean(secondaryButton?.label && secondaryButton?.href)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pinkShade/30 via-white to-pink/10">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-pinkShade/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {badge && (
              <span className="inline-flex rounded-full bg-pink/25 px-4 py-1 font-sansation font-[700] text-sm text-bordo">
                {badge}
              </span>
            )}

            <GenericHeading
              headingType="h1"
              fontStyle="font-sansation font-[700]"
              textColor="text-brown"
              align="text-left"
              customStyles={true}
              extraClass="mt-6 text-[32px] sm:text-[40px] md:text-[44px] xl:text-[52px] 2xl:text-[56px] leading-[110%]"
            >
              {heading}
            </GenericHeading>

            <GenericParagraph
              pType="large"
              fontStyle="font-sansation font-[400]"
              textColor="text-brown"
              extraClass="mt-6 max-w-2xl"
            >
              {description}
            </GenericParagraph>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={scrollToInquiry}
                className="rounded-[24px] red_background px-6 py-3 text-center font-sansation font-[700] uppercase text-sm text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {primaryButton?.label || 'Запитай сега'}
              </button>

              {hasSecondary && (
                <a
                  href={secondaryButton!.href!}
                  className="rounded-[24px] border border-brown/30 bg-white px-6 py-3 text-center font-sansation font-[700] uppercase text-sm text-brown transition hover:bg-pinkShade/30"
                >
                  {secondaryButton!.label}
                </a>
              )}
            </div>

            {stats && stats.length > 0 && (
              <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <div
                    key={stat.id ?? i}
                    className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-brown/15"
                  >
                    <GenericParagraph
                      fontStyle="font-sansation font-[700]"
                      pType="large"
                      textColor="text-bordo"
                    >
                      {stat.value}
                    </GenericParagraph>
                    <GenericParagraph
                      pType="small"
                      fontStyle="font-sansation font-[400]"
                      textColor="text-brown"
                      extraClass="mt-1"
                    >
                      {stat.description}
                    </GenericParagraph>
                  </div>
                ))}
              </div>
            )}
          </div>

          {previewCardRows && previewCardRows.length > 0 && (
            <div className="relative">
              <div className="rounded-[2rem] bg-white p-4 shadow-2xl ring-1 ring-brown/15">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-pinkShade/50 via-pink/10 to-white p-8">
                  <div className="grid gap-4">
                    {previewCardRows.map((row, i) =>
                      row.highlighted ? (
                        <div
                          key={row.id ?? i}
                          className="rounded-2xl red_background p-5 text-white shadow-sm"
                        >
                          <GenericParagraph
                            pType="small"
                            fontStyle="font-sansation font-[400]"
                            textColor="text-white"
                            extraClass="opacity-80"
                          >
                            {row.label}
                          </GenericParagraph>
                          <GenericParagraph
                            fontStyle="font-sansation font-[700]"
                            pType="regular"
                            textColor="text-white"
                            extraClass="mt-1"
                          >
                            {row.value}
                          </GenericParagraph>
                        </div>
                      ) : (
                        <div key={row.id ?? i} className="rounded-2xl bg-white p-5 shadow-sm">
                          <GenericParagraph
                            pType="small"
                            fontStyle="font-sansation font-[400]"
                            textColor="text-mixPink"
                          >
                            {row.label}
                          </GenericParagraph>
                          <GenericParagraph
                            fontStyle="font-sansation font-[700]"
                            pType="regular"
                            textColor="text-brown"
                            extraClass="mt-1"
                          >
                            {row.value}
                          </GenericParagraph>
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
    </section>
  )
}
