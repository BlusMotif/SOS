import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageCircle, Camera } from 'lucide-react';
import { type Incident } from '@shared/schema';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  onOpenChat: (incidentId: string) => void;
  onOpenMediaUpload: (incidentId: string) => void;
}

export function EmergencyModal({ 
  isOpen, 
  onClose, 
  incident, 
  onOpenChat, 
  onOpenMediaUpload 
}: EmergencyModalProps) {
  const { t } = useTranslation();

  if (!incident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[90vw] sm:w-auto" data-testid="emergency-modal">
        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emergency-red rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-white text-xl sm:text-2xl" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2" data-testid="text-modal-title">
            {t('emergency_modal.activated')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6" data-testid="text-modal-description">
            {t('emergency_modal.help_coming')}
          </p>
          
          <div className="space-y-3">
            <Button 
              className="w-full bg-trust-blue hover:bg-blue-700 min-h-[44px] text-sm sm:text-base"
              onClick={() => onOpenChat(incident.id)}
              data-testid="button-chat-dispatcher"
            >
              <MessageCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {t('emergency_modal.chat_dispatcher')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full min-h-[44px] text-sm sm:text-base"
              onClick={() => onOpenMediaUpload(incident.id)}
              data-testid="button-add-evidence"
            >
              <Camera className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {t('emergency_modal.add_evidence')}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full min-h-[44px] text-sm sm:text-base"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
