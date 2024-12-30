import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backendUrl = 'https://api.fintrackit.my.id/v1'
  const internalApiKey = process.env.INTERNAL_API_KEY

  // Log the full request details for debugging
  console.log('Request details:', {
    url: req.url,
    method: req.method,
    query: req.query,
    path: req.query.path
  })

  if (!internalApiKey) {
    console.error('Missing API key')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    // Get the full path from the URL
    const fullPath = req.url?.split('/api/proxy/')?.[1] || ''
    const targetUrl = `${backendUrl}/${fullPath}`

    console.log('Proxying to:', targetUrl)

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