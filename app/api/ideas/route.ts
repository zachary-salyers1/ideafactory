import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * GET /api/ideas
 * Fetch all ideas with optional filtering and sorting
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const platform = searchParams.get('platform')
    const chosen = searchParams.get('chosen')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    let query = supabase
      .from('ideas')
      .select('*')

    // Filters
    if (platform) {
      query = query.eq('platform', platform)
    }

    if (chosen !== null) {
      query = query.eq('chosen', chosen === 'true')
    }

    // Sorting
    query = query.order(sortBy as any, { ascending: order === 'asc' })

    // Limit
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ideas: data })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
