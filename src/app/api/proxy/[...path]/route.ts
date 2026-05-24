import { NextRequest, NextResponse } from 'next/server';

// Server-side only — never exposed to browser
const BACKEND_BASE_URL = process.env.API_BASE_URL || 'https://allohbackend.onrender.com/api/v1';

async function handleRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');

  // Preserve query string params
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_BASE_URL}/${targetPath}${searchParams ? `?${searchParams}` : ''}`;

  // Forward all headers except host (we set it ourselves via fetch)
  const forwardHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Forward Authorization header if present
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    forwardHeaders['Authorization'] = authHeader;
  }

  // Forward body for mutation methods
  let body: string | undefined;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      body = await request.text();
    } catch {
      // No body — that's fine for DELETE requests
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: body || undefined,
      // Disable Next.js fetch caching for all proxy calls
      cache: 'no-store',
    });

    const responseText = await backendResponse.text();

    // Parse JSON if possible, otherwise forward raw text
    let responseBody: any;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    return NextResponse.json(responseBody, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err: any) {
    console.error(`[User Proxy] Failed to reach backend at ${targetUrl}:`, err?.message);
    return NextResponse.json(
      { error: 'Failed to connect to the backend service. Please try again later.' },
      { status: 502 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
