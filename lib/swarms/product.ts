import OpenAI from 'openai'
import { Idea, ProductSpec } from '../types'

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
})

/**
 * Product Swarm - Generates comprehensive product development docs
 * Per PRD: PRD, DB schema, API spec, wireframes (text), tech stack, roadmap
 */
export async function generateProductSpec(idea: Idea): Promise<ProductSpec> {
  const systemPrompt = `You are an expert product manager and technical architect. Create comprehensive product development documentation for the following validated idea.

Your deliverables should include:
1. Complete PRD (Product Requirements Document) in markdown format
2. Database schema (SQL or NoSQL depending on needs)
3. API specification (REST or GraphQL endpoints)
4. Wireframes described in text format (exportable to Figma later)
5. Recommended tech stack with justifications
6. Core features prioritized by MoSCoW method
7. MVP roadmap with week-by-week execution plan

Return a JSON object with:
{
  "prd_full": "<comprehensive PRD in markdown>",
  "db_schema": "<SQL or schema description>",
  "api_spec": "<API endpoints and contracts>",
  "wireframes_text": "<text description of key screens/flows>",
  "tech_stack": ["Technology 1: [reason]", "Technology 2: [reason]", ...],
  "core_features": ["Feature 1 (Must-have)", "Feature 2 (Should-have)", ...],
  "mvp_roadmap": "<week-by-week plan for ${idea.time_to_mvp_months || 3} months>"
}

Consider:
- Platform type (${idea.platform}) when choosing tech stack
- Development cost budget (~$${idea.development_cost_usd?.toLocaleString()})
- Time to MVP (${idea.time_to_mvp_months || 3} months)
- Solo developer / small team constraints
- 2025 best practices (TypeScript, serverless, modern frameworks)`

  const userPrompt = `PRODUCT IDEA:
Name: ${idea.name}
Description: ${idea.one_liner}
Platform: ${idea.platform}

CONSTRAINTS:
- Time to MVP: ${idea.time_to_mvp_months || 3} months
- Development Budget: ~$${idea.development_cost_usd?.toLocaleString()}
- Target: Solo dev or small team (2-3 people)

MARKET CONTEXT:
- Primary Keyword: ${idea.primary_keyword}
- Monthly Search Volume: ${idea.monthly_search_volume?.toLocaleString()}
- Competition: ${idea.competition_level}
- Why This Wins: ${idea.why_this_wins}

Generate complete product specification now.`

  try {
    const completion = await xai.chat.completions.create({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
      max_tokens: 4000
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No product spec generated')
    }

    const spec = JSON.parse(content)

    return {
      prd_full: spec.prd_full || '',
      db_schema: spec.db_schema || '',
      api_spec: spec.api_spec || '',
      wireframes_text: spec.wireframes_text || '',
      tech_stack: spec.tech_stack || [],
      core_features: spec.core_features || [],
      mvp_roadmap: spec.mvp_roadmap || ''
    }
  } catch (error) {
    console.error('Error generating product spec:', error)
    return getMockProductSpec(idea)
  }
}

function getMockProductSpec(idea: Idea): ProductSpec {
  const platform = idea.platform || 'web PWA'
  const months = idea.time_to_mvp_months || 3

  return {
    prd_full: `# Product Requirements Document: ${idea.name}

## Overview
${idea.one_liner}

## Problem Statement
${idea.demand_evidence}

## Solution
${idea.why_this_wins}

## Target Users
- Primary: Early adopters seeking ${idea.primary_keyword}
- Secondary: Power users in adjacent markets

## Success Metrics
- Monthly Active Users (MAU): 1,000 in first 3 months
- Conversion Rate: 5% free-to-paid
- Revenue: $${idea.estimated_revenue_low_usd?.toLocaleString()}-${idea.estimated_revenue_high_usd?.toLocaleString()}/year

## Core Features (MoSCoW)
### Must Have
- User authentication and profiles
- Core ${idea.primary_keyword} functionality
- Payment processing
- Basic analytics

### Should Have
- Email notifications
- Export/import functionality
- Mobile responsiveness

### Could Have
- Integrations with popular tools
- Advanced customization
- Team collaboration features

## Technical Requirements
- Platform: ${platform}
- Performance: < 2s page load
- Uptime: 99.9%
- Security: SOC 2 compliance ready
`,

    db_schema: `-- ${idea.name} Database Schema

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);
`,

    api_spec: `# API Specification: ${idea.name}

## Authentication
All endpoints require Bearer token in Authorization header.

## Endpoints

### Users
- GET /api/users/me - Get current user profile
- PATCH /api/users/me - Update profile
- DELETE /api/users/me - Delete account

### Items
- GET /api/items - List user's items (paginated)
  Query params: ?page=1&limit=20&status=active
- POST /api/items - Create new item
  Body: { title, content }
- GET /api/items/:id - Get item by ID
- PATCH /api/items/:id - Update item
- DELETE /api/items/:id - Delete item

### Subscriptions
- GET /api/subscriptions/plans - List available plans
- POST /api/subscriptions/checkout - Create Stripe checkout session
- POST /api/subscriptions/portal - Get billing portal link
- GET /api/subscriptions/status - Check subscription status

## Webhooks
- POST /api/webhooks/stripe - Handle Stripe events
`,

    wireframes_text: `# Wireframes: ${idea.name}

## 1. Landing Page
- Hero section with value proposition
- 3-feature highlight grid
- Social proof (testimonials)
- CTA: "Start Free Trial"
- Footer with links

## 2. Dashboard (Main App)
- Top navigation: Logo, Search, User menu
- Left sidebar: Main navigation items
- Center panel: List of items (card layout)
- Right panel: Quick actions / stats
- Floating action button: "+ New Item"

## 3. Item Detail View
- Breadcrumb navigation
- Item title (editable inline)
- Rich text content area
- Action toolbar: Save, Delete, Share
- Activity timeline (right sidebar)

## 4. Settings Page
- Tabs: Profile, Billing, Notifications, API
- Profile: Avatar upload, name, email
- Billing: Current plan, usage, upgrade CTA
- Notifications: Toggle preferences

## 5. Mobile View
- Bottom tab navigation
- Hamburger menu for secondary items
- Swipe gestures for quick actions
- Responsive card layouts
`,

    tech_stack: [
      'Next.js 15 - Full-stack React framework with App Router for fast development',
      'TypeScript - Type safety and better DX',
      'Supabase - PostgreSQL database + auth + realtime',
      'Tailwind CSS - Rapid UI development with utility classes',
      'Stripe - Payment processing and subscription management',
      'Vercel - Deployment and hosting (serverless)',
      'shadcn/ui - High-quality component library',
      'React Query - Server state management',
      'Zod - Runtime type validation'
    ],

    core_features: [
      'User Authentication (Must-have) - Email/password + OAuth',
      `Core ${idea.primary_keyword} Engine (Must-have) - Main value prop`,
      'Subscription Management (Must-have) - Free, Pro, Enterprise tiers',
      'Data Import/Export (Should-have) - CSV, JSON formats',
      'Email Notifications (Should-have) - Transactional + marketing',
      'Search & Filters (Should-have) - Find items quickly',
      'API Access (Could-have) - For power users and integrations',
      'Team Collaboration (Could-have) - Share items with team',
      'Mobile Apps (Won\'t-have for MVP) - Focus on responsive web first'
    ],

    mvp_roadmap: `# ${months}-Month MVP Roadmap

## Month 1: Foundation
Week 1-2: Setup & Core Infrastructure
- Initialize Next.js project
- Configure Supabase (database + auth)
- Set up deployment pipeline (Vercel)
- Implement basic UI components

Week 3-4: Authentication & User Management
- Email/password authentication
- User profile pages
- Basic settings functionality
- Protected routes

## Month 2: Core Features
Week 5-6: Main Feature Implementation
- Build core ${idea.primary_keyword} functionality
- Create/read/update/delete operations
- Real-time updates (if needed)
- Basic search

Week 7-8: Polish & Enhancement
- Rich text editor / advanced inputs
- File uploads (if needed)
- Responsive mobile design
- Loading states and error handling

## Month 3: Monetization & Launch
Week 9-10: Payments & Subscriptions
- Stripe integration
- Subscription tiers and limits
- Billing portal
- Usage tracking

Week 11: Testing & QA
- End-to-end testing
- Performance optimization
- Security audit
- Bug fixes

Week 12: Launch
- Landing page finalization
- ProductHunt launch
- Initial marketing push
- Monitor metrics and iterate

## Post-Launch (Month 4+)
- Gather user feedback
- Prioritize feature requests
- Scale infrastructure as needed
- Expand marketing efforts
`.trim()
  }
}
