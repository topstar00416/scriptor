'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import Slider from '@mui/material/Slider'
import InputLabel from '@mui/material/InputLabel'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Zoom from '@mui/material/Zoom'
import Menu from '@mui/material/Menu'
import ColorLens from '@mui/icons-material/ColorLens'
import FormatSize from '@mui/icons-material/FormatSize'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'

// Internal Imports
import { createClient } from '@configs/supabase'
import type { ThemeColor } from '@core/types'

const chipColor: ThemeColor[] = ['primary', 'success', 'error', 'warning', 'info']

// Script formatting options
const scriptElements = [
  { type: 'scene', label: 'Scene Heading', icon: 'bx-movie', format: 'INT. LOCATION - DAY' },
  { type: 'action', label: 'Action', icon: 'bx-run', format: 'Action description...' },
  { type: 'character', label: 'Character', icon: 'bx-user', format: 'CHARACTER' },
  { type: 'dialogue', label: 'Dialogue', icon: 'bx-message-square', format: 'Dialogue text...' },
  { type: 'parenthetical', label: 'Parenthetical', icon: 'bx-parentheses', format: '(emotion/action)' },
  { type: 'transition', label: 'Transition', icon: 'bx-transfer', format: 'CUT TO:' }
]

// Text formatting options
const textFormattingTools = [
  { type: 'bold', label: 'Bold', icon: 'bx-bold' },
  { type: 'italic', label: 'Italic', icon: 'bx-italic' },
  { type: 'underline', label: 'Underline', icon: 'bx-underline' },
  { type: 'alignLeft', label: 'Align Left', icon: 'bx-align-left' },
  { type: 'alignCenter', label: 'Align Center', icon: 'bx-align-middle' },
  { type: 'alignRight', label: 'Align Right', icon: 'bx-align-right' }
]

// Page formatting options
const pageFormattingTools = [
  { type: 'margin', label: 'Margins', icon: 'bx-border-all' },
  { type: 'orientation', label: 'Orientation', icon: 'bx-rotate-right' },
  { type: 'size', label: 'Page Size', icon: 'bx-expand' },
  { type: 'zoom', label: 'Zoom', icon: 'bx-zoom-in' }
]

// Font families
const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica'
]

// Font sizes (in pt)
const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]

// Text colors
const textColors = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#808080', // Gray
]

interface Page {
  content: string;
  id: string;
}

interface EnhancedScriptWriterProps {
  projectId: string
}

const EnhancedScriptWriter = ({ projectId }: EnhancedScriptWriterProps) => {
  const router = useRouter()
  const supabase = createClient()
  const editorRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)
  const [currentElement, setCurrentElement] = useState('scene')
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showPageSettings, setShowPageSettings] = useState(false)
  const [pageSettings, setPageSettings] = useState({
    marginTop: 2.54,
    marginBottom: 2.54,
    marginLeft: 3.17,
    marginRight: 3.17
  })
  const [fontMenuAnchor, setFontMenuAnchor] = useState<null | HTMLElement>(null)
  const [sizeMenuAnchor, setSizeMenuAnchor] = useState<null | HTMLElement>(null)
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(null)
  const [currentFont, setCurrentFont] = useState('Arial')
  const [currentSize, setCurrentSize] = useState(12)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [pages, setPages] = useState<Page[]>([{ content: '', id: '1' }])
  const [currentPage, setCurrentPage] = useState(0)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from('Project').select('*').eq('id', projectId).single()

        if (error) throw error

        setProjectData(data)

        // Fetch existing script if any
        const { data: scriptData } = await supabase
          .from('Script')
          .select('content')
          .eq('project_id', projectId)
          .single()

        if (scriptData) {
          // Handle script data
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId, supabase])

  const handleSave = async () => {
    try {
      setIsLoading(true)

      // Upsert the script content
      const { error } = await supabase
        .from('Script')
        .upsert({
          project_id: projectId,
          content: '',
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Show success message
      alert('Script saved successfully!')
    } catch (error) {
      console.error('Error saving script:', error)
      alert('Error saving script. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormat = (type: string) => {
    const element = scriptElements.find(el => el.type === type)
    if (!element || !editorRef.current) return

    setCurrentElement(type)
    
    // Get current selection
    const selection = window.getSelection()
    if (!selection?.rangeCount) return
    
    const range = selection.getRangeAt(0)
    const currentBlock = range.commonAncestorContainer.parentElement
    
    // Create new block with appropriate class
    const newBlock = document.createElement('div')
    newBlock.className = type // This will apply our CSS classes (scene-heading, character, etc.)
    
    // If there's existing text selected, use that, otherwise use the format template
    if (selection.toString().trim()) {
      newBlock.textContent = selection.toString()
    } else {
      newBlock.textContent = element.format
    }
    
    // Replace or insert the new block
    if (currentBlock && currentBlock !== editorRef.current) {
      currentBlock.replaceWith(newBlock)
    } else {
      editorRef.current.appendChild(newBlock)
    }
    
    // Move cursor to end of new block
    const newRange = document.createRange()
    newRange.selectNodeContents(newBlock)
    newRange.collapse(false)
    selection.removeAllRanges()
    selection.addRange(newRange)
  }

  const handleTextFormat = (type: string) => {
    if (!editorRef.current) return
    document.execCommand(type, false)
  }

  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number)
  }

  const handleFontChange = (font: string) => {
    setCurrentFont(font)
    if (editorRef.current) {
      document.execCommand('fontName', false, font)
    }
    setFontMenuAnchor(null)
  }

  const handleSizeChange = (size: number) => {
    setCurrentSize(size)
    if (editorRef.current) {
      document.execCommand('fontSize', false, size.toString())
    }
    setSizeMenuAnchor(null)
  }

  const handleColorChange = (color: string) => {
    setCurrentColor(color)
    if (editorRef.current) {
      document.execCommand('foreColor', false, color)
    }
    setColorMenuAnchor(null)
  }

  // Calculate pages based on content height
  const calculatePages = (content: string) => {
    const tempDiv = document.createElement('div')
    tempDiv.style.width = '6.5in' // 8.5in - 2in padding
    tempDiv.style.fontFamily = 'Courier New'
    tempDiv.style.fontSize = '12pt'
    tempDiv.style.lineHeight = '1.2'
    tempDiv.style.position = 'absolute'
    tempDiv.style.visibility = 'hidden'
    tempDiv.innerHTML = content
    document.body.appendChild(tempDiv)

    const contentHeight = tempDiv.offsetHeight
    const pageHeight = 9 // 11in - 2in padding, in inches
    const linesPerPage = Math.floor((pageHeight * 72) / 12) // 72 points per inch, 12pt font
    document.body.removeChild(tempDiv)

    return Math.ceil(contentHeight / (linesPerPage * 12))
  }

  // Handle content changes
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>, pageIndex: number) => {
    const newContent = e.currentTarget.innerHTML
    const newPages = [...pages]
    newPages[pageIndex] = { ...newPages[pageIndex], content: newContent }

    // Check if we need to add a new page
    if (pageIndex === pages.length - 1 && calculatePages(newContent) > 1) {
      newPages.push({ content: '', id: (pages.length + 1).toString() })
    }

    setPages(newPages)
  }

  // Handle page navigation
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
    pageRefs.current[pageIndex]?.focus()
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full h-full gap-6'>
      {/* Project Information Board */}
      <Card>
        <CardContent>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <Typography variant='h4'>{projectData?.title || 'Untitled Project'}</Typography>
              <Button
                variant='tonal'
                color='error'
                startIcon={<i className='bx-arrow-back' />}
                onClick={() => router.push('/home')}
              >
                Back to Projects
              </Button>
            </div>
            <Divider />
            <Grid container spacing={2} className='mt-4'>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label='Tone' name='tone' value={projectData?.tone} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label='Length' name='length' value={projectData?.genre} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Concept'
                  name='concept'
                  value={projectData?.concept}
                />
              </Grid>
            </Grid>
          </div>
        </CardContent>
      </Card>

      {/* Script Writing Interface */}
      <Card className='flex-1'>
        <CardContent className='flex flex-col h-full'>
          <div className='flex items-center justify-between mb-4'>
            <Typography variant='h5'>Script Editor</Typography>
            <Button
              variant='tonal'
              color='primary'
              onClick={handleSave}
              disabled={isLoading}
            >
              Save Script
            </Button>
          </div>
          <Divider />

          {/* Script Elements Toolbar */}
          <Paper elevation={1} className='p-2 mb-2'>
            <div className='flex flex-wrap gap-2 items-center'>
              {scriptElements.map((element, index) => (
                <Tooltip key={element.type} title={element.label}>
                  <Chip
                    icon={<i className={`bx ${element.icon}`} />}
                    label={element.label}
                    color={currentElement === element.type ? chipColor[index % chipColor.length] : 'default'}
                    onClick={() => handleFormat(element.type)}
                    className='cursor-pointer'
                  />
                </Tooltip>
              ))}
            </div>
          </Paper>

          {/* Formatting Toolbar */}
          <Paper elevation={1} className='p-2 mb-4'>
            <div className='flex items-center gap-2'>
              {/* Font Family */}
              <Button
                onClick={(e) => setFontMenuAnchor(e.currentTarget)}
                endIcon={<ArrowDropDown />}
                size="small"
                className="min-w-[120px] justify-between"
              >
                {currentFont}
              </Button>
              <Menu
                anchorEl={fontMenuAnchor}
                open={Boolean(fontMenuAnchor)}
                onClose={() => setFontMenuAnchor(null)}
              >
                {fontFamilies.map((font) => (
                  <MenuItem
                    key={font}
                    onClick={() => handleFontChange(font)}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </MenuItem>
                ))}
              </Menu>

              {/* Font Size */}
              <Button
                onClick={(e) => setSizeMenuAnchor(e.currentTarget)}
                endIcon={<ArrowDropDown />}
                size="small"
                startIcon={<FormatSize />}
              >
                {currentSize}
              </Button>
              <Menu
                anchorEl={sizeMenuAnchor}
                open={Boolean(sizeMenuAnchor)}
                onClose={() => setSizeMenuAnchor(null)}
              >
                {fontSizes.map((size) => (
                  <MenuItem
                    key={size}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </MenuItem>
                ))}
              </Menu>

              <Divider orientation="vertical" flexItem />

              {/* Text Formatting */}
              {textFormattingTools.map((tool) => (
                <Tooltip key={tool.type} title={tool.label}>
                  <IconButton
                    onClick={() => handleTextFormat(tool.type)}
                    size='small'
                  >
                    <i className={`bx ${tool.icon}`} />
                  </IconButton>
                </Tooltip>
              ))}

              <Divider orientation="vertical" flexItem />

              {/* Text Color */}
              <IconButton
                onClick={(e) => setColorMenuAnchor(e.currentTarget)}
                size="small"
                style={{ color: currentColor }}
              >
                <ColorLens />
              </IconButton>
              <Menu
                anchorEl={colorMenuAnchor}
                open={Boolean(colorMenuAnchor)}
                onClose={() => setColorMenuAnchor(null)}
              >
                <div className="p-2 grid grid-cols-3 gap-1">
                  {textColors.map((color) => (
                    <div
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className="w-6 h-6 cursor-pointer rounded hover:opacity-80"
                      style={{ backgroundColor: color, border: '1px solid #ddd' }}
                    />
                  ))}
                </div>
              </Menu>

              <Divider orientation="vertical" flexItem />

              {/* Zoom Control */}
              <div className='flex items-center gap-2 ml-auto'>
                <i className='bx-zoom-out' />
                <Slider
                  value={zoomLevel}
                  onChange={handleZoomChange}
                  min={50}
                  max={200}
                  step={10}
                  sx={{ width: 100 }}
                />
                <i className='bx-zoom-in' />
                <Typography variant='body2'>{zoomLevel}%</Typography>
              </div>

              {/* Page Settings Icon */}
              <Tooltip title="Page Settings">
                <IconButton
                  size="small"
                  onClick={() => setShowPageSettings(true)}
                >
                  <i className='bx-cog' />
                </IconButton>
              </Tooltip>
            </div>
          </Paper>

          {/* Editor Content */}
          <div className='editor-container'>
            {pages.map((page, index) => (
              <div key={page.id} className='editor-paper'>
                <div
                  ref={el => (pageRefs.current[index] = el)}
                  className='editor-content'
                  contentEditable
                  onInput={(e) => handleContentChange(e as React.FormEvent<HTMLDivElement>, index)}
                  dangerouslySetInnerHTML={{ __html: page.content }}
                  style={{
                    fontFamily: currentFont,
                    fontSize: `${currentSize}pt`,
                    color: currentColor
                  }}
                />
                <div className='page-number'>Page {index + 1}</div>
              </div>
            ))}
          </div>

          {/* Page Navigation */}
          <div className='flex justify-center items-center mt-4 gap-2'>
            {pages.map((_, index) => (
              <Chip
                key={index}
                label={`Page ${index + 1}`}
                onClick={() => handlePageChange(index)}
                color={currentPage === index ? 'primary' : 'default'}
                className='cursor-pointer'
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Settings Dialog */}
      <Dialog open={showPageSettings} onClose={() => setShowPageSettings(false)}>
        <DialogTitle>Page Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className='mt-2'>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Top Margin (cm)'
                type='number'
                value={pageSettings.marginTop}
                onChange={(e) => setPageSettings(prev => ({ ...prev, marginTop: parseFloat(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Bottom Margin (cm)'
                type='number'
                value={pageSettings.marginBottom}
                onChange={(e) => setPageSettings(prev => ({ ...prev, marginBottom: parseFloat(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Left Margin (cm)'
                type='number'
                value={pageSettings.marginLeft}
                onChange={(e) => setPageSettings(prev => ({ ...prev, marginLeft: parseFloat(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Right Margin (cm)'
                type='number'
                value={pageSettings.marginRight}
                onChange={(e) => setPageSettings(prev => ({ ...prev, marginRight: parseFloat(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPageSettings(false)}>Cancel</Button>
          <Button onClick={() => setShowPageSettings(false)} color='primary'>Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default EnhancedScriptWriter
