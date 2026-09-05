'use client'

import React, { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { EcontCity } from '../types'
import { GenericParagraph } from '@/components/Generic'
import { ArrowIcon, SearchLogo } from '@/assets/icons'
import InfiniteScrollContainer from './InfiniteScrollContainer'
import { buildSettlementIndex, searchSettlements, type Settlement } from '@/utils/settlementSearch'

const PAGE_SIZE = 50

const EcontAddressDropdown = ({
  settlements,
  setter,
  city,
  address,
  setAdrress,
}: {
  settlements: Settlement[]
  setter: (city: EcontCity) => void
  city: EcontCity | null
  address: string
  setAdrress: (adress: string) => void
}) => {
  const [activeDropdown, setActiveDropdown] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [slice, setSlice] = useState(0)

  // Транслитерацията на ~6000 имена става веднъж, не на всеки натиснат клавиш.
  const index = useMemo(() => buildSettlementIndex(settlements), [settlements])

  // Подредбата остава отзивчива при бързо писане върху дълъг списък.
  const deferredSearchValue = useDeferredValue(searchValue)
  const searchResults = useMemo(
    () => searchSettlements(index, deferredSearchValue),
    [index, deferredSearchValue],
  )

  const setSliceHandler = useCallback(() => {
    setSlice((prev) => prev + 1)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    // Нова заявка → обратно към първата страница.
    setSlice(0)
  }

  // Първо режем, после мапваме към JSX — иначе се създават хиляди елементи на клавиш.
  const visibleResults = searchResults.slice(0, (slice + 1) * PAGE_SIZE)

  const resultsContent = visibleResults.map((settlement) => {
    return (
      <li key={`settlement-${settlement.id}-${settlement.label}`}>
        <button
          className="w-full flex px-2 text-center py-2 border-[1px] border-black/50"
          onClick={() => {
            setter({ id: settlement.id, name: settlement.label })
            setActiveDropdown(false)
          }}
          type="button"
        >
          <GenericParagraph textColor="text-brown" extraClass="w-full text-left">
            {settlement.label}
          </GenericParagraph>
        </button>
      </li>
    )
  })

  return (
    <div className="w-full flex flex-col gap-s">
      <div className="">
        <div className="w-full flex items-center bg-white/80 rounded-[8px] py-2 px-2 border-[1px] border-black/50">
          <button
            className="w-full flex items-center"
            onClick={() => {
              setActiveDropdown((prev) => !prev)
              setSearchValue('')
              setSlice(0)
            }}
            type="button"
          >
            <GenericParagraph textColor="text-brown">
              {!!city ? city.name : '<Изберете населено място>'}
            </GenericParagraph>

            <div
              className={`flex justify-center items-center size-6 ml-auto ${
                !!city ? 'rotate-[270deg]' : 'rotate-90'
              }`}
            >
              <ArrowIcon />
            </div>
          </button>
        </div>
        {activeDropdown && (
          <ul className="flex flex-col gap-3 border-[1px] border-black/50">
            <li className="w-full relative">
              <div className="z-[5] absolute right-2 top-2 flex justify-center items-center size-6">
                <SearchLogo />
              </div>
              <input
                type="text"
                placeholder="Напишете населено място"
                className="w-full border-[1px] border-black/50
                bg-white text-bordo placeholder:text-bordo/50 py-2 px-2 placeholder:text-[12px] md:placeholder:text-[14px]"
                value={searchValue}
                onChange={(e) => handleSearchChange(e)}
              />
            </li>

            {resultsContent.length > 0 ? (
              <InfiniteScrollContainer
                items={resultsContent}
                setSliceHandler={setSliceHandler}
                resetKey={deferredSearchValue}
              />
            ) : (
              <li className="w-full px-2 py-3">
                <GenericParagraph textColor="text-brown" extraClass="w-full text-left">
                  Няма намерено населено място
                </GenericParagraph>
              </li>
            )}
          </ul>
        )}
      </div>
      {city && (
        <div>
          <div className="w-full flex items-center bg-white/80 rounded-[8px] py-2 px-2 border-[1px] border-black/50">
            <textarea
              name="Address"
              placeholder={'<Въведете адрес>'}
              value={address}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdrress(e.target.value)}
              className={`w-full rounded-[12px]
                        focus:outline focus:outline-1 focus:outline-black p-3 font-georgia font-[400] !text-black outline-none
                      placeholder:text-black/80
                      `}
              rows={6}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EcontAddressDropdown
