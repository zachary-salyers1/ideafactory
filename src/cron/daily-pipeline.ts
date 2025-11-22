#!/usr/bin/env tsx
/**
 * Daily Pipeline Cron Job
 * Runs at 7 AM UTC daily to generate and validate new ideas
 *
 * Usage:
 * - Local: npm run cron
 * - Render Cron: Configure as daily job running this script
 */

import { runDailyPipeline } from '@/lib/pipeline/daily-run'

async function main() {
  console.log('🤖 IdeaFactory 2025 - Daily Pipeline Starting...')
  console.log(`⏰ Triggered at: ${new Date().toISOString()}`)
  console.log('─'.repeat(60))

  try {
    const result = await runDailyPipeline()

    console.log('\n' + '─'.repeat(60))
    console.log('✅ Pipeline completed successfully!')
    console.log(`📊 Generated ${result.ideas.length} ideas`)
    console.log(`🏆 Top idea: ${result.ideas[0]?.name}`)
    console.log(`📈 Success rate: ${result.ideas[0]?.success_probability}%`)

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Encountered ${result.errors.length} non-critical errors:`)
      result.errors.forEach(err => console.log(`   - ${err}`))
    }

    process.exit(0)
  } catch (error) {
    console.error('\n' + '─'.repeat(60))
    console.error('❌ Pipeline failed with critical error:')
    console.error(error)

    // In production, you might want to send an alert here
    // e.g., email notification, Slack webhook, etc.

    process.exit(1)
  }
}

// Run the pipeline
main()
