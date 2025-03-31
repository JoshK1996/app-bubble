import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';

// Define chat events
enum ChatEvents {
  USER_TYPING = 'user_typing',
  USER_STOPPED_TYPING = 'user_stopped_typing',
  NEW_MESSAGE = 'new_message'
}

interface MessageInputProps {
  roomId: string;
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ roomId, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socket = useSocket();

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    onSendMessage(message);
    setMessage('');
    
    // Clear typing status
    if (isTyping) {
      setIsTyping(false);
      socket?.emit(ChatEvents.USER_STOPPED_TYPING, { roomId });
    }
  };

  // Handle typing events
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      socket?.emit(ChatEvents.USER_TYPING, { roomId });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout for stopped typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket?.emit(ChatEvents.USER_STOPPED_TYPING, { roomId });
      }
    }, 2000);
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, roomId, socket]);

  return (
    <form 
      className="relative flex border-t border-gray-200 p-3 bg-white"
      onSubmit={handleSubmit}
      data-testid="message-input-form"
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
        data-testid="message-input"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 focus:outline-none"
        disabled={!message.trim()}
        data-testid="send-message-button"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput; 