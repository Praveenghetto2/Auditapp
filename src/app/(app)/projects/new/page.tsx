'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Image as ImageIcon, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMockDataStore } from '@/lib/stores/mock-data-store'
import { useBreadcrumbs } from '@/lib/hooks/use-breadcrumbs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'


export default function NewProjectPage() {
  const router = useRouter()
  useBreadcrumbs([
    { label: 'Projects', href: '/projects' },
    { label: 'New Project', href: '/projects/new' }
  ])

  const addProject = useMockDataStore((s) => s.addProject)
  const addAudit = useMockDataStore((s) => s.addAudit)
  const completeAudit = useMockDataStore((s) => s.completeAudit)

  const [name, setName] = React.useState('')
  const [sector, setSector] = React.useState('Other')
  const [description, setDescription] = React.useState('')
  const [sourceType, setSourceType] = React.useState<'figma' | 'screenshot'>('figma')
  const [figmaUrl, setFigmaUrl] = React.useState('')
  const [screenshotName, setScreenshotName] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [fileSize, setFileSize] = React.useState('')
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.')
      return
    }
    setScreenshotName(file.name)
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB')
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Simulate progress
    setUploadProgress(0)
    let current = 0
    const interval = setInterval(() => {
      current += 10
      setUploadProgress(current)
      if (current >= 100) {
        clearInterval(interval)
        toast.success('Screenshot uploaded successfully!')
      }
    }, 80)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleClearScreenshot = () => {
    setScreenshotName('')
    setFileSize('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setUploadProgress(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a project name.')
      return
    }

    let targetUrl = ''
    if (sourceType === 'figma') {
      if (!figmaUrl.trim()) {
        toast.error('Please enter your Figma file or frame link.')
        return
      }
      targetUrl = figmaUrl.trim()
    } else {
      if (!screenshotName) {
        toast.error('Please upload a screenshot image.')
        return
      }
      targetUrl = `Screenshot: ${screenshotName}`
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Creating project and scheduling visual heuristic analyzer...')

    try {
      const newProj = addProject(name.trim(), targetUrl, description.trim(), sector)
      
      // Seed an initial running audit
      const newAudit = addAudit(newProj.id)
      
      // Simulate audit completing
      setTimeout(() => {
        completeAudit(newAudit.id, {
          usability: Math.floor(Math.random() * 15) + 80,
          accessibility: Math.floor(Math.random() * 15) + 80,
          performance: Math.floor(Math.random() * 15) + 80,
          visual: Math.floor(Math.random() * 15) + 80,
        })
        toast.success(`UI & UX audit for "${newProj.name}" completed successfully!`)
      }, 5000)

      toast.success('Project created successfully!', { id: toastId })
      router.push(`/projects/${newProj.id}`)
    } catch {
      toast.error('Failed to create project. Please try again.', { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl pb-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground mt-1">Add a figma design or screenshot to audit.</p>
        </div>
      </div>

      <Card className="glass-panel shadow-md border-border/40 card-glow-purple">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Select your design source type to capture complete UI & UX audits.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="proj-name" className="text-xs font-semibold text-muted-foreground/80">
                Project Name
              </label>
              <Input
                id="proj-name"
                type="text"
                placeholder="e.g. Acme Mobile App Hero"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
                className="glass-panel bg-card/40 border-border/40 focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="proj-sector" className="text-xs font-semibold text-muted-foreground/80">
                Sector Tag
              </label>
              <select
                id="proj-sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-11 border border-border/40 rounded-xl bg-card/65 px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 glass-panel"
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
              <label htmlFor="proj-desc" className="text-xs font-semibold text-muted-foreground/80">
                Project Description
              </label>
              <textarea
                id="proj-desc"
                placeholder="Describe the purpose of this project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-[80px] border border-border/40 rounded-xl bg-card/65 px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 glass-panel"
              />
            </div>

            {/* Source Type Tab Selector */}
            <div className="flex rounded-xl p-1 bg-card/60 border border-border/40 glass-panel text-xs font-semibold text-muted-foreground select-none relative">
              <button
                type="button"
                onClick={() => setSourceType('figma')}
                className={cn(
                  "relative flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-300 cursor-pointer z-10",
                  sourceType === 'figma' ? 'text-primary-foreground' : 'hover:text-foreground/80'
                )}
              >
                {sourceType === 'figma' && (
                  <motion.div
                    layoutId="source-type-pill"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                ❖ Figma Link
              </button>
              <button
                type="button"
                onClick={() => setSourceType('screenshot')}
                className={cn(
                  "relative flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-300 cursor-pointer z-10",
                  sourceType === 'screenshot' ? 'text-primary-foreground' : 'hover:text-foreground/80'
                )}
              >
                {sourceType === 'screenshot' && (
                  <motion.div
                    layoutId="source-type-pill"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <ImageIcon className="size-3.5" />
                Upload Screenshot
              </button>
            </div>

            {/* Conditionally Render Inputs */}
            {sourceType === 'figma' ? (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
                <label htmlFor="figma-url" className="text-xs font-semibold text-muted-foreground/80">
                  Figma File or Frame URL
                </label>
                <Input
                  id="figma-url"
                  type="text"
                  placeholder="https://figma.com/file/..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="glass-panel bg-card/40 border-border/40 focus-visible:ring-primary/20"
                />
              </div>
            ) : (
              <div 
                className="flex flex-col gap-1.5 animate-in fade-in duration-300"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="text-xs font-semibold text-muted-foreground/80">App Screenshot Image</span>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {screenshotName ? (
                  <div className={cn(
                    "flex flex-col p-4 border rounded-xl text-xs shadow-md transition-all duration-300 relative overflow-hidden",
                    uploadProgress === 100 
                      ? 'border-emerald-500/20 bg-emerald-500/5 card-glow-success' 
                      : 'border-uxray-primary-300/20 bg-uxray-primary-300/5 card-glow-purple'
                  )}>
                    <div className="flex items-center gap-3">
                      {/* Image Thumbnail Preview */}
                      {previewUrl ? (
                        <div className="size-12 rounded-lg overflow-hidden border border-border/40 bg-black/30 shrink-0">
                          <img src={previewUrl} alt="Screenshot Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="size-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="size-5 text-muted-foreground" />
                        </div>
                      )}

                      {/* File Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold text-foreground truncate font-mono">{screenshotName}</p>
                        <p className="text-xs text-muted-foreground">{fileSize || 'Processing...'}</p>
                      </div>

                      {/* Clear Button */}
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearScreenshot}
                        className="text-muted-foreground hover:text-foreground h-7 px-2 hover:bg-muted/20 z-20 cursor-pointer"
                      >
                        Clear
                      </Button>
                    </div>

                    {/* Progress Bar Loader */}
                    {uploadProgress !== null && (
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className={uploadProgress === 100 ? 'text-emerald-400 font-semibold' : 'text-uxray-secondary-300'}>
                            {uploadProgress === 100 ? 'Upload Complete' : 'Uploading...'}
                          </span>
                          <span className="font-semibold">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-150", 
                              uploadProgress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-uxray-primary-300 to-uxray-secondary-300'
                            )}
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full flex flex-col items-center justify-center py-8 border border-dashed hover:border-primary/45 rounded-xl transition-all duration-300 gap-2 text-center group cursor-pointer glass-panel relative overflow-hidden",
                      isDragging 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm' 
                        : 'border-border/40 bg-card/10 hover:bg-card/20'
                    )}
                  >
                    <Upload className={cn("size-5 text-muted-foreground transition-colors duration-300", isDragging ? 'text-primary animate-bounce' : 'group-hover:text-primary group-hover:animate-bounce')} />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {isDragging ? 'Drop screenshot here!' : 'Drag & drop or click to choose screenshot image'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Supports PNG, JPG, or WEBP (max 5MB)
                    </span>
                  </motion.button>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" asChild disabled={isSubmitting} className="font-semibold shadow-sm">
                <Link href="/projects">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/95">
                <Plus className="mr-2 size-4" />
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
