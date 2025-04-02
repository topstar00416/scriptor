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

  const [beatSheet, setBeatSheet] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch both project and beat sheet data
      const [projectResult, beatSheetResult] = await Promise.all([
        supabase
          .from('Project')
          .select('*')
          .eq('id', projectId)
          .single(),
        supabase
          .from('BeatSheet')
          .select('description')
          .eq('project_id', projectId)
      ])

      if (projectResult.error) {
        console.error('Error fetching project:', projectResult.error)
      } else {
        setProjectData(projectResult.data)
      }

      if (beatSheetResult.error) {
        console.error('Error fetching beat sheet:', beatSheetResult.error)
      } else {
        // Map the descriptions to an array
        const beats = beatSheetResult.data.map(item => item.description)

        setBeatSheet(beats)
      }
    }

    fetchData()
  }, [projectId, supabase])

  const handleRegenerate = async () => {
    try {
      setIsLoading(true)
      const result = await GenerateInfo(projectData, 'beatSheet')

      setBeatSheet(result.beatSheet)
      
      // First delete existing beats
      const { error: deleteError } = await supabase
        .from('BeatSheet')
        .delete()
        .eq('project_id', projectId)

      if (deleteError) throw deleteError

      // Then insert new beats
      await Promise.all(
        result.beatSheet.map(async (beat) => {
          const { error: insertError } = await supabase
            .from('BeatSheet')
            .insert({
              project_id: projectId,
              description: beat
            })

          if (insertError) throw insertError
        })
      )

      swal('Success', 'Beat sheet regenerated successfully', 'success')
    } catch (error) {
      console.error('Error regenerating beat sheet:', error)
      swal('Error', 'Failed to regenerate beat sheet', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { error } = await supabase
      .from('BeatSheet')
      .update({ description: beatSheet })
      .eq('project_id', projectId)

    if (error) {
      console.error('Error updating beat sheet:', error)
      swal('Error', 'Failed to update beat sheet', 'error')
    } else {
      swal('Success', 'Beat sheet updated successfully', 'success')
    }
  }

  const handleChange = (index: number, value: string) => {
    setBeatSheet(prevBeatSheet => {
      const updatedBeatSheet = [...prevBeatSheet]
      updatedBeatSheet[index] = value
      return updatedBeatSheet
    })
  }

  // Sort the beatSheet array
  const sortedBeatSheet = [...beatSheet].sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10)
    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10)

    return numA - numB
  })

  return (
    <div className='relative w-full h-full'>
      <Card className='w-full h-full'>
        <CardContent className='flex flex-col gap-6 h-full'>
          <form onSubmit={handleEdit}>
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
                  type='button'
                  startIcon={<i className='bx-magic-2' />}
                  disabled={isLoading}
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
            <Divider flexItem className='mt-4 mb-4' />
            <div className='relative'>
              {isLoading && (
                <div className='absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50'>
                  <CircularProgress />
                </div>
              )}
              <Grid container spacing={2} className='mt-4'>
                {sortedBeatSheet.map((beat, index) => (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label={`Beat ${index + 1}`}
                      name={`beat_${index + 1}`}
                      value={beat}
                      onChange={(e) => handleChange(index, e.target.value)}
                      disabled={isLoading}
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
