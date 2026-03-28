import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { categories } from "../db/schema.js";
import type { KakeiboDB } from "../db/index.js";
import type { Category, NewCategory } from "../types/index.js";

export class CategoryModel {
  constructor(private db: KakeiboDB) {}

  async create(data: Omit<NewCategory, "id">): Promise<Category> {
    const id = uuid();
    const [result] = await this.db
      .insert(categories)
      .values({ ...data, id })
      .returning();
    return result;
  }

  async getById(id: string): Promise<Category | undefined> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return rows[0];
  }

  async list(options?: {
    type?: "income" | "expense";
    includeArchived?: boolean;
  }): Promise<Category[]> {
    const conditions = [];

    if (options?.type) {
      conditions.push(eq(categories.type, options.type));
    }
    if (!options?.includeArchived) {
      conditions.push(eq(categories.isArchived, false));
    }

    return this.db
      .select()
      .from(categories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(categories.sortOrder);
  }

  /**
   * Returns categories as a tree: top-level categories with children nested.
   */
  async listAsTree(options?: {
    type?: "income" | "expense";
  }): Promise<(Category & { children: Category[] })[]> {
    const all = await this.list(options);
    const topLevel = all.filter((c) => !c.parentId);
    return topLevel.map((parent) => ({
      ...parent,
      children: all.filter((c) => c.parentId === parent.id),
    }));
  }

  async update(
    id: string,
    data: Partial<Omit<NewCategory, "id">>,
  ): Promise<Category | undefined> {
    const [result] = await this.db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return result;
  }

  async archive(id: string): Promise<Category | undefined> {
    return this.update(id, { isArchived: true });
  }
}
