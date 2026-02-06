import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T = any> {
  data?: T;
  statusCode?: number;
  message?: string;
  errors?: string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.loadTokens();
    this.setupInterceptors();
  }

  private loadTokens() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.error('API Server is not running. Please start the backend services.');
          throw new Error('API Server is not available. Please ensure the backend is running on port 3000.');
        }

        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true;
          try {
            const newTokens = await this.refreshAccessToken();
            this.setTokens(newTokens);
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    const response = await this.client.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken: this.refreshToken,
    });
    return response.data.data || (response.data as any);
  }

  async register(email: string, password: string, username?: string) {
    const response = await this.client.post<ApiResponse>('/auth/register', {
      email,
      password,
      username,
    });
    const tokens = response.data as any;
    if (tokens.accessToken) {
      this.setTokens(tokens);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse>('/auth/login', {
      email,
      password,
    });
    const tokens = response.data as any;
    if (tokens.accessToken) {
      this.setTokens(tokens);
    }
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get<ApiResponse>('/auth/me');
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse>('/users/me');
    return response.data;
  }

  async updateProfile(data: { username?: string; avatar?: string }) {
    const response = await this.client.put<ApiResponse>('/users/me', data);
    return response.data;
  }

  async searchUsers(query: string) {
    const response = await this.client.get<ApiResponse>(`/users/search?q=${query}`);
    return response.data;
  }

  async getRooms() {
    const response = await this.client.get<ApiResponse>('/rooms');
    return response.data;
  }

  async createRoom(data: { name: string; description?: string; type: string }) {
    const response = await this.client.post<ApiResponse>('/rooms', data);
    return response.data;
  }

  async getRoomDetails(roomId: string) {
    const response = await this.client.get<ApiResponse>(`/rooms/${roomId}`);
    return response.data;
  }

  async joinRoom(roomId: string) {
    const response = await this.client.post<ApiResponse>(`/rooms/${roomId}/join`);
    return response.data;
  }

  async getRoomMembers(roomId: string) {
    const response = await this.client.get<ApiResponse>(`/rooms/${roomId}/members`);
    return response.data;
  }

  async leaveRoom(roomId: string) {
    const response = await this.client.delete<ApiResponse>(`/rooms/${roomId}/leave`);
    return response.data;
  }

  async getMessages(roomId: string, page = 1, limit = 50) {
    const response = await this.client.get<ApiResponse>(
      `/messages/${roomId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async sendMessage(roomId: string, content: string, type = 'TEXT') {
    const response = await this.client.post<ApiResponse>('/messages', {
      roomId,
      content,
      type,
    });
    return response.data;
  }

  async editMessage(messageId: string, content: string) {
    const response = await this.client.put<ApiResponse>(`/messages/${messageId}`, {
      content,
    });
    return response.data;
  }

  async deleteMessage(messageId: string) {
    const response = await this.client.delete<ApiResponse>(`/messages/${messageId}`);
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const apiClient = new ApiClient();
