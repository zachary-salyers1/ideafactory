import axios from 'axios'

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ''
const TAVILY_API_URL = 'https://api.tavily.com/search'

export interface TavilyResult {
  query: string
  snippets: string[]
  sources: string[]
  raw_results?: any[]
}

export async function searchTavily(query: string): Promise<TavilyResult> {
  if (!TAVILY_API_KEY) {
    console.warn('TAVILY_API_KEY not set, using mock data')
    return getMockTavilyResults(query)
  }

  try {
    const response = await axios.post(
      TAVILY_API_URL,
      {
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        include_domains: ['reddit.com', 'twitter.com', 'x.com', 'producthunt.com', 'indiehackers.com'],
        max_results: 10,
        include_answer: true,
        include_raw_content: false
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const results = response.data.results || []
    const snippets = results.map((r: any) => r.content || r.snippet).filter(Boolean)
    const sources = results.map((r: any) => r.url).filter(Boolean)

    return {
      query,
      snippets: snippets.slice(0, 10),
      sources: sources.slice(0, 10),
      raw_results: results
    }
  } catch (error) {
    console.error('Error searching with Tavily:', error)
    return getMockTavilyResults(query)
  }
}

export async function researchIdea(ideaName: string, keywords: string[]): Promise<TavilyResult[]> {
  const queries = [
    `${ideaName} complaints reddit`,
    `${keywords[0]} alternatives problems`,
    `${keywords[0]} market size revenue`,
    `"${ideaName}" OR "${keywords[0]}" producthunt OR indiehackers`
  ]

  const results = await Promise.all(
    queries.map(async (query) => {
      try {
        return await searchTavily(query)
      } catch (error) {
        console.error(`Failed to search for: ${query}`, error)
        return getMockTavilyResults(query)
      }
    })
  )

  return results
}

function getMockTavilyResults(query: string): TavilyResult {
  return {
    query,
    snippets: [
      `Seeing lots of requests for "${query}" on Twitter/X`,
      `Reddit thread with 500+ upvotes asking for this exact solution`,
      `Existing alternatives are too expensive or complex for small teams`,
      `Market research shows strong demand in Q4 2024 and 2025`,
      `Several indie hackers discussing this opportunity`
    ],
    sources: [
      'https://reddit.com/r/SaaS/mock-thread-1',
      'https://twitter.com/mock-tweet-1',
      'https://indiehackers.com/mock-discussion',
      'https://producthunt.com/mock-product',
      'https://news.ycombinator.com/mock-item'
    ]
  }
}
