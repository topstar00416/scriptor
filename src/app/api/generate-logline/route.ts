import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { title, tone, genre, concept } = await request.json()

    const prompt = `Generate a compelling logline for a movie script based on the following user input: Title, Tone, Genre, and Concept. The logline should capture the essence of the film and entice potential viewers. Ensure that it reflects the tone and genre specified by the user while incorporating the key elements of the provided concept.

#Step
Parser the information below: Title, Tone, Genre, Concept.
Identify the key themes and elements of the concept.
Create a concise and compelling logline that summarizes the essence of the story.
Ensure that the logline matches the specified tone and genre.
#Output Format
Please present your logline in the following format:
Logline: [Produced Logline]

#Information
Title: ${title}
Tone: ${tone}
Genre: ${genre}
Concept: ${concept}

#Example
Title: "Whispers of the Forest"
Logline: "A young girl discovers that she can communicate with animals in a mysterious forest, and must unite them against dark forces that threaten her magical home, while learning the true meaning of courage."

#Note
Keep your logline under 50 words.
Focus on the protagonist's journey and conflict.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional screenwriter who specializes in creating compelling loglines for movies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const response = completion.choices[0].message.content
    const logline = response?.split('Logline:')[1]?.trim() || ''

    return NextResponse.json({ logline })
  } catch (error) {
    console.error('Error generating logline:', error)
    return NextResponse.json(
      { error: 'Failed to generate logline' },
      { status: 500 }
    )
  }
} 
