import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, get, query, orderByChild, equalTo, remove, update, onValue, off } from 'firebase/database';
import { 
  User, Incident, ChatMessage, EmergencyUnit, EmergencyService, IncidentAssignment, 
  IncidentCategory, Notification, AuditLog, InsertUser, InsertIncident, 
  InsertChatMessage, InsertEmergencyUnit, InsertEmergencyService, InsertIncidentAssignment,
  InsertIncidentCategory, InsertNotification, FirebaseDatabase
} from '../shared/schema';

const firebaseConfig = {
  databaseURL: "https://scp1-fc016-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "scp1-fc016",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export interface IStorage {
  // Emergency Services
  createEmergencyService(service: InsertEmergencyService): Promise<EmergencyService>;
  getEmergencyService(id: string): Promise<EmergencyService | undefined>;
  getEmergencyServiceByCode(code: string): Promise<EmergencyService | undefined>;
  getAllEmergencyServices(): Promise<EmergencyService[]>;
  updateEmergencyService(id: string, updates: Partial<EmergencyService>): Promise<void>;

  // Users
  createUser(user: InsertUser): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  getUsersByService(serviceId: string): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<void>;
  deleteUser(id: string): Promise<void>;

  // Incidents
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncident(id: string): Promise<Incident | undefined>;
  getIncidentsByReporter(reporterId: string): Promise<Incident[]>;
  getIncidentsByService(serviceId: string): Promise<Incident[]>;
  getIncidentsByStatus(status: string): Promise<Incident[]>;
  getActiveIncidents(): Promise<Incident[]>;
  assignIncident(incidentId: string, responderId: string, assignedById: string): Promise<void>;
  updateIncidentStatus(id: string, status: string, updates?: Partial<Incident>): Promise<void>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<void>;

  // Incident Assignments
  createIncidentAssignment(assignment: InsertIncidentAssignment): Promise<IncidentAssignment>;
  getIncidentAssignments(incidentId: string): Promise<IncidentAssignment[]>;
  getResponderAssignments(responderId: string): Promise<IncidentAssignment[]>;
  updateAssignmentStatus(id: string, status: string, responseAt?: number): Promise<void>;

  // Chat Messages
  createChatMessage(message: InsertChatMessage, senderId: string): Promise<ChatMessage>;
  getChatMessages(incidentId: string): Promise<ChatMessage[]>;
  getServiceMessages(serviceId: string): Promise<ChatMessage[]>;
  markMessageAsRead(id: string): Promise<void>;

  // Emergency Units
  createEmergencyUnit(unit: InsertEmergencyUnit): Promise<EmergencyUnit>;
  getEmergencyUnit(id: string): Promise<EmergencyUnit | undefined>;
  getEmergencyUnitsByService(serviceId: string): Promise<EmergencyUnit[]>;
  getAvailableUnits(serviceId: string): Promise<EmergencyUnit[]>;
  updateEmergencyUnit(id: string, updates: Partial<EmergencyUnit>): Promise<void>;
  deleteEmergencyUnit(id: string): Promise<void>;

  // Incident Categories
  createIncidentCategory(category: InsertIncidentCategory): Promise<IncidentCategory>;
  getIncidentCategories(serviceId: string): Promise<IncidentCategory[]>;
  updateIncidentCategory(id: string, updates: Partial<IncidentCategory>): Promise<void>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getServiceNotifications(serviceId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;

  // Audit Logs
  createAuditLog(userId: string, action: string, entityType?: string, entityId?: string, details?: Record<string, any>): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  // Real-time subscriptions
  subscribeToIncidents(serviceId: string, callback: (incidents: Incident[]) => void): () => void;
  subscribeToMessages(incidentId: string, callback: (messages: ChatMessage[]) => void): () => void;
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void;
}

export class FirebaseStorage implements IStorage {
  private generateId(): string {
    return push(ref(database)).key!;
  }

  // Emergency Services
  async createEmergencyService(service: InsertEmergencyService): Promise<EmergencyService> {
    const id = this.generateId();
    const newService: EmergencyService = {
      id,
      ...service,
      isActive: true,
      createdAt: Date.now(),
    };

    await set(ref(database, `emergencyServices/${id}`), newService);
    return newService;
  }

  async getEmergencyService(id: string): Promise<EmergencyService | undefined> {
    const snapshot = await get(ref(database, `emergencyServices/${id}`));
    return snapshot.val();
  }

  async getEmergencyServiceByCode(code: string): Promise<EmergencyService | undefined> {
    const snapshot = await get(query(ref(database, 'emergencyServices'), orderByChild('code'), equalTo(code)));
    const data = snapshot.val();
    return data ? Object.values(data)[0] as EmergencyService : undefined;
  }

  async getAllEmergencyServices(): Promise<EmergencyService[]> {
    const snapshot = await get(ref(database, 'emergencyServices'));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async updateEmergencyService(id: string, updates: Partial<EmergencyService>): Promise<void> {
    await update(ref(database, `emergencyServices/${id}`), updates);
  }

  // Users
  async createUser(user: InsertUser): Promise<User> {
    const id = this.generateId();
    const newUser: User = {
      id,
      ...user,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(ref(database, `users/${id}`), newUser);
    return newUser;
  }

  async getUser(id: string): Promise<User | undefined> {
    const snapshot = await get(ref(database, `users/${id}`));
    return snapshot.val();
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const snapshot = await get(query(ref(database, 'users'), orderByChild('phoneNumber'), equalTo(phoneNumber)));
    const data = snapshot.val();
    return data ? Object.values(data)[0] as User : undefined;
  }

  async getUsersByService(serviceId: string): Promise<User[]> {
    const snapshot = await get(query(ref(database, 'users'), orderByChild('serviceId'), equalTo(serviceId)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const snapshot = await get(query(ref(database, 'users'), orderByChild('role'), equalTo(role)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await update(ref(database, `users/${id}`), { ...updates, updatedAt: Date.now() });
  }

  async deleteUser(id: string): Promise<void> {
    await remove(ref(database, `users/${id}`));
  }

  // Incidents
  async createIncident(incident: InsertIncident & { reporterId?: string }): Promise<Incident> {
    const id = this.generateId();
    const newIncident: Incident = {
      id,
      ...incident,
      status: 'new',
      mediaUrls: [],
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(ref(database, `incidents/${id}`), newIncident);
    
    // Create audit log
    await this.createAuditLog(incident.reporterId || 'system', 'create_incident', 'incident', id, {
      type: incident.type,
      serviceId: incident.serviceId,
    });

    return newIncident;
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const snapshot = await get(ref(database, `incidents/${id}`));
    return snapshot.val();
  }

  async getIncidentsByReporter(reporterId: string): Promise<Incident[]> {
    const snapshot = await get(query(ref(database, 'incidents'), orderByChild('reporterId'), equalTo(reporterId)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async getIncidentsByService(serviceId: string): Promise<Incident[]> {
    const snapshot = await get(query(ref(database, 'incidents'), orderByChild('serviceId'), equalTo(serviceId)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    const snapshot = await get(query(ref(database, 'incidents'), orderByChild('status'), equalTo(status)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async getActiveIncidents(): Promise<Incident[]> {
    const snapshot = await get(ref(database, 'incidents'));
    const data = snapshot.val();
    if (!data) return [];
    
    return Object.values(data).filter((incident: any) => 
      ['new', 'assigned', 'accepted', 'en_route', 'on_scene'].includes(incident.status)
    );
  }

  async assignIncident(incidentId: string, responderId: string, assignedById: string): Promise<void> {
    const updates = {
      assignedResponderId: responderId,
      assignedById,
      assignedAt: Date.now(),
      status: 'assigned',
      updatedAt: Date.now(),
    };
    
    await update(ref(database, `incidents/${incidentId}`), updates);
    
    // Create assignment record
    await this.createIncidentAssignment({
      incidentId,
      responderId,
      assignedById,
    });

    // Create audit log
    await this.createAuditLog(assignedById, 'assign_incident', 'incident', incidentId, {
      responderId,
    });
  }

  async updateIncidentStatus(id: string, status: string, updates?: Partial<Incident>): Promise<void> {
    const updateData = {
      status,
      updatedAt: Date.now(),
      ...updates,
    };

    if (status === 'resolved') {
      updateData.completedAt = Date.now();
    }

    await update(ref(database, `incidents/${id}`), updateData);
    await this.createAuditLog('system', 'update_status', 'incident', id, { status });
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<void> {
    await update(ref(database, `incidents/${id}`), { ...updates, updatedAt: Date.now() });
  }

  // Incident Assignments
  async createIncidentAssignment(assignment: InsertIncidentAssignment): Promise<IncidentAssignment> {
    const id = this.generateId();
    const newAssignment: IncidentAssignment = {
      id,
      ...assignment,
      status: 'assigned',
      assignedAt: Date.now(),
    };

    await set(ref(database, `incidentAssignments/${id}`), newAssignment);
    return newAssignment;
  }

  async getIncidentAssignments(incidentId: string): Promise<IncidentAssignment[]> {
    const snapshot = await get(query(ref(database, 'incidentAssignments'), orderByChild('incidentId'), equalTo(incidentId)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async getResponderAssignments(responderId: string): Promise<IncidentAssignment[]> {
    const snapshot = await get(query(ref(database, 'incidentAssignments'), orderByChild('responderId'), equalTo(responderId)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async updateAssignmentStatus(id: string, status: string, responseAt?: number): Promise<void> {
    const updates: any = { status };
    if (responseAt) updates.responseAt = responseAt;
    
    await update(ref(database, `incidentAssignments/${id}`), updates);
  }

  // Chat Messages
  async createChatMessage(message: InsertChatMessage, senderId: string): Promise<ChatMessage> {
    const id = this.generateId();
    const newMessage: ChatMessage = {
      id,
      ...message,
      senderId,
      isRead: false,
      metadata: {},
      createdAt: Date.now(),
    };

    await set(ref(database, `chatMessages/${id}`), newMessage);
    return newMessage;
  }

  async getChatMessages(incidentId: string): Promise<ChatMessage[]> {
    const snapshot = await get(query(ref(database, 'chatMessages'), orderByChild('incidentId'), equalTo(incidentId)));
    const data = snapshot.val();
    return data ? Object.values(data).sort((a: any, b: any) => a.createdAt - b.createdAt) : [];
  }

  async getServiceMessages(serviceId: string): Promise<ChatMessage[]> {
    const snapshot = await get(query(ref(database, 'chatMessages'), orderByChild('serviceId'), equalTo(serviceId)));
    const data = snapshot.val();
    return data ? Object.values(data).sort((a: any, b: any) => a.createdAt - b.createdAt) : [];
  }

  async markMessageAsRead(id: string): Promise<void> {
    await update(ref(database, `chatMessages/${id}`), { isRead: true });
  }

  // Emergency Units
  async createEmergencyUnit(unit: InsertEmergencyUnit): Promise<EmergencyUnit> {
    const id = this.generateId();
    const newUnit: EmergencyUnit = {
      id,
      ...unit,
      status: 'available',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(ref(database, `emergencyUnits/${id}`), newUnit);
    return newUnit;
  }

  async getEmergencyUnit(id: string): Promise<EmergencyUnit | undefined> {
    const snapshot = await get(ref(database, `emergencyUnits/${id}`));
    return snapshot.val();
  }

  async getEmergencyUnitsByService(serviceId: string): Promise<EmergencyUnit[]> {
    const snapshot = await get(query(ref(database, 'emergencyUnits'), orderByChild('serviceId'), equalTo(serviceId)));
    const data = snapshot.val();
    return data ? Object.values(data) as Incident[] : [];
  }

  async getAvailableUnits(serviceId: string): Promise<EmergencyUnit[]> {
    const units = await this.getEmergencyUnitsByService(serviceId);
    return units.filter(unit => unit.status === 'available' && unit.isActive);
  }

  async updateEmergencyUnit(id: string, updates: Partial<EmergencyUnit>): Promise<void> {
    await update(ref(database, `emergencyUnits/${id}`), { ...updates, updatedAt: Date.now() });
  }

  async deleteEmergencyUnit(id: string): Promise<void> {
    await remove(ref(database, `emergencyUnits/${id}`));
  }

  // Incident Categories
  async createIncidentCategory(category: InsertIncidentCategory): Promise<IncidentCategory> {
    const id = this.generateId();
    const newCategory: IncidentCategory = {
      id,
      ...category,
      isActive: true,
      createdAt: Date.now(),
    };

    await set(ref(database, `incidentCategories/${id}`), newCategory);
    return newCategory;
  }

  async getIncidentCategories(serviceId: string): Promise<IncidentCategory[]> {
    const snapshot = await get(query(ref(database, 'incidentCategories'), orderByChild('serviceId'), equalTo(serviceId)));
    const data = snapshot.val();
    return data ? Object.values(data).sort((a: any, b: any) => a.sortOrder - b.sortOrder) : [];
  }

  async updateIncidentCategory(id: string, updates: Partial<IncidentCategory>): Promise<void> {
    await update(ref(database, `incidentCategories/${id}`), updates);
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.generateId();
    const newNotification: Notification = {
      id,
      ...notification,
      isRead: false,
      createdAt: Date.now(),
    };

    await set(ref(database, `notifications/${id}`), newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const snapshot = await get(query(ref(database, 'notifications'), orderByChild('recipientId'), equalTo(userId)));
    const data = snapshot.val();
    return data ? Object.values(data).sort((a: any, b: any) => b.createdAt - a.createdAt) : [];
  }

  async getServiceNotifications(serviceId: string): Promise<Notification[]> {
    const snapshot = await get(query(ref(database, 'notifications'), orderByChild('serviceId'), equalTo(serviceId)));
    const data = snapshot.val();
    return data ? Object.values(data).sort((a: any, b: any) => b.createdAt - a.createdAt) : [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await update(ref(database, `notifications/${id}`), { isRead: true });
  }

  // Audit Logs
  async createAuditLog(userId: string, action: string, entityType?: string, entityId?: string, details?: Record<string, any>): Promise<void> {
    const id = this.generateId();
    const auditLog: AuditLog = {
      id,
      userId,
      action,
      entityType,
      entityId,
      details: details || {},
      createdAt: Date.now(),
    };

    await set(ref(database, `auditLogs/${id}`), auditLog);
  }

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    const snapshot = await get(ref(database, 'auditLogs'));
    const data = snapshot.val();
    if (!data) return [];
    
    return Object.values(data)
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // Real-time subscriptions
  subscribeToIncidents(serviceId: string, callback: (incidents: Incident[]) => void): () => void {
    const incidentsRef = ref(database, 'incidents');
    
    const handleData = (snapshot: any) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const incidents = Object.values(data).filter((incident: any) => 
        incident.serviceId === serviceId
      );
      callback(incidents);
    };

    onValue(incidentsRef, handleData);
    
    return () => off(incidentsRef, 'value', handleData);
  }

  subscribeToMessages(incidentId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesRef = ref(database, 'chatMessages');
    
    const handleData = (snapshot: any) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const messages = Object.values(data)
        .filter((message: any) => message.incidentId === incidentId)
        .sort((a: any, b: any) => a.createdAt - b.createdAt);
      callback(messages);
    };

    onValue(messagesRef, handleData);
    
    return () => off(messagesRef, 'value', handleData);
  }

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const notificationsRef = ref(database, 'notifications');
    
    const handleData = (snapshot: any) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const notifications = Object.values(data)
        .filter((notification: any) => notification.recipientId === userId)
        .sort((a: any, b: any) => b.createdAt - a.createdAt);
      callback(notifications);
    };

    onValue(notificationsRef, handleData);
    
    return () => off(notificationsRef, 'value', handleData);
  }
}

// Initialize and seed emergency services
export async function initializeFirebaseData(): Promise<void> {
  const storage = new FirebaseStorage();
  
  // Check if emergency services already exist
  const existingServices = await storage.getAllEmergencyServices();
  if (existingServices.length > 0) return;

  // Seed emergency services
  const services = [
    {
      name: "Ghana Police Service",
      code: "POLICE",
      serviceNumbers: ["191"],
      description: "Law enforcement and crime prevention services",
    },
    {
      name: "Ghana National Fire Service",
      code: "FIRE",
      serviceNumbers: ["192"],
      description: "Fire prevention, suppression, and rescue services",
    },
    {
      name: "National Ambulance Service",
      code: "AMBULANCE",
      serviceNumbers: ["193"],
      description: "Emergency medical services and patient transport",
    },
    {
      name: "National Disaster Management Organisation",
      code: "NADMO",
      serviceNumbers: ["311"],
      description: "Disaster preparedness and response coordination",
    },
    {
      name: "Unified Emergency Hotline",
      code: "UNIFIED",
      serviceNumbers: ["112"],
      description: "Coordinated emergency response dispatch center",
    },
  ];

  for (const service of services) {
    await storage.createEmergencyService(service);
  }

  console.log("Emergency services initialized in Firebase");
}

export const storage = new FirebaseStorage();