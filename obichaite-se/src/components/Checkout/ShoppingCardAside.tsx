'use client'

import React, { use, useEffect } from 'react'
import { GenericImage, GenericParagraph } from '../Generic'
import { ArrowIcon, CloseCircle, DeleteIcon, MinusIcon, PlusIcon } from '@/assets/icons'
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks'
import {
  addOrderQuantity,
  removeOrderQuantity,
  removeProductFromShoppingCart,
  setShoppingCardOpen,
  setUserHaveDiscount,
} from '@/store/features/checkout'
import { useCheckout } from '@/hooks/useCheckout'
import { priceToEuro } from '@/utils/calculatePriceFromLvToEuro'
import { Media } from '@/payload-types'
import { removeFromCart } from '@/action/products/shoppingCart'
import Link from 'next/link'
import { checkForDiscount } from '@/action/checkout'

const ShoppingCardAside = () => {
  const dispatch = useAppDispatch()
  const { removeFromLocalStorage } = useCheckout()
  const userId = useAppSelector((state) => state.root.user?.id)
  const userEmail = useAppSelector((state) => state.root.user?.email)
  const { calculateTotalPrice, calculateRemainSum } = useCheckout()
  const shoppingCardOpen = useAppSelector((state) => state.checkout.shoppingCardOpen)
  const products = useAppSelector((state) => state.checkout.products)
  const { userHaveDiscount } = useAppSelector((state) => state.checkout)

  const handleCheckDiscount = async () => {
    const didUserHaveDiscount = await checkForDiscount(userEmail as string)

    if (!!didUserHaveDiscount.data) {
      dispatch(setUserHaveDiscount(true))
    } else {
      dispatch(setUserHaveDiscount(false))
    }
  }

  useEffect(() => {
    if (!userEmail) return

    handleCheckDiscount()
  }, [userEmail])

  const productsContent = products.map((product) => {
    const media = product?.mediaArray?.[0].file as Media
    const productPriceLength = product.promoPrice
      ? product.promoPrice.toString().length
      : product.price?.toString().length

    return (
      <li key={product.id} className="w-full p-3">
        <article className="w-full flex flex-col md:flex-row items-center relative border-[1px] border-brown rounded-[16px]">
          <div className="absolute right-2 top-2 z-[3]">
            <button
              className="w-[32px] h-[32px] flex justify-center items-center hover:opacity-50 transition-opacity duration-500 ease-in-out"
              aria-label="Премахни артикул"
              onClick={() => {
                dispatch(removeProductFromShoppingCart(product))
                if (!!userId) {
                  removeFromCart(product.id, userId)
                } else {
                  removeFromLocalStorage(product)
                }
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
              wrapperClassName="w-full aspect-square relative rounded-[12px] overflow-hidden"
              imageClassName="w-full h-full object-contain"
            />
          </div>
          <div className="w-full md:w-[70%] md:min-w-[70%] flex flex-col">
            <GenericParagraph
              fontStyle="font-sansation font-[700] italic"
              pType="large"
              textColor="text-brown"
              extraClass="line-clamp-3 min-h-[54px] md:min-h-[72px] pt-3 text-center md:text-left md:max-w-[80%] max-w-[95%] mx-auto md:mx-[unset] md:pl-2"
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
                  pType="custom"
                  textColor="text-bordo"
                  extraClass={`text-[16px] ${!!productPriceLength && productPriceLength < 3 ? 'md:text-[20px]' : 'md:text-[18px]'} leading-[110%]`}
                >
                  <>
                    {product?.promoPrice ? (
                      <>
                        {(product.promoPrice * product.orderQuantity).toFixed(2)} лв. (
                        {priceToEuro(product.promoPrice * product.orderQuantity)})€
                      </>
                    ) : (
                      <>
                        {(product.price! * product.orderQuantity).toFixed(2)} лв. (
                        {priceToEuro(product.price! * product.orderQuantity)})€
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
  })

  const remain = Number(calculateRemainSum().toFixed(0))

  let totalPrice = (
    <>
      {calculateTotalPrice().toFixed(2)} лв ({priceToEuro(calculateTotalPrice())}€)
    </>
  )
  if (userHaveDiscount) {
    totalPrice = (
      <>
        {(calculateTotalPrice() * 0.9).toFixed(2)} лв ({priceToEuro(calculateTotalPrice() * 0.9)}€)
      </>
    )
  }

  return (
    <aside
      className={`fixed top-0 bottom-0 right-0 w-full max-w-[500px] bg-white z-[12] flex flex-col
        transition-transform duration-500 ease-in-out
        ${shoppingCardOpen ? 'translate-x-0' : 'translate-x-[100%]'}`}
    >
      <div className="w-full flex relative justify-center items-center py-4">
        <GenericParagraph
          fontStyle="font-sansation font-[700]"
          pType="large"
          textColor="text-bordo"
        >
          Твоята Количка
        </GenericParagraph>

        <button
          className="absolute right-4 top-[50%] translate-y-[-50%] flex justify-center items-center w-[24px] h-[24px]"
          onClick={() => {
            dispatch(setShoppingCardOpen(false))
          }}
          aria-label="Затвори количката"
          title="Затвори количката"
          aria-disabled={false}
          disabled={false}
        >
          <CloseCircle />
        </button>
      </div>
      <div className="w-full flex justify-center items-center red_background py-4">
        <GenericParagraph
          fontStyle="font-kolka font-[500]"
          pType="small"
          textColor="text-white"
          extraClass="px-1 text-center"
        >
          {remain < 0 ? (
            <span className="uppercase">Доставката е безплатна!</span>
          ) : (
            <>
              Добави артикули за още {calculateRemainSum().toFixed(2)} лева и доставката ще е
              безплатна
            </>
          )}
        </GenericParagraph>
      </div>

      <div className="flex-1 white_background_bubble overflow-y-auto">
        {products.length === 0 ? (
          <GenericParagraph
            fontStyle="font-kolka font-[500]"
            pType="regular"
            textColor="text-bordo"
            extraClass="text-center py-4"
          >
            Вашата количка е празна
          </GenericParagraph>
        ) : (
          <ul className="w-full flex flex-col">{productsContent}</ul>
        )}
      </div>

      {userHaveDiscount && (
        <div className="bg-bordo text-white text-center py-[4px] md:py-[3px]">
          <p className='text-[12px] md:text-[14px]'>* Вие получавате -10% отстъпка от крайната цена!.</p>
        </div>
      )}
      <div className="w-full py-2 px-4 bg-black/20">
        <Link href="/checkout">
          <button
            className="w-full rounded-[24px] flex  justify-between items-center red_background py-4 px-4
          [&>div>div>svg]:hover:animate-bounce disabled:cursor-not-allowed disabled:opacity-50
          "
            aria-label="Към поръчка"
            disabled={products.length === 0}
            onClick={() => {
              dispatch(setShoppingCardOpen(false))
            }}
          >
            <div className="flex justify-center items-center">
              <GenericParagraph
                fontStyle="font-sansation font-[700]"
                pType="small"
                textColor="text-white"
                extraClass="uppercase"
              >
                Към поръчка
              </GenericParagraph>

              <div className="w-[20px] h-[20px] flex justify-center items-center ml-1">
                <ArrowIcon color="white" />
              </div>
            </div>

            <div className="flex justify-center items-center">
              <GenericParagraph
                fontStyle="font-kolka font-[500]"
                pType="small"
                textColor="text-white"
              >
                {totalPrice}
              </GenericParagraph>
            </div>
          </button>
        </Link>
      </div>
    </aside>
  )
}

export default ShoppingCardAside
