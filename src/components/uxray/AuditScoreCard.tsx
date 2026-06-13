'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ScoreGauge } from './ScoreGauge'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditScoreCardProps {
  /** Category title */
  title: string
  /** Score value 0-100 */
  score: number
  /** Icon element rendered next to the title */
  icon: React.ReactNode
  /** Optional trend indicator */
  trend?: { value: number; direction: 'up' | 'down' }
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AuditScoreCard = React.forwardRef<HTMLDivElement, AuditScoreCardProps>(
  ({ title, score, icon, trend, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
        className={cn('group', className)}
      >
        <Card className="transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-black/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--uxray-primary-50)' }}
              >
                {icon}
              </span>
              <CardTitle className="text-sm font-semibold tracking-tight">
                {title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-3 pt-1 pb-4">
            <ScoreGauge score={score} size="sm" />

            {/* Trend indicator */}
            {trend && (
              <div
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  trend.direction === 'up'
                    ? 'text-uxray-success-300'
                    : 'text-uxray-danger-300',
                )}
                style={{
                  backgroundColor:
                    trend.direction === 'up'
                      ? 'var(--uxray-success-50)'
                      : 'var(--uxray-danger-50)',
                }}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trend.direction === 'up' ? '+' : '-'}
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  },
)

AuditScoreCard.displayName = 'AuditScoreCard'

export { AuditScoreCard }
