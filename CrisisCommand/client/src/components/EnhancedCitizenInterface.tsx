import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, FireExtinguisher, Ambulance, Phone, VolumeX, MapPin, CheckCircle, 
  AlertTriangle, Car, Users, Clock, Camera, MessageCircle, Navigation,
  Wifi, WifiOff, Upload, HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User, Incident, IncidentCategory, insertIncidentSchema } from '@shared/schema';

interface IncidentFormData {
  serviceId: string;
  type: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    ghanaPostGPS?: string;
  };
  serviceNumber: string;
  isSilent: boolean;
  isOffline: boolean;
}

const formSchema = insertIncidentSchema.extend({
  description: z.string().min(10, 'Please provide more details about the emergency'),
});

interface EnhancedCitizenInterfaceProps {
  currentUser: User;
  onOpenChat: (incidentId: string) => void;
  onOpenMediaUpload: (incidentId: string) => void;
}

export function EnhancedCitizenInterface({ currentUser, onOpenChat, onOpenMediaUpload }: EnhancedCitizenInterfaceProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<'active' | 'inactive'>('inactive');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showCategoryModal, setCategoryModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [queuedIncidents, setQueuedIncidents] = useState<IncidentFormData[]>([]);

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: 'high',
      isSilent: false,
      isOffline: false,
    },
  });

  // Fetch user's incidents
  const { data: userIncidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/incidents/user', currentUser.id],
  });

  // Fetch incident categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/incident-categories', selectedService],
    enabled: !!selectedService,
  });

  // Create incident mutation
  const createIncident = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      if (isOfflineMode) {
        // Queue for later
        setQueuedIncidents(prev => [...prev, { ...data, isOffline: true }]);
        return { id: Date.now().toString(), ...data };
      }
      return apiRequest('/api/incidents', {
        method: 'POST',
        data: { ...data, reporterId: currentUser.id },
      });
    },
    onSuccess: (incident) => {
      if (!isOfflineMode) {
        queryClient.invalidateQueries({ queryKey: ['/api/incidents/user'] });
        setShowEmergencyModal(true);
      }
    },
  });

  // Emergency services configuration
  const emergencyServices = [
    {
      id: 'police',
      name: t('emergency.police'),
      number: '191',
      icon: Shield,
      color: 'bg-blue-600',
      categories: ['robbery', 'assault', 'accident', 'domestic_violence', 'theft'],
    },
    {
      id: 'fire',
      name: t('emergency.fire'),
      number: '192',
      icon: FireExtinguisher,
      color: 'bg-red-600',
      categories: ['fire', 'explosion', 'gas_leak', 'chemical_spill', 'building_collapse'],
    },
    {
      id: 'ambulance',
      name: t('emergency.ambulance'),
      number: '193',
      icon: Ambulance,
      color: 'bg-green-600',
      categories: ['medical_emergency', 'accident_injury', 'cardiac_arrest', 'overdose', 'mental_health'],
    },
    {
      id: 'nadmo',
      name: t('services.nadmo'),
      number: '311',
      icon: AlertTriangle,
      color: 'bg-orange-600',
      categories: ['flooding', 'earthquake', 'landslide', 'storm_damage', 'disaster_relief'],
    },
    {
      id: 'unified',
      name: t('emergency.unified'),
      number: '112',
      icon: Phone,
      color: 'bg-purple-600',
      categories: ['general_emergency', 'multiple_services', 'coordination'],
    },
  ];

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location',
          };
          setLocation(newLocation);
          setLocationAccuracy('active');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationAccuracy('inactive');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Check connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      // Process queued incidents
      queuedIncidents.forEach(incident => {
        createIncident.mutate({ ...incident, isOffline: false });
      });
      setQueuedIncidents([]);
    };

    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queuedIncidents, createIncident]);

  const handleEmergencySOS = (serviceId: string, serviceNumber: string, isSilent = false) => {
    setSelectedService(serviceId);
    form.setValue('serviceId', serviceId);
    form.setValue('serviceNumber', serviceNumber);
    form.setValue('type', serviceId);
    form.setValue('isSilent', isSilent);
    form.setValue('priority', 'critical');
    
    if (location) {
      form.setValue('location', location);
    }
    
    setCategoryModal(true);
  };

  const handleCategorySubmit = (data: IncidentFormData) => {
    createIncident.mutate(data);
    setCategoryModal(false);
    form.reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'border-l-green-500';
      case 'in-progress': case 'assigned': case 'accepted': case 'en_route': case 'on_scene': return 'border-l-blue-500';
      case 'new': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="enhanced-citizen-interface">
      {/* Connection Status */}
      <Card className={`border-l-4 ${isOfflineMode ? 'border-l-red-500' : 'border-l-green-500'}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOfflineMode ? (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) : (
                <Wifi className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm font-medium">
                {isOfflineMode ? t('citizen.offline_mode') : t('citizen.online_mode')}
              </span>
            </div>
            {queuedIncidents.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {queuedIncidents.length} {t('citizen.queued')}
              </Badge>
            )}
          </div>
          {isOfflineMode && (
            <p className="text-xs text-gray-600 mt-1">
              {t('citizen.offline_description')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Emergency SOS Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {t('emergency.title')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {t('emergency.subtitle')}
            </p>
            
            {/* Location Status */}
            <div className="flex flex-col sm:flex-row items-center justify-center mt-2 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
              <div className="flex items-center">
                <MapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-center sm:text-left">
                  {t('emergency.location')}: {location?.address || 'Getting location...'}
                </span>
              </div>
              <span className={`flex items-center sm:ml-2 ${locationAccuracy === 'active' ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {locationAccuracy === 'active' ? t('emergency.gps_active') : 'GPS Unavailable'}
              </span>
            </div>
          </div>

          {/* Primary Emergency Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {emergencyServices.slice(0, 4).map((service) => {
              const Icon = service.icon;
              return (
                <Button
                  key={service.id}
                  className={`${service.color} hover:opacity-90 text-white p-4 sm:p-6 h-auto flex-col space-y-2 pulse-emergency transform transition-transform duration-200 hover:scale-105 min-h-[100px] sm:min-h-[120px] text-center`}
                  onClick={() => handleEmergencySOS(service.id, service.number)}
                  disabled={createIncident.isPending}
                >
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  <div className="font-bold text-base sm:text-lg">{service.name}</div>
                  <div className="text-xs sm:text-sm opacity-90">{service.number}</div>
                </Button>
              );
            })}
          </div>

          {/* Unified Emergency */}
          <div className="mb-4">
            {emergencyServices.slice(4).map((service) => {
              const Icon = service.icon;
              return (
                <Button
                  key={service.id}
                  className={`w-full ${service.color} hover:opacity-90 text-white p-4 sm:p-6 h-auto flex items-center justify-center space-x-3 transform transition-transform duration-200 hover:scale-105`}
                  onClick={() => handleEmergencySOS(service.id, service.number)}
                  disabled={createIncident.isPending}
                >
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  <div>
                    <div className="font-bold text-base sm:text-lg">{service.name}</div>
                    <div className="text-xs sm:text-sm opacity-90">{service.number}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Silent SOS Option */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{t('emergency.silent_mode')}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{t('emergency.silent_desc')}</p>
              </div>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto text-sm sm:text-base"
                onClick={() => handleEmergencySOS('police', '191', true)}
                disabled={createIncident.isPending}
              >
                <VolumeX className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {t('emergency.silent_sos')}
              </Button>
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">{t('services.other')}</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors min-h-[60px] touch-target justify-start"
                onClick={() => handleEmergencySOS('nadmo', '311')}
              >
                <AlertTriangle className="text-orange-500 mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm sm:text-base">{t('services.nadmo')}</div>
                  <div className="text-xs sm:text-sm text-gray-600">311</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            {t('incidents.recent')}
          </h3>
          {userIncidents && userIncidents.length > 0 ? (
            <div className="space-y-3">
              {userIncidents.map((incident: Incident) => (
                <div
                  key={incident.id}
                  className={`bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 ${getStatusColor(incident.status)}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium text-sm sm:text-base">{incident.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{incident.location.address}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs">
                          {incident.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="ml-2 text-xs sm:text-sm text-gray-600">
                          {new Date(incident.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenChat(incident.id)}
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="text-xs sm:text-sm">{t('common.chat')}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenMediaUpload(incident.id)}
                      >
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="text-xs sm:text-sm">{t('common.media')}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">{t('incidents.none_reported')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Selection Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setCategoryModal}>
        <DialogContent className="max-w-md w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>{t('citizen.incident_details')}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCategorySubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('citizen.incident_category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('citizen.select_category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emergencyServices.find(s => s.id === selectedService)?.categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {t(`categories.${category}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('citizen.incident_title')}</FormLabel>
                    <FormControl>
                      <input
                        className="w-full p-2 border rounded-md"
                        placeholder={t('citizen.title_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('citizen.describe_emergency')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('citizen.description_placeholder')}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCategoryModal(false)}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={createIncident.isPending}
                >
                  {createIncident.isPending ? t('citizen.reporting') : t('citizen.report_emergency')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}