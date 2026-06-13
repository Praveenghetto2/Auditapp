'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Globe, Trash2, Search, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScoreGauge } from '@/components/uxray/ScoreGauge'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
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
  hidden: { opacity: 0, y: 15 },
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

function MiniMetric({ label, score }: { label: string; score: number }) {
  let colorClass = 'bg-gradient-success'
  if (score < 50) colorClass = 'bg-gradient-danger'
  else if (score < 80) colorClass = 'bg-gradient-warning'

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between items-center text-xs text-muted-foreground/80 font-medium">
        <span>{label}</span>
        <span className="font-semibold text-foreground font-mono">{score}</span>
      </div>
      <div className="h-1 w-full bg-muted/65 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, type: "spring", bounce: 0.2 }}
          className={cn("h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]", colorClass)} 
        />
      </div>
    </div>
  )
}

const SECTORS = [
  { id: 'all', label: 'All Projects' },
  { id: 'saas', label: 'SaaS' },
  { id: 'e-commerce', label: 'E-commerce' },
  { id: 'mobile app', label: 'Mobile App' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'other', label: 'Other' }
]

export default function ProjectsPage() {
  useBreadcrumbs([{ label: 'Projects', href: '/projects' }])

  const projects = useMockDataStore((s) => s.projects)
  const getLatestAudit = useMockDataStore((s) => s.getLatestAudit)
  const deleteProject = useMockDataStore((s) => s.deleteProject)
  
  const [mounted, setMounted] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedSector, setSelectedSector] = React.useState('all')

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.url.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSector = selectedSector === 'all' || p.sector?.toLowerCase() === selectedSector.toLowerCase()
    return matchesSearch && matchesSector
  })

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your monitored websites and applications.</p>
        </div>
        <Button className="shrink-0 gap-2 font-semibold shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground transition-all" asChild>
          <Link href="/projects/new">
            <Plus className="size-4 animate-pulse" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Controls panel */}
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-border/40 bg-card/10 liquid-glass-clear md:flex-row md:items-center md:justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 no-print">
          {SECTORS.map((sec) => {
            const isActive = selectedSector === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSector(sec.id)}
                className={cn(
                  "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-300 cursor-pointer z-10 whitespace-nowrap",
                  isActive ? "text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="project-sector-pill"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {sec.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              aria-label="Search projects by name or URL"
              className="pl-9 h-11 bg-background/30 border-border/30 focus-visible:ring-primary/20 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs font-semibold text-muted-foreground bg-muted/20 px-3 py-2.5 rounded-lg border border-border/20">
            Showing {filteredProjects.length} of {projects.length} Projects
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed border-border/40 bg-card/10 glass-panel"
        >
          <Globe className="size-12 text-muted-foreground/20 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold mb-1">No projects found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            {searchQuery ? "No matching projects. Try adjusting your query." : "Create your first project to start running automated heuristics audits."}
          </p>
          {!searchQuery && (
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 size-4" />
                Create New Project
              </Link>
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredProjects.map((project, i) => {
            const latestAudit = getLatestAudit(project.id)
            let overallScore = 0
            if (latestAudit?.scores) {
              overallScore = Math.round((latestAudit.scores.usability + latestAudit.scores.accessibility + latestAudit.scores.performance + latestAudit.scores.visual) / 4)
            }

            let glowClass = 'card-glow-purple'
            if (latestAudit) {
              if (overallScore >= 80) glowClass = 'card-glow-success'
              else if (overallScore >= 50) glowClass = 'card-glow-warning'
              else glowClass = 'card-glow-danger'
            }

            return (
              <motion.div key={project.id} layout variants={itemVariants} className="h-full">
                <div className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl liquid-glass-medium glass-card-hover p-5 shadow-md h-full transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]",
                  glowClass
                )}>
                  <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10" aria-label={`View project details for ${project.name}`} />
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg truncate tracking-tight group-hover:text-primary transition-colors">{project.name}</h3>
                        {project.sector && (
                          <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0", getSectorClass(project.sector))}>
                            {project.sector}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/80 truncate flex items-center gap-1 mt-0.5 font-mono">
                        <Globe className="size-3 text-muted-foreground" />
                        {project.url.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0 z-20 text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-colors"
                      aria-label={`Delete project ${project.name}`}
                      onClick={(e) => {
                        e.preventDefault()
                        if (confirm(`Are you absolutely sure you want to delete "${project.name}" and all its audits?`)) {
                          deleteProject(project.id)
                        }
                      }}
                      title="Delete Project"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Card Body / Score Overview */}
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/30">
                    {latestAudit && latestAudit.scores ? (
                      <>
                        <ScoreGauge score={overallScore} size="sm" />
                        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          <MiniMetric label="Usability" score={latestAudit.scores.usability} />
                          <MiniMetric label="Access." score={latestAudit.scores.accessibility} />
                          <MiniMetric label="Perf." score={latestAudit.scores.performance} />
                          <MiniMetric label="Visual" score={latestAudit.scores.visual} />
                        </div>
                      </>
                    ) : latestAudit && latestAudit.status === 'running' ? (
                      <div className="flex items-center gap-3 py-1 text-primary">
                        <div className="size-8 rounded-full border border-muted/20 border-t-primary animate-spin flex items-center justify-center">
                          <div className="size-1 rounded-full bg-primary" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider animate-pulse">Running Scan...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Play className="size-3.5 fill-current ml-0.5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Ready to audit</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
