import {
  users,
  tickets,
  type User,
  type UpsertUser,
  type Ticket,
  type InsertTicket,
  type UpdateTicket,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Ticket operations
  getTickets(): Promise<Ticket[]>;
  getTicketsByUser(userId: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket, createdBy: string): Promise<Ticket>;
  updateTicket(id: string, updates: UpdateTicket): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt));
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    console.log(`[DEBUG] Querying tickets for user ID: ${userId}`);
    const result = await db
      .select()
      .from(tickets)
      .where(eq(tickets.createdBy, userId))
      .orderBy(desc(tickets.createdAt));
    console.log(`[DEBUG] Query result:`, result.map(t => ({ id: t.id, room: t.room, createdBy: t.createdBy })));
    return result;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(insertTicket: InsertTicket, createdBy: string): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values({
        ...insertTicket,
        createdBy,
      })
      .returning();
    return ticket;
  }

  async updateTicket(id: string, updates: UpdateTicket): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await db.delete(tickets).where(eq(tickets.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
