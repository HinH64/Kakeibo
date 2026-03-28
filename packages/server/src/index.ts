import { config } from "dotenv";
config({ path: "../../.env" });

import { serve } from "@hono/node-server";

async function main() {
  const { default: app } = await import("./app.js");
  const port = parseInt(process.env.PORT || "3001");
  console.log(`[API] Starting on port ${port}...`);
  serve({ fetch: app.fetch, port }, () => {
    console.log(`[API] Server running at http://localhost:${port}`);
  });
}

main();
