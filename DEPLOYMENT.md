# IdeaFactory 2025 - Deployment Guide

This guide will help you deploy IdeaFactory 2025 to production.

## Prerequisites

Before deploying, ensure you have:
- [ ] Supabase account (free tier)
- [ ] xAI API key (from https://console.x.ai)
- [ ] Tavily API key (from https://tavily.com)
- [ ] DataForSEO account (from https://dataforseo.com)
- [ ] Vercel or Render account

## Step 1: Set Up Supabase

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `ideafactory-2025`
   - Database password: (generate a strong password)
   - Region: Choose closest to your users

### 1.2 Run Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy the entire contents of `lib/supabase/schema.sql`
3. Paste into the SQL editor
4. Click "Run"
5. Verify tables were created: Go to Table Editor

### 1.3 Get API Credentials

1. Go to Settings → API
2. Copy:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`) ⚠️ Keep this secret!

## Step 2: Get API Keys

### 2.1 xAI (Grok-4)

1. Go to https://console.x.ai
2. Sign up / Log in
3. Go to API Keys
4. Create new API key
5. Copy the key (starts with `xai-...`)
6. Add credits to your account ($5-10 recommended for testing)

### 2.2 Tavily

1. Go to https://tavily.com
2. Sign up for an account
3. Go to Dashboard → API Keys
4. Copy your API key (starts with `tvly-...`)
5. Free tier includes 1,000 searches/month

### 2.3 DataForSEO

1. Go to https://dataforseo.com
2. Sign up for an account
3. Go to Dashboard
4. Note your login email and password
5. Add $10-20 credits for testing (keyword queries are ~$0.001 each)

## Step 3: Deploy to Vercel (Recommended)

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Framework Preset: Next.js (should auto-detect)

### 3.2 Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```env
# xAI
XAI_API_KEY=xai-your-key-here

# Tavily
TAVILY_API_KEY=tvly-your-key-here

# DataForSEO
DATAFORSEO_LOGIN=your@email.com
DATAFORSEO_PASSWORD=your_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployment URL
4. You should see the dashboard (empty at first)

## Step 4: Set Up Daily Cron Job

Vercel doesn't support background cron jobs on the free tier. Use one of these options:

### Option A: Render Cron (Recommended)

1. Create account at [render.com](https://render.com)
2. Create new "Cron Job":
   - Name: `ideafactory-pipeline`
   - Command: `npm run cron`
   - Schedule: `0 7 * * *` (7 AM UTC daily)
   - Add same environment variables as Vercel
3. Deploy and test with "Run Now"

### Option B: GitHub Actions

1. Add secrets to your GitHub repo (Settings → Secrets)
2. Create `.github/workflows/daily-pipeline.yml`:

```yaml
name: Daily Idea Pipeline
on:
  schedule:
    - cron: '0 7 * * *'  # 7 AM UTC daily
  workflow_dispatch:

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

### Option C: External Cron Service (EasyCron, cron-job.org)

1. Create HTTP endpoint in your app: `app/api/cron/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { runDailyPipeline } from '@/lib/pipeline/daily-run'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runDailyPipeline()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
```

2. Set up external cron to call: `https://your-app.vercel.app/api/cron`
3. Add `CRON_SECRET` to environment variables

## Step 5: Test the Pipeline

### 5.1 Manual Test

SSH into your Render cron job or run locally:

```bash
npm run test:pipeline
```

Watch the output for:
- ✅ Ideas generated
- ✅ Validation completed
- ✅ Ranked and stored

### 5.2 Check Database

1. Go to Supabase Table Editor
2. Open `ideas` table
3. You should see 10-15 new ideas

### 5.3 Check Dashboard

1. Visit your Vercel deployment URL
2. Go to `/dashboard`
3. You should see ideas with metrics
4. Click "View Details" on any idea
5. Click "Build This" to test swarms

## Step 6: Monitor and Maintain

### Daily Monitoring

Check these daily:
- Supabase: New ideas being added
- Vercel/Render logs: No errors
- API credits: Sufficient balance

### Cost Monitoring

Set up billing alerts for:
- xAI: Alert at $5 usage
- Tavily: Alert at 800 searches
- DataForSEO: Alert at $15 usage
- Supabase: Monitor database size

### Troubleshooting

**Pipeline fails:**
- Check API keys are valid
- Verify sufficient credits
- Check Render/GitHub Actions logs

**No ideas appearing:**
- Run pipeline manually: `npm run test:pipeline`
- Check Supabase RLS policies
- Verify API routes working

**Build plans not generating:**
- Check xAI API has credits
- Verify idea ID is valid
- Check browser console for errors

## Step 7: Optional Enhancements

### Email Notifications

1. Sign up for SendGrid/Resend
2. Add `SENDGRID_API_KEY` to env
3. Implement email service in `lib/services/email.ts`
4. Add notification calls in pipeline

### Custom Domain

1. In Vercel: Settings → Domains
2. Add your domain
3. Update DNS records
4. SSL auto-configured

### Analytics

1. Add Vercel Analytics (built-in)
2. Or add PostHog/Plausible:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] All API keys obtained
- [ ] Environment variables configured
- [ ] App deployed to Vercel
- [ ] Cron job set up (Render/GitHub Actions)
- [ ] Manual pipeline test completed
- [ ] Dashboard accessible and working
- [ ] Build plan generation tested
- [ ] Monitoring set up
- [ ] Billing alerts configured

## Support

If you encounter issues:
1. Check the main README troubleshooting section
2. Review Vercel/Render deployment logs
3. Check Supabase logs
4. Verify all environment variables are set correctly

---

**🎉 Congratulations! Your IdeaFactory 2025 is now live and generating ideas daily!**
