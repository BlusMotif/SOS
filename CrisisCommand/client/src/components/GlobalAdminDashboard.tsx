import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, AlertTriangle, Car, Users, Clock, TrendingUp, MapPin, 
  Activity, BarChart3, PieChart, Building, Globe, Phone, Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { User, Incident, EmergencyService, PerformanceMetric } from '@shared/schema';

interface GlobalAdminDashboardProps {
  currentUser: User;
}

interface ServiceStats {
  serviceId: string;
  serviceName: string;
  activeIncidents: number;
  totalIncidents: number;
  availableResponders: number;
  totalResponders: number;
  avgResponseTime: number;
  completionRate: number;
  status: 'operational' | 'degraded' | 'critical';
}

interface RegionalData {
  region: string;
  incidents: number;
  responseTime: number;
  coverage: number;
}

export function GlobalAdminDashboard({ currentUser }: GlobalAdminDashboardProps) {
  const { t } = useTranslation();
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Fetch all incidents for analytics
  const { data: allIncidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/incidents/all'],
  });

  // Fetch all emergency services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/emergency-services'],
  });

  // Fetch performance metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/performance-metrics', selectedTimeframe],
  });

  const ghanaRegions = [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern',
    'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo', 'Western North',
    'Ahafo', 'Bono East', 'Oti', 'Savannah', 'North East'
  ];

  // Calculate service statistics
  const calculateServiceStats = (): ServiceStats[] => {
    const serviceMap = {
      'police': { name: 'Ghana Police Service', color: 'bg-blue-600' },
      'fire': { name: 'Ghana Fire Service', color: 'bg-red-600' },
      'ambulance': { name: 'National Ambulance Service', color: 'bg-green-600' },
      'nadmo': { name: 'NADMO', color: 'bg-orange-600' },
      'unified': { name: 'Unified Emergency', color: 'bg-purple-600' },
    };

    return Object.entries(serviceMap).map(([serviceId, info]) => {
      const serviceIncidents = allIncidents.filter((i: Incident) => i.serviceId === serviceId);
      const activeIncidents = serviceIncidents.filter((i: Incident) => 
        ['new', 'assigned', 'accepted', 'en_route', 'on_scene'].includes(i.status)
      );

      // Mock data for demo - in real app this would come from actual queries
      return {
        serviceId,
        serviceName: info.name,
        activeIncidents: activeIncidents.length,
        totalIncidents: serviceIncidents.length,
        availableResponders: Math.floor(Math.random() * 50) + 20,
        totalResponders: Math.floor(Math.random() * 100) + 50,
        avgResponseTime: Math.floor(Math.random() * 10) + 5, // minutes
        completionRate: Math.floor(Math.random() * 15) + 85, // percentage
        status: activeIncidents.length > 10 ? 'critical' : 
                activeIncidents.length > 5 ? 'degraded' : 'operational',
      } as ServiceStats;
    });
  };

  // Calculate regional data
  const calculateRegionalData = (): RegionalData[] => {
    return ghanaRegions.map(region => ({
      region,
      incidents: Math.floor(Math.random() * 50) + 10,
      responseTime: Math.floor(Math.random() * 8) + 4,
      coverage: Math.floor(Math.random() * 20) + 80,
    }));
  };

  const serviceStats = calculateServiceStats();
  const regionalData = calculateRegionalData();

  const totalActiveIncidents = serviceStats.reduce((sum, service) => sum + service.activeIncidents, 0);
  const totalResponders = serviceStats.reduce((sum, service) => sum + service.totalResponders, 0);
  const avgResponseTime = serviceStats.reduce((sum, service) => sum + service.avgResponseTime, 0) / serviceStats.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'police': return Shield;
      case 'fire': return AlertTriangle;
      case 'ambulance': return Car;
      case 'nadmo': return Globe;
      case 'unified': return Phone;
      default: return Users;
    }
  };

  return (
    <div className="space-y-6" data-testid="global-admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-ghana-red via-ghana-gold to-ghana-green rounded-lg flex items-center justify-center">
            <Building className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('global_admin.title')}</h1>
            <p className="text-gray-600">{t('global_admin.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">{t('global_admin.last_hour')}</SelectItem>
              <SelectItem value="24h">{t('global_admin.last_24h')}</SelectItem>
              <SelectItem value="7d">{t('global_admin.last_7d')}</SelectItem>
              <SelectItem value="30d">{t('global_admin.last_30d')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="w-3 h-3 mr-1" />
            {t('global_admin.system_operational')}
          </Badge>
        </div>
      </div>

      {/* National Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('global_admin.active_incidents')}</p>
                <p className="text-2xl font-bold text-red-600">{totalActiveIncidents}</p>
                <p className="text-xs text-gray-500">+12% {t('global_admin.vs_yesterday')}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('global_admin.total_responders')}</p>
                <p className="text-2xl font-bold text-blue-600">{totalResponders}</p>
                <p className="text-xs text-gray-500">{serviceStats.reduce((sum, s) => sum + s.availableResponders, 0)} {t('global_admin.available')}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('global_admin.avg_response_time')}</p>
                <p className="text-2xl font-bold text-green-600">{avgResponseTime.toFixed(1)}m</p>
                <p className="text-xs text-green-600">-2.1% {t('global_admin.improvement')}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('global_admin.system_uptime')}</p>
                <p className="text-2xl font-bold text-purple-600">99.7%</p>
                <p className="text-xs text-gray-500">{t('global_admin.last_30_days')}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('global_admin.overview')}</TabsTrigger>
          <TabsTrigger value="services">{t('global_admin.services')}</TabsTrigger>
          <TabsTrigger value="regions">{t('global_admin.regions')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('global_admin.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Incident Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>{t('global_admin.live_incidents')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allIncidents.slice(0, 5).map((incident: Incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        incident.priority === 'critical' ? 'bg-red-500' :
                        incident.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                      } animate-pulse`} />
                      <div>
                        <p className="font-medium text-sm">{incident.title}</p>
                        <p className="text-xs text-gray-600">{incident.location.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="text-xs" variant="outline">
                        {incident.serviceNumber}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{t('global_admin.service_status')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {serviceStats.map((service) => {
                  const Icon = getServiceIcon(service.serviceId);
                  return (
                    <div key={service.serviceId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm">{service.serviceName}</p>
                          <p className="text-xs text-gray-600">
                            {service.availableResponders}/{service.totalResponders} {t('global_admin.available')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${getStatusColor(service.status)}`}>
                          {service.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {service.activeIncidents} {t('global_admin.active')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <h2 className="text-lg font-semibold">{t('global_admin.service_performance')}</h2>
          <div className="grid grid-cols-1 gap-4">
            {serviceStats.map((service) => {
              const Icon = getServiceIcon(service.serviceId);
              return (
                <Card key={service.serviceId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">{service.serviceName}</h3>
                          <p className="text-sm text-gray-600">{service.serviceId.toUpperCase()}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">{t('global_admin.active_incidents')}</p>
                        <p className="text-xl font-bold text-red-600">{service.activeIncidents}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('global_admin.responders')}</p>
                        <p className="text-xl font-bold text-blue-600">
                          {service.availableResponders}/{service.totalResponders}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('global_admin.response_time')}</p>
                        <p className="text-xl font-bold text-green-600">{service.avgResponseTime}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('global_admin.completion_rate')}</p>
                        <p className="text-xl font-bold text-purple-600">{service.completionRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <h2 className="text-lg font-semibold">{t('global_admin.regional_overview')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalData.map((region) => (
              <Card key={region.region}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{region.region}</h3>
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('global_admin.incidents')}</span>
                      <span className="font-medium">{region.incidents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('global_admin.response_time')}</span>
                      <span className="font-medium">{region.responseTime}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('global_admin.coverage')}</span>
                      <span className="font-medium">{region.coverage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-lg font-semibold">{t('global_admin.performance_analytics')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>{t('global_admin.incident_trends')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('global_admin.today')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded">
                        <div className="w-3/4 h-2 bg-red-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">156</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('global_admin.yesterday')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded">
                        <div className="w-2/3 h-2 bg-orange-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">132</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('global_admin.last_week')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded">
                        <div className="w-1/2 h-2 bg-yellow-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">987</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>{t('global_admin.response_metrics')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('global_admin.under_5_min')}</span>
                    <span className="font-semibold">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('global_admin.5_10_min')}</span>
                    <span className="font-semibold">24%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('global_admin.over_10_min')}</span>
                    <span className="font-semibold">8%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('global_admin.national_target')}</span>
                      <span className="font-bold text-green-600">8 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}