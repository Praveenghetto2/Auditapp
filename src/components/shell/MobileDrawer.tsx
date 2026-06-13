'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { SidebarNavItem } from '@/components/shell/SidebarNavItem'
import { mainNavItems, bottomNavItems } from '@/lib/constants/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

// ═══════════════════════════════════════════════════════════════════════
// MobileDrawer — Sheet-based navigation for < lg breakpoints
// Reuses SidebarNavItem for consistency. Auto-closes on route change.
// ═══════════════════════════════════════════════════════════════════════

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  // Auto-close on navigation
  React.useEffect(() => {
    onOpenChange(false)
  }, [pathname, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0" showCloseButton>
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="text-left">
            <span className="text-foreground">UX</span>
            <span className="text-uxray-primary-300">R</span>
            <span className="text-foreground">ay</span>
          </SheetTitle>
        </SheetHeader>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatarUrl} alt={user.name} className="size-8 rounded-full bg-muted" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Main navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
          {mainNavItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} onNavigate={() => onOpenChange(false)} />
          ))}
        </nav>

        <Separator />

        {/* Bottom navigation */}
        <nav className="flex flex-col gap-1 px-2 py-3">
          {bottomNavItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} onNavigate={() => onOpenChange(false)} />
          ))}
        </nav>

        {/* Workspace badge */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-accent/40 px-2 py-1.5">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              U
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">UXRay Workspace</p>
              <p className="truncate text-xs text-muted-foreground">Free plan</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
