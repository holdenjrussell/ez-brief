'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

export default function DashboardPage() {
  const { user } = useSupabase()

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Suspense fallback={<div>Loading...</div>}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              You are signed in as <strong>{user?.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This is your dashboard for managing brand information, target audiences, 
              competitor insights, and creating AI-assisted advertising briefs.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create a new advertising brief</li>
                <li>Manage brand information</li>
                <li>Define target audiences</li>
                <li>Analyze competitor insights</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 italic">No recent activity yet</p>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </div>
  )
} 