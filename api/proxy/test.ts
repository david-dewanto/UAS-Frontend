// api/proxy/test.ts  (create this new file)
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Test endpoint hit!')
  res.status(200).json({ message: 'Test successful' })
}