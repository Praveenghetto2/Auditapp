'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { NavItem } from '@/lib/types'

// ═══════════════════════════════════════════════════════════════════════
// SidebarNavItem
// Reused in Sidebar (desktop) and MobileDrawer.
// ═══════════════════════════════════════════════════════════════════════

interface SidebarNavItemProps {
  item: NavItem
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNavItem({ item, collapsed = false, onNavigate }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const Icon = item.icon

  // macOS 27 Golden Gate Colored Sidebar navigation icon mapping
  const getIconColor = () => {
    if (isActive) {
      switch (item.href) {
        case '/dashboard':
          return 'text-blue-500 dark:text-blue-400'
        case '/projects':
          return 'text-orange-500 dark:text-orange-400'
        case '/audits':
          return 'text-emerald-500 dark:text-emerald-400'
        case '/reports':
          return 'text-indigo-500 dark:text-indigo-400'
        case '/settings':
          return 'text-gray-500 dark:text-gray-400'
        case '/help':
          return 'text-rose-500 dark:text-rose-400'
        default:
          return 'text-sidebar-primary'
      }
    }
    // Inactive hover triggers a soft transition to guide the eye
    switch (item.href) {
      case '/dashboard':
        return 'text-sidebar-foreground/50 group-hover:text-blue-500/80 dark:group-hover:text-blue-450/85'
      case '/projects':
        return 'text-sidebar-foreground/50 group-hover:text-orange-500/80 dark:group-hover:text-orange-450/85'
      case '/audits':
        return 'text-sidebar-foreground/50 group-hover:text-emerald-500/80 dark:group-hover:text-emerald-450/85'
      case '/reports':
        return 'text-sidebar-foreground/50 group-hover:text-indigo-500/80 dark:group-hover:text-indigo-450/85'
      case '/settings':
        return 'text-sidebar-foreground/50 group-hover:text-gray-500/80 dark:group-hover:text-gray-450/85'
      case '/help':
        return 'text-sidebar-foreground/50 group-hover:text-rose-500/80 dark:group-hover:text-rose-450/85'
      default:
        return 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
    }
  }

  const content = (
    <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          'hover:bg-sidebar-accent/15',
          isActive
            ? 'text-sidebar-foreground font-semibold'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-2',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {/* Active indicator pill */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 rounded-lg border-l-2 border-primary bg-gradient-to-r from-primary/12 via-primary/5 to-transparent"
            style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}

        <motion.div
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Icon className={cn('size-[18px] shrink-0 transition-colors duration-200', getIconColor())} />
        </motion.div>

        <AnimatePresence initial={false} mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="truncate select-none"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge */}
        {!collapsed && item.badge != null && item.badge > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {item.badge > 99 ? '99+' : item.badge}
            <span className="sr-only">unread items</span>
          </span>
        )}
      </Link>
    </motion.div>
  )

  // When collapsed, wrap in a tooltip showing the label
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="font-medium">
          {item.label}
          {item.badge != null && item.badge > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">({item.badge})</span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
