'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

import GenerateInfo from './generateScene'

const ProjectManager = () => {
  const [data, setData] = useState({
    scene: '',
    tone: '',
    length: '',
    position: ''
  })

  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      const generated = await GenerateInfo(data)

      setGeneratedContent(generated || '')
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Card className='w-full h-full'>
      <CardContent className='flex flex-col gap-6 h-full'>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h3'>Rewrite Tool</Typography>
            </div>
          </div>
          <Divider />
          <Grid container spacing={2} className='mt-4 mb-6'>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Scene Text'
                name='scene'
                value={data.scene}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Divider />
          <Grid container spacing={2} className='mt-4'>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label='Tone' name='tone' value={data.tone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label='Length' name='length' value={data.length} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label='Position' name='position' value={data.position} onChange={handleChange} />
            </Grid>
          </Grid>
          <Divider flexItem className='mt-4 mb-4' />
          <div className='flex items-center justify-end'>
            <Button type='submit' variant='tonal' color='primary' startIcon={<i className='bx-magic-2' />}>
              Rewrite Scene
            </Button>
          </div>
        </form>
        <Grid container spacing={2} className='mb-6'>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Generated Scene Text'
              name='Generated Scene Text'
              value={generatedContent}
              disabled={isLoading}
              InputProps={{
                endAdornment: isLoading && <CircularProgress size={20} />
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProjectManager
