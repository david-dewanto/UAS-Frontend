// src/api/proxy/[...path].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = process.env.BACKEND_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Get the path from the URL
    const path = (req.query.path as string[]).join('/');
    
    // Construct the full URL
    const url = `${BACKEND_URL}/v1/${path}`;

    // Create headers object properly
    const headers = new Headers();
    headers.set('X-API-Key', INTERNAL_API_KEY as string);
    headers.set('Content-Type', 'application/json');
    
    // Forward authorization if present
    if (req.headers.authorization) {
      headers.set('Authorization', req.headers.authorization);
    }
    
    // Forward the request to the backend
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // Get the response data
    const data = await response.json();

    // Forward the response status and data back to the client
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}