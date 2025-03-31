import { PrismaClient } from '@prisma/client';
import { CreateChatRoomRequest, GetChatRoomMessagesRequest } from './chat.types';

const prisma = new PrismaClient();

/**
 * Get all chat rooms for a user
 */
export const getUserChatRooms = async (userId: string) => {
  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return chatRooms;
};

/**
 * Get a single chat room by ID
 */
export const getChatRoomById = async (roomId: string, userId: string) => {
  // Check if user is a participant in this room
  const participant = await prisma.participant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
  });

  if (!participant) {
    throw new Error('User is not a participant in this chat room');
  }

  const chatRoom = await prisma.chatRoom.findUnique({
    where: {
      id: roomId,
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return chatRoom;
};

/**
 * Get messages for a chat room
 */
export const getChatRoomMessages = async ({ roomId, userId, limit = 50, cursor }: GetChatRoomMessagesRequest) => {
  // Check if user is a participant in this room
  const participant = await prisma.participant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
  });

  if (!participant) {
    throw new Error('User is not a participant in this chat room');
  }

  // Get user's last read time
  const lastRead = await prisma.participant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
    select: {
      lastRead: true,
    },
  });

  // Query params for fetching messages
  const queryParams: any = {
    where: {
      chatRoomId: roomId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  };

  // Add cursor if provided
  if (cursor) {
    queryParams.cursor = {
      id: cursor,
    };
    queryParams.skip = 1; // Skip the cursor itself
  }

  const messages = await prisma.message.findMany(queryParams);

  // Update last read time
  if (messages.length > 0) {
    await prisma.participant.update({
      where: {
        chatRoomId_userId: {
          chatRoomId: roomId,
          userId,
        },
      },
      data: {
        lastRead: new Date(),
      },
    });
  }

  // Get next cursor
  let nextCursor = null;
  if (messages.length === limit) {
    nextCursor = messages[messages.length - 1].id;
  }

  return {
    messages: messages.reverse(), // Reverse to get chronological order
    nextCursor,
  };
};

/**
 * Create a new message in a chat room
 */
export const createMessage = async (roomId: string, userId: string, content: string) => {
  // Check if user is a participant in this room
  const participant = await prisma.participant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
  });

  if (!participant) {
    throw new Error('User is not a participant in this chat room');
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content,
      senderId: userId,
      chatRoom: {
        connect: {
          id: roomId,
        },
      },
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Update the chatRoom's updatedAt timestamp
  await prisma.chatRoom.update({
    where: {
      id: roomId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  // Update the participant's last read time
  await prisma.participant.update({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
    data: {
      lastRead: new Date(),
    },
  });

  return message;
};

/**
 * Create a direct chat room between two users
 */
export const createDirectChatRoom = async ({ userId, participantId }: CreateChatRoomRequest) => {
  // Check if a direct chat room already exists between these users
  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      type: 'direct',
      participants: {
        every: {
          userId: {
            in: [userId, participantId!],
          },
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  // If it exists and has exactly 2 participants, return it
  if (existingRoom && existingRoom._count.participants === 2) {
    const fullRoom = await prisma.chatRoom.findUnique({
      where: {
        id: existingRoom.id,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return fullRoom;
  }

  // Create a new direct chat room
  const chatRoom = await prisma.chatRoom.create({
    data: {
      type: 'direct',
      participants: {
        create: [
          {
            userId,
            isAdmin: true,
            joinedAt: new Date(),
            lastRead: new Date(),
          },
          {
            userId: participantId!,
            isAdmin: false,
            joinedAt: new Date(),
            lastRead: new Date(),
          },
        ],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return chatRoom;
};

/**
 * Create a group chat room
 */
export const createGroupChatRoom = async ({ userId, name, participantIds }: CreateChatRoomRequest) => {
  if (!name) {
    throw new Error('Group chat room must have a name');
  }

  if (!participantIds || participantIds.length === 0) {
    participantIds = [];
  }

  // Make sure the creator is included
  if (!participantIds.includes(userId)) {
    participantIds.push(userId);
  }

  // Create participant objects
  const participantData = participantIds.map((id) => ({
    userId: id,
    isAdmin: id === userId, // creator is admin
    joinedAt: new Date(),
    lastRead: new Date(),
  }));

  // Create a new group chat room
  const chatRoom = await prisma.chatRoom.create({
    data: {
      name,
      type: 'group',
      participants: {
        create: participantData,
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return chatRoom;
}; 