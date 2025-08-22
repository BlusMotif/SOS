import { useState } from 'react';
import { Shield, LogOut, Settings, User as UserIcon, Globe, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from '@shared/schema';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  availableViews: string[];
  currentUser?: User;
  onLogout?: () => void;
}

export function Navigation({ currentView, onViewChange, availableViews, currentUser, onLogout }: NavigationProps) {
  const { t } = useTranslation();

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'citizen': return UserIcon;
      case 'service': return Shield;
      case 'global_admin': return Building;
      default: return UserIcon;
    }
  };

  const getViewLabel = (view: string) => {
    switch (view) {
      case 'citizen': return t('nav.citizen');
      case 'service': return t('nav.service_dashboard');
      case 'global_admin': return t('nav.global_admin');
      default: return view;
    }
  };

  const getServiceInfo = () => {
    if (!currentUser?.serviceId) return null;
    
    const serviceMap: Record<string, { name: string; color: string }> = {
      'police': { name: 'Ghana Police Service', color: 'bg-blue-600' },
      'fire': { name: 'Ghana Fire Service', color: 'bg-red-600' },
      'ambulance': { name: 'National Ambulance Service', color: 'bg-green-600' },
      'nadmo': { name: 'NADMO', color: 'bg-orange-600' },
      'unified': { name: 'Unified Emergency', color: 'bg-purple-600' },
    };
    
    return serviceMap[currentUser.serviceId] || null;
  };

  const serviceInfo = getServiceInfo();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3" data-testid="app-logo">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-ghana-red via-ghana-gold to-ghana-green rounded-lg flex items-center justify-center">
              <Shield className="text-white text-sm sm:text-lg" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">{t('app.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Selector - Hidden on mobile */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Service Badge for Service Members */}
            {serviceInfo && (
              <Badge variant="outline" className="hidden md:flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${serviceInfo.color}`} />
                <span className="text-xs">{serviceInfo.name}</span>
              </Badge>
            )}

            {/* View Switcher */}
            {currentUser && availableViews.length > 1 && (
              <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1" data-testid="view-switcher">
                {availableViews.map((view) => {
                  const Icon = getViewIcon(view);
                  return (
                    <button
                      key={view}
                      className={`flex items-center space-x-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        currentView === view
                          ? 'bg-white text-trust-blue shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => onViewChange(view)}
                      data-testid={`button-${view}-view`}
                    >
                      <Icon className="w-3 w-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{getViewLabel(view)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* User Menu */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {currentUser.name || t('nav.user')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.phoneNumber}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {t(`roles.${currentUser.role}`)}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="sm:hidden">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>{t('nav.language')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}