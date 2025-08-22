import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Car } from 'lucide-react';

interface SimpleAuthLoginProps {
  onLogin: (user: any) => void;
}

export function SimpleAuthLogin({ onLogin }: SimpleAuthLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [serviceId, setServiceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emergencyServices = [
    { id: 'police', name: 'Ghana Police Service', number: '191', icon: Shield, color: 'bg-blue-600' },
    { id: 'fire', name: 'Ghana Fire Service', number: '192', icon: AlertTriangle, color: 'bg-red-600' },
    { id: 'ambulance', name: 'National Ambulance Service', number: '193', icon: Car, color: 'bg-green-600' },
    { id: 'nadmo', name: 'NADMO', number: '311', icon: AlertTriangle, color: 'bg-orange-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !name) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate authentication
      const user = {
        id: Date.now().toString(),
        phoneNumber,
        role,
        serviceId: (role === 'responder' || role === 'service_admin') ? serviceId : undefined,
        name,
        preferredLanguage: 'en',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setTimeout(() => {
        onLogin(user);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                data-testid="input-phone-number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="responder">Emergency Responder</SelectItem>
                  <SelectItem value="service_admin">Service Administrator</SelectItem>
                  <SelectItem value="global_admin">Global Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(role === 'responder' || role === 'service_admin') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Emergency Service</label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger data-testid="select-service">
                    <SelectValue placeholder="Select your service" />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencyServices.map((service) => {
                      const Icon = service.icon;
                      return (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span>{service.name}</span>
                            <span className="text-xs text-gray-500">
                              ({service.number})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {emergencyServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Button
                    key={service.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-xs"
                    onClick={() => {
                      setRole('responder');
                      setServiceId(service.id);
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{service.number}</span>
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