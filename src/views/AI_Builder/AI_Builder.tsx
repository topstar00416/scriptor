'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

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

const AccountSettings = () => {
  // States
  const [activeTab, setActiveTab] = useState('overview')
  const [tabContentList, setTabContentList] = useState({
    overview: <Overview />,
    beat_sheet: <BeatSheet />,
    scenes: <Scenes />,
    rewrite: <Rewrite />,
  })

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
