'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

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

// Internal Imports
import { createClient } from '@configs/supabase'

const genres = ['Romance', 'Mystery', 'Sci-Fi', 'Drama', 'Comedy', 'Horror']
const tones = ['Light', 'Dark', 'Humorous', 'Serious', 'Mysterious']

const ProjectManager = () => {
  const router = useRouter()
  const supabase = createClient()


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
                >
                    Regenerate
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Scenes'
                name='scenes'
                // value={data.scenes}
                // onChange={handleChange}
                // disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProjectManager
