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
  beatSheet: string[]
  scenes: string[]
}

const GenerateInfo = async (projectData: ProjectData, target: 'logline' | 'beatSheet' | 'scenes' | 'all'): Promise<GeneratedContent> => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  console.log(projectData, target)

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
    - Scene Outlines:
    1. [Description of scene 1]
    2. [Description of scene 2]
    ...

    ## Notes
    - Ensure the content is cohesive and accurately reflects the provided tone, genre, and concept.
    - Maintain a formal tone throughout the response.
    - Focus on creating engaging and creative content suitable for further film script development.

    ## User Input Example
    - Title: "The Last Journey"
    - Genre: Sci-Fi
    - Tone: Formal
    - Concept: A group of explorers travels to a distant planet, uncovering secrets that could change humanity forever.
    - User Request: "Generate all values" or "Generate beat sheets" or "Generate scene outlines"
  `

  const targetPrompts = {
    logline: 'Generate logline',
    beatSheet: 'Generate beat sheets',
    scenes: 'You are a professional film scriptwriter. Based on the provided project details, write detailed outlines for 5 key scenes',
    all: 'Generate all values' // Using the existing full systemPrompt
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Title: ${projectData.title}\nTone: ${projectData.tone}\nGenre: ${projectData.genre}\nConcept: ${projectData.concept} \nTarget: ${targetPrompts[target]}` },
      ],
    })

    const content = response.choices[0]?.message?.content || ''

    console.log(content)

    // Extract logline
    const loglineMatch = content.match(/Logline: (.*?)(?=\n|$)/)
    const logline = loglineMatch ? loglineMatch[1].trim() : ''

    // Extract beat sheet
    const beatSheetMatch = content.match(/Beat Sheet:([\s\S]*?)(?=Scene Outlines:|$)/)

    const beatSheet = beatSheetMatch
      ? beatSheetMatch[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.trim())
      : []

    // Extract scenes
    const scenesMatch = content.match(/Scene Outlines:([\s\S]*)$/)

    const scenes = scenesMatch
      ? scenesMatch[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+:/))
          .map(line => line.replace(/^\d+:\s*/, '').trim())
      : []

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
