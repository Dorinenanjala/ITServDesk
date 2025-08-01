# IT Support Portal

## Overview

This is a modern IT support ticket management system built with React and Express.js. The application allows IT staff to create, view, and manage support tickets for various rooms and technical issues. It features a clean dashboard interface for tracking ticket status, filtering tickets by various criteria, and exporting ticket data. The system is designed to streamline IT support workflows with real-time updates and an intuitive user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Radix UI components with shadcn/ui design system and Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Component Structure**: Modular component architecture with reusable UI components organized in `/components/ui/`

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API structure with endpoints for CRUD operations on tickets
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development Setup**: Vite integration for hot module replacement in development mode

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Development Storage**: In-memory storage implementation (`MemStorage`) for development/testing
- **Production Database**: Neon Database serverless PostgreSQL for production deployment
- **Schema Design**: Tickets table with fields for date, room, issue description, action taken, solved by, and status

### Authentication and Authorization
- **Current State**: Basic session management structure in place using connect-pg-simple for PostgreSQL session storage
- **User Management**: Placeholder authentication with static "Admin User" display
- **Future Enhancement**: Ready for implementation of proper authentication system

### API Structure
- **Ticket Management**:
  - `GET /api/tickets` - Retrieve all tickets with sorting by creation date
  - `GET /api/tickets/:id` - Retrieve single ticket by ID
  - `POST /api/tickets` - Create new ticket with validation
  - `PATCH /api/tickets/:id` - Update existing ticket
  - `DELETE /api/tickets/:id` - Delete ticket (implementation pending)
- **Data Validation**: Zod schemas for request validation and type safety
- **Response Format**: Consistent JSON responses with proper error handling

## External Dependencies

### Core Framework Dependencies
- **@vitejs/plugin-react**: React plugin for Vite build system
- **express**: Web application framework for Node.js backend
- **react** and **react-dom**: Core React library for UI rendering

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI components
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for managing component variants
- **lucide-react**: Icon library for consistent iconography

### Data Management
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Integration between Drizzle and Zod for schema validation
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **@tanstack/react-query**: Data fetching and caching library

### Form and Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation library

### Development Tools
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment
- **@replit/vite-plugin-cartographer**: Development tooling for Replit integration

### Utility Libraries
- **wouter**: Lightweight routing library for React
- **date-fns**: Modern JavaScript date utility library
- **clsx** and **tailwind-merge**: Utility functions for conditional CSS classes
- **nanoid**: URL-safe unique string ID generator