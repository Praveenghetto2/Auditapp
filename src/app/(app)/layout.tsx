'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/shell/Sidebar'
import { Header } from '@/components/shell/Header'
import { MobileDrawer } from '@/components/shell/MobileDrawer'

import { useAuthStore } from '@/lib/stores/auth-store'

// ═══════════════════════════════════════════════════════════════════════
// App Layout — Authenticated shell (sidebar + header + main)
// Client-side auth guard: redirects to / if not authenticated.
// ═══════════════════════════════════════════════════════════════════════

const SIDEBAR_KEY = 'uxray-sidebar-collapsed'
const fluidSpring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()

  // Hydrate collapsed state from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY)
    if (stored === 'true') setCollapsed(true)
    setMounted(true)
  }, [])

  // Persist collapsed state
  const toggleSidebar = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }, [])

  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding)

  // Auth guard and Onboarding redirect
  React.useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.replace('/')
      } else if (!hasCompletedOnboarding) {
        router.replace('/onboarding')
      }
    }
  }, [mounted, isAuthenticated, hasCompletedOnboarding, router])

  // Don't render until hydrated, authenticated, and completed onboarding
  if (!mounted || !isAuthenticated || !hasCompletedOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-muted/20 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Sidebar (desktop only, hidden via CSS on mobile) */}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Main content area — offset by sidebar width */}
      <motion.div
        layout
        animate={{ marginLeft: collapsed ? 64 : 240 }}
        transition={fluidSpring}
        className="flex min-h-screen flex-col max-lg:!ml-0"
      >
        <Header
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  )
}
