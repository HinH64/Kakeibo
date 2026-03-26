# Kakeibo — Multi-Currency Personal Finance

A local-first personal finance app with true multi-currency account support. Each account is denominated in a specific currency (TWD, JPY, USD, EUR, etc.), with cross-currency transfers and net worth reporting in your chosen base currency.

Built for people who hold money in multiple currencies — expats, frequent travellers, remote workers paid in foreign currencies.

## Features

- **Multi-currency accounts** — each account has its own currency; balances display in both native and reporting currency
- **Cross-currency transfers** — transfer between accounts with exchange rate tracking
- **Transaction tracking** — expense, income, and transfer with category tagging
- **Hierarchical categories** — pre-seeded defaults with one level of subcategories
- **Budget tracking** — per-category monthly budgets with progress bars
- **Dashboard** — net worth, monthly income/expense summary, spending by category, recent transactions
- **CSV export/import** (planned)
- **Multi-language** — EN, 繁體中文, 日本語 (planned)

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand + TanStack Query |
| Database | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| Desktop | Electron |
| Mobile | Capacitor (planned) |
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
│   ├── ui/             # Shared React components, hooks, stores
│   └── desktop/        # Electron + Vite + React shell
│       ├── electron/   # Main process, preload
│       └── src/        # Pages, components, styles
├── turbo.json
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Install & Run

```bash
pnpm install
pnpm --filter desktop dev
```

The dev server starts at `http://localhost:5173`.

## Data Model

All monetary amounts are stored as integers in the smallest currency unit (cents, yen, etc.) to avoid floating-point errors. Each account has exactly one `currency_code`. Cross-currency transfers store `amount`, `to_amount`, and `exchange_rate`.

## Design

Warm dark theme inspired by Claude's UI — terracotta accent, earth-tone category palette, cream-toned text on warm dark backgrounds. Clean card-based layout with Lucide icons.

## License

MIT
