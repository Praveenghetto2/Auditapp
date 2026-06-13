'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoreGaugeProps {
  /** Score value between 0 and 100 */
  score: number
  /** Visual size preset */
  size?: 'sm' | 'md' | 'lg'
  /** Label text rendered below the gauge */
  label?: string
  /** Whether to render the numeric score in the centre (default true) */
  showScore?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIZE_MAP = { sm: 80, md: 120, lg: 180 } as const

function getScoreColor(score: number) {
  if (score >= 90) return { variable: 'var(--uxray-success-300)', tailwind: 'text-uxray-success-300' }
  if (score >= 70) return { variable: 'var(--uxray-success-300)', tailwind: 'text-uxray-success-300' }
  if (score >= 40) return { variable: 'var(--uxray-warning-300)', tailwind: 'text-uxray-warning-300' }
  return { variable: 'var(--uxray-danger-300)', tailwind: 'text-uxray-danger-300' }
}



// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ScoreGauge = React.forwardRef<HTMLDivElement, ScoreGaugeProps>(
  ({ score, size = 'md', label, showScore = true, className }, ref) => {
    const px = SIZE_MAP[size]
    const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10
    const radius = (px - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const clampedScore = Math.min(100, Math.max(0, score))
    const offset = circumference - (clampedScore / 100) * circumference

    // Animated number counter
    const motionScore = useMotionValue(0)
    const rounded = useTransform(motionScore, (v) => Math.round(v))
    const [displayScore, setDisplayScore] = React.useState(0)

    React.useEffect(() => {
      const controls = animate(motionScore, clampedScore, {
        duration: 1.2,
        ease: 'easeOut',
      })
      const unsubscribe = rounded.on('change', (v) => setDisplayScore(v))
      return () => {
        controls.stop()
        unsubscribe()
      }
    }, [clampedScore, motionScore, rounded])

    const scoreColor = getScoreColor(clampedScore)

    const fontSizeMap = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' } as const

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col items-center gap-1.5', className)}
        role="meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Score: ${clampedScore}`}
      >
        <div className="relative" style={{ width: px, height: px }}>
          <svg
            width={px}
            height={px}
            viewBox={`0 0 ${px} ${px}`}
            className="-rotate-90"
          >


            {/* Track (background) */}
            <circle
              cx={px / 2}
              cy={px / 2}
              r={radius}
              fill="none"
              stroke="var(--uxray-surface-100)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Subtle Gradient Defs */}
            <defs>
              <linearGradient id={`gauge-grad-${clampedScore}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={scoreColor.variable} stopOpacity={0.8} />
                <stop offset="100%" stopColor={scoreColor.variable} stopOpacity={0.2} />
              </linearGradient>
            </defs>

            {/* Foreground arc */}
            <motion.circle
              cx={px / 2}
              cy={px / 2}
              r={radius}
              fill="none"
              stroke={`url(#gauge-grad-${clampedScore})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>

          {/* Centre score text */}
          {showScore && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn('font-bold tabular-nums', fontSizeMap[size])}
                style={{ color: scoreColor.variable }}
              >
                {displayScore}
              </span>
            </div>
          )}
        </div>

        {/* Label */}
        {label && (
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            {label}
          </span>
        )}
      </div>
    )
  },
)

ScoreGauge.displayName = 'ScoreGauge'

export { ScoreGauge }
