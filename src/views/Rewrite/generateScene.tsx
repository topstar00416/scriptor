'use client'

import OpenAI from 'openai'

interface ProjectData {
  scene: string
  tone: string
  length: string
  position: string
}

// let flag = false

const GenerateInfo = async (projectData: ProjectData) => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const systemPrompt = `
    Here are your AI prompts. Adapt them as needed to suit your specific needs.

    Role: ChatGPT acts as a screenwriter and is responsible for converting a given movie scene according to your specifications.

    Input Format:
    Scene Text: Source material
    Tone: Tone
    Length: Length
    Position: Location

    Output Format:
    - The new scene should contain:
    - A scene title (e.g. Outside Park - Day)
    - A description of the setting and action
    - Dialogue (if applicable)

    Tone: Indicates the desired tone change (e.g. from serious to humorous).

    Length: Specifies how much to shorten or lengthen the scene (e.g. from 10 lines to 5 lines).

    Location: Provides the new location of the scene (e.g. from a coffee shop to a park).

    Input Example:
    - Scene Text: Inside Restaurant - Night
    - Tone: Change from "dramatic" to "light".
    - Length: Reduce from 8 lines to 4 lines. - Location: Move from "Restaurant" to "Backyard".

    Expected Output:
    - The response should present a new scene with the specified changes while maintaining consistency and creativity.

    Use this structure to submit your preferences for scene text and transformations.
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Scent Text: ${projectData.scene}\nTone: ${projectData.tone}\nLength: ${projectData.length}\nPosition: ${projectData.position}`
        }
      ]
    })

    const content = response.choices[0]?.message?.content || ''

    return content
  } catch (error) {
    console.error('Error generating content:', error)
  }
}

export default GenerateInfo
