import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'edge',
  regions: ['sin1'], // optional: specify regions
}

const handler = async function(req: VercelRequest, res: VercelResponse) {
  const backendUrl = 'https://api.fintrackit.my.id/v1'
  const internalApiKey = process.env.INTERNAL_API_KEY

  console.log('Request details:', {
    url: req.url,
    method: req.method,
    query: req.query,
    path: Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path
  })

  if (!internalApiKey) {
    console.error('Missing API key')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path]
    const fullPath = pathSegments.join('/')
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
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({ error: 'Error proxying request' })
  }
}

export default handler