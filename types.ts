export type Platform = 'Mobile' | 'Web' | 'Desktop' | 'Extension';
export type CompetitionLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Idea {
  id: string;
  name: string;
  one_liner: string;
  platform: Platform;
  monthly_search_volume: number;
  competition_level: CompetitionLevel;
  estimated_revenue_low_usd: number;
  estimated_revenue_high_usd: number;
  success_probability: number; // 0-100
  why_this_wins: string;
  created_at: string;
  chosen: boolean;
}

export interface MarketingPlan {
  gtm_strategy: string;
  target_audience: string[];
  launch_channels: string[];
}

export interface ProductSpec {
  core_features: string[];
  tech_stack: string[];
  mvp_roadmap: string;
}

export interface BuildPlan {
  marketing: MarketingPlan;
  product: ProductSpec;
  markdown_full: string;
}
