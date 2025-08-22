import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { SimpleAuthLogin } from '@/components/SimpleAuthLogin';
import { EnhancedCitizenInterface } from '@/components/EnhancedCitizenInterface';
import { ServiceDashboard } from '@/components/ServiceDashboard';
import { GlobalAdminDashboard } from '@/components/GlobalAdminDashboard';
import { LiveChat } from '@/components/LiveChat';
import { MediaUpload } from '@/components/MediaUpload';
import { EmergencyModal } from '@/components/EmergencyModal';
import { User, Incident } from '@shared/schema';

type ViewType = 'citizen' | 'service' | 'global_admin';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('citizen');
  const [chatOpen, setChatOpen] = useState(false);
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('');

  // Auto-determine view based on user role
  useEffect(() => {
    if (currentUser) {
      switch (currentUser.role) {
        case 'citizen':
          setCurrentView('citizen');
          break;
        case 'responder':
        case 'service_admin':
          setCurrentView('service');
          break;
        case 'global_admin':
          setCurrentView('global_admin');
          break;
        default:
          setCurrentView('citizen');
      }
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('citizen');
  };

  const handleOpenChat = (incidentId: string) => {
    setActiveIncidentId(incidentId);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setActiveIncidentId('');
  };

  const handleOpenMediaUpload = (incidentId: string) => {
    setActiveIncidentId(incidentId);
    setMediaUploadOpen(true);
  };

  const handleCloseMediaUpload = () => {
    setMediaUploadOpen(false);
    setActiveIncidentId('');
  };

  const handleOpenEmergencyModal = (incident: Incident) => {
    setActiveIncident(incident);
    setEmergencyModalOpen(true);
  };

  const handleCloseEmergencyModal = () => {
    setEmergencyModalOpen(false);
    setActiveIncident(null);
  };

  const handleViewChange = (view: ViewType) => {
    // Only allow view changes for certain roles
    if (currentUser?.role === 'global_admin') {
      setCurrentView(view);
    } else if (currentUser?.role === 'service_admin' && view !== 'global_admin') {
      setCurrentView(view);
    } else if (!currentUser || currentUser.role === 'citizen') {
      setCurrentView('citizen');
    }
  };

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <SimpleAuthLogin onLogin={handleLogin} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'citizen':
        return (
          <EnhancedCitizenInterface
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
            onOpenMediaUpload={handleOpenMediaUpload}
          />
        );
      case 'service':
        return (
          <ServiceDashboard
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
          />
        );
      case 'global_admin':
        return <GlobalAdminDashboard currentUser={currentUser} />;
      default:
        return (
          <EnhancedCitizenInterface
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
            onOpenMediaUpload={handleOpenMediaUpload}
          />
        );
    }
  };

  const getAvailableViews = () => {
    const views = ['citizen'];
    
    if (currentUser.role === 'responder' || currentUser.role === 'service_admin') {
      views.push('service');
    }
    
    if (currentUser.role === 'global_admin') {
      views.push('service', 'global_admin');
    }
    
    return views;
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-page">
      <Navigation 
        currentView={currentView} 
        onViewChange={handleViewChange}
        availableViews={getAvailableViews()}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto p-3 sm:p-4">
        {renderCurrentView()}
      </main>

      {/* Modals */}
      {chatOpen && (
        <LiveChat
          incidentId={activeIncidentId}
          currentUserId={currentUser.id}
          isOpen={chatOpen}
          onClose={handleCloseChat}
        />
      )}

      {mediaUploadOpen && (
        <MediaUpload
          incidentId={activeIncidentId}
          isOpen={mediaUploadOpen}
          onClose={handleCloseMediaUpload}
          onUpload={(files) => {
            console.log('Files uploaded:', files);
            // Handle file upload
          }}
        />
      )}

      {emergencyModalOpen && activeIncident && (
        <EmergencyModal
          incident={activeIncident}
          isOpen={emergencyModalOpen}
          onClose={handleCloseEmergencyModal}
          onOpenChat={() => {
            handleCloseEmergencyModal();
            handleOpenChat(activeIncident.id);
          }}
          onOpenMediaUpload={() => {
            handleCloseEmergencyModal();
            handleOpenMediaUpload(activeIncident.id);
          }}
        />
      )}
    </div>
  );
}