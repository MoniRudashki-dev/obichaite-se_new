'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  messages: string[]
  speedPxPerSecond?: number // px/s
  gapPx?: number
  separator?: string
  pauseOnHover?: boolean
  className?: string
  textClassName?: string
  heightPx?: number // force one-row height
}

export function AnnouncementBar({
  messages,
  speedPxPerSecond = 80,
  gapPx = 48,
  separator = '•',
  pauseOnHover = true,
  className = '',
  textClassName = '',
  heightPx = 24,
}: Props) {
  const clean = useMemo(
    () =>
      messages
        .map((m) => {
          const extension = '<👉>'
          return m + extension
        })
        .filter(Boolean),
    [messages],
  )

  const items = useMemo(() => {
    if (!clean.length) return []
    return clean.flatMap((msg, i) => (i === clean.length - 1 ? [msg] : [msg, separator]))
  }, [clean, separator])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLDivElement | null>(null)

  const [repeatCount, setRepeatCount] = useState(1)
  const [distancePx, setDistancePx] = useState(0)
  const [durationSec, setDurationSec] = useState(0)

  useEffect(() => {
    if (!containerRef.current || !measureRef.current) return

    const containerEl = containerRef.current
    const measureEl = measureRef.current

    const compute = () => {
      const containerW = containerEl.getBoundingClientRect().width
      const baseW = measureEl.scrollWidth

      if (!containerW || !baseW) return

      // Ensure the animated track is comfortably wider than the viewport
      const repeats = Math.max(2, Math.ceil((containerW * 2) / baseW))
      const trackW = baseW * repeats

      setRepeatCount(repeats)
      setDistancePx(trackW)
      setDurationSec(trackW / Math.max(1, speedPxPerSecond))
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(containerEl)
    ro.observe(measureEl)
    return () => ro.disconnect()
  }, [items, gapPx, speedPxPerSecond])

  if (!items.length) return null

  const renderRun = (keyPrefix: string) => (
    <div className="ab-run" key={keyPrefix}>
      {Array.from({ length: repeatCount }).map((_, r) => (
        <React.Fragment key={`${keyPrefix}-r-${r}`}>
          {items.map((t, i) => (
            <span className={`ab-item ${textClassName}`} key={`${keyPrefix}-${r}-${i}`}>
              {`${t}`}
            </span>
          ))}
        </React.Fragment>
      ))}
    </div>
  )

  // Don’t animate until we have a real measured distance (prevents weird initial paint)
  const shouldAnimate = distancePx > 0 && durationSec > 0

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: heightPx }}
    >
      {/* measuring row (single run only) */}
      <div className="ab-measure" aria-hidden>
        <div ref={measureRef} className="ab-run">
          {items.map((t, i) => (
            <span className="ab-item" key={`m-${i}`}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`ab-inner ${pauseOnHover ? 'ab-pause' : ''}`}
        style={
          {
            ['--gap' as any]: `${gapPx}px`,
            ['--distance' as any]: `${distancePx}px`,
            ['--duration' as any]: `${durationSec}s`,
            animationPlayState: 'running',
          } as React.CSSProperties
        }
      >
        {/* Track A + Track B */}
        <div className={`ab-track ${shouldAnimate ? 'ab-animate' : ''}`}>
          {renderRun('a')}
          {renderRun('b')}
        </div>
      </div>

      <style jsx>{`
        /* HARD no-wrap + single-row enforcement */
        .ab-inner {
          height: 100%;
          display: flex;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
        }

        .ab-track {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          white-space: nowrap;
          width: max-content;
          will-change: transform;
        }

        .ab-run {
          display: inline-flex;
          align-items: center;
          flex-wrap: nowrap;
          white-space: nowrap;
          padding-left: var(--gap);
          padding-right: var(--gap); /* important: space between Run A and Run B */
          /* remove: gap: var(--gap); */
        }

        .ab-item {
          display: inline-block;
          white-space: nowrap;
          flex: 0 0 auto;
          line-height: 1;
          margin-right: var(--gap); /* spacing between items */
        }

        .ab-animate {
          animation: scroll var(--duration) linear infinite;
        }

        .ab-pause:hover .ab-track {
          animation-play-state: paused;
        }

        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-1 * var(--distance)));
          }
        }

        .ab-measure {
          position: absolute;
          pointer-events: none;
          opacity: 0;
          height: 0;
          overflow: hidden;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
