// IPC handler registration for Electron main process
// All handlers receive model instances and register ipcMain.handle listeners

function registerIpcHandlers(ipcMain, models) {
  const { accountModel, transactionModel, categoryModel, currencyModel, db, settingsTable } = models;

  // Helper: wrap handler in try/catch, return { success, data } or { success, error }
  function handle(channel, fn) {
    ipcMain.handle(channel, async (_event, ...args) => {
      try {
        const data = fn(...args);
        return { success: true, data };
      } catch (err) {
        console.error(`[IPC ${channel}]`, err);
        return { success: false, error: err.message || String(err) };
      }
    });
  }

  // ─── Accounts ──────────────────────────────────────────────────────────────
  handle("accounts:list", (opts) => accountModel.listWithBalances(opts));
  handle("accounts:getById", (id) => accountModel.getWithBalance(id));
  handle("accounts:create", (data) => accountModel.create(data));
  handle("accounts:update", (id, data) => accountModel.update(id, data));
  handle("accounts:archive", (id) => accountModel.archive(id));

  // ─── Transactions ──────────────────────────────────────────────────────────
  handle("transactions:list", (filter) => transactionModel.list(filter));
  handle("transactions:listWithDetails", (filter) => transactionModel.listWithDetails(filter));
  handle("transactions:getWithDetails", (id) => transactionModel.getWithDetails(id));
  handle("transactions:create", (data) => transactionModel.create(data));
  handle("transactions:update", (id, data) => transactionModel.update(id, data));
  handle("transactions:delete", (id) => transactionModel.delete(id));
  handle("transactions:spendingByCategory", (from, to) => transactionModel.getSpendingByCategory(from, to));
  handle("transactions:monthlyTrend", (accountId, months) => transactionModel.getMonthlyTrend(accountId, months));

  // ─── Categories ────────────────────────────────────────────────────────────
  handle("categories:list", (opts) => categoryModel.list(opts));
  handle("categories:listAsTree", (opts) => categoryModel.listAsTree(opts));
  handle("categories:create", (data) => categoryModel.create(data));
  handle("categories:update", (id, data) => categoryModel.update(id, data));
  handle("categories:archive", (id) => categoryModel.archive(id));

  // ─── Currencies ────────────────────────────────────────────────────────────
  handle("currencies:listActive", () => currencyModel.listActive());
  handle("currencies:listAll", () => currencyModel.listAll());
  handle("currencies:getByCode", (code) => currencyModel.getByCode(code));
  handle("currencies:toggleActive", (code, isActive) => currencyModel.toggleActive(code, isActive));
  handle("currencies:formatAmount", (amount, code) => currencyModel.formatAmount(amount, code));
  handle("currencies:formatWithSymbol", (amount, code) => currencyModel.formatWithSymbol(amount, code));
  handle("currencies:toSmallestUnit", (displayAmount, code) => currencyModel.toSmallestUnit(displayAmount, code));
  handle("currencies:getLatestRate", (from, to) => currencyModel.getLatestRate(from, to));
  handle("currencies:saveRate", (data) => currencyModel.saveRate(data));
  handle("currencies:convert", (amount, from, to) => currencyModel.convert(amount, from, to));

  // ─── Settings ──────────────────────────────────────────────────────────────
  handle("settings:get", (key) => {
    const { eq } = require("drizzle-orm");
    return db.select().from(settingsTable).where(eq(settingsTable.key, key)).get();
  });
  handle("settings:set", (key, value) => {
    const { eq } = require("drizzle-orm");
    const existing = db.select().from(settingsTable).where(eq(settingsTable.key, key)).get();
    if (existing) {
      db.update(settingsTable).set({ value }).where(eq(settingsTable.key, key)).run();
    } else {
      db.insert(settingsTable).values({ key, value }).run();
    }
    return { key, value };
  });
}

module.exports = { registerIpcHandlers };
