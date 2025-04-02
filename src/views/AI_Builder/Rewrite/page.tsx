'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'

const genres = ['Romance', 'Mystery', 'Sci-Fi', 'Drama', 'Comedy', 'Horror']
const tones = ['Light', 'Dark', 'Humorous', 'Serious', 'Mysterious']

const ProjectManager = () => {
  const router = useRouter()

  useEffect(() => {
  }, [])

  return (
    <Card className='w-full h-full'>
      <CardContent className='flex flex-col gap-6 h-full'>
        <form>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h3'>
                Rewrite Tool
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

                // value={data.title}
                // onChange={handleChange}
                // disabled={isReadOnly}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label='Genre'
                name='genre'

                // value={data.genre}
                // onChange={handleChange}
                // disabled={isReadOnly}
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

                // value={data.tone}
                // onChange={handleChange}
                // disabled={isReadOnly}
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
                
                // value={data.concept}
                // onChange={handleChange}
                // disabled={isReadOnly}
              />
            </Grid>
          </Grid>
          <Divider flexItem className='mt-4 mb-4' />
          <div className='flex items-center justify-end'>
              <Button
                type='submit'
                variant='tonal'
                color='primary'
                startIcon={<i className='bx-magic-2' />}
              >
                Rewrite Scene
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
        </form>
      </CardContent>
    </Card>
  )
}

export default ProjectManager
