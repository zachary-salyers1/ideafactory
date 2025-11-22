import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { generateMarketingPlan } from '@/lib/swarms/marketing'
import { generateProductSpec } from '@/lib/swarms/product'
import { Idea, BuildPlan } from '@/lib/types'

/**
 * POST /api/build-plan
 * Generate comprehensive build plan for an idea (Marketing + Product swarms)
 */
export async function POST(request: Request) {
  try {
    const { ideaId } = await request.json()

    if (!ideaId) {
      return NextResponse.json(
        { error: 'ideaId is required' },
        { status: 400 }
      )
    }

    // Fetch the idea
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    if (fetchError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    console.log(`🚀 Generating build plan for: ${idea.name}`)

    // Run both swarms in parallel
    const [marketingPlan, productSpec] = await Promise.all([
      generateMarketingPlan(idea as Idea),
      generateProductSpec(idea as Idea)
    ])

    // Combine into full markdown document
    const markdown_full = `# Build Plan: ${idea.name}

${idea.one_liner}

---

## 📊 Market Overview

- **Monthly Search Volume**: ${idea.monthly_search_volume?.toLocaleString() || 'N/A'}
- **Competition Level**: ${idea.competition_level}
- **Success Probability**: ${idea.success_probability}%
- **Estimated Revenue**: $${idea.estimated_revenue_low_usd?.toLocaleString()} - $${idea.estimated_revenue_high_usd?.toLocaleString()}/year
- **Time to MVP**: ${idea.time_to_mvp_months} months
- **Platform**: ${idea.platform}

---

## 🎯 Marketing Plan

### Target Personas
${marketingPlan.personas.map(p => `- ${p}`).join('\n')}

### Go-To-Market Strategy
${marketingPlan.gtm_strategy}

### Target Audience
${marketingPlan.target_audience.map(a => `- ${a}`).join('\n')}

### Launch Channels
${marketingPlan.launch_channels.map(c => `- ${c}`).join('\n')}

### Ad Creatives
${marketingPlan.ad_creatives.map(a => `- ${a}`).join('\n')}

### 90-Day Launch Calendar
${marketingPlan.ninety_day_calendar}

---

## 🛠 Product Specification

### Recommended Tech Stack
${productSpec.tech_stack.map(t => `- ${t}`).join('\n')}

### Core Features (MoSCoW)
${productSpec.core_features.map(f => `- ${f}`).join('\n')}

### MVP Roadmap
${productSpec.mvp_roadmap}

---

## 📋 Product Requirements Document
${productSpec.prd_full}

---

## 🗄 Database Schema
\`\`\`sql
${productSpec.db_schema}
\`\`\`

---

## 🔌 API Specification
\`\`\`
${productSpec.api_spec}
\`\`\`

---

## 🎨 Wireframes
${productSpec.wireframes_text}

---

## ✅ Next Steps

1. Review this build plan and adjust based on your constraints
2. Set up development environment with recommended tech stack
3. Follow the MVP roadmap week-by-week
4. Execute the 90-day marketing calendar in parallel with development
5. Launch on ProductHunt in Month 3

**Ready to build? Export this plan and import to Linear or your project management tool.**
`

    const buildPlan: BuildPlan = {
      marketing: marketingPlan,
      product: productSpec,
      markdown_full
    }

    // Mark idea as chosen
    await supabase
      .from('ideas')
      .update({ chosen: true })
      .eq('id', ideaId)

    console.log(`✅ Build plan generated for: ${idea.name}`)

    return NextResponse.json({ buildPlan })
  } catch (error) {
    console.error('Error generating build plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate build plan' },
      { status: 500 }
    )
  }
}
