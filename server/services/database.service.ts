import { db } from "@db";
import { eq, and, sql } from "drizzle-orm";
import { pool } from "@db";

/**
 * Database service for centralized connection management and utility functions
 */
class DatabaseService {
  /**
   * Ping the database to check connection
   */
  async ping() {
    try {
      const result = await pool.query('SELECT 1');
      return !!result;
    } catch (error) {
      console.error("Database connection error:", error);
      return false;
    }
  }
  
  /**
   * Execute a query with error handling and connection management
   */
  async executeQuery<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error("Database operation failed");
    }
  }
  
  /**
   * Generic CRUD operations with type safety
   */
  
  async findOne<T>(table: any, field: any, value: any): Promise<T | null> {
    return this.executeQuery(async () => {
      const result = await db.select().from(table).where(eq(field, value)).limit(1);
      return result.length > 0 ? result[0] as T : null;
    });
  }
  
  async findMany<T>(table: any, conditions: Record<string, any> = {}): Promise<T[]> {
    return this.executeQuery(async () => {
      const whereConditions = Object.entries(conditions).map(
        ([key, value]) => eq(table[key], value)
      );
      
      if (whereConditions.length === 0) {
        return await db.select().from(table) as T[];
      }
      
      return await db.select().from(table).where(
        and(...whereConditions)
      ) as T[];
    });
  }
  
  async create<T>(table: any, data: any): Promise<T> {
    return this.executeQuery(async () => {
      const [result] = await db.insert(table).values(data).returning();
      return result as T;
    });
  }
  
  async update<T>(table: any, id: number, data: any): Promise<T | null> {
    return this.executeQuery(async () => {
      const [result] = await db.update(table)
        .set(data)
        .where(eq(table.id, id))
        .returning();
      
      return result as T || null;
    });
  }
  
  async delete<T>(table: any, id: number): Promise<T | null> {
    return this.executeQuery(async () => {
      const [result] = await db.delete(table)
        .where(eq(table.id, id))
        .returning();
      
      return result as T || null;
    });
  }
  
  /**
   * Transaction management
   */
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.executeQuery(async () => {
      return await db.transaction(async (tx) => {
        return await callback(tx);
      });
    });
  }
}

export const database = new DatabaseService();
