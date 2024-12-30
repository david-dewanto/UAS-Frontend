// api/proxy/[...path].ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backendUrl = 'https://api.fintrackit.my.id/v1'  // Hardcoded or use env var
  const internalApiKey = process.env.INTERNAL_API_KEY

  console.log('Incoming request to proxy:', req.url) // Debug log

  if (!internalApiKey) {
    console.error('Missing API key')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    // Remove '/api/proxy' and add the path to backend URL
    const path = req.url?.replace('/api/proxy', '') || ''
    const targetUrl = `${backendUrl}${path}`

    console.log('Proxying to:', targetUrl) // Debug log

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-API-Key': internalApiKey,
        'Content-Type': 'application/json',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method || '') 
        ? JSON.stringify(req.body) 
        : undefined
    })
    
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Error proxying request' })
  }
}