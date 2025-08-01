import { type Ticket, type InsertTicket, type UpdateTicket } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: UpdateTicket): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private tickets: Map<string, Ticket>;

  constructor() {
    this.tickets = new Map();
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      ...insertTicket,
      id,
      createdAt: new Date(),
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, updates: UpdateTicket): Promise<Ticket | undefined> {
    const existingTicket = this.tickets.get(id);
    if (!existingTicket) {
      return undefined;
    }

    const updatedTicket: Ticket = {
      ...existingTicket,
      ...updates,
    };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }
}

export const storage = new MemStorage();
