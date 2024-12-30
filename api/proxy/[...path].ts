import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'edge',
  regions: ['sin1'],
}

const handler = async function(req: Request) {
  const backendUrl = 'https://api.fintrackit.my.id/v1'
  const internalApiKey = process.env.INTERNAL_API_KEY

  // Get the path from the URL
  const url = new URL(req.url)
  const pathSegments = url.pathname
    .replace('/api/proxy/', '') // Remove the base path
    .split('/')
    .filter(Boolean)

  console.log('Request details:', {
    url: req.url,
    method: req.method,
    pathSegments,
    fullPath: pathSegments.join('/')
  })

  if (!internalApiKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const fullPath = pathSegments.join('/')
    const targetUrl = `${backendUrl}/${fullPath}`

    console.log('Proxying to:', targetUrl)

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-API-Key': internalApiKey,
        'Content-Type': 'application/json',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) 
        ? await req.text()
        : undefined
    })
    
    const data = await response.json()
    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(
      JSON.stringify({ error: 'Error proxying request' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export default handler