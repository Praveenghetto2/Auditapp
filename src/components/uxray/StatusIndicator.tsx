'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StatusType = 'running' | 'completed' | 'failed' | 'pending' | 'idle'

export interface StatusIndicatorProps {
  /** Current status */
  status: StatusType
  /** Optional label text */
  label?: string
  /** Whether to show the label (defaults to false) */
  showLabel?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  StatusType,
  { color: string; ring: string; pulse: boolean; labelText: string }
> = {
  running: {
    color: 'var(--uxray-primary-300)',
    ring: 'var(--uxray-primary-100)',
    pulse: true,
    labelText: 'Running',
  },
  completed: {
    color: 'var(--uxray-success-300)',
    ring: 'var(--uxray-success-100)',
    pulse: false,
    labelText: 'Completed',
  },
  failed: {
    color: 'var(--uxray-danger-300)',
    ring: 'var(--uxray-danger-100)',
    pulse: false,
    labelText: 'Failed',
  },
  pending: {
    color: 'var(--uxray-warning-300)',
    ring: 'var(--uxray-warning-100)',
    pulse: true,
    labelText: 'Pending',
  },
  idle: {
    color: 'var(--uxray-surface-200)',
    ring: 'var(--uxray-surface-100)',
    pulse: false,
    labelText: 'Idle',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ status, label, showLabel = false, className }, ref) => {
    const config = STATUS_CONFIG[status]
    const displayLabel = label ?? config.labelText

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-2', className)}
        role="status"
        aria-label={displayLabel}
      >
        {/* Dot container */}
        <span className="relative inline-flex h-3 w-3 items-center justify-center">
          {/* Pulse ring for active states */}
          {config.pulse && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: config.color }}
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}

          {/* Glow ring for active states */}
          {(status === 'running' || status === 'pending') && (
            <span
              className="absolute inset-[-2px] rounded-full opacity-30"
              style={{ backgroundColor: config.ring }}
            />
          )}

          {/* Dot */}
          <motion.span
            className="relative z-10 flex h-2 w-2 items-center justify-center rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {status === 'completed' && (
              <Check className="h-1.5 w-1.5 text-white" strokeWidth={3} />
            )}
          </motion.span>
        </span>

        {/* Label */}
        {showLabel && (
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {displayLabel}
          </span>
        )}
      </div>
    )
  },
)

StatusIndicator.displayName = 'StatusIndicator'

export { StatusIndicator }
