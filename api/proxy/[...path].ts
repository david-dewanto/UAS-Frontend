// src/api/proxy/[...path].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/+$/, ''); 
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const ALLOWED_ORIGINS = [
  'https://fintrackit.my.id',
  'https://www.fintrackit.my.id'
];

// Helper to validate request method
const isValidMethod = (method: string): boolean => {
  return ALLOWED_METHODS.includes(method.toUpperCase());
};

// Helper to validate origin
const isValidOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
};

// Helper to sanitize and validate path
const sanitizePath = (pathSegments: string[]): string => {
  // Remove any null, undefined, or empty strings
  // Important: Remove trailing slash
  const path = pathSegments
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
    .join('/');
  return path.endsWith('/') ? path.slice(0, -1) : path;  // Remove trailing slash
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('Incoming Proxy Request:', {
    method: req.method,
    url: req.url,
    path: req.query.path,
    headers: req.headers,
    body: req.body
  });

  try {
    if (!BACKEND_URL || !INTERNAL_API_KEY) {
      console.error('Missing env vars:', { BACKEND_URL, INTERNAL_API_KEY: !!INTERNAL_API_KEY });
      throw new Error('Missing required environment variables');
    }

    const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    const sanitizedPath = sanitizePath(pathSegments);
    
    const url = `${BACKEND_URL}/${sanitizedPath}`;
    console.log('Proxying request to:', url);

    // Fix the headers type
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': INTERNAL_API_KEY,
    };

    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    console.log('Proxy request headers:', headers);

    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    console.log('Proxy response status:', response.status);

    const data = await response.json().catch(() => response.text());
    console.log('Proxy response data:', data);

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}