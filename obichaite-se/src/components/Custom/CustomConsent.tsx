'use client'

import React from 'react'
import { GenericButton, GenericParagraph } from '../Generic'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks'
import { setConsentActive } from '@/store/features/root'
import { GoogleTagManager } from '../GoogleTagManager'
import { useState } from 'react'

const CustomConsent = ({ initialConsent }: { initialConsent: boolean }) => {
  const dispatch = useAppDispatch()
  const [hasConsent, setHasConsent] = useState(initialConsent)
  const isActive = useAppSelector((state) => state.root.consentActive)

  const handleAccept = () => {
    document.cookie = 'cookie-consent=granted; path=/; max-age=15552000' // 6 месеца
    setHasConsent(true)
    dispatch(setConsentActive(false))
  }
  return (
    <>
      {!hasConsent && (
        <div
          className={`fixed left-4 bottom-4 z-[10]
    transition-transform duration-300 ease-in-out ${isActive ? 'translate-x-0' : '-translate-x-[420px]'}`}
        >
          <div className="bg-white shadow-md px-3 md:px-6 py-6 rounded-[12px] flex flex-col gap-m w-full max-w-[320px]">
            <GenericParagraph pType="small" textColor="text-bordo" extraClass="text-center">
              Този сайт използва бисквитки и подобни на тях технологии, за да направи преживяването
              Ви по-приятно
            </GenericParagraph>

            <div className="mx-auto flex flex-col gap-m">
              <div className="mx-auto">
                <GenericParagraph pType="small" textColor="text-bordo" extraClass="text-center">
                  Разберете повече от{' '}
                  <Link href="/politika-za-biskvitki" className="text-brown underline">
                    Политика на бисквитки
                  </Link>
                </GenericParagraph>
              </div>

              <GenericButton click={handleAccept}>РАЗБРАХ</GenericButton>
            </div>
          </div>
        </div>
      )}

      {hasConsent && <GoogleTagManager />}
    </>
  )
}

export default CustomConsent
