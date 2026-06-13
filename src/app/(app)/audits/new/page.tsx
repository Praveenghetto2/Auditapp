'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, AlertCircle, Plus, Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function NewAuditPage() {
  const router = useRouter()
  useBreadcrumbs([
    { label: 'Audits', href: '/audits' },
    { label: 'New Audit', href: '/audits/new' }
  ])

  const projects = useMockDataStore((s) => s.projects)
  const addAudit = useMockDataStore((s) => s.addAudit)
  const getLatestAudit = useMockDataStore((s) => s.getLatestAudit)

  const [selectedProjectId, setSelectedProjectId] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) {
      toast.error('Please select a project to audit.')
      return
    }

    const project = projects.find(p => p.id === selectedProjectId)
    if (!project) return

    setIsSubmitting(true)
    const toastId = toast.loading(`Initiating visual crawler for "${project.name}"...`)

    try {
      const newAudit = addAudit(project.id)

      toast.success('Crawler successfully launched!', { id: toastId })
      router.push(`/audits/${newAudit.id}/progress`)
    } catch {
      toast.error('Failed to start audit. Please try again.', { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl pb-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/audits">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Run Audit</h1>
          <p className="text-muted-foreground mt-1">Initiate a visual crawl and heuristics analysis.</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="glass-panel border-dashed border-border/40 flex flex-col items-center justify-center p-12 text-center card-glow-danger">
          <AlertCircle className="size-10 text-muted-foreground mb-4 animate-pulse" />
          <h3 className="text-lg font-bold mb-1">No Projects Available</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You must create a project with a valid target URL before launching a crawler audit.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/95">
            <Link href="/projects/new">
              <Plus className="mr-2 size-4" />
              Create Project
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="glass-panel border-border/40 shadow-md card-glow-purple">
          <CardHeader>
            <CardTitle>Select Target Project</CardTitle>
            <CardDescription>Choose one of your monitored projects to deploy the visual crawler.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRun} className="space-y-6">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-muted-foreground/80">
                  Target Project
                </label>
                
                {/* Visual Projects Selection Grid */}
                <div 
                  role="radiogroup" 
                  aria-label="Select target project"
                  className="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1"
                >
                  {projects.map((p) => {
                    const isSelected = selectedProjectId === p.id
                    const latestAudit = getLatestAudit(p.id)
                    const score = latestAudit?.scores
                      ? Math.round((latestAudit.scores.usability + latestAudit.scores.accessibility + latestAudit.scores.performance + latestAudit.scores.visual) / 4)
                      : null

                    return (
                      <motion.button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedProjectId(p.id)}
                        disabled={isSubmitting}
                        className={cn(
                          "flex flex-col text-left p-4 rounded-xl border transition-all duration-300 relative cursor-pointer glass-panel select-none",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/40 bg-card/25 hover:border-primary/25 hover:bg-card/45"
                        )}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground animate-in zoom-in duration-200">
                            <Check className="size-3" />
                          </span>
                        )}
                        <span className="font-bold text-sm text-foreground truncate pr-6">{p.name}</span>
                        <span className="text-xs text-muted-foreground/80 truncate font-mono mt-1.5 flex items-center gap-1">
                          <Globe className="size-3 shrink-0 text-muted-foreground" />
                          {p.url.replace(/^https?:\/\//, '')}
                        </span>
                        <div className="flex items-center justify-between mt-4 w-full">
                          {p.sector && (
                            <span className="text-xs font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted border border-border/20 text-muted-foreground">
                              {p.sector}
                            </span>
                          )}
                          {score !== null ? (
                            <span className={cn(
                              "text-xs font-extrabold font-mono px-2 py-0.5 rounded-md",
                              score >= 80 
                                ? "bg-uxray-success-300/10 text-uxray-success-300 border border-uxray-success-300/20" 
                                : score >= 50 
                                ? "bg-uxray-warning-300/10 text-uxray-warning-300 border border-uxray-warning-300/20" 
                                : "bg-uxray-danger-300/10 text-uxray-danger-300 border border-uxray-danger-300/20"
                            )}>
                              {score}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-muted-foreground italic">No audit run</span>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" asChild disabled={isSubmitting} className="font-semibold shadow-sm">
                  <Link href="/audits">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedProjectId} 
                  className="font-semibold shadow-sm transition-all bg-primary text-primary-foreground hover:bg-primary/95 gap-2"
                >
                  <Play className="size-4 fill-current animate-pulse" />
                  Launch Scanner
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
