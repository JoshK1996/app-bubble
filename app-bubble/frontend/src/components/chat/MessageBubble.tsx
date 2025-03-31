import React from 'react';
import { Message } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
}

/**
 * Component for rendering individual chat messages
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isCurrentUserMessage = user?.id === message.senderId;
  
  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`flex mb-3 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
      data-testid="message-bubble"
    >
      <div 
        className={`max-w-[75%] px-4 py-2 rounded-lg 
          ${isCurrentUserMessage 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-200 text-gray-800 rounded-tl-none'
          }`}
      >
        {!isCurrentUserMessage && message.sender && (
          <div className="text-xs font-bold mb-1">
            {message.sender.name}
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div className="text-xs mt-1 text-right opacity-70">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 