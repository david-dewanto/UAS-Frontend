// src/api/proxy/[...path].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = process.env.BACKEND_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const ALLOWED_ORIGINS = ['https://fintrackit.my.id']; // Add your frontend domains

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
const sanitizePath = (path: string[]): string => {
  // Remove any null, undefined, or empty strings
  return path
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
    .join('/');
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const origin = req.headers.origin;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
    res.setHeader('Access-Control-Allow-Headers', 
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    return res.status(200).end();
  }

  try {
    // Validate environment variables
    if (!BACKEND_URL || !INTERNAL_API_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Validate request method
    if (!isValidMethod(req.method || '')) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate origin for production
    if (process.env.NODE_ENV === 'production' && !isValidOrigin(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

    // Get and sanitize the path
    const path = sanitizePath(req.query.path as string[]);
    if (!path) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    // Construct the full URL
    const url = `${BACKEND_URL}/v1/${path}`;

    // Create headers
    const headers = new Headers({
      'X-API-Key': INTERNAL_API_KEY,
      'Content-Type': 'application/json',
      'X-Forwarded-For': req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
      'X-Real-IP': req.headers['x-real-ip'] as string || req.socket.remoteAddress || ''
    });

    // Forward authorization if present
    if (req.headers.authorization) {
      headers.set('Authorization', req.headers.authorization);
    }

    // Forward the request
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      redirect: 'follow',
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin || '*');

    // Forward the response
    return res.status(response.status).send(data);

  } catch (error) {
    console.error('API Error:', error);
    
    // Don't expose internal errors to clients
    const message = process.env.NODE_ENV === 'development' 
      ? (error instanceof Error ? error.message : 'Unknown error')
      : 'Internal server error';
      
    return res.status(500).json({ error: message });
  }
}