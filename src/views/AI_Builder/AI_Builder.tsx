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
  beatSheet: any[] // from BeatSheet table
  scenes: any[] // from Scene table
  logline: string // from Logline table
}

interface BeatSheetData {
  id: string
  project_id: string
  description: string
}

interface SceneData {
  id: string
  project_id: string
  description: string
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
    beatSheet: [],
    scenes: [],
    logline: ''
  })

  // States
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('Project')
        .select(`
          *,
          BeatSheet (*),
          Scene (*),
          Logline (*)
        `)
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
      } else {
        setProjectData({
          beatSheet: data?.BeatSheet.map((item: BeatSheetData) => item.description)  || [],
          scenes: data?.Scene.map((item: SceneData) => item.description) || [],
          logline: data?.Logline[0].description || ''
        })
      }
    }

    fetchProject()
  }, [projectId, supabase])

  // Functions
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
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'beat_sheet' && <BeatSheet beatSheet={projectData.beatSheet}/>}
            {activeTab === 'scenes' && <Scenes scenes={projectData.scenes}/>}
            {activeTab === 'rewrite' && <Rewrite />}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AccountSettings
