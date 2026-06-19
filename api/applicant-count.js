import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    // Increment and return new count
    const count = await kv.incr('applicant_count');
    return res.status(200).json({ count });
  }

  if (req.method === 'GET') {
    const count = (await kv.get('applicant_count')) || 0;
    return res.status(200).json({ count });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
