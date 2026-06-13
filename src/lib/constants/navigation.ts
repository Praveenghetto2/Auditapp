// ═══════════════════════════════════════════════════════════════════════
// UXRay — Navigation Constants
// Single source of truth for Sidebar, MobileDrawer, CommandPalette.
// ═══════════════════════════════════════════════════════════════════════

import {
  LayoutDashboard,
  FolderKanban,
  ScanSearch,
  FileBarChart,
  Settings,
  HelpCircle,
  Plus,
  Moon,
  Sun,
  Users,
  BarChart3,
  ClipboardCheck,
  GitCompareArrows,
} from 'lucide-react'
import type { NavItem } from '@/lib/types'

// ── Authenticated app navigation ─────────────────────────────────────

export const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Audits', href: '/audits', icon: ScanSearch },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  { label: 'Benchmarks', href: '/benchmarks', icon: BarChart3 },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Checklists', href: '/checklists', icon: ClipboardCheck },
]

export const bottomNavItems: NavItem[] = [
  { label: 'Figma Integration', href: '/integrations/figma', icon: GitCompareArrows },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help & Docs', href: '/help', icon: HelpCircle },
]

// ── Command palette actions ──────────────────────────────────────────

import type { LucideIcon } from 'lucide-react'

export type CommandAction =
  | { label: string; icon: LucideIcon; href: string; action?: never }
  | { label: string; icon: LucideIcon; action: string; href?: never }

export const commandActions: CommandAction[] = [
  { label: 'New Audit', icon: Plus, href: '/audits/new' },
  { label: 'New Project', icon: Plus, href: '/projects/new' },
  { label: 'Compare Audits', icon: GitCompareArrows, href: '/audits/compare' },
  { label: 'New Checklist', icon: ClipboardCheck, href: '/checklists' },
  { label: 'Toggle Dark Mode', icon: Moon, action: 'toggle-theme' },
  { label: 'Toggle Light Mode', icon: Sun, action: 'toggle-theme' },
]
