// api/proxy/[...path].ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backendUrl = process.env.BACKEND_URL
  const internalApiKey = process.env.INTERNAL_API_KEY

  if (!backendUrl || !internalApiKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const url = new URL(req.url!, `https://${req.headers.host}`)
    const targetUrl = `${backendUrl}${url.pathname}${url.search}`

    const headers: HeadersInit = {
      'X-API-Key': internalApiKey,
      'Content-Type': 'application/json',
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
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