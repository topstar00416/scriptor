'use client'

import { useState, useEffect } from 'react'
import OpenAI from 'openai'

interface ProjectData {
  title: string
  genre: string
  tone: string
  concept: string
  imageUrl: string
}

interface GeneratedContent {
  logline: string
  beatSheet: string[]
  scenes: string[]
}

const generateInfo = async (projectData: ProjectData): Promise<GeneratedContent> => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

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
    1: [Description of scene 1]
    2: [Description of scene 2]
    ...

    ## Notes
    - Ensure that the generated content is cohesive and reflects the provided tone, genre, and concept accurately.
    - Focus on creating engaging and creative content that can be utilized for further film script development.
  `

  try {
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
          .map(line => line.trim())
      : []

    // Extract scenes
    console.log(content)
    const scenesMatch = content.match(/Scene Outlines:([\s\S]*)$/)
    const scenes = scenesMatch
      ? scenesMatch[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+:/))
          .map(line => line.replace(/^\d+:\s*/, '').trim())
      : []

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

export default generateInfo
