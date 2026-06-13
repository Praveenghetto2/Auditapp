'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ExternalLink, Check, Copy, AlertTriangle, CheckCircle2,
  Loader2, ChevronLeft, ChevronRight, Download
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
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════
// ExportDialog — Export audit issues to Jira, Linear, GitHub, Notion, Slides
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
  { id: 'slides', name: 'Slide Deck', icon: '🖼️', description: 'Client Slide Presentation' },
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
  
  // Slides Carousel states
  const [currentSlide, setCurrentSlide] = React.useState(0)

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
      if (platform === 'slides') {
        toast.success(`Slide presentation deck compiled and downloaded successfully!`)
      } else {
        toast.success(`${selectedIds.size} issue${selectedIds.size !== 1 ? 's' : ''} exported to ${platformName}!`)
      }
      setTimeout(() => {
        setExported(false)
        onOpenChange(false)
      }, 1500)
    }, 2000)
  }

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform)

  const slides = [
    {
      title: "Design Audit Report Presentation",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white relative overflow-hidden rounded-lg">
          <div className="absolute top-2 right-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Slide 1 of 4</div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-uxray-secondary-300">UX Diagnostic</span>
          <h2 className="text-lg font-bold mt-2 leading-tight">Heuristic & Accessibility Audit</h2>
          <p className="text-[11px] text-muted-foreground mt-1">{projectName} Website</p>
          <div className="mt-5 border border-white/10 rounded-full py-1 px-3.5 bg-white/5 backdrop-blur-sm text-[10px] font-semibold flex items-center gap-1.5">
            <span>Overall Score:</span>
            <span className="text-emerald-400 font-bold">86/100</span>
          </div>
        </div>
      )
    },
    {
      title: "Executive Scorecard Summary",
      content: (
        <div className="h-full p-5 bg-gradient-to-br from-slate-950 to-slate-900 text-white relative flex flex-col justify-between rounded-lg">
          <div className="absolute top-2 right-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Slide 2 of 4</div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-foreground">Audit Dimensions Scorecard</h3>
            <p className="text-[9px] text-muted-foreground">Detailed findings across accessibility, spacing, and layout.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Usability</p>
                <p className="text-sm font-bold text-emerald-400">85%</p>
              </div>
              <span className="text-xs">👁️</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Accessibility</p>
                <p className="text-sm font-bold text-red-400">92%</p>
              </div>
              <span className="text-xs">♿</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Performance</p>
                <p className="text-sm font-bold text-amber-400">78%</p>
              </div>
              <span className="text-xs">⚡</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Visual Design</p>
                <p className="text-sm font-bold text-emerald-400">88%</p>
              </div>
              <span className="text-xs">🎨</span>
            </div>
          </div>
          <p className="text-[8px] text-muted-foreground border-t border-white/10 pt-1 italic text-center">Total Issues Found: {issues.length} (3 critical, 4 serious)</p>
        </div>
      )
    },
    {
      title: "Key Critical Findings",
      content: (
        <div className="h-full p-5 bg-gradient-to-br from-slate-950 to-slate-900 text-white relative flex flex-col justify-between rounded-lg">
          <div className="absolute top-2 right-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Slide 3 of 4</div>
          <h3 className="text-xs font-bold text-red-400 flex items-center gap-1"><AlertTriangle className="size-3" /> High-Impact UX Violations</h3>
          <div className="space-y-1.5 my-1.5 flex-1 overflow-y-auto">
            <div className="p-1.5 rounded bg-red-500/10 border border-red-500/20 space-y-0.5">
              <p className="text-[9px] font-bold">1. Missing alt text on hero image</p>
              <p className="text-[8px] text-muted-foreground">Invisible to screen-readers, fails WCAG SC 1.1.1.</p>
            </div>
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 space-y-0.5">
              <p className="text-[9px] font-bold">2. Insufficient contrast ratio on CTA</p>
              <p className="text-[8px] text-muted-foreground">Light blue text on white has contrast of 2.1:1.</p>
            </div>
          </div>
          <p className="text-[8px] text-muted-foreground italic border-t border-white/10 pt-1 text-center">Fix recommendations have been generated for developer handoff.</p>
        </div>
      )
    },
    {
      title: "Action Plan & Next Steps",
      content: (
        <div className="h-full p-5 bg-gradient-to-br from-slate-950 to-slate-900 text-white relative flex flex-col justify-between rounded-lg">
          <div className="absolute top-2 right-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Slide 4 of 4</div>
          <h3 className="text-xs font-bold text-uxray-secondary-300">Implementation Roadmap</h3>
          <div className="space-y-1.5 my-1 flex-1">
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] text-emerald-400 font-bold">✓</span>
              <p className="text-[9px] leading-relaxed"><strong className="text-foreground">Immediate:</strong> Refactor HTML tags for accessibility attributes.</p>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] text-emerald-400 font-bold">✓</span>
              <p className="text-[9px] leading-relaxed"><strong className="text-foreground">Visuals:</strong> Increase button color contrast to WCAG standards.</p>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] text-emerald-400 font-bold">✓</span>
              <p className="text-[9px] leading-relaxed"><strong className="text-foreground">Alignment:</strong> Re-align spacing margins to an 8px grid.</p>
            </div>
          </div>
          <p className="text-[8px] text-muted-foreground italic border-t border-white/10 pt-1 text-center">Client Handoff Ready — Powered by UXRay</p>
        </div>
      )
    }
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border border-border/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="size-5 text-uxray-primary-300" />
            Export Audit Results
          </DialogTitle>
          <DialogDescription>
            Export issues from <strong>{projectName}</strong> as tickets or download client slide decks.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-3">
          {/* Platform selector */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Export Destination</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer text-left",
                    platform === p.id
                      ? "border-uxray-primary-300/40 bg-uxray-primary-300/10 shadow-sm"
                      : "border-border/40 bg-card/40 hover:bg-muted/30"
                  )}
                >
                  <span className="text-xl">{p.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">{p.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Rendering based on platform choice */}
          {platform === 'slides' ? (
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Slide Deck Presentation Preview</label>
              <div className="relative aspect-[16/10] w-full rounded-xl border border-white/10 bg-black overflow-hidden shadow-inner flex flex-col justify-between p-1">
                {slides[currentSlide].content}

                {/* Left/Right buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg border border-border/20">
                <span className="font-semibold">Format: Google Slides (.PPTX)</span>
                <span>Includes: Score charts, critical findings, and roadmap</span>
              </div>
            </div>
          ) : (
            <>
              {/* Issue selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Issues ({selectedIds.size}/{issues.length})</label>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-[10px] text-uxray-primary-300 hover:underline cursor-pointer font-bold">Select All</button>
                    <button onClick={deselectAll} className="text-[10px] text-muted-foreground hover:underline cursor-pointer font-bold">Deselect All</button>
                  </div>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {issues.map((issue) => {
                    const isSelected = selectedIds.has(issue.id)
                    const priority = PRIORITY_MAP[issue.severity] || PRIORITY_MAP.minor
                    return (
                      <button
                        key={issue.id}
                        onClick={() => toggleIssue(issue.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer text-left",
                          isSelected
                            ? "border-uxray-primary-300/30 bg-uxray-primary-300/5"
                            : "border-border/30 bg-transparent hover:bg-muted/20 opacity-60"
                        )}
                      >
                        <div className={cn(
                          "size-4.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                          isSelected ? "bg-uxray-primary-300 border-uxray-primary-300" : "border-border/60"
                        )}>
                          {isSelected && <Check className="size-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{issue.title}</p>
                        </div>
                        <Badge className={cn("text-[9px] border-0 shrink-0 uppercase tracking-wider font-bold py-0.5", priority.color)}>
                          {priority.label}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Preview */}
              {selectedIds.size > 0 && (
                <div className="bg-muted/20 rounded-lg border border-border/30 p-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Export Details</p>
                  <div className="text-[10px] text-muted-foreground space-y-0.5 font-mono">
                    <p>Platform: {selectedPlatform?.name}</p>
                    <p>Project: {projectName}</p>
                    <p>Issues: {selectedIds.size} tickets</p>
                    <p>Labels: uxray-audit, design-review</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Export progress */}
          {isExporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-center gap-3 p-3 bg-uxray-primary-300/10 rounded-lg border border-uxray-primary-300/20"
            >
              <Loader2 className="size-4 animate-spin text-uxray-primary-300" />
              <p className="text-xs font-medium text-muted-foreground">
                {platform === 'slides' ? 'Compiling presentation slides...' : `Creating tickets in ${selectedPlatform?.name}...`}
              </p>
            </motion.div>
          )}

          {exported && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
            >
              <CheckCircle2 className="size-4 text-emerald-500" />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {platform === 'slides' ? 'Presentation Deck Downloaded!' : 'Successfully exported!'}
              </p>
            </motion.div>
          )}
        </div>

        <DialogFooter className="sm:justify-between flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting || (platform !== 'slides' && selectedIds.size === 0) || exported}
            className="bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300 text-white border-0 hover:opacity-90 font-semibold gap-1.5"
          >
            {platform === 'slides' ? (
              <>
                <Download className="size-3.5" />
                {isExporting ? 'Downloading...' : 'Download Slide Deck'}
              </>
            ) : (
              isExporting ? 'Exporting...' : `Export ${selectedIds.size} Issue${selectedIds.size !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
