'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ═══════════════════════════════════════════════════════════════════════
// Forgot Password Page — Premium SaaS Aesthetics
// ═══════════════════════════════════════════════════════════════════════

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
} as const

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSent, setIsSent] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setIsLoading(true)
    await delay(1200) // Simulate API call
    setIsLoading(false)
    setIsSent(true)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            key="form-container"
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-1 text-center sm:text-left">
              <h1 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text">
                Reset Password
              </h1>
              <p className="text-xs text-muted-foreground">
                We will send you a secure link to reset your password
              </p>
            </motion.div>

            {/* Form */}
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col">
                <label 
                  htmlFor="forgot-email" 
                  className="text-xs font-bold tracking-wider text-muted-foreground uppercase select-none"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors peer-focus:text-uxray-primary-300" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full h-11 border border-black/10 dark:border-white/[0.06] rounded-xl bg-black/[0.01] dark:bg-[#1c1c1e]/80 pl-10 pr-4 text-sm text-foreground hover:border-black/20 dark:hover:border-uxray-primary-300/35 focus:border-uxray-primary-300 dark:focus:border-uxray-primary-300 focus:ring-4 focus:ring-uxray-primary-300/5 dark:focus:ring-uxray-primary-300/15 outline-none transition-all duration-200"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Error Notification */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    className="text-xs font-semibold text-uxray-danger-300 text-center sm:text-left"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.div 
                whileTap={{ scale: 0.98 }} 
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="mt-1"
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative overflow-hidden group h-11 w-full rounded-xl bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 hover:from-uxray-primary-400 hover:to-uxray-secondary-400 text-white text-sm font-semibold shadow-md shadow-uxray-primary-300/10 hover:shadow-lg hover:shadow-uxray-primary-300/25 transition-all focus:outline-none disabled:opacity-80 cursor-pointer flex items-center justify-center gap-2"
                >
                  {/* Shimmer sweep effect */}
                  <div className="absolute inset-0 w-[50%] h-full bg-white/20 skew-x-[-25deg] -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending link…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="flex flex-col items-center gap-5 py-4 text-center"
          >
            {/* Self-drawing success checkmark icon with glowing ring */}
            <div className="relative flex size-16 items-center justify-center rounded-2xl border border-uxray-success-200/20 bg-uxray-success-50/50 dark:bg-uxray-success-400/5 shadow-sm">
              <svg className="size-8 text-uxray-success-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">Check your email</h2>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                We sent a secure password reset link to
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] px-3.5 py-1.5 text-xs font-medium text-foreground mt-2 select-all shadow-sm">
                <Mail className="size-3.5 text-uxray-primary-300" />
                {email}
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-2 h-9 rounded-xl border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold"
              onClick={() => {
                setIsSent(false)
                setEmail('')
              }}
            >
              Try a different email
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Login */}
      <motion.p variants={itemVariants} className="text-center select-none">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 transition-colors hover:text-foreground group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to sign in
        </Link>
      </motion.p>
    </motion.div>
  )
}
