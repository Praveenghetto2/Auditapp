'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IssueBadgeProps {
  /** Issue severity level */
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  /** Optional count displayed after the severity label */
  count?: number
  className?: string
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const severityStyles: Record<
  IssueBadgeProps['severity'],
  { bg: string; text: string; label: string }
> = {
  critical: {
    bg: 'var(--uxray-danger-300)',
    text: '#ffffff',
    label: 'Critical',
  },
  serious: {
    bg: 'var(--uxray-warning-200)',
    text: 'var(--uxray-warning-400)',
    label: 'Serious',
  },
  moderate: {
    bg: 'var(--uxray-secondary-200)',
    text: '#ffffff',
    label: 'Moderate',
  },
  minor: {
    bg: 'var(--uxray-surface-100)',
    text: 'var(--uxray-surface-400)',
    label: 'Minor',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const IssueBadge = React.forwardRef<HTMLSpanElement, IssueBadgeProps>(
  ({ severity, count, className }, ref) => {
    const style = severityStyles[severity]

    return (
      <Badge
        ref={ref}
        className={cn(
          'select-none rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase border-0',
          className,
        )}
        style={{
          backgroundColor: style.bg,
          color: style.text,
        }}
      >
        {style.label}
        {count !== undefined && (
          <span
            className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs font-bold leading-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              color: style.text,
            }}
          >
            {count}
          </span>
        )}
      </Badge>
    )
  },
)

IssueBadge.displayName = 'IssueBadge'

export { IssueBadge }
