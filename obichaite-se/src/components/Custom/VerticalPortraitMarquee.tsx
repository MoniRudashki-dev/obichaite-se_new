'use client'

import { Media } from '@/payload-types'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'

type Props = {
  items: Media[]
  durationSec?: number
  delaySec?: number // can be negative for instant desync
  gapPx?: number
  className?: string
  pauseOnHover?: boolean
  direction?: 'up' | 'down' // NEW
  shuffle?: boolean
  shuffleSeed?: number
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(arr: T[], seed: number) {
  const a = [...arr]
  const rand = mulberry32(seed)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function VerticalPortraitMarquee({
  items,
  durationSec = 18,
  delaySec = 0,
  gapPx = 14,
  className,
  pauseOnHover = true,
  direction = 'up',
  shuffle = false,
  shuffleSeed = 1,
}: Props) {
  const [pausedByUser, setPausedByUser] = useState(false)
  const [pausedByHover, setPausedByHover] = useState(false)

  // Respect prefers-reduced-motion (default to paused)
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mql) return

    const apply = () => {
      if (mql.matches) setPausedByUser(true)
    }

    apply()
    mql.addEventListener?.('change', apply)
    return () => mql.removeEventListener?.('change', apply)
  }, [])

  const isPaused = pausedByUser || pausedByHover

  const baseItems = useMemo(() => {
    if (!shuffle) return items
    return seededShuffle(items, shuffleSeed)
  }, [items, shuffle, shuffleSeed])
  const doubled = useMemo(() => [...items, ...items], [items])

  const animationName = direction === 'down' ? 'vertical-marquee-down' : 'vertical-marquee-up'

  return (
    <div
      className={[
        'relative overflow-hidden rounded-3xl',
        // fade mask (top/bottom)
        '[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]',
        className ?? '',
      ].join(' ')}
      onPointerEnter={() => pauseOnHover && setPausedByHover(true)}
      onPointerLeave={() => pauseOnHover && setPausedByHover(false)}
    >
      <div
        className="will-change-transform"
        style={{
          animationName,
          animationDuration: `${durationSec}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDelay: `${delaySec}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        <div
          className="flex flex-col"
          style={{
            gap: `${gapPx}px`,
          }}
        >
          {doubled.map((it, idx) => (
            <div
              key={`${it.url}-${idx}`}
              className="relative overflow-hidden rounded-3xl"
              style={{
                // tweak these to match the card proportions you want
                aspectRatio: '4 / 5',
              }}
            >
              <Image
                src={it.url as string}
                alt={it.alt}
                fill
                sizes="(min-width: 1024px) 280px, 50vw"
                className="object-cover"
                priority={idx < 2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pause / Play button */}
      {/* <button
        type="button"
        aria-label={pausedByUser ? 'Play animation' : 'Pause animation'}
        aria-pressed={pausedByUser}
        onClick={() => setPausedByUser((v) => !v)}
        className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md"
      >
        {pausedByUser ? (
          // Play icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          // Pause icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        )}
      </button> */}
    </div>
  )
}
