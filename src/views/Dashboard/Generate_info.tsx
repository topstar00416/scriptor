'use client'

import OpenAI from 'openai'

interface ProjectData {
  title: string
  genre: string
  tone: string
  concept: string
}

interface GeneratedContent {
  logline: string
  beatSheet: { seq: number; description: string }[]
  scenes: { seq: number; name: string; description: string }[]
}

const GenerateInfo = async (
  projectData: ProjectData,
  target: 'logline' | 'beatSheet' | 'scenes' | 'all'
): Promise<GeneratedContent> => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const systemPrompt = `
    You are tasked with generating components of a film script based on user-provided information. Your role is to create a logline, beat sheets, and scene outlines as required by the user, based on the specified title, tone, genre, and concept of the film.

    ## Task
    - Depending on the user's input, generate the desired elements:
    - If the user inputs "Generate all values," provide a logline, beat sheets, and scene outlines.
    - If the user specifies only one component (e.g., "Generate beat sheets"), only generate that specific content.

    ## Steps
    1. Logline: Formulate a compelling logline summarizing the film's premise in one to two sentences.
    2. Beat Sheet: Outline key events and turning points of the film, aiming for 10-15 major beats.
    3. Scene Outlines: Create detailed descriptions of specific scenes, including character actions, dialogues, and essential settings, ensuring alignment with the defined beats.

    ## Output Format(change as user required)
    - Logline: [Your logline here]
    - Beat Sheet:
    1. [Beat 1 description here]
    2. [Beat 2 description here]
    ...
    - Scene Outlines:(at least 5)
    1. [Description of scene 1]
    2. [Description of scene 2]
    ...

    ## Notes
    - Ensure the content is cohesive and accurately reflects the provided tone, genre, and concept.
    - Maintain a formal tone throughout the response.
    - Focus on creating engaging and creative content suitable for further film script development.
  `

  const targetPrompts = {
    logline: 'Generate logline',
    beatSheet: 'Generate beat sheets',
    scenes: 'Generate scene outlines',
    all: 'Generate all values' // Using the existing full systemPrompt
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Title: ${projectData.title}\nTone: ${projectData.tone}\nGenre: ${projectData.genre}\nConcept: ${projectData.concept} \nRequest: ${targetPrompts[target]}`
        }
      ]
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
          .map(line => {
            const match = line.trim().match(/^(\d+)\.\s*(.*)$/)

            if (match) {
              return {
                seq: parseInt(match[1], 10),
                description: match[2].trim()
              }
            }

            return null
          })
          .filter(item => item !== null)
      : []

    // Extract scenes
    const scenesMatch = content.match(/Scene Outlines:([\s\S]*)$/)

    const scenesText = scenesMatch ? scenesMatch[1].trim().split(/\n(?=\d+\.\s+\*\*)/) : []

    console.log(scenesText)

    const scenes = scenesText
      ?.map((sceneText, index) => {
        const sceneRegex = /^\d+\.\s+\*\*(.+?):\s*(.+?)\*\*\s*-\s*(.*)$/
        const match = sceneText.trim().match(sceneRegex)

        if (match) {
          return {
            seq: index + 1,
            name: `${match[1].trim()}: ${match[2].trim()}`,
            description: match[3].trim().replace(/\s+/g, ' ')
          }
        }

        return null
      })
      .filter(scene => scene !== null)

    console.log(scenes)

    return {
      logline,
      beatSheet,
      scenes
    }
  } catch (error) {
    console.error('Error generating content:', error)

    return {
      logline: '',
      beatSheet: [],
      scenes: []
    }
  }
}

export default GenerateInfo
