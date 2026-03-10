import { NextResponse } from 'next/server';
import { getAITrends, getShoppingLink } from '@/lib/serpapi_service';

export async function GET() {
  try {
    const trends = await getAITrends();
    return NextResponse.json(trends);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { keyword } = await request.json();
  try {
    const links = await getShoppingLink(keyword);
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shopping links" }, { status: 500 });
  }
}
