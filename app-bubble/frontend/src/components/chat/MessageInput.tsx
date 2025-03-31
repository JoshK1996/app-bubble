import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { useSocket } from '../../contexts/SocketContext';

// Define chat events
enum ChatEvents {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  NEW_MESSAGE = 'new_message',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_TYPING = 'user_typing',
  USER_STOPPED_TYPING = 'user_stopped_typing',
}

interface MessageInputProps {
  roomId: string;
  onSendMessage: (content: string) => void;
}

/**
 * Component for entering and sending messages
 */
const MessageInput: React.FC<MessageInputProps> = ({ roomId, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { socket } = useSocket();

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing status
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit(ChatEvents.USER_TYPING, { roomId });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit(ChatEvents.USER_STOPPED_TYPING, { roomId });
    }, 2000);
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socket?.emit(ChatEvents.USER_STOPPED_TYPING, { roomId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    // Focus textarea after sending
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle Enter key to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative border-t border-gray-200 p-3 bg-white">
      <div className="flex items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 max-h-32 border border-gray-300 rounded-l-lg py-2 px-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={1}
          data-testid="message-input"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg h-full"
          disabled={!message.trim()}
          data-testid="send-button"
        >
          <IoSend className="text-xl" />
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-1 pl-2">
        Press <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> to send, <kbd className="bg-gray-200 px-1 rounded">Shift+Enter</kbd> for new line
      </div>
    </form>
  );
};

export default MessageInput; 