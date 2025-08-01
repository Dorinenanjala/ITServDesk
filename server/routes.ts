import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTicketSchema, 
  updateTicketSchema, 
  loginSchema, 
  registerSchema 
} from "@shared/schema";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import session from 'express-session';
import passport, { requireAuth, requireAdmin } from './auth';
import connectPg from 'connect-pg-simple';

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Invalid credentials' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }
        res.json({ user, message: 'Login successful' });
      });
    })(req, res, next);
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const { confirmPassword, ...userData } = validatedData;
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, message: 'User created successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  app.get('/api/auth/user', requireAuth, (req, res) => {
    res.json(req.user);
  });

  // User management routes (admin only)
  app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Ticket routes (require authentication)
  app.get("/api/tickets", requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      console.log(`[DEBUG] User requesting tickets:`, { id: user.id, username: user.username, role: user.role });
      let tickets;
      
      if (user.role === 'admin') {
        // Admin can see all tickets
        console.log(`[DEBUG] Admin user - fetching all tickets`);
        tickets = await storage.getTickets();
      } else {
        // Regular users can only see their own tickets
        console.log(`[DEBUG] Regular user - fetching tickets for user ID: ${user.id}`);
        tickets = await storage.getTicketsByUser(user.id);
      }
      
      console.log(`[DEBUG] Found ${tickets.length} tickets for user ${user.username}`);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", requireAuth, async (req: any, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check if user has permission to view this ticket
      const user = req.user;
      if (user.role !== 'admin' && ticket.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post("/api/tickets", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData, req.user.id);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid ticket data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", requireAuth, async (req: any, res) => {
    try {
      // First check if ticket exists and user has permission
      const existingTicket = await storage.getTicket(req.params.id);
      if (!existingTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      const user = req.user;
      if (user.role !== 'admin' && existingTicket.createdBy !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = updateTicketSchema.parse(req.body);
      const ticket = await storage.updateTicket(req.params.id, validatedData);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.delete("/api/tickets/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTicket(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  app.get("/api/stats", requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      let tickets;
      
      if (user.role === 'admin') {
        // Admin can see stats for all tickets
        tickets = await storage.getTickets();
      } else {
        // Regular users can only see stats for their own tickets
        tickets = await storage.getTicketsByUser(user.id);
      }
      
      const total = tickets.length;
      const pending = tickets.filter(t => t.status === "pending").length;
      const resolved = tickets.filter(t => t.status === "resolved").length;
      
      // Count tickets from this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeek = tickets.filter(t => 
        new Date(t.createdAt || 0) >= oneWeekAgo
      ).length;

      res.json({ total, pending, resolved, thisWeek });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
