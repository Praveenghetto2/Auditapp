'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ExternalLink, Check, Copy, AlertTriangle, CheckCircle2,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════
// ExportDialog — Export audit issues to Jira, Linear, GitHub, Notion
// ═══════════════════════════════════════════════════════════════════════

interface ExportIssue {
  id: string
  title: string
  severity: 'critical' | 'serious' | 'minor'
  category: string
  description: string
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issues: ExportIssue[]
  projectName: string
}

const PLATFORMS = [
  { id: 'jira', name: 'Jira', icon: '🟦', description: 'Atlassian Jira Cloud' },
  { id: 'linear', name: 'Linear', icon: '🟣', description: 'Linear App' },
  { id: 'github', name: 'GitHub Issues', icon: '🐙', description: 'GitHub Repository' },
  { id: 'notion', name: 'Notion', icon: '📝', description: 'Notion Database' },
]

const PRIORITY_MAP = {
  critical: { label: 'P0 — Critical', color: 'bg-red-500/15 text-red-500' },
  serious: { label: 'P1 — High', color: 'bg-amber-500/15 text-amber-500' },
  minor: { label: 'P2 — Medium', color: 'bg-blue-500/15 text-blue-500' },
}

export function ExportDialog({ open, onOpenChange, issues, projectName }: ExportDialogProps) {
  const [platform, setPlatform] = React.useState('jira')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set(issues.map((i) => i.id)))
  const [isExporting, setIsExporting] = React.useState(false)
  const [exported, setExported] = React.useState(false)

  const toggleIssue = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(issues.map((i) => i.id)))
  const deselectAll = () => setSelectedIds(new Set())

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setExported(true)
      const platformName = PLATFORMS.find((p) => p.id === platform)?.name || platform
      toast.success(`${selectedIds.size} issue${selectedIds.size !== 1 ? 's' : ''} exported to ${platformName}!`)
      setTimeout(() => {
        setExported(false)
        onOpenChange(false)
      }, 1500)
    }, 2000)
  }

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="size-5 text-uxray-primary-300" />
            Export Issues
          </DialogTitle>
          <DialogDescription>
            Export audit issues from <strong>{projectName}</strong> as tickets to your project management tool.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          {/* Platform selector */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Destination Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-lg border transition-all cursor-pointer text-left",
                    platform === p.id
                      ? "border-uxray-primary-300/40 bg-uxray-primary-300/10 shadow-sm"
                      : "border-border/40 bg-card/40 hover:bg-muted/30"
                  )}
                >
                  <span className="text-xl">{p.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Issue selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Issues ({selectedIds.size}/{issues.length})</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-uxray-primary-300 hover:underline cursor-pointer">Select All</button>
                <button onClick={deselectAll} className="text-xs text-muted-foreground hover:underline cursor-pointer">Deselect All</button>
              </div>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {issues.map((issue) => {
                const isSelected = selectedIds.has(issue.id)
                const priority = PRIORITY_MAP[issue.severity]
                return (
                  <button
                    key={issue.id}
                    onClick={() => toggleIssue(issue.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer text-left",
                      isSelected
                        ? "border-uxray-primary-300/30 bg-uxray-primary-300/5"
                        : "border-border/30 bg-transparent hover:bg-muted/20 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "size-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-uxray-primary-300 border-uxray-primary-300" : "border-border/60"
                    )}>
                      {isSelected && <Check className="size-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
                    </div>
                    <Badge className={cn("text-xs border-0 shrink-0", priority.color)}>
                      {priority.label}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          {selectedIds.size > 0 && (
            <div className="bg-muted/20 rounded-lg border border-border/30 p-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Export Preview</p>
              <div className="text-xs text-muted-foreground space-y-1 font-mono">
                <p>Platform: {selectedPlatform?.name}</p>
                <p>Project: {projectName}</p>
                <p>Issues: {selectedIds.size} tickets</p>
                <p>Labels: uxray-audit, design-review</p>
              </div>
            </div>
          )}

          {/* Export progress */}
          {isExporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-center gap-3 p-4 bg-uxray-primary-300/10 rounded-lg border border-uxray-primary-300/20"
            >
              <Loader2 className="size-5 animate-spin text-uxray-primary-300" />
              <p className="text-sm font-medium text-muted-foreground">Creating tickets in {selectedPlatform?.name}...</p>
            </motion.div>
          )}

          {exported && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
            >
              <CheckCircle2 className="size-5 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Successfully exported!</p>
            </motion.div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedIds.size === 0 || exported}
            className="bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 text-white border-0 hover:opacity-90"
          >
            {isExporting ? 'Exporting...' : `Export ${selectedIds.size} Issue${selectedIds.size !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
