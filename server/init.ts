import bcrypt from 'bcryptjs';
import { storage } from './storage';

export async function initializeDatabase() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin) {
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await storage.createUser({
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: adminPassword,
        role: 'admin',
      });
      console.log('✓ Admin user created (username: admin, password: admin123)');
    }

    // Check if regular user already exists
    const existingUser = await storage.getUserByUsername('user');
    if (!existingUser) {
      // Create regular user
      const userPassword = await bcrypt.hash('user123', 10);
      await storage.createUser({
        username: 'user',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        password: userPassword,
        role: 'user',
      });
      console.log('✓ Regular user created (username: user, password: user123)');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}