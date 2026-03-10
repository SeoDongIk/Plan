import { NextResponse } from 'next/server';
import { extractTrendTopics } from '@/lib/topic_extractor';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { count, baseKeyword } = body;

    if (!count || typeof count !== 'number') {
      return NextResponse.json({ error: "올바른 count N 값을 제공해야 합니다." }, { status: 400 });
    }

    const topics = await extractTrendTopics(count, baseKeyword || "AI 트렌드");

    return NextResponse.json({
      success: true,
      topics
    });
  } catch (error: any) {
    console.error("[POST /api/extract] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to extract topics" }, { status: 500 });
  }
}
