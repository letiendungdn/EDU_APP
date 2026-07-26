export interface ChatUser {
  id: number;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
  role: string;
}

export interface SupportMessage {
  id: number;
  threadId: number;
  senderId: number;
  content: string;
  fileUrl?: string | null;
  fileType?: string | null;
  readAt: string | null;
  createdAt: string;
  sender: ChatUser;
}

export interface SupportThreadSummary {
  id: number;
  userId: number;
  lastMessageAt: string;
  user: ChatUser;
  lastMessage: SupportMessage | null;
  unreadCount: number;
}

export interface GroupChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  fileUrl?: string | null;
  fileType?: string | null;
  readAt: string | null;
  createdAt: string;
  sender: ChatUser;
}

export interface SessionChatMessage {
  id: number;
  sessionId: number;
  senderId: number;
  content: string;
  fileUrl?: string | null;
  fileType?: string | null;
  readAt: string | null;
  createdAt: string;
  sender: ChatUser;
}
