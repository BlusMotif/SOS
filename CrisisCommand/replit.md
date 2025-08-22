# Overview

Aegis GH is a comprehensive emergency response platform for Ghana that enables citizens to quickly contact emergency services and allows dispatchers to coordinate responses. The application provides access to all official Ghana emergency numbers (191-Police, 192-Fire, 193-Ambulance, 112-Unified, etc.) with real-time incident management, live chat between citizens and dispatchers, and location-based emergency reporting. The system is built as a full-stack web application with plans to extend to mobile platforms.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses **React with TypeScript** as the primary frontend framework, built with Vite for fast development and hot module replacement. The UI is constructed with **shadcn/ui components** built on top of **Radix UI primitives**, providing accessible and customizable interface elements. **Tailwind CSS** handles styling with a comprehensive design system including custom color variables and theming support.

The frontend follows a component-based architecture with clear separation between citizen and dispatcher interfaces. **React Router (wouter)** manages client-side routing, while **TanStack Query** handles server state management, caching, and data synchronization. The application supports internationalization through **react-i18next** with translations for multiple Ghanaian languages including English, Akan/Twi, Ewe, Ga, and Dagbani.

## Backend Architecture
The backend is built with **Express.js and TypeScript**, following a RESTful API design pattern. The server includes comprehensive route handling for incidents, users, chat messages, and emergency units. **WebSocket integration** using the native WebSocket API enables real-time communication for live chat between citizens and dispatchers, with connection management and message broadcasting capabilities.

The storage layer currently uses an in-memory implementation with a clean interface design that can be easily swapped for database persistence. The storage interface provides CRUD operations for all major entities including users, incidents, chat messages, and emergency units.

## Data Management
**Drizzle ORM** is configured for PostgreSQL database operations with type-safe schema definitions. The database schema includes comprehensive tables for users (citizens, dispatchers, responders), incidents with geolocation data, real-time chat messages, and emergency unit management. Location data is stored in JSONB format to support latitude/longitude coordinates, addresses, and Ghana Post GPS codes.

The application uses **PostgreSQL with PostGIS** (via Neon Database serverless) for production deployment, providing robust geospatial data handling capabilities essential for emergency response coordination.

## Real-time Communication
WebSocket connections manage real-time features including live chat between citizens and dispatchers, incident status updates, and emergency alert broadcasting. The system maintains active connection maps for users and implements proper message routing based on incident assignments and user roles.

## File Upload and Media Handling
The system supports media file uploads using **Multer** middleware with configurable file size limits and storage destinations. Citizens can attach photos, videos, and audio recordings to incident reports, with files processed and stored for dispatcher review.

## Build and Deployment
The application uses a monorepo structure with separate client and server directories, along with shared TypeScript types and schemas. **ESBuild** handles server-side bundling for production deployment, while Vite manages client-side building. The configuration supports both development and production environments with appropriate optimizations.

# External Dependencies

## Database and Storage
- **@neondatabase/serverless**: PostgreSQL serverless database connection for production deployment
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **@radix-ui/* components**: Comprehensive set of accessible UI primitives including dialogs, dropdowns, forms, and navigation elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system configuration
- **class-variance-authority**: Component variant management for consistent styling
- **Lucide React**: Icon library providing consistent iconography

## State Management and Data Fetching
- **@tanstack/react-query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers

## Internationalization
- **react-i18next**: Internationalization framework supporting multiple Ghanaian languages

## Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin support
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production server builds

## File Processing
- **Multer**: Multipart form data handling for file uploads
- **Date-fns**: Date manipulation and formatting utilities

## Real-time Communication
- **Native WebSocket API**: Real-time bidirectional communication for chat and live updates
- **WebSocket (ws)**: Server-side WebSocket implementation for Node.js

The application is designed to be deployed on Replit with potential for scaling to dedicated infrastructure as the user base grows.