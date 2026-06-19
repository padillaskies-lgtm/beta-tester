// /api/applicant-count
//
// Tracks a running applicant counter in Upstash Redis (connected via
// Vercel's Marketplace integration).
//
// Talks to Upstash's REST API directly with fetch — no SDK dependency,
// so it doesn't matter which package the integration expects.
//
// Vercel's Upstash integration may name the env vars either way depending
// on when you connected it, so we check both:
//   KV_REST_API_URL / KV_REST_API_TOKEN          (legacy Vercel KV naming)
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (native Upstash naming)

const REST_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(command) {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) {
    throw new Error(`Upstash request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!REST_URL || !REST_TOKEN) {
    return res.status(500).json({
      error:
        'Upstash env vars not found. Check that KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are set in Vercel project settings.',
    });
  }

  try {
    if (req.method === 'POST') {
      const count = await redis(['INCR', 'applicant_count']);
      return res.status(200).json({ count });
    }

    if (req.method === 'GET') {
      const count = (await redis(['GET', 'applicant_count'])) || 0;
      return res.status(200).json({ count: Number(count) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Upstash error:', err);
    return res.status(500).json({ error: 'Failed to reach Upstash' });
  }
}
