import React from 'react'

import type { Footer, Media } from '@/payload-types'

import { getCachedGlobal } from '@/utils/getGlobals'
import { RichText } from '@/components/Custom'
import Link from 'next/link'
import { GenericHeading, GenericImage } from '@/components/Generic'
import { generateHref, LinkObject } from '@/utils/generateHref'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData.navItems
    ? footerData.navItems.map((item) => {
        return (
          <li className="w-fit flex items-center" key={item.id || item?.link?.label}>
            <Link
              href={generateHref(item as LinkObject)}
              aria-label={item?.link?.label}
              target={item?.link?.newTab ? '_blank' : '_self'}
              className="hover:opacity-75 transition-all duration-300 ease-in-out"
              prefetch={true}
            >
              <span className="text-[24px] text-white leading-[120%]">{item?.link?.label}</span>
            </Link>
          </li>
        )
      })
    : []

  const regulatoryItems = footerData.regulatoryLinks
    ? footerData.regulatoryLinks.map((item, index) => {
        const isItLast = index === footerData.regulatoryLinks!.length - 1
        return (
          <li key={item.id || item?.link?.label}>
            <div className="w-fit flex items-center gap-4">
              <Link
                href={generateHref(item as LinkObject)}
                aria-label={item?.link?.label}
                target={item?.link?.newTab ? '_blank' : '_self'}
                className="hover:opacity-75 transition-all duration-300 ease-in-out"
                prefetch={true}
              >
                <span className="text-[14px] text-white leading-[120%]">{item?.link?.label}</span>
              </Link>
              {!isItLast && <span className="text-[14px] text-white leading-[120%]">|</span>}
            </div>
          </li>
        )
      })
    : []

  const socialImages = footerData.socialLinks
    ? footerData.socialLinks.map((item, index) => {
        return (
          <li
            className="w-fit flex items-center"
            key={item.id || index}
            title={`
            ${item.link?.label}`}
          >
            <Link
              href={generateHref(item as LinkObject)}
              aria-label={item?.link?.label}
              target={item?.link?.newTab ? '_blank' : '_self'}
              className="hover:opacity-75 transition-all duration-300 ease-in-out"
              prefetch={true}
              rel="noopener noreferrer"
            >
              <GenericImage
                src={(item?.media as Media)?.url as string}
                alt={(item?.media as Media)?.alt as string}
                wrapperClassName="w-[32px] h-[32px] flex items-center justify-center relative"
                imageClassName="w-full h-full object-contain"
                fill={true}
              />
            </Link>
          </li>
        )
      })
    : []

  return (
    <footer
      id="footer"
      className="border-t border-brown pt-[40px] pb-[120px] xl:pb-[60px] xl:pt-10 relative flex flex-col brown_background_bubble REF_FOOTER"
    >
      <div
        className="w-full content_wrapper pt-2 pb-8 md:py-10 
      grid grid-cols-1 md:grid-cols-2 xl:grid-cols-11 relative z-[5] gap-[40px] xl:gap-[unset]"
      >
        <div className="w-full justify-center items-center flex xl:justify-start xl:items-start xl:col-span-2">
          <Link href="/" className="flex items-center gap-4">
            <span className="sr-only">(Обичайте се)</span>
            <GenericImage
              src={(footerData.logo as Media)?.url as string}
              alt={(footerData.logo as Media)?.alt as string}
              wrapperClassName="w-[150px] aspect-square flex items-center justify-center relative"
              imageClassName="w-full h-full object-contain"
              fill={true}
            />
          </Link>
        </div>

        <div className="w-full flex flex-col gap-m justify-center items-center xl:justify-start xl:items-start xl:col-span-3">
          <GenericHeading
            align="text-left"
            extraClass="uppercase border-b-[1px] border-white pb-2 w-fit"
            fontStyle="font-sansation font-[700]"
            headingType="h5"
            textColor="text-white"
          >
            <p>за нас</p>
          </GenericHeading>

          {footerData.contacts && (
            <div className="w-fit">
              <RichText
                data={footerData?.contacts}
                className="text-[20px] text-white [&_p]:text-[16px] text-center md:text-left"
              />
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-m justify-center items-center xl:justify-start xl:items-start xl:col-span-3">
          <GenericHeading
            align="text-left"
            extraClass="uppercase border-b-[1px] border-white pb-2 w-fit"
            fontStyle="font-sansation font-[700]"
            headingType="h5"
            textColor="text-white"
          >
            <p>навигация</p>
          </GenericHeading>

          <ul className="flex flex-col gap-4 justify-center items-center xl:justify-start xl:items-start">
            {navItems}
          </ul>
        </div>

        <div className="w-full flex flex-col gap-m justify-center items-center xl:justify-start xl:items-start xl:col-span-3">
          <GenericHeading
            align="text-left"
            extraClass="uppercase border-b-[1px] border-white pb-2 w-fit"
            fontStyle="font-sansation font-[700]"
            headingType="h5"
            textColor="text-white"
          >
            <p>социални мрежи</p>
          </GenericHeading>

          <ul className="flex gap-4">{socialImages}</ul>
        </div>
      </div>

      <ul className="flex flex-wrap w-full max-w-[90%] mx-auto justify-center items-center gap-2 md:gap-4 relative z-[5] mt-6">
        {regulatoryItems}
      </ul>

      <div className="absolute bottom-0 w-full border-t-[1px] border-white/20 flex flex-col md:flex-row justify-between items-center py-2 px-2 xl:px-4 z-[5]">
        <p className="font-montserrat-regular text-[16px] leading-[120%] text-white text-center md:text-left">
          &copy;{new Date().getFullYear()} Всички права запазени.
        </p>
        <div className="w-full bg-white/20 h-[1px] md:hidden my-2"></div>
        <div className="font-sansation font-[400] text-[16px] leading-[120%] text-white flex items-center gap-2">
          <p>Генерирано от </p>
          <div className="flex justify-center items-center">
            <svg
              width="97.2"
              height="30.5"
              viewBox="0 0 175 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="3" width="175" height="52" rx="26" fill="url(#paint0_linear_131_8)"></rect>
              <rect x="2" y="5" width="171" height="48" rx="24" fill="white"></rect>
              <path
                d="M30.5741 45H23.3741V12.84H40.1741C43.9501 12.84 46.9261 13.864 49.1021 15.912C51.3101 17.96 52.4141 20.808 52.4141 24.456C52.4141 28.104 51.3101 30.968 49.1021 33.048C46.8941 35.096 43.9181 36.12 40.1741 36.12H30.5741V45ZM39.4061 19.32H30.5741V29.64H39.4061C41.4861 29.64 42.9741 29.272 43.8701 28.536C44.7981 27.768 45.2621 26.408 45.2621 24.456C45.2621 22.536 44.7981 21.208 43.8701 20.472C42.9421 19.704 41.4541 19.32 39.4061 19.32ZM62.1679 45H54.9679V12.84H62.1679V45ZM73.3286 45.48C70.7366 45.48 68.7046 44.92 67.2326 43.8C65.7606 42.648 65.0246 41.064 65.0246 39.048C65.0246 35.4 67.6166 33.304 72.8006 32.76L83.1206 31.704V30.792C83.1206 29.256 82.7366 28.216 81.9686 27.672C81.2006 27.096 79.8406 26.808 77.8886 26.808C76.0326 26.808 74.7046 27.096 73.9046 27.672C73.1366 28.216 72.7526 29.16 72.7526 30.504V30.696H65.5046V30.552C65.5046 27.544 66.6726 25.112 69.0086 23.256C71.3446 21.4 74.4806 20.472 78.4166 20.472C82.3206 20.472 85.2646 21.4 87.2486 23.256C89.2326 25.112 90.2246 27.656 90.2246 30.888V45H83.5046V39.48H83.1206C82.5446 41.368 81.4246 42.84 79.7606 43.896C78.0966 44.952 75.9526 45.48 73.3286 45.48ZM72.2726 38.568C72.2726 39.784 73.3126 40.392 75.3926 40.392C77.9206 40.392 79.8086 40.056 81.0566 39.384C82.3366 38.68 83.0246 37.496 83.1206 35.832L74.7686 36.792C73.1046 36.92 72.2726 37.512 72.2726 38.568ZM101.074 45H93.8741V20.952H100.546V28.344H100.978C101.33 26.104 102.306 24.232 103.906 22.728C105.538 21.224 107.826 20.472 110.77 20.472C113.938 20.472 116.338 21.368 117.97 23.16C119.634 24.92 120.466 27.208 120.466 30.024V45H113.266V32.424C113.266 30.472 112.802 29.08 111.874 28.248C110.978 27.384 109.442 26.952 107.266 26.952C105.026 26.952 103.426 27.416 102.466 28.344C101.538 29.272 101.074 30.776 101.074 32.856V45Z"
                fill="#082B49"
              ></path>
              <path
                d="M153.724 45H123.58V38.52L142.492 19.848V19.32H124.012V12.84H153.34V19.32L133.804 37.992V38.52H153.724V45Z"
                fill="#0E98E9"
              ></path>
              <defs>
                <linearGradient
                  id="paint0_linear_131_8"
                  x1="108.387"
                  y1="55"
                  x2="73.1128"
                  y2="-0.418608"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#082B49"></stop>
                  <stop offset="0.497135" stopColor="#0E98E9"></stop>
                  <stop offset="1" stopColor="#082B49"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>{' '}
        </div>
      </div>
    </footer>
  )
}
