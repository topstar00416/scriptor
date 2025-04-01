'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@configs/supabase'

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
  beatSheet: any[] // from BeatSheet table
  scenes: any[] // from Scene table
  logline: string // from Logline table
}

interface BeatSheetData {
  id: string
  projectId: string
  beatSheet: string
}

interface SceneData {
  id: string
  projectId: string
  scene: string
}

interface LoglineData {
  id: string
  projectId: string
  logline: string
}

const AccountSettings = () => {
  const params = useParams()
  const supabase = createClient()

  const projectId = params.id as string

  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    tone: '',
    genre: '',
    concept: '',
    beatSheet: [],
    scenes: [],
    logline: ''
  })

  // States
  const [activeTab, setActiveTab] = useState('overview')
  const [tabContentList, setTabContentList] = useState({
    overview: <Overview logline={projectData.logline}/>,
    beat_sheet: <BeatSheet beatSheet={projectData.beatSheet}/>,
    scenes: <Scenes scenes={projectData.scenes}/>,
    rewrite: <Rewrite />,
  })

  useEffect(() => {
    const fetchProject = async () => {
      const { data: projectData, error } = await supabase
        .from('Project')
        .select('*')
        .eq('id', projectId)
        .single()

      const { data: beatSheetData, error: beatSheetError } = await supabase
        .from('BeatSheet')
        .select('*')
        .eq('projectId', projectId)

      const { data: sceneData, error: sceneError } = await supabase
        .from('Scene')
        .select('*')
        .eq('projectId', projectId)
      
      const { data: loglineData, error: loglineError } = await supabase
        .from('Logline')
        .select('*')
        .eq('projectId', projectId)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
      } else {
        setProjectData({
          ...projectData,
          beatSheet: beatSheetData?.map(item => item.beatSheet) || [],
          scenes: sceneData?.map(item => item.scene) || [],
          logline: loglineData?.logline || ''
        })
      }
    }

    fetchProject()
  }, [projectId, supabase])
  
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
