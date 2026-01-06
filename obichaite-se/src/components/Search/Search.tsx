'use client'

import React, { useEffect, useState } from 'react'
import { GenericButton, GenericImage, GenericParagraph } from '../Generic'
import { Product } from '@/payload-types'
import { containsQuery } from '@/utils/translate'
import { CloseCircle } from '@/assets/icons'
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks'
import { setOpenSearch } from '@/store/features/root'
import { PromotionsCardsGrid } from '../Product'
import { SEARCH } from '@/services/anatilitics'

const Search = ({ products }: { products: Product[] }) => {
  const dispatch = useAppDispatch()
  const searchOpen = useAppSelector((state) => state.root.openSearch)
  const [inputValue, setInputValue] = useState('')
  const [searchResults, setSearchResults] = useState<null | Product[]>(null)
  const [slideIndex, setSlideIndex] = useState(1)

  const handleSearch = () => {
    if (inputValue === '') {
      setInputValue('')
      setSearchResults(null)
      return
    }

    const productResults = products.filter((item) => containsQuery(item.title, inputValue))

    setSearchResults(productResults)

    //GTM TRIGGER SEARCH
    SEARCH(inputValue)
  }

  useEffect(() => {
    if (searchOpen) return

    setInputValue('')
    setSearchResults(null)
  }, [searchOpen])

  return (
    <section
      className={`fixed z-[12]  top-0 left-0 right-0 flex flex-col border-b-[2px] border-brown white_background_bubble
    ${searchOpen ? 'translate-y-0' : 'translate-y-[-100%]'} transition-[transform] duration-500 ease-in-out`}
    >
      <div className="absolute top-4 right-4 flex justify-center items-center">
        <button
          className="w-[32px] h-[32px] md:w-[48px] md:h-[48px]"
          onClick={() => {
            setInputValue('')
            setSearchResults(null)
            dispatch(setOpenSearch(false))
          }}
          aria-label="Затвори търсенето"
          type="button"
        >
          <CloseCircle />
        </button>
      </div>
      <div className="w-full md:w-auto px-6 md:px-[unset] m-auto flex flex-col gap-m justify-center items-center py-4 md:py-10">
        <GenericImage
          src={'/logo-full.webp'}
          alt={'logo'}
          wrapperClassName="w-[156px] h-[56px] md:w-[220px] md:h-[80px] flex items-center justify-center relative"
          imageClassName="w-full h-full object-contain"
          fill={true}
        />

        <div className="flex flex-col md:flex-row gap-4 md:gap-[unset] justify-center items-start w-full">
          <input
            className="w-full md:min-w-[300px] h-[48px] xl:min-w-[400px] p-1 outline-none bg-transparent placeholder:text-brown font-sansation font-[400] 
        text-[16px] xl:text-[18px] placeholder:font-sansation placeholder:text-brown/80 border-b-[1px] border-brown"
            type="text"
            placeholder="Потърси артикул.."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></input>

          <button
            className="w-full md:w-auto px-6 py-3 bg-brown text-white"
            onClick={() => handleSearch()}
            type="button"
            aria-label="Търсене"
            title="Търсене"
          >
            Търсене
          </button>
        </div>
      </div>

      <div
        className={`absolute top-full left-0 right-0 transition-[opacity] duration-700 ease-in-out border-b-[2px] border-brown pb-10 white-pink-background
            ${!!searchResults && searchResults.length > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <PromotionsCardsGrid
          products={searchResults?.slice(0, slideIndex * 12) || []}
          heading={'Резултати от търсенето'}
          haveBackground={false}
        />

        {searchResults && searchResults.length > slideIndex * 12 && (
          <div className="absolute bottom-3 w-full flex justify-center items-center">
            <GenericButton
              ariaLabel={'Покажи още'}
              click={() => {
                setSlideIndex((prev) => {
                  return prev + 1
                })
              }}
              disabled={slideIndex === Math.ceil(searchResults.length / 12)}
              variant="primary"
              type="button"
            >
              Покажи още
            </GenericButton>
          </div>
        )}
      </div>

      {!!searchResults && searchResults.length === 0 && (
        <div className="border-t-[1px] border-brown w-full mt-8 py-4">
          <GenericParagraph
            fontStyle="font-sansation font-[400]"
            pType="regular"
            textColor="text-brown"
            extraClass="w-full text-center"
          >
            Няма намерeни резултати
          </GenericParagraph>
        </div>
      )}
    </section>
  )
}

export default Search
