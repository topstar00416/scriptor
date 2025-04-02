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
import CircularProgress from '@mui/material/CircularProgress'

// Internal Imports
import { createClient } from '@configs/supabase'
import GenerateInfo from '@views/Dashboard/Generate_info'

const ProjectManager = (props: { beatSheet: string[] }) => {
  const router = useRouter()
  const supabase = createClient()
  const params = useParams()

  const [projectData, setProjectData] = useState({
    title: '',
    genre: '',
    tone: '',
    concept: ''
  })

  const projectId = params.id as string

  useEffect(() => {
    const fetchProject = async () => {
      const { data: projectData, error } = await supabase
        .from('Project')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
      } else {
        setProjectData(projectData)
      }
    }

    fetchProject()
  }, [projectId, supabase])

  // Add state for beatSheet
  const [beatSheet, setBeatSheet] = useState(props.beatSheet)

  // Add loading state
  const [isLoading, setIsLoading] = useState(false)

  const handleRegenerate = async () => {
    try {
      setIsLoading(true)
      const result = await GenerateInfo(projectData, 'beatSheet')
      setBeatSheet(result.beatSheet)
      
      // Update in database (assuming you have a BeatSheet table)
      const { error } = await supabase
        .from('BeatSheet')
        .update({ description: result.beatSheet })
        .eq('project_id', projectId)

      if (error) throw error
      swal('Success', 'Beat sheet regenerated successfully', 'success')
    } catch (error) {
      console.error('Error regenerating beat sheet:', error)
      swal('Error', 'Failed to regenerate beat sheet', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Sort the beatSheet array
  const sortedBeatSheet = [...props.beatSheet].sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10)
    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10)
    return numA - numB
  })

  return (
    <Card className='w-full h-full'>
      <CardContent className='flex flex-col gap-6 h-full'>
        <form>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h3'>
                Beat Sheet
              </Typography>
            </div>
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
                    onClick={handleRegenerate}
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
          <Grid container spacing={2} className='mt-4'>
            {isLoading ? (
              <Grid item xs={12} className='flex justify-center items-center min-h-[200px]'>
                <CircularProgress />
              </Grid>
            ) : (
              sortedBeatSheet.map((beat, index) => (
                <Grid item xs={12} key={index}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={`Beat ${index + 1}`}
                    name={`beat_${index + 1}`}
                    value={beat}
                  />
                </Grid>
              ))
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProjectManager
