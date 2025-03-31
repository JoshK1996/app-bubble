import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message, ChatRoom, getChatRoomMessages, createMessage } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  chatRoom: ChatRoom;
}

/**
 * Component for displaying a chat room with messages and input
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ chatRoom }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await getChatRoomMessages(chatRoom.id);
        setMessages(response.messages);
        setCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatRoom.id]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket) return;

    // Join the chat room
    socket.emit('join_room', chatRoom.id);

    // New message handler
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    // User typing handlers
    const handleUserTyping = ({ userId }: { userId: string }) => {
      if (userId !== user?.id) {
        setTypingUsers(prev => new Set(prev).add(userId));
      }
    };

    const handleUserStoppedTyping = ({ userId }: { userId: string }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // Subscribe to events
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    // Cleanup
    return () => {
      socket.emit('leave_room', chatRoom.id);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, chatRoom.id, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load more messages
  const loadMoreMessages = async () => {
    if (!cursor || !hasMore || loading) return;

    try {
      setLoading(true);
      const response = await getChatRoomMessages(chatRoom.id, 20, cursor);
      
      setMessages(prev => [...response.messages, ...prev]);
      setCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      console.error('Error loading more messages:', err);
      setError('Failed to load more messages');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (!socket) {
      // Fallback to REST API if socket is not connected
      createMessage(chatRoom.id, content)
        .then(newMessage => {
          setMessages(prev => [...prev, newMessage]);
        })
        .catch(err => {
          console.error('Error sending message:', err);
        });
    } else {
      // Use socket.io for real-time
      socket.emit('new_message', { roomId: chatRoom.id, content });
    }
  };

  // Generate typing indicator text
  const getTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    
    const typingNames = Array.from(typingUsers)
      .map(id => {
        const participant = chatRoom.participants.find(p => p.user.id === id);
        return participant?.user.name || 'Someone';
      });
      
    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      return 'Several people are typing...';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <h2 className="text-lg font-semibold">
          {chatRoom.type === 'direct' 
            ? chatRoom.participants.find(p => p.user.id !== user?.id)?.user.name || 'Chat' 
            : chatRoom.name || 'Group Chat'}
        </h2>
        <div className="ml-auto text-sm text-gray-500">
          {chatRoom.participants.length} {chatRoom.participants.length === 1 ? 'member' : 'members'}
        </div>
      </div>
      
      {/* Messages container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        data-testid="messages-container"
      >
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={loading}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              data-testid="load-more-button"
            >
              {loading ? 'Loading...' : 'Load more messages'}
            </button>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        
        {messages.length === 0 && !loading && !error && (
          <div className="text-center text-gray-500 my-8">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          {getTypingIndicator()}
        </div>
      )}
      
      {/* Message input */}
      <MessageInput roomId={chatRoom.id} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow; 