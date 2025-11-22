'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Rocket, Download, CheckCircle2, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Idea, BuildPlan } from '@/lib/types'

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [buildPlan, setBuildPlan] = useState<BuildPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchIdea()
  }, [params.id])

  async function fetchIdea() {
    try {
      const response = await fetch(`/api/ideas/${params.id}`)
      const data = await response.json()
      setIdea(data.idea)
    } catch (error) {
      console.error('Failed to fetch idea:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleBuildThis() {
    if (!idea) return

    setGenerating(true)
    try {
      const response = await fetch('/api/build-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id })
      })

      const data = await response.json()
      setBuildPlan(data.buildPlan)

      // Update idea as chosen
      setIdea({ ...idea, chosen: true })
    } catch (error) {
      console.error('Failed to generate build plan:', error)
      alert('Failed to generate build plan. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  function downloadMarkdown() {
    if (!buildPlan) return

    const blob = new Blob([buildPlan.markdown_full], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${idea?.name.replace(/\s+/g, '-')}-build-plan.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
          <p className="mt-4 text-slate-400">Loading idea...</p>
        </div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Idea not found</h2>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{idea.name}</h1>
              <p className="text-lg text-slate-400 mt-2">{idea.one_liner}</p>
            </div>
            {idea.chosen && (
              <Badge variant="success" className="flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Chosen</span>
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-400">Success Probability</p>
              <p className="text-4xl font-bold text-emerald-400 mt-2">
                {idea.success_probability}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-400">Monthly Searches</p>
              <p className="text-4xl font-bold text-blue-400 mt-2">
                {idea.monthly_search_volume?.toLocaleString() || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-400">Revenue Potential</p>
              <p className="text-2xl font-bold text-emerald-400 mt-2">
                ${idea.estimated_revenue_low_usd?.toLocaleString()} - $
                {idea.estimated_revenue_high_usd?.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">Annual</p>
            </CardContent>
          </Card>
        </div>

        {/* Validation Details */}
        <div className="space-y-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Why This Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">{idea.why_this_wins}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demand Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {idea.demand_evidence}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Platform</p>
                  <p className="text-lg font-medium text-slate-100 mt-1">{idea.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Primary Keyword</p>
                  <p className="text-lg font-medium text-slate-100 mt-1">
                    {idea.primary_keyword || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Competition</p>
                  <p className="text-lg font-medium text-slate-100 mt-1 capitalize">
                    {idea.competition_level?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">CPC</p>
                  <p className="text-lg font-medium text-slate-100 mt-1">
                    ${idea.cpc_usd?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Dev Cost</p>
                  <p className="text-lg font-medium text-slate-100 mt-1">
                    ${idea.development_cost_usd?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Time to MVP</p>
                  <p className="text-lg font-medium text-slate-100 mt-1">
                    {idea.time_to_mvp_months || 'N/A'} months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Build This Button */}
        {!buildPlan && (
          <div className="mb-8">
            <Card className="border-2 border-blue-500/50 bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">
                      Ready to build this idea?
                    </h3>
                    <p className="text-slate-400">
                      Generate a comprehensive build plan including GTM strategy, product specs,
                      tech stack, and roadmap.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleBuildThis}
                    loading={generating}
                    className="ml-4"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Build This
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Build Plan */}
        {buildPlan && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-2" />
                Build Plan Generated
              </h2>
              <Button onClick={downloadMarkdown} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Markdown
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Marketing Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Target Personas</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {buildPlan.marketing.personas.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">GTM Strategy</h4>
                  <p className="text-slate-300 whitespace-pre-wrap">
                    {buildPlan.marketing.gtm_strategy}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Launch Channels</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {buildPlan.marketing.launch_channels.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(buildPlan.marketing.ninety_day_calendar)}
                >
                  Copy 90-Day Calendar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🛠 Product Specification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Recommended Tech Stack</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {buildPlan.product.tech_stack.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Core Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {buildPlan.product.core_features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(buildPlan.product.db_schema)}
                  >
                    Copy DB Schema
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(buildPlan.product.api_spec)}
                  >
                    Copy API Spec
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(buildPlan.product.prd_full)}
                  >
                    Copy Full PRD
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🗺️ MVP Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-4 rounded-lg overflow-x-auto">
                  {buildPlan.product.mvp_roadmap}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
