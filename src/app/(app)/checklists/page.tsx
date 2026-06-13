'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ClipboardList,
  Copy,
  Trash2,
  MoreVertical,
  Shield,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useChecklistStore, type ChecklistCategory } from '@/lib/stores/checklist-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<ChecklistCategory, string> = {
  Usability: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/20',
  Accessibility: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20',
  Visual: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20',
  Content: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
  Performance: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
}

function getCategoryBreakdown(items: { category: ChecklistCategory }[]) {
  const map: Partial<Record<ChecklistCategory, number>> = {}
  items.forEach((i) => {
    map[i.category] = (map[i.category] || 0) + 1
  })
  return Object.entries(map) as [ChecklistCategory, number][]
}

// ─── Animation Variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
} as const

// ─── Page Component ─────────────────────────────────────────────────

export default function ChecklistsPage() {
  useBreadcrumbs([{ label: 'Checklists', href: '/checklists' }])

  const router = useRouter()
  const checklists = useChecklistStore((s) => s.checklists)
  const addChecklist = useChecklistStore((s) => s.addChecklist)
  const deleteChecklist = useChecklistStore((s) => s.deleteChecklist)
  const duplicateChecklist = useChecklistStore((s) => s.duplicateChecklist)

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const handleCreate = () => {
    const newChecklist = addChecklist({
      name: 'New Checklist',
      description: 'Describe the purpose of this audit checklist.',
      icon: '📋',
      isBuiltIn: false,
      items: [],
    })
    router.push(`/checklists/${newChecklist.id}`)
  }

  const handleDuplicate = (id: string) => {
    const dup = duplicateChecklist(id)
    if (dup) router.push(`/checklists/${dup.id}`)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteChecklist(id)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="size-7 text-primary" />
            Audit Checklists
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable audit checklists with custom criteria.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="shrink-0 gap-2 font-semibold shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground transition-all"
        >
          <Plus className="size-4" />
          Create Checklist
        </Button>
      </div>

      {/* ─── Stats Bar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/10 liquid-glass-clear shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Shield className="size-4 text-primary/70" />
          <span>
            <span className="font-bold text-foreground">{checklists.filter((c) => c.isBuiltIn).length}</span> built-in
          </span>
        </div>
        <div className="h-4 w-px bg-border/60" />
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="size-4 text-primary/70" />
          <span>
            <span className="font-bold text-foreground">{checklists.filter((c) => !c.isBuiltIn).length}</span> custom
          </span>
        </div>
        <div className="h-4 w-px bg-border/60" />
        <div className="text-sm font-medium text-muted-foreground">
          <span className="font-bold text-foreground">
            {checklists.reduce((sum, c) => sum + c.items.length, 0)}
          </span>{' '}
          total criteria
        </div>
      </div>

      {/* ─── Grid ────────────────────────────────────────────────────── */}
      {checklists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed border-border/40 bg-card/10 glass-panel"
        >
          <ClipboardList className="size-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold mb-1">No checklists yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Create your first custom audit checklist to standardize your reviews.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Create Checklist
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {checklists.map((checklist) => {
              const categoryBreakdown = getCategoryBreakdown(checklist.items)
              const enabledCount = checklist.items.filter((i) => i.enabled).length

              return (
                <motion.div
                  key={checklist.id}
                  layout
                  variants={itemVariants}
                  exit="exit"
                  className="h-full"
                >
                  <div
                    className={cn(
                      'group relative flex flex-col overflow-hidden rounded-xl glass-panel p-5 shadow-md h-full transition-all duration-300',
                      'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5'
                    )}
                  >
                    {/* Clickable area */}
                    <Link
                      href={`/checklists/${checklist.id}`}
                      className="absolute inset-0 z-10"
                      aria-label={`Edit checklist: ${checklist.name}`}
                    />

                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl leading-none shrink-0 drop-shadow-sm">{checklist.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base truncate tracking-tight group-hover:text-primary transition-colors">
                              {checklist.name}
                            </h3>
                            {checklist.isBuiltIn && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 shrink-0 font-bold uppercase tracking-wider"
                              >
                                Built-in
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {enabledCount}/{checklist.items.length} criteria enabled
                          </p>
                        </div>
                      </div>

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 z-20 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={`Actions for ${checklist.name}`}
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              handleDuplicate(checklist.id)
                            }}
                          >
                            <Copy className="size-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {!checklist.isBuiltIn && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDelete(checklist.id, checklist.name)
                                }}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {checklist.description}
                    </p>

                    {/* Category Breakdown Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/30">
                      {categoryBreakdown.map(([category, count]) => (
                        <span
                          key={category}
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                            CATEGORY_COLORS[category]
                          )}
                        >
                          {category}
                          <span className="font-bold opacity-70">({count})</span>
                        </span>
                      ))}
                      {categoryBreakdown.length === 0 && (
                        <span className="text-[10px] text-muted-foreground/60 italic">
                          No items yet
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
