// ==========================================
// src/services/userService.ts
import { User } from "../types";
import { javaApi } from "./common";
import { ApiResponse } from "../types/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const userService = {
  // 로그인
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await javaApi.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    } as LoginRequest);

    const { accessToken, refreshToken, user } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  },

  // 회원가입
  register: async (email: string, password: string, name: string): Promise<User> => {
    const response = await javaApi.post<ApiResponse<User>>('/auth/register', {
      email,
      password,
      name,
    } as RegisterRequest);

    return response.data.data;
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // 현재 사용자 정보
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 사용자 프로필 조회
  getUserProfile: async (userId: number): Promise<User> => {
    const response = await javaApi.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data.data;
  },

  // 사용자 프로필 수정
  updateUserProfile: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await javaApi.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data.data;
  },

  // 토큰 검증
  verifyToken: async (): Promise<boolean> => {
    try {
      const response = await javaApi.get<ApiResponse<{ valid: boolean }>>('/auth/verify');
      return response.data.data.valid;
    } catch {
      return false;
    }
  },
};