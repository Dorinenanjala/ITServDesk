import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  room: text("room").notNull(),
  issue: text("issue").notNull(),
  actionTaken: text("action_taken"),
  solvedBy: text("solved_by"),
  status: text("status").notNull().default("pending"), // "pending" | "resolved"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
});

export const updateTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
