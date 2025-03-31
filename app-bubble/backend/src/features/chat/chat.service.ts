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
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
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
  // First verify that the user is a participant in this room
  const isParticipant = await prisma.participant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
  });

  if (!isParticipant) {
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
  // Verify user has access to this room
  const isParticipant = await prisma.participant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
  });

  if (!isParticipant) {
    throw new Error('User is not a participant in this chat room');
  }

  // Update last read timestamp
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

  // Build the query
  const query: any = {
    where: {
      chatRoomId: roomId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  };

  // Add cursor for pagination if provided
  if (cursor) {
    query.cursor = {
      id: cursor,
    };
    query.skip = 1; // Skip the cursor
  }

  const messages = await prisma.message.findMany(query);

  // Get the next cursor
  const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

  return {
    messages: messages.reverse(), // Return in chronological order
    nextCursor,
  };
};

/**
 * Create a new message in a chat room
 */
export const createMessage = async (roomId: string, userId: string, content: string) => {
  // Verify user has access to this room
  const isParticipant = await prisma.participant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: roomId,
        userId,
      },
    },
  });

  if (!isParticipant) {
    throw new Error('User is not a participant in this chat room');
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content,
      chatRoom: {
        connect: {
          id: roomId,
        },
      },
      sender: {
        connect: {
          id: userId,
        },
      },
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
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
            in: [userId, participantId],
          },
        },
      },
      AND: [
        {
          participants: {
            some: {
              userId,
            },
          },
        },
        {
          participants: {
            some: {
              userId: participantId,
            },
          },
        },
      ],
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (existingRoom) {
    return existingRoom;
  }

  // Verify the participant user exists
  const participantUser = await prisma.user.findUnique({
    where: {
      id: participantId,
    },
  });

  if (!participantUser) {
    throw new Error('Participant user not found');
  }

  // Create a new direct chat room
  const chatRoom = await prisma.chatRoom.create({
    data: {
      type: 'direct',
      participants: {
        create: [
          {
            user: {
              connect: {
                id: userId,
              },
            },
          },
          {
            user: {
              connect: {
                id: participantId,
              },
            },
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

  // Make sure all participants exist
  const participantUsers = await prisma.user.findMany({
    where: {
      id: {
        in: [...participantIds, userId],
      },
    },
  });

  if (participantUsers.length !== participantIds.length + 1) {
    throw new Error('One or more participant users not found');
  }

  // Create a new group chat room
  const chatRoom = await prisma.chatRoom.create({
    data: {
      name,
      type: 'group',
      participants: {
        create: [
          {
            user: {
              connect: {
                id: userId,
              },
            },
          },
          ...participantIds.map(id => ({
            user: {
              connect: {
                id,
              },
            },
          })),
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
            },
          },
        },
      },
    },
  });

  return chatRoom;
}; 