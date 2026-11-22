import { NextRequest, NextResponse } from 'next/server';

// Server-side only — never exposed to browser
const BACKEND_BASE_URL = process.env.API_BASE_URL || 'https://allohbackend.onrender.com/api/v1';

// Statuses whose responses must not have a body.
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

async function handleRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');

  // Preserve query string params
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_BASE_URL}/${targetPath}${searchParams ? `?${searchParams}` : ''}`;

  // Forward all headers except host (we set it ourselves via fetch)
  const forwardHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Forward Content-Type exactly as-is (essential for multipart/form-data file uploads)
  const contentType = request.headers.get('content-type');
  if (contentType) {
    forwardHeaders['Content-Type'] = contentType;
  } else {
    forwardHeaders['Content-Type'] = 'application/json';
  }

  // Forward Authorization header if present
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    forwardHeaders['Authorization'] = authHeader;
  }

  // Forward body as binary buffer to preserve multipart file upload data
  let body: ArrayBuffer | undefined = undefined;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      const buffer = await request.arrayBuffer();
      if (buffer.byteLength > 0) {
        body = buffer;
      }
    } catch {
      // No body — that's fine
    }
  }

  let backendResponse: Response;
  let responseText: string;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: body || undefined,
      // Disable Next.js fetch caching for all proxy calls
      cache: 'no-store',
    });
    responseText = NULL_BODY_STATUSES.has(backendResponse.status) ? '' : await backendResponse.text();
  } catch (err) {
    console.error(`[User Proxy] Failed to reach backend at ${targetUrl}:`, err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to connect to the backend service. Please try again later.' },
      { status: 502 }
    );
  }

  // e.g. 204 from a DELETE: a Response with these statuses can't carry a body (the
  // constructor throws), so pass the status through with no body.
  if (NULL_BODY_STATUSES.has(backendResponse.status)) {
    return new Response(null, { status: backendResponse.status });
  }

  // Parse JSON if possible, otherwise forward raw text
  let responseBody: unknown;
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
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
