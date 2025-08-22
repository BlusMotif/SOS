import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Phone, Users, Globe, AlertTriangle, Car } from 'lucide-react';

const loginSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['citizen', 'responder', 'service_admin', 'global_admin']),
  serviceId: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface EmergencyService {
  id: string;
  name: string;
  code: string;
  serviceNumbers: string[];
  description?: string;
}

const emergencyServices: EmergencyService[] = [
  {
    id: 'police',
    name: 'Ghana Police Service',
    code: 'POLICE',
    serviceNumbers: ['191'],
    description: 'Law enforcement and crime prevention services',
  },
  {
    id: 'fire',
    name: 'Ghana National Fire Service',
    code: 'FIRE',
    serviceNumbers: ['192'],
    description: 'Fire prevention, suppression, and rescue services',
  },
  {
    id: 'ambulance',
    name: 'National Ambulance Service',
    code: 'AMBULANCE',
    serviceNumbers: ['193'],
    description: 'Emergency medical services and patient transport',
  },
  {
    id: 'nadmo',
    name: 'National Disaster Management Organisation',
    code: 'NADMO',
    serviceNumbers: ['311'],
    description: 'Disaster preparedness and response coordination',
  },
  {
    id: 'unified',
    name: 'Unified Emergency Hotline',
    code: 'UNIFIED',
    serviceNumbers: ['112'],
    description: 'Coordinated emergency response dispatch center',
  },
];

interface AuthLoginProps {
  onLogin: (user: any) => void;
}

export function AuthLogin({ onLogin }: AuthLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'citizen',
      phoneNumber: '',
      name: '',
    },
  });

  const selectedRole = form.watch('role');

  const getServiceIcon = (code: string) => {
    switch (code) {
      case 'POLICE': return Shield;
      case 'FIRE': return AlertTriangle;
      case 'AMBULANCE': return Car;
      case 'NADMO': return Globe;
      case 'UNIFIED': return Phone;
      default: return Users;
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Simulate authentication
      const user = {
        id: Date.now().toString(),
        phoneNumber: data.phoneNumber,
        role: data.role,
        serviceId: data.serviceId,
        name: data.name,
        preferredLanguage: 'en',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      onLogin(user);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghana-red via-ghana-gold to-ghana-green flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-ghana-red via-ghana-gold to-ghana-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white text-2xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Aegis GH
          </CardTitle>
          <p className="text-gray-600">
            Emergency Response Platform for Ghana
          </p>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+233 XX XXX XXXX"
                        {...field}
                        data-testid="input-phone-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="responder">Emergency Responder</SelectItem>
                        <SelectItem value="service_admin">Service Administrator</SelectItem>
                        <SelectItem value="global_admin">Global Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedRole === 'responder' || selectedRole === 'service_admin') && (
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Service</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service">
                            <SelectValue placeholder="Select your service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emergencyServices.map((service) => {
                            const Icon = getServiceIcon(service.code);
                            return (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{service.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({service.serviceNumbers.join(', ')})
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="w-full bg-trust-blue hover:bg-blue-700 text-white"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {emergencyServices.slice(0, 4).map((service) => {
                const Icon = getServiceIcon(service.code);
                return (
                  <Button
                    key={service.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-xs"
                    onClick={() => {
                      form.setValue('role', 'responder');
                      form.setValue('serviceId', service.id);
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{service.serviceNumbers[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}