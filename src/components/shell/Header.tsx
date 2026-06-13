import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, Sun, Moon, Bell, ChevronRight, LogOut, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useBreadcrumbStore } from '@/lib/stores/breadcrumb-store'
import { useAuthStore } from '@/lib/stores/auth-store'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from '@/components/ui/command'
import { mainNavItems, bottomNavItems, commandActions } from '@/lib/constants/navigation'

// ═══════════════════════════════════════════════════════════════════════
// Header — Top bar of the app shell
// Breadcrumbs (left), search + theme + user (right).
// ═══════════════════════════════════════════════════════════════════════

interface HeaderProps {
  onMobileMenuOpen: () => void
  className?: string
}

export function Header({ onMobileMenuOpen, className }: HeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const breadcrumbs = useBreadcrumbStore((s) => s.items)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [mounted, setMounted] = React.useState(false)
  const [openSearch, setOpenSearch] = React.useState(false)

  // Hydration guard for theme icon
  React.useEffect(() => setMounted(true), [])

  // ⌘K keyboard shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpenSearch((open) => !open)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = React.useCallback(
    (value: string) => {
      setOpenSearch(false)
      if (value === 'toggle-theme') {
        setTheme(theme === 'dark' ? 'light' : 'dark')
        return
      }
      router.push(value)
    },
    [router, setTheme, theme],
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl transition-all duration-300',
        className,
      )}
    >
      {/* ── Mobile menu trigger ─────────────────────────────────── */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 lg:hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mr-1 h-5 lg:hidden" />

      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumbs">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          return (
            <React.Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && <ChevronRight className="size-3 text-muted-foreground" aria-hidden="true" />}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* ── Spacer ──────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Search trigger ──────────────────────────────────────── */}
      <Popover open={openSearch} onOpenChange={setOpenSearch}>
        <PopoverTrigger asChild>
          <div>
            <motion.div whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-56 justify-start gap-2 text-muted-foreground bg-card/60 border-border/40 hover:border-primary/30 transition-all duration-300 shadow-sm focus-visible:ring-2"
              >
                <Search className="size-3.5" />
                <span className="text-xs">Search…</span>
                <kbd className="ml-auto inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </motion.div>

            {/* Mobile search icon */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 sm:hidden hover:bg-muted/40"
                  aria-label="Search"
                >
                  <Search className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search (⌘K)</TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-72 sm:w-80 p-0" align="end" sideOffset={8}>
          <Command className="bg-transparent border-0 rounded-xl overflow-hidden">
            <CommandInput placeholder="Type a command or search…" className="bg-transparent border-0 ring-0 focus:ring-0" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              <CommandGroup heading="Navigation">
                {[...mainNavItems, ...bottomNavItems].map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.href}
                      value={item.label}
                      onSelect={() => handleSelect(item.href)}
                      className="data-selected:bg-uxray-primary-300/10 data-selected:text-uxray-primary-200 transition-colors cursor-pointer"
                    >
                      <Icon className="mr-2 size-4 text-muted-foreground group-data-selected/command-item:text-uxray-primary-300 transition-colors" />
                      {item.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Actions">
                {commandActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <CommandItem
                      key={action.label}
                      value={action.label}
                      onSelect={() => handleSelect(action.action ?? action.href ?? '')}
                      className="data-selected:bg-uxray-primary-300/10 data-selected:text-uxray-primary-200 transition-colors cursor-pointer"
                    >
                      <Icon className="mr-2 size-4 text-muted-foreground group-data-selected/command-item:text-uxray-primary-300 transition-colors" />
                      {action.label}
                      {action.href && (
                        <CommandShortcut className="text-xs text-muted-foreground">↵</CommandShortcut>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* ── Theme toggle ────────────────────────────────────────── */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 relative overflow-hidden text-muted-foreground hover:text-foreground hover:bg-muted/40"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mounted ? (
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="size-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,159,0,0.5)]" aria-hidden="true" />
                  ) : (
                    <Moon className="size-4 text-indigo-500" aria-hidden="true" />
                  )}
                </motion.div>
              ) : (
                <div className="size-4" key="fallback" />
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>

      {/* ── Notifications ───────────────────────────────────────── */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="relative size-8" aria-label="Notifications (1 unread)">
            <Bell className="size-4" aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-uxray-danger-200">
              <span className="sr-only">New unread notifications</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* ── User menu ───────────────────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/30 data-[state=open]:ring-primary/50" aria-label="Open user menu">
            <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-panel border border-border/40 shadow-xl" sideOffset={8}>
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col space-y-1.5">
              <p className="text-sm font-semibold leading-none text-foreground">
                {user?.name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground font-mono">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer gap-2 p-2 focus:bg-primary/10 focus:text-primary transition-colors">
              <User className="size-4 opacity-70" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 p-2 focus:bg-primary/10 focus:text-primary transition-colors">
              <Settings className="size-4 opacity-70" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuItem
            className="cursor-pointer gap-2 p-2 focus:bg-destructive/10 focus:text-destructive text-destructive/90 transition-colors"
            onClick={() => {
              logout()
              router.push('/login')
            }}
          >
            <LogOut className="size-4 opacity-70" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
