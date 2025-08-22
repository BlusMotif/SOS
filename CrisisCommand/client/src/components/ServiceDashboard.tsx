import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, MapPin, Clock, User, Phone, MessageCircle, CheckCircle, XCircle, Car, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User as UserType, Incident, EmergencyUnit, IncidentAssignment } from '@shared/schema';

interface ServiceDashboardProps {
  currentUser: UserType;
  onOpenChat: (incidentId: string) => void;
}

export function ServiceDashboard({ currentUser, onOpenChat }: ServiceDashboardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('incidents');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch service incidents
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/incidents/service', currentUser.serviceId],
    enabled: !!currentUser.serviceId,
  });

  // Fetch service responders
  const { data: responders = [], isLoading: respondersLoading } = useQuery({
    queryKey: ['/api/users/service', currentUser.serviceId],
    enabled: !!currentUser.serviceId,
  });

  // Fetch emergency units
  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ['/api/emergency-units/service', currentUser.serviceId],
    enabled: !!currentUser.serviceId,
  });

  // Assignment mutation
  const assignIncident = useMutation({
    mutationFn: async ({ incidentId, responderId }: { incidentId: string; responderId: string }) => {
      return apiRequest(`/api/incidents/${incidentId}/assign`, {
        method: 'POST',
        data: { responderId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/service'] });
    },
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ incidentId, status }: { incidentId: string; status: string }) => {
      return apiRequest(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        data: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/service'] });
    },
  });

  const getServiceInfo = () => {
    const serviceMap = {
      'police': { name: 'Ghana Police Service', color: 'bg-blue-600', icon: Shield },
      'fire': { name: 'Ghana Fire Service', color: 'bg-red-600', icon: AlertTriangle },
      'ambulance': { name: 'National Ambulance Service', color: 'bg-green-600', icon: Car },
      'nadmo': { name: 'NADMO', color: 'bg-orange-600', icon: AlertTriangle },
      'unified': { name: 'Unified Hotline', color: 'bg-purple-600', icon: Phone },
    };
    return serviceMap[currentUser.serviceId as keyof typeof serviceMap] || serviceMap.unified;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-indigo-100 text-indigo-800';
      case 'on_scene': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredIncidents = incidents.filter((incident: Incident) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['new', 'assigned', 'accepted', 'en_route', 'on_scene'].includes(incident.status);
    return incident.status === statusFilter;
  });

  const serviceInfo = getServiceInfo();
  const ServiceIcon = serviceInfo.icon;

  return (
    <div className="space-y-6" data-testid="service-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${serviceInfo.color} rounded-lg flex items-center justify-center`}>
            <ServiceIcon className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{serviceInfo.name}</h1>
            <p className="text-gray-600">
              {currentUser.role === 'service_admin' ? t('dashboard.admin_view') : t('dashboard.responder_view')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('dashboard.online')}
          </Badge>
          <span className="text-sm text-gray-600">
            {t('dashboard.welcome')}, {currentUser.name}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.active_incidents')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {incidents.filter((i: Incident) => ['new', 'assigned', 'accepted', 'en_route', 'on_scene'].includes(i.status)).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.available_responders')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {responders.filter((r: UserType) => r.isActive).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.units_ready')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {units.filter((u: EmergencyUnit) => u.status === 'available').length}
                </p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.response_time')}</p>
                <p className="text-2xl font-bold text-purple-600">8.5m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">{t('dashboard.incidents')}</TabsTrigger>
          <TabsTrigger value="responders">{t('dashboard.responders')}</TabsTrigger>
          <TabsTrigger value="units">{t('dashboard.units')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold">{t('dashboard.incident_management')}</h2>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard.all_incidents')}</SelectItem>
                  <SelectItem value="active">{t('dashboard.active_only')}</SelectItem>
                  <SelectItem value="new">{t('dashboard.new_only')}</SelectItem>
                  <SelectItem value="resolved">{t('dashboard.resolved_only')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((incident: Incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                          <p className="text-sm text-gray-600">{incident.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(incident.priority)}>
                            {incident.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {incident.location.address}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(incident.createdAt).toLocaleString()}
                        </div>
                        {incident.serviceNumber && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {incident.serviceNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {currentUser.role === 'service_admin' && !incident.assignedResponderId && (
                        <Select 
                          onValueChange={(responderId) => 
                            assignIncident.mutate({ incidentId: incident.id, responderId })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder={t('dashboard.assign_to')} />
                          </SelectTrigger>
                          <SelectContent>
                            {responders.filter((r: UserType) => r.role === 'responder' && r.isActive).map((responder: UserType) => (
                              <SelectItem key={responder.id} value={responder.id}>
                                {responder.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {incident.assignedResponderId === currentUser.id && (
                        <Select 
                          value={incident.status}
                          onValueChange={(status) => 
                            updateStatus.mutate({ incidentId: incident.id, status })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accepted">{t('dashboard.accepted')}</SelectItem>
                            <SelectItem value="en_route">{t('dashboard.en_route')}</SelectItem>
                            <SelectItem value="on_scene">{t('dashboard.on_scene')}</SelectItem>
                            <SelectItem value="resolved">{t('dashboard.resolved')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenChat(incident.id)}
                        className="flex items-center space-x-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('dashboard.chat')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredIncidents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t('dashboard.no_incidents')}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="responders" className="space-y-4">
          <h2 className="text-lg font-semibold">{t('dashboard.responder_management')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responders.map((responder: UserType) => (
              <Card key={responder.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{responder.name}</h3>
                        <p className="text-sm text-gray-600">{responder.phoneNumber}</p>
                      </div>
                    </div>
                    <Badge variant={responder.isActive ? "default" : "secondary"}>
                      {responder.isActive ? t('dashboard.active') : t('dashboard.offline')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <h2 className="text-lg font-semibold">{t('dashboard.unit_management')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {units.map((unit: EmergencyUnit) => (
              <Card key={unit.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{unit.callSign}</h3>
                      <p className="text-sm text-gray-600">{unit.unitType}</p>
                    </div>
                    <Badge variant={unit.status === 'available' ? "default" : "secondary"}>
                      {unit.status.toUpperCase()}
                    </Badge>
                  </div>
                  {unit.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {unit.location.address}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-lg font-semibold">{t('dashboard.service_analytics')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.response_metrics')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('dashboard.avg_response_time')}</span>
                    <span className="font-semibold">8.5 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('dashboard.completion_rate')}</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('dashboard.incidents_today')}</span>
                    <span className="font-semibold">{incidents.filter((i: Incident) => {
                      const today = new Date();
                      const incidentDate = new Date(i.createdAt);
                      return today.toDateString() === incidentDate.toDateString();
                    }).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.incident_types')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Accident', 'Medical Emergency', 'Fire', 'Crime', 'Other'].map((type) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{type}</span>
                      <span className="font-medium">
                        {incidents.filter((i: Incident) => i.category === type.toLowerCase()).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}