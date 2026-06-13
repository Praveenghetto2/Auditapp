'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  /** Icon element rendered in the circle – defaults to Inbox */
  icon?: React.ReactNode
  /** Heading text */
  title: string
  /** Descriptive body text */
  description: string
  /** Optional call-to-action */
  action?: { label: string; onClick: () => void }
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center px-6 py-16 text-center',
          className,
        )}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Icon circle */}
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--uxray-surface-100)' }}
        >
          {icon ?? (
            <Inbox
              className="h-7 w-7"
              style={{ color: 'var(--uxray-surface-300)' }}
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Action */}
        {action && (
          <Button
            onClick={action.onClick}
            className="mt-6"
            size="default"
          >
            {action.label}
          </Button>
        )}
      </motion.div>
    )
  },
)

EmptyState.displayName = 'EmptyState'

export { EmptyState }
