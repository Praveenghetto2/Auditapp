'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Shield,
  Eye,
  Search as SearchIcon,
  MessageSquare,
  ClipboardCheck,
  Wifi,
  Send,
  X,
  Trash2,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { useTeamStore, type TeamMember } from '@/lib/stores/team-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Helpers ────────────────────────────────────────────────────────────

function formatRelativeDate(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatJoinDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const ROLE_STYLES: Record<TeamMember['role'], string> = {
  Admin: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Reviewer: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Viewer: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
}

const ROLE_ICONS: Record<TeamMember['role'], React.ElementType> = {
  Admin: ShieldCheck,
  Reviewer: SearchIcon,
  Viewer: Eye,
}

// ─── Animation Variants ─────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

// ─── Activity Feed Data ─────────────────────────────────────────────────

interface ActivityItem {
  id: string
  avatar: { initials: string; color: string }
  description: React.ReactNode
  timestamp: string
}

// ═══════════════════════════════════════════════════════════════════════
// Team Page
// ═══════════════════════════════════════════════════════════════════════

export default function TeamPage() {
  useBreadcrumbs([{ label: 'Team', href: '/team' }])

  const members = useTeamStore((s) => s.members)
  const comments = useTeamStore((s) => s.comments)
  const assignments = useTeamStore((s) => s.assignments)
  const addMember = useTeamStore((s) => s.addMember)
  const removeMember = useTeamStore((s) => s.removeMember)
  const updateMemberRole = useTeamStore((s) => s.updateMemberRole)

  const [showInviteForm, setShowInviteForm] = React.useState(false)
  const [inviteName, setInviteName] = React.useState('')
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteRole, setInviteRole] = React.useState<TeamMember['role']>('Viewer')

  // ─── Computed stats ───────────────────────────────────────────────────

  const onlineCount = members.filter((m) => m.isOnline).length

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const commentsThisWeek = comments.filter(
    (c) => new Date(c.createdAt).getTime() > weekAgo
  ).length

  const assignedCount = assignments.length

  const stats = [
    { label: 'Total Members', value: members.length, icon: Users, gradient: 'bg-gradient-primary' },
    { label: 'Online Now', value: onlineCount, icon: Wifi, gradient: 'bg-gradient-success' },
    { label: 'Comments This Week', value: commentsThisWeek, icon: MessageSquare, gradient: 'bg-gradient-secondary' },
    { label: 'Issues Assigned', value: assignedCount, icon: ClipboardCheck, gradient: 'bg-gradient-warning' },
  ]

  // ─── Activity feed (built from real store data) ───────────────────────

  const getMemberById = (id: string) => members.find((m) => m.id === id)

  const activityFeed: ActivityItem[] = React.useMemo(() => {
    const items: ActivityItem[] = []

    // Comments → activity
    comments.slice(0, 3).forEach((c) => {
      const author = getMemberById(c.authorId)
      if (!author) return
      items.push({
        id: `act-comment-${c.id}`,
        avatar: { initials: author.initials, color: author.avatarColor },
        description: (
          <>
            <span className="font-semibold text-foreground">{author.name}</span>{' '}
            commented on{' '}
            <span className="font-medium text-primary">Issue #{c.issueId}</span>
          </>
        ),
        timestamp: c.createdAt,
      })
    })

    // Assignments → activity
    assignments.slice(0, 2).forEach((a) => {
      const assignee = getMemberById(a.assigneeId)
      if (!assignee) return
      items.push({
        id: `act-assign-${a.auditId}-${a.issueId}`,
        avatar: { initials: assignee.initials, color: assignee.avatarColor },
        description: (
          <>
            <span className="font-semibold text-foreground">{assignee.name}</span>{' '}
            was assigned{' '}
            <span className="font-medium text-primary">Issue #{a.issueId}</span>
          </>
        ),
        timestamp: a.assignedAt,
      })
    })

    // Static activity for variety
    const praveen = getMemberById('member-1')
    if (praveen) {
      items.push({
        id: 'act-complete-audit-1',
        avatar: { initials: praveen.initials, color: praveen.avatarColor },
        description: (
          <>
            <span className="font-semibold text-foreground">{praveen.name}</span>{' '}
            completed{' '}
            <span className="font-medium text-primary">Audit audit-1</span>
          </>
        ),
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    // Sort by most recent first
    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments, assignments, members])

  // ─── Invite handler ───────────────────────────────────────────────────

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName.trim() || !inviteEmail.trim()) return

    addMember({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      avatarColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      initials: getInitials(inviteName.trim()),
      isOnline: false,
    })

    toast.success(`Invite sent to ${inviteName.trim()}!`, {
      description: `Added as ${inviteRole} to the team.`,
    })

    setInviteName('')
    setInviteEmail('')
    setInviteRole('Viewer')
    setShowInviteForm(false)
  }

  // ─── Role change handler ──────────────────────────────────────────────

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    updateMemberRole(memberId, newRole)
    const member = getMemberById(memberId)
    toast.success(`Updated ${member?.name ?? 'Member'} to ${newRole}`)
  }

  // ─── Remove handler ──────────────────────────────────────────────────

  const handleRemove = (memberId: string) => {
    const member = getMemberById(memberId)
    removeMember(memberId)
    toast.success(`Removed ${member?.name ?? 'Member'} from team`)
  }

  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground mt-1">
          Manage your audit team and permissions
        </p>
      </div>

      {/* ─── Stats Bar ───────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="glass-panel border-border/40 overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={cn(
                      'flex items-center justify-center size-10 rounded-xl shrink-0',
                      stat.gradient
                    )}
                  >
                    <Icon className="size-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ─── Team Members Grid ───────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="size-5 text-primary" />
          Team Members
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {/* Member Cards */}
          <AnimatePresence mode="popLayout">
            {members.map((member) => {
              const RoleIcon = ROLE_ICONS[member.role]
              return (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                >
                  <Card className="glass-panel border-border/40 hover:border-border/60 transition-colors group">
                    <CardContent className="p-5">
                      {/* Top row: avatar + actions */}
                      <div className="flex items-start justify-between mb-4">
                        {/* Avatar */}
                        <div className="relative">
                          <div
                            className="flex items-center justify-center size-12 rounded-full text-sm font-bold text-white select-none"
                            style={{ backgroundColor: member.avatarColor }}
                          >
                            {member.initials}
                          </div>
                          {/* Online dot */}
                          <span
                            className={cn(
                              'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card',
                              member.isOnline
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-zinc-500'
                            )}
                          />
                        </div>

                        {/* Actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(['Admin', 'Reviewer', 'Viewer'] as const).map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => handleRoleChange(member.id, role)}
                                className={cn(
                                  member.role === role && 'bg-accent'
                                )}
                              >
                                <UserCog className="size-4" />
                                {role}
                                {member.role === role && (
                                  <Badge
                                    variant="outline"
                                    className="ml-auto text-[10px] px-1.5 py-0"
                                  >
                                    Current
                                  </Badge>
                                )}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleRemove(member.id)}
                            >
                              <Trash2 className="size-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Name & email */}
                      <h3 className="text-sm font-semibold truncate">{member.name}</h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {member.email}
                      </p>

                      {/* Role badge & joined */}
                      <div className="flex items-center justify-between mt-3">
                        <Badge
                          variant="outline"
                          className={cn('text-xs gap-1', ROLE_STYLES[member.role])}
                        >
                          <RoleIcon className="size-3" />
                          {member.role}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          Joined {formatJoinDate(member.joinedAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* ─── Invite Card ─────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              {!showInviteForm ? (
                <motion.div
                  key="invite-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card
                    className="border-dashed border-2 border-border/50 bg-transparent hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[180px]"
                    onClick={() => setShowInviteForm(true)}
                  >
                    <CardContent className="p-5 flex flex-col items-center justify-center h-full gap-3">
                      <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                        <UserPlus className="size-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">Invite Team Member</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Add a colleague to this workspace
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="invite-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="glass-panel border-primary/30 shadow-lg h-full">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <UserPlus className="size-4 text-primary" />
                          Invite Member
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setShowInviteForm(false)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>

                      <form onSubmit={handleInvite} className="space-y-3">
                        <div>
                          <label
                            htmlFor="invite-name"
                            className="text-xs font-semibold text-muted-foreground/80 block mb-1"
                          >
                            Full Name
                          </label>
                          <Input
                            id="invite-name"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            placeholder="Jane Doe"
                            required
                            className="glass-panel bg-card/45 border-border/40 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="invite-email"
                            className="text-xs font-semibold text-muted-foreground/80 block mb-1"
                          >
                            Email
                          </label>
                          <Input
                            id="invite-email"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="jane@company.com"
                            required
                            className="glass-panel bg-card/45 border-border/40 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground/80 block mb-1">
                            Role
                          </label>
                          <Select
                            value={inviteRole}
                            onValueChange={(v) => setInviteRole(v as TeamMember['role'])}
                          >
                            <SelectTrigger className="w-full glass-panel bg-card/45 border-border/40 h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Reviewer">Reviewer</SelectItem>
                              <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="submit"
                          className="w-full font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                          size="sm"
                        >
                          <Send className="size-3.5" />
                          Send Invite
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Recent Activity Feed ────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" />
          Recent Activity
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="glass-panel border-border/40">
            <CardContent className="p-6">
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[17px] top-3 bottom-3 w-px bg-border/60" />

                <div className="space-y-6">
                  {activityFeed.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      variants={itemVariants}
                      className="relative flex items-start gap-4 pl-0"
                    >
                      {/* Timeline dot + avatar */}
                      <div className="relative z-10 shrink-0">
                        <div
                          className="flex items-center justify-center size-9 rounded-full text-xs font-bold text-white select-none ring-4 ring-card"
                          style={{ backgroundColor: activity.avatar.color }}
                        >
                          {activity.avatar.initials}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {formatRelativeDate(activity.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {activityFeed.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
