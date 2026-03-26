import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { categories } from "../db/schema.js";
import type { KakeiboDB } from "../db/index.js";
import type { Category, NewCategory } from "../types/index.js";

export class CategoryModel {
  constructor(private db: KakeiboDB) {}

  create(data: Omit<NewCategory, "id">): Category {
    const id = uuid();
    return this.db
      .insert(categories)
      .values({ ...data, id })
      .returning()
      .get();
  }

  getById(id: string): Category | undefined {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();
  }

  list(options?: {
    type?: "income" | "expense";
    includeArchived?: boolean;
  }): Category[] {
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
      .orderBy(categories.sortOrder)
      .all();
  }

  /**
   * Returns categories as a tree: top-level categories with children nested.
   */
  listAsTree(options?: {
    type?: "income" | "expense";
  }): (Category & { children: Category[] })[] {
    const all = this.list(options);
    const topLevel = all.filter((c) => !c.parentId);
    return topLevel.map((parent) => ({
      ...parent,
      children: all.filter((c) => c.parentId === parent.id),
    }));
  }

  update(
    id: string,
    data: Partial<Omit<NewCategory, "id">>,
  ): Category | undefined {
    return this.db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning()
      .get();
  }

  archive(id: string): Category | undefined {
    return this.update(id, { isArchived: true });
  }
}
