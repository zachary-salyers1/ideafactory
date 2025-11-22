# IdeaFactory 2025 🚀

> **Autonomous daily profitable-idea generation machine powered by AI**

IdeaFactory 2025 is a fully automated system that generates, validates, ranks, and stores 10-15 high-potential software product ideas every day. It leverages Grok-4 for ideation, real-time APIs for validation, and specialized agent swarms to create comprehensive build plans.

![IdeaFactory Banner](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Features

### Core Pipeline (Automated Daily at 7 AM UTC)
- **AI-Powered Generation**: Grok-4 generates 12-18 raw ideas based on 2025 macro trends
- **Multi-Source Validation**:
  - Tavily for deep market research (Reddit, Twitter, ProductHunt)
  - DataForSEO for keyword volume and competition analysis
  - Grok-4 validation agent for scoring and assessment
- **Smart Ranking**: Composite algorithm ranks ideas by success probability, search volume, revenue potential, and competition
- **Database Storage**: Persistent storage in Supabase with full audit trail

### Agent Swarms (On-Demand)
- **Marketing Swarm**: Generates comprehensive GTM strategy, personas, ad creatives, and 90-day launch calendar
- **Product Swarm**: Creates PRD, database schema, API specs, wireframes, tech stack recommendations, and MVP roadmap

### Dashboard UI
- Real-time idea browsing with sortable/filterable table
- Key metrics overview (total ideas, pipeline value, avg success rate)
- Detailed idea views with full validation data
- One-click "Build This" button to generate execution plans
- Export build plans as Markdown for Linear/project management tools

## 🏗️ Architecture

```
Daily at 7 AM → Idea Discovery Agent (Grok-4 + Tavily + DataForSEO)
        ↓
Stores 10-15 validated ideas + ALL data in Supabase
        ↓
You open Dashboard → see ranked ideas → click "BUILD THIS"
        ↓
Two specialized agent swarms activate automatically:
   ├→ Marketing Swarm → Full GTM strategy, competitor analysis, ad creatives
   └→ Product Swarm → PRD, DB schema, API spec, wireframes, tech stack, roadmap
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- API keys for: xAI (Grok), Tavily, DataForSEO

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ideafactory
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:

```bash
# Copy the contents of lib/supabase/schema.sql
# Paste into Supabase SQL Editor and execute
```

3. Get your credentials from Settings → API

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# xAI (Grok-4) - Get from https://console.x.ai
XAI_API_KEY=xai-xxxxxxxxxxxxxxxx

# Tavily - Get from https://tavily.com
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx

# DataForSEO - Get from https://dataforseo.com
DATAFORSEO_LOGIN=your@email.com
DATAFORSEO_PASSWORD=your_password

# Supabase - Get from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### 5. Test the Pipeline

Run the daily pipeline manually to generate your first batch of ideas:

```bash
npm run test:pipeline
```

This will:
1. Generate 12-18 raw ideas with Grok-4
2. Validate each with Tavily + DataForSEO
3. Rank by composite score
4. Store top 10-15 in Supabase

Check your dashboard to see the results!

## 📅 Automated Daily Runs

### Option A: Render Cron (Recommended for Production)

1. Deploy your app to [Render](https://render.com)
2. Create a new **Cron Job**:
   - Name: `ideafactory-daily-pipeline`
   - Command: `npm run cron`
   - Schedule: `0 7 * * *` (7 AM UTC daily)
   - Environment: Same as your web service

### Option B: Local Cron (Development)

Add to your crontab:

```bash
crontab -e

# Add this line (adjust path to your project)
0 7 * * * cd /path/to/ideafactory && npm run cron >> /var/log/ideafactory.log 2>&1
```

### Option C: GitHub Actions (Alternative)

Create `.github/workflows/daily-pipeline.yml`:

```yaml
name: Daily Idea Pipeline
on:
  schedule:
    - cron: '0 7 * * *'  # 7 AM UTC daily
  workflow_dispatch:  # Allow manual triggers

jobs:
  run-pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run cron
        env:
          XAI_API_KEY: ${{ secrets.XAI_API_KEY }}
          TAVILY_API_KEY: ${{ secrets.TAVILY_API_KEY }}
          DATAFORSEO_LOGIN: ${{ secrets.DATAFORSEO_LOGIN }}
          DATAFORSEO_PASSWORD: ${{ secrets.DATAFORSEO_PASSWORD }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 🎨 Usage

### Viewing Ideas

1. Open dashboard at `/dashboard`
2. Browse ranked ideas sorted by success probability
3. Click column headers to sort by different metrics
4. Click "View Details" to see full validation data

### Building an Idea

1. Click "View Details" on any idea
2. Review market data, demand evidence, and metrics
3. Click "Build This" button
4. Wait 30-60 seconds for swarms to generate:
   - Complete marketing plan
   - Full product specification
   - Database schema
   - API specification
   - MVP roadmap
5. Download as Markdown or copy sections to clipboard

### Exporting to Linear

1. Generate build plan for an idea
2. Click "Download Markdown"
3. In Linear, create new project
4. Paste the markdown content
5. Linear will auto-parse into tasks and milestones

## 🔧 Tech Stack

| Category | Technology | Reason |
|----------|-----------|--------|
| **Framework** | Next.js 15 | App Router, Server Actions, optimal DX |
| **Language** | TypeScript | Type safety, better maintainability |
| **Database** | Supabase (PostgreSQL) | Auth, RLS, realtime, generous free tier |
| **AI/LLM** | Grok-4 (xAI) | Superior reasoning, cost-effective |
| **Research** | Tavily | Deep web search, social signals |
| **SEO Data** | DataForSEO | Accurate keyword volumes and competition |
| **UI** | Tailwind CSS | Rapid styling, consistent design |
| **Icons** | Lucide React | Beautiful, consistent icon set |
| **Hosting** | Vercel / Render | Serverless, easy deployment |

## 📊 Cost Estimate

Based on daily runs with 15 ideas validated:

| Service | Usage | Cost/Day | Cost/Month |
|---------|-------|----------|------------|
| xAI (Grok-4) | ~20 API calls | $0.10 | $3.00 |
| Tavily | ~60 searches | $0.30 | $9.00 |
| DataForSEO | ~75 keywords | $0.08 | $2.40 |
| Supabase | Free tier | $0.00 | $0.00 |
| Vercel/Render | Free tier | $0.00 | $0.00 |
| **Total** | | **~$0.48** | **~$14.40** |

## 🔐 Security Notes

- All API keys are server-side only (never exposed to client)
- Supabase Row Level Security (RLS) enforces data privacy
- Service role key used only in cron jobs (never in browser)
- Environment variables never committed to git
- HTTPS enforced in production

## 🧪 Development Scripts

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run cron         # Run daily pipeline manually
npm run test:pipeline # Test pipeline (alias for cron)
```

## 📁 Project Structure

```
ideafactory/
├── app/                      # Next.js App Router
│   ├── dashboard/            # Main dashboard page
│   ├── idea/[id]/            # Detailed idea view
│   ├── api/                  # API routes
│   │   ├── ideas/            # Ideas CRUD
│   │   └── build-plan/       # Build plan generation
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── services/             # External API integrations
│   │   ├── grok.ts           # xAI Grok-4 client
│   │   ├── tavily.ts         # Tavily search
│   │   ├── dataforseo.ts     # Keyword data
│   │   └── validator.ts      # Idea validation
│   ├── swarms/               # Agent swarms
│   │   ├── marketing.ts      # Marketing plan generator
│   │   └── product.ts        # Product spec generator
│   ├── pipeline/             # Core pipeline logic
│   │   └── daily-run.ts      # Main orchestrator
│   ├── supabase/             # Database
│   │   ├── client.ts         # Supabase clients
│   │   └── schema.sql        # Database schema
│   ├── utils/                # Utilities
│   │   └── ranking.ts        # Composite scoring
│   └── types.ts              # TypeScript types
├── src/
│   └── cron/                 # Cron job scripts
│       └── daily-pipeline.ts # Daily runner
├── .env.example              # Environment template
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## 🐛 Troubleshooting

### Pipeline fails with API errors

- Check your API keys are valid and have credits
- Verify network connectivity
- Check Render/server logs for detailed errors

### No ideas showing in dashboard

- Run `npm run test:pipeline` manually first
- Check Supabase database has rows in `ideas` table
- Verify RLS policies allow reads

### Build plan generation fails

- Check xAI API key has sufficient credits
- Ensure idea ID is valid
- Check browser console for errors

### Cron job not running

- Verify cron schedule syntax
- Check timezone settings (UTC vs local)
- Review Render cron job logs

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built following the comprehensive PRD for IdeaFactory 2025. Powered by:
- [xAI Grok-4](https://x.ai) for superior AI reasoning
- [Tavily](https://tavily.com) for deep web research
- [DataForSEO](https://dataforseo.com) for SEO data
- [Supabase](https://supabase.com) for database and auth

## 🚀 What's Next?

- [ ] Add email notifications for daily summaries
- [ ] Implement team collaboration features
- [ ] Add "Sell This" feature for Acquire.com listings
- [ ] Mobile app (React Native)
- [ ] API access for power users
- [ ] Integration with Linear, Notion, Airtable

---

**Made with ❤️ for indie founders who ship fast**
