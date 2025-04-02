'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// External Imports
import swal from 'sweetalert'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Internal Imports
import { createClient } from '@configs/supabase'
import GenerateInfo from '@views/Dashboard/Generate_info'

const ProjectManager = () => {
  const router = useRouter()
  const supabase = createClient()
  const params = useParams()

  const projectId = params.id as string

  const [projectData, setProjectData] = useState({
    title: '',
    genre: '',
    tone: '',
    concept: ''
  })

  const [scenes, setScenes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch both project and scenes data
      const [projectResult, scenesResult] = await Promise.all([
        supabase
          .from('Project')
          .select('*')
          .eq('id', projectId)
          .single(),
        supabase
          .from('Scene')
          .select('description')
          .eq('project_id', projectId)
      ])

      if (projectResult.error) {
        console.error('Error fetching project:', projectResult.error)
      } else {
        setProjectData(projectResult.data)
      }

      if (scenesResult.error) {
        console.error('Error fetching scenes:', scenesResult.error)
      } else {
        // Map the descriptions to an array
        const scenesList = scenesResult.data.map(item => item.description)

        setScenes(scenesList)
      }
    }

    fetchData()
  }, [projectId, supabase])

  const handleRegenerate = async () => {
    try {
      setIsLoading(true)
      console.log('123123123131231231')
      const result = await GenerateInfo(projectData, 'scenes')
      
      // First delete existing scenes
      const { error: deleteError } = await supabase
        .from('Scene')
        .delete()
        .eq('project_id', projectId)

      if (deleteError) throw deleteError

      // Then insert new scenes
      await Promise.all(
        result.scenes.map(async (scene) => {
          const { error: insertError } = await supabase
            .from('Scene')
            .insert({
              project_id: projectId,
              description: scene
            })
            
          if (insertError) throw insertError
        })
      )

      setScenes(result.scenes)
      swal('Success', 'Scenes regenerated successfully', 'success')
    } catch (error) {
      console.error('Error regenerating scenes:', error)
      swal('Error', 'Failed to regenerate scenes', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='relative w-full h-full'>
      <Card className='w-full h-full'>
        <CardContent className='flex flex-col gap-6 h-full'>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <Typography variant='h3'>
                  Scenes
                </Typography>
              </div>
              <div className='flex'>
                <Button
                  onClick={handleRegenerate}
                  variant='tonal'
                  color='primary'
                  startIcon={<i className='bx-magic-2' />}
                  disabled={isLoading}
                >
                  Regenerate
                </Button>
                <Button
                  type='button'
                  variant='tonal'
                  color='primary'
                  startIcon={<i className='bx-magic-2' />}
                  className='ml-2'
                >
                  Edit
                </Button>
                <Button
                  variant='tonal'
                  color='error'
                  startIcon={<i className='bx-arrow-back' />}
                  onClick={() => router.push('/home')}
                  className='ml-2'
                >
                  Back
                </Button>
              </div>
            </div>
            <Divider flexItem className='mt-4 mb-4' />
            <div className='relative'>
              <Grid container spacing={2} className='mt-4'>
                {scenes.map((scene, index) => (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label={`Scene ${index + 1}`}
                      name={`scene_${index + 1}`}
                      value={scene}
                      disabled={isLoading}
                      InputProps={{
                        endAdornment: isLoading && (
                          <CircularProgress size={20} />
                        )
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectManager
