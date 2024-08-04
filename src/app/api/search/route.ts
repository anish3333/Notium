import { semanticSearch } from '@/lib/search/semanticSearch';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log("in the api");
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q');
  const userId = searchParams.get('userId');

  console.log(query, userId, "from the server");

  if (!query || !userId) {
    return NextResponse.json({ error: 'Missing query or userId' }, { status: 400 });
  }

  try {
    const results = await semanticSearch(query, userId);
    // console.log("results", results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}