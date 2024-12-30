// api/proxy/test.ts  (create this new file)
import type { VercelResponse } from '@vercel/node'

export default async function handler(res: VercelResponse) {
  console.log('Test endpoint hit!')
  res.status(200).json({ message: 'Test successful' })
}