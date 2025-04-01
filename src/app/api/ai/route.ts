import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const { projectData, type } = await req.json()

    let prompt = ''
    switch (type) {
      case 'logline':
        prompt = `Generate a compelling logline for a ${projectData.genre} story with a ${projectData.tone} tone. The concept is: ${projectData.concept}`
        break
      case 'beat_sheet':
        prompt = `Create a detailed beat sheet for a ${projectData.genre} story with a ${projectData.tone} tone. The logline is: ${projectData.logline}`
        break
      case 'scenes':
        prompt = `Generate a list of scenes for a ${projectData.genre} story with a ${projectData.tone} tone. The logline is: ${projectData.logline}`
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional screenwriter and story consultant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    return NextResponse.json({ result: completion.choices[0].message.content })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
} 
