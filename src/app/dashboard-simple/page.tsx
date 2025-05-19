'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SimpleDashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const [authStatus, setAuthStatus] = useState('Loading...')
  
  useEffect(() => {
    setIsClient(true)
    
    const checkAuth = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setAuthStatus(`Error: ${error.message}`)
          return
        }
        
        if (data.session) {
          setAuthStatus(`Authenticated as: ${data.session.user.email}`)
        } else {
          setAuthStatus('Not authenticated')
          // If not authenticated, redirect to login
          setTimeout(() => {
            window.location.href = '/login'
          }, 3000)
        }
      } catch (err) {
        console.error(err)
        setAuthStatus(`Error checking auth: ${err}`)
      }
    }
    
    checkAuth()
  }, [])
  
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Simple Dashboard</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{authStatus}</p>
          
          {isClient && (
            <div className="mt-4">
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>Rendering on:</strong> {isClient ? 'Client' : 'Server'}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          className="w-full"
        >
          Go to Full Dashboard
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/dashboard-test'}
          className="w-full"
          variant="outline"
        >
          Go to Dashboard Test Page
        </Button>
        
        <Button 
          onClick={() => window.location.reload()}
          className="w-full"
          variant="secondary"
        >
          Reload This Page
        </Button>
      </div>
    </div>
  )
} 