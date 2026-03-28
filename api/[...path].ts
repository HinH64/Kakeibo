export const runtime = "nodejs";

export default async function handler(request: Request) {
  const { default: app } = await import("../packages/server/src/app.js");
  return app.fetch(request);
}
