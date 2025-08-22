import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { storage, initializeFirebaseData } from './firebase-storage';
import { 
  insertIncidentSchema, insertChatMessageSchema, insertUserSchema,
  insertEmergencyUnitSchema, insertEmergencyServiceSchema, 
  insertIncidentAssignmentSchema, insertNotificationSchema
} from '../shared/schema';
import { Request, Response } from 'express';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Initialize Firebase data
initializeFirebaseData().catch(console.error);

// Helper function for error handling
const handleError = (res: Response, error: any, message = 'Server error') => {
  console.error(error);
  res.status(500).json({ error: message });
};

// Emergency Services Routes
router.get('/api/emergency-services', async (req: Request, res: Response) => {
  try {
    const services = await storage.getAllEmergencyServices();
    res.json(services);
  } catch (error) {
    handleError(res, error, 'Failed to get emergency services');
  }
});

router.post('/api/emergency-services', async (req: Request, res: Response) => {
  try {
    const serviceData = insertEmergencyServiceSchema.parse(req.body);
    const service = await storage.createEmergencyService(serviceData);
    res.status(201).json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid service data', details: error.errors });
    } else {
      handleError(res, error, 'Failed to create emergency service');
    }
  }
});

router.get('/api/emergency-services/:code', async (req: Request, res: Response) => {
  try {
    const service = await storage.getEmergencyServiceByCode(req.params.code);
    if (!service) {
      return res.status(404).json({ error: 'Emergency service not found' });
    }
    res.json(service);
  } catch (error) {
    handleError(res, error, 'Failed to get emergency service');
  }
});

// Users Routes
router.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    handleError(res, error, 'Failed to get user');
  }
});

router.post('/api/users', async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid user data', details: error.errors });
    } else {
      handleError(res, error, 'Failed to create user');
    }
  }
});

router.get('/api/users/service/:serviceId', async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsersByService(req.params.serviceId);
    res.json(users);
  } catch (error) {
    handleError(res, error, 'Failed to get service users');
  }
});

router.get('/api/users/role/:role', async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsersByRole(req.params.role);
    res.json(users);
  } catch (error) {
    handleError(res, error, 'Failed to get users by role');
  }
});

// Incidents Routes
router.get('/api/incidents', async (req: Request, res: Response) => {
  try {
    const incidents = await storage.getActiveIncidents();
    res.json(incidents);
  } catch (error) {
    handleError(res, error, 'Failed to get incidents');
  }
});

router.get('/api/incidents/all', async (req: Request, res: Response) => {
  try {
    // This would typically require admin permissions
    const incidents = await storage.getActiveIncidents(); // For now, return active incidents
    res.json(incidents);
  } catch (error) {
    handleError(res, error, 'Failed to get all incidents');
  }
});

router.get('/api/incidents/service/:serviceId', async (req: Request, res: Response) => {
  try {
    const incidents = await storage.getIncidentsByService(req.params.serviceId);
    res.json(incidents);
  } catch (error) {
    handleError(res, error, 'Failed to get service incidents');
  }
});

router.get('/api/incidents/user/:userId', async (req: Request, res: Response) => {
  try {
    const incidents = await storage.getIncidentsByReporter(req.params.userId);
    res.json(incidents);
  } catch (error) {
    handleError(res, error, 'Failed to get user incidents');
  }
});

router.get('/api/incidents/:id', async (req: Request, res: Response) => {
  try {
    const incident = await storage.getIncident(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    handleError(res, error, 'Failed to get incident');
  }
});

router.post('/api/incidents', async (req: Request, res: Response) => {
  try {
    const incidentData = insertIncidentSchema.extend({
      reporterId: z.string().optional(),
    }).parse(req.body);
    
    const incident = await storage.createIncident(incidentData);
    res.status(201).json(incident);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid incident data', details: error.errors });
    } else {
      handleError(res, error, 'Failed to create incident');
    }
  }
});

router.patch('/api/incidents/:id', async (req: Request, res: Response) => {
  try {
    const { status, ...updates } = req.body;
    
    if (status) {
      await storage.updateIncidentStatus(req.params.id, status, updates);
    } else {
      await storage.updateIncident(req.params.id, updates);
    }
    
    const updatedIncident = await storage.getIncident(req.params.id);
    res.json(updatedIncident);
  } catch (error) {
    handleError(res, error, 'Failed to update incident');
  }
});

router.post('/api/incidents/:id/assign', async (req: Request, res: Response) => {
  try {
    const { responderId } = req.body;
    const assignedById = req.body.assignedById || 'system'; // Should come from auth
    
    if (!responderId) {
      return res.status(400).json({ error: 'Responder ID is required' });
    }
    
    await storage.assignIncident(req.params.id, responderId, assignedById);
    const incident = await storage.getIncident(req.params.id);
    res.json(incident);
  } catch (error) {
    handleError(res, error, 'Failed to assign incident');
  }
});

// Chat Messages Routes
router.get('/api/incidents/:incidentId/messages', async (req: Request, res: Response) => {
  try {
    const messages = await storage.getChatMessages(req.params.incidentId);
    res.json(messages);
  } catch (error) {
    handleError(res, error, 'Failed to get messages');
  }
});

router.post('/api/incidents/:incidentId/messages', async (req: Request, res: Response) => {
  try {
    const messageData = insertChatMessageSchema.parse({
      ...req.body,
      incidentId: req.params.incidentId,
    });
    
    const senderId = req.body.senderId || 'anonymous';
    const message = await storage.createChatMessage(messageData, senderId);
    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid message data', details: error.errors });
    } else {
      handleError(res, error, 'Failed to send message');
    }
  }
});

router.get('/api/services/:serviceId/messages', async (req: Request, res: Response) => {
  try {
    const messages = await storage.getServiceMessages(req.params.serviceId);
    res.json(messages);
  } catch (error) {
    handleError(res, error, 'Failed to get service messages');
  }
});

// Emergency Units Routes
router.get('/api/emergency-units', async (req: Request, res: Response) => {
  try {
    const { serviceId, status } = req.query;
    let units;
    
    if (serviceId) {
      units = await storage.getEmergencyUnitsByService(serviceId as string);
    } else {
      // Get all units - would need a method for this
      units = [];
    }
    
    if (status) {
      units = units.filter(unit => unit.status === status);
    }
    
    res.json(units);
  } catch (error) {
    handleError(res, error, 'Failed to get emergency units');
  }
});

router.get('/api/emergency-units/service/:serviceId', async (req: Request, res: Response) => {
  try {
    const units = await storage.getEmergencyUnitsByService(req.params.serviceId);
    res.json(units);
  } catch (error) {
    handleError(res, error, 'Failed to get service units');
  }
});

router.post('/api/emergency-units', async (req: Request, res: Response) => {
  try {
    const unitData = insertEmergencyUnitSchema.parse(req.body);
    const unit = await storage.createEmergencyUnit(unitData);
    res.status(201).json(unit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid unit data', details: error.errors });
    } else {
      handleError(res, error, 'Failed to create emergency unit');
    }
  }
});

// Notifications Routes
router.get('/api/notifications/user/:userId', async (req: Request, res: Response) => {
  try {
    const notifications = await storage.getUserNotifications(req.params.userId);
    res.json(notifications);
  } catch (error) {
    handleError(res, error, 'Failed to get user notifications');
  }
});

router.get('/api/notifications/service/:serviceId', async (req: Request, res: Response) => {
  try {
    const notifications = await storage.getServiceNotifications(req.params.serviceId);
    res.json(notifications);
  } catch (error) {
    handleError(res, error, 'Failed to get service notifications');
  }
});

router.post('/api/notifications', async (req: Request, res: Response) => {
  try {
    const notificationData = insertNotificationSchema.parse(req.body);
    const notification = await storage.createNotification(notificationData);
    res.status(201).json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid notification data', details: error.errors });
    } else {
      handleError(res, error, 'Failed to create notification');
    }
  }
});

// Performance Metrics Routes
router.get('/api/performance-metrics', async (req: Request, res: Response) => {
  try {
    const { timeframe, serviceId } = req.query;
    
    // Mock performance metrics for now
    const mockMetrics = [
      {
        id: '1',
        serviceId: serviceId as string || 'all',
        metricType: 'response_time',
        value: 8.5,
        period: timeframe as string || '24h',
        startTime: Date.now() - (24 * 60 * 60 * 1000),
        endTime: Date.now(),
        metadata: {},
        createdAt: Date.now(),
      }
    ];
    
    res.json(mockMetrics);
  } catch (error) {
    handleError(res, error, 'Failed to get performance metrics');
  }
});

// Audit Logs Routes (Admin only)
router.get('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const logs = await storage.getAuditLogs(limit ? parseInt(limit as string) : undefined);
    res.json(logs);
  } catch (error) {
    handleError(res, error, 'Failed to get audit logs');
  }
});

// File Upload Routes
router.post('/api/incidents/:incidentId/media', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // In a real app, you'd upload to cloud storage and get URLs
    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    
    // Update incident with media URLs
    const incident = await storage.getIncident(req.params.incidentId);
    if (incident) {
      await storage.updateIncident(req.params.incidentId, {
        mediaUrls: [...(incident.mediaUrls || []), ...fileUrls],
      });
    }
    
    res.json({ files: fileUrls });
  } catch (error) {
    handleError(res, error, 'Failed to upload files');
  }
});

// Health Check
router.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: ['firebase', 'emergency-services', 'incidents', 'chat'],
  });
});

import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Add all the API routes
  app.use(router);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const userId = req.url?.split('userId=')[1];
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          const chatMessage = await storage.createChatMessage({
            incidentId: message.incidentId,
            message: message.content,
            messageType: 'text',
          }, message.senderId);

          // Broadcast to connected clients
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: chatMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  return httpServer;
}

export default router;