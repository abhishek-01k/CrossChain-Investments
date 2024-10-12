'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from "lucide-react"

import { useAuthContext } from '@/app/hooks/auth'

/**
 * High Order COmponent for page that should only be accessible by anonymous/logged-out user only
 */
export function AnonOnly ({ children }) {
  const { isLoading, user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  /**
   * show loading indicator when
   * (1) data is still pending
   * (2) redirect conditions are met
   */
  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    )
  }

  return children
}
