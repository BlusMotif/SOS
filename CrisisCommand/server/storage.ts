import { type User, type InsertUser, type Incident, type InsertIncident, type ChatMessage, type InsertChatMessage, type EmergencyUnit, type InsertEmergencyUnit } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Incident operations
  getIncident(id: string): Promise<Incident | undefined>;
  getIncidents(filters?: { status?: string; assignedDispatcherId?: string }): Promise<Incident[]>;
  createIncident(incident: InsertIncident & { reporterId: string }): Promise<Incident>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined>;
  
  // Chat operations
  getChatMessages(incidentId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage & { senderId: string }): Promise<ChatMessage>;
  
  // Emergency units
  getEmergencyUnits(filters?: { status?: string; unitType?: string }): Promise<EmergencyUnit[]>;
  getEmergencyUnit(id: string): Promise<EmergencyUnit | undefined>;
  createEmergencyUnit(unit: InsertEmergencyUnit): Promise<EmergencyUnit>;
  updateEmergencyUnit(id: string, updates: Partial<EmergencyUnit>): Promise<EmergencyUnit | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private incidents: Map<string, Incident>;
  private chatMessages: Map<string, ChatMessage>;
  private emergencyUnits: Map<string, EmergencyUnit>;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.chatMessages = new Map();
    this.emergencyUnits = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample dispatcher
    const dispatcher: User = {
      id: randomUUID(),
      phoneNumber: "+233200000001",
      role: "dispatcher",
      name: "Sarah Mensah",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(dispatcher.id, dispatcher);

    // Create sample emergency units
    const units: EmergencyUnit[] = [
      {
        id: randomUUID(),
        callSign: "Police-191-A",
        unitType: "police",
        status: "available",
        location: {
          latitude: 5.6037,
          longitude: -0.1870,
          address: "Tema Station, Accra"
        },
        currentIncidentId: null,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        callSign: "AMB-193-B",
        unitType: "ambulance",
        status: "available",
        location: {
          latitude: 5.5950,
          longitude: -0.1900,
          address: "Ridge Hospital, Accra"
        },
        currentIncidentId: null,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        callSign: "FIRE-192-A",
        unitType: "fire",
        status: "busy",
        location: {
          latitude: 5.5800,
          longitude: -0.2100,
          address: "En Route"
        },
        currentIncidentId: null,
        createdAt: new Date(),
      }
    ];

    units.forEach(unit => this.emergencyUnits.set(unit.id, unit));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phoneNumber === phoneNumber);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || 'citizen',
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getIncidents(filters?: { status?: string; assignedDispatcherId?: string }): Promise<Incident[]> {
    let incidents = Array.from(this.incidents.values());
    
    if (filters?.status) {
      incidents = incidents.filter(incident => incident.status === filters.status);
    }
    
    if (filters?.assignedDispatcherId) {
      incidents = incidents.filter(incident => incident.assignedDispatcherId === filters.assignedDispatcherId);
    }
    
    return incidents.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createIncident(incidentData: InsertIncident & { reporterId: string }): Promise<Incident> {
    const id = randomUUID();
    const incident: Incident = {
      ...incidentData,
      id,
      status: "new",
      assignedUnitId: null,
      assignedDispatcherId: null,
      mediaUrls: [],
      description: incidentData.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.incidents.set(id, incident);
    return incident;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident = { 
      ...incident, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async getChatMessages(incidentId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.incidentId === incidentId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createChatMessage(messageData: InsertChatMessage & { senderId: string }): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...messageData,
      id,
      messageType: messageData.messageType || 'text',
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getEmergencyUnits(filters?: { status?: string; unitType?: string }): Promise<EmergencyUnit[]> {
    let units = Array.from(this.emergencyUnits.values());
    
    if (filters?.status) {
      units = units.filter(unit => unit.status === filters.status);
    }
    
    if (filters?.unitType) {
      units = units.filter(unit => unit.unitType === filters.unitType);
    }
    
    return units;
  }

  async getEmergencyUnit(id: string): Promise<EmergencyUnit | undefined> {
    return this.emergencyUnits.get(id);
  }

  async createEmergencyUnit(unitData: InsertEmergencyUnit): Promise<EmergencyUnit> {
    const id = randomUUID();
    const unit: EmergencyUnit = {
      ...unitData,
      id,
      status: "available",
      location: unitData.location || null,
      currentIncidentId: null,
      createdAt: new Date(),
    };
    this.emergencyUnits.set(id, unit);
    return unit;
  }

  async updateEmergencyUnit(id: string, updates: Partial<EmergencyUnit>): Promise<EmergencyUnit | undefined> {
    const unit = this.emergencyUnits.get(id);
    if (!unit) return undefined;
    
    const updatedUnit = { ...unit, ...updates };
    this.emergencyUnits.set(id, updatedUnit);
    return updatedUnit;
  }
}

import { FirebaseStorage } from './firebase-storage';

export const storage = new FirebaseStorage();
