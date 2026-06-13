'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Code, 
  Sparkles, 
  Trash2, 
  Check 
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { useTeamStore } from '@/lib/stores/team-store'
import { useBoardStore, BoardTask } from '@/lib/stores/board-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Constants ──────────────────────────────────────────────────────────

const COLUMNS = [
  { 
    id: 'todo' as const, 
    label: 'To Do', 
    borderClass: 'border-l-red-500/30 border-l-4', 
    headerBg: 'bg-red-500/10 text-red-400 border-red-500/20',
    indicatorColor: 'bg-red-500' 
  },
  { 
    id: 'in_progress' as const, 
    label: 'In Progress', 
    borderClass: 'border-l-amber-500/30 border-l-4', 
    headerBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    indicatorColor: 'bg-amber-500' 
  },
  { 
    id: 'in_review' as const, 
    label: 'In Review', 
    borderClass: 'border-l-blue-500/30 border-l-4', 
    headerBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indicatorColor: 'bg-blue-500' 
  },
  { 
    id: 'done' as const, 
    label: 'Done', 
    borderClass: 'border-l-emerald-500/30 border-l-4', 
    headerBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indicatorColor: 'bg-emerald-500' 
  },
]

const SEVERITIES = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical Only' },
  { value: 'serious', label: 'Serious Only' },
  { value: 'minor', label: 'Minor Only' },
]

const CATEGORIES = ['all', 'Accessibility', 'Layout', 'Visual', 'Copy', 'Heuristic']

// Helper to style severity badges
function getSeverityBadge(severity: BoardTask['severity']) {
  switch (severity) {
    case 'critical':
      return (
        <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase tracking-wider text-[10px]">
          <AlertTriangle className="size-3 mr-1" />
          Critical
        </Badge>
      )
    case 'serious':
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider text-[10px]">
          <AlertTriangle className="size-3 mr-1" />
          Serious
        </Badge>
      )
    case 'minor':
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold uppercase tracking-wider text-[10px]">
          <Info className="size-3 mr-1" />
          Minor
        </Badge>
      )
    default:
      return null
  }
}

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const project = useMockDataStore((s) => s.projects.find((p) => p.id === projectId))
  const members = useTeamStore((s) => s.members)
  
  const tasks = useBoardStore((s) => s.tasks)
  const moveTask = useBoardStore((s) => s.moveTask)
  const assignTask = useBoardStore((s) => s.assignTask)
  const addTask = useBoardStore((s) => s.addTask)

  const [mounted, setMounted] = React.useState(false)
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = React.useState('')
  const [severityFilter, setSeverityFilter] = React.useState<string>('all')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>('all')

  // Drag and drop states
  const [draggingTaskId, setDraggingTaskId] = React.useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = React.useState<BoardTask['status'] | null>(null)

  // Details side panel state
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)

  // Add task dialog state
  const [isAddingTask, setIsAddingTask] = React.useState(false)

  // New task form state
  const [newTitle, setNewTitle] = React.useState('')
  const [newSeverity, setNewSeverity] = React.useState<BoardTask['severity']>('serious')
  const [newCategory, setNewCategory] = React.useState('Accessibility')
  const [newDescription, setNewDescription] = React.useState('')
  const [newCurrentCode, setNewCurrentCode] = React.useState('')
  const [newBetterCode, setNewBetterCode] = React.useState('')
  const [newAssigneeId, setNewAssigneeId] = React.useState<string>('none')

  // Set breadcrumbs
  useBreadcrumbs([
    { label: 'Projects', href: '/projects' },
    { label: project?.name || 'Loading...', href: `/projects/${projectId}` },
    { label: 'Kanban Board' },
  ])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Filter tasks scoped to this project
  const projectTasks = React.useMemo(() => {
    return tasks.filter((t) => t.projectId === projectId)
  }, [tasks, projectId])

  // Apply search/filters
  const filteredTasks = React.useMemo(() => {
    return projectTasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSeverity = severityFilter === 'all' || task.severity === severityFilter
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
      
      const matchesAssignee = 
        assigneeFilter === 'all' || 
        (assigneeFilter === 'unassigned' && task.assigneeId === null) ||
        task.assigneeId === assigneeFilter

      return matchesSearch && matchesSeverity && matchesCategory && matchesAssignee
    })
  }, [projectTasks, searchQuery, severityFilter, categoryFilter, assigneeFilter])

  // Get selected task details
  const selectedTask = React.useMemo(() => {
    return projectTasks.find((t) => t.id === selectedTaskId)
  }, [projectTasks, selectedTaskId])

  if (!mounted) return null

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button variant="outline" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 size-4" /> Back to Projects
          </Link>
        </Button>
      </div>
    )
  }

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggingTaskId(id)
  }

  const handleDragEnd = () => {
    setDraggingTaskId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: BoardTask['status']) => {
    e.preventDefault()
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleDrop = (e: React.DragEvent, columnId: BoardTask['status']) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      moveTask(taskId, columnId)
      toast.success(`Task moved to ${columnId.replace('_', ' ')}`)
    }
    setDraggingTaskId(null)
    setDragOverColumn(null)
  }

  // Handle Add Task Submission
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const newTask: BoardTask = {
      id: `iss-${crypto.randomUUID().slice(0, 8)}`,
      title: newTitle.trim(),
      severity: newSeverity,
      category: newCategory,
      status: 'todo',
      assigneeId: newAssigneeId === 'none' ? null : newAssigneeId,
      description: newDescription.trim(),
      currentCode: newCurrentCode.trim() || undefined,
      betterCode: newBetterCode.trim() || undefined,
      projectId,
    }

    addTask(newTask)
    toast.success('New task added successfully!')
    setIsAddingTask(false)

    // Reset Form
    setNewTitle('')
    setNewSeverity('serious')
    setNewCategory('Accessibility')
    setNewDescription('')
    setNewCurrentCode('')
    setNewBetterCode('')
    setNewAssigneeId('none')
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ─── Back Button & Header ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link 
            href={`/projects/${projectId}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors duration-200 mb-2 w-fit"
          >
            <ArrowLeft className="size-4" />
            Back to Project Workspace
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge className="bg-primary/10 text-primary border border-primary/20">Kanban Board</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track and collaborate on issue fixes, code revisions, and design improvements.
          </p>
        </div>

        <Button 
          onClick={() => setIsAddingTask(true)}
          className="gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-300 h-10 self-start md:self-auto"
        >
          <Plus className="size-4" />
          Add Task
        </Button>
      </div>

      {/* ─── Search & Filters Bar ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center p-4 rounded-xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-sm glass-panel">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/40 focus-visible:ring-primary/20 h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-9 border border-border/40 rounded-lg bg-background/50 px-3 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
          >
            {SEVERITIES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 border border-border/40 rounded-lg bg-background/50 px-3 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.slice(1).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-9 border border-border/40 rounded-lg bg-background/50 px-3 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {(searchQuery || severityFilter !== 'all' || categoryFilter !== 'all' || assigneeFilter !== 'all') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery('')
                setSeverityFilter('all')
                setCategoryFilter('all')
                setAssigneeFilter('all')
              }}
              className="size-9 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              title="Clear all filters"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ─── Kanban Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id)
          const isOver = dragOverColumn === col.id

          return (
            <div 
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={cn(
                "flex flex-col rounded-2xl border border-border/40 bg-card/20 backdrop-blur-xl transition-all duration-300 min-h-[600px] overflow-hidden",
                col.borderClass,
                isOver ? "bg-primary/5 border-primary/30 ring-2 ring-primary/10" : ""
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/20 bg-card/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", col.indicatorColor)} />
                  <h3 className="font-semibold text-sm tracking-tight">{col.label}</h3>
                </div>
                <Badge className={cn("font-semibold font-mono", col.headerBg)}>
                  {colTasks.length}
                </Badge>
              </div>

              {/* Column Tasks Container */}
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto max-h-[700px] custom-scrollbar">
                <AnimatePresence initial={false}>
                  {colTasks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-border/40 text-center text-xs text-muted-foreground bg-card/5 select-none"
                    >
                      Drag tasks here
                    </motion.div>
                  ) : (
                    colTasks.map((task) => {
                      const assignee = members.find((m) => m.id === task.assigneeId)

                      return (
                        <motion.div
                          key={task.id}
                          layoutId={`card-${task.id}`}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={cn(
                            "glass-panel p-4 rounded-xl border border-border/30 hover:border-primary/20 hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 group/card relative flex flex-col gap-3 select-none bg-card/40",
                            draggingTaskId === task.id ? "opacity-30 border-dashed" : ""
                          )}
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        >
                          {/* Card tags */}
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded border border-border/20">
                              {task.category}
                            </span>
                            {getSeverityBadge(task.severity)}
                          </div>

                          {/* Task title */}
                          <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover/card:text-primary transition-colors duration-200">
                            {task.title}
                          </h4>

                          {/* Description preview */}
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Card Footer: Assignee & Action icons */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/10 mt-1">
                            {/* Assignee pill */}
                            <div className="flex items-center gap-1.5">
                              {assignee ? (
                                <div className="flex items-center gap-1.5">
                                  <div 
                                    className="size-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm shrink-0"
                                    style={{ backgroundColor: assignee.avatarColor }}
                                    title={assignee.name}
                                  >
                                    {assignee.initials}
                                  </div>
                                  <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline truncate max-w-[80px]">
                                    {assignee.name.split(' ')[0]}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200">
                                  <UserPlus className="size-3.5" />
                                  <span>Assign</span>
                                </div>
                              )}
                            </div>

                            {/* Codes revisions indicators */}
                            {(task.currentCode || task.betterCode) && (
                              <div className="flex items-center text-primary/80" title="Contains code review suggestion">
                                <Code className="size-3.5 mr-0.5" />
                                <span className="text-[9px] font-bold">Rev</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Detail Drawer (inline via AnimatePresence) ────────────────── */}
      <AnimatePresence>
        {selectedTaskId && selectedTask && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTaskId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed top-0 right-0 h-full w-[500px] max-w-full bg-background/95 backdrop-blur-xl border-l border-border/40 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/20 bg-card/20 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2 py-0.5 rounded border border-border/20">
                    {selectedTask.id.toUpperCase()}
                  </span>
                  <Badge variant="outline" className="font-semibold text-xs">
                    {selectedTask.category}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedTaskId(null)}
                  className="size-8 rounded-full hover:bg-muted/40"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground leading-snug">
                    {selectedTask.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-3">
                    {getSeverityBadge(selectedTask.severity)}
                  </div>
                </div>

                <hr className="border-border/20" />

                {/* Edit Controls */}
                <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-xl border border-border/20">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => {
                        moveTask(selectedTask.id, e.target.value as BoardTask['status'])
                        toast.success(`Moved to ${e.target.value.replace('_', ' ')}`)
                      }}
                      className="h-9 border border-border/30 rounded-lg bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assignee</label>
                    <select
                      value={selectedTask.assigneeId || 'unassigned'}
                      onChange={(e) => {
                        const val = e.target.value === 'unassigned' ? null : e.target.value
                        assignTask(selectedTask.id, val)
                        toast.success(val ? 'Task assigned successfully' : 'Task unassigned')
                      }}
                      className="h-9 border border-border/30 rounded-lg bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
                    >
                      <option value="unassigned">Unassigned</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h3>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/5 p-4 rounded-xl border border-border/10 whitespace-pre-wrap">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Code Comparison/Solution */}
                {(selectedTask.currentCode || selectedTask.betterCode) && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Sparkles className="size-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Recommended Revision</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                      {selectedTask.currentCode && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            Current Pattern
                          </span>
                          <pre className="text-[11px] font-mono p-3 rounded-lg border border-red-500/15 bg-red-500/[0.02] text-red-400 overflow-x-auto whitespace-pre-wrap">
                            <code>{selectedTask.currentCode}</code>
                          </pre>
                        </div>
                      )}

                      {selectedTask.betterCode && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Suggested Code / Strategy
                          </span>
                          <pre className="text-[11px] font-mono p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400 overflow-x-auto whitespace-pre-wrap relative group/code">
                            <code>{selectedTask.betterCode}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedTask.betterCode || '')
                                toast.success('Code copied to clipboard!')
                              }}
                              className="absolute right-2 top-2 size-7 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 opacity-0 group-hover/code:opacity-100 transition-opacity duration-200"
                              title="Copy code"
                            >
                              <Check className="size-3.5" />
                            </Button>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Add Task Modal Overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {isAddingTask && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingTask(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed inset-x-4 top-[10%] mx-auto max-w-lg md:max-w-xl bg-background border border-border/40 rounded-2xl shadow-2xl p-6 z-50 overflow-y-auto max-h-[80vh] flex flex-col gap-5 cursor-default"
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Create Board Task</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Define a new issue checklist item to resolve.</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsAddingTask(false)}
                  className="size-8 rounded-full hover:bg-muted/40"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <form onSubmit={handleAddTaskSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task-title" className="text-xs font-semibold text-muted-foreground/90">Task Title *</label>
                  <Input 
                    id="task-title" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Navigation dropdown hover delay"
                    required
                    className="bg-card/50 border-border/40 focus-visible:ring-primary/20 h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-severity" className="text-xs font-semibold text-muted-foreground/90">Severity</label>
                    <select
                      id="task-severity"
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value as BoardTask['severity'])}
                      className="w-full h-10 border border-border/40 rounded-xl bg-card/50 px-3 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
                    >
                      <option value="critical">🔴 Critical</option>
                      <option value="serious">🟡 Serious</option>
                      <option value="minor">🔵 Minor</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-category" className="text-xs font-semibold text-muted-foreground/90">Category</label>
                    <select
                      id="task-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-10 border border-border/40 rounded-xl bg-card/50 px-3 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
                    >
                      {CATEGORIES.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task-assignee" className="text-xs font-semibold text-muted-foreground/90">Assign Task To</label>
                  <select
                    id="task-assignee"
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full h-10 border border-border/40 rounded-xl bg-card/50 px-3 text-xs text-foreground outline-none focus:border-primary transition-all cursor-pointer font-medium"
                  >
                    <option value="none">Leave Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="task-description" className="text-xs font-semibold text-muted-foreground/90">Description</label>
                  <Textarea 
                    id="task-description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide context and details about this issue..."
                    rows={3}
                    className="bg-card/50 border-border/40 focus-visible:ring-primary/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-current-code" className="text-xs font-semibold text-muted-foreground/90">Current Pattern (Optional)</label>
                    <Textarea 
                      id="task-current-code"
                      value={newCurrentCode}
                      onChange={(e) => setNewCurrentCode(e.target.value)}
                      placeholder="e.g. <div hover='show'>"
                      rows={2}
                      className="font-mono text-xs bg-card/50 border-border/40 focus-visible:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="task-better-code" className="text-xs font-semibold text-muted-foreground/90">Suggested Code (Optional)</label>
                    <Textarea 
                      id="task-better-code"
                      value={newBetterCode}
                      onChange={(e) => setNewBetterCode(e.target.value)}
                      placeholder="e.g. transition timing details"
                      rows={2}
                      className="font-mono text-xs bg-card/50 border-border/40 focus-visible:ring-primary/20 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-2 border-t border-border/20 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingTask(false)}
                    className="h-10"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-10 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    Create Task
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
