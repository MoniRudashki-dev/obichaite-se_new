'use client'

import { Category, Media, Product } from '@/payload-types'
import React, { useState } from 'react'
import { GenericButton, GenericHeading, GenericImage, GenericParagraph } from '../Generic'
import { priceToEuro } from '@/utils/calculatePriceFromLvToEuro'
import { BestSellerIcon, DiscountIcon, ShoppingCartIcon } from '@/assets/icons'
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks'
import { addProductToShoppingCart } from '@/store/features/checkout'
import Link from 'next/link'
import { setNotification } from '@/store/features/notifications'
import { addToCart } from '@/action/products/shoppingCart'
import { useCheckout } from '@/hooks/useCheckout'
import { ADD_TO_CART } from '@/services/anatilitics'

const ProductCard = ({ product }: { product: Product }) => {
  const dispatch = useAppDispatch()
  const { addToLocalStorage } = useCheckout()
  const userId = useAppSelector((state) => state.root.user?.id)
  const shoppingCartProducts = useAppSelector((state) => state.checkout.products)
  const productExistsInCart = shoppingCartProducts.find((item) => item.id === product.id)
  const {
    mediaArray,
    title,
    category,
    // shortDescription,
    bestSeller,
    promoPrice,
    havePriceRange,
    priceRange,
    price,
  } = product

  const mediaToShow = mediaArray?.[0].file as Media

  const [isHover, setIsHover] = useState(false)

  const priceSection = !!price ? (
    <div className="w-full md:max-w-[40%] flex flex-col px-1 rounded-4 bg-white rounded-[4px]">
      <GenericParagraph
        pType="large"
        fontStyle="font-sansation font-[700]"
        textColor="text-brown"
        extraClass="text-center"
      >
        <span className={`${!!promoPrice && 'line-through text-[14px]'}`}>
          {priceToEuro(price)}
        </span>
        <span className={`${!!promoPrice && 'text-[16px] md:text-[20px]'}`}>
          {!!promoPrice && ` ${priceToEuro(promoPrice)}`}€
        </span>
      </GenericParagraph>
      <div className="w-full h-[1px] bg-brown/80"></div>
      <GenericParagraph
        pType="large"
        fontStyle="font-sansation font-[700]"
        textColor="text-brown"
        extraClass="text-center"
      >
        <span className={`${!!promoPrice && 'line-through text-[14px]'}`}>{price.toFixed(2)}</span>
        <span className={`${!!promoPrice && 'text-[16px] md:text-[20px]'}`}>
          {promoPrice && ` ${promoPrice.toFixed(2)}`}лв
        </span>
      </GenericParagraph>
    </div>
  ) : (
    <div className="w-full max-w-[40%] flex flex-col px-1">
      <GenericParagraph
        pType="large"
        fontStyle="font-sansation font-[700]"
        textColor="text-brown"
        extraClass="text-center"
      >
        <span className={`${!!havePriceRange && 'text-[16px]'}`}>
          {priceToEuro(Number(priceRange?.split('-')?.[0]))}-
          {priceToEuro(Number(priceRange?.split('-')?.[1]))}€
        </span>
      </GenericParagraph>
      <div className="w-full h-[1px] bg-brown/80"></div>
      <GenericParagraph
        pType="large"
        fontStyle="font-sansation font-[700]"
        textColor="text-brown"
        extraClass="text-center"
      >
        <span className={`${!!havePriceRange && 'text-[16px]'}`}>
          {Number(priceRange?.split('-')?.[0]).toFixed(2)}-
          {Number(priceRange?.split('-')?.[1]).toFixed(2)}лв
        </span>
      </GenericParagraph>
    </div>
  )

  return (
    <>
      {!!promoPrice && (
        <div className="w-[32px] h-[32px] md:w-[32px] md:h-[32px] absolute z-[3] top-0 left-0 md:translate-x-[20px] md:translate-y-[20px]">
          <DiscountIcon />
        </div>
      )}
      {!!bestSeller && (
        <div className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] absolute z-[3] top-0 right-0 md:translate-x-[-20px] md:translate-y-[20px]">
          <BestSellerIcon />
        </div>
      )}
      <article
        className="w-full bg-[#e6cbcd] rounded-[12px] pb-1 md:pb-4 relative overflow-hidden border-[1px] border-bordo/20"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={() => {
          if (isHover) {
            setIsHover(false)
          } else {
            setIsHover(true)
          }
        }}
      >
        <div className="w-full flex flex-col px-1 pt-1 md:px-4 md:pt-4">
          <div className="p-2 border-[1px] border-bordo/20 rounded-[12px] overflow-hidden bg-white relative">
            <Link prefetch={true} href={`/produkt/${product?.slug}`} className="w-full h-full">
              <GenericImage
                src={mediaToShow?.url as string}
                alt={mediaToShow?.alt}
                wrapperClassName="w-full h-[150px] md:h-[340px] rounded-[16px] overflow-hidden relative"
                imageClassName="w-full h-full object-contain"
                fill={true}
                updatedAt={mediaToShow?.updatedAt as string}
              />
              <div className="w-full absolute bottom-0 left-0 right-0 bg-brown/70 z-[2] px-2 py-1">
                <GenericParagraph
                  fontStyle="font-kolka font-[500]"
                  pType="custom"
                  textColor="text-white"
                  extraClass="break-words text-center text-[10px] md:text-[18px] leading-[110%]"
                >
                  {(category as Category)?.title}
                </GenericParagraph>
              </div>
            </Link>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-[6px] mt-[6px] md:mt-[unset] md:gap-[unset] md:justify-between md:items-center md:h-[110px] relative z-[2]">
            <div className="w-full md:max-w-[66%]">
              <GenericHeading
                headingType="h5"
                fontStyle="font-sansation font-[700] italic"
                textColor="text-brown"
                extraClass="line-clamp-3 text-center md:text-left text-[14px] md:text-[18px] leading-[100%] min-h-[42px] md:min-h-[unset] md:leading-[110%] break-words"
                customStyles={true}
              >
                <h3>{title}</h3>
              </GenericHeading>
            </div>

            {priceSection}
          </div>

          <div className="w-full mt-[6px] md:mt-[unset]">
            {product.quantity === 0 ? (
              <GenericParagraph
                pType="regular"
                fontStyle="font-sansation font-[700]"
                textColor="text-bordo"
                extraClass="uppercase text-center"
              >
                Изчерапана наличност
              </GenericParagraph>
            ) : (
              <>
                {product?.havePriceRange ? (
                  <GenericButton
                    variant="primary"
                    styleClass="uppercase w-full !py-[4px] md:!py-[8px]"
                    click={() => {
                      dispatch(addProductToShoppingCart({ ...product, orderQuantity: 1 }))
                      const priceForProduct = product.promoPrice
                        ? product.promoPrice
                        : product.price || 0
                      ADD_TO_CART('BGN', priceForProduct.toFixed(2).toString(), [
                        {
                          item_id: product?.id,
                          item_name: product?.title,
                          price: priceForProduct,
                          quantity: 1,
                        },
                      ])
                      dispatch(
                        setNotification({
                          showNotification: true,
                          message: !!productExistsInCart
                            ? `Kъм (${product?.title}) беше дованен 1 брой`
                            : `(${product?.title}) беше добавен в количката`,
                          type: 'success',
                        }),
                      )

                      if (!!userId) {
                        addToCart(product?.id, userId!)
                      } else {
                        addToLocalStorage(product)
                      }
                    }}
                    type="button"
                    ariaLabel="Добави"
                  >
                    <p className="text-[12px] md:text-[20px]">Добави</p>
                    <div
                      className="w-[16px] h-[16px] md:w-[24px] md:h-[24px] flex justify-center items-center
          [&>svg_path]:fill-white [&>svg_path]:transition-all duration-300 ease-in-out"
                    >
                      <ShoppingCartIcon />
                    </div>
                  </GenericButton>
                ) : (
                  <GenericButton
                    variant="primary"
                    styleClass="uppercase w-full !py-[4px] md:!py-[8px]"
                    click={() => {
                      dispatch(addProductToShoppingCart({ ...product, orderQuantity: 1 }))
                      const priceForProduct = product.promoPrice
                        ? product.promoPrice
                        : product.price || 0
                      ADD_TO_CART('BGN', priceForProduct.toFixed(2).toString(), [
                        {
                          item_id: product?.id,
                          item_name: product?.title,
                          price: priceForProduct,
                          quantity: 1,
                        },
                      ])

                      dispatch(
                        setNotification({
                          showNotification: true,
                          message: !!productExistsInCart
                            ? `Kъм (${product?.title}) беше дованен 1 брой`
                            : `(${product?.title}) беше добавен в количката`,
                          type: 'success',
                        }),
                      )
                      if (!!userId) {
                        addToCart(product?.id, userId!)
                      } else {
                        addToLocalStorage(product)
                      }
                    }}
                    type="button"
                    ariaLabel="Добави"
                  >
                    <p className="text-[12px] md:text-[20px]">Добави</p>
                    <div
                      className="w-[16px] h-[16px] md:w-[24px] md:h-[24px] flex justify-center items-center
          [&>svg_path]:fill-white [&>svg_path]:transition-all duration-300 ease-in-out"
                    >
                      <ShoppingCartIcon />
                    </div>
                  </GenericButton>
                )}
              </>
            )}
          </div>
        </div>
      </article>
    </>
  )
}

export default ProductCard
