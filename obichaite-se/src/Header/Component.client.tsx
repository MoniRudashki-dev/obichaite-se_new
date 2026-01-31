'use client'
import React, { useEffect, useState } from 'react'

import { Category, Header, Media, SubCategory } from '@/payload-types'
import { generateHref, LinkObject } from '@/utils/generateHref'
import Link from 'next/link'
import { DataFromGlobalSlug } from 'payload'
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks'
import { GenericImage, GenericParagraph } from '@/components/Generic'
import { ArrowIcon, MenuIcon, SearchLogo, ShoppingCartIcon, UserProfileIcon } from '@/assets/icons'
import { setOpenSearch, setUser } from '@/store/features/root'
import Menu from './Menu'
import { setShoppingCardOpen } from '@/store/features/checkout'
import { useCheckout } from '@/hooks/useCheckout'
import { useTransition } from 'react'
import { logout } from '@/action/auth/logout'

const HeaderClient = ({ headerData }: { headerData: DataFromGlobalSlug<'header'> }) => {
  const dispatch = useAppDispatch()
  const { calculateTotalPrice } = useCheckout()
  const shoppingCartProducts = useAppSelector((state) => state.checkout.products)
  const searchOpen = useAppSelector((state) => state.root.openSearch)

  const user = useAppSelector((state) => state.root.user)
  const { categoryItems, logo } = headerData as Header
  const [pending, start] = useTransition()
  const [openUserMenu, setOpenUserMenu] = useState(false)

  const [openMenu, setOpenMenu] = useState(false)
  const [openCategoryIndex, setOpenCategoryIndex] = useState(-1)

  useEffect(() => {
    if (openMenu || searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [openMenu, searchOpen])

  const linksContent = categoryItems?.map((item, i) => {
    if (!item?.link?.label) return null

    return (
      <li className="w-fit flex items-center" key={`${item?.link?.label}${i}`}>
        <Link
          href={generateHref(item as LinkObject)}
          aria-label={item?.link?.label}
          target={item?.link?.newTab ? '_blank' : '_self'}
          className="[&>button>span]:hover:underline transition-all duration-300 ease-in-out"
          prefetch={true}
        >
          <div
            className="w-full h-full flex items-center gap-[4px] relative"
            onMouseEnter={() => setOpenCategoryIndex(i + 1)}
          >
            <span className="text-[14px] font-sensation font-[400] text-white">
              {item?.link?.label}
            </span>
            <button
              className={`flex justify-center items-center w-[16px] h-[16px]
                transition-transform duration-500 ease-in-out ${
                  openCategoryIndex === i + 1 ? 'rotate-[-90deg]' : 'rotate-90'
                }`}
              aria-label={item?.link?.label}
              title={item?.link?.label}
            >
              <ArrowIcon color="white" />
            </button>

            <div
              className={`w-full h-[1px] absolute top-full bg-white left-0
                transition-[max-width] duration-500 ease-in-out
            ${openCategoryIndex === i + 1 ? 'max-w-full' : 'max-w-0'}`}
            ></div>
          </div>
        </Link>
      </li>
    )
  })

  const currentMedia = categoryItems?.[openCategoryIndex - 1]?.media as Media

  const currentChildren =
    openCategoryIndex !== -1 ? categoryItems?.[openCategoryIndex - 1]?.children : null

  const childrenContent = !!currentChildren
    ? currentChildren.map((subItem) => {
        const subCategorySlug = (subItem?.link?.reference?.value as SubCategory)?.slug || ''
        const categorySlug =
          (categoryItems?.[openCategoryIndex - 1]?.link?.reference?.value as Category)?.slug || ''

        return (
          <li
            key={subItem.id}
            className="w-[24%] min-w-[24%] h-[60px] hover:border-[1px] hover:border-brown rounded-[16px]
            hover:bg-brown transition-[colors,box-shadow] duration-500 ease-in-out [&>a>button>span]:hover:text-white hover:shadow-lg"
          >
            <Link
              href={`/kategorii/${categorySlug}/${subCategorySlug}`}
              target={subItem?.link?.newTab ? '_blank' : '_self'}
              prefetch={true}
              className="w-full h-full"
            >
              <button className="w-full h-full flex justify-center items-center">
                <span className="text-[14px] font-sensation font-[400] text-brown transition-colors duration-500">
                  {subItem?.link?.label}
                </span>
              </button>
            </Link>
          </li>
        )
      })
    : []

  return (
    <>
      <div className="landscape:hidden portrait:block">
        <Menu openMenu={openMenu} setOpenMenu={setOpenMenu} categoryItems={categoryItems} />
      </div>
      <header
        className="w-full fixed z-[11] top-[24px] left-0 right-0 flex flex-col bg-white"
        onMouseLeave={() => setOpenCategoryIndex(-1)}
      >
        <nav
          className="w-full content_wrapper_mobile-full bg-white flex justify-between items-center h-[52px] md:h-[70px]"
          // style={{ overflowX: 'visible', overflowY: 'visible' }}
          onMouseEnter={() => setOpenCategoryIndex(-1)}
        >
          <Link href={'/'} aria-label="Отиди на начална страница">
            <GenericImage
              src={(logo as Media)?.url as string}
              alt={(logo as Media)?.alt as string}
              wrapperClassName="w-[116px] h-[41px] md:w-[158px] md:h-[50px] flex items-center justify-center relative"
              imageClassName="w-full h-full object-contain"
              fill={true}
            />
          </Link>

          <ul className="flex items-center gap-2 px-2">
            <li className="relative">
              {!user ? (
                <Link
                  href={'/auth/login'}
                  aria-label="Към вход"
                  className="flex items-center gap-2"
                  prefetch={true}
                >
                  <GenericParagraph
                    pType="regular"
                    extraClass="hidden md:block"
                    fontStyle="font-sansation font-[700]"
                  >
                    Вход
                  </GenericParagraph>
                  <div className="w-[32px] h-[32px] md:w-[48px] md:h-[48px] rounded-full flex justify-center items-center border-[1px] border-brown p-[5px]">
                    <UserProfileIcon />
                  </div>
                </Link>
              ) : (
                <button
                  className="w-[32px] h-[32px] md:w-[48px] md:h-[48px] rounded-full flex justify-center items-center border-[1px] border-brown p-[5px]"
                  aria-label="Потребител Меню"
                  title="Потребител Меню"
                  onClick={() => setOpenUserMenu((prev) => !prev)}
                >
                  <p className="md:text-[20px]">{user?.firstName?.[0]}</p>
                </button>
              )}
              {openUserMenu && !!user && (
                <div className="flex flex-col gap-s absolute top-full right-0 px-2 py-2 bg-brown/40 z-[3] backdrop-blur-sm w-[200px] rounded-[4px]">
                  <Link
                    href={`/user-profile/?userId=${user.id}`}
                    aria-label="Към профил"
                    className="w-full"
                  >
                    <button
                      className="w-full px-2 py-2 bg-brown z-[3] rounded-[4px] border-[1px] text-white border-white flex
              hover:text-brown hover:bg-white transition-colors duration-500"
                      onClick={() => setOpenUserMenu(false)}
                      disabled={pending}
                    >
                      <p className="m-auto ">Профил</p>
                    </button>
                  </Link>
                  <button
                    className="px-2 py-2 bg-brown z-[3] rounded-[4px] border-[1px] text-white border-white flex
              hover:text-brown hover:bg-white transition-colors duration-500"
                    onClick={() =>
                      start(async () => {
                        await logout()
                        dispatch(setUser(null))
                      })
                    }
                    disabled={pending}
                  >
                    <p className="m-auto ">{pending ? 'Излизане...' : 'Изход'}</p>
                  </button>
                </div>
              )}
            </li>
            <li>
              <button
                className="w-[32px] h-[32px] md:w-[48px] md:h-[48px] rounded-full flex justify-center items-center border-[1px] border-brown pb-[7px] pt-[5px]"
                aria-label="Търсене на продукт"
                title="Търсене на продукт"
                onClick={() => {
                  dispatch(setOpenSearch(true))
                }}
              >
                <SearchLogo />
              </button>
            </li>
            <li className="flex items-center gap-2">
              <div className="hidden flex-col md:flex">
                <GenericParagraph pType="small" textColor="text-brown">
                  Количка
                </GenericParagraph>
                <GenericParagraph
                  pType="small"
                  textColor="text-bordo"
                  extraClass="tracking-tighter"
                >
                  {calculateTotalPrice().toFixed(2)} BGN
                </GenericParagraph>
              </div>
              <button
                className="w-[32px] h-[32px] md:w-[48px] md:h-[48px] rounded-full flex justify-center items-center border-[1px] border-brown p-[3px] relative"
                aria-label="Потребител количка"
                title="Потребител количка"
                onClick={() => dispatch(setShoppingCardOpen(true))}
              >
                <div
                  className="absolute z-[2] top-[-5px] right-[-5px] w-[16px] h-[16px] md:w-[20px] md:h-[20px] rounded-full bg-bordo text-white
              flex justify-center items-center"
                >
                  <p className="text-white font-sensation font-[700] text-[10px] md:text-[12px]">
                    {shoppingCartProducts.length}
                  </p>
                </div>
                <ShoppingCartIcon />
              </button>
            </li>
            <li className="md:hidden">
              <button
                className="w-[34px] h-[34px] rounded-full flex justify-center items-center border-[1px] border-brown pb-[7px] pt-[5px]"
                aria-label="Меню отваряне"
                title="Меню отваряне"
                onClick={() => {
                  setOpenMenu(true)
                }}
              >
                <MenuIcon />
              </button>
            </li>
          </ul>
        </nav>
        <nav className="w-full bg-brown justify-between items-center h-[70px] hidden md:flex">
          <ul
            className="content_wrapper_mobile-full w-full flex justify-between items-center gap-2 px-2"
            aria-label="Навигация на категории"
          >
            {linksContent}
          </ul>
        </nav>
        <div
          className={`w-full h-[400px] bg-white absolute top-full left-0 right-0 z-[-1] border-b-[1px] border-brown
          transition-[transform,opacity] duration-500 ease-in-out p-6 white_background_forms ${
            openCategoryIndex > -1
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : 'translate-y-[-400px] opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-full h-full content_wrapper flex justify-stretch items-stretch">
            <nav className="w-[75%] h-full p-6">
              <ul className="w-full h-full flex flex-wrap gap-2 max-h-[376px] overflow-y-auto">
                {childrenContent}
              </ul>
            </nav>
            <div className="w-[25%] min-w-[25%] h-full p-6">
              {currentMedia?.url && (
                <GenericImage
                  src={currentMedia?.url || ''}
                  alt={currentMedia?.alt || ''}
                  wrapperClassName="w-full h-full aspect-square rounded-[16px] overflow-hidden relative"
                  imageClassName="w-full h-full object-cover"
                  fill={true}
                  focalX={currentMedia?.focalX || 50}
                  focalY={currentMedia?.focalY || 50}
                  sizes="512px"
                />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default HeaderClient
