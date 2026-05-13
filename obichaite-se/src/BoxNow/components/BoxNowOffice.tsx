'use client'

import React, { useCallback, useState } from 'react'
import { GenericParagraph } from '@/components/Generic'
import { ArrowIcon, SearchLogo } from '@/assets/icons'
import { BoxnowLocker } from '../types'
import InfiniteScrollContainer from './InfiniteScrollContainer'

const BoxNowOfficeDropdown = ({
  cities,
  setter,
  city,
}: {
  cities: BoxnowLocker[]
  setter: (city: BoxnowLocker) => void
  city: BoxnowLocker
  office: BoxnowLocker | null
  setOffice: (office: BoxnowLocker) => void
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<BoxnowLocker[]>(cities)
  const [slice, setSlice] = useState(0)
  const setSliceHandler = useCallback(() => {
    setSlice((prev) => prev + 1)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    setSearchResults(
      cities.filter((city) => city.name.toLowerCase().includes(e.target.value.toLowerCase())),
    )
  }

  const resultsContent = searchResults.map((city, index) => {
    return (
      <li key={`city-${city.id}-${index}`}>
        <button
          className="w-full flex px-2 text-center py-2 border-[1px] border-black/50"
          onClick={() => {
            setter({ id: city.id, name: city.name })
            setActiveDropdown(false)
          }}
          type="button"
        >
          <GenericParagraph extraClass="w-full text-left">{city.name}</GenericParagraph>
        </button>
      </li>
    )
  })

  return (
    <div className="w-full flex flex-col gap-s">
      <div className="">
        <div className="w-full flex items-center bg-gray-200 rounded-[8px] py-2 px-2 border-[1px] border-black/50">
          <button
            className="w-full flex items-center"
            onClick={() => {
              setActiveDropdown((prev) => !prev)
              setSearchValue('')
              setSlice(0)
            }}
            type="button"
          >
            <GenericParagraph>{!!city ? city.name : '<Изберете автомат>'}</GenericParagraph>

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
                placeholder="Напишете град/офис и изберете"
                className="w-full border-[1px] border-black/50 
                bg-purpleBackground text-white placeholder:text-white/80 py-2 px-2 placeholder:text-[12px] md:placeholder:text-[14px]"
                value={searchValue}
                onChange={(e) => handleSearchChange(e)}
              />
            </li>

            <InfiniteScrollContainer
              items={resultsContent.slice(0, (slice + 1) * 50)}
              setSliceHandler={setSliceHandler}
            />
          </ul>
        )}
      </div>
    </div>
  )
}

export default BoxNowOfficeDropdown
