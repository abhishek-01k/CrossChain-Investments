'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      // ignore if session has already expired
      if (!session || session.expires_at * 1000 > Date.now()) {
        setUser(session?.user ?? null)
        isLoading && setIsLoading(false)
      }
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
