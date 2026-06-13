'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play, Globe, ExternalLink, Calendar, ArrowLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { StatusIndicator } from '@/components/uxray/StatusIndicator'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

function getSectorClass(sector?: string) {
  switch (sector?.toLowerCase()) {
    case 'saas': return 'tag-saas'
    case 'e-commerce': return 'tag-ecommerce'
    case 'mobile app': return 'tag-mobile'
    case 'dashboard': return 'tag-dashboard'
    default: return 'tag-other'
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-uxray-success-300/10 text-uxray-success-300 border border-uxray-success-300/20'
  if (score >= 50) return 'bg-uxray-warning-300/10 text-uxray-warning-300 border border-uxray-warning-300/20'
  return 'bg-uxray-danger-300/10 text-uxray-danger-300 border border-uxray-danger-300/20'
}

function getScoreSolidBg(score: number) {
  if (score >= 80) return 'bg-gradient-success'
  if (score >= 50) return 'bg-gradient-warning'
  return 'bg-gradient-danger'
}


// ═══════════════════════════════════════════════════════════════════════
// Single Project View & Settings
// ═══════════════════════════════════════════════════════════════════════

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const getProject = useMockDataStore((s) => s.getProject)
  const getProjectAudits = useMockDataStore((s) => s.getProjectAudits)
  const addAudit = useMockDataStore((s) => s.addAudit)
  const completeAudit = useMockDataStore((s) => s.completeAudit)
  const updateProject = useMockDataStore((s) => s.updateProject)
  const deleteProject = useMockDataStore((s) => s.deleteProject)
  
  const [mounted, setMounted] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'audits' | 'settings'>('audits')
  
  // Settings edit states
  const [editName, setEditName] = React.useState('')
  const [editSector, setEditSector] = React.useState('Other')
  const [editDesc, setEditDesc] = React.useState('')

  const project = getProject(projectId)
  const audits = getProjectAudits(projectId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  React.useEffect(() => {
    setMounted(true)
    if (project) {
      setEditName(project.name)
      setEditSector(project.sector || 'Other')
      setEditDesc(project.description || '')
    }
  }, [project])

  // Update breadcrumbs when project loads
  useBreadcrumbs([
    { label: 'Projects', href: '/projects' },
    { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
  ])

  if (!mounted) return null

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button variant="outline" asChild><Link href="/projects"><ArrowLeft className="mr-2 size-4"/>Back to Projects</Link></Button>
      </div>
    )
  }

  const latestAudit = audits[0]
  const latestOverallScore = latestAudit?.scores
    ? Math.round((latestAudit.scores.usability + latestAudit.scores.accessibility + latestAudit.scores.performance + latestAudit.scores.visual) / 4)
    : 0

  let scoreGlow = 'card-glow-purple'
  if (latestAudit?.scores) {
    if (latestOverallScore >= 80) scoreGlow = 'card-glow-success'
    else if (latestOverallScore >= 50) scoreGlow = 'card-glow-warning'
    else scoreGlow = 'card-glow-danger'
  }
  
  const handleRunAudit = () => {
    const newAudit = addAudit(project.id)
    toast.success('Visual audit crawler scheduled successfully!')
    
    // Simulate it completing after 4 seconds
    setTimeout(() => {
      completeAudit(newAudit.id, {
        usability: Math.floor(Math.random() * 20) + 75,
        accessibility: Math.floor(Math.random() * 20) + 75,
        performance: Math.floor(Math.random() * 20) + 75,
        visual: Math.floor(Math.random() * 20) + 75,
      })
      toast.success(`Visual audit for "${project.name}" completed successfully!`)
    }, 4000)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      toast.error('Please enter a project name.')
      return
    }
    updateProject(projectId, {
      name: editName.trim(),
      sector: editSector,
      description: editDesc.trim(),
    })
    toast.success('Project settings updated successfully!')
  }

  const handleDeleteProject = () => {
    if (confirm('Are you absolutely sure you want to delete this project and all its audits?')) {
      deleteProject(projectId)
      toast.success('Project deleted successfully.')
      router.push('/projects')
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6 rounded-2xl overflow-hidden border border-border/20 shadow-lg liquid-glass-medium">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.sector && (
              <span className={cn("text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1.5 shrink-0", getSectorClass(project.sector))}>
                {project.sector}
              </span>
            )}
          </div>
          <a 
            href={project.url} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 text-primary hover:underline mt-1.5 text-sm font-semibold w-fit"
          >
            <Globe className="size-3.5" />
            {project.url}
            <ExternalLink className="size-3 opacity-80 ml-0.5" />
          </a>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
        <Button 
          onClick={handleRunAudit}
          className="relative z-10 shrink-0 gap-2 font-semibold liquid-glass-opaque bg-primary/90 text-primary-foreground hover:bg-primary shadow-lg shadow-primary/20 transition-all duration-300 h-11 px-5"
        >
          <Play className="size-4 fill-current" />
          Run New Audit
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div role="tablist" aria-label="Project details tabs" className="flex w-fit rounded-xl p-1 bg-card/60 border border-border/40 glass-panel text-sm font-medium select-none mt-2 relative">
        <button
          onClick={() => setActiveTab('audits')}
          role="tab"
          aria-selected={activeTab === 'audits'}
          aria-controls="audits-panel"
          id="tab-audits"
          className={cn(
            "relative px-4 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer z-10",
            activeTab === 'audits'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground/80'
          )}
        >
          {activeTab === 'audits' && (
            <motion.div
              layoutId="project-tab-pill"
              className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          📊 Audits History
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          role="tab"
          aria-selected={activeTab === 'settings'}
          aria-controls="settings-panel"
          id="tab-settings"
          className={cn(
            "relative px-4 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer z-10",
            activeTab === 'settings'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground/80'
          )}
        >
          {activeTab === 'settings' && (
            <motion.div
              layoutId="project-tab-pill"
              className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          ⚙️ Project Settings
        </button>
      </div>

      {activeTab === 'audits' ? (
        <div id="audits-panel" role="tabpanel" aria-labelledby="tab-audits" className="space-y-8 mt-2">
          {/* Latest Audit Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className={cn("md:col-span-1 flex flex-col justify-center items-center py-8 liquid-glass-medium shadow-xl relative overflow-hidden border-border/40", scoreGlow)}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6 relative z-10">Overall Score</h3>
              {latestAudit?.scores ? (
                <div className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]">
                  <ScoreGauge 
                    score={latestOverallScore} 
                    size="lg" 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center relative z-10">
                  <div className="size-16 rounded-full border-4 border-muted/20 border-t-primary animate-spin mb-4 shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                  <span className="text-sm font-medium">No data yet</span>
                </div>
              )}
            </Card>

            <Card className="md:col-span-2 liquid-glass-medium card-glow-cyan shadow-xl border-border/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {latestAudit?.scores ? (
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                    <ScoreMetric label="Usability" score={latestAudit.scores.usability} />
                    <ScoreMetric label="Accessibility" score={latestAudit.scores.accessibility} />
                    <ScoreMetric label="Performance" score={latestAudit.scores.performance} />
                    <ScoreMetric label="Visual Design" score={latestAudit.scores.visual} />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                    Run an audit to see the breakdown
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Audit History Timeline */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-4">Audit History</h2>
            {audits.length === 0 ? (
              <Card className="glass-panel shadow-md p-12 text-center text-muted-foreground text-sm">
                No audits have been run for this project.
              </Card>
            ) : (
              <div className="relative pl-4 space-y-6 border-l border-border/40 before:absolute before:inset-0 before:-left-px before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:to-transparent before:h-full pb-4 ml-2 mt-4">
                {audits.map((audit, index) => {
                  const auditOverallScore = audit.scores
                    ? Math.round((audit.scores.usability + audit.scores.accessibility + audit.scores.performance + audit.scores.visual) / 4)
                    : 0
                  
                  const isLatest = index === 0

                  let historyGlow = 'hover:border-primary/30'
                  if (audit.status === 'completed' && audit.scores) {
                    if (auditOverallScore >= 80) historyGlow = 'hover:border-uxray-success-300/40'
                    else if (auditOverallScore >= 50) historyGlow = 'hover:border-uxray-warning-300/40'
                    else historyGlow = 'hover:border-uxray-danger-300/40'
                  }

                  const cardUrl = audit.status === 'completed'
                    ? `/audits/${audit.id}`
                    : `/audits/${audit.id}/progress`

                  return (
                    <motion.div 
                      key={audit.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      className="relative group"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-4">
                        {isLatest ? (
                          <div className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] ring-4 ring-primary/20" />
                        ) : (
                          <div className={cn(
                            "size-2.5 rounded-full transition-colors duration-300",
                            audit.status === 'completed' 
                              ? (auditOverallScore >= 80 ? 'bg-uxray-success-300/80' : auditOverallScore >= 50 ? 'bg-uxray-warning-300/80' : 'bg-uxray-danger-300/80')
                              : audit.status === 'running' ? 'bg-primary border-primary/60 animate-ping' : 'bg-muted-foreground/30 border border-border group-hover:bg-primary/50'
                          )} />
                        )}
                      </div>
                      
                      <Link
                        href={cardUrl}
                        className="block focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-xl"
                      >
                        <div className={cn(
                          "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl liquid-glass-clear shadow-sm transition-all duration-300 hover:scale-[1.005] hover:border-primary/20 cursor-pointer gap-4 border border-border/40",
                          historyGlow
                        )}>
                          <div className="flex items-center gap-4">
                            <StatusIndicator 
                              status={audit.status} 
                              className={audit.status === 'running' ? 'animate-pulse' : ''}
                            />
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">Audit #{audit.id.slice(-6).toUpperCase()}</span>
                                {isLatest && (
                                  <span className="text-xs uppercase font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar className="size-3 text-muted-foreground" />
                                {new Date(audit.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {audit.status === 'completed' && audit.scores ? (
                            <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0">
                              {/* Detailed metrics grid */}
                              <div className="hidden lg:grid grid-cols-4 gap-4 w-72 text-xs font-medium text-muted-foreground">
                                <div className="flex flex-col gap-0.5">
                                  <span className="uppercase text-xs font-semibold text-muted-foreground">Usability</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono font-bold text-foreground">{audit.scores.usability}</span>
                                    <div className="h-1 flex-1 bg-muted/60 rounded-full overflow-hidden min-w-[30px]">
                                      <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.usability))} style={{ width: `${audit.scores.usability}%` }} />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="uppercase text-xs font-semibold text-muted-foreground">Access.</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono font-bold text-foreground">{audit.scores.accessibility}</span>
                                    <div className="h-1 flex-1 bg-muted/60 rounded-full overflow-hidden min-w-[30px]">
                                      <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.accessibility))} style={{ width: `${audit.scores.accessibility}%` }} />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="uppercase text-xs font-semibold text-muted-foreground">Perf.</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono font-bold text-foreground">{audit.scores.performance}</span>
                                    <div className="h-1 flex-1 bg-muted/60 rounded-full overflow-hidden min-w-[30px]">
                                      <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.performance))} style={{ width: `${audit.scores.performance}%` }} />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="uppercase text-xs font-semibold text-muted-foreground">Visual</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono font-bold text-foreground">{audit.scores.visual}</span>
                                    <div className="h-1 flex-1 bg-muted/60 rounded-full overflow-hidden min-w-[30px]">
                                      <div className={cn("h-full rounded-full", getScoreSolidBg(audit.scores.visual))} style={{ width: `${audit.scores.visual}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={cn("px-3 py-1 rounded-md font-bold font-mono text-sm shadow-sm", getScoreColor(auditOverallScore))}>
                                {auditOverallScore}
                              </div>
                              <div className="size-8 rounded-lg border border-border/40 flex items-center justify-center bg-muted/20 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                                <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          ) : audit.status === 'running' ? (
                            <div className="text-sm font-medium text-primary flex items-center gap-2 mt-2 md:mt-0">
                              <div className="size-3 rounded-full border border-muted/20 border-t-primary animate-spin" />
                              Analyzing...
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-destructive mt-2 md:mt-0">Failed</div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="settings-panel" role="tabpanel" aria-labelledby="tab-settings" className="max-w-xl mt-2 space-y-6">
          <Card className="liquid-glass-medium shadow-xl border-border/40 card-glow-purple">
            <CardHeader>
              <CardTitle>Edit Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-project-name" className="text-xs font-semibold text-muted-foreground/80">Project Name</label>
                  <Input id="edit-project-name" value={editName} onChange={(e) => setEditName(e.target.value)} required className="h-11 liquid-glass-clear border-border/40 focus-visible:ring-primary/20" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-project-sector" className="text-xs font-semibold text-muted-foreground/80">Sector Tag</label>
                  <select
                    id="edit-project-sector"
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    className="w-full h-11 border border-border/40 rounded-xl liquid-glass-clear px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                    required
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Dashboard">Dashboard</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-project-desc" className="text-xs font-semibold text-muted-foreground/80">Project Description</label>
                  <textarea
                    id="edit-project-desc"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Describe the purpose of this project..."
                    className="w-full min-h-[80px] border border-border/40 rounded-xl liquid-glass-clear px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="submit" className="font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/95 h-11 px-6">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-panel shadow-md border-border/40 card-glow-danger overflow-hidden">
            <CardHeader className="bg-destructive/5 border-b border-border/30">
              <CardTitle className="text-destructive font-semibold">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Once you delete a project, there is no going back. All related audit reports, screenshots, and visual score analytics will be permanently destroyed.
              </p>
              <Button 
                onClick={handleDeleteProject}
                variant="destructive" 
                className="mt-6 font-semibold gap-2 shadow hover:bg-destructive/95"
              >
                Delete Project
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ScoreMetric({ label, score }: { label: string; score: number }) {
  let colorClass = 'text-uxray-success-300'
  let barColor = 'bg-gradient-success'
  let glowClass = 'card-glow-success'
  if (score < 50) {
    colorClass = 'text-uxray-danger-300'
    barColor = 'bg-gradient-danger'
    glowClass = 'card-glow-danger'
  } else if (score < 80) {
    colorClass = 'text-uxray-warning-300'
    barColor = 'bg-gradient-warning'
    glowClass = 'card-glow-warning'
  }

  return (
    <div className={cn("flex flex-col gap-2 p-4 rounded-xl liquid-glass-medium shadow-md border border-border/40 relative overflow-hidden", glowClass)}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider relative z-10">{label}</span>
      <span className={`text-3xl font-extrabold font-mono tracking-tight relative z-10 ${colorClass}`}>{score}</span>
      <div className="h-1.5 w-full bg-muted/60 overflow-hidden rounded-full mt-1 relative z-10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, type: "spring", bounce: 0.2 }}
          className={cn("h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]", barColor)} 
        />
      </div>
    </div>
  )
}
