import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type ChatMessage, type Incident } from '@shared/schema';

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  currentUserId: string;
}

export function LiveChat({ isOpen, onClose, incident, currentUserId }: LiveChatProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  const { data: existingMessages } = useQuery({
    queryKey: ['/api/incidents', incident?.id, 'messages'],
    enabled: !!incident?.id && isOpen,
  });

  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages as ChatMessage[]);
    }
  }, [existingMessages]);

  // WebSocket connection
  useEffect(() => {
    if (isOpen && incident && currentUserId) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${currentUserId}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.message.incidentId === incident.id) {
          setMessages(prev => [...prev, data.message]);
        }
      };

      ws.onclose = () => {
        setSocket(null);
      };

      return () => {
        ws.close();
      };
    }
  }, [isOpen, incident, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !socket || !incident) return;

    const messageData = {
      type: 'chat_message',
      incidentId: incident.id,
      content: message,
      senderId: currentUserId
    };

    socket.send(JSON.stringify(messageData));
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!incident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[500px] sm:h-[600px] w-[95vw] sm:w-auto flex flex-col" data-testid="chat-modal">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span data-testid="text-chat-title">
              {t('chat.title')} - Incident #{incident.id.slice(-6)}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-chat">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 p-2 sm:p-4" data-testid="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[250px] sm:max-w-xs px-3 sm:px-4 py-2 rounded-lg ${
                msg.senderId === currentUserId 
                  ? 'bg-blue-100 text-blue-900 rounded-br-sm' 
                  : 'bg-purple-100 text-purple-900 rounded-bl-sm'
              }`} data-testid={`message-${msg.id}`}>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {formatTime(msg.createdAt!)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="flex space-x-2 p-2 sm:p-4 border-t">
          <Input
            placeholder={t('chat.type_message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="input-chat-message"
          />
          <Button 
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-trust-blue hover:bg-blue-700 px-3 sm:px-4"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
