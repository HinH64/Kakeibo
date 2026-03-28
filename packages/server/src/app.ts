import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  createDatabase,
  AccountModel,
  TransactionModel,
  CategoryModel,
  CurrencyModel,
  settings,
  budgets,
  eq,
} from "@kakeibo/core";
import { v4 as uuid } from "uuid";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const db = createDatabase(connectionString);
const accountModel = new AccountModel(db);
const transactionModel = new TransactionModel(db);
const categoryModel = new CategoryModel(db);
const currencyModel = new CurrencyModel(db);

const app = new Hono().basePath("/api");
app.use("/*", cors());

// ─── Accounts ──────────────────────────────────────────────────────────────

app.get("/accounts", async (c) => {
  const includeArchived = c.req.query("includeArchived") === "true";
  const data = await accountModel.listWithBalances({ includeArchived });
  return c.json(data);
});

app.get("/accounts/:id", async (c) => {
  const data = await accountModel.getWithBalance(c.req.param("id"));
  return c.json(data);
});

app.post("/accounts", async (c) => {
  const body = await c.req.json();
  const data = await accountModel.create(body);
  return c.json(data);
});

app.put("/accounts/:id", async (c) => {
  const body = await c.req.json();
  const data = await accountModel.update(c.req.param("id"), body);
  return c.json(data);
});

app.delete("/accounts/:id", async (c) => {
  const data = await accountModel.archive(c.req.param("id"));
  return c.json(data);
});

// ─── Transactions ──────────────────────────────────────────────────────────

app.get("/transactions", async (c) => {
  const filter: any = {};
  if (c.req.query("accountId")) filter.accountId = c.req.query("accountId");
  if (c.req.query("categoryId")) filter.categoryId = c.req.query("categoryId");
  if (c.req.query("type")) filter.type = c.req.query("type");
  if (c.req.query("dateFrom")) filter.dateFrom = c.req.query("dateFrom");
  if (c.req.query("dateTo")) filter.dateTo = c.req.query("dateTo");
  if (c.req.query("search")) filter.search = c.req.query("search");
  if (c.req.query("limit")) filter.limit = parseInt(c.req.query("limit")!);
  if (c.req.query("offset")) filter.offset = parseInt(c.req.query("offset")!);
  const data = await transactionModel.list(filter);
  return c.json(data);
});

app.get("/transactions/with-details", async (c) => {
  const filter: any = {};
  if (c.req.query("accountId")) filter.accountId = c.req.query("accountId");
  if (c.req.query("categoryId")) filter.categoryId = c.req.query("categoryId");
  if (c.req.query("type")) filter.type = c.req.query("type");
  if (c.req.query("dateFrom")) filter.dateFrom = c.req.query("dateFrom");
  if (c.req.query("dateTo")) filter.dateTo = c.req.query("dateTo");
  if (c.req.query("search")) filter.search = c.req.query("search");
  if (c.req.query("limit")) filter.limit = parseInt(c.req.query("limit")!);
  if (c.req.query("offset")) filter.offset = parseInt(c.req.query("offset")!);
  const data = await transactionModel.listWithDetails(filter);
  return c.json(data);
});

app.get("/transactions/spending-by-category", async (c) => {
  const from = c.req.query("from")!;
  const to = c.req.query("to")!;
  const data = await transactionModel.getSpendingByCategory(from, to);
  return c.json(data);
});

app.get("/transactions/month-stats", async (c) => {
  const from = c.req.query("from")!;
  const to = c.req.query("to")!;
  const txns = await transactionModel.list({ dateFrom: from, dateTo: to });
  let income = 0, expense = 0;
  for (const t of txns) {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  }
  return c.json({ income, expense });
});

app.get("/transactions/monthly-trend", async (c) => {
  const accountId = c.req.query("accountId") || undefined;
  const months = c.req.query("months") ? parseInt(c.req.query("months")!) : 6;
  const data = await transactionModel.getMonthlyTrend(accountId, months);
  return c.json(data);
});

app.get("/transactions/:id", async (c) => {
  const data = await transactionModel.getWithDetails(c.req.param("id"));
  return c.json(data);
});

app.post("/transactions", async (c) => {
  const body = await c.req.json();
  const data = await transactionModel.create(body);
  return c.json(data);
});

app.put("/transactions/:id", async (c) => {
  const body = await c.req.json();
  const data = await transactionModel.update(c.req.param("id"), body);
  return c.json(data);
});

app.delete("/transactions/:id", async (c) => {
  await transactionModel.delete(c.req.param("id"));
  return c.json({ ok: true });
});

// ─── Categories ────────────────────────────────────────────────────────────

app.get("/categories", async (c) => {
  const type = c.req.query("type") as "income" | "expense" | undefined;
  const includeArchived = c.req.query("includeArchived") === "true";
  const data = await categoryModel.list({ type, includeArchived });
  return c.json(data);
});

app.get("/categories/tree", async (c) => {
  const type = c.req.query("type") as "income" | "expense" | undefined;
  const data = await categoryModel.listAsTree({ type });
  return c.json(data);
});

app.post("/categories", async (c) => {
  const body = await c.req.json();
  const data = await categoryModel.create(body);
  return c.json(data);
});

app.put("/categories/:id", async (c) => {
  const body = await c.req.json();
  const data = await categoryModel.update(c.req.param("id"), body);
  return c.json(data);
});

app.delete("/categories/:id", async (c) => {
  const data = await categoryModel.archive(c.req.param("id"));
  return c.json(data);
});

// ─── Currencies ────────────────────────────────────────────────────────────

app.get("/currencies", async (c) => {
  const all = c.req.query("all") === "true";
  const data = all ? await currencyModel.listAll() : await currencyModel.listActive();
  return c.json(data);
});

app.get("/currencies/:code", async (c) => {
  const data = await currencyModel.getByCode(c.req.param("code"));
  return c.json(data);
});

app.put("/currencies/:code/toggle", async (c) => {
  const { isActive } = await c.req.json();
  const data = await currencyModel.toggleActive(c.req.param("code"), isActive);
  return c.json(data);
});

app.post("/currencies/format-amount", async (c) => {
  const { amount, code } = await c.req.json();
  const data = await currencyModel.formatAmount(amount, code);
  return c.json({ formatted: data });
});

app.post("/currencies/format-with-symbol", async (c) => {
  const { amount, code } = await c.req.json();
  const data = await currencyModel.formatWithSymbol(amount, code);
  return c.json({ formatted: data });
});

app.post("/currencies/to-smallest-unit", async (c) => {
  const { displayAmount, code } = await c.req.json();
  const data = await currencyModel.toSmallestUnit(displayAmount, code);
  return c.json({ amount: data });
});

app.get("/currencies/rate/:from/:to", async (c) => {
  const data = await currencyModel.getLatestRate(c.req.param("from"), c.req.param("to"));
  return c.json(data);
});

app.post("/currencies/rate", async (c) => {
  const body = await c.req.json();
  const data = await currencyModel.saveRate(body);
  return c.json(data);
});

app.post("/currencies/convert", async (c) => {
  const { amount, from, to } = await c.req.json();
  const data = await currencyModel.convert(amount, from, to);
  return c.json({ converted: data });
});

// ─── Budgets ───────────────────────────────────────────────────────────────

app.get("/budgets", async (c) => {
  const data = await db.select().from(budgets);
  return c.json(data);
});

app.get("/budgets/:id", async (c) => {
  const rows = await db.select().from(budgets).where(eq(budgets.id, c.req.param("id")));
  return c.json(rows[0]);
});

app.post("/budgets", async (c) => {
  const body = await c.req.json();
  const id = uuid();
  const [result] = await db.insert(budgets).values({ ...body, id }).returning();
  return c.json(result);
});

app.put("/budgets/:id", async (c) => {
  const body = await c.req.json();
  const [result] = await db.update(budgets).set(body).where(eq(budgets.id, c.req.param("id"))).returning();
  return c.json(result);
});

app.delete("/budgets/:id", async (c) => {
  await db.delete(budgets).where(eq(budgets.id, c.req.param("id")));
  return c.json({ ok: true });
});

// ─── Settings ──────────────────────────────────────────────────────────────

app.get("/settings/:key", async (c) => {
  const rows = await db.select().from(settings).where(eq(settings.key, c.req.param("key")));
  return c.json(rows[0] ?? null);
});

app.put("/settings/:key", async (c) => {
  const { value } = await c.req.json();
  const key = c.req.param("key");
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  if (rows[0]) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
  return c.json({ key, value });
});

export default app;
