'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardTestPage() {
  const [info, setInfo] = useState<any>({});
  
  useEffect(() => {
    // Gather information about the current environment
    setInfo({
      pathname: window.location.pathname,
      href: window.location.href,
      host: window.location.host,
      protocol: window.location.protocol,
      cookies: document.cookie,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Page Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(info, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          className="w-full"
        >
          Go to Dashboard Directly
        </Button>
        
        <Button 
          onClick={() => {
            localStorage.removeItem('supabase.auth.token');
            window.location.href = '/login';
          }}
          className="w-full"
          variant="outline"
        >
          Clear Auth and Go to Login
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/'}
          className="w-full"
          variant="ghost"
        >
          Go to Home Page
        </Button>
      </div>
    </div>
  )
} 