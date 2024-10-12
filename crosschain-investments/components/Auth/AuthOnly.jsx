'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from "lucide-react"

import { useAuthContext } from '@/app/hooks/auth'

/**
 * HOC for page that should only be accessible by authenticated/logged-in user only
 */
export function AuthOnly ({ children }) {
  const { isLoading, user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  /**
   * show loading indicator when
   * (1) data is still pending
   * (2) redirect conditions are met
   */
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  return children
}
