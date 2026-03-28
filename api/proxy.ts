import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: app } = await import("../packages/server/src/app.js");

    // Reconstruct the original path from the __path query param (set by vercel.json rewrite)
    const originalPath = (req.query.__path as string) || "";

    // Build query string without internal __path param
    const query = { ...req.query } as Record<string, string>;
    delete query.__path;
    const qs = new URLSearchParams(query).toString();

    const fullPath = `/api/${originalPath}${qs ? `?${qs}` : ""}`;
    const url = new URL(fullPath, `https://${req.headers.host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const init: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const request = new Request(url.toString(), init);
    const response = await app.fetch(request);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = await response.text();
    res.end(body);
  } catch (error) {
    res.status(500).json({ error: String(error), method: req.method, url: req.url });
  }
}
