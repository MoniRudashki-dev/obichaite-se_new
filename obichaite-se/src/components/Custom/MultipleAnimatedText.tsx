'use client'

import * as React from 'react'

type Props = {
  texts: string[] // each string can contain "\n" for multiple lines
  holdMs?: number // time fully visible before exiting
  lineStaggerMs?: number // delay between line animations
  lineInMs?: number // duration of each line's entrance animation
  lineOutMs?: number // duration of each line's exit animation
  pauseOnHover?: boolean

  className?: string
  lineClassName?: string

  reserveLines?: number
  reserveLineHeightEm?: number
  startIndex?: number
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mql) return

    const apply = () => setReduced(!!mql.matches)
    apply()

    mql.addEventListener?.('change', apply)
    return () => mql.removeEventListener?.('change', apply)
  }, [])

  return reduced
}

type Phase = 'in' | 'hold' | 'out'

export function RotatingMaskedHeadline({
  texts,
  holdMs = 1800,
  lineStaggerMs = 90,
  lineInMs = 700,
  lineOutMs = 320,
  pauseOnHover = true,
  className,
  lineClassName,
  reserveLines,
  reserveLineHeightEm = 1.15,
  startIndex = 0,
}: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const [paused, setPaused] = React.useState(false)

  const [index, setIndex] = React.useState(() => {
    if (!texts?.length) return 0
    return Math.min(Math.max(startIndex, 0), texts.length - 1)
  })

  const [phase, setPhase] = React.useState<Phase>('in')

  const currentText = texts?.[index] ?? ''
  const lines = React.useMemo(() => splitLines(currentText), [currentText])

  const inTotalMs = reducedMotion ? 0 : lineInMs + Math.max(lines.length - 1, 0) * lineStaggerMs
  const outTotalMs = reducedMotion ? 0 : lineOutMs + Math.max(lines.length - 1, 0) * lineStaggerMs

  React.useEffect(() => {
    if (!texts?.length) return
    if (paused) return

    let timeout = 0

    if (reducedMotion) {
      // In reduced motion: just rotate on a fixed cadence (no fancy phases)
      timeout = window.setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length)
        setPhase('hold')
      }, holdMs)
      return () => window.clearTimeout(timeout)
    }

    if (phase === 'in') {
      timeout = window.setTimeout(() => setPhase('hold'), inTotalMs)
    } else if (phase === 'hold') {
      timeout = window.setTimeout(() => setPhase('out'), holdMs)
    } else {
      timeout = window.setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length)
        setPhase('in')
      }, outTotalMs)
    }

    return () => window.clearTimeout(timeout)
  }, [texts, paused, phase, holdMs, inTotalMs, outTotalMs, reducedMotion])

  if (!texts?.length) return null

  const minHeightStyle =
    reserveLines && reserveLines > 0
      ? { minHeight: `${reserveLines * reserveLineHeightEm}em` }
      : undefined

  const playState: React.CSSProperties['animationPlayState'] = paused ? 'paused' : 'running'

  return (
    <div
      className={className}
      style={minHeightStyle}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => pauseOnHover && setPaused(false)}
    >
      {/* Key ensures a clean reset when index changes */}
      <div
        key={`${index}-${phase}`}
        className={
          phase === 'in' ? 'rmh-phase-in' : phase === 'out' ? 'rmh-phase-out' : 'rmh-phase-hold'
        }
      >
        {lines.map((line, i) => {
          const delayMs = reducedMotion ? 0 : i * lineStaggerMs

          const style: React.CSSProperties = reducedMotion
            ? { transform: 'translateY(0%)', opacity: 1 }
            : phase === 'in'
              ? {
                  animationName: 'maskedLineIn',
                  animationDuration: `${lineInMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${delayMs}ms`,
                  animationIterationCount: 1,
                  animationPlayState: playState,
                }
              : phase === 'out'
                ? {
                    animationName: 'maskedLineOut',
                    animationDuration: `${lineOutMs}ms`,
                    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    animationFillMode: 'both',
                    animationDelay: `${delayMs}ms`,
                    animationIterationCount: 1,
                    animationPlayState: playState,
                  }
                : {
                    transform: 'translateY(0%)',
                    opacity: 1,
                  }

          return (
            <div key={`${index}-${i}`} className="overflow-hidden">
              <span
                className={lineClassName}
                style={{
                  display: 'block',

                  transform: reducedMotion ? 'translateY(0%)' : 'translateY(110%)',
                  ...style,
                }}
              >
                {line}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
