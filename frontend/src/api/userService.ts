// src/api/userService.ts
import axios from 'axios';

// User 서비스의 스키마 정의 (OpenAPI AuthResponse 참고)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string; // UUID
  name: string;
  email: string;
  tokenType: string;
}

// 그룹 응답 스키마
export interface GroupResponse {
  groupId: string; // UUID
  name: string;
  companyName: string;
  isActive?: boolean;
  createdAt?: string;
}

// 그룹 생성 요청 스키마
export interface CreateGroupRequest {
  name: string;
  companyName: string;
}

// 사용자 정보 응답 스키마
export interface UserInfoResponse {
  userId: string;
  groupId: string;
  role: string;
  isActive?: boolean;
}

// 멤버 초대 요청 스키마 (향후 사용)
export interface InviteMemberRequest {
  email: string;
  role?: string;
}

const USER_API_URL = import.meta.env.VITE_REACT_APP_JAVA_API_URL || 'http://localhost:8080';

const userService = axios.create({
  baseURL: USER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// 그룹 관련 API
// ============================================================================

/**
 * 모든 활성 그룹을 조회합니다.
 * GET /api/groups
 * @param token 액세스 토큰
 * @returns 그룹 배열
 */
export const getGroups = async (token: string): Promise<GroupResponse[]> => {
  try {
    const response = await userService.get('/api/groups', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // MessageApiResponse 구조에서 data 필드 추출
    // 스펙: { success: boolean, message: string, data: any }
    return response.data.data || [];
  } catch (error) {
    console.error('getGroups error:', error);
    throw error;
  }
};

/**
 * 새로운 그룹을 생성합니다.
 * POST /api/groups
 * @param data 그룹 생성 정보
 * @param token 액세스 토큰
 * @returns 생성된 그룹 정보
 */
export const createGroup = async (
  data: CreateGroupRequest,
  token: string,
): Promise<GroupResponse> => {
  try {
    const response = await userService.post('/api/groups', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // MessageApiResponse에서 data 필드 추출
    return response.data.data;
  } catch (error) {
    console.error('createGroup error:', error);
    throw error;
  }
};

/**
 * 특정 그룹 정보를 조회합니다.
 * GET /api/groups/{groupId}
 * @param groupId 그룹 ID (UUID)
 * @param token 액세스 토큰
 * @returns 그룹 정보
 */
export const getGroup = async (groupId: string, token: string): Promise<GroupResponse> => {
  try {
    const response = await userService.get(`/api/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('getGroup error:', error);
    throw error;
  }
};

/**
 * 그룹을 삭제합니다.
 * DELETE /api/groups/{groupId}
 * @param groupId 그룹 ID (UUID)
 * @param token 액세스 토큰
 * @returns 응답 메시지
 */
export const deleteGroup = async (groupId: string, token: string): Promise<any> => {
  try {
    const response = await userService.delete(`/api/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('deleteGroup error:', error);
    throw error;
  }
};

// ============================================================================
// 사용자 정보 (UserInfo) 관련 API
// ============================================================================

/**
 * 사용자 정보를 그룹에 등록합니다.
 * POST /api/userinfo
 * @param userId 사용자 ID (UUID)
 * @param groupId 그룹 ID (UUID)
 * @param token 액세스 토큰
 * @param role 사용자 역할 (기본값: 'MEMBER', 'CREATOR', 'LEADER' 등)
 * @returns 생성된 사용자 정보
 */
export const createUserInfo = async (
  userId: string,
  groupId: string,
  token: string,
  role: string = 'MEMBER',
): Promise<UserInfoResponse> => {
  try {
    const data = {
      userId: userId,
      groupId: groupId,
      role: role,
    };
    const response = await userService.post('/api/userinfo', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('createUserInfo error:', error);
    throw error;
  }
};

/**
 * 사용자 정보를 업데이트합니다.
 * PUT /api/userinfo/{userId}
 * @param userId 사용자 ID (UUID)
 * @param groupId 새로운 그룹 ID
 * @param token 액세스 토큰
 * @param role 새로운 역할
 * @returns 업데이트된 사용자 정보
 */
export const updateUserInfo = async (
  userId: string,
  groupId: string,
  token: string,
  role: string,
): Promise<UserInfoResponse> => {
  try {
    const data = {
      groupId: groupId,
      role: role,
    };
    const response = await userService.put(`/api/userinfo/${userId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('updateUserInfo error:', error);
    throw error;
  }
};

/**
 * 사용자 정보를 삭제합니다.
 * DELETE /api/userinfo/{userId}
 * @param userId 사용자 ID (UUID)
 * @param token 액세스 토큰
 * @returns 응답 메시지
 */
export const deleteUserInfo = async (userId: string, token: string): Promise<any> => {
  try {
    const response = await userService.delete(`/api/userinfo/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('deleteUserInfo error:', error);
    throw error;
  }
};

/**
 * 특정 역할의 모든 활성 사용자를 조회합니다.
 * GET /api/userinfo/role/{role}
 * @param role 역할
 * @param token 액세스 토큰
 * @returns 사용자 정보 배열
 */
export const getUsersByRole = async (role: string, token: string): Promise<UserInfoResponse[]> => {
  try {
    const response = await userService.get(`/api/userinfo/role/${role}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('getUsersByRole error:', error);
    throw error;
  }
};

/**
 * 특정 그룹에 속한 모든 활성 사용자를 조회합니다.
 * GET /api/userinfo/group/{groupId}
 * @param groupId 그룹 ID (UUID)
 * @param token 액세스 토큰
 * @returns 사용자 정보 배열
 */
export const getUsersByGroup = async (
  groupId: string,
  token: string,
): Promise<UserInfoResponse[]> => {
  try {
    const response = await userService.get(`/api/userinfo/group/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('getUsersByGroup error:', error);
    throw error;
  }
};

/**
 * 모든 활성 사용자 정보를 조회합니다.
 * GET /api/userinfo
 * @param token 액세스 토큰
 * @returns 사용자 정보 배열
 */
export const getAllUsers = async (token: string): Promise<UserInfoResponse[]> => {
  try {
    const response = await userService.get('/api/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('getAllUsers error:', error);
    throw error;
  }
};

// ============================================================================
// 팀 관련 API (향후 사용)
// ============================================================================

/**
 * 팀에 멤버를 추가합니다.
 * POST /api/teams/{teamId}/members
 * @param teamId 팀 ID (UUID)
 * @param requesterId 요청자 ID (팀 리더)
 * @param userId 추가할 사용자 ID
 * @param token 액세스 토큰
 * @param role 역할 (기본값: '팀원')
 * @returns 응답 메시지
 */
export const addMemberToTeam = async (
  teamId: string,
  requesterId: string,
  userId: string,
  token: string,
  role: string = '팀원',
): Promise<any> => {
  try {
    const response = await userService.post(
      `/api/teams/${teamId}/members`,
      { userId, role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requester-Id': requesterId,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('addMemberToTeam error:', error);
    throw error;
  }
};

/**
 * 팀에서 멤버를 제거합니다.
 * DELETE /api/teams/{teamId}/members/{userId}
 * @param teamId 팀 ID (UUID)
 * @param userId 제거할 사용자 ID
 * @param requesterId 요청자 ID (팀 리더)
 * @param token 액세스 토큰
 * @returns 응답 메시지
 */
export const removeMemberFromTeam = async (
  teamId: string,
  userId: string,
  requesterId: string,
  token: string,
): Promise<any> => {
  try {
    const response = await userService.delete(`/api/teams/${teamId}/members/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Requester-Id': requesterId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('removeMemberFromTeam error:', error);
    throw error;
  }
};

/**
 * 팀의 모든 멤버를 조회합니다.
 * GET /api/teams/{teamId}/members
 * @param teamId 팀 ID (UUID)
 * @param token 액세스 토큰
 * @returns 응답 메시지 (멤버 배열 포함)
 */
export const getTeamMembers = async (teamId: string, token: string): Promise<any> => {
  try {
    const response = await userService.get(`/api/teams/${teamId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('getTeamMembers error:', error);
    throw error;
  }
};

// ============================================================================
// 인증 관련 API (향후 사용)
// ============================================================================

/**
 * 토큰을 갱신합니다.
 * POST /api/auth/refresh
 * @param refreshToken 리프레시 토큰
 * @returns 새로운 액세스 토큰 정보
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await userService.post('/api/auth/refresh', {
      refreshToken: refreshToken,
    });
    return response.data.data;
  } catch (error) {
    console.error('refreshToken error:', error);
    throw error;
  }
};

/**
 * 로그아웃합니다.
 * POST /api/auth/logout
 * @param token 액세스 토큰
 * @returns 응답 메시지
 */
export const logout = async (token: string): Promise<any> => {
  try {
    const response = await userService.post(
      '/api/auth/logout',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error('logout error:', error);
    throw error;
  }
};

/**
 * 현재 인증된 사용자 정보를 조회합니다.
 * GET /api/auth/me
 * @param token 액세스 토큰
 * @returns 사용자 정보
 */
export const getCurrentUser = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await userService.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
};
