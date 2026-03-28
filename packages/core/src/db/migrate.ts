import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema.js";
import { seedCurrencies, seedCategories, seedSettings } from "./seed.js";
import { currencies, categories, settings } from "./schema.js";

export async function runMigrations(connectionString: string, migrationsFolder = "./drizzle") {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  // Run schema migrations
  await migrate(db, { migrationsFolder });

  await client.end();
  return db;
}

export async function seedDatabase(db: ReturnType<typeof drizzle>) {
  // Seed currencies
  for (const currency of seedCurrencies) {
    await db.insert(currencies)
      .values(currency)
      .onConflictDoNothing();
  }

  // Seed categories
  for (const category of seedCategories) {
    await db.insert(categories)
      .values(category)
      .onConflictDoNothing();
  }

  // Seed settings
  for (const setting of seedSettings) {
    await db.insert(settings)
      .values(setting)
      .onConflictDoNothing();
  }
}
