'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

type Brand = {
  id: string
  name: string
  logo_url: string | null
  created_at: string
}

export default function DashboardPage() {
  const { user, isLoading } = useSupabase()
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoadingBrands, setIsLoadingBrands] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [isCreatingBrand, setIsCreatingBrand] = useState(false)
  
  console.log('[DashboardPage] MOUNT - Initial render with:', { 
    isUserPresent: !!user, 
    userEmail: user?.email || 'none',
    isLoading 
  });
  
  useEffect(() => {
    console.log(`[DashboardPage] useEffect triggered. isLoading: ${isLoading}, User: ${user ? user.email : 'null'}`);
    if (!isLoading && !user) {
      console.log('[DashboardPage] Conditions met: !isLoading && !user. Redirecting to /login.');
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Fetch brands when the component mounts and user is available
  useEffect(() => {
    const fetchBrands = async () => {
      if (!user) return
      
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setBrands(data as Brand[])
      } catch (error) {
        console.error('Error fetching brands:', error)
        toast.error('Failed to load brands')
      } finally {
        setIsLoadingBrands(false)
      }
    }
    
    if (user) {
      fetchBrands()
    }
  }, [user])

  // Create new brand
  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Please enter a brand name')
      return
    }
    
    setIsCreatingBrand(true)
    
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data, error } = await supabase
        .from('brands')
        .insert([{
          user_id: user?.id,
          name: newBrandName.trim()
        }])
        .select()
      
      if (error) {
        throw error
      }
      
      setNewBrandName('')
      setDialogOpen(false)
      toast.success('Brand created successfully')
      
      // Add the new brand to the state
      if (data && data.length > 0) {
        setBrands(prevBrands => [data[0] as Brand, ...prevBrands])
      }
      
    } catch (error) {
      console.error('Error creating brand:', error)
      toast.error('Failed to create brand')
    } finally {
      setIsCreatingBrand(false)
    }
  }

  // If still loading or no user, show loading state
  if (isLoading) {
    console.log('[DashboardPage] Rendering Loading state (isLoading is true)');
    return <div className="container mx-auto py-10 px-4">Loading...</div>
  }

  // Only render dashboard content if we have a user
  if (!user) {
    console.log('[DashboardPage] Rendering null (isLoading is false, but no user before return). useEffect should handle redirect.');
    return null // We'll redirect in the useEffect
  }

  console.log(`[DashboardPage] Rendering actual dashboard content. User: ${user.email}`);
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Debug section */}
      <Card className="mb-4 bg-yellow-50">
        <CardHeader>
          <CardTitle>Debug Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Force Navigate to Dashboard
            </Button>
            <Button 
              onClick={async () => {
                const { supabase } = await import('@/lib/supabase/client');
                const { data } = await supabase.auth.getSession();
                alert(`Session check: ${data.session ? 'Auth session found' : 'No auth session'}`);
              }} 
              variant="outline"
            >
              Check Auth Session
            </Button>
          </div>
        </CardContent>
      </Card>
      
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
        
        {/* Brands Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Brands</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Brand</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new brand</DialogTitle>
                  <DialogDescription>
                    Enter the name for your new brand.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input 
                    id="brand-name" 
                    value={newBrandName} 
                    onChange={(e) => setNewBrandName(e.target.value)} 
                    placeholder="Enter brand name"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleCreateBrand} 
                    disabled={isCreatingBrand || !newBrandName.trim()}
                  >
                    {isCreatingBrand ? 'Creating...' : 'Create Brand'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoadingBrands ? (
            <div className="text-center py-10">Loading brands...</div>
          ) : brands.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-gray-500 mb-4">You don&apos;t have any brands yet</p>
                <Button onClick={() => setDialogOpen(true)}>Create your first brand</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <Link href={`/brands/${brand.id}`} key={brand.id} className="block">
                  <Card className="h-full transition-all hover:shadow-md">
                    <CardHeader>
                      <CardTitle>{brand.name}</CardTitle>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button variant="outline" className="w-full justify-start">
                        Manage Brand
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        
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