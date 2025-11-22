import OpenAI from 'openai'

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
})

interface RawIdea {
  name: string
  one_liner: string
  suspected_platform: string
  primary_keywords: string[]
}

export async function generateRawIdeas(): Promise<RawIdea[]> {
  const currentDate = new Date().toISOString().split('T')[0]

  const systemPrompt = `You are an expert product strategist and market researcher. Generate 12-18 novel, profitable software product ideas focused on 2025 macro trends.

TRENDS TO FOCUS ON:
- AI agents and autonomous systems
- Vision Pro / spatial computing applications
- Climate tech and sustainability software
- Neurotech and health optimization
- Remote work and async collaboration tools
- Creator economy platforms
- Web3 and decentralized apps (practical use cases only)
- Privacy-first alternatives to mainstream apps

CONSTRAINTS:
- Ideas must be buildable by a solo indie developer or small team
- Software-only (no hardware required)
- Estimated development cost < $100k
- Clear monetization path
- Not just "AI wrapper" - real value creation
- Solve real pain points (not imaginary problems)

OUTPUT FORMAT:
Return a JSON array of objects with this structure:
{
  "name": "Product Name",
  "one_liner": "Brief description of what it does and who it's for",
  "suspected_platform": "mobile-first|web PWA|desktop|browser extension",
  "primary_keywords": ["keyword1", "keyword2", "keyword3"]
}

Today's date: ${currentDate}

Generate 15 high-potential ideas now.`

  try {
    const completion = await xai.chat.completions.create({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate 15 validated product ideas for 2025.' }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from Grok-4')
    }

    const parsed = JSON.parse(content)
    const ideas = parsed.ideas || parsed.data || []

    return ideas.slice(0, 15) // Ensure max 15 ideas
  } catch (error) {
    console.error('Error generating ideas with Grok-4:', error)

    // Fallback mock data for development
    return getMockIdeas()
  }
}

function getMockIdeas(): RawIdea[] {
  return [
    {
      name: 'AirQuality Pro',
      one_liner: 'Real-time air quality monitoring app with personalized health recommendations for people with respiratory conditions',
      suspected_platform: 'mobile-first',
      primary_keywords: ['air quality app', 'pollution tracker', 'health monitoring']
    },
    {
      name: 'AsyncStandup',
      one_liner: 'Video-based async standup tool for remote teams with automatic transcription and action item extraction',
      suspected_platform: 'web PWA',
      primary_keywords: ['async standup', 'remote team tools', 'video standups']
    },
    {
      name: 'CreatorInvoice',
      one_liner: 'Automated invoicing and contract management for content creators and freelancers',
      suspected_platform: 'web PWA',
      primary_keywords: ['creator invoicing', 'freelance invoices', 'contract management']
    },
    {
      name: 'VisionNotes',
      one_liner: 'Spatial note-taking app for Vision Pro that lets you pin notes in 3D space',
      suspected_platform: 'visionOS',
      primary_keywords: ['vision pro apps', 'spatial computing', '3d note taking']
    },
    {
      name: 'LocalFirst CRM',
      one_liner: 'Privacy-first CRM that stores all data locally with optional E2E encrypted sync',
      suspected_platform: 'desktop',
      primary_keywords: ['privacy crm', 'local first software', 'encrypted crm']
    }
  ]
}
