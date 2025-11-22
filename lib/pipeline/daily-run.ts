import { generateRawIdeas } from '../services/grok'
import { getBestKeyword } from '../services/dataforseo'
import { researchIdea } from '../services/tavily'
import { validateIdea } from '../services/validator'
import { filterValidIdeas, rankIdeas } from '../utils/ranking'
import { getServiceRoleClient } from '../supabase/client'
import { Idea, IdeaRun } from '../types'

export interface PipelineResult {
  run: IdeaRun
  ideas: Idea[]
  rankedIdeas: Idea[]
  errors: string[]
}

/**
 * Main daily pipeline - generates and validates 10-15 ideas
 * Per PRD Section 4.2.1
 */
export async function runDailyPipeline(): Promise<PipelineResult> {
  const errors: string[] = []
  const startTime = Date.now()

  console.log('🚀 Starting IdeaFactory 2025 Daily Pipeline...')
  console.log(`📅 Date: ${new Date().toISOString()}`)

  try {
    // Step 1: Generate 12-18 raw ideas via Grok-4
    console.log('💡 Step 1/5: Generating raw ideas with Grok-4...')
    const rawIdeas = await generateRawIdeas()
    console.log(`✅ Generated ${rawIdeas.length} raw ideas`)

    // Step 2: Validate each idea in parallel
    console.log('🔍 Step 2/5: Validating ideas (parallel API calls)...')
    const validatedIdeas: Idea[] = []

    const validationPromises = rawIdeas.map(async (rawIdea, index) => {
      try {
        console.log(`  [${index + 1}/${rawIdeas.length}] Validating "${rawIdea.name}"...`)

        // Get keyword volume data
        const keywordData = await getBestKeyword(rawIdea.primary_keywords)

        // Perform deep research
        const researchData = await researchIdea(rawIdea.name, rawIdea.primary_keywords)

        // Run validation agent
        const validation = await validateIdea({
          name: rawIdea.name,
          one_liner: rawIdea.one_liner,
          suspected_platform: rawIdea.suspected_platform,
          keyword_data: keywordData,
          research_data: researchData
        })

        // Aggregate demand evidence
        const demandEvidence = researchData
          .flatMap(r => r.snippets.slice(0, 2))
          .join(' | ')

        // Construct validated idea
        const idea: Partial<Idea> = {
          id: crypto.randomUUID(),
          name: rawIdea.name,
          one_liner: rawIdea.one_liner,
          platform: validation.platform_decision,
          primary_keyword: keywordData.keyword,
          monthly_search_volume: keywordData.monthly_volume,
          cpc_usd: keywordData.cpc,
          competition_score: keywordData.competition,
          competition_level: validation.competition_level,
          estimated_revenue_low_usd: validation.estimated_revenue_low_usd,
          estimated_revenue_high_usd: validation.estimated_revenue_high_usd,
          development_cost_usd: validation.development_cost_usd,
          time_to_mvp_months: validation.time_to_mvp_months,
          success_probability: validation.success_probability,
          demand_evidence: validation.demand_evidence || demandEvidence,
          why_this_wins: validation.why_this_wins,
          validation_raw: {
            keyword_data: keywordData,
            research_data: researchData,
            validation
          },
          chosen: false,
          built: false,
          sold: false,
          created_at: new Date().toISOString()
        }

        return idea as Idea
      } catch (error) {
        console.error(`  ❌ Failed to validate "${rawIdea.name}":`, error)
        errors.push(`Failed to validate "${rawIdea.name}": ${error}`)
        return null
      }
    })

    const results = await Promise.all(validationPromises)
    validatedIdeas.push(...results.filter(Boolean) as Idea[])

    console.log(`✅ Successfully validated ${validatedIdeas.length} ideas`)

    // Step 3: Filter ideas by thresholds
    console.log('🔬 Step 3/5: Filtering ideas by quality thresholds...')
    const filteredIdeas = filterValidIdeas(validatedIdeas)
    console.log(`✅ ${filteredIdeas.length} ideas passed quality filters`)

    // Step 4: Rank ideas by composite score
    console.log('📊 Step 4/5: Ranking ideas by composite score...')
    const rankedIdeas = rankIdeas(filteredIdeas)
    console.log(`✅ Ranked ${rankedIdeas.length} ideas`)

    // Take top 10-15
    const topIdeas = rankedIdeas.slice(0, 15)

    // Step 5: Store in database
    console.log('💾 Step 5/5: Storing results in Supabase...')
    const supabase = getServiceRoleClient()

    // Create run record
    const runData: Partial<IdeaRun> = {
      id: crypto.randomUUID(),
      run_date: new Date().toISOString().split('T')[0],
      ideas_generated: topIdeas.length,
      top_success_score: topIdeas[0]?.success_probability || 0,
      average_search_volume: Math.round(
        topIdeas.reduce((sum, i) => sum + (i.monthly_search_volume || 0), 0) / topIdeas.length
      ),
      notes: `Generated ${rawIdeas.length} raw ideas, validated ${validatedIdeas.length}, filtered to ${topIdeas.length}`,
      created_at: new Date().toISOString()
    }

    const { data: run, error: runError } = await supabase
      .from('idea_runs')
      .insert(runData)
      .select()
      .single()

    if (runError) {
      throw new Error(`Failed to insert run: ${runError.message}`)
    }

    // Insert ideas
    const ideasToInsert = topIdeas.map(idea => ({
      ...idea,
      run_id: run.id
    }))

    const { error: ideasError } = await supabase
      .from('ideas')
      .insert(ideasToInsert)

    if (ideasError) {
      throw new Error(`Failed to insert ideas: ${ideasError.message}`)
    }

    console.log('✅ Successfully stored all data in database')

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n🎉 Pipeline completed in ${duration}s`)
    console.log(`📈 Top idea: ${topIdeas[0]?.name} (${topIdeas[0]?.success_probability}% success)`)
    console.log(`💰 Avg search volume: ${runData.average_search_volume?.toLocaleString()}`)

    return {
      run: run as IdeaRun,
      ideas: topIdeas,
      rankedIdeas: topIdeas,
      errors
    }

  } catch (error) {
    console.error('❌ Pipeline failed:', error)
    errors.push(`Pipeline critical error: ${error}`)

    throw error
  }
}
