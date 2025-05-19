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
      console.log('[SupabaseProvider] Getting session...');
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Enhanced logging for debugging
      console.log('[SupabaseProvider] Current pathname:', pathname)
      console.log('[SupabaseProvider] Session after getSession():', session ? 'Present' : 'Not present')
      console.log('[SupabaseProvider] Auth state:', session ? 'Authenticated' : 'Not authenticated')
      if (session?.user) {
        console.log('[SupabaseProvider] Logged in as:', session.user.email)
        console.log('[SupabaseProvider] User ID:', session.user.id)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('[SupabaseProvider] Auth state changed:', event, currentSession ? 'Authenticated' : 'Not authenticated')
        console.log('[SupabaseProvider] Session in onAuthStateChange:', currentSession ? 'Present' : 'Not present')
        if (currentSession?.user) {
          console.log('[SupabaseProvider] User in changed event:', currentSession.user.email)
        }
        
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setIsLoading(false)
        
        // Handling specific auth events for better page flow
        if (event === 'SIGNED_IN') {
          console.log('[SupabaseProvider] User signed in, refreshing session for redirect via middleware')
          
          // Check if browser storage contains auth data
          try {
            const authStorage = localStorage.getItem('supabase-auth')
            console.log('[SupabaseProvider] Auth storage after SIGNED_IN:', authStorage ? 'Present' : 'Not present')
          } catch (e) {
            console.error('[SupabaseProvider] Error checking localStorage:', e)
          }
          
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          console.log('[SupabaseProvider] User signed out, refreshing session for redirect via middleware')
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