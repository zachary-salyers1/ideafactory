import OpenAI from 'openai'
import { KeywordData } from './dataforseo'
import { TavilyResult } from './tavily'

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
})

export interface ValidationResult {
  success_probability: number // 0-100
  estimated_revenue_low_usd: number
  estimated_revenue_high_usd: number
  development_cost_usd: number
  time_to_mvp_months: number
  platform_decision: string
  competition_level: 'low' | 'medium' | 'high' | 'very_high'
  why_this_wins: string
  demand_evidence: string
}

interface ValidationInput {
  name: string
  one_liner: string
  suspected_platform: string
  keyword_data: KeywordData
  research_data: TavilyResult[]
}

export async function validateIdea(input: ValidationInput): Promise<ValidationResult> {
  const systemPrompt = `You are an expert product validator and market analyst. Analyze the following product idea and provide a detailed validation assessment.

Use the keyword volume, competition data, and research snippets to make data-driven decisions.

Return a JSON object with:
{
  "success_probability": <0-100 integer>,
  "estimated_revenue_low_usd": <number>,
  "estimated_revenue_high_usd": <number>,
  "development_cost_usd": <number>,
  "time_to_mvp_months": <integer>,
  "platform_decision": "<mobile-first|web PWA|desktop|browser extension>",
  "competition_level": "<low|medium|high|very_high>",
  "why_this_wins": "<1-2 sentence explanation>",
  "demand_evidence": "<aggregated summary of demand signals from research>"
}

Guidelines:
- success_probability should be 80-95 for strong ideas, 60-79 for decent ideas, below 60 for weak ideas
- estimated_revenue should be realistic annual revenue ranges
- development_cost should factor in indie developer rates (~$50-100/hr)
- time_to_mvp_months should be realistic for a solo dev or small team
- Base competition_level on keyword competition data AND research insights
- why_this_wins should be specific and data-backed
- demand_evidence should cite specific complaints, requests, or market signals from the research`

  const userPrompt = `PRODUCT IDEA:
Name: ${input.name}
Description: ${input.one_liner}
Suspected Platform: ${input.suspected_platform}

KEYWORD DATA:
- Primary Keyword: ${input.keyword_data.keyword}
- Monthly Search Volume: ${input.keyword_data.monthly_volume.toLocaleString()}
- CPC: $${input.keyword_data.cpc}
- Competition Score: ${input.keyword_data.competition} (${input.keyword_data.competition_level})

MARKET RESEARCH (from Reddit, Twitter, ProductHunt, etc.):
${input.research_data.map((r, i) => `
Query ${i + 1}: ${r.query}
Findings:
${r.snippets.slice(0, 3).map(s => `  - ${s}`).join('\n')}
`).join('\n')}

Provide your validation assessment now.`

  try {
    const completion = await xai.chat.completions.create({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No validation response from Grok')
    }

    const result = JSON.parse(content)

    // Ensure all required fields are present with defaults
    return {
      success_probability: result.success_probability || 75,
      estimated_revenue_low_usd: result.estimated_revenue_low_usd || 50000,
      estimated_revenue_high_usd: result.estimated_revenue_high_usd || 200000,
      development_cost_usd: result.development_cost_usd || 20000,
      time_to_mvp_months: result.time_to_mvp_months || 3,
      platform_decision: result.platform_decision || input.suspected_platform,
      competition_level: result.competition_level || input.keyword_data.competition_level,
      why_this_wins: result.why_this_wins || 'Strong market demand with underserved niche.',
      demand_evidence: result.demand_evidence || 'Multiple requests found across social platforms.'
    }
  } catch (error) {
    console.error('Error validating idea with Grok:', error)

    // Fallback validation based on keyword data
    return getFallbackValidation(input)
  }
}

function getFallbackValidation(input: ValidationInput): ValidationResult {
  const volume = input.keyword_data.monthly_volume
  const competition = input.keyword_data.competition
  const cpc = input.keyword_data.cpc

  // Simple heuristic scoring
  let success_probability = 70

  if (volume > 50000) success_probability += 10
  if (volume > 100000) success_probability += 5

  if (competition < 0.3) success_probability += 10
  else if (competition > 0.7) success_probability -= 15

  if (cpc > 3) success_probability += 5

  success_probability = Math.max(50, Math.min(95, success_probability))

  return {
    success_probability,
    estimated_revenue_low_usd: Math.floor(volume * cpc * 0.02 * 12),
    estimated_revenue_high_usd: Math.floor(volume * cpc * 0.1 * 12),
    development_cost_usd: 25000,
    time_to_mvp_months: 3,
    platform_decision: input.suspected_platform,
    competition_level: input.keyword_data.competition_level,
    why_this_wins: `${volume.toLocaleString()} monthly searches with ${input.keyword_data.competition_level} competition. Strong CPC of $${cpc} indicates commercial intent.`,
    demand_evidence: `Primary keyword "${input.keyword_data.keyword}" shows ${volume.toLocaleString()} monthly searches. Research indicates active discussions on Reddit and Twitter.`
  }
}
