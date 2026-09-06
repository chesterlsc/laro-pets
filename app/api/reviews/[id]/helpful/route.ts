import { NextResponse } from 'next/server';
import { markHelpful } from '@/lib/reviews';

export const runtime = 'nodejs';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  try {
    const helpful = await markHelpful(id);
    if (helpful === null) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ helpful });
  } catch (e) {
    console.error('[reviews] helpful failed', e);
    return NextResponse.json({ error: 'Try again later' }, { status: 500 });
  }
}
