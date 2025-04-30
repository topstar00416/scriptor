'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import {
  Card,
  CardContent,
  Button,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
  Menu,
  Fab,
  List,
  ListItem as MuiListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'

// MUI Icons
import {
  ColorLens,
  FormatSize,
  ArrowDropDown,
  SmartToy,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

// Internal Imports
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Node as TiptapNode } from '@tiptap/core'
import TextStyle from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'

// Text Formatting Extensions
import TextAlign from '@tiptap/extension-text-align'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'

// Additional TipTap Extensions
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TiptapListItem from '@tiptap/extension-list-item'

import OpenAI from 'openai'

// External Imports
import swal from 'sweetalert'

import scriptElements from './ScriptElement'

import { createClient } from '@configs/supabase'
import type { ThemeColor } from '@core/types'

const chipColor: ThemeColor[] = ['primary', 'success', 'error', 'warning', 'info']

// Text formatting options
const textFormattingTools = [
  { type: 'bold', label: 'Bold', icon: 'bx-bold' },
  { type: 'italic', label: 'Italic', icon: 'bx-italic' },
  { type: 'underline', label: 'Underline', icon: 'bx-underline' },
  { type: 'alignLeft', label: 'Align Left', icon: 'bx-align-left' },
  { type: 'alignCenter', label: 'Align Center', icon: 'bx-align-middle' },
  { type: 'alignRight', label: 'Align Right', icon: 'bx-align-right' }
]

// Font families
const fontFamilies = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Helvetica']

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
  '#808080' // Gray
]

interface Page {
  content: string
  id: string
}

interface EnhancedScriptWriterProps {
  projectId: string
}

// Update the styles near the top of the file
const pageStyles: {
  page: React.CSSProperties & { '@media print': React.CSSProperties }
  pageContent: React.CSSProperties
  editorWrapper: React.CSSProperties
} = {
  page: {
    width: '176mm', // B5 width
    height: '250mm', // B5 height
    margin: '20px auto',
    padding: '25mm 20mm',
    backgroundColor: 'white',
    position: 'relative',
    breakAfter: 'page',
    '@media print': {
      margin: 0,
      padding: '25mm 20mm'
    }
  },
  pageContent: {
    height: '100%',
    width: '100%',
    outline: 'none',
    fontFamily: 'Courier New, monospace',
    fontSize: '12pt',
    lineHeight: '1.2',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word'
  },
  editorWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    minHeight: 0,
    overflow: 'auto'
  }
}

// Create node extensions instead of attribute extensions
const SceneHeading = TiptapNode.create({
  name: 'sceneHeading',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-type="scene-heading"]' }]
  },
  renderHTML() {
    return ['div', { 'data-type': 'scene-heading' }, 0]
  }
})

const Character = TiptapNode.create({
  name: 'character',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-type="character"]' }]
  },
  renderHTML() {
    return ['div', { 'data-type': 'character' }, 0]
  }
})

const Dialogue = TiptapNode.create({
  name: 'dialogue',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-type="dialogue"]' }]
  },
  renderHTML() {
    return ['div', { 'data-type': 'dialogue' }, 0]
  }
})

const Parenthetical = TiptapNode.create({
  name: 'parenthetical',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-type="parenthetical"]' }]
  },
  renderHTML() {
    return ['div', { 'data-type': 'parenthetical' }, 0]
  }
})

const Transition = TiptapNode.create({
  name: 'transition',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'div[data-type="transition"]' }]
  },
  renderHTML() {
    return ['div', { 'data-type': 'transition' }, 0]
  }
})

// Update the editor styles
const editorStyles = `
  .ProseMirror {
    min-height: 100%;
    padding: 25mm 20mm;
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', monospace;
    font-size: 12pt;
    line-height: 1.5;
  }

  .ProseMirror p {
    margin: 0;
  }

  .script-scene {
    text-transform: uppercase;
    font-weight: bold;
    margin-bottom: 1em;
  }

  .script-action {
    margin-bottom: 1em;
  }

  .script-character {
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 0.5em;
    margin-top: 1em;
  }

  .script-dialogue {
    text-align: center;
    margin-left: 20%;
    margin-right: 20%;
    margin-bottom: 1em;
  }

  .script-parenthetical {
    text-align: center;
    margin-left: 30%;
    margin-right: 30%;
    margin-bottom: 0.5em;
  }

  .script-transition {
    text-align: right;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 1em;
    margin-bottom: 1em;
  }
`

const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}

              return {
                style: `font-size: ${attributes.fontSize}`
              }
            }
          }
        }
      }
    ]
  }
})

interface CustomItem {
  id: string
  label: string
  value: string
}

interface SelectedTextInfo {
  text: string
  position: { x: number; y: number }
  range?: Range
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

const generatePrompt = (selectedText: string, customItems: CustomItem[], fullScript: string) => {
  const itemsDescription = customItems.map(item => `${item.label}: ${item.value}`).join('\n')

  return `As an expert screenwriter, enhance the following script segment while maintaining its core meaning and incorporating these specific elements. Consider the full script context to ensure continuity and consistency.

Full Script Context:
"""
${fullScript}
"""

Selected Segment to Upgrade:
"""
${selectedText}
"""

Custom Elements to Incorporate:
${itemsDescription}

Please provide an enhanced version that:
1. Maintains the same basic structure and key story elements
2. Incorporates the specified elements naturally
3. Makes the scene more vivid and engaging
4. Keeps the tone consistent with the provided requirements
5. Ensures continuity with the surrounding script context
6. Preserves character voices and narrative style

Enhanced version:`
}

const EnhancedScriptWriter = ({ projectId }: EnhancedScriptWriterProps) => {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)
  const [currentElement] = useState('scene')
  const [zoomLevel] = useState(100)
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
  const [pageContent, setPageContent] = useState<{ [key: string]: string }>({})
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [selectedText, setSelectedText] = useState<SelectedTextInfo | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [customItems, setCustomItems] = useState<CustomItem[]>([])
  const [newItemLabel, setNewItemLabel] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false
      }),
      Placeholder.configure({
        placeholder: 'Start writing your script...'
      }),
      TextAlign.configure({
        types: ['paragraph']
      }),
      FontFamily.configure({
        types: ['textStyle']
      }),
      TextStyle,
      Color,
      Underline,
      SceneHeading,
      Character,
      Dialogue,
      Parenthetical,
      Transition,
      FontSize,
      BulletList,
      OrderedList,
      TiptapListItem
    ],
    content: pageContent[pages[currentPage]?.id || '1'] || '',

    onUpdate: ({ editor }) => {
      const content = editor.getHTML()

      setPageContent(prev => ({
        ...prev,
        [pages[currentPage]?.id || '1']: content
      }))

      // Check if we need to add a new page
      if (content.length > 2000) {
        const newPageId = (pages.length + 1).toString()

        setPages(prev => [...prev, { content: '', id: newPageId }])
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'width: 100%; height: 100%;'
      }
    }
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from('Project').select('*').eq('id', projectId).single()

        if (error) throw error

        setProjectData(data)
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
      setSaveStatus('saving')
      setSaveError(null)

      // Get the current editor content as plain text
      if (!editor) {
        throw new Error('Editor not initialized')
      }

      const scriptContent = editor.getText()

      // Update the project in Supabase
      const { error } = await supabase
        .from('Project')
        .update({
          script: scriptContent
        })
        .eq('id', projectId)

      if (error) throw error

      setSaveStatus('saved')

      // Show success message briefly
      await swal({
        title: 'Success!',
        text: 'Script saved successfully',
        icon: 'success',
        timer: 1500
      })

      // Reset save status after success message is closed
      setSaveStatus('idle')
    } catch (error) {
      console.error('Error saving script:', error)
      setSaveStatus('error')
      setSaveError(error instanceof Error ? error.message : 'Failed to save script')

      // Show error message
      await swal({
        title: 'Error!',
        text: 'Failed to save script. Please try again.',
        icon: 'error'
      })
    }
  }

  const handleFormat = (type: string) => {
    if (!editor) return

    const element = scriptElements.find(el => el.type === type)

    if (!element) return

    // Insert a new line if we're not at the start of the document
    if (!editor.state.selection.empty || editor.state.doc.textContent.length > 0) {
      editor.commands.createParagraphNear()
    }

    // Insert the template text with proper formatting
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'paragraph',
        attrs: { class: `script-${type}` },
        content: [{ type: 'text', text: element.template }]
      })
      .run()

    // Select the template text so user can immediately start typing
    const pos = editor.state.selection.$head.pos

    editor.commands.setTextSelection({ from: pos - element.template.length, to: pos })
  }

  const handleTextFormat = (type: string) => {
    if (!editor) return

    switch (type) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
      case 'alignLeft':
        editor.chain().focus().setTextAlign('left').run()
        break
      case 'alignCenter':
        editor.chain().focus().setTextAlign('center').run()
        break
      case 'alignRight':
        editor.chain().focus().setTextAlign('right').run()
        break
    }
  }

  const handleFontChange = (font: string) => {
    if (!editor) return
    editor.chain().focus().setMark('textStyle', { fontFamily: font }).run()
    setCurrentFont(font)
    setFontMenuAnchor(null)
  }

  const handleSizeChange = (size: number) => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .setMark('textStyle', { fontSize: `${size}pt` })
      .run()
    setCurrentSize(size)
    setSizeMenuAnchor(null)
  }

  const handleColorChange = (color: string) => {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
    setCurrentColor(color)
    setColorMenuAnchor(null)
  }

  // Handle page navigation
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
    pageRefs.current[pageIndex]?.focus()
  }

  // Add cleanup function
  useEffect(() => {
    return () => {
      // Cleanup refs on unmount
      editorRefs.current = {}
    }
  }, [])

  // Add this effect to update editor content when page changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(pageContent[pages[currentPage]?.id || '1'] || '')
    }
  }, [currentPage, editor])

  useEffect(() => {
    // Add editor styles to document.
    const styleSheet = document.createElement('style')

    styleSheet.textContent = editorStyles
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()

      if (!selection || selection.isCollapsed) {
        // Don't clear selection when modal is open
        if (!showUpgradeModal) {
          setSelectedText(null)
        }

        return
      }

      const range = selection.getRangeAt(0)
      const text = selection.toString().trim()

      if (text) {
        const rect = range.getBoundingClientRect()

        setSelectedText({
          text,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.bottom + window.scrollY
          },
          range: range.cloneRange() // Store the range
        })
      } else if (!showUpgradeModal) {
        setSelectedText(null)
      }
    }

    document.addEventListener('selectionchange', handleSelection)

    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [showUpgradeModal])

  const handleAddCustomItem = () => {
    if (!newItemLabel.trim()) return

    setCustomItems([
      ...customItems,
      {
        id: Date.now().toString(),
        label: newItemLabel,
        value: ''
      }
    ])
    setNewItemLabel('')
  }

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id))
  }

  const handleCustomItemValueChange = (id: string, value: string) => {
    setCustomItems(customItems.map(item => (item.id === id ? { ...item, value } : item)))
  }

  const handleGenerateUpgrade = async () => {
    try {
      setIsGenerating(true)
      setGenerationError(null)

      if (!selectedText?.text || customItems.length === 0) {
        throw new Error('Please select text and add at least one custom item')
      }

      const fullScript = editor?.getText() || ''

      const prompt = generatePrompt(selectedText.text, customItems, fullScript)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert screenwriter with deep knowledge of screenplay formatting and dramatic writing. Your task is to enhance script segments while maintaining their core meaning and incorporating specific elements requested by the writer. Consider the full script context to ensure narrative continuity and consistency.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const enhancedContent = completion.choices[0]?.message?.content

      if (!enhancedContent) {
        throw new Error('Failed to generate enhanced content')
      }

      // Clean up the content by removing triple quotes and any surrounding quotes
      const cleanedContent = enhancedContent
        .replace(/^"""|"""$/g, '') // Remove triple quotes
        .replace(/^"|"$/g, '') // Remove surrounding quotes
        .trim()

      // Replace the selected text with the AI-generated content
      if (editor && selectedText?.range) {
        // Restore the selection before replacing
        const selection = window.getSelection()

        if (selection) {
          selection.removeAllRanges()
          selection.addRange(selectedText.range)
        }

        editor
          .chain()
          .focus()
          .deleteRange({ from: editor.state.selection.from, to: editor.state.selection.to })
          .insertContent(cleanedContent)
          .run()
      }

      setShowUpgradeModal(false)
      setSelectedText(null)
      setCustomItems([])
    } catch (error) {
      console.error('Error generating upgrade:', error)
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
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
              <div className='flex items-center gap-2'>
                {saveError && (
                  <Typography variant='body2' color='error'>
                    {saveError}
                  </Typography>
                )}
                <Button
                  variant='tonal'
                  color='primary'
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  startIcon={
                    saveStatus === 'saving' ? (
                      <CircularProgress size={20} />
                    ) : saveStatus === 'saved' ? (
                      <i className='bx bx-check' />
                    ) : (
                      <i className='bx bx-save' />
                    )
                  }
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Script'}
                </Button>
                <Button
                  variant='tonal'
                  color='error'
                  startIcon={<i className='bx-arrow-back' />}
                  onClick={() => router.push('/home')}
                >
                  Back to Projects
                </Button>
              </div>
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
                <TextField fullWidth multiline rows={4} label='Concept' name='concept' value={projectData?.concept} />
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
            <Button variant='tonal' color='primary' onClick={handleSave} disabled={isLoading}>
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
                    onClick={() => handleFormat(element.type)}
                    className='cursor-pointer'
                    color={chipColor[index % chipColor.length]}
                    variant={currentElement === element.type ? 'filled' : 'outlined'}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme => theme.palette[chipColor[index % chipColor.length]].light,
                        color: theme => theme.palette[chipColor[index % chipColor.length]].contrastText
                      }
                    }}
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
                onClick={e => setFontMenuAnchor(e.currentTarget)}
                endIcon={<ArrowDropDown />}
                size='small'
                className='min-w-[120px] justify-between'
                variant='outlined'
              >
                {currentFont}
              </Button>
              <Menu anchorEl={fontMenuAnchor} open={Boolean(fontMenuAnchor)} onClose={() => setFontMenuAnchor(null)}>
                {fontFamilies.map(font => (
                  <MenuItem
                    key={font}
                    onClick={() => handleFontChange(font)}
                    style={{ fontFamily: font }}
                    selected={currentFont === font}
                  >
                    {font}
                  </MenuItem>
                ))}
              </Menu>

              {/* Font Size */}
              <Button
                onClick={e => setSizeMenuAnchor(e.currentTarget)}
                endIcon={<ArrowDropDown />}
                size='small'
                startIcon={<FormatSize />}
                variant='outlined'
              >
                {currentSize}
              </Button>
              <Menu anchorEl={sizeMenuAnchor} open={Boolean(sizeMenuAnchor)} onClose={() => setSizeMenuAnchor(null)}>
                {fontSizes.map(size => (
                  <MenuItem key={size} onClick={() => handleSizeChange(size)} selected={currentSize === size}>
                    {size}
                  </MenuItem>
                ))}
              </Menu>

              <Divider orientation='vertical' flexItem />

              {/* Text Formatting */}
              {textFormattingTools.map(tool => (
                <Tooltip key={tool.type} title={tool.label}>
                  <IconButton
                    onClick={() => handleTextFormat(tool.type)}
                    size='small'
                    color={editor?.isActive(tool.type) ? 'primary' : 'default'}
                  >
                    <i className={`bx ${tool.icon}`} />
                  </IconButton>
                </Tooltip>
              ))}

              <Divider orientation='vertical' flexItem />

              {/* Text Color */}
              <IconButton
                onClick={e => setColorMenuAnchor(e.currentTarget)}
                size='small'
                style={{ color: currentColor }}
              >
                <ColorLens />
              </IconButton>
              <Menu anchorEl={colorMenuAnchor} open={Boolean(colorMenuAnchor)} onClose={() => setColorMenuAnchor(null)}>
                <div className='p-2 grid grid-cols-3 gap-1'>
                  {textColors.map(color => (
                    <div
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className='w-6 h-6 cursor-pointer rounded hover:opacity-80'
                      style={{
                        backgroundColor: color,
                        border: '1px solid #ddd',
                        outline: currentColor === color ? '2px solid #1976d2' : 'none'
                      }}
                    />
                  ))}
                </div>
              </Menu>
            </div>
          </Paper>

          {/* Page Editor */}
          <div style={pageStyles.editorWrapper}>
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                padding: '2rem',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '176mm', // B5 width
                  minHeight: '250mm', // B5 height
                  backgroundColor: 'white',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* Page Navigation */}
          <div className='flex justify-center items-center gap-2 mt-4'>
            <Button
              variant='outlined'
              size='small'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous Page
            </Button>
            <Typography variant='body2'>
              Page {currentPage + 1} of {pages.length}
            </Typography>
            <Button
              variant='outlined'
              size='small'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pages.length - 1}
            >
              Next Page
            </Button>
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
                onChange={e => setPageSettings(prev => ({ ...prev, marginTop: parseFloat(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Bottom Margin (cm)'
                type='number'
                value={pageSettings.marginBottom}
                onChange={e => setPageSettings(prev => ({ ...prev, marginBottom: parseFloat(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Left Margin (cm)'
                type='number'
                value={pageSettings.marginLeft}
                onChange={e => setPageSettings(prev => ({ ...prev, marginLeft: parseFloat(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='Right Margin (cm)'
                type='number'
                value={pageSettings.marginRight}
                onChange={e => setPageSettings(prev => ({ ...prev, marginRight: parseFloat(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPageSettings(false)}>Cancel</Button>
          <Button onClick={() => setShowPageSettings(false)} color='primary'>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating AI Upgrade Button */}
      {selectedText && (
        <Zoom in={true}>
          <Fab
            color='primary'
            size='small'
            onClick={() => setShowUpgradeModal(true)}
            sx={{
              position: 'absolute',
              left: `${selectedText.position.x}px`,
              top: `${selectedText.position.y + 10}px`,
              transform: 'translate(-50%, 0)',
              zIndex: 1000
            }}
          >
            <SmartToy />
          </Fab>
        </Zoom>
      )}

      {/* AI Upgrade Modal */}
      <Dialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        maxWidth='md'
        fullWidth
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <DialogTitle>Upgrade Script with AI</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mt-4'>
            {/* Selected Text Display */}
            <Paper
              className='p-4 bg-gray-50'
              sx={{
                userSelect: 'text',
                cursor: 'text'
              }}
            >
              <Typography variant='subtitle2' color='textSecondary'>
                Selected Text:
              </Typography>
              <Typography
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {selectedText?.text}
              </Typography>
            </Paper>

            {/* Custom Items List */}
            <List>
              {customItems.map(item => (
                <MuiListItem key={item.id}>
                  <ListItemText
                    primary={
                      <TextField
                        fullWidth
                        label={item.label}
                        value={item.value}
                        onChange={e => handleCustomItemValueChange(item.id, e.target.value)}
                        variant='outlined'
                        size='small'
                      />
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge='end' onClick={() => handleRemoveCustomItem(item.id)} size='small'>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </MuiListItem>
              ))}
            </List>

            {/* Add New Item */}
            <div className='flex gap-2'>
              <TextField
                fullWidth
                label='New Item Label'
                value={newItemLabel}
                onChange={e => setNewItemLabel(e.target.value)}
                variant='outlined'
                size='small'
                placeholder='e.g., Tone, Emotion, Setting, Time'
              />
              <Button variant='contained' onClick={handleAddCustomItem} startIcon={<AddIcon />}>
                Add
              </Button>
            </div>

            {/* Error Message */}
            {generationError && (
              <Typography color='error' variant='body2'>
                {generationError}
              </Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateUpgrade}
            variant='contained'
            disabled={isGenerating || customItems.length === 0}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <SmartToy />}
          >
            {isGenerating ? 'Generating...' : 'Generate Upgrade'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default EnhancedScriptWriter
