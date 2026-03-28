export const runtime = "nodejs";

export default function handler() {
  return new Response(JSON.stringify({ ok: true, env: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL) }), {
    headers: { "content-type": "application/json" },
  });
}
