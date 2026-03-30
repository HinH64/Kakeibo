# Kakeibo — Multi-Currency Personal Finance

A personal finance app with true multi-currency account support. Each account is denominated in a specific currency (TWD, JPY, USD, EUR, etc.), with cross-currency transfers and net worth reporting in your chosen base currency.

Built for people who hold money in multiple currencies — expats, frequent travellers, remote workers paid in foreign currencies.

## Features

- **Multi-currency accounts** — each account has its own currency; balances display in both native and reporting currency
- **Cross-currency transfers** — transfer between accounts with exchange rate tracking
- **Transaction tracking** — expense, income, and transfer with category tagging and search/filter
- **Hierarchical categories** — pre-seeded defaults with one level of subcategories, multi-language names (EN, 繁體中文, 日本語)
- **Budget tracking** — per-category monthly budgets with real-time progress bars and surplus calculation
- **Dashboard** — net worth, monthly income/expense summary, 6-month trend bar chart, spending pie chart, asset forecast, recent transactions
- **Calendar view** — month grid with income/expense indicators per day; click any day to see or add transactions
- **Goals & targets** — floor targets (minimum balance), milestone targets (net worth by date), planned events (one-time income/expenses) with asset forecast chart
- **Settings** — reporting currency, locale, theme, week start day
- **CSV export/import** — export transactions as CSV, import with account/category matching
- **JSON backup** — full data backup of accounts, categories, and transactions
- **Detail pages** — dedicated views for each account, transaction, and category with filtered transaction history

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| API Server | Hono |
| Desktop | Electron |
| Charts | Recharts |
| Deployment | Vercel (serverless API + SPA) |
| Monorepo | Turborepo + pnpm workspaces |

## Project Structure

```
Kakeibo/
├── packages/
│   ├── core/           # Shared business logic, DB schema, models
│   │   └── src/
│   │       ├── db/     # Drizzle schema, migrations, seed data
│   │       ├── models/ # Account, Transaction, Category, Currency
│   │       └── types/
│   ├── server/         # Hono REST API server
│   │   └── src/
│   │       └── app.ts  # All API routes
│   ├── ui/             # Shared React components (placeholder)
│   └── desktop/        # Vite + React frontend + Electron shell
│       ├── electron/   # Main process, preload, IPC
│       └── src/
│           ├── pages/        # Dashboard, Accounts, Transactions, Calendar, Categories, Budgets, Goals, Settings
│           ├── components/   # Sidebar, TransactionForm, Modal, AmountInput, CategoryPicker, etc.
│           ├── stores/       # Zustand stores (account, transaction, category, currency, budget, target, settings, exchangeRate, modal)
│           ├── lib/          # API abstraction (Electron IPC / REST dual-mode)
│           └── styles/       # Tailwind + custom theme
├── api/                # Vercel serverless proxy
│   └── proxy.ts
├── vercel.json
├── turbo.json
└── pnpm-workspace.yaml
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Net worth, monthly summary cards, trend chart, pie chart, forecast, accounts, recent transactions |
| `/accounts` | Accounts | Asset/liability groups, create account modal |
| `/accounts/:id` | Account Detail | Balance, income/expense summary, filtered transaction list |
| `/transactions` | Transactions | Date-grouped list, search, filter by type/account/date |
| `/transactions/:id` | Transaction Detail | Full info, edit/delete, cross-currency display |
| `/calendar` | Calendar | Month grid, day income/expense dots, day transaction list |
| `/categories` | Categories | Expense/income grids with icons |
| `/categories/:id` | Category Detail | Total spending, monthly breakdown, filtered transactions |
| `/budgets` | Budgets | Per-category budgets, progress bars, surplus calculation |
| `/goals` | Goals | Floor/milestone targets, planned events, asset forecast chart |
| `/settings` | Settings | Reporting currency, locale, theme, data export/import |

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Setup

1. Clone the repo and install dependencies:

```bash
pnpm install
```

2. Create a `.env` file in the project root with your Neon PostgreSQL connection string:

```
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
```

3. Generate and push the database schema:

```bash
cd packages/core
pnpm db:generate
npx drizzle-kit push
```

4. Build the core package:

```bash
cd packages/core
pnpm build
```

### Run (Development)

Start the API server and frontend dev server:

```bash
# Terminal 1 — API server
cd packages/server
npx tsx src/index.ts

# Terminal 2 — Frontend
cd packages/desktop
npx vite
```

The app is available at `http://localhost:5173`. The Vite dev server proxies `/api/*` to the Hono server on port 3001.

### Run (Electron)

```bash
cd packages/desktop
pnpm electron:dev
```

### Deploy (Vercel)

The app deploys to Vercel with the Hono API running as a serverless function. Set `DATABASE_URL` or `POSTGRES_URL` in your Vercel environment variables.

## Data Model

All monetary amounts are stored as integers in the smallest currency unit (cents, yen, etc.) to avoid floating-point errors. Each account has exactly one `currency_code`. Cross-currency transfers store `amount`, `to_amount`, and `exchange_rate`.

## Design

Warm dark theme — terracotta accent, earth-tone category palette, cream-toned text on warm dark backgrounds. Clean card-based layout with Lucide icons and Recharts visualizations.

## License

MIT
