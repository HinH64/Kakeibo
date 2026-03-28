import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { default: app } = await import("../packages/server/src/app.js");

  // Ensure URL includes /api prefix for Hono's basePath matching
  let path = req.url || "/";
  if (!path.startsWith("/api")) {
    path = `/api${path}`;
  }

  const url = new URL(path, `https://${req.headers.host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  // Include body for non-GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  }

  const request = new Request(url.toString(), init);
  const response = await app.fetch(request);

  // Send response back through Vercel's res
  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const body = await response.text();
  res.end(body);
}
