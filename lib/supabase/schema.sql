-- IdeaFactory 2025 Database Schema
-- Run this in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Daily run metadata
CREATE TABLE IF NOT EXISTS idea_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  ideas_generated INTEGER NOT NULL,
  top_success_score INTEGER,
  average_search_volume INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual ideas
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES idea_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  one_liner TEXT NOT NULL,
  platform TEXT NOT NULL,
  primary_keyword TEXT,
  monthly_search_volume INTEGER,
  cpc_usd NUMERIC,
  competition_score NUMERIC CHECK (competition_score >= 0 AND competition_score <= 1),
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high', 'very_high')),
  estimated_revenue_low_usd NUMERIC,
  estimated_revenue_high_usd NUMERIC,
  development_cost_usd NUMERIC,
  time_to_mvp_months INTEGER,
  success_probability INTEGER CHECK (success_probability BETWEEN 0 AND 100),
  demand_evidence TEXT,
  why_this_wins TEXT,
  validation_raw JSONB,
  chosen BOOLEAN DEFAULT FALSE,
  built BOOLEAN DEFAULT FALSE,
  sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE idea_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policies (These will allow access for authenticated users)
-- You should update these policies to match your user ID after creating your account

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON idea_runs;
CREATE POLICY "Enable read access for authenticated users"
  ON idea_runs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON idea_runs;
CREATE POLICY "Enable insert for authenticated users"
  ON idea_runs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON idea_runs;
CREATE POLICY "Enable update for authenticated users"
  ON idea_runs FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ideas;
CREATE POLICY "Enable read access for authenticated users"
  ON ideas FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ideas;
CREATE POLICY "Enable insert for authenticated users"
  ON ideas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON ideas;
CREATE POLICY "Enable update for authenticated users"
  ON ideas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_run_id ON ideas(run_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_success_prob ON ideas(success_probability DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_chosen ON ideas(chosen) WHERE chosen = TRUE;
CREATE INDEX IF NOT EXISTS idx_idea_runs_run_date ON idea_runs(run_date DESC);

-- Function to get top ideas by composite score
CREATE OR REPLACE FUNCTION calculate_composite_score(
  success_prob INTEGER,
  search_vol INTEGER,
  revenue_high NUMERIC,
  comp_level TEXT
)
RETURNS NUMERIC AS $$
DECLARE
  comp_bonus NUMERIC := 0;
  normalized_volume NUMERIC := 0;
  normalized_revenue NUMERIC := 0;
BEGIN
  -- Competition bonus (inverse)
  CASE comp_level
    WHEN 'low' THEN comp_bonus := 0.1;
    WHEN 'medium' THEN comp_bonus := 0.05;
    WHEN 'high' THEN comp_bonus := 0.0;
    WHEN 'very_high' THEN comp_bonus := -0.1;
    ELSE comp_bonus := 0;
  END CASE;

  -- Normalize search volume (cap at 1M)
  IF search_vol IS NOT NULL THEN
    normalized_volume := LEAST(search_vol::NUMERIC / 1000000, 1.0);
  END IF;

  -- Normalize revenue (cap at 5M)
  IF revenue_high IS NOT NULL THEN
    normalized_revenue := LEAST(revenue_high / 5000000, 1.0);
  END IF;

  -- Composite score formula from PRD
  RETURN (0.4 * success_prob / 100) +
         (0.3 * normalized_volume) +
         (0.2 * normalized_revenue) +
         comp_bonus;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON TABLE idea_runs IS 'Stores metadata for each daily idea generation run';
COMMENT ON TABLE ideas IS 'Stores individual validated product ideas with all metrics';
