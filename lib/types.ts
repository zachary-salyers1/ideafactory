// Database Types (matching Supabase schema from PRD)
export interface IdeaRun {
  id: string;
  run_date: string; // ISO date
  ideas_generated: number;
  top_success_score: number;
  average_search_volume: number;
  notes?: string;
  created_at: string;
}

export interface Idea {
  id: string;
  run_id: string;
  name: string;
  one_liner: string;
  platform: string; // e.g., 'mobile-first', 'web PWA', 'desktop'
  primary_keyword?: string;
  monthly_search_volume?: number;
  cpc_usd?: number;
  competition_score?: number; // 0-1 from DataForSEO
  competition_level?: 'low' | 'medium' | 'high' | 'very_high';
  estimated_revenue_low_usd?: number;
  estimated_revenue_high_usd?: number;
  development_cost_usd?: number;
  time_to_mvp_months?: number;
  success_probability: number; // 0-100
  demand_evidence?: string; // Aggregated snippets from Tavily
  why_this_wins?: string;
  validation_raw?: any; // Full JSON validation data
  chosen: boolean;
  built: boolean;
  sold: boolean;
  created_at: string;
}

// API Request/Response Types
export interface GenerateIdeasResponse {
  ideas: Idea[];
  run: IdeaRun;
}

export interface BuildPlanRequest {
  ideaId: string;
}

export interface MarketingPlan {
  personas: string[];
  gtm_strategy: string;
  target_audience: string[];
  launch_channels: string[];
  ad_creatives: string[];
  ninety_day_calendar: string;
}

export interface ProductSpec {
  prd_full: string;
  db_schema: string;
  api_spec: string;
  wireframes_text: string;
  tech_stack: string[];
  core_features: string[];
  mvp_roadmap: string;
}

export interface BuildPlan {
  marketing: MarketingPlan;
  product: ProductSpec;
  markdown_full: string;
}

// Validation Data Types
export interface KeywordVolumeData {
  keyword: string;
  monthly_volume: number;
  cpc: number;
  competition: number;
  intent?: string;
}

export interface TavilySearchResult {
  query: string;
  snippets: string[];
  sources: string[];
}

export interface ValidationResult {
  keyword_data: KeywordVolumeData;
  research_data: TavilySearchResult;
  platform_decision: string;
  success_probability: number;
  competition_level: string;
  estimated_revenue_low: number;
  estimated_revenue_high: number;
  why_this_wins: string;
}

// Composite Ranking Types
export interface RankedIdea extends Idea {
  composite_score: number;
  rank: number;
}
