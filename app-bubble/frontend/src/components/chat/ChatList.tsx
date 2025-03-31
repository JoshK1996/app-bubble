import React, { useState } from 'react';
import { ChatRoom } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { IoPersonAdd, IoSearch } from 'react-icons/io5';

interface ChatListProps {
  chatRooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onCreateChat: () => void;
}

/**
 * Component for displaying a list of chat rooms
 */
const ChatList: React.FC<ChatListProps> = ({ 
  chatRooms, 
  selectedRoomId, 
  onSelectRoom,
  onCreateChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Filter rooms based on search query
  const filteredRooms = chatRooms.filter(room => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // For direct chats, search the other user's name
    if (room.type === 'direct') {
      const otherUser = room.participants.find(p => p.user.id !== user?.id)?.user;
      return otherUser?.name.toLowerCase().includes(query);
    }
    
    // For group chats, search the room name
    return (room.name || '').toLowerCase().includes(query);
  });
  
  // Get the chat room name
  const getRoomName = (room: ChatRoom): string => {
    if (room.type === 'direct') {
      return room.participants.find(p => p.user.id !== user?.id)?.user.name || 'Unknown User';
    }
    return room.name || 'Group Chat';
  };
  
  // Get the latest message preview
  const getLatestMessagePreview = (room: ChatRoom): string => {
    if (!room.messages || room.messages.length === 0) {
      return 'No messages yet';
    }
    
    const latestMessage = room.messages[0];
    const isSender = latestMessage.senderId === user?.id;
    
    const prefix = isSender ? 'You: ' : '';
    
    // Truncate long messages
    const content = latestMessage.content.length > 30
      ? `${latestMessage.content.substring(0, 30)}...`
      : latestMessage.content;
      
    return `${prefix}${content}`;
  };
  
  // Format the last activity time
  const getLastActivityTime = (room: ChatRoom): string => {
    if (!room.messages || room.messages.length === 0) {
      // Use room creation time if no messages
      return formatDistanceToNow(new Date(room.createdAt), { addSuffix: true });
    }
    
    const latestMessage = room.messages[0];
    return formatDistanceToNow(new Date(latestMessage.createdAt), { addSuffix: true });
  };

  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="chat-search-input"
          />
          <IoSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
        </div>
        
        <button 
          onClick={onCreateChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
          data-testid="new-chat-button"
        >
          <IoPersonAdd /> New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            {searchQuery ? 'No chats match your search' : 'No chats yet'}
          </div>
        ) : (
          <ul>
            {filteredRooms.map(room => (
              <li key={room.id}>
                <button
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                    selectedRoomId === room.id ? 'bg-blue-50' : ''
                  }`}
                  data-testid={`chat-room-${room.id}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate">{getRoomName(room)}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {getLastActivityTime(room)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {getLatestMessagePreview(room)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList; 