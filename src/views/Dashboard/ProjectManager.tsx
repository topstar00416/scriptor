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
import ImageUpload from './ImageUpload'
import GenerateInfo from './Generate_info'

const genres = ['Romance', 'Mystery', 'Sci-Fi', 'Drama', 'Comedy', 'Horror']
const tones = ['Light', 'Dark', 'Humorous', 'Serious', 'Mysterious']

interface ProjectManagerProps {
  mode: 'create' | 'edit' | 'show'
  projectId?: string
}

interface GeneratedContent {
  logline: string
  beatSheet: string[]
  scenes: string[]
}

const ProjectManager = ({ mode, projectId }: ProjectManagerProps) => {
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState({
    title: '',
    genre: '',
    tone: '',
    concept: '',
    imageUrl: ''
  })

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    logline: '',
    beatSheet: [],
    scenes: []
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        const { data: projectData, error } = await supabase.from('Project').select('*').eq('id', projectId).single()

        if (error) {
          console.error('Error fetching project:', error)
          await swal({
            title: 'Error!',
            text: 'Failed to fetch project data',
            icon: 'error'
          })
        } else if (projectData) {
          setData(projectData)

          // Set preview URL if there's an existing image
          if (projectData.imageUrl) {
            setPreviewUrl(projectData.imageUrl)
          }
        }
      }

      fetchProject()
    }
  }, [projectId, mode, supabase])

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const isReadOnly = mode === 'show'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const willCreate = await swal({
      title: mode === 'edit' ? 'Update Project?' : 'Create Project',
      text: `Are you sure you want to ${mode === 'edit' ? 'update' : 'create'} this project?`,
      icon: 'warning',
      buttons: ['Cancel', 'Yes'],
      dangerMode: true
    })

    if (willCreate) {
      try {
        swal({
          title: mode === 'edit' ? 'Updating project...' : 'Creating project...',
          text: 'Please wait...',
          icon: 'info',
          closeOnClickOutside: false
        })

        let imageUrl = data.imageUrl

        if (selectedImage) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('scriptor')
            .upload(`${Date.now()}-${selectedImage.name}`, selectedImage)

          if (uploadError) throw uploadError

          const { data: publicUrlData } = supabase.storage.from('scriptor').getPublicUrl(uploadData.path)

          imageUrl = publicUrlData.publicUrl
        }

        const submitData = {
          ...data,
          imageUrl
        }

        if (mode === 'edit') {
          const { error } = await supabase.from('Project').update(submitData).eq('id', projectId)

          if (error) throw error

          await swal({
            title: 'Success!',
            text: 'Project updated successfully',
            icon: 'success'
          })
          router.push('/home')
        } else if (mode === 'create') {
          const { data: newProject, error } = await supabase.from('Project').insert(submitData).select().single()

          if (error) throw error

          await swal({
            title: 'Success!',
            text: 'Project created successfully',
            icon: 'success'
          })

          GenerateInfo(submitData, setGeneratedContent)

          generatedContent.beatSheet.map(async (item) => {
            const { data: newBeatSheet, error: newBeatSheetError } = await supabase.from('BeatSheet').insert({
              projectId: newProject.id,
              beatSheet: item
            })

            if (newBeatSheetError) throw newBeatSheetError
          })

          generatedContent.scenes.map(async (item) => {
            const { data: newScene, error: newSceneError } = await supabase.from('Scene').insert({
              projectId: newProject.id,
              scene: item
            })

            if (newSceneError) throw newSceneError
          })

          const { data: loglinedata, error: loglineError } = await supabase.from('Logline').insert({
            projectId: newProject.id,
            logline: generatedContent.logline
          })

          if (loglineError) throw loglineError

          router.push(`/home/builder/${newProject.id}`)
        }
      } catch (error) {
        console.error('Error:', error)
        await swal({
          title: 'Error!',
          text: mode === 'edit' ? 'Error updating project' : 'Error creating project',
          icon: 'error'
        })
      }
    }
  }

  return (
    <Card className='w-full h-full'>
      <CardContent className='flex flex-col gap-6 h-full'>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <Typography variant='h3'>
                {mode === 'edit' ? 'Edit Project' : mode === 'create' ? 'Create Project' : data.title}
              </Typography>
            </div>
          </div>
          <Divider />
          <Grid container spacing={2} className='mt-4'>
            <Grid item xs={12} md={7}>
              <ImageUpload onImageSelect={handleImageSelect} previewUrl={previewUrl} isReadOnly={isReadOnly} />
            </Grid>
            <Divider orientation='vertical' flexItem className='pl-3' />
            <Grid item xs={12} md={4.88} className='pl-3 space-y-5'>
              <TextField
                fullWidth
                label='Title'
                name='title'
                value={data.title}
                onChange={handleChange}
                disabled={isReadOnly}
              />
              <TextField
                fullWidth
                select
                label='Genre'
                name='genre'
                value={data.genre}
                onChange={handleChange}
                disabled={isReadOnly}
              >
                {genres.map(genre => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label='Tone'
                name='tone'
                value={data.tone}
                onChange={handleChange}
                disabled={isReadOnly}
              >
                {tones.map(tone => (
                  <MenuItem key={tone} value={tone}>
                    {tone}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Concept'
                name='concept'
                value={data.concept}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
          <Divider flexItem className='mt-4 mb-4' />
          <div className='flex justify-end'>
            {mode !== 'show' && (
              <Button
                type='submit'
                variant='tonal'
                color='primary'
                startIcon={mode === 'edit' ? <i className='bx-edit-alt' /> : <i className='bx-plus' />}
              >
                {mode === 'edit' ? 'Update' : 'Create'}
              </Button>
            )}
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
