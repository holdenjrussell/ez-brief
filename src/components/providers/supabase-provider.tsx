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

  // Helper function for more reliable navigation
  const safeNavigate = (path: string) => {
    console.log(`[SupabaseProvider] Attempting to navigate to: ${path}`);
    
    // Try Next.js router first
    try {
      router.push(path);
    } catch (e) {
      console.error('[SupabaseProvider] Router navigation failed, using direct location:', e);
    }
    
    // Use direct navigation as a backup, with short delay to allow router to attempt first
    setTimeout(() => {
      console.log(`[SupabaseProvider] Executing direct navigation to: ${path}`);
      window.location.href = path;
    }, 100);
  };

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
        
        // Ensure dashboard redirect if authenticated and on auth page
        if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/login?')) {
          console.log('[SupabaseProvider] Already authenticated but on auth page, redirecting to dashboard');
          safeNavigate('/dashboard');
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
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
            const authStorage = localStorage.getItem('supabase.auth.token')
            console.log('[SupabaseProvider] Auth storage after SIGNED_IN:', authStorage ? 'Present' : 'Not present')
          } catch (e) {
            console.error('[SupabaseProvider] Error checking localStorage:', e)
          }
          
          // Force redirect to dashboard after sign in
          console.log('[SupabaseProvider] SIGNED_IN event - forcing navigation to dashboard');
          safeNavigate('/dashboard');
          
        } else if (event === 'SIGNED_OUT') {
          console.log('[SupabaseProvider] User signed out, redirecting to login');
          safeNavigate('/login');
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const signUp = async (email: string, password: string) => {
    try {
      console.log('[SupabaseProvider] Attempting signup for:', email);
      const response = await supabase.auth.signUp({ email, password });
      console.log('[SupabaseProvider] Signup response:', response.error ? `Error: ${response.error.message}` : 'Success');
      return response;
    } catch (error) {
      console.error('[SupabaseProvider] Signup error:', error);
      throw error;
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[SupabaseProvider] Attempting sign in for:', email);
      const response = await supabase.auth.signInWithPassword({ email, password });
      console.log('[SupabaseProvider] Sign in response:', 
        response.error ? `Error: ${response.error.message}` : 'Success');
        
      if (response.data.session) {
        console.log('[SupabaseProvider] Sign in successful, setting session and forcing redirect to dashboard');
        setSession(response.data.session);
        setUser(response.data.session.user);
        
        // Force immediate navigation to dashboard after successful login
        setTimeout(() => {
          console.log('[SupabaseProvider] Executing direct navigation to dashboard after login');
          window.location.href = '/dashboard';
        }, 100);
      }
        
      return response;
    } catch (error) {
      console.error('[SupabaseProvider] Sign in error:', error);
      throw error;
    }
  }

  const signOut = async () => {
    try {
      console.log('[SupabaseProvider] Signing out user');
      const response = await supabase.auth.signOut();
      console.log('[SupabaseProvider] Sign out response:', response.error ? `Error: ${response.error.message}` : 'Success');
      
      if (!response.error) {
        // Clear session state immediately
        setSession(null);
        setUser(null);
        
        // Direct navigation to login page
        window.location.href = '/login';
      }
      
      return response;
    } catch (error) {
      console.error('[SupabaseProvider] Sign out error:', error);
      throw error;
    }
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