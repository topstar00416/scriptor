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

  const [beatSheet, setBeatSheet] = useState<{ seq: number; description: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch both project and beat sheet data
      const [projectResult, beatSheetResult] = await Promise.all([
        supabase.from('Project').select('*').eq('id', projectId).single(),
        supabase.from('BeatSheet').select('seq, description').eq('project_id', projectId)
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
        const beats = beatSheetResult.data.map(item => ({
          seq: item.seq,
          description: item.description
        }))

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
      const { error: deleteError } = await supabase.from('BeatSheet').delete().eq('project_id', projectId)

      if (deleteError) throw deleteError

      // Then insert new beats
      await Promise.all(
        result.beatSheet.map(async beat => {
          const { error: insertError } = await supabase.from('BeatSheet').insert({
            project_id: projectId,
            seq: beat.seq,
            description: beat.description
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

    try {
      // Update each beat individually
      await Promise.all(
        beatSheet.map(async beat => {
          const { error } = await supabase
            .from('BeatSheet')
            .update({ description: beat.description })
            .eq('project_id', projectId)
            .eq('seq', beat.seq)

          if (error) throw error
        })
      )

      swal('Success', 'Beat sheet updated successfully', 'success')
    } catch (error) {
      console.error('Error updating beat sheet:', error)
      swal('Error', 'Failed to update beat sheet', 'error')
    }
  }

  const handleChange = (seq: number, value: string) => {
    setBeatSheet(prevBeatSheet => {
      return prevBeatSheet.map(beat => (beat.seq === seq ? { ...beat, description: value } : beat))
    })
  }

  // Sort the beatSheet array
  const sortedBeatSheet = [...beatSheet].sort((a, b) => {
    return a.seq - b.seq
  })

  return (
    <div className='relative w-full h-full'>
      <Card className='w-full h-full'>
        <CardContent className='flex flex-col gap-6 h-full'>
          <form onSubmit={handleEdit}>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <Typography variant='h3'>Beat Sheet</Typography>
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
                  startIcon={<i className='bx-edit' />}
                  className='ml-2'
                  disabled={isLoading}
                >
                  Save Changes
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
                {sortedBeatSheet.map((beat, index) => {
                  console.log(sortedBeatSheet)
                  return (
                    <Grid item xs={12} key={index}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={`Beat ${beat.seq}`}
                        name={`beat_${beat.seq}`}
                        value={beat.description}
                        onChange={e => handleChange(beat.seq, e.target.value)}
                        // disabled={isLoading}
                      />
                    </Grid>
                  )
                })}
              </Grid>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectManager
