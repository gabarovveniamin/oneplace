import { apiClient } from './client';
import { ApiResponse } from './types';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'user' | 'employer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'employer' | 'admin';
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export class AuthApiService {
  // Регистрация
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);

    // Сохраняем токен в localStorage
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // Вход
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    // Сохраняем токен в localStorage
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  // Получить профиль текущего пользователя
  async getProfile(): Promise<UserResponse> {
    const response = await apiClient.get<any>('/auth/profile');
    // Backend returns { success: true, data: { user: UserResponse } }
    // ApiClient returns the full JSON response
    // So response.data is { user: UserResponse }
    return response.data?.user || response.data;
  }

  // Обновить профиль
  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }): Promise<UserResponse> {
    const response = await apiClient.put<any>('/auth/profile', userData);

    // Получаем обновленного пользователя из ответа
    const updatedUser = response.data?.user || response.data;

    // Обновляем данные пользователя в localStorage
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return updatedUser;
  }

  // Сменить пароль  
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Выход
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Проверить, авторизован ли пользователь
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Получить текущего пользователя
  getCurrentUser(): UserResponse | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Получить токен
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authApiService = new AuthApiService();

