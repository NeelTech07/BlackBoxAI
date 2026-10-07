import { NextResponse } from 'next/server';

export async function GET() {
  return handleTokenRequest();
}

export async function POST() {
  return handleTokenRequest();
}

async function handleTokenRequest() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_assemblyai_api_key')) {
    return NextResponse.json({
      isSimulated: true,
      error: 'ASSEMBLYAI_API_KEY not configured. Running in local simulated mode.',
    });
  }

  try {
    const url = 'https://streaming.assemblyai.com/v3/token?expires_in_seconds=600';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: apiKey.trim(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('AssemblyAI V3 token error response:', response.status, errorText);
      return NextResponse.json({
        isSimulated: true,
        error: `AssemblyAI API responded with status ${response.status}: ${errorText}`,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      token: data.token,
      isSimulated: false,
    });
  } catch (err: any) {
    console.error('AssemblyAI V3 token fetch error:', err);
    return NextResponse.json({
      isSimulated: true,
      error: err?.message || 'Failed to connect to AssemblyAI authentication server.',
    });
  }
}
