'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AuthError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, user, isLoading } = useSupabase()
  const router = useRouter()

  console.log('[LoginPage] Render with user:', user ? 'Present (email: ' + user.email + ')' : 'Not present')
  console.log('[LoginPage] isLoading:', isLoading);
  console.log('[LoginPage] Current pathname:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
  console.log('[LoginPage] Current URL:', typeof window !== 'undefined' ? window.location.href : 'unknown');

  // Redirect if user is already logged in
  useEffect(() => {
    console.log('[LoginPage] useEffect triggered, user:', user ? 'Authenticated' : 'Not authenticated');
    
    if (user && !isLoading) {
      console.log('[LoginPage] User already logged in, redirecting to dashboard...');
      
      // First try Next.js navigation
      try {
        router.push('/dashboard');
      } catch (e) {
        console.error('[LoginPage] Router navigation failed:', e);
      }
      
      // Use direct navigation as fallback
      setTimeout(() => {
        console.log('[LoginPage] Executing direct navigation to dashboard');
        window.location.href = '/dashboard';
      }, 200);
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('[LoginPage] Attempting login with:', email);
      const { error } = await signIn(email, password)
      
      if (error) {
        throw error
      }
      
      console.log("[LoginPage] Login successful");
      
      // Explicitly check what's in local storage after login
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const session = await supabase.auth.getSession();
        console.log("[LoginPage] Session after login:", session.data.session ? "Present" : "Not present");
        console.log("[LoginPage] User from session:", session.data.session?.user?.email || "None");
        
        // Check local storage
        const authStorage = localStorage.getItem('supabase.auth.token');
        console.log("[LoginPage] Auth data in localStorage:", authStorage ? "Present" : "Not present");
      } catch (e) {
        console.error("[LoginPage] Error checking session:", e);
      }
      
      // Force navigation to dashboard immediately
      console.log("[LoginPage] Forcing navigation to dashboard after successful login");
      window.location.href = '/dashboard';
      
    } catch (err: unknown) {
      console.error("[LoginPage] Login error:", err)
      const errorMessage = err instanceof AuthError 
        ? err.message 
        : 'Failed to sign in'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // If we're definitely logged in, don't display the login form
  if (user && !isLoading) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center mb-4">You are already logged in.</p>
            <Button onClick={() => {
              console.log("[LoginPage] Manually navigating to dashboard from already-logged-in state");
              // Immediately use direct navigation for most reliable redirect
              window.location.href = '/dashboard';
            }}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-center">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 