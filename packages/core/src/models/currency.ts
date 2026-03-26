import { eq, and, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { currencies, exchangeRates } from "../db/schema.js";
import type { KakeiboDB } from "../db/index.js";
import type { Currency, ExchangeRate, NewExchangeRate } from "../types/index.js";

export class CurrencyModel {
  constructor(private db: KakeiboDB) {}

  getByCode(code: string): Currency | undefined {
    return this.db
      .select()
      .from(currencies)
      .where(eq(currencies.code, code))
      .get();
  }

  listActive(): Currency[] {
    return this.db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true))
      .all();
  }

  listAll(): Currency[] {
    return this.db.select().from(currencies).all();
  }

  toggleActive(code: string, isActive: boolean): Currency | undefined {
    return this.db
      .update(currencies)
      .set({ isActive })
      .where(eq(currencies.code, code))
      .returning()
      .get();
  }

  /**
   * Format an integer amount to a display string based on the currency's decimal places.
   * Example: formatAmount(10050, "USD") → "100.50"
   *          formatAmount(15050, "JPY") → "15050"
   */
  formatAmount(amount: number, currencyCode: string): string {
    const currency = this.getByCode(currencyCode);
    if (!currency) return String(amount);

    const divisor = Math.pow(10, currency.decimalPlaces);
    const value = amount / divisor;

    return value.toLocaleString(undefined, {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    });
  }

  /**
   * Format with currency symbol.
   * Example: formatWithSymbol(10050, "USD") → "$100.50"
   */
  formatWithSymbol(amount: number, currencyCode: string): string {
    const currency = this.getByCode(currencyCode);
    if (!currency) return String(amount);

    return `${currency.symbol}${this.formatAmount(amount, currencyCode)}`;
  }

  /**
   * Convert a display amount (e.g., 100.50) to the integer storage format.
   * Example: toSmallestUnit(100.50, "USD") → 10050
   *          toSmallestUnit(15050, "JPY") → 15050
   */
  toSmallestUnit(displayAmount: number, currencyCode: string): number {
    const currency = this.getByCode(currencyCode);
    if (!currency) return Math.round(displayAmount);

    const multiplier = Math.pow(10, currency.decimalPlaces);
    return Math.round(displayAmount * multiplier);
  }

  // ─── Exchange Rates ──────────────────────────────────────────────────

  saveRate(data: Omit<NewExchangeRate, "id">): ExchangeRate {
    const id = uuid();
    return this.db
      .insert(exchangeRates)
      .values({ ...data, id })
      .onConflictDoUpdate({
        target: [exchangeRates.date, exchangeRates.fromCurrency, exchangeRates.toCurrency],
        set: { rate: data.rate, source: data.source },
      })
      .returning()
      .get();
  }

  getLatestRate(
    fromCurrency: string,
    toCurrency: string,
  ): ExchangeRate | undefined {
    if (fromCurrency === toCurrency) return undefined;

    return this.db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, fromCurrency),
          eq(exchangeRates.toCurrency, toCurrency),
        ),
      )
      .orderBy(desc(exchangeRates.date))
      .limit(1)
      .get();
  }

  /**
   * Convert an amount from one currency to another using the latest stored rate.
   * Returns the converted amount in the target currency's smallest unit.
   */
  convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): number | undefined {
    if (fromCurrency === toCurrency) return amount;

    const rate = this.getLatestRate(fromCurrency, toCurrency);
    if (!rate) return undefined;

    const fromCurrencyData = this.getByCode(fromCurrency);
    const toCurrencyData = this.getByCode(toCurrency);
    if (!fromCurrencyData || !toCurrencyData) return undefined;

    // Convert: amount in source smallest unit → display → apply rate → target smallest unit
    const fromDivisor = Math.pow(10, fromCurrencyData.decimalPlaces);
    const toMultiplier = Math.pow(10, toCurrencyData.decimalPlaces);

    const displayAmount = amount / fromDivisor;
    const convertedDisplay = displayAmount * rate.rate;
    return Math.round(convertedDisplay * toMultiplier);
  }
}
