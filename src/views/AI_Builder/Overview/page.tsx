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
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Internal Imports
import { createClient } from '@configs/supabase'
import GenerateInfo from '@views/Dashboard/Generate_info'

const genres = ['Romance', 'Mystery', 'Sci-Fi', 'Drama', 'Comedy', 'Horror']
const tones = ['Light', 'Dark', 'Humorous', 'Serious', 'Mysterious']

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

  const [logline, setLogline] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      // Fetch both project and logline data
      const [projectResult, loglineResult] = await Promise.all([
        supabase
          .from('Project')
          .select('*')
          .eq('id', projectId)
          .single(),
        supabase
          .from('Logline')
          .select('description')
          .eq('project_id', projectId)
          .single()
      ])

      if (projectResult.error) {
        console.error('Error fetching project:', projectResult.error)
      } else {
        setProjectData(projectResult.data)
      }

      if (loglineResult.error) {
        console.error('Error fetching logline:', loglineResult.error)
      } else {
        setLogline(loglineResult.data.description)
      }
    }

    fetchProject()
  }, [projectId, supabase])
  

  const handleLoglineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogline(event.target.value)
  }

  const handleRegenerate = async () => {
    try {
      setIsLoading(true)
      const result = await GenerateInfo(projectData, 'logline')
      
      setLogline(result.logline)
      
      // Update in database
      const { error } = await supabase
        .from('Logline')
        .update({ description: result.logline })
        .eq('project_id', projectId)

      if (error) throw error
      swal('Success', 'Logline regenerated successfully', 'success')
    } catch (error) {
      console.error('Error regenerating logline:', error)
      swal('Error', 'Failed to regenerate logline', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { error } = await supabase
      .from('Logline')
      .update({ description: logline })
      .eq('project_id', projectId)

    if (error) {
      console.error('Error updating logline:', error)
      swal('Error', 'Failed to update logline', 'error')
    } else {
      swal('Success', 'Logline updated successfully', 'success')
    }
  }

  return (
    <Card className='w-full h-full'>
      <CardContent className='flex flex-col gap-6 h-full'>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h3'>
                Project Overview
              </Typography>
            </div>
          </div>
          <Divider />
          <Grid container spacing={2} className='mt-4'>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Title'
                name='title'
                value={projectData.title}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label='Genre'
                name='genre'
                value={projectData.genre}
              >
                {genres.map(genre => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label='Tone'
                name='tone'
                value={projectData.tone}
              >
                {tones.map(tone => (
                  <MenuItem key={tone} value={tone}>
                    {tone}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2} className='mt-4'>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Concept'
                name='concept'
                value={projectData.concept}
              />
            </Grid>
          </Grid>
          <Divider flexItem className='mt-4 mb-4' />
          <div className='flex items-center justify-between'>
            <Typography variant='h3' className='flex items-center gap-2'>
              Logline
            </Typography>
            <div className='flex'>
              <Button
                onClick={handleRegenerate}
                variant='tonal'
                color='primary'
                startIcon={<i className='bx-magic-2' />}
              >
                Regenerate
              </Button>
              <Button
                type='submit'
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
          <Grid container spacing={2} className='mt-4'>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Logline'
                name='logline'
                value={logline}
                onChange={handleLoglineChange}
                disabled={isLoading}
                InputProps={{
                  endAdornment: isLoading && (
                    <CircularProgress size={20} />
                  )
                }}
              />
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProjectManager
