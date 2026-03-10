import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/ai_generator';

export async function POST(request: Request) {
  try {
    const { level, topic, count } = await request.json();
    const result = await generateAIContent({ level, topic, count });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Content generation failed" }, { status: 500 });
  }
}
