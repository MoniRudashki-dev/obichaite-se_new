'use client'

import React, { useLayoutEffect, useRef } from 'react'

const InfiniteScrollContainer = ({
  items,
  setSliceHandler,
  resetKey,
}: {
  items: React.ReactNode
  setSliceHandler: () => void
  /**
   * Опционално: когато се промени, скролът се връща в началото. Ползва се от
   * търсачките, за да не остане потребителят на 200-ти ред след нова заявка.
   */
  resetKey?: string | number
}) => {
  //need to show portions of the passed list of items and each time when user scrolls to the end of the list, load more items
  const CONTAINER_REF = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (resetKey === undefined) return
    CONTAINER_REF.current?.scrollTo({ top: 0 })
  }, [resetKey])

  useLayoutEffect(() => {
    const scrollHandler = () => {
      const container = CONTAINER_REF.current

      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container

      if (scrollTop + clientHeight >= scrollHeight) {
        setSliceHandler()
      }
    }

    CONTAINER_REF.current?.addEventListener('scroll', scrollHandler)

    return () => {
      CONTAINER_REF.current?.removeEventListener('scroll', scrollHandler)
    }
  }, [])

  return (
    <div className="max-h-[400px] overflow-y-auto flex flex-col" ref={CONTAINER_REF}>
      {items}
    </div>
  )
}

export default InfiniteScrollContainer
