import { create } from 'zustand';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  type: string;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  roomId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initAuth: () => void;
}

interface ChatStore {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  createRoom: (data: { name: string; description?: string; type: string }) => Promise<void>;
  selectRoom: (roomId: string) => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: () => {
    if (typeof window !== 'undefined' && apiClient.isAuthenticated()) {
      set({ isAuthenticated: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(email, password);
      const user = (response as any).user;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, username?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.register(email, password, username);
      const user = (response as any).user;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error: any) {
      set({ error: error.message || 'Logout failed' });
    }
  },

  clearError: () => set({ error: null }),
}));

export const useChatStore = create<ChatStore>((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  isLoadingRooms: false,
  isLoadingMessages: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoadingRooms: true, error: null });
    try {
      const response = await apiClient.getRooms();
      const rooms = (response as any).data || [];
      set({ rooms, isLoadingRooms: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch rooms', isLoadingRooms: false });
    }
  },

  createRoom: async (data) => {
    set({ error: null });
    try {
      const response = await apiClient.createRoom(data);
      const newRoom = (response as any).data || response;
      set((state) => ({ rooms: [...state.rooms, newRoom] }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create room' });
      throw error;
    }
  },

  selectRoom: async (roomId: string) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (room) {
      set({ currentRoom: room });
      await get().fetchMessages(roomId);
    }
  },

  fetchMessages: async (roomId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await apiClient.getMessages(roomId);
      const messages = (response as any).data || [];
      set({ messages, isLoadingMessages: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch messages', isLoadingMessages: false });
    }
  },

  sendMessage: async (content: string) => {
    const currentRoom = get().currentRoom;
    if (!currentRoom) return;

    try {
      const response = await apiClient.sendMessage(currentRoom.id, content);
      const newMessage = (response as any).data || response;
      set((state) => ({ messages: [...state.messages, newMessage] }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
