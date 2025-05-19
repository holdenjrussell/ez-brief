'use client'

import Link from 'next/link'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { user, signOut } = useSupabase()
  // Router is no longer used as we're using direct navigation
  
  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/';
  }
  
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[Navbar] Dashboard button clicked, navigating directly');
    window.location.href = '/dashboard';
  };

  return (
    <nav className="border-b py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AI Ad Briefing Tool
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleDashboardClick}>
                Dashboard
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 