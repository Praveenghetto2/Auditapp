// ═══════════════════════════════════════════════════════════════════════
// UXRay — useBreadcrumbs Hook
// Usage: useBreadcrumbs([{ label: 'Dashboard', href: '/dashboard' }])
// Sets breadcrumbs on mount, clears on unmount.
// ═══════════════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { useBreadcrumbStore } from '@/lib/stores/breadcrumb-store'
import type { BreadcrumbItem } from '@/lib/types'

export function useBreadcrumbs(items: BreadcrumbItem[]) {
  const setBreadcrumbs = useBreadcrumbStore((s) => s.setBreadcrumbs)
  const clearBreadcrumbs = useBreadcrumbStore((s) => s.clearBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs(items)
    return () => clearBreadcrumbs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, clearBreadcrumbs])
}
