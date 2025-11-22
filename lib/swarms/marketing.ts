import OpenAI from 'openai'
import { Idea, MarketingPlan } from '../types'

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
})

/**
 * Marketing Swarm - Generates comprehensive GTM strategy
 * Per PRD: personas, GTM plan, ad creatives, 90-day calendar
 */
export async function generateMarketingPlan(idea: Idea): Promise<MarketingPlan> {
  const systemPrompt = `You are an expert growth marketer and GTM strategist. Create a comprehensive marketing plan for the following validated product idea.

Your plan should include:
1. Detailed user personas (3-5 target segments)
2. Complete GTM (Go-To-Market) strategy with positioning and messaging
3. Target audience breakdown with psychographics
4. Launch channels prioritized by ROI potential
5. Ad creative concepts (5-7 variations for different platforms)
6. 90-day launch calendar with specific tactics and milestones

Return a JSON object with:
{
  "personas": ["Persona 1: [name] - [1-2 sentence description]", ...],
  "gtm_strategy": "<comprehensive 3-4 paragraph GTM plan>",
  "target_audience": ["Segment 1", "Segment 2", ...],
  "launch_channels": ["Channel 1: [rationale]", "Channel 2: [rationale]", ...],
  "ad_creatives": ["Creative 1: [platform] - [hook] - [CTA]", ...],
  "ninety_day_calendar": "<markdown formatted calendar with weeks 1-12>"
}

Base recommendations on:
- The validated search volume and competition data
- The platform type (optimize for app stores vs web vs desktop)
- The target revenue range (determines budget allocation)
- 2025 growth trends (short-form video, community-led growth, AI-assisted content)`

  const userPrompt = `PRODUCT IDEA:
Name: ${idea.name}
Description: ${idea.one_liner}
Platform: ${idea.platform}

MARKET DATA:
- Monthly Search Volume: ${idea.monthly_search_volume?.toLocaleString() || 'N/A'}
- Competition Level: ${idea.competition_level}
- Primary Keyword: ${idea.primary_keyword}
- Target Revenue: $${idea.estimated_revenue_low_usd?.toLocaleString()} - $${idea.estimated_revenue_high_usd?.toLocaleString()}/year
- Success Probability: ${idea.success_probability}%

DEMAND SIGNALS:
${idea.demand_evidence}

WHY THIS WINS:
${idea.why_this_wins}

Generate the complete marketing plan now.`

  try {
    const completion = await xai.chat.completions.create({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No marketing plan generated')
    }

    const plan = JSON.parse(content)

    return {
      personas: plan.personas || [],
      gtm_strategy: plan.gtm_strategy || '',
      target_audience: plan.target_audience || [],
      launch_channels: plan.launch_channels || [],
      ad_creatives: plan.ad_creatives || [],
      ninety_day_calendar: plan.ninety_day_calendar || ''
    }
  } catch (error) {
    console.error('Error generating marketing plan:', error)
    return getMockMarketingPlan(idea)
  }
}

function getMockMarketingPlan(idea: Idea): MarketingPlan {
  return {
    personas: [
      'Tech-Savvy Early Adopter - 25-35 year old professional who actively seeks productivity tools',
      'Small Business Owner - 35-50 year old entrepreneur looking for cost-effective solutions',
      'Freelancer/Creator - 22-40 year old independent worker needing specialized tools'
    ],
    gtm_strategy: `Launch ${idea.name} with a product-led growth strategy targeting ${idea.platform} users. Phase 1 (Months 1-2): Build waitlist through content marketing and social proof. Focus on SEO for "${idea.primary_keyword}" and related terms. Phase 2 (Month 3): Limited beta launch to first 100 users, gather testimonials and case studies. Phase 3 (Months 4-6): Public launch with ProductHunt, paid acquisition via Google/Meta ads, and strategic partnerships with complementary tools.`,
    target_audience: [
      'Early adopters in tech/startup space',
      'Productivity-focused professionals',
      'Small teams and solopreneurs',
      'Remote workers seeking efficiency tools'
    ],
    launch_channels: [
      'ProductHunt - Launch day featuring',
      'Reddit - Organic posts in relevant communities',
      'Twitter/X - Influencer partnerships and threads',
      'Google Ads - Search campaigns for high-intent keywords',
      'Content Marketing - SEO-optimized blog posts',
      'YouTube - Tutorial and demo videos'
    ],
    ad_creatives: [
      'Google Search - "Stop wasting time on [problem]. Try ${idea.name} free."',
      'Facebook/Instagram - Before/After visual showing time saved',
      'Twitter - Social proof: "[X] people already using ${idea.name} to [benefit]"',
      'TikTok - Quick demo showing the "aha moment" in 15 seconds',
      'LinkedIn - ROI-focused: "Save $[X] annually with ${idea.name}"'
    ],
    ninety_day_calendar: `
## 90-Day Launch Calendar

### Month 1: Pre-Launch & Validation
- Week 1-2: Landing page + waitlist, seed audience building
- Week 3: Content creation (blog posts, videos)
- Week 4: Beta tester recruitment, early feedback loops

### Month 2: Beta & Iteration
- Week 5-6: Private beta launch to first 50 users
- Week 7: Gather testimonials and case studies
- Week 8: Product refinement based on feedback

### Month 3: Public Launch
- Week 9: ProductHunt launch preparation
- Week 10: Public launch day (PH, social media blitz)
- Week 11: Paid acquisition begins (Google/Meta ads)
- Week 12: Analyze metrics, optimize funnels, scale what works
    `.trim()
  }
}
