import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CloudUpload, Camera, Video, Mic, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string | null;
}

export function MediaUpload({ isOpen, onClose, incidentId }: MediaUploadProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUpload = async () => {
    if (!incidentId || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await apiRequest('POST', `/api/incidents/${incidentId}/media`, formData);
      
      toast({
        title: "Success",
        description: "Media files uploaded successfully",
      });
      
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const captureMedia = async (type: 'photo' | 'video' | 'audio') => {
    try {
      const constraints = {
        photo: { video: { facingMode: 'environment' } },
        video: { video: true, audio: true },
        audio: { audio: true }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints[type]);
      
      // Basic media capture implementation
      // In a production app, you'd want a more sophisticated media capture UI
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: type === 'audio' ? 'audio/wav' : 'video/mp4' });
        const file = new File([blob], `${type}-${Date.now()}.${type === 'audio' ? 'wav' : 'mp4'}`, { type: blob.type });
        setSelectedFiles([...selectedFiles, file]);
        stream.getTracks().forEach(track => track.stop());
      };

      if (type === 'photo') {
        // For photos, we'd typically use canvas to capture a frame
        // This is a simplified implementation
        setTimeout(() => {
          mediaRecorder.stop();
        }, 100);
      } else {
        mediaRecorder.start();
        // Stop recording after 30 seconds for demo
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 30000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to access ${type} device`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-auto" data-testid="media-upload-modal">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {t('media.upload_evidence')}
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-media">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors cursor-pointer touch-target"
            onClick={() => fileInputRef.current?.click()}
            data-testid="file-drop-zone"
          >
            <CloudUpload className="text-3xl sm:text-4xl text-gray-400 mb-4 mx-auto" />
            <p className="text-xs sm:text-sm text-gray-600">{t('media.drag_drop')}</p>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*,video/*,audio/*" 
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              data-testid="input-file-upload"
            />
          </div>
          
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files:</h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Capture Options */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="p-3 sm:p-4 h-auto flex-col touch-target min-h-[80px] sm:min-h-[90px]"
              onClick={() => captureMedia('photo')}
              data-testid="button-capture-photo"
            >
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
              <span className="text-xs">{t('media.photo')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-3 sm:p-4 h-auto flex-col touch-target min-h-[80px] sm:min-h-[90px]"
              onClick={() => captureMedia('video')}
              data-testid="button-capture-video"
            >
              <Video className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
              <span className="text-xs">{t('media.video')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-3 sm:p-4 h-auto flex-col touch-target min-h-[80px] sm:min-h-[90px]"
              onClick={() => captureMedia('audio')}
              data-testid="button-capture-audio"
            >
              <Mic className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
              <span className="text-xs">{t('media.audio')}</span>
            </Button>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel-upload"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              className="flex-1 bg-trust-blue hover:bg-blue-700"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              data-testid="button-upload-media"
            >
              {uploading ? 'Uploading...' : t('common.upload')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
