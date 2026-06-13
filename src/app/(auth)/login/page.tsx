'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════
// Login Page — Premium SaaS Aesthetics
// ═══════════════════════════════════════════════════════════════════════

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

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    try {
      await login(email, password)
      router.replace('/dashboard')
    } catch {
      setError('Invalid email or password.')
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1 text-center sm:text-left">
        <h1 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
          Sign In
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your credentials to access your workspace
        </p>
      </motion.div>

      {/* Quick Demo Credentials Helper */}
      <motion.div 
        variants={itemVariants} 
        className="glass-panel glowing-border-pulse rounded-2xl p-4 flex flex-row items-center justify-between gap-3 text-xs text-muted-foreground select-none shadow-md"
      >
        <div className="space-y-0.5">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-uxray-primary-300" />
            Quick Demo Account
          </div>
          <div className="text-xs text-muted-foreground/80 leading-normal">
            Email: <span className="font-semibold text-foreground font-mono select-all">demo@uxray.ai</span><br />
            Pass: <span className="font-semibold text-foreground font-mono select-all">demo123</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail('demo@uxray.ai')
            setPassword('demo123')
            toast.success('Demo credentials loaded!')
          }}
          className="h-8 px-3 rounded-lg border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 font-bold text-xs text-primary shrink-0 transition-all duration-300 cursor-pointer shadow-sm"
        >
          Auto-fill
        </button>
      </motion.div>

      {/* Form */}
      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col">
          <label 
            htmlFor="login-email" 
            className="text-xs font-bold tracking-wider text-muted-foreground uppercase select-none"
          >
            Email Address
          </label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors peer-focus:text-uxray-primary-300" />
            <input
              id="login-email"
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

        {/* Password */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="login-password" 
              className="text-xs font-bold tracking-wider text-muted-foreground uppercase select-none"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-uxray-primary-300 hover:text-uxray-primary-400 transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors peer-focus:text-uxray-primary-300" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full h-11 border border-black/10 dark:border-white/[0.06] rounded-xl bg-black/[0.01] dark:bg-[#1c1c1e]/80 pl-10 pr-10 text-sm text-foreground hover:border-black/20 dark:hover:border-uxray-primary-300/35 focus:border-uxray-primary-300 dark:focus:border-uxray-primary-300 focus:ring-4 focus:ring-uxray-primary-300/5 dark:focus:ring-uxray-primary-300/15 outline-none transition-all duration-200"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
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
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </motion.div>
      </motion.form>

      {/* Separator */}
      <motion.div variants={itemVariants} className="relative flex items-center justify-center">
        <div className="absolute w-full border-t border-black/5 dark:border-white/5" />
        <span className="relative bg-white dark:bg-[#161617] px-3 text-xs font-medium text-muted-foreground select-none transition-colors duration-500">
          OR CONTINUE WITH
        </span>
      </motion.div>

      {/* Social Logins */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-11 w-full gap-2 rounded-xl border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 hover:text-foreground transition-all text-xs font-semibold" 
          type="button" 
          disabled
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
        <Button 
          variant="outline" 
          className="h-11 w-full gap-2 rounded-xl border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 hover:text-foreground transition-all text-xs font-semibold" 
          type="button" 
          disabled
        >
          <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground/80 select-none">
        Don&apos;t have an account?{' '}
        <Link 
          href="/register" 
          className="font-semibold text-uxray-primary-300 hover:text-uxray-primary-400 transition-colors"
        >
          Create one
        </Link>
      </motion.p>
    </motion.div>
  )
}
