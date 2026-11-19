import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Push re-engagement cron is disabled for this release.' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Push re-engagement cron is disabled for this release.' },
    { status: 410 }
  );
}

