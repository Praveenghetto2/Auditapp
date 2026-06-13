'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SidebarNavItem } from '@/components/shell/SidebarNavItem'
import { mainNavItems, bottomNavItems } from '@/lib/constants/navigation'

// ═══════════════════════════════════════════════════════════════════════
// Sidebar — Collapsible app navigation
// 240px expanded → 64px collapsed. State persisted in localStorage.
// ═══════════════════════════════════════════════════════════════════════

// Spring configs per skills.md
const fluidSpring = { type: 'spring' as const, stiffness: 300, damping: 30 }

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  className?: string
}

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 64 : 240 }}
      transition={fluidSpring}
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar/85 backdrop-blur-xl lg:flex',
        className,
      )}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex h-14 items-center gap-2 px-3">
        <Link href="/dashboard" className="flex items-center gap-0.5">
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">UX</span>
          <span className="text-lg font-bold tracking-tight text-uxray-primary-300">R</span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="logo-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-lg font-bold tracking-tight text-sidebar-foreground"
              >
                ay
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <div className="ml-auto">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="size-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
              >
                {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* ── Main navigation ─────────────────────────────────────── */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3" aria-label="Main Navigation">
        {mainNavItems.map((item) => (
          <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Bottom section ──────────────────────────────────────── */}
      <Separator className="bg-sidebar-border" />
      <nav className="flex flex-col gap-1 px-2 py-3" aria-label="Secondary Navigation">
        {bottomNavItems.map((item) => (
          <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Workspace indicator ─────────────────────────────────── */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg bg-sidebar-accent/30 dark:bg-white/[0.02] border border-sidebar-border/50 px-2 py-1.5 shadow-sm',
            collapsed && 'justify-center px-1',
          )}
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground shadow-md shadow-primary/20">
            U
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="workspace-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="truncate text-xs font-medium text-sidebar-foreground">UXRay Workspace</p>
                <p className="truncate text-xs text-sidebar-foreground/50">Free plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
