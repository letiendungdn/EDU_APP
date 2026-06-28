import { NextResponse } from 'next/server';
import { probeEnglishApp } from '@/lib/english-app';

export const dynamic = 'force-dynamic';

export async function GET() {
  const english = await probeEnglishApp();
  return NextResponse.json({ english });
}
