import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ ok: true, hasDb: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL) });
}
