'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// External Imports
import swal from 'sweetalert'
import jsPDF from 'jspdf'

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

interface Scene {
  seq: number
  name: string
  description: string
}

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

  const [scenes, setScenes] = useState<Scene[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [projectResult, scenesResult] = await Promise.all([
        supabase.from('Project').select('*').eq('id', projectId).single(),
        supabase.from('Scene').select('seq, name, description').eq('project_id', projectId)
      ])

      if (projectResult.error) {
        console.error('Error fetching project:', projectResult.error)
      } else {
        setProjectData(projectResult.data)
      }

      if (scenesResult.error) {
        console.error('Error fetching scenes:', scenesResult.error)
      } else {
        setScenes(scenesResult.data)
      }
    }

    fetchData()
  }, [projectId, supabase])

  const handleRegenerate = async () => {
    try {
      setIsLoading(true)
      const result = await GenerateInfo(projectData, 'scenes')

      // First delete existing scenes
      const { error: deleteError } = await supabase.from('Scene').delete().eq('project_id', projectId)

      if (deleteError) throw deleteError

      // Format scenes with sequence numbers
      const newScenes = result.scenes.map((scene, index) => ({
        seq: index + 1,
        name: scene.name,
        description: scene.description
      }))

      // Then insert new scenes
      await Promise.all(
        newScenes.map(async scene => {
          const { error: insertError } = await supabase.from('Scene').insert({
            project_id: projectId,
            seq: scene.seq,
            name: scene.name,
            description: scene.description
          })

          if (insertError) throw insertError
        })
      )

      // Only set state after successful database operation
      setScenes(newScenes)
      swal('Success', 'Scenes regenerated successfully', 'success')
    } catch (error) {
      console.error('Error regenerating scenes:', error)
      swal('Error', 'Failed to regenerate scenes', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsLoading(true)
      await Promise.all(
        scenes.map(async scene => {
          const { error } = await supabase
            .from('Scene')
            .update({
              name: scene.name,
              description: scene.description
            })
            .eq('project_id', projectId)
            .eq('seq', scene.seq)

          if (error) throw error
        })
      )

      swal('Success', 'Scenes updated successfully', 'success')
    } catch (error) {
      console.error('Error updating scenes:', error)
      swal('Error', 'Failed to update scenes', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (seq: number, value: string) => {
    setScenes(prevScenes => {
      return prevScenes.map(scene => {
        if (scene.seq === seq) {
          const [name, ...descriptionParts] = value.split('\n')

          return {
            ...scene,
            name: name.replace(':', '').trim(),
            description: descriptionParts.join('\n').trim()
          }
        }

        return scene
      })
    })
  }

  // Sort the scenes array
  const sortedScenes = [...scenes].sort((a, b) => a.seq - b.seq)

  const handleExportPDF = () => {
    try {
      setIsLoading(true)

      // Create a new jsPDF instance
      const doc = new jsPDF()

      // Set initial position
      let yPos = 20

      // Set default font
      doc.setFont('helvetica')
      doc.setFontSize(18)

      // Add title (centered)
      doc.text(`Scene List: ${projectData.title}`, 105, yPos, { align: 'center' })
      yPos += 15

      // Add project info with proper multi-line handling
      doc.setFontSize(12)

      // Handle multi-line concept text
      const conceptLines = doc.splitTextToSize(`Concept: ${projectData.concept}`, 180)

      // Genre and tone (single line)
      doc.text(`Genre: ${projectData.genre}`, 14, yPos)
      yPos += 8
      doc.text(`Tone: ${projectData.tone}`, 14, yPos)
      yPos += 8

      // Concept (multi-line)
      doc.text(conceptLines, 14, yPos)
      yPos += conceptLines.length * 7 + 7 // Adjust spacing based on number of lines

      // Add scenes header
      doc.setFontSize(14)
      doc.text('Scenes:', 14, yPos)
      yPos += 10

      // Process each scene
      doc.setFontSize(12)

      sortedScenes.forEach(scene => {
        // Add scene number and name (bold)
        doc.setFont('helvetica', 'bold')
        const sceneTitle = `Scene ${scene.seq}: ${scene.name}`

        doc.text(sceneTitle, 14, yPos)

        // Add scene description (normal) with multi-line support
        doc.setFont('helvetica', 'normal')
        const descriptionLines = doc.splitTextToSize(scene.description, 180)

        doc.text(descriptionLines, 20, yPos + 7)

        // Move position down based on number of lines
        yPos += Math.max(descriptionLines.length * 7, 15) + 10 // Ensure minimum spacing

        // Add new page if we're near the bottom
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }
      })

      // Save the PDF
      doc.save(`Scenes_${projectData.title.replace(/\s+/g, '_')}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      swal('Error', 'Failed to generate PDF', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='relative w-full h-full'>
      <Card className='w-full h-full'>
        <CardContent className='flex flex-col gap-6 h-full'>
          <form onSubmit={handleEdit}>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <Typography variant='h3'>Scenes</Typography>
              </div>
              <div className='flex'>
                <Button
                  onClick={handleRegenerate}
                  variant='tonal'
                  color='primary'
                  type='button'
                  startIcon={<i className='bx bx-refresh' />}
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
                  onClick={handleExportPDF}
                  variant='tonal'
                  color='secondary'
                  startIcon={<i className='bx bx-download' />}
                  className='ml-2'
                  disabled={isLoading}
                >
                  Export PDF
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
                {sortedScenes.map(scene => (
                  <Grid item xs={12} key={scene.seq}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label={`Scene ${scene.seq}`}
                      name={`scene_${scene.seq}`}
                      value={`${scene.name}:\n${scene.description}`}
                      onChange={e => handleChange(scene.seq, e.target.value)}
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
