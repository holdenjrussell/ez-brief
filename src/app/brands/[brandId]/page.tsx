'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import BrandPositioning from './components/BrandPositioning'

type Brand = {
  id: string
  name: string
  logo_url: string | null
  created_at: string
}

export default function BrandDetailPage() {
  const { user, isLoading } = useSupabase()
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [isLoadingBrand, setIsLoadingBrand] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Fetch brand when the component mounts and user is available
  useEffect(() => {
    const fetchBrand = async () => {
      if (!user || !brandId) return
      
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('id', brandId)
          .single()
        
        if (error) {
          throw error
        }
        
        setBrand(data as Brand)
      } catch (error) {
        console.error('Error fetching brand:', error)
        toast.error('Failed to load brand details')
        router.push('/dashboard')
      } finally {
        setIsLoadingBrand(false)
      }
    }
    
    if (user && brandId) {
      fetchBrand()
    }
  }, [user, brandId, router])

  // If still loading or no user, show loading state
  if (isLoading || isLoadingBrand) {
    return <div className="container mx-auto py-10 px-4">Loading...</div>
  }

  // If brand not found
  if (!brand) {
    return <div className="container mx-auto py-10 px-4">Brand not found</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{brand.name}</h1>
        </div>
      </div>

      <Tabs defaultValue="positioning" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="target-audience" disabled>Target Audience</TabsTrigger>
          <TabsTrigger value="competition" disabled>Competition</TabsTrigger>
          <TabsTrigger value="briefs" disabled>Briefs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="positioning">
          <BrandPositioning brandId={brandId} />
        </TabsContent>
        
        <TabsContent value="target-audience">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Target Audience section will be implemented in future phases.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="competition">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Competition section will be implemented in future phases.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="briefs">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Briefs section will be implemented in future phases.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 