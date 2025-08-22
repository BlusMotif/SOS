import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FireExtinguisher, Ambulance, Phone, VolumeX, MapPin, CheckCircle, MessageCircle, TriangleAlert, Car } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { type Incident } from '@shared/schema';

interface CitizenInterfaceProps {
  currentUserId: string;
  onOpenChat: (incident: Incident) => void;
  onOpenEmergencyModal: (incident: Incident) => void;
}

export function CitizenInterface({ currentUserId, onOpenChat, onOpenEmergencyModal }: CitizenInterfaceProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<'loading' | 'active' | 'failed'>('loading');

  // Get user's incidents
  const { data: userIncidents } = useQuery({
    queryKey: ['/api/incidents'],
    select: (incidents: Incident[]) => incidents.filter(incident => incident.reporterId === currentUserId),
  });

  // Emergency SOS mutation
  const emergencySOS = useMutation({
    mutationFn: async (data: { type: string; serviceNumber: string; isSilent?: boolean }) => {
      if (!location) {
        throw new Error('Location not available');
      }

      const incidentData = {
        type: data.type,
        priority: 'high',
        title: `${data.type.toUpperCase()} Emergency`,
        description: data.isSilent ? 'Silent emergency alert' : 'Emergency SOS activated',
        location,
        serviceNumber: data.serviceNumber,
        isSilent: data.isSilent || false,
        reporterId: currentUserId,
      };

      const response = await apiRequest('POST', '/api/incidents', incidentData);
      return response.json();
    },
    onSuccess: (incident) => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      if (!incident.isSilent) {
        onOpenEmergencyModal(incident);
      } else {
        toast({
          title: "Silent SOS Sent",
          description: "Emergency services have been notified of your location.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Emergency SOS Failed",
        description: error instanceof Error ? error.message : "Failed to send emergency alert",
        variant: "destructive",
      });
    },
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: "Accra, Greater Accra Region", // In production, use reverse geocoding
          });
          setLocationAccuracy('active');
        },
        (error) => {
          console.warn('GPS access denied or unavailable');
          setLocationAccuracy('failed');
          // Fallback location for demo
          setLocation({
            latitude: 5.6037,
            longitude: -0.1870,
            address: "Accra, Greater Accra Region",
          });
        }
      );
    }
  }, []);

  const handleEmergencySOS = (type: string, serviceNumber: string) => {
    emergencySOS.mutate({ type, serviceNumber });
  };

  const handleSilentSOS = () => {
    emergencySOS.mutate({ type: 'police', serviceNumber: '191', isSilent: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-safe-green';
      case 'in-progress': case 'assigned': return 'bg-trust-blue';
      case 'new': return 'bg-alert-orange';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved': return t('incidents.status.resolved');
      case 'in-progress': case 'assigned': return t('incidents.status.in_progress');
      case 'new': return t('incidents.status.new');
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="citizen-interface">
      {/* Emergency SOS Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-emergency-title">
              {t('emergency.title')}
            </h2>
            <p className="text-gray-600" data-testid="text-emergency-subtitle">
              {t('emergency.subtitle')}
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
              <MapPin className="mr-1 h-4 w-4" />
              <span data-testid="text-user-location">
                {t('emergency.location')}: {location?.address || 'Getting location...'}
              </span>
              <span className={`ml-2 ${locationAccuracy === 'active' ? 'text-safe-green' : 'text-gray-400'}`}>
                <CheckCircle className="inline h-4 w-4 mr-1" />
                {locationAccuracy === 'active' ? t('emergency.gps_active') : 'GPS Unavailable'}
              </span>
            </div>
          </div>

          {/* Primary Emergency Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <Button
              className="bg-emergency-red hover:bg-red-700 text-white p-4 sm:p-6 h-auto flex-col space-y-2 pulse-emergency transform transition-transform duration-200 hover:scale-105 min-h-[100px] sm:min-h-[120px] text-center"
              onClick={() => handleEmergencySOS('police', '191')}
              disabled={emergencySOS.isPending}
              data-testid="button-emergency-police"
            >
              <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              <div className="font-bold text-base sm:text-lg">{t('emergency.police')}</div>
              <div className="text-xs sm:text-sm opacity-90">191</div>
            </Button>
            
            <Button
              className="bg-emergency-red hover:bg-red-700 text-white p-4 sm:p-6 h-auto flex-col space-y-2 pulse-emergency transform transition-transform duration-200 hover:scale-105 min-h-[100px] sm:min-h-[120px] text-center"
              onClick={() => handleEmergencySOS('fire', '192')}
              disabled={emergencySOS.isPending}
              data-testid="button-emergency-fire"
            >
              <FireExtinguisher className="h-6 w-6 sm:h-8 sm:w-8" />
              <div className="font-bold text-base sm:text-lg">{t('emergency.fire')}</div>
              <div className="text-xs sm:text-sm opacity-90">192</div>
            </Button>
            
            <Button
              className="bg-emergency-red hover:bg-red-700 text-white p-4 sm:p-6 h-auto flex-col space-y-2 pulse-emergency transform transition-transform duration-200 hover:scale-105 min-h-[100px] sm:min-h-[120px] text-center"
              onClick={() => handleEmergencySOS('ambulance', '193')}
              disabled={emergencySOS.isPending}
              data-testid="button-emergency-ambulance"
            >
              <Ambulance className="h-6 w-6 sm:h-8 sm:w-8" />
              <div className="font-bold text-base sm:text-lg">{t('emergency.ambulance')}</div>
              <div className="text-xs sm:text-sm opacity-90">193</div>
            </Button>
            
            <Button
              className="bg-trust-blue hover:bg-blue-700 text-white p-4 sm:p-6 h-auto flex-col space-y-2 transform transition-transform duration-200 hover:scale-105 min-h-[100px] sm:min-h-[120px] text-center"
              onClick={() => handleEmergencySOS('unified', '112')}
              disabled={emergencySOS.isPending}
              data-testid="button-emergency-unified"
            >
              <Phone className="h-6 w-6 sm:h-8 sm:w-8" />
              <div className="font-bold text-base sm:text-lg">{t('emergency.unified')}</div>
              <div className="text-xs sm:text-sm opacity-90">112</div>
            </Button>
          </div>

          {/* Silent SOS Option */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{t('emergency.silent_mode')}</h3>
                <p className="text-sm text-gray-600">{t('emergency.silent_desc')}</p>
              </div>
              <Button 
                className="bg-alert-orange hover:bg-orange-600 text-white"
                onClick={handleSilentSOS}
                disabled={emergencySOS.isPending}
                data-testid="button-silent-sos"
              >
                <VolumeX className="mr-2 h-4 w-4" />
                {t('emergency.silent_sos')}
              </Button>
            </div>
          </div>

          {/* Additional Emergency Contacts */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">{t('services.other')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a 
                href="tel:311" 
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                data-testid="link-nadmo"
              >
                <TriangleAlert className="text-alert-orange mr-3 h-5 w-5" />
                <div>
                  <div className="font-medium">{t('services.nadmo')}</div>
                  <div className="text-sm text-gray-600">311</div>
                </div>
              </a>
              <a 
                href="tel:18555" 
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                data-testid="link-road-safety"
              >
                <Car className="text-alert-orange mr-3 h-5 w-5" />
                <div>
                  <div className="font-medium">{t('services.road_safety')}</div>
                  <div className="text-sm text-gray-600">18555</div>
                </div>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-recent-incidents">
            {t('incidents.recent')}
          </h3>
          {userIncidents && userIncidents.length > 0 ? (
            <div className="space-y-3">
              {userIncidents.map((incident) => (
                <div 
                  key={incident.id} 
                  className={`bg-gray-50 rounded-lg p-4 border-l-4 ${
                    incident.status === 'resolved' ? 'border-safe-green' :
                    incident.status === 'assigned' || incident.status === 'in-progress' ? 'border-trust-blue' :
                    'border-alert-orange'
                  }`}
                  data-testid={`incident-${incident.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Badge className={`${getStatusColor(incident.status)} text-white text-xs`}>
                          {getStatusText(incident.status)}
                        </Badge>
                        <span className="ml-2 text-sm text-gray-600">
                          {new Date(incident.createdAt!).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{incident.title}</p>
                      <p className="text-sm text-gray-600">{incident.location.address}</p>
                      {incident.status === 'assigned' && (
                        <div className="mt-2 flex items-center text-sm text-trust-blue">
                          <Ambulance className="mr-1 h-4 w-4" />
                          <span>Unit dispatched</span>
                        </div>
                      )}
                    </div>
                    {incident.status !== 'resolved' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onOpenChat(incident)}
                        data-testid={`button-chat-${incident.id}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8" data-testid="text-no-incidents">
              No recent incidents reported.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
