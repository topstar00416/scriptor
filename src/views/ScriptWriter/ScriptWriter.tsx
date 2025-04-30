'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@mui/material/styles'

// MUI Imports
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Box,
  Button,
  Select,
  FormControl,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material'

// Menu Items Configuration
const menuItems = {
  file: ['New', 'Open', 'Save', 'Save As', 'Export', 'Print', 'Print Preview'],
  edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Select All', 'Find', 'Replace'],
  view: ['Full Screen', 'Page Width', 'Show Ruler', 'Show Grid', 'Zoom In', 'Zoom Out', 'Actual Size'],
  insert: ['Page Break', 'Table', 'Picture', 'Link', 'Comment', 'Header', 'Footer'],
  format: ['Font', 'Paragraph', 'Styles', 'Columns', 'Page Setup']
}

const ScriptWriter = () => {
  const theme = useTheme()
  const [anchorEls, setAnchorEls] = useState<{ [key: string]: null | HTMLElement }>({})
  const [fontSize, setFontSize] = useState('12')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [zoom, setZoom] = useState(100)
  const [showRuler, setShowRuler] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [pageCount, setPageCount] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle menu opening/closing
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, menuId: string) => {
    setAnchorEls(prev => ({ ...prev, [menuId]: event.currentTarget }))
  }

  const handleMenuClose = (menuId: string) => {
    setAnchorEls(prev => ({ ...prev, [menuId]: null }))
  }

  // Handle zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))
  const handleZoomReset = () => setZoom(100)

  // Handle undo/redo
  const handleContentChange = () => {
    if (!editorRef.current) return
    const content = editorRef.current.innerHTML
    setUndoStack(prev => [...prev, content])
    setRedoStack([])
  }

  // Handle script formatting
  const handleActFormat = () => {
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)
    if (range) {
      // Create new act element
      const actElement = document.createElement('div')
      actElement.className = 'script-act mb-8 text-center'
      actElement.contentEditable = 'true'
      actElement.dataset.placeholder = 'ACT (E.G. TEASER, ACT 1, ETC.)'

      // Clear any existing content and insert the new element
      range.deleteContents()
      range.insertNode(actElement)

      // Move cursor inside the new element
      const newRange = document.createRange()
      newRange.setStart(actElement, 0)
      newRange.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(newRange)

      // Trigger content change
      handleContentChange()
    }
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const content = undoStack[undoStack.length - 1]
    const editor = editorRef.current
    if (editor) {
      setRedoStack(prev => [...prev, editor.textContent || ''])
      editor.textContent = content
    }
    setUndoStack(prev => prev.slice(0, -1))
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const content = redoStack[redoStack.length - 1]
    const editor = editorRef.current
    if (editor) {
      setUndoStack(prev => [...prev, editor.textContent || ''])
      editor.textContent = content
    }
    setRedoStack(prev => prev.slice(0, -1))
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) handleRedo()
            else handleUndo()
            break
          case 'y':
            e.preventDefault()
            handleRedo()
            break
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'p':
            e.preventDefault()
            handlePrint()
            break
          case '=':
            e.preventDefault()
            handleZoomIn()
            break
          case '-':
            e.preventDefault()
            handleZoomOut()
            break
          case '0':
            e.preventDefault()
            handleZoomReset()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle save and print
  const handleSave = () => {
    // TODO: Implement save functionality
    setSnackbarMessage('Document saved')
    setShowSnackbar(true)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box className='h-screen flex flex-col'>
      {/* Main Menu Bar */}
      <AppBar position='static' color='default' elevation={1} className='border-b'>
        <Toolbar variant='dense' className='gap-2'>
          {Object.keys(menuItems).map(menuId => (
            <div key={menuId}>
              <Button onClick={e => handleMenuOpen(e, menuId)} className='text-gray-700 min-w-[60px]' size='small'>
                {menuId.charAt(0).toUpperCase() + menuId.slice(1)}
              </Button>
              <Menu
                anchorEl={anchorEls[menuId]}
                open={Boolean(anchorEls[menuId])}
                onClose={() => handleMenuClose(menuId)}
                className='mt-2'
              >
                {menuItems[menuId as keyof typeof menuItems].map(item => (
                  <MenuItem key={item} onClick={() => handleMenuClose(menuId)}>
                    {item}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          ))}
        </Toolbar>
      </AppBar>

      {/* Script Formatting Toolbar */}
      <Paper elevation={0} className='border-b p-1'>
        <Toolbar variant='dense' className='gap-2 min-h-0 py-1 overflow-x-auto'>
          <Button variant='outlined' size='small' startIcon={<i className='bx bx-text'></i>} onClick={handleActFormat}>
            Act
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-map'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'h2')}
          >
            Scene Heading
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-movie'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'p')}
          >
            Action
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-user'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'h3')}
          >
            Character
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-message-square-dots'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'blockquote')}
          >
            Dialogue
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-parentheses'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'aside')}
          >
            Parenthetical
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-transfer'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'h4')}
          >
            Transition
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-video'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'h5')}
          >
            Shot
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-text'></i>}
            onClick={() => document.execCommand('formatBlock', false, 'p')}
          >
            Text
          </Button>
        </Toolbar>
      </Paper>

      {/* Formatting Toolbar */}
      <Paper elevation={0} className='border-b p-1'>
        <Toolbar variant='dense' className='gap-2 min-h-0 py-1'>
          {/* Undo/Redo */}
          <Tooltip title='Undo (Ctrl+Z)'>
            <IconButton size='small' onClick={handleUndo}>
              <i className='bx bx-undo'></i>
            </IconButton>
          </Tooltip>
          <Tooltip title='Redo (Ctrl+Y)'>
            <IconButton size='small' onClick={handleRedo}>
              <i className='bx bx-redo'></i>
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem />

          {/* Font Controls */}
          <FormControl size='small' variant='outlined' className='min-w-[120px]'>
            <Select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className='text-sm'>
              <MenuItem value='Arial'>Arial</MenuItem>
              <MenuItem value='Times New Roman'>Times New Roman</MenuItem>
              <MenuItem value='Calibri'>Calibri</MenuItem>
              <MenuItem value='Helvetica'>Helvetica</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' variant='outlined' className='w-[70px]'>
            <Select value={fontSize} onChange={e => setFontSize(e.target.value)} className='text-sm'>
              {['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36'].map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider orientation='vertical' flexItem />

          {/* Text Formatting */}
          <Tooltip title='Bold (Ctrl+B)'>
            <IconButton size='small' onClick={() => document.execCommand('bold')}>
              <i className='bx bx-bold'></i>
            </IconButton>
          </Tooltip>
          <Tooltip title='Italic (Ctrl+I)'>
            <IconButton size='small' onClick={() => document.execCommand('italic')}>
              <i className='bx bx-italic'></i>
            </IconButton>
          </Tooltip>
          <Tooltip title='Underline (Ctrl+U)'>
            <IconButton size='small' onClick={() => document.execCommand('underline')}>
              <i className='bx bx-underline'></i>
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem />

          {/* Alignment */}
          <Tooltip title='Align Left'>
            <IconButton size='small' onClick={() => document.execCommand('justifyLeft')}>
              <i className='bx bx-align-left'></i>
            </IconButton>
          </Tooltip>
          <Tooltip title='Align Center'>
            <IconButton size='small' onClick={() => document.execCommand('justifyCenter')}>
              <i className='bx bx-align-middle'></i>
            </IconButton>
          </Tooltip>
          <Tooltip title='Align Right'>
            <IconButton size='small' onClick={() => document.execCommand('justifyRight')}>
              <i className='bx bx-align-right'></i>
            </IconButton>
          </Tooltip>
          <Tooltip title='Justify'>
            <IconButton size='small' onClick={() => document.execCommand('justifyFull')}>
              <i className='bx bx-align-justify'></i>
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem />

          {/* Lists */}
          <Tooltip title='Bullet List'>
            <IconButton size='small' onClick={() => document.execCommand('insertUnorderedList')}>
              <i className='bx bx-list-ul'></i>
            </IconButton>
          </Tooltip>
          <Tooltip title='Numbered List'>
            <IconButton size='small' onClick={() => document.execCommand('insertOrderedList')}>
              <i className='bx bx-list-ol'></i>
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem />

          {/* Zoom Controls */}
          <Tooltip title='Zoom Out (Ctrl+-)'>
            <IconButton size='small' onClick={handleZoomOut}>
              <i className='bx bx-zoom-out'></i>
            </IconButton>
          </Tooltip>
          <Typography variant='body2' className='min-w-[60px] text-center'>
            {zoom}%
          </Typography>
          <Tooltip title='Zoom In (Ctrl++)'>
            <IconButton size='small' onClick={handleZoomIn}>
              <i className='bx bx-zoom-in'></i>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>

      {/* Editor Area */}
      <Box className='flex-1 bg-gray-100 overflow-auto' ref={containerRef}>
        {showRuler && <div className='sticky top-0 h-8 bg-white border-b z-10'>{/* Implement ruler markings */}</div>}
        <Box
          className='mx-auto my-8 bg-white shadow-md relative'
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '19mm',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Title Page */}
          <div className='flex flex-col items-center justify-center h-full'>
            <div
              contentEditable
              className='text-center text-4xl font-bold mb-8 mt-24 outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded px-2 relative'
              style={{ fontFamily, fontSize: '36px' }}
              data-placeholder='Enter Script Title Here'
            />
            <div
              contentEditable
              className='text-center text-2xl mb-12 outline-none text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded px-2 relative'
              style={{ fontFamily, fontSize: '24px' }}
              data-placeholder='Enter By Line Here'
            />
            <div className='space-y-4'>
              <div
                contentEditable
                className='text-center outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded px-2 relative'
                style={{ fontFamily, fontSize: '18px' }}
                data-placeholder='Written by: [Author Name]'
              />
              <div
                contentEditable
                className='text-center outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded px-2 relative'
                style={{ fontFamily, fontSize: '18px' }}
                data-placeholder='Edited by: [Editor Name]'
              />
            </div>

            {/* Bottom section with copyright and contact */}
            <div className='absolute bottom-10 left-3 right-3 flex justify-between px-8 py-4'>
              <div
                contentEditable
                className='outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded px-2 relative'
                style={{ fontFamily, fontSize: '16px' }}
                data-placeholder='© [Year] [Production Company]'
              />
              <div
                contentEditable
                className='outline-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded px-2 relative'
                style={{ fontFamily, fontSize: '16px' }}
                data-placeholder='Contact: [Email/Phone]'
              />
            </div>
          </div>

          <style jsx>{`
            [contenteditable]:empty::before,
            [contenteditable]:has(> br:only-child)::before {
              content: attr(data-placeholder);
              color: #9ca3af;
              pointer-events: none;
            }

            .script-act {
              font-family: ${fontFamily};
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 1rem 0;
              outline: none;
            }

            .script-act:empty::before {
              content: attr(data-placeholder);
              color: #9ca3af;
              text-transform: uppercase;
            }
          `}</style>
        </Box>
        <Box
          className='mx-auto my-8 bg-white shadow-md relative'
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '19mm',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          {showGrid && (
            <div
              className='absolute inset-0 pointer-events-none'
              style={{
                backgroundImage:
                  'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          )}
          <div
            ref={editorRef}
            contentEditable
            className='min-h-full outline-none text-gray-900'
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              width: '100%',
              color: '#000000'
            }}
            onInput={handleContentChange}
          />
        </Box>
      </Box>

      {/* Status Bar */}
      <Paper elevation={1} className='border-t'>
        <Toolbar variant='dense' className='justify-between min-h-0 py-1'>
          <Typography variant='caption'>
            Page {currentPage} of {pageCount}
          </Typography>
          <Typography variant='caption'>Words: {editorRef.current?.textContent?.split(/\s+/).length || 0}</Typography>
        </Toolbar>
      </Paper>

      {/* Notifications */}
      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={() => setShowSnackbar(false)}>
        <Alert severity='success' onClose={() => setShowSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ScriptWriter
