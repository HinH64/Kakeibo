# Kakeibo — Multi-Currency Personal Finance

A personal finance app with true multi-currency account support. Each account is denominated in a specific currency (TWD, JPY, USD, EUR, etc.), with cross-currency transfers and net worth reporting in your chosen base currency.

Built for people who hold money in multiple currencies — expats, frequent travellers, remote workers paid in foreign currencies.

## Features

- **Multi-currency accounts** — each account has its own currency; balances display in both native and reporting currency
- **Cross-currency transfers** — transfer between accounts with exchange rate tracking
- **Transaction tracking** — expense, income, and transfer with category tagging
- **Hierarchical categories** — pre-seeded defaults with one level of subcategories
- **Budget tracking** — per-category monthly budgets with progress bars
- **Dashboard** — net worth, monthly income/expense summary, spending by category, recent transactions
- **Calendar view** — month grid with income/expense indicators per day; click any day to see or add transactions
- **CSV export/import** (planned)
- **Multi-language** — EN, 繁體中文, 日本語 (planned)

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
| i18n | i18next |

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
│   │       └── index.ts
│   ├── ui/             # Shared React components, hooks, stores
│   └── desktop/        # Electron + Vite + React shell
│       ├── electron/   # Main process, preload
│       └── src/        # Pages, components, styles
├── turbo.json
└── pnpm-workspace.yaml
```

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

## Data Model

All monetary amounts are stored as integers in the smallest currency unit (cents, yen, etc.) to avoid floating-point errors. Each account has exactly one `currency_code`. Cross-currency transfers store `amount`, `to_amount`, and `exchange_rate`.

## Design

Warm dark theme — terracotta accent, earth-tone category palette, cream-toned text on warm dark backgrounds. Clean card-based layout with Lucide icons.

## License

MIT
