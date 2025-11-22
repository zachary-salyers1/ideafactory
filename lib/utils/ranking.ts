import { Idea } from '../types'

export interface RankedIdea extends Idea {
  composite_score: number
  rank: number
}

/**
 * Calculate composite score per PRD formula:
 * (0.4 * success_prob) + (0.3 * search_volume) + (0.2 * revenue_potential) + (0.1 * low_competition_bonus)
 */
export function calculateCompositeScore(idea: Idea): number {
  // Normalize success probability (0-100 to 0-1)
  const successScore = idea.success_probability / 100

  // Normalize search volume (cap at 1M searches)
  const volumeScore = Math.min((idea.monthly_search_volume || 0) / 1000000, 1.0)

  // Normalize revenue (cap at $5M annual)
  const revenueScore = Math.min((idea.estimated_revenue_high_usd || 0) / 5000000, 1.0)

  // Competition bonus (inverse - lower is better)
  let competitionBonus = 0
  switch (idea.competition_level) {
    case 'low':
      competitionBonus = 0.1
      break
    case 'medium':
      competitionBonus = 0.05
      break
    case 'high':
      competitionBonus = 0.0
      break
    case 'very_high':
      competitionBonus = -0.1
      break
  }

  // Calculate weighted composite score
  const composite =
    (0.4 * successScore) +
    (0.3 * volumeScore) +
    (0.2 * revenueScore) +
    competitionBonus

  return Math.round(composite * 1000) / 1000 // Round to 3 decimals
}

/**
 * Rank ideas by composite score (descending)
 */
export function rankIdeas(ideas: Idea[]): RankedIdea[] {
  const withScores = ideas.map(idea => ({
    ...idea,
    composite_score: calculateCompositeScore(idea)
  }))

  // Sort by composite score descending
  const sorted = withScores.sort((a, b) => b.composite_score - a.composite_score)

  // Add rank
  const ranked = sorted.map((idea, index) => ({
    ...idea,
    rank: index + 1
  }))

  return ranked
}

/**
 * Filter ideas that meet minimum thresholds per PRD
 */
export function filterValidIdeas(ideas: Idea[]): Idea[] {
  return ideas.filter(idea => {
    // Minimum 10k monthly searches (per PRD)
    if ((idea.monthly_search_volume || 0) < 10000) {
      return false
    }

    // Don't include very high competition ideas
    if (idea.competition_level === 'very_high') {
      return false
    }

    return true
  })
}
