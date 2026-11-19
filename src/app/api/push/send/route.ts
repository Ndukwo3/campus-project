import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Push notifications are disabled for this release.' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Push notifications are disabled for this release.' },
    { status: 410 }
  );
}

