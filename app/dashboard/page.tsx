'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Lightbulb, TrendingUp, DollarSign, Target, Smartphone, Globe, Monitor, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Idea } from '@/lib/types'

type SortField = 'created_at' | 'success_probability' | 'monthly_search_volume' | 'estimated_revenue_high_usd'
type SortOrder = 'asc' | 'desc'

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    fetchIdeas()
  }, [])

  async function fetchIdeas() {
    try {
      const response = await fetch('/api/ideas?limit=100')
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error('Failed to fetch ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedIdeas = useMemo(() => {
    return [...ideas].sort((a, b) => {
      const aVal = a[sortField] || 0
      const bVal = b[sortField] || 0

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }, [ideas, sortField, sortOrder])

  const stats = useMemo(() => {
    const totalIdeas = ideas.length
    const avgSuccess = ideas.reduce((sum, i) => sum + i.success_probability, 0) / totalIdeas || 0
    const highConfidence = ideas.filter(i => i.success_probability >= 80).length
    const totalPipeline = ideas.reduce((sum, i) => sum + (i.estimated_revenue_high_usd || 0), 0)

    return {
      totalIdeas,
      avgSuccess: Math.round(avgSuccess),
      highConfidence,
      totalPipeline
    }
  }, [ideas])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  function getPlatformIcon(platform: string) {
    if (platform.includes('mobile')) return <Smartphone className="w-4 h-4" />
    if (platform.includes('desktop')) return <Monitor className="w-4 h-4" />
    return <Globe className="w-4 h-4" />
  }

  function getCompetitionBadge(level?: string) {
    switch (level) {
      case 'low':
        return <Badge variant="success">Low</Badge>
      case 'medium':
        return <Badge variant="default">Medium</Badge>
      case 'high':
        return <Badge variant="warning">High</Badge>
      case 'very_high':
        return <Badge variant="danger">Very High</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  function getSuccessBadge(probability: number) {
    if (probability >= 85) return <Badge variant="success">{probability}%</Badge>
    if (probability >= 70) return <Badge variant="default">{probability}%</Badge>
    return <Badge variant="warning">{probability}%</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
          <p className="mt-4 text-slate-400">Loading ideas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">IdeaFactory 2025</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Ideas</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">{stats.totalIdeas}</p>
                </div>
                <Lightbulb className="w-10 h-10 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Pipeline Value</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">
                    ${(stats.totalPipeline / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-emerald-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Avg Success</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">{stats.avgSuccess}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">High Confidence</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">{stats.highConfidence}</p>
                </div>
                <Target className="w-10 h-10 text-emerald-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ideas Table */}
        <Card>
          <CardHeader>
            <CardTitle>Validated Ideas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Platform
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                      onClick={() => toggleSort('monthly_search_volume')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Search Volume</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Competition
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                      onClick={() => toggleSort('estimated_revenue_high_usd')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Revenue Range</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                      onClick={() => toggleSort('success_probability')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Success</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sortedIdeas.map((idea, index) => (
                    <tr key={idea.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-100">{idea.name}</div>
                          <div className="text-sm text-slate-400 truncate max-w-xs">
                            {idea.one_liner}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-slate-300">
                          {getPlatformIcon(idea.platform)}
                          <span className="text-sm">{idea.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {idea.monthly_search_volume?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCompetitionBadge(idea.competition_level)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        ${idea.estimated_revenue_low_usd?.toLocaleString()} - $
                        {idea.estimated_revenue_high_usd?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSuccessBadge(idea.success_probability)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/idea/${idea.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {ideas.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-400 mb-2">No ideas yet</h3>
            <p className="text-slate-500">
              Run the daily pipeline to generate validated ideas
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
