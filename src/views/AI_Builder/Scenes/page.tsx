'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
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

// Internal Imports
import { createClient } from '@configs/supabase'
import GenerateInfo from '@views/Dashboard/Generate_info'

const ProjectManager = (props: { scenes: string[] }) => {
  const router = useRouter()
  const supabase = createClient()

  // Add state for scenes
  const [scenes, setScenes] = useState(props.scenes)

  const params = useParams()

  const projectId = params.projectId as string

  const handleRegenerate = async () => {
    try {
      const { data: projectData } = await supabase
        .from('Project')
        .select('*')
        .eq('id', projectId)
        .single()

      const result = await GenerateInfo(projectData, 'scenes')
      setScenes(result.scenes)
      
      // Update in database (assuming you have a Scenes table)
      const { error } = await supabase
        .from('Scenes')
        .update({ scenes: result.scenes })
        .eq('project_id', projectId)

      if (error) throw error
      swal('Success', 'Scenes regenerated successfully', 'success')
    } catch (error) {
      console.error('Error regenerating scenes:', error)
      swal('Error', 'Failed to regenerate scenes', 'error')
    }
  }

  useEffect(() => {
  }, [])

  return (
    <Card className='w-full h-full'>
      <CardContent className='flex flex-col gap-6 h-full'>
        <form>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h3'>
                Scenes
              </Typography>
            </div>
            <div className='flex'>
                <Button
                    type='submit'
                    variant='tonal'
                    color='primary'
                    startIcon={<i className='bx-magic-2' />}
                    onClick={handleRegenerate}
                >
                    Regenerate
                </Button>
                <Button
                    type='submit'
                    variant='tonal'
                    color='primary'
                    startIcon={<i className='bx-magic-2' />}
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
          <Grid container spacing={2} className='mt-4'>
            {
              scenes.map((scene, index) => (
                <Grid item xs={12} key={index}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={`Scene ${index + 1}`}
                    name={`scene_${index + 1}`}
                    value={scene}
                  />
                </Grid>
              ))
            }
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProjectManager
