import axios from 'axios'

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || ''
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || ''
const DATAFORSEO_API_URL = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live'

export interface KeywordData {
  keyword: string
  monthly_volume: number
  cpc: number // USD
  competition: number // 0-1
  competition_level: 'low' | 'medium' | 'high' | 'very_high'
  intent?: string
}

export async function getKeywordVolume(keywords: string[]): Promise<KeywordData[]> {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.warn('DataForSEO credentials not set, using mock data')
    return getMockKeywordData(keywords)
  }

  try {
    const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')

    const response = await axios.post(
      DATAFORSEO_API_URL,
      [{
        keywords: keywords.slice(0, 5), // Limit to 5 keywords per request
        location_code: 2840, // USA
        language_code: 'en',
        search_partners: false,
        date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0]
      }],
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const results = response.data?.tasks?.[0]?.result || []

    return results.map((item: any) => {
      const competition = item.competition || 0
      let competition_level: 'low' | 'medium' | 'high' | 'very_high' = 'medium'

      if (competition < 0.3) competition_level = 'low'
      else if (competition < 0.6) competition_level = 'medium'
      else if (competition < 0.8) competition_level = 'high'
      else competition_level = 'very_high'

      return {
        keyword: item.keyword,
        monthly_volume: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition,
        competition_level,
        intent: item.keyword_annotations?.concepts?.[0] || undefined
      }
    })
  } catch (error) {
    console.error('Error fetching keyword data from DataForSEO:', error)
    return getMockKeywordData(keywords)
  }
}

export async function getBestKeyword(keywords: string[]): Promise<KeywordData> {
  const data = await getKeywordVolume(keywords)

  // Sort by monthly volume descending
  const sorted = data.sort((a, b) => b.monthly_volume - a.monthly_volume)

  return sorted[0] || getMockKeywordData([keywords[0]])[0]
}

function getMockKeywordData(keywords: string[]): KeywordData[] {
  return keywords.map((keyword, index) => {
    // Generate pseudo-random but consistent data based on keyword
    const hash = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const volume = (hash % 50000) + 10000 // 10k - 60k range
    const cpc = ((hash % 500) / 100) + 0.5 // $0.50 - $5.50 range
    const competition = (hash % 100) / 100 // 0-1 range

    let competition_level: 'low' | 'medium' | 'high' | 'very_high' = 'medium'
    if (competition < 0.3) competition_level = 'low'
    else if (competition < 0.6) competition_level = 'medium'
    else if (competition < 0.8) competition_level = 'high'
    else competition_level = 'very_high'

    return {
      keyword,
      monthly_volume: Math.floor(volume),
      cpc: Math.round(cpc * 100) / 100,
      competition: Math.round(competition * 100) / 100,
      competition_level,
      intent: index === 0 ? 'transactional' : 'informational'
    }
  })
}
