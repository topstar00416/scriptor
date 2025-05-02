'use client'

import { useState, useEffect, useRef } from 'react'

import OpenAI from 'openai'

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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

// Menu Items Configuration
const menuItems = {
  file: [
    'Import Script',
    'Export Script',
    'Rename Project',
    'Create Link',
    'Create Sides',
    'Request Approval',
    'History',
    'Print/Download PDF',
    'Save as Draft'
  ],
  edit: [
    'Line Format',
    'Scene Numbers',
    'Format',
    'Title Page',
    'Cut',
    'Copy',
    'Paste',
    'Find & Replace',
    'Check Spelling',
    'Revision Mode',
    'Header & Footers',
    'Script Settings'
  ],
  view: [
    'Episode',
    'Tools',
    'Comments',
    'Navigation',
    'Script Goals',
    'Script Timers',
    'Script Insights',
    'Scene Numbers',
    'Dialogue Numbers',
    'Zoom',
    'Night Mode',
    'Turotial Text',
    'Element Assist',
    'Color'
  ],
  Help: ['Tour', 'Help Center', 'Keyboard Shortcuts', 'Blog']
}

const ScriptWriter = () => {
  const [anchorEls, setAnchorEls] = useState<{ [key: string]: null | HTMLElement }>({})
  const [fontSize, setFontSize] = useState('12')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [zoom, setZoom] = useState(100)
  const [showRuler] = useState(true)
  const [showGrid] = useState(false)
  const [pageCount] = useState(1)
  const [currentPage] = useState(1)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [showAIModal, setShowAIModal] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [content, setContent] = useState('')

  interface SelectedRange {
    startContainer: Node | null
    startOffset: number
    endContainer: Node | null
    endOffset: number
    commonAncestor: HTMLElement | null
  }

  const [selectedRange, setSelectedRange] = useState<SelectedRange>({
    startContainer: null,
    startOffset: 0,
    endContainer: null,
    endOffset: 0,
    commonAncestor: null
  })

  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize range when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedRange({
        startContainer: document.createTextNode(''),
        startOffset: 0,
        endContainer: document.createTextNode(''),
        endOffset: 0,
        commonAncestor: document.createElement('div')
      })
    }
  }, [])

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

  // Handle content changes
  const handleContentChange = () => {
    if (!editorRef.current) return
    const newContent = editorRef.current.innerHTML

    // Only update if content actually changed
    if (newContent !== content) {
      setUndoStack(prev => [...prev, content])
      setRedoStack([]) // Clear redo stack when new changes are made
      setContent(newContent)
    }
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return

    const previousContent = undoStack[undoStack.length - 1]
    const currentContent = content

    if (editorRef.current) {
      setRedoStack(prev => [...prev, currentContent])
      setContent(previousContent)
      editorRef.current.innerHTML = previousContent
      setUndoStack(prev => prev.slice(0, -1))
    }
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return

    const nextContent = redoStack[redoStack.length - 1]
    const currentContent = content

    if (editorRef.current) {
      setUndoStack(prev => [...prev, currentContent])
      setContent(nextContent)
      editorRef.current.innerHTML = nextContent
      setRedoStack(prev => prev.slice(0, -1))
    }
  }

  useEffect(() => {
    const editor = editorRef.current

    if (!editor) return

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement

      if (!target.lastChild) return
      const lastChild = target.lastChild as HTMLElement

      if (!('className' in lastChild) || typeof lastChild.className !== 'string') return
      const match = lastChild.className.match(/script-format-(\w+)/)

      if (match) {
        const k = match[1]

        handleKeyDown(e as unknown as React.KeyboardEvent<HTMLDivElement>, k)
      }
    }

    editor.addEventListener('keydown', onKeyDown)

    return () => {
      editor.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const handleKeyDown = (e: any, k: string) => {
    const match = e.target.lastChild

    if (e.key === 'Enter') {
      e.preventDefault()

      // Create selection range after the current element
      const selection = window.getSelection()
      const range = document.createRange()

      range.setStartAfter(match)
      range.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(range)

      // Determine which element to create next based on current element type
      switch (k) {
        case 'act':
          handleScriptElement('scene')
          break
        case 'scene':
          handleScriptElement('action')
          break
        case 'action':
          handleScriptElement('action')
          break
        case 'character':
          handleScriptElement('dialogue')
          break
        case 'dialogue':
          handleScriptElement('character')
          break
        case 'parenthetical':
          handleScriptElement('dialogue')
          break
        case 'transition':
          handleScriptElement('scene')
          break
        case 'shot':
          handleScriptElement('action')
          break
        case 'text':
          handleScriptElement('text')
          break
        default:
          break
      }
    }
  }

  const handleScriptElement = (
    elementType:
      | 'act'
      | 'scene'
      | 'action'
      | 'character'
      | 'dialogue'
      | 'parenthetical'
      | 'transition'
      | 'shot'
      | 'text'
  ) => {
    if (!editorRef.current) return

    // Get current selection or create one at the end if none exists
    const selection = window.getSelection()
    let range

    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
    } else {
      range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
    }

    // Check if the previous element is empty and remove it
    const previousElement = range.startContainer.parentElement

    if (
      previousElement &&
      previousElement.lastChild &&
      'className' in previousElement.lastChild &&
      typeof (previousElement.lastChild as HTMLElement).className === 'string' &&
      (previousElement.lastChild as HTMLElement).className.includes('script-format-') &&
      !(previousElement.lastChild as HTMLElement).textContent?.trim()
    ) {
      previousElement.lastChild.remove()
    }

    // Create element container
    const element = document.createElement('div')

    element.contentEditable = 'true'
    element.className = `script-format-${elementType}`
    element.spellcheck = true

    // Configure element based on type
    const config = {
      act: {
        placeholder: 'ACT (E.G. TEASER, ACT 1, ETC.)',
        label: 'Act heading'
      },
      scene: {
        placeholder: 'INT./EXT. PLACE - TIME OF DAY',
        label: 'Scene heading'
      },
      action: {
        placeholder:
          'Describe the scene: the setting, who is there, and what is happening. Keep it brief—just a few sentences!',
        label: 'Action description'
      },
      character: {
        placeholder: 'CHARACTER NAME',
        label: 'Character name'
      },
      dialogue: {
        placeholder: 'DIALOGUE TEXT',
        label: 'Dialogue text'
      },
      parenthetical: {
        placeholder: 'PARENTHESES',
        label: 'Parenthetical',
        extraSetup: () => {
          const placeholder = document.createElement('span')

          placeholder.className = 'placeholder'
          placeholder.textContent = 'PARENTHESES'
        }
      },
      transition: {
        placeholder: 'TRANSITION (E.G. CUT TO:)',
        label: 'Transition'
      },
      shot: {
        placeholder: 'SHOT (E.G. ZOOM IN ON CROWD)',
        label: 'Shot description'
      },
      text: {
        placeholder: 'Other text. For example, production notes, song lyrics, etc.',
        label: 'General text'
      }
    }

    // Apply configuration
    const typeConfig = config[elementType]

    element.dataset.placeholder = typeConfig.placeholder
    element.setAttribute('role', 'textbox')
    element.setAttribute('aria-label', typeConfig.label)

    // Run any extra setup specific to this element type
    if ((typeConfig as any).extraSetup) {
      ;(typeConfig as any).extraSetup()
    }

    // Insert element
    range.insertNode(element)

    // Focus Element
    element.focus()

    // Set cursor position inside the element
    const newRange = document.createRange()

    newRange.setStart(element, 0)
    newRange.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(newRange)

    // Ensure element is visible
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Trigger content change
    handleContentChange()
  }

  // Update keyboard shortcuts handler
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
  }, [content, undoStack, redoStack]) // Add dependencies

  // Handle save and print
  const handleSave = () => {
    // TODO: Implement save functionality
    setSnackbarMessage('Document saved')
    setShowSnackbar(true)
  }

  const handlePrint = () => {
    window.print()
  }

  // Handle AI enhance
  const handleAIEnhance = () => {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      setSnackbarMessage('Please select some text first')
      setShowSnackbar(true)

      return
    }

    const range = selection.getRangeAt(0)
    const text = selection.toString().trim()

    // Find the closest script element container
    let element = range.commonAncestorContainer as HTMLElement

    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement as HTMLElement
    }

    // Store the range details
    const rangeDetails = {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset,
      commonAncestor: element
    }

    setSelectedElement(element)
    setSelectedText(text)
    setSelectedRange(rangeDetails) // Add this state
    setShowAIModal(true)
  }

  // Add this helper function to format text into proper screenplay structure
  const formatScriptText = (text: string, elementType: string) => {
    // Split text into lines
    const lines = text.split('\n')

    switch (elementType) {
      case 'act':
        return lines.map(line => line.trim()).join('\n\n')
      case 'scene':
        // For scene headings, ensure proper spacing and all caps
        return lines.map(line => line.trim().toUpperCase()).join('\n\n')
      case 'action':
        // For action blocks, ensure proper line length and spacing
        return lines.map(line => line.trim()).join('\n')
      default:
        return text
    }
  }

  const handleGenerate = async () => {
    if (!userPrompt || !selectedElement) {
      setSnackbarMessage('Please enter a prompt')
      setShowSnackbar(true)

      return
    }

    setIsGenerating(true)

    try {
      const elementType = selectedElement.className.match(/script-format-(\w+)/)?.[1] || ''

      const prompt = `Current full context: "${selectedElement.textContent || ''}"
                    
                    Selected text to enhance: "${selectedText}"
  
                    Element type: "${elementType}"
  
                    Writer's request: ${userPrompt}
  
                    Please enhance ONLY the selected text while ensuring it fits naturally within the context.
                    The enhanced text should maintain the same meaning but be more vivid or impactful.
  
                    Important: 
                    1. Return ONLY the replacement text for the selected portion
                    2. DO NOT return the full context
                    3. Keep the response focused and concise
                    4. Ensure the replacement fits grammatically and contextually
                    5. Maintain the tone and style of the original text
                    6. This is a ${elementType.toUpperCase()} element in the screenplay
                    7. Follow standard screenplay formatting for this element type`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert screenwriter. Return ONLY the replacement text for the selected portion, maintaining proper screenplay format and style.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const enhancedText = completion.choices[0]?.message?.content?.trim() || ''
      const upgradedText = enhancedText.replace(/^"|"$/g, '')

      // Restore the selection range
      const range = document.createRange()

      if (selectedRange.startContainer && selectedRange.endContainer) {
        range.setStart(selectedRange.startContainer, selectedRange.startOffset)
        range.setEnd(selectedRange.endContainer, selectedRange.endOffset)

        // Delete the original content
        range.deleteContents()

        // Insert the new content
        range.insertNode(document.createTextNode(upgradedText))

        // Update the selection to the new content
        const selection = window.getSelection()

        if (selection && selectedRange.commonAncestor) {
          selection.removeAllRanges()

          // Create a new range at the end of the inserted text
          const newRange = document.createRange()

          newRange.selectNodeContents(selectedRange.commonAncestor)
          newRange.collapse(false)
          selection.addRange(newRange)
        }

        // Focus back on the element
        if (selectedRange.commonAncestor) {
          selectedRange.commonAncestor.focus()
        }
      }

      setShowAIModal(false)
      setUserPrompt('')
      setSelectedElement(null)
      setSelectedRange({
        startContainer: null,
        startOffset: 0,
        endContainer: null,
        endOffset: 0,
        commonAncestor: null
      })
      setSnackbarMessage('Text enhanced successfully')
      setShowSnackbar(true)
      handleContentChange() // Update undo stack
    } catch (error) {
      console.error('Error:', error)
      setSnackbarMessage('Failed to enhance text. Please try again.')
      setShowSnackbar(true)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Box className='h-screen flex flex-col'>
      <style jsx global>{`
        /* Common base styles for all script format elements */
        [class^='script-format-'] {
          font-family: 'Courier New', Courier, monospace !important;
          font-size: 12pt !important;
          display: block !important;
          width: 100% !important;
          position: relative !important;
          min-height: 1.5em !important;
          outline: none !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          margin: 1em 0 !important;
        }

        /* Common focus and hover states */
        [class^='script-format-']:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }

        [class^='script-format-']:hover:not(:focus) {
          background-color: rgba(59, 130, 246, 0.05) !important;
        }

        /* Common empty state placeholder styles */
        [class^='script-format-']:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          position: absolute;
          pointer-events: none;
        }

        /* Act specific styles */
        .script-format-act {
          text-align: center !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin: 2em 0 !important;
          letter-spacing: 0.5px !important;
        }

        .script-format-act:empty::before {
          left: 0;
          right: 0;
          text-align: center;
          text-transform: uppercase;
        }

        /* Scene specific styles */
        .script-format-scene {
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          background-color: #f3f4f6 !important;
        }

        .script-format-scene:hover:not(:focus) {
          background-color: #e5e7eb !important;
        }

        /* Action specific styles */
        .script-format-action {
          line-height: 1.5 !important;
          color: #4b5563 !important;
        }

        .script-format-action:empty::before {
          left: 8px;
          right: 8px;
          white-space: pre-wrap;
        }

        /* Character specific styles */
        .script-format-character {
          text-transform: uppercase !important;
          text-align: center !important;
          max-width: 35% !important;
          margin: 1em auto 0.25em !important;
          color: #1f2937 !important;
        }

        .script-format-character:empty::before {
          left: 0;
          right: 0;
          text-align: center;
          text-transform: uppercase;
        }

        /* Dialogue specific styles */
        .script-format-dialogue {
          max-width: 65% !important;
          margin: 0 auto 1em !important;
          color: #1f2937 !important;
          line-height: 1.5 !important;
        }

        .script-format-dialogue:empty::before {
          left: 8px;
          right: 8px;
          white-space: pre-wrap;
        }

        /* Parenthetical specific styles */
        .script-format-parenthetical {
          max-width: 35% !important;
          margin: 0 auto 0.25em !important;
          padding: 4px 24px !important;
          color: #4b5563 !important;
          line-height: 1.5 !important;
        }

        .script-format-parenthetical::before {
          content: '(' !important;
          position: absolute !important;
          left: 8px !important;
          color: inherit !important;
        }

        .script-format-parenthetical::after {
          content: ')' !important;
          position: absolute !important;
          right: 8px !important;
          color: inherit !important;
        }

        .script-format-parenthetical > .placeholder {
          position: absolute !important;
          left: 24px !important;
          right: 24px !important;
          color: #9ca3af !important;
          pointer-events: none !important;
          display: none !important;
        }

        .script-format-parenthetical:empty > .placeholder {
          display: block !important;
        }

        /* Transition specific styles */
        .script-format-transition {
          text-transform: uppercase !important;
          text-align: right !important;
          max-width: 60% !important;
          margin: 1em 0 1em auto !important;
          color: #1f2937 !important;
        }

        .script-format-transition:empty::before {
          left: 0;
          right: 0;
          text-align: right;
          text-transform: uppercase;
        }

        /* Shot specific styles */
        .script-format-shot {
          text-transform: uppercase !important;
          max-width: 60% !important;
          color: #1f2937 !important;
        }

        .script-format-shot:empty::before {
          left: 8px;
          right: 8px;
          text-transform: uppercase;
        }

        /* Text specific styles */
        .script-format-text {
          line-height: 1.5 !important;
          color: #4b5563 !important;
        }

        .script-format-text:empty::before {
          left: 8px;
          right: 8px;
          white-space: pre-wrap;
        }

        /* General contenteditable placeholder styles */
        [contenteditable]:empty::before,
        [contenteditable]:has(> br:only-child)::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>

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
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-text'></i>}
            onClick={() => handleScriptElement('act')}
          >
            Act
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-map'></i>}
            onClick={() => handleScriptElement('scene')}
          >
            Scene Heading
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-movie'></i>}
            onClick={() => handleScriptElement('action')}
          >
            Action
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-user'></i>}
            onClick={() => handleScriptElement('character')}
          >
            Character
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-message-square-dots'></i>}
            onClick={() => handleScriptElement('dialogue')}
          >
            Dialogue
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-parentheses'></i>}
            onClick={() => handleScriptElement('parenthetical')}
          >
            Parenthetical
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-transfer'></i>}
            onClick={() => handleScriptElement('transition')}
          >
            Transition
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-video'></i>}
            onClick={() => handleScriptElement('shot')}
          >
            Shot
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='bx bx-text'></i>}
            onClick={() => handleScriptElement('text')}
          >
            Text
          </Button>
          <Divider orientation='vertical' flexItem />
          <Tooltip title='AI Enhance'>
            <Button
              variant='contained'
              size='small'
              color='primary'
              startIcon={<i className='bx bx-brain'></i>}
              onClick={handleAIEnhance}
            >
              AI Enhance
            </Button>
          </Tooltip>
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
            onBlur={handleContentChange}
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

      {/* AI Enhancement Modal */}
      <Dialog open={showAIModal} onClose={() => !isGenerating && setShowAIModal(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          AI Enhancement - {selectedElement?.className.match(/script-format-(\w+)/)?.[1]?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Box className='space-y-4 py-2'>
            <div>
              <Typography variant='subtitle2' gutterBottom>
                Selected Text:
              </Typography>
              <Paper
                elevation={0}
                className={`p-4 bg-gray-50 rounded font-mono`}
                sx={{
                  whiteSpace: 'pre-wrap',
                  '& .script-content': {
                    fontFamily: 'Courier New, monospace',
                    fontSize: '12pt',
                    lineHeight: '1.5',
                    maxWidth: '60ch',
                    margin: '0 auto',
                    '& p': {
                      marginBottom: '1em'
                    }
                  }
                }}
              >
                <div className='script-content'>
                  {formatScriptText(selectedText, selectedElement?.className.match(/script-format-(\w+)/)?.[1] || '')}
                </div>
              </Paper>
            </div>
            <TextField
              fullWidth
              multiline
              rows={3}
              label='What would you like to enhance? (e.g., make it more dramatic, add more detail, etc.)'
              value={userPrompt}
              onChange={e => setUserPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAIModal(false)
              setSelectedElement(null)
            }}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleGenerate}
            disabled={!userPrompt || isGenerating}
            startIcon={isGenerating ? <i className='bx bx-loader-alt bx-spin'></i> : <i className='bx bx-brain'></i>}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ScriptWriter
