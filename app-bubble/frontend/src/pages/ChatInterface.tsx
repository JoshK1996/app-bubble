import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import { ChatRoom, getUserChatRooms, createDirectChatRoom, createGroupChatRoom } from '../services/chatService';

/**
 * Main chat interface page component
 */
const ChatInterface: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch chat rooms on component mount
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const rooms = await getUserChatRooms();
        setChatRooms(rooms);
        
        // Select the first room by default if none is selected
        if (rooms.length > 0 && !selectedRoomId) {
          setSelectedRoomId(rooms[0].id);
        }
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchChatRooms();
    }
  }, [isAuthenticated, selectedRoomId]);
  
  // Handle creating a new direct chat
  const handleCreateDirectChat = async (participantId: string) => {
    try {
      const newRoom = await createDirectChatRoom(participantId);
      setChatRooms(prev => {
        // Check if the room already exists
        const exists = prev.some(room => room.id === newRoom.id);
        if (exists) {
          return prev;
        }
        return [newRoom, ...prev];
      });
      setSelectedRoomId(newRoom.id);
      setShowNewChatModal(false);
    } catch (err) {
      console.error('Error creating chat room:', err);
      setError('Failed to create chat room');
    }
  };
  
  // Handle creating a new group chat
  const handleCreateGroupChat = async (name: string, participantIds: string[]) => {
    try {
      const newRoom = await createGroupChatRoom(name, participantIds);
      setChatRooms(prev => [newRoom, ...prev]);
      setSelectedRoomId(newRoom.id);
      setShowNewChatModal(false);
    } catch (err) {
      console.error('Error creating group chat room:', err);
      setError('Failed to create group chat room');
    }
  };
  
  // Get the selected chat room
  const selectedRoom = chatRooms.find(room => room.id === selectedRoomId);

  return (
    <SocketProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        <div className="flex-1 flex overflow-hidden">
          {/* Chat list sidebar */}
          <div className="w-1/4 min-w-[300px] max-w-md">
            <ChatList
              chatRooms={chatRooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              onCreateChat={() => setShowNewChatModal(true)}
            />
          </div>
          
          {/* Chat window */}
          <div className="flex-1">
            {selectedRoom ? (
              <ChatWindow chatRoom={selectedRoom} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-700">No chat selected</h2>
                  <p className="text-gray-500 mt-2">Select a conversation or start a new one</p>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Start a new chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* New chat modal - simplified for now, would be a separate component in a real app */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Chat</h2>
              <p className="text-gray-600 mb-4">
                For simplicity, this modal is just a placeholder. In a real app, you would have:
              </p>
              <ul className="list-disc ml-5 mb-4">
                <li>User search to find people to chat with</li>
                <li>Option to create direct or group chats</li>
                <li>Group name input for group chats</li>
                <li>Selected participants list</li>
              </ul>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SocketProvider>
  );
};

export default ChatInterface; 