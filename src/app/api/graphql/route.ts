// app/api/graphql/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // You might want to get these from your environment variables
    const API_KEY = process.env.API_KEY;
    const API_SECRET = process.env.API_SECRET;

    const res = await fetch(process.env.HYPERMODE_API_ENDPOINT as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-api-key': API_SECRET || '',
        // Add any other required headers
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    // Handle non-JSON responses
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If the response isn't JSON, return the text as an error
      return NextResponse.json(
        { error: text },
        { status: res.status }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || 'API request failed' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from GraphQL endpoint' },
      { status: 500 }
    );
  }
}