'use client'

import { DeleteIcon, MinusIcon, PlusIcon } from '@/assets/icons'
import { useAppDispatch } from '@/hooks/redux-hooks'
import { Media, Product } from '@/payload-types'
import {
  addOrderQuantity,
  removeOrderQuantity,
  removeProductFromShoppingCart,
} from '@/store/features/checkout'
import React from 'react'
import { GenericImage, GenericParagraph } from '../Generic'
import { priceToEuro } from '@/utils/calculatePriceFromLvToEuro'

const CheckoutProduct = ({ product }: { product: Product & { orderQuantity: number } }) => {
  const dispatch = useAppDispatch()
  const media = product?.mediaArray?.[0].file as Media

  return (
    <li key={product.id} className="w-full px-3">
      <article className="w-full flex flex-col md:flex-row relative border-[1px] border-brown rounded-[16px]">
        <div className="absolute right-2 top-2 z-[3]">
          <button
            className="w-[32px] h-[32px] flex justify-center items-center hover:opacity-50 transition-opacity duration-500 ease-in-out"
            aria-label="Премахни артикул"
            onClick={() => {
              dispatch(removeProductFromShoppingCart(product))
            }}
          >
            <DeleteIcon />
          </button>
        </div>
        <div className="w-full md:w-[30%] md:min-w-[30%] p-2 rounded-[12px] overflow-hidden">
          <GenericImage
            src={media.url as string}
            alt={media.alt}
            fill={true}
            wrapperClassName="w-full aspect-square relative rounded-[12px] overflow-hidden border-[1px] border-brown/20"
            imageClassName="w-full h-full object-contain"
          />
        </div>
        <div className="w-full md:w-[70%] md:min-w-[70%] flex flex-col pt-3">
          <GenericParagraph
            fontStyle="font-sansation font-[700] italic"
            pType="large"
            textColor="text-brown"
            extraClass="text-center md:text-left md:max-w-[80%] max-w-[95%] mx-auto md:mx-[unset] md:pl-2"
          >
            <h3>{product.title}</h3>
          </GenericParagraph>

          <div className="mt-auto flex justify-between items-center px-2 py-3">
            <div className="flex justify-center items-center gap-3">
              <button
                className="p-2 max-w-[32px] max-h-[32px] flex justify-center items-center rounded-full border-[1px] border-brown
                  disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => dispatch(removeOrderQuantity({ id: product.id }))}
                disabled={product.orderQuantity === 1}
                aria-label="Премахни единица"
                title="Премахни единица"
                aria-disabled={product.orderQuantity === 1}
              >
                <MinusIcon />
              </button>

              <div className="border-[1px] bg-brown border-brown px-3 py-1 flex justify-center items-center">
                <GenericParagraph
                  fontStyle="font-kolka font-[500]"
                  pType="regular"
                  textColor="text-white"
                  extraClass="text-center"
                >
                  {product.orderQuantity}
                </GenericParagraph>
              </div>

              <button
                className="p-2 max-w-[32px] max-h-[32px] flex justify-center items-center rounded-full border-[1px] border-brown"
                onClick={() => {
                  dispatch(addOrderQuantity({ id: product.id }))
                }}
                aria-label="Добави единица"
                title="Добави единица"
                aria-disabled={false}
                disabled={false}
              >
                <PlusIcon />
              </button>
            </div>

            <div>
              <GenericParagraph
                fontStyle="font-sansation font-[700]"
                pType="regular"
                textColor="text-bordo"
              >
                <>
                  {product?.promoPrice ? (
                    <>
                      {priceToEuro(product.promoPrice * product.orderQuantity)}€ (
                      {(product.promoPrice * product.orderQuantity).toFixed(2)} лв.)
                    </>
                  ) : (
                    <>
                      {priceToEuro(product.price! * product.orderQuantity)}€ (
                      {(product.price! * product.orderQuantity).toFixed(2)} лв.)
                    </>
                  )}
                </>
              </GenericParagraph>
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}

export default CheckoutProduct
