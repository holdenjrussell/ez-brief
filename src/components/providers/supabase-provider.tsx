'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Session, User, AuthChangeEvent, AuthResponse } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'

type SupabaseContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<{ error: Error | null }>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Enhanced logging for debugging
      console.log('[SupabaseProvider] Current pathname:', pathname)
      console.log('[SupabaseProvider] Auth state:', session ? 'Authenticated' : 'Not authenticated')
      if (session?.user) {
        console.log('[SupabaseProvider] Logged in as:', session.user.email)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('[SupabaseProvider] Auth state changed:', event, currentSession ? 'Authenticated' : 'Not authenticated')
        
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setIsLoading(false)
        
        // Handling specific auth events for better page flow
        if (event === 'SIGNED_IN') {
          console.log('[SupabaseProvider] User signed in, redirecting to dashboard')
          router.push('/dashboard')
          // Force a refresh to ensure all components are aware of the authentication change
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          console.log('[SupabaseProvider] User signed out, redirecting to home')
          router.push('/')
          router.refresh()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password })
  }

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password })
    console.log('[SupabaseProvider] Sign in response:', 
      response.error ? `Error: ${response.error.message}` : 'Success')
    return response
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 