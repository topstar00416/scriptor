'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Internal Imports
import { createClient } from '@configs/supabase'

interface BuilderProps {
  projectId: string
}

const Builder = ({ projectId }: BuilderProps) => {
  const router = useRouter()
  const supabase = createClient()

  const [script, setScript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from('Project').select('*').eq('id', projectId).single()

        if (error) throw error

        setProjectData(data)

        // Fetch existing script if any
        const { data: scriptData } = await supabase
          .from('Script')
          .select('content')
          .eq('project_id', projectId)
          .single()

        if (scriptData) {
          setScript(scriptData.content)
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId, supabase])

  const handleSave = async () => {
    try {
      setIsLoading(true)

      // Upsert the script content
      const { error } = await supabase
        .from('Script')
        .upsert({
          project_id: projectId,
          content: script,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Show success message
      alert('Script saved successfully!')
    } catch (error) {
      console.error('Error saving script:', error)
      alert('Error saving script. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className='relative w-full h-full'>
      <Card className='w-full h-full'>
        <CardContent className='flex flex-col gap-6 h-full'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h3'>{projectData?.title || 'Script Editor'}</Typography>
              <Typography color='text.secondary'>Edit your script content</Typography>
            </div>
            <div className='flex gap-4'>
              <Button
                variant='tonal'
                color='primary'
                onClick={handleSave}
                disabled={isLoading}
              >
                Save
              </Button>
              <Button
                variant='tonal'
                color='error'
                onClick={() => router.push('/home')}
              >
                Back
              </Button>
            </div>
          </div>
          <Divider />
          <TextField
            fullWidth
            multiline
            rows={20}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder='Start writing your script here...'
            className='flex-1'
            sx={{
              '& .MuiInputBase-root': {
                height: '100%'
              },
              '& .MuiInputBase-input': {
                height: '100% !important'
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default Builder 
