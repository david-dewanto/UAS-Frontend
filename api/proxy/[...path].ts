import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backendUrl = 'https://api.fintrackit.my.id/v1'
  const internalApiKey = process.env.INTERNAL_API_KEY

  // In [...path].ts, the path comes from req.query.path
  const pathSegments = req.query.path as string[]
  console.log('Path segments:', pathSegments) // Debug log

  if (!internalApiKey) {
    console.error('Missing API key')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    // Join the path segments to create the full path
    const path = pathSegments.join('/')
    const targetUrl = `${backendUrl}/${path}`

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