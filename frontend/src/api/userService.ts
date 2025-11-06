// src/api/userService.ts
import axios from 'axios';
// 이 부분은 User 서비스에서 JWT 발급 후 반환하는 스키마를 React에서 사용하기 위해 정의합니다.
// 실제 API 호출 코드는 Google OAuth2 연동 시 백엔드 리디렉션으로 대체됩니다.

// User 서비스의 스키마 정의 (OpenAPI AuthResponse 참고)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string; // UUID
  name: string;
  email: string;
  tokenType: string;
}

const USER_API_URL = import.meta.env.VITE_REACT_APP_JAVA_API_URL || 'http://localhost:8081';

const userService = axios.create({
  baseURL: USER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 💡 새로운 스키마 정의 (OpenAPI Components/Schemas 참고)
export interface GroupResponse {
  // 실제 응답 스키마는 MessageApiResponse 내부에 있을 수 있지만,
  // 여기서는 Group의 핵심 정보를 담는다고 가정합니다.
  groupId: string; // UUID
  name: string;
  companyName: string;
  // ... 기타 필드 (isActive, created_at 등)
}

export interface CreateGroupRequest {
  name: string;
  companyName: string;
}

export interface UserInfoResponse {
  userId: string;
  groupId: string;
  role: string;
  // ...
}

// 💡 그룹 API 함수 정의
// 사용자가 속한 모든 활성 그룹을 조회합니다. (GET /api/groups)
export const getGroups = async (token: string): Promise<GroupResponse[]> => {
  // User Service의 /api/groups는 MessageApiResponse를 반환할 수 있으므로, data.data를 반환하도록 처리 필요
  const response = await userService.get('/api/groups', {
    headers: { Authorization: `Bearer ${token}` },
  });
  // NOTE: User Service의 GET /api/groups 스펙에 따라 MessageApiResponse의 'data' 필드에서
  // Group 배열을 추출해야 할 수 있습니다. (현재 스펙은 MessageApiResponse<any>를 반환함)
  return response.data.data || [];
};

// 새로운 그룹을 생성합니다. (POST /api/groups)
export const createGroup = async (
  data: CreateGroupRequest,
  token: string,
): Promise<GroupResponse> => {
  const response = await userService.post('/api/groups', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // NOTE: 성공 시 그룹 객체를 반환한다고 가정합니다. (스펙은 MessageApiResponse)
  return response.data.data;
};

// 사용자 정보를 그룹에 등록/업데이트합니다. (UserInfo 생성: POST /api/userinfo)
export const createUserInfo = async (
  userId: string,
  groupId: string,
  token: string,
  role: string = 'MEMBER',
): Promise<UserInfoResponse> => {
  const data = {
    userId: userId,
    groupId: groupId,
    role: role,
  };
  const response = await userService.post('/api/userinfo', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
