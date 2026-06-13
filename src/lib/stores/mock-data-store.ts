import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════
// Mock Data Store — Simulates a backend database for Phase 4
// Uses Zustand + localStorage persist to maintain state across reloads.
// ═══════════════════════════════════════════════════════════════════════

export type ProjectStatus = 'active' | 'archived'
export type AuditStatus = 'running' | 'completed' | 'failed'
export type PipelineStepStatus = 'pending' | 'active' | 'completed' | 'failed'

export interface AuditPipelineStep {
  id: string
  label: string
  description: string
  icon: string
  status: PipelineStepStatus
}

export const PIPELINE_STEPS_TEMPLATE: Omit<AuditPipelineStep, 'status'>[] = [
  { id: 'screen-capture', label: 'Screen Capture', description: 'Capturing viewport screenshots...', icon: '🔍' },
  { id: 'dom-parsing', label: 'DOM Parsing', description: 'Extracting component structure...', icon: '🧩' },
  { id: 'visual-analysis', label: 'Visual Analysis', description: 'Running heuristic evaluation...', icon: '🎨' },
  { id: 'accessibility-scan', label: 'Accessibility Scan', description: 'Checking WCAG AA compliance...', icon: '♿' },
  { id: 'layout-analysis', label: 'Layout Analysis', description: 'Evaluating spacing & alignment...', icon: '📐' },
  { id: 'copy-analysis', label: 'Copy Analysis', description: 'Reviewing text clarity & tone...', icon: '✍️' },
  { id: 'ai-consolidation', label: 'AI Consolidation', description: 'Generating comprehensive report...', icon: '🧠' },
]

export interface Project {
  id: string
  name: string
  url: string
  status: ProjectStatus
  createdAt: string
  lastAuditId?: string
  description?: string
  sector?: string
}

export interface AuditScores {
  usability: number
  accessibility: number
  performance: number
  visual: number
}

export interface Audit {
  id: string
  projectId: string
  status: AuditStatus
  scores?: AuditScores
  createdAt: string
  completedAt?: string
}

interface MockDataState {
  projects: Project[]
  audits: Audit[]
  auditPipelines: Record<string, AuditPipelineStep[]>
  // Actions
  addProject: (name: string, url: string, description?: string, sector?: string) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addAudit: (projectId: string) => Audit
  completeAudit: (auditId: string, scores: AuditScores) => void
  initAuditPipeline: (auditId: string) => void
  updatePipelineStep: (auditId: string, stepId: string, status: PipelineStepStatus) => void
  // Selectors
  getProject: (id: string) => Project | undefined
  getProjectAudits: (projectId: string) => Audit[]
  getLatestAudit: (projectId: string) => Audit | undefined
}

// Initial seed data for a great first-run experience
const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Acme Corp Website',
    url: 'https://acmecorp.example.com',
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastAuditId: 'audit-1',
    description: 'Corporate client website marketing and sales portal visual audit.',
    sector: 'SaaS',
  },
  {
    id: 'proj-2',
    name: 'Stark Industries Portal',
    url: 'https://portal.stark.com',
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastAuditId: 'audit-2',
    description: 'User access, dashboard visual checking, and accessibility auditing.',
    sector: 'Dashboard',
  },
]

const SEED_AUDITS: Audit[] = [
  {
    id: 'audit-1',
    projectId: 'proj-1',
    status: 'completed',
    scores: { usability: 85, accessibility: 92, performance: 78, visual: 88 },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45000).toISOString(),
  },
  {
    id: 'audit-2',
    projectId: 'proj-2',
    status: 'completed',
    scores: { usability: 94, accessibility: 88, performance: 95, visual: 96 },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 32000).toISOString(),
  },
]

export const useMockDataStore = create<MockDataState>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS,
      audits: SEED_AUDITS,
      auditPipelines: {},

      addProject: (name, url, description, sector) => {
        const newProject: Project = {
          id: `proj-${crypto.randomUUID()}`,
          name,
          url,
          status: 'active',
          createdAt: new Date().toISOString(),
          description,
          sector: sector || 'Other',
        }
        set((state) => ({ projects: [newProject, ...state.projects] }))
        return newProject
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          // Cascade delete audits
          audits: state.audits.filter((a) => a.projectId !== id),
        }))
      },

      addAudit: (projectId) => {
        const newAudit: Audit = {
          id: `audit-${crypto.randomUUID()}`,
          projectId,
          status: 'running',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ audits: [newAudit, ...state.audits] }))
        return newAudit
      },

      completeAudit: (auditId, scores) => {
        set((state) => {
          const updatedAudits = state.audits.map((a) =>
            a.id === auditId
              ? { ...a, status: 'completed' as const, scores, completedAt: new Date().toISOString() }
              : a
          )
          
          // Update the project's lastAuditId
          const audit = state.audits.find((a) => a.id === auditId)
          let updatedProjects = state.projects
          if (audit) {
            updatedProjects = state.projects.map((p) =>
              p.id === audit.projectId ? { ...p, lastAuditId: auditId } : p
            )
          }

          return { audits: updatedAudits, projects: updatedProjects }
        })
      },

      initAuditPipeline: (auditId) => {
        const steps: AuditPipelineStep[] = PIPELINE_STEPS_TEMPLATE.map((t) => ({
          ...t,
          status: 'pending' as const,
        }))
        set((state) => ({
          auditPipelines: { ...state.auditPipelines, [auditId]: steps },
        }))
      },

      updatePipelineStep: (auditId, stepId, status) => {
        set((state) => {
          const pipeline = state.auditPipelines[auditId]
          if (!pipeline) return state
          return {
            auditPipelines: {
              ...state.auditPipelines,
              [auditId]: pipeline.map((s) =>
                s.id === stepId ? { ...s, status } : s
              ),
            },
          }
        })
      },

      getProject: (id) => get().projects.find((p) => p.id === id),
      getProjectAudits: (projectId) => get().audits.filter((a) => a.projectId === projectId),
      getLatestAudit: (projectId) => {
        const projectAudits = get().audits.filter((a) => a.projectId === projectId)
        return projectAudits.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      },
    }),
    {
      name: 'uxray-mock-db',
    }
  )
)
