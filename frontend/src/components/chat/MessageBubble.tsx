import React from 'react';
import { Message } from '../../services/chatService';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

/**
 * Component for rendering individual chat messages
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  // Format timestamp
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      data-testid="message-bubble"
    >
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
          {message.sender.avatar ? (
            <img 
              src={message.sender.avatar} 
              alt={message.sender.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div className="max-w-[75%]">
        {!isCurrentUser && (
          <div className="text-xs text-gray-500 mb-1">{message.sender.name}</div>
        )}
        
        <div 
          className={`p-3 rounded-lg ${
            isCurrentUser 
              ? 'bg-blue-500 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          {message.content}
          <div 
            className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}
          >
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
          {message.sender.avatar ? (
            <img 
              src={message.sender.avatar} 
              alt={message.sender.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-300 flex items-center justify-center text-sm">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble; 