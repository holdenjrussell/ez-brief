'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface BrandPositioningProps {
  brandId: string
}

type PositioningData = {
  id: string
  brand_id: string
  content: any
}

export default function BrandPositioning({ brandId }: BrandPositioningProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [positioningData, setPositioningData] = useState<PositioningData | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'p-4 border rounded-md focus:outline-none min-h-[200px] prose prose-slate max-w-none'
      }
    },
    onUpdate: ({ editor }) => {
      console.log('Editor content updated:', editor.getJSON())
    }
  })

  // Fetch positioning data
  useEffect(() => {
    const fetchPositioningData = async () => {
      if (!brandId) return
      
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data, error } = await supabase
          .from('brand_positioning')
          .select('*')
          .eq('brand_id', brandId)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is the error when no rows returned
          throw error
        }
        
        setPositioningData(data as PositioningData || null)
        
        // If we have content, update the editor
        if (data?.content && editor) {
          editor.commands.setContent(data.content)
        }
      } catch (error) {
        console.error('Error fetching positioning data:', error)
        toast.error('Failed to load positioning data')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (brandId && editor) {
      fetchPositioningData()
    }
  }, [brandId, editor])

  // Save positioning data
  const savePositioning = async () => {
    if (!brandId || !editor) return
    
    setIsSaving(true)
    
    try {
      const editorContent = editor.getJSON()
      const { supabase } = await import('@/lib/supabase/client')
      
      if (positioningData) {
        // Update existing positioning
        const { error } = await supabase
          .from('brand_positioning')
          .update({
            content: editorContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', positioningData.id)
        
        if (error) throw error
      } else {
        // Create new positioning
        const { data, error } = await supabase
          .from('brand_positioning')
          .insert([{
            brand_id: brandId,
            content: editorContent
          }])
          .select()
        
        if (error) throw error
        
        if (data && data.length > 0) {
          setPositioningData(data[0] as PositioningData)
        }
      }
      
      toast.success('Positioning saved successfully')
    } catch (error) {
      console.error('Error saving positioning:', error)
      toast.error('Failed to save positioning')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="py-4">Loading positioning data...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Positioning</CardTitle>
        <CardDescription>Define your brand's unique position in the market</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="mb-2 flex flex-wrap gap-2 border-b pb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive('bold') ? 'bg-slate-100' : ''}
              disabled={!editor}
            >
              Bold
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive('italic') ? 'bg-slate-100' : ''}
              disabled={!editor}
            >
              Italic
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={editor?.isActive('underline') ? 'bg-slate-100' : ''}
              disabled={!editor}
            >
              Underline
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor?.isActive('heading', { level: 1 }) ? 'bg-slate-100' : ''}
              disabled={!editor}
            >
              H1
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor?.isActive('heading', { level: 2 }) ? 'bg-slate-100' : ''}
              disabled={!editor}
            >
              H2
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={editor?.isActive('bulletList') ? 'bg-slate-100' : ''}
              disabled={!editor}
            >
              Bullet List
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={editor?.isActive('orderedList') ? 'bg-slate-100' : ''}
              disabled={!editor}
            >
              Ordered List
            </Button>
          </div>
          <EditorContent editor={editor} className="min-h-[200px]" />
        </div>
        <div className="flex justify-end">
          <Button onClick={savePositioning} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Positioning'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 