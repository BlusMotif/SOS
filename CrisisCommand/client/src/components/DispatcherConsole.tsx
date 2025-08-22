import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, FireExtinguisher, Ambulance, MapPin, UserPlus, MessageCircle, Plus, Map, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { type Incident, type EmergencyUnit } from '@shared/schema';

interface DispatcherConsoleProps {
  currentUserId: string;
  onOpenChat: (incident: Incident) => void;
}

export function DispatcherConsole({ currentUserId, onOpenChat }: DispatcherConsoleProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get active incidents
  const { data: incidents = [] } = useQuery({
    queryKey: ['/api/incidents'],
    select: (allIncidents: Incident[]) => 
      allIncidents.filter(incident => incident.status !== 'resolved' && incident.status !== 'closed'),
  });

  // Get emergency units
  const { data: emergencyUnits = [] } = useQuery<EmergencyUnit[]>({
    queryKey: ['/api/emergency-units'],
  });

  // Assign incident mutation
  const assignIncident = useMutation({
    mutationFn: async ({ incidentId, unitId }: { incidentId: string; unitId: string }) => {
      const response = await apiRequest('PUT', `/api/incidents/${incidentId}`, {
        status: 'assigned',
        assignedUnitId: unitId,
        assignedDispatcherId: currentUserId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      toast({
        title: "Success",
        description: "Unit assigned to incident",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign unit",
        variant: "destructive",
      });
    },
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'police': return <Shield className="h-5 w-5" />;
      case 'fire': return <FireExtinguisher className="h-5 w-5" />;
      case 'ambulance': return <Ambulance className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'police': return 'text-blue-600';
      case 'fire': return 'text-red-600';
      case 'ambulance': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-emergency-red';
      case 'medium': return 'bg-alert-orange';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-safe-green';
      case 'busy': return 'bg-alert-orange';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const urgentCount = incidents.filter(incident => incident.priority === 'high' || incident.priority === 'critical').length;
  const availableUnits = (emergencyUnits as EmergencyUnit[]).filter(unit => unit.status === 'available');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="dispatcher-console">
      {/* Main Incident Queue */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold" data-testid="text-active-incidents-title">
                {t('dispatcher.active_incidents')}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className="bg-emergency-red text-white" data-testid="badge-urgent-count">
                  {urgentCount}
                </Badge>
                <span className="text-sm text-gray-600">{t('dispatcher.urgent')}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
            {incidents.map((incident) => (
              <div 
                key={incident.id} 
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                data-testid={`incident-card-${incident.id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-emergency-red rounded-full flex items-center justify-center ${getServiceColor(incident.type)}`}>
                      {getServiceIcon(incident.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-600">
                        {t('common.reported_by')}: Reporter (+233 XX XXX XXXX)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getPriorityColor(incident.priority)} text-white text-xs`}>
                      {incident.priority.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(incident.createdAt!).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">{t('common.location')}:</span>
                    <p className="font-medium">{incident.location.address}</p>
                    {incident.location.ghanaPostGPS && (
                      <p className="text-xs text-gray-500">{incident.location.ghanaPostGPS}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">{t('common.service')}:</span>
                    <p className={`font-medium ${getServiceColor(incident.type)}`}>
                      {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} ({incident.serviceNumber})
                    </p>
                  </div>
                </div>
                
                {incident.status === 'assigned' && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                    <div className="flex items-center text-trust-blue text-sm">
                      <div className={getServiceColor(incident.type)}>
                        {getServiceIcon(incident.type)}
                      </div>
                      <span className="font-medium ml-2">Unit {incident.assignedUnitId} {t('common.dispatched')}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {incident.status === 'new' && (
                      <Button 
                        size="sm"
                        className="bg-trust-blue hover:bg-blue-700 text-white"
                        onClick={() => {
                          const availableUnit = availableUnits.find(unit => 
                            unit.unitType === incident.type || unit.unitType === 'unified'
                          );
                          if (availableUnit) {
                            assignIncident.mutate({ incidentId: incident.id, unitId: availableUnit.id });
                          } else {
                            toast({
                              title: "No Available Units",
                              description: `No ${incident.type} units available`,
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={assignIncident.isPending}
                        data-testid={`button-assign-${incident.id}`}
                      >
                        <UserPlus className="mr-1 h-3 w-3" />
                        {t('dispatcher.assign_unit')}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-view-map-${incident.id}`}
                    >
                      <MapPin className="mr-1 h-3 w-3" />
                      {t('dispatcher.view_map')}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onOpenChat(incident)}
                    data-testid={`button-dispatcher-chat-${incident.id}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {incidents.length === 0 && (
              <p className="text-gray-500 text-center py-8" data-testid="text-no-active-incidents">
                No active incidents at this time.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dispatcher.dashboard')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dispatcher.active_incidents_count')}</span>
              <span className="font-bold text-xl text-emergency-red" data-testid="stat-active-incidents">
                {incidents.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dispatcher.response_time')}</span>
              <span className="font-bold text-xl text-trust-blue" data-testid="stat-response-time">
                6.2m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dispatcher.units_available')}</span>
              <span className="font-bold text-xl text-safe-green" data-testid="stat-available-units">
                {availableUnits.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dispatcher.today_total')}</span>
              <span className="font-bold text-xl text-gray-700" data-testid="stat-today-total">
                47
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Available Units */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyUnits.map((unit) => (
              <div 
                key={unit.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                data-testid={`unit-${unit.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getUnitStatusColor(unit.status)} rounded-full flex items-center justify-center`}>
                    {getServiceIcon(unit.unitType)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{unit.callSign}</p>
                    <p className="text-xs text-gray-600">{unit.location?.address || 'Unknown location'}</p>
                  </div>
                </div>
                <Badge className={`${getUnitStatusColor(unit.status)} text-white text-xs`}>
                  {unit.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full bg-trust-blue hover:bg-blue-700 text-white"
              data-testid="button-create-incident"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Incident
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-view-map"
            >
              <Map className="mr-2 h-4 w-4" />
              {t('dispatcher.view_map')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-view-reports"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
