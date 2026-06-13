'use client'

import * as React from 'react'
import Link from 'next/link'
import { Calendar, FileText, Plus, ChevronRight, GitCompareArrows } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { StatusIndicator } from '@/components/uxray/StatusIndicator'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 25,
    },
  },
} as const

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-uxray-success-300/10 text-uxray-success-300 border border-uxray-success-300/20'
  if (score >= 50) return 'bg-uxray-warning-300/10 text-uxray-warning-300 border border-uxray-warning-300/20'
  return 'bg-uxray-danger-300/10 text-uxray-danger-300 border border-uxray-danger-300/20'
}

function getScoreSolidBg(score: number) {
  if (score >= 80) return 'bg-uxray-success-300'
  if (score >= 50) return 'bg-uxray-warning-300'
  return 'bg-uxray-danger-300'
}

export default function AuditsPage() {
  useBreadcrumbs([{ label: 'Audits', href: '/audits' }])

  const projects = useMockDataStore((s) => s.projects)
  const audits = useMockDataStore((s) => s.audits)

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // Sort audits by newest first
  const sortedAudits = [...audits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audits</h1>
          <p className="text-muted-foreground mt-1">Review visual crawler analyses and compliance checks.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="shrink-0 gap-2 font-semibold shadow-sm border-border/40 hover:bg-muted/30 transition-all" asChild>
            <Link href="/audits/compare">
              <GitCompareArrows className="size-4" />
              Compare Audits
            </Link>
          </Button>
          <Button className="shrink-0 gap-2 font-semibold shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground transition-all" asChild>
            <Link href="/audits/new">
              <Plus className="size-4 animate-pulse" />
              Run New Audit
            </Link>
          </Button>
        </div>
      </div>

      {/* Audit List */}
      {sortedAudits.length === 0 ? (
        <Card className="glass-panel border-dashed border-border/40 p-16 text-center flex flex-col items-center justify-center">
          <FileText className="size-12 text-muted-foreground/25 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold mb-1">No audits found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Deploy the visual crawler scanner to analyze design tokens, contrast ratios, and alignment grids.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-md">
            <Link href="/audits/new">Run First Audit</Link>
          </Button>
        </Card>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {sortedAudits.map((audit) => {
            const project = projects.find((p) => p.id === audit.projectId)
            const overallScore = audit.scores
              ? Math.round(
                  (audit.scores.usability +
                    audit.scores.accessibility +
                    audit.scores.performance +
                    audit.scores.visual) /
                    4
                )
              : 0

            let glowClass = 'card-glow-purple'
            if (audit.status === 'completed') {
              if (overallScore >= 80) glowClass = 'card-glow-success'
              else if (overallScore >= 50) glowClass = 'card-glow-warning'
              else glowClass = 'card-glow-danger'
            } else if (audit.status === 'running') {
              glowClass = 'card-glow-cyan glowing-border-pulse'
            }

            const cardUrl = audit.status === 'completed'
              ? `/audits/${audit.id}`
              : `/audits/${audit.id}/progress`

            return (
              <Link
                key={audit.id}
                href={cardUrl}
                className="block focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-xl"
              >
                <motion.div
                  variants={itemVariants}
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-card/25 border border-border/30 rounded-xl glass-panel shadow-sm glass-card-hover transition-all duration-300 gap-6 cursor-pointer group",
                    glowClass
                  )}
                >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="mt-1 shrink-0">
                    <StatusIndicator 
                      status={audit.status} 
                      className={audit.status === 'running' ? 'animate-pulse' : ''}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-semibold text-sm">Audit {audit.id.slice(-6)}</span>
                    {project ? (
                      <span className="text-xs text-primary font-bold truncate max-w-xs block mt-0.5">
                        {project.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-semibold mt-0.5">Unknown Project</span>
                    )}
                    <span className="text-xs text-muted-foreground/75 flex items-center gap-1.5 mt-1.5 font-mono">
                      <Calendar className="size-3 text-muted-foreground" />
                      {new Date(audit.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {audit.status === 'completed' && audit.scores ? (
                  <div className="flex flex-wrap items-center gap-6 mt-4 lg:mt-0 justify-between sm:justify-start">
                    {/* Score break-down bar chart */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-72 text-xs font-medium text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="uppercase text-xs font-semibold text-muted-foreground">Usability</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-foreground">{audit.scores.usability}</span>
                          <div className="h-1 flex-1 bg-muted/65 rounded-full overflow-hidden min-w-[30px]">
                            <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.usability))} style={{ width: `${audit.scores.usability}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="uppercase text-xs font-semibold text-muted-foreground">Access.</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-foreground">{audit.scores.accessibility}</span>
                          <div className="h-1 flex-1 bg-muted/65 rounded-full overflow-hidden min-w-[30px]">
                            <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.accessibility))} style={{ width: `${audit.scores.accessibility}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="uppercase text-xs font-semibold text-muted-foreground">Perf.</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-foreground">{audit.scores.performance}</span>
                          <div className="h-1 flex-1 bg-muted/65 rounded-full overflow-hidden min-w-[30px]">
                            <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.performance))} style={{ width: `${audit.scores.performance}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="uppercase text-xs font-semibold text-muted-foreground">Visual</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-foreground">{audit.scores.visual}</span>
                          <div className="h-1 flex-1 bg-muted/65 rounded-full overflow-hidden min-w-[30px]">
                            <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.visual))} style={{ width: `${audit.scores.visual}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <ScoreGauge score={overallScore} size="sm" />
                      <div className="size-8 rounded-lg border border-border/40 flex items-center justify-center bg-muted/20 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                        <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                ) : audit.status === 'running' ? (
                  <div className="text-xs font-semibold text-primary flex items-center gap-2 mt-2 lg:mt-0 border border-primary/25 bg-primary/5 px-3 py-1.5 rounded-lg">
                    <div className="size-3.5 rounded-full border border-primary/25 border-t-primary animate-spin" />
                    Scanning Visual System...
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-destructive mt-2 lg:mt-0 border border-destructive/25 bg-destructive/5 px-3 py-1.5 rounded-lg">Failed</span>
                )}
              </motion.div>
            </Link>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
