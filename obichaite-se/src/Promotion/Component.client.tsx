'use client'

import { GenericImage } from '@/components/Generic'
import { Media, Promotion } from '@/payload-types'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useState } from 'react'

const PromotionModal = ({ data }: { data: Promotion }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useLayoutEffect(() => {
    const timeOut = setTimeout(() => {
      setIsOpen(true)
    }, 2000)

    return () => clearTimeout(timeOut)
  }, [])

  const media = data?.media as Media

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-full right-0 z-[12] bg-black/80 backdrop-blur-md flex justify-center items-center ${
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      } transition-[transform,opacity] duration-500 ease-in-out`}
    >
      <button
        className="absolute right-4 top-4 flex justify-center items-center w-[32px] h-[32px]"
        onClick={() => {
          setIsOpen(false)
        }}
        aria-label="Затвори количката"
        title="Затвори количката"
        aria-disabled={false}
        disabled={false}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" stroke="#FFF" />
          <path
            d="M29.1562 30.5938L24 25.3984L18.8047 30.5938C18.5703 30.8281 18.1797 30.8281 17.9062 30.5938C17.6719 30.3203 17.6719 29.9297 17.9062 29.6953L23.1016 24.5L17.9453 19.3438C17.6719 19.1094 17.6719 18.7188 17.9453 18.4453C18.1797 18.2109 18.5703 18.2109 18.8047 18.4453L24 23.6406L29.1562 18.4453C29.3906 18.2109 29.7812 18.2109 30.0547 18.4453C30.2891 18.7188 30.2891 19.1094 30.0547 19.3438L24.8594 24.5L30.0547 29.6953C30.2891 29.9297 30.2891 30.3203 30.0547 30.5938C29.7812 30.8281 29.3906 30.8281 29.1562 30.5938Z"
            fill="#FFF"
          />
        </svg>
      </button>

      <article className="w-full content_wrapper flex justify-center items-center">
        <Link
          href={`/kategorii/rychnoizraboteni-podarytsi/koledna-magiq`}
          className="w-full h-full flex justify-center items-center"
        >
          <GenericImage
            src={media?.url as string}
            alt={media?.alt as string}
            wrapperClassName="w-full aspect-square relative rounded-[12px] overflow-hidden md:max-w-[640px] xl:max-w-[710px]"
            imageClassName="w-full h-full object-contain"
            fill={true}
          />
        </Link>
      </article>
    </div>
  )
}

export default PromotionModal
