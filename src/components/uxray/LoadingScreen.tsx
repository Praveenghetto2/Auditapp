'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoadingScreenProps {
  /** Optional loading message */
  message?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(
  ({ message = 'Analyzing your interface…', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm',
          className,
        )}
        role="status"
        aria-label="Loading"
      >
        {/* Logo */}
        <motion.div
          className="relative mb-8 select-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-4xl font-bold tracking-tighter sm:text-5xl">
            <span style={{ color: 'var(--uxray-surface-400)' }}>U</span>
            {/* The "X" with a glow animation */}
            <motion.span
              className="relative inline-block"
              style={{ color: 'var(--uxray-primary-300)' }}
              animate={{
                textShadow: [
                  '0 0 8px rgba(139,92,246,0.3)',
                  '0 0 20px rgba(139,92,246,0.6)',
                  '0 0 8px rgba(139,92,246,0.3)',
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              X
            </motion.span>
            <span style={{ color: 'var(--uxray-surface-400)' }}>Ray</span>
          </span>
        </motion.div>

        {/* Scanning line container */}
        <motion.div
          className="relative mb-8 h-1 w-48 overflow-hidden rounded-full sm:w-64"
          style={{ backgroundColor: 'var(--uxray-surface-100)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Sweeping line */}
          <motion.div
            className="absolute inset-y-0 w-16 rounded-full"
            style={{
              backgroundColor: 'var(--uxray-primary-300)',
            }}
            animate={{ x: ['-64px', '256px'] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Message */}
        <motion.p
          className="mb-4 text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.p>

        {/* Three animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--uxray-primary-300)' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    )
  },
)

LoadingScreen.displayName = 'LoadingScreen'

export { LoadingScreen }
