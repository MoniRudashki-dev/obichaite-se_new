'use client'

import React, { useCallback, useState } from 'react'
import { GenericParagraph } from '@/components/Generic'
import { ArrowIcon, SearchLogo } from '@/assets/icons'
import { SpeedySite } from '../types'
import { InfiniteScrollContainer } from '@/Econt/components'

const SpeedyAddressDropdown = ({
  cities,
  setter,
  city,
  address,
  setAdrress,
}: {
  cities: SpeedySite[]
  setter: (city: SpeedySite) => void
  city: SpeedySite
  address: string
  setAdrress: (adress: string) => void
}) => {
  const [activeDropdown, setActiveDropdown] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<
    {
      id: number
      name: string
    }[]
  >(() => {
    const citiesNameExtracted = cities.map((city) => {
      return {
        id: city.id,
        name: city.name?.split(' ')[0],
      }
    })

    const setOfCities = Array.from(
      new Map(citiesNameExtracted.map((item) => [item.name, item])).values(),
    )

    return setOfCities
  })
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
          <GenericParagraph textColor="text-brown" extraClass="w-full text-left">
            {city.name}
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
              {!!city ? city.name : '<Изберете град>'}
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
                placeholder="Напишете град/офис и изберете"
                className="w-full border-[1px] border-black/50
                bg-white text-bordo placeholder:text-bordo/50 py-2 px-2 placeholder:text-[12px] md:placeholder:text-[14px]"
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

export default SpeedyAddressDropdown
