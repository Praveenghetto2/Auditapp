'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Pencil,
  BarChart3,
  CheckCircle2,
  ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useChecklistStore,
  type ChecklistCategory,
  type SeverityWeight,
} from '@/lib/stores/checklist-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { cn } from '@/lib/utils'

// ─── Constants ───────────────────────────────────────────────────────

const CATEGORIES: ChecklistCategory[] = ['Usability', 'Accessibility', 'Visual', 'Content', 'Performance']
const SEVERITIES: SeverityWeight[] = ['critical', 'serious', 'minor']

const CATEGORY_COLORS: Record<ChecklistCategory, string> = {
  Usability: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  Accessibility: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  Visual: 'bg-pink-500/15 text-pink-700 dark:text-pink-300',
  Content: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Performance: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
}

const SEVERITY_COLORS: Record<SeverityWeight, string> = {
  critical: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/20',
  serious: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
  minor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20',
}

const CATEGORY_STAT_COLORS: Record<ChecklistCategory, string> = {
  Usability: 'bg-gradient-to-br from-violet-500/20 to-violet-600/10 border-violet-500/15',
  Accessibility: 'bg-gradient-to-br from-sky-500/20 to-sky-600/10 border-sky-500/15',
  Visual: 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 border-pink-500/15',
  Content: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/15',
  Performance: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/15',
}

// ─── Animation Variants ─────────────────────────────────────────────

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
} as const

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: 20,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: { duration: 0.2 },
  },
} as const

// ─── Inline Edit Component ──────────────────────────────────────────

function InlineEdit({
  value,
  onSave,
  className,
  inputClassName,
  tag: Tag = 'span',
  placeholder = 'Click to edit...',
}: {
  value: string
  onSave: (val: string) => void
  className?: string
  inputClassName?: string
  tag?: 'span' | 'h1' | 'p'
  placeholder?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  React.useEffect(() => {
    setDraft(value)
  }, [value])

  const commit = () => {
    setEditing(false)
    if (draft.trim() && draft.trim() !== value) {
      onSave(draft.trim())
    } else {
      setDraft(value)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(value)
              setEditing(false)
            }
          }}
          onBlur={commit}
          className={cn(
            'h-auto py-1 px-2 bg-background/60 border-primary/30 focus-visible:ring-primary/20',
            inputClassName
          )}
        />
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={commit}>
          <Check className="size-3.5 text-emerald-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => {
            setDraft(value)
            setEditing(false)
          }}
        >
          <X className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  return (
    <Tag
      className={cn('cursor-pointer group/edit inline-flex items-center gap-1.5 hover:text-primary transition-colors', className)}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') setEditing(true) }}
    >
      {value || <span className="italic text-muted-foreground/60">{placeholder}</span>}
      <Pencil className="size-3 opacity-0 group-hover/edit:opacity-60 transition-opacity shrink-0" />
    </Tag>
  )
}

// ─── Page Component ─────────────────────────────────────────────────

export default function ChecklistEditorPage() {
  const params = useParams()
  const checklistId = params.id as string

  const checklist = useChecklistStore((s) => s.getChecklist(checklistId))
  const updateChecklist = useChecklistStore((s) => s.updateChecklist)
  const toggleItem = useChecklistStore((s) => s.toggleItem)
  const addItem = useChecklistStore((s) => s.addItem)
  const removeItem = useChecklistStore((s) => s.removeItem)
  const updateItem = useChecklistStore((s) => s.updateItem)

  useBreadcrumbs([
    { label: 'Checklists', href: '/checklists' },
    { label: checklist?.name || 'Editor', href: `/checklists/${checklistId}` },
  ])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <ListChecks className="size-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-bold mb-2">Checklist not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This checklist may have been deleted.
        </p>
        <Button asChild variant="outline">
          <Link href="/checklists">
            <ArrowLeft className="mr-2 size-4" />
            Back to Checklists
          </Link>
        </Button>
      </div>
    )
  }

  const enabledCount = checklist.items.filter((i) => i.enabled).length
  const categoryMap: Partial<Record<ChecklistCategory, number>> = {}
  checklist.items.forEach((i) => {
    categoryMap[i.category] = (categoryMap[i.category] || 0) + 1
  })
  const categoryBreakdown = Object.entries(categoryMap) as [ChecklistCategory, number][]

  const handleAddItem = () => {
    addItem(checklistId, {
      title: 'New criterion',
      description: 'Describe what to check for this criterion.',
      category: 'Usability',
      severityWeight: 'minor',
      enabled: true,
    })
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ─── Back Button ─────────────────────────────────────────────── */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
          <Link href="/checklists">
            <ArrowLeft className="size-4" />
            Back to Checklists
          </Link>
        </Button>
      </div>

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <span className="text-4xl leading-none shrink-0 drop-shadow-sm">{checklist.icon}</span>
          <div className="flex-1 min-w-0">
            <InlineEdit
              value={checklist.name}
              onSave={(val) => updateChecklist(checklistId, { name: val })}
              tag="h1"
              className="text-2xl font-bold tracking-tight"
              inputClassName="text-2xl font-bold"
              placeholder="Checklist name..."
            />
            <div className="mt-1.5">
              <InlineEdit
                value={checklist.description}
                onSave={(val) => updateChecklist(checklistId, { description: val })}
                tag="p"
                className="text-sm text-muted-foreground"
                inputClassName="text-sm"
                placeholder="Add a description..."
              />
            </div>
            {checklist.isBuiltIn && (
              <Badge variant="secondary" className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                Built-in Template
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Summary ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {/* Total & Enabled */}
        <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/30">
          <BarChart3 className="size-5 text-primary/60 mb-1.5" />
          <span className="text-2xl font-bold text-foreground">{checklist.items.length}</span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total</span>
        </div>
        <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/30">
          <CheckCircle2 className="size-5 text-emerald-500/70 mb-1.5" />
          <span className="text-2xl font-bold text-foreground">{enabledCount}</span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Enabled</span>
        </div>

        {/* Category Breakdowns */}
        {categoryBreakdown.length > 0 ? (
          categoryBreakdown.slice(0, 3).map(([category, count]) => (
            <div
              key={category}
              className={cn(
                'rounded-xl p-4 flex flex-col items-center justify-center text-center border',
                CATEGORY_STAT_COLORS[category]
              )}
            >
              <span className="text-2xl font-bold text-foreground">{count}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {category}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-3 sm:col-span-1 lg:col-span-3 glass-panel rounded-xl p-4 flex items-center justify-center text-center border border-border/30">
            <span className="text-xs text-muted-foreground/60 italic">No items yet</span>
          </div>
        )}
      </motion.div>

      {/* ─── Items List ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <ListChecks className="size-5 text-primary/70" />
            Criteria
            <span className="text-sm text-muted-foreground font-normal">({checklist.items.length})</span>
          </h2>
          <Button onClick={handleAddItem} size="sm" className="gap-1.5 font-semibold">
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>

        {checklist.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/40 bg-card/10 glass-panel"
          >
            <ListChecks className="size-10 text-muted-foreground/20 mb-3" />
            <h3 className="text-sm font-bold mb-1">No criteria added yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Add audit criteria to build your custom checklist.
            </p>
            <Button onClick={handleAddItem} size="sm" variant="outline">
              <Plus className="mr-1.5 size-3.5" />
              Add First Item
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            <AnimatePresence mode="popLayout">
              {checklist.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={rowVariants}
                  exit="exit"
                  className={cn(
                    'glass-panel rounded-xl p-4 border border-border/30 transition-all duration-200',
                    'hover:shadow-md hover:border-border/50',
                    !item.enabled && 'opacity-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag Handle (visual only) */}
                    <div className="shrink-0 mt-1 cursor-grab text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
                      <GripVertical className="size-5" />
                    </div>

                    {/* Toggle */}
                    <div className="shrink-0 mt-1">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={() => toggleItem(checklistId, item.id)}
                        aria-label={`Toggle ${item.title}`}
                        size="sm"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1">
                        <InlineEdit
                          value={item.title}
                          onSave={(val) => updateItem(checklistId, item.id, { title: val })}
                          className="font-semibold text-sm"
                          inputClassName="text-sm font-semibold"
                          placeholder="Item title..."
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Select
                            value={item.category}
                            onValueChange={(val) =>
                              updateItem(checklistId, item.id, { category: val as ChecklistCategory })
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                'h-5 w-auto text-[10px] font-semibold px-2 py-0 rounded-full border-0 gap-1',
                                CATEGORY_COLORS[item.category]
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat} className="text-xs">
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={item.severityWeight}
                            onValueChange={(val) =>
                              updateItem(checklistId, item.id, { severityWeight: val as SeverityWeight })
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                'h-5 w-auto text-[10px] font-semibold px-2 py-0 rounded-full border gap-1',
                                SEVERITY_COLORS[item.severityWeight]
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SEVERITIES.map((sev) => (
                                <SelectItem key={sev} value={sev} className="text-xs capitalize">
                                  {sev}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <InlineEdit
                        value={item.description}
                        onSave={(val) => updateItem(checklistId, item.id, { description: val })}
                        className="text-xs text-muted-foreground leading-relaxed"
                        inputClassName="text-xs"
                        placeholder="Add a description..."
                      />
                    </div>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 mt-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={`Delete item: ${item.title}`}
                      onClick={() => {
                        if (confirm(`Remove "${item.title}" from this checklist?`)) {
                          removeItem(checklistId, item.id)
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom Add Button */}
        {checklist.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Button
              onClick={handleAddItem}
              variant="outline"
              className="w-full border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all gap-2"
            >
              <Plus className="size-4" />
              Add Another Criterion
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
