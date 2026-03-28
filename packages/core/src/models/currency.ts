import { eq, and, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { currencies, exchangeRates } from "../db/schema.js";
import type { KakeiboDB } from "../db/index.js";
import type { Currency, ExchangeRate, NewExchangeRate } from "../types/index.js";

export class CurrencyModel {
  constructor(private db: KakeiboDB) {}

  async getByCode(code: string): Promise<Currency | undefined> {
    const rows = await this.db
      .select()
      .from(currencies)
      .where(eq(currencies.code, code));
    return rows[0];
  }

  async listActive(): Promise<Currency[]> {
    return this.db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true));
  }

  async listAll(): Promise<Currency[]> {
    return this.db.select().from(currencies);
  }

  async toggleActive(code: string, isActive: boolean): Promise<Currency | undefined> {
    const [result] = await this.db
      .update(currencies)
      .set({ isActive })
      .where(eq(currencies.code, code))
      .returning();
    return result;
  }

  /**
   * Format an integer amount to a display string based on the currency's decimal places.
   */
  async formatAmount(amount: number, currencyCode: string): Promise<string> {
    const currency = await this.getByCode(currencyCode);
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
   */
  async formatWithSymbol(amount: number, currencyCode: string): Promise<string> {
    const currency = await this.getByCode(currencyCode);
    if (!currency) return String(amount);

    return `${currency.symbol}${await this.formatAmount(amount, currencyCode)}`;
  }

  /**
   * Convert a display amount to the integer storage format.
   */
  async toSmallestUnit(displayAmount: number, currencyCode: string): Promise<number> {
    const currency = await this.getByCode(currencyCode);
    if (!currency) return Math.round(displayAmount);

    const multiplier = Math.pow(10, currency.decimalPlaces);
    return Math.round(displayAmount * multiplier);
  }

  // ─── Exchange Rates ──────────────────────────────────────────────────

  async saveRate(data: Omit<NewExchangeRate, "id">): Promise<ExchangeRate> {
    const id = uuid();
    const [result] = await this.db
      .insert(exchangeRates)
      .values({ ...data, id })
      .onConflictDoUpdate({
        target: [exchangeRates.date, exchangeRates.fromCurrency, exchangeRates.toCurrency],
        set: { rate: data.rate, source: data.source },
      })
      .returning();
    return result;
  }

  async getLatestRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<ExchangeRate | undefined> {
    if (fromCurrency === toCurrency) return undefined;

    const rows = await this.db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, fromCurrency),
          eq(exchangeRates.toCurrency, toCurrency),
        ),
      )
      .orderBy(desc(exchangeRates.date))
      .limit(1);
    return rows[0];
  }

  /**
   * Convert an amount from one currency to another using the latest stored rate.
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number | undefined> {
    if (fromCurrency === toCurrency) return amount;

    const rate = await this.getLatestRate(fromCurrency, toCurrency);
    if (!rate) return undefined;

    const fromCurrencyData = await this.getByCode(fromCurrency);
    const toCurrencyData = await this.getByCode(toCurrency);
    if (!fromCurrencyData || !toCurrencyData) return undefined;

    const fromDivisor = Math.pow(10, fromCurrencyData.decimalPlaces);
    const toMultiplier = Math.pow(10, toCurrencyData.decimalPlaces);

    const displayAmount = amount / fromDivisor;
    const convertedDisplay = displayAmount * rate.rate;
    return Math.round(convertedDisplay * toMultiplier);
  }
}
