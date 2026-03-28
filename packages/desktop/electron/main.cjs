const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { registerIpcHandlers } = require("./ipc.cjs");

let mainWindow;

async function initDatabase() {
  // Dynamic import for ESM core package
  const core = await import("@kakeibo/core");

  // Load .env from project root
  const envPath = path.join(__dirname, "../../../.env");
  try {
    const dotenv = await import("dotenv");
    dotenv.config({ path: envPath });
  } catch {
    // dotenv may not be available; DATABASE_URL might be set via environment
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set. Check your .env file.");
  }
  console.log("[DB] Connecting to PostgreSQL...");

  // Resolve migrations folder relative to core package
  const coreDir = path.dirname(require.resolve("@kakeibo/core/package.json"));
  const migrationsFolder = path.join(coreDir, "drizzle");

  // Run migrations and seed
  await core.runMigrations(connectionString, migrationsFolder);
  const db = core.createDatabase(connectionString);
  await core.seedDatabase(db);
  console.log("[DB] Initialized and seeded");

  // Create model instances
  const accountModel = new core.AccountModel(db);
  const transactionModel = new core.TransactionModel(db);
  const categoryModel = new core.CategoryModel(db);
  const currencyModel = new core.CurrencyModel(db);

  // Register IPC handlers
  registerIpcHandlers(ipcMain, {
    accountModel,
    transactionModel,
    categoryModel,
    currencyModel,
    db,
    settingsTable: core.settings,
  });

  console.log("[IPC] Handlers registered");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hiddenInset",
    show: false,
  });

  // In dev, load from Vite dev server; in prod, load built files
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
