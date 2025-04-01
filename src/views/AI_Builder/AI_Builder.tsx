'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@configs/supabase'
import OpenAI from 'openai'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import Overview from './Overview/page'
import BeatSheet from './BeatSheet/page'
import Scenes from './Scenes/page'
import Rewrite from './Rewrite/page'

interface ProjectData {
  title: string
  tone: string
  genre: string
  concept: string
}

interface GeneratedContent {
  logline: string
  beatSheet: string[]
  scenes: string[]
}

const AccountSettings = () => {
  const params = useParams()
  const supabase = createClient()

  const projectId = params.id as string

  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    tone: '',
    genre: '',
    concept: ''
  })

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    logline: '',
    beatSheet: [],
    scenes: []
  })

  const [openai, setOpenai] = useState<OpenAI | null>(null)

  // States
  const [activeTab, setActiveTab] = useState('overview')
  const [tabContentList, setTabContentList] = useState({
    overview: <Overview logline = {generatedContent.logline}/>,
    beat_sheet: <BeatSheet beatSheet = {generatedContent.beatSheet}/>,
    scenes: <Scenes scenes = {generatedContent.scenes}/>,
    rewrite: <Rewrite />,
  })

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

  useEffect(() => {
    setOpenai(new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    }))
  }, [])

  const systemPrompt = `
    Create a detailed logline, beat sheets, and scene outlines based on the provided title, tone, genre, and concept of a film script. Use each element to inform the structure and content of the outlines, ensuring that the logline succinctly captures the essence of the film, while the beat sheets outline the major plot points and the scenes provide detailed descriptions of specific moments in the story. 

    ## Steps
    - Start by formulating a compelling logline that summarizes the film's premise in one to two sentences. 
    - Next, create a beat sheet that outlines the key events and turning points of the film. Aim for around 10-15 major beats. 
    - Finally, generate a list of scene descriptions that detail particular moments in the story, including character actions, dialogues, and essential settings. It's important to align these scenes with the previously defined beats. 

    ## Output Format
    - Logline: [Your logline here]
    - Beat Sheet: 
      1. [Beat 1 description here]
      2. [Beat 2 description here]
      ...
    - Scene Outlines: 
      - Scene 1: [Description of scene 1]
      - Scene 2: [Description of scene 2]
      ...

    ## Examples
    1. Title: 'The Last Voyage'
      Tone: Dark and suspenseful
      Genre: Thriller
      Concept: A group of friends on a sailing trip find themselves lost at sea during a storm with a hidden danger lurking.

      Logline: A group of friends on a sailing trip must survive when they are lost at sea during a storm, and a mysterious presence threatens their lives.

      Beat Sheet: 
      1. Introduction of the friends and their carefree dynamics.
      2. Onset of the storm and losing contact with the mainland...
      3. [And so forth]

    2. Title: 'Love Unbound'
      Tone: Romantic and heartwarming
      Genre: Romantic Comedy
      Concept: Two rival bakers must team up to save their shops but end up falling for each other. 

      Logline: Two competitive bakers must join forces to save their dying shops, unexpectedly discovering love along the way.

      Beat Sheet: 
      1. Introduction of the rivalry and low points for both bakers. 
      2. Circumstance forces them to collaborate...
      3. [And so forth] 

    ## Notes
    - Ensure that the generated content is cohesive and reflects the provided tone, genre, and concept accurately.
    - Focus on creating engaging and creative content that can be utilized for further film script development.
  `

  const generateBeatSheet = async () => {
    if (!openai) return

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Title: ${projectData.title}\nTone: ${projectData.tone}\nGenre: ${projectData.genre}\nConcept: ${projectData.concept}` },
      ],
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Extract logline
    const loglineMatch = content.match(/Logline: (.*?)(?=\n|$)/)
    const logline = loglineMatch ? loglineMatch[1].trim() : ''

    // Extract beat sheet
    const beatSheetMatch = content.match(/Beat Sheet:([\s\S]*?)(?=Scene Outlines:|$)/)
    const beatSheet = beatSheetMatch
      ? beatSheetMatch[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
      : []

    // Extract scenes
    const scenesMatch = content.match(/Scene Outlines:([\s\S]*?)$/)
    const scenes = scenesMatch
      ? scenesMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('- Scene'))
          .map(line => line.replace(/^-\s*Scene \d+:\s*/, '').trim())
      : []

    setGeneratedContent({
      logline,
      beatSheet,
      scenes
    })
  }

  useEffect(() => {
    generateBeatSheet()
  }, [projectData])

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab label='Overview' icon={<i className='bx-grid-alt' />} iconPosition='start' value='overview' />
            <Tab label='Beat Sheet' icon={<i className='bx-list-ul' />} iconPosition='start' value='beat_sheet' />
            <Tab label='Scenes' icon={<i className='bx-movie-play' />} iconPosition='start' value='scenes' />
            <Tab label='Rewrite Tool' icon={<i className='bx-edit-alt' />} iconPosition='start' value='rewrite' />
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab as keyof typeof tabContentList]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AccountSettings
