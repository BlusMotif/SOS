import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Firebase Schema Types (JSON-based structure)

// Emergency Services Organizations
export interface EmergencyService {
  id: string;
  name: string; // Police, Fire Service, Ambulance, NADMO
  code: string; // POLICE, FIRE, AMBULANCE, NADMO
  serviceNumbers: string[]; // ["191"], ["192"], ["193"], ["311"]
  description?: string;
  isActive: boolean;
  createdAt: number;
}

// Enhanced Users with Service Affiliations
export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  role: 'citizen' | 'responder' | 'service_admin' | 'global_admin';
  serviceId?: string;
  name?: string;
  preferredLanguage: 'en' | 'tw' | 'ee' | 'ga' | 'dag';
  isActive: boolean;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  ghanaPostGPS?: string;
}

// Enhanced Incidents with Categories and Assignment
export interface Incident {
  id: string;
  reporterId?: string;
  serviceId: string;
  type: string; // police, fire, ambulance, unified
  category: string; // accident, robbery, fire, medical_emergency, natural_disaster
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'accepted' | 'en_route' | 'on_scene' | 'resolved' | 'closed';
  title: string;
  description?: string;
  location: Location;
  serviceNumber: string;
  assignedResponderId?: string;
  assignedById?: string;
  assignedAt?: number;
  acceptedAt?: number;
  completedAt?: number;
  estimatedResponseTime?: number; // in minutes
  actualResponseTime?: number; // in minutes
  isSilent: boolean;
  isOffline: boolean; // queued offline
  mediaUrls: string[];
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

// Assignment History for Audit Trail
export interface IncidentAssignment {
  id: string;
  incidentId: string;
  responderId: string;
  assignedById: string;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
  assignedAt: number;
  responseAt?: number;
  notes?: string;
}

// Enhanced Chat Messages with Service Channels
export interface ChatMessage {
  id: string;
  incidentId?: string;
  serviceId?: string; // for service-wide channels
  channelType: 'incident' | 'service' | 'broadcast';
  senderId: string;
  message: string;
  messageType: 'text' | 'image' | 'audio' | 'system' | 'assignment';
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: number;
}

// Enhanced Emergency Units with Service Assignment
export interface EmergencyUnit {
  id: string;
  serviceId: string;
  callSign: string;
  unitType: string; // patrol, ambulance, fire_truck, rescue
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  location?: Location;
  currentIncidentId?: string;
  assignedResponderId?: string;
  capacity: number;
  equipment: string[];
  isActive: boolean;
  lastMaintenanceAt?: number;
  createdAt: number;
  updatedAt: number;
}

// Audit Logging for All System Actions
export interface AuditLog {
  id: string;
  userId?: string;
  serviceId?: string;
  action: string; // login, assign_incident, update_status, send_message, etc.
  entityType?: string; // incident, user, unit, message
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
}

// Incident Categories for Guided Prompts
export interface IncidentCategory {
  id: string;
  serviceId: string;
  name: string;
  code: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  questions: string[]; // guided prompt questions
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
}

// System Notifications and Announcements
export interface Notification {
  id: string;
  serviceId?: string;
  recipientId?: string;
  type: 'assignment' | 'status_update' | 'broadcast' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  expiresAt?: number;
  createdAt: number;
}

// Analytics and Performance Metrics
export interface PerformanceMetric {
  id: string;
  serviceId: string;
  metricType: string; // response_time, completion_rate, incident_count
  value: number;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startTime: number;
  endTime: number;
  metadata: Record<string, any>;
  createdAt: number;
}

// Insert/Create Schemas using Zod
export const insertEmergencyServiceSchema = z.object({
  name: z.string(),
  code: z.string(),
  serviceNumbers: z.array(z.string()),
  description: z.string().optional(),
});

export const insertUserSchema = z.object({
  phoneNumber: z.string(),
  email: z.string().optional(),
  role: z.enum(['citizen', 'responder', 'service_admin', 'global_admin']),
  serviceId: z.string().optional(),
  name: z.string().optional(),
  preferredLanguage: z.enum(['en', 'tw', 'ee', 'ga', 'dag']).default('en'),
});

export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  ghanaPostGPS: z.string().optional(),
});

export const insertIncidentSchema = z.object({
  serviceId: z.string(),
  type: z.string(),
  category: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  title: z.string(),
  description: z.string().optional(),
  location: locationSchema,
  serviceNumber: z.string(),
  isSilent: z.boolean().default(false),
  isOffline: z.boolean().default(false),
});

export const insertIncidentAssignmentSchema = z.object({
  incidentId: z.string(),
  responderId: z.string(),
  assignedById: z.string(),
  notes: z.string().optional(),
});

export const insertChatMessageSchema = z.object({
  incidentId: z.string().optional(),
  serviceId: z.string().optional(),
  channelType: z.enum(['incident', 'service', 'broadcast']).default('incident'),
  message: z.string(),
  messageType: z.enum(['text', 'image', 'audio', 'system', 'assignment']).default('text'),
});

export const insertEmergencyUnitSchema = z.object({
  serviceId: z.string(),
  callSign: z.string(),
  unitType: z.string(),
  location: locationSchema.optional(),
  assignedResponderId: z.string().optional(),
  capacity: z.number().default(1),
  equipment: z.array(z.string()).default([]),
});

export const insertIncidentCategorySchema = z.object({
  serviceId: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  questions: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
});

export const insertNotificationSchema = z.object({
  serviceId: z.string().optional(),
  recipientId: z.string().optional(),
  type: z.enum(['assignment', 'status_update', 'broadcast', 'system']),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).default({}),
  expiresAt: z.number().optional(),
});

// Export types
export type InsertEmergencyService = z.infer<typeof insertEmergencyServiceSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type InsertIncidentAssignment = z.infer<typeof insertIncidentAssignmentSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertEmergencyUnit = z.infer<typeof insertEmergencyUnitSchema>;
export type InsertIncidentCategory = z.infer<typeof insertIncidentCategorySchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Firebase Database Structure
export interface FirebaseDatabase {
  emergencyServices: Record<string, EmergencyService>;
  users: Record<string, User>;
  incidents: Record<string, Incident>;
  incidentAssignments: Record<string, IncidentAssignment>;
  chatMessages: Record<string, ChatMessage>;
  emergencyUnits: Record<string, EmergencyUnit>;
  incidentCategories: Record<string, IncidentCategory>;
  notifications: Record<string, Notification>;
  auditLogs: Record<string, AuditLog>;
  performanceMetrics: Record<string, PerformanceMetric>;
  // Real-time status tracking
  onlineUsers: Record<string, { lastSeen: number; status: string }>;
  activeIncidents: Record<string, { status: string; lastUpdate: number }>;
}