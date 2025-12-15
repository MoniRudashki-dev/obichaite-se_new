'use client'

import { Product } from '@/payload-types'
import React, { useState } from 'react'
import { GenericButton, GenericHeading } from '../Generic'
import ProductCard from './ProductCard'
import { FiltersIcon } from '@/assets/icons'
import { sortProducts } from '@/utils/sortProducts'

const ProductsCardGridWithFilters = ({
  products,
  heading,
}: {
  products: Product[]
  heading: string
}) => {
  const [slideIndex, setSlideIndex] = useState(0)
  const [openFilters, setOpenFilters] = useState(false)
  const [currentFilter, setCurrentFilter] = useState<
    '' | 'bestseller' | 'discount' | 'new' | 'price-asc' | 'price-desc'
  >('')
  const slicesLenght = Math.ceil(products.length / 24)

  const slicedProducts = Array.from({ length: slicesLenght }, (_, index) => {
    const start = index * 24
    const end = start + 24

    let productsToRender = products
    if (currentFilter !== '') productsToRender = sortProducts(products, currentFilter)

    return productsToRender.slice(start, end)
  })

  const slicesLists = slicedProducts.map((slice, index) => (
    <div key={index} className="w-full flex flex-col gap-m">
      <ul className="w-full grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 md:gap-6 gap-x-1 gap-y-4">
        {slice.map((product) => (
          <li key={product.id} className="w-full relative">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  ))

  return (
    <section className="w-full py-10 md:py-20 relative min-h-[100svh] flex white-pink-background">
      <div className="w-full flex flex-col gap-m content_wrapper">
        <div className="w-full flex justify-between items-center">
          <GenericHeading
            headingType="h2"
            fontStyle="font-sansation font-[700]"
            textColor="text-bordo"
            extraClass="border-b-[1px] border-b-bordo/80"
          >
            <h2>{heading}</h2>
          </GenericHeading>

          <div className="w-fit relative">
            <button
              className="w-full flex justify-between items-center bg-brown/80 py-2 px-4 gap-2 hover:bg-brown
            transition-colors duration-500"
              aria-label="Филтри"
              onClick={() => setOpenFilters((prev) => !prev)}
            >
              <p className="text-white hidden md:block">Филтри</p>

              <div className="flex justify-center items-center">
                <FiltersIcon />
              </div>
            </button>

            <div
              className={`
                    absolute top-full right-0 z-[4] min-w-[280px] md:min-w-[300px]
                    bg-white px-1 py-2
                    origin-top-right transform
                    transition-[transform,opacity] duration-500 ease-out
                    ${openFilters ? 'scale-100 opacity-100 pointer-events-auto shadow-lg' : 'scale-75 opacity-0 pointer-events-none'}
                  `}
            >
              <button
                className={`w-full py-3 px-2 relative hover:bg-brown/20 before:absolute 
                    before:left-[-4px] before:top-0 before:bottom-0 before:w-[6px] hover:before:bg-brown
                    transition-all duration-500 ease-in-out before:transition-all before:duration-500 before:ease-in-out
              ${currentFilter === 'price-asc' && 'bg-brown/20'}`}
                aria-label="Цена възходящо"
                onClick={() => {
                  setCurrentFilter('price-asc')
                  setOpenFilters(false)
                }}
              >
                {currentFilter === 'price-asc' && (
                  <div className="absolute left-[-4px] top-0 bottom-0 w-[6px] bg-brown"></div>
                )}
                <p className="text-brown" aria-label="Цена възходящо">
                  Цена възходящо
                </p>
              </button>
              <button
                aria-label="Цена низходящо"
                className={`w-full py-3 px-2 relative hover:bg-brown/20 before:absolute 
                    before:left-[-4px] before:top-0 before:bottom-0 before:w-[6px] hover:before:bg-brown
                    transition-all duration-500 ease-in-out before:transition-all before:duration-500 before:ease-in-out
              ${currentFilter === 'price-desc' && 'bg-brown/20'}`}
                onClick={() => {
                  setCurrentFilter('price-desc')
                  setOpenFilters(false)
                }}
              >
                {currentFilter === 'price-desc' && (
                  <div className="absolute left-[-4px] top-0 bottom-0 w-[6px] bg-brown"></div>
                )}
                <p className="text-brown">Цена низходящо</p>
              </button>
              <button
                aria-label="Най-нови"
                className={`w-full py-3 px-2 relative hover:bg-brown/20 before:absolute 
                    before:left-[-4px] before:top-0 before:bottom-0 before:w-[6px] hover:before:bg-brown
                    transition-all duration-500 ease-in-out before:transition-all before:duration-500 before:ease-in-out
            ${currentFilter === 'new' && 'bg-brown/20'}`}
                onClick={() => {
                  setCurrentFilter('new')
                  setOpenFilters(false)
                }}
              >
                {currentFilter === 'new' && (
                  <div className="absolute left-[-4px] top-0 bottom-0 w-[6px] bg-brown"></div>
                )}
                <p className="text-brown">Най-нови</p>
              </button>
              <button
                aria-label="Най-продавани"
                className={`w-full py-3 px-2 relative hover:bg-brown/20 before:absolute 
                    before:left-[-4px] before:top-0 before:bottom-0 before:w-[6px] hover:before:bg-brown
                    transition-all duration-500 ease-in-out before:transition-all before:duration-500 before:ease-in-out
              ${currentFilter === 'bestseller' && 'bg-brown/20'}`}
                onClick={() => {
                  setCurrentFilter('bestseller')
                  setOpenFilters(false)
                }}
              >
                {currentFilter === 'bestseller' && (
                  <div className="absolute left-[-4px] top-0 bottom-0 w-[6px] bg-brown"></div>
                )}
                <p className="text-brown">Най-продавани</p>
              </button>
              <button
                aria-label="Промотирани"
                className={`w-full py-3 px-2 relative hover:bg-brown/20 before:absolute 
                    before:left-[-4px] before:top-0 before:bottom-0 before:w-[6px] hover:before:bg-brown
                    transition-all duration-500 ease-in-out before:transition-all before:duration-500 before:ease-in-out
              ${currentFilter === 'discount' && 'bg-brown/20'}`}
                onClick={() => {
                  setCurrentFilter('discount')
                  setOpenFilters(false)
                }}
              >
                {currentFilter === 'discount' && (
                  <div className="absolute left-[-4px] top-0 bottom-0 w-[6px] bg-brown"></div>
                )}
                <p className="text-brown">Промотирани</p>
              </button>
            </div>
          </div>
        </div>

        {slicesLists.slice(0, slideIndex + 1)}

        {slicesLists.length > 1 && slicesLists.length > slideIndex + 1 && (
          <div className="w-full flex justify-center items-center">
            <GenericButton
              ariaLabel={'Покажи още'}
              click={() => {
                setSlideIndex((prev) => {
                  return prev + 1
                })
              }}
              disabled={slideIndex === slicesLenght - 1}
              variant="primary"
              type="button"
            >
              Покажи още
            </GenericButton>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductsCardGridWithFilters
