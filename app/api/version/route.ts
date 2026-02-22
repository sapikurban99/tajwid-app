import { NextResponse } from 'next/server';

// We can use a build-time variable or just the current server time formatted string to define versions safely across builds
const version = process.env.NEXT_PUBLIC_APP_VERSION || new Date().toISOString();

export async function GET() {
    return NextResponse.json({ version });
}
