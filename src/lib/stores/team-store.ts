import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════
// UXRay — Team Collaboration Store (Zustand + localStorage persist)
// Manages team members, comments on audit issues, and issue assignments.
// ═══════════════════════════════════════════════════════════════════════

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Reviewer' | 'Viewer'
  avatarColor: string
  initials: string
  joinedAt: string
  isOnline: boolean
}

export interface Comment {
  id: string
  auditId: string
  issueId: string
  authorId: string
  text: string
  createdAt: string
}

export interface IssueAssignment {
  auditId: string
  issueId: string
  assigneeId: string
  assignedAt: string
}

interface TeamState {
  members: TeamMember[]
  comments: Comment[]
  assignments: IssueAssignment[]

  // Member actions
  addMember: (member: Omit<TeamMember, 'id' | 'joinedAt'>) => TeamMember
  removeMember: (id: string) => void
  updateMemberRole: (id: string, role: TeamMember['role']) => void

  // Comment actions
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Comment
  getCommentsByIssue: (auditId: string, issueId: string) => Comment[]

  // Assignment actions
  assignIssue: (assignment: Omit<IssueAssignment, 'assignedAt'>) => IssueAssignment
  getAssignment: (auditId: string, issueId: string) => IssueAssignment | undefined
}

// ─── Seed Data ──────────────────────────────────────────────────────────

const SEED_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Praveen Kumar',
    email: 'praveen@uxray.ai',
    role: 'Admin',
    avatarColor: '#8B5CF6',
    initials: 'PK',
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  {
    id: 'member-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@uxray.ai',
    role: 'Reviewer',
    avatarColor: '#EC4899',
    initials: 'SC',
    joinedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  {
    id: 'member-3',
    name: 'Alex Rivera',
    email: 'alex.rivera@uxray.ai',
    role: 'Reviewer',
    avatarColor: '#10B981',
    initials: 'AR',
    joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isOnline: false,
  },
  {
    id: 'member-4',
    name: 'Jamie Park',
    email: 'jamie.park@uxray.ai',
    role: 'Viewer',
    avatarColor: '#F59E0B',
    initials: 'JP',
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isOnline: false,
  },
]

const SEED_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    auditId: 'audit-1',
    issueId: 'iss-1',
    authorId: 'member-2',
    text: 'The contrast ratio on the hero section CTA button is below WCAG AA threshold. Suggest using #1a1a2e on white.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment-2',
    auditId: 'audit-1',
    issueId: 'iss-2',
    authorId: 'member-1',
    text: 'Navigation menu labels are truncated on tablet viewport. Let\'s add a responsive breakpoint at 768px.',
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment-3',
    auditId: 'audit-2',
    issueId: 'iss-3',
    authorId: 'member-3',
    text: 'Form field error states are missing aria-describedby attributes. This is a critical a11y gap.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment-4',
    auditId: 'audit-1',
    issueId: 'iss-2',
    authorId: 'member-2',
    text: 'Agreed — also the mobile hamburger icon needs a visible focus ring for keyboard nav.',
    createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const SEED_ASSIGNMENTS: IssueAssignment[] = [
  {
    auditId: 'audit-1',
    issueId: 'iss-1',
    assigneeId: 'member-3',
    assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    auditId: 'audit-2',
    issueId: 'iss-3',
    assigneeId: 'member-2',
    assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── Store ──────────────────────────────────────────────────────────────

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: SEED_MEMBERS,
      comments: SEED_COMMENTS,
      assignments: SEED_ASSIGNMENTS,

      addMember: (memberData) => {
        const newMember: TeamMember = {
          ...memberData,
          id: `member-${crypto.randomUUID()}`,
          joinedAt: new Date().toISOString(),
        }
        set((state) => ({ members: [...state.members, newMember] }))
        return newMember
      },

      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          // Cascade: remove assignments for this member
          assignments: state.assignments.filter((a) => a.assigneeId !== id),
        }))
      },

      updateMemberRole: (id, role) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role } : m
          ),
        }))
      },

      addComment: (commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: `comment-${crypto.randomUUID()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ comments: [newComment, ...state.comments] }))
        return newComment
      },

      getCommentsByIssue: (auditId, issueId) =>
        get().comments.filter(
          (c) => c.auditId === auditId && c.issueId === issueId
        ),

      assignIssue: (assignmentData) => {
        const newAssignment: IssueAssignment = {
          ...assignmentData,
          assignedAt: new Date().toISOString(),
        }
        set((state) => {
          // Replace existing assignment for the same issue, or add new
          const filtered = state.assignments.filter(
            (a) =>
              !(a.auditId === assignmentData.auditId && a.issueId === assignmentData.issueId)
          )
          return { assignments: [...filtered, newAssignment] }
        })
        return newAssignment
      },

      getAssignment: (auditId, issueId) =>
        get().assignments.find(
          (a) => a.auditId === auditId && a.issueId === issueId
        ),
    }),
    {
      name: 'uxray-team',
    }
  )
)
