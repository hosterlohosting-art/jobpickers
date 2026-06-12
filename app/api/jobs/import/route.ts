import { NextResponse } from 'next/server';
import { handleImport } from '../../../../lib/sync-engine';

export async function POST(request: Request) {
  // Security check: Protect the crawler endpoint in production from unauthorized triggers
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized crawler request', { status: 401 });
    }
  }

  let sourceId: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    sourceId = body.sourceId || null;
  } catch (e) {
    // Body reading might fail if request is empty
  }

  try {
    const result = await handleImport(sourceId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unexpected Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Security check: Protect the crawler endpoint in production from unauthorized triggers
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized crawler request', { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId');

  try {
    const result = await handleImport(sourceId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unexpected Internal Server Error' },
      { status: 500 }
    );
  }
}
