'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Plus, 
  ArrowRight, 
  FolderKanban, 
  ScanSearch, 
  AlertTriangle,
  Clock,
  MoreHorizontal,
  Sparkles,
  Play,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { StatusIndicator } from '@/components/uxray/StatusIndicator'
import { useMockDataStore, type Audit } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { cn } from '@/lib/utils'

function getSectorClass(sector?: string) {
  switch (sector?.toLowerCase()) {
    case 'saas': return 'tag-saas'
    case 'e-commerce': return 'tag-ecommerce'
    case 'mobile app': return 'tag-mobile'
    case 'dashboard': return 'tag-dashboard'
    default: return 'tag-other'
  }
}

// Spring config for smooth micro-animations
const fluidSpring = { type: 'spring' as const, stiffness: 300, damping: 20 }

export default function DashboardPage() {
  useBreadcrumbs([{ label: 'Dashboard', href: '/dashboard' }])

  const projects = useMockDataStore((s) => s.projects)
  const audits = useMockDataStore((s) => s.audits)
  const getLatestAudit = useMockDataStore((s) => s.getLatestAudit)

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // Calculate stats
  const totalProjects = projects.length
  const completedAudits = audits.filter(a => a.status === 'completed').length
  const issuesFound = completedAudits * 12 // Simulated aggregated count
  
  // Calculate average overall score across all completed audits
  let totalScore = 0
  let scoreCount = 0
  audits.forEach(a => {
    if (a.status === 'completed' && a.scores) {
      const avg = Math.round((a.scores.usability + a.scores.accessibility + a.scores.performance + a.scores.visual) / 4)
      totalScore += avg
      scoreCount++
    }
  })
  const avgUXScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening across your projects.</p>
        </div>
        <Button className="shrink-0 gap-2 font-semibold bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm transition-all" asChild>
          <Link href="/projects/new">
            <Plus className="size-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* ── Interactive Welcome/Greeting Banner ─────────────────── */}
      <Card className="glass-panel overflow-hidden border border-white/[0.06] bg-gradient-to-r from-uxray-primary-300/10 via-uxray-secondary-300/5 to-transparent relative shadow-xl">
        {/* Visual neon circles overlay */}
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-uxray-primary-300 uppercase tracking-widest">
              <Sparkles className="size-3.5 animate-pulse" />
              AI Visual Audit System Active
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to <span className="text-gradient-cyan-purple">UXRay</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Continuously analyze, score, and optimize your design system tokens, WCAG compliance, spacing heatmaps, and copy tone guidelines.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="font-semibold shadow-sm" asChild>
              <Link href="/reports">View Reports</Link>
            </Button>
            <Button className="font-semibold shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground gap-1.5 transition-all" asChild>
              <Link href="/audits/new">
                <Play className="size-3.5 fill-current" />
                Launch Audit Wizard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats Row (With top border glow highlights and meters) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }} className="h-full">
          <Card className="glass-panel card-glow-purple shadow-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average UX Score</CardTitle>
              <ScanSearch className="size-4 text-uxray-primary-300" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end mt-auto pt-3">
              <div className="text-3xl font-extrabold text-foreground">{avgUXScore > 0 ? avgUXScore : '—'}</div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-3 mb-1.5">
                <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${avgUXScore > 0 ? avgUXScore : 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Across all completed audits</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
          <Card className="glass-panel card-glow-cyan shadow-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <FolderKanban className="size-4 text-uxray-secondary-300" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end mt-auto pt-3">
              <div className="text-3xl font-extrabold text-foreground">{totalProjects}</div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-3 mb-1.5">
                <div className="h-full bg-gradient-secondary rounded-full" style={{ width: `${Math.min(totalProjects * 20, 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Continuous monitoring enabled</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
          <Card className="glass-panel card-glow-warning shadow-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Audits</CardTitle>
              <Clock className="size-4 text-uxray-warning-300" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end mt-auto pt-3">
              <div className="text-3xl font-extrabold text-foreground">{audits.length}</div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-3 mb-1.5">
                <div className="h-full bg-gradient-warning rounded-full" style={{ width: `${Math.min((completedAudits / Math.max(audits.length, 1)) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{completedAudits} completed runs</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full">
          <Card className="glass-panel card-glow-danger shadow-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Issues Found</CardTitle>
              <AlertTriangle className="size-4 text-uxray-danger-300" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end mt-auto pt-3">
              <div className="text-3xl font-extrabold text-foreground">{issuesFound}</div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-3 mb-1.5">
                <div className="h-full bg-gradient-danger rounded-full" style={{ width: `${Math.min(issuesFound * 3, 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Platform-wide violations</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Recent Projects */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground text-xs" asChild>
              <Link href="/projects">
                View All
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed glass-panel">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <FolderKanban className="size-6 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">No projects yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">Create your first project to start auditing.</p>
              <Button asChild>
                <Link href="/projects/new">Create Project</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.slice(0, 4).map((project, i) => {
                const latestAudit = getLatestAudit(project.id)
                let overallScore = 0
                if (latestAudit?.scores) {
                  overallScore = Math.round((latestAudit.scores.usability + latestAudit.scores.accessibility + latestAudit.scores.performance + latestAudit.scores.visual) / 4)
                }

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.008 }}
                    transition={fluidSpring}
                    className="h-full"
                  >
                    <Card className="glass-panel group cursor-pointer relative overflow-hidden h-full flex flex-col border border-border/40 hover:border-primary/20 transition-all duration-300">
                      <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10" aria-label={`View project details for ${project.name}`} />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="truncate pr-2 group-hover:text-primary transition-colors duration-200">
                                {project.name}
                              </CardTitle>
                              {project.sector && (
                                <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0", getSectorClass(project.sector))}>
                                  {project.sector}
                                </span>
                              )}
                            </div>
                            <CardDescription className="truncate mt-1 text-xs font-mono opacity-80 flex items-center gap-1">
                              <ExternalLink className="size-3 shrink-0" />
                              {project.url.replace(/^https?:\/\//, '')}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 z-20 shrink-0" aria-label={`View options for project ${project.name}`}>
                            <MoreHorizontal className="size-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between pt-1">
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-auto pt-2 border-t border-border/20">
                          {latestAudit ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ScoreGauge score={overallScore} size="sm" />
                                <div className="flex flex-col">
                                  <span className="text-xs uppercase font-bold text-muted-foreground">Latest Audit</span>
                                  <span className="text-xs text-foreground/90 flex items-center gap-1.5 mt-0.5 font-semibold">
                                    {overallScore} / 100
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground/80 font-semibold bg-muted/40 border border-border/30 rounded px-1.5 py-0.5">
                                {new Date(latestAudit.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                <FolderKanban className="size-4" />
                              </div>
                              <span className="text-xs font-semibold">No audits run yet</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
          <Card className="h-full glass-panel border border-border/40 overflow-hidden flex flex-col justify-between">
            <CardContent className="p-0 flex-1">
              {audits.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                  <ScanSearch className="size-8 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No audits have been run yet.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/30">
                  {audits.slice(0, 5).map((audit) => {
                    const project = projects.find(p => p.id === audit.projectId)
                    return (
                      <div key={audit.id} className="flex items-start gap-3 p-4 hover:bg-muted/10 transition-colors">
                        <div className="mt-0.5">
                          <div className="flex size-7 items-center justify-center rounded-full bg-muted/40 border border-border/20">
                            {audit.status === 'completed' ? (
                              <CheckCircle2 className="size-3.5 text-uxray-success-300" />
                            ) : audit.status === 'running' ? (
                              <Clock className="size-3.5 text-uxray-primary-300 animate-pulse" />
                            ) : (
                              <AlertTriangle className="size-3.5 text-uxray-danger-300" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-foreground">
                              Audit {audit.status === 'completed' ? 'Success' : audit.status === 'running' ? 'Scanning' : 'Failed'}
                            </p>
                            <span className="text-xs text-muted-foreground font-semibold font-mono">
                              #{audit.id.slice(-4).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            Project: {project?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(audit.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
            {audits.length > 5 && (
              <CardFooter className="p-3 justify-center border-t border-border/30 bg-[#0e0e15]/20">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8" asChild>
                  <Link href="/reports" className="flex items-center gap-1">
                    View all activity
                    <ChevronRight className="size-3" />
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}
