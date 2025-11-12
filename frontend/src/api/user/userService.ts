import {
  CreateWorkspaceRequest,
  UpdateProfileRequest,
  UpdateWorkspaceSettingsRequest,
  UserProfileResponse,
  WorkspaceResponse,
  WorkspaceMemberResponse, // New DTO from OpenAPI spec
  WorkspaceSettingsResponse, // New DTO from OpenAPI spec
  JoinRequestResponse, // New DTO from OpenAPI spec
  InviteUserRequest,
} from '../../types/user'; // DTO 인터페이스는 types/user 파일에서 가져온다고 가정
import { userRepoClient } from '../apiConfig';
import { AxiosResponse } from 'axios';

// ========================================
// Mock Data (실제 API 구현 시 이 블록은 삭제됩니다.)
// ========================================

const USE_MOCK_DATA = false;

// Mock 데이터는 실제 사용되지 않지만, Mock 모드를 활성화할 경우를 대비하여 유지
const MOCK_WORKSPACES: WorkspaceResponse[] = [
  {
    workspaceId: 'workspace-1',
    workspaceName: '오렌지클라우드',
    workspaceDescription: '메인 워크스페이스',
    ownerId: 'user-123',
    ownerName: '김개발',
    ownerEmail: 'dev.kim@example.com',
    isPublic: true,
    needApproved: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    workspaceId: 'workspace-2',
    workspaceName: '데이터랩',
    workspaceDescription: '데이터 분석 팀',
    ownerId: 'user-123',
    ownerName: '김개발',
    ownerEmail: 'dev.kim@example.com',
    isPublic: false,
    needApproved: false,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

let MOCK_DEFAULT_PROFILE: UserProfileResponse = {
  profileId: 'profile-default-001',
  userId: 'user-123',
  workspaceId: null,
  nickName: '김개발',
  email: 'dev.kim@example.com',
  profileImageUrl: null,
};

const MOCK_ALL_PROFILES: UserProfileResponse[] = [
  MOCK_DEFAULT_PROFILE,
  {
    profileId: 'profile-ws-001',
    userId: 'user-123',
    workspaceId: 'workspace-1',
    nickName: '김개발 (오렌지클라우드)',
    email: 'dev.kim@orangecloud.com',
    profileImageUrl: null,
  },
];

let MOCK_WORKSPACE_SETTINGS: Record<string, WorkspaceSettingsResponse> = {
  'workspace-1': {
    workspaceId: 'workspace-1',
    workspaceName: '오렌지클라우드',
    workspaceDescription: '메인 워크스페이스',
    isPublic: true,
    requiresApproval: true,
    onlyOwnerCanInvite: false,
  },
};

let MOCK_PENDING_MEMBERS: Record<string, JoinRequestResponse[]> = {};

// ========================================
// Workspace API Functions
// ========================================

/**
 * 워크스페이스 목록 조회 (현재 사용자가 속한 모든 워크스페이스)
 * [API] GET /api/workspaces/all
 */
export const getMyWorkspaces = async (): Promise<WorkspaceResponse[]> => {
  const response: AxiosResponse<WorkspaceResponse[]> = await userRepoClient.get(
    '/api/workspaces/all',
  );
  return response.data;
};

/**
 * 워크스페이스 생성
 * [API] POST /api/workspaces
 * [Response] { data: WorkspaceResponse }
 */
export const createWorkspace = async (data: CreateWorkspaceRequest): Promise<WorkspaceResponse> => {
  try {
    // 💡 [수정]: 응답 구조를 { data: WorkspaceResponse }로 가정하고, response.data.data에서 추출합니다.
    const response: AxiosResponse<WorkspaceResponse> = await userRepoClient.post(
      '/api/workspaces',
      data,
    );
    return response.data;
  } catch (error) {
    console.error('createWorkspace error:', error);
    throw error;
  }
};

/**
 * 워크스페이스 설정 조회
 * [API] GET /api/workspaces/{workspaceId}/settings
 */
export const getWorkspaceSettings = async (
  workspaceId: string,
): Promise<WorkspaceSettingsResponse> => {
  if (USE_MOCK_DATA) {
    const settings = MOCK_WORKSPACE_SETTINGS[workspaceId] || MOCK_WORKSPACE_SETTINGS['workspace-1'];
    return new Promise((resolve) => {
      setTimeout(() => resolve(settings), 300);
    });
  }

  const response: AxiosResponse<{ data: WorkspaceSettingsResponse }> = await userRepoClient.get(
    `/api/workspaces/${workspaceId}/settings`,
  );
  return response.data.data;
};

/**
 * 워크스페이스 설정 수정
 * [API] PUT /api/workspaces/{workspaceId}/settings
 */
export const updateWorkspaceSettings = async (
  workspaceId: string,
  data: UpdateWorkspaceSettingsRequest,
): Promise<WorkspaceSettingsResponse> => {
  if (USE_MOCK_DATA) {
    const current = MOCK_WORKSPACE_SETTINGS[workspaceId] || MOCK_WORKSPACE_SETTINGS['workspace-1'];
    const updated = { ...current, ...data, workspaceId };
    MOCK_WORKSPACE_SETTINGS[workspaceId] = updated;
    return new Promise((resolve) => {
      setTimeout(() => resolve(updated), 300);
    });
  }

  const response: AxiosResponse<{ data: WorkspaceSettingsResponse }> = await userRepoClient.put(
    `/api/workspaces/${workspaceId}/settings`,
    data,
  );
  return response.data.data;
};

/**
 * 워크스페이스 회원 목록 조회
 * [API] GET /api/workspaces/{workspaceId}/members
 */
export const getWorkspaceMembers = async (
  workspaceId: string,
): Promise<WorkspaceMemberResponse[]> => {
  const response: AxiosResponse<{ data: WorkspaceMemberResponse[] }> = await userRepoClient.get(
    `/api/workspaces/${workspaceId}/members`,
  );
  return response.data.data;
};

/**
 * 승인 대기 회원 목록 조회
 * [API] GET /api/workspaces/{workspaceId}/pendingMembers
 */
export const getPendingMembers = async (workspaceId: string): Promise<JoinRequestResponse[]> => {
  if (USE_MOCK_DATA) {
    const pending = MOCK_PENDING_MEMBERS[workspaceId] || [];
    return new Promise((resolve) => {
      setTimeout(() => resolve(pending), 300);
    });
  }

  const response: AxiosResponse<{ data: JoinRequestResponse[] }> = await userRepoClient.get(
    `/api/workspaces/${workspaceId}/pendingMembers`,
  );
  return response.data.data;
};

/**
 * 멤버 역할 변경
 * [API] PUT /api/workspaces/{workspaceId}/members/{memberId}/role
 */
export const updateMemberRole = async (
  workspaceId: string,
  memberId: string,
  roleName: 'ADMIN' | 'MEMBER',
): Promise<WorkspaceMemberResponse> => {
  const data = { roleName };

  const response: AxiosResponse<{ data: WorkspaceMemberResponse }> = await userRepoClient.put(
    `/api/workspaces/${workspaceId}/members/${memberId}/role`,
    data,
  );
  return response.data.data;
};

/**
 * 멤버 제거
 * [API] DELETE /api/workspaces/{workspaceId}/members/{memberId}
 */
export const removeMember = async (workspaceId: string, memberId: string): Promise<void> => {
  await userRepoClient.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
};

/**
 * 가입 신청 승인
 * [API] POST /api/workspaces/{workspaceId}/members/{userId}/approve
 */
export const approveMember = async (workspaceId: string, userId: string): Promise<void> => {
  await userRepoClient.post(`/api/workspaces/${workspaceId}/members/${userId}/approve`, {});
};

/**
 * 가입 신청 거절
 * [API] POST /api/workspaces/{workspaceId}/members/{userId}/reject
 */
export const rejectMember = async (workspaceId: string, userId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    const pending = MOCK_PENDING_MEMBERS[workspaceId] || [];
    // MOCK_PENDING_MEMBERS[workspaceId] = pending.filter((m) => m.userId !== userId); // Mock 로직 제거
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 300);
    });
  }
  await userRepoClient.post(`/api/workspaces/${workspaceId}/members/${userId}/reject`, {});
};

/**
 * 워크스페이스에 사용자 초대 (userId 기준)
 * [API] POST /api/workspaces/{workspaceId}/members/invite
 */
export const inviteUser = async (
  workspaceId: string,
  userId: string,
): Promise<WorkspaceMemberResponse> => {
  const data: InviteUserRequest = { userId };

  const response: AxiosResponse<{ data: WorkspaceMemberResponse }> = await userRepoClient.post(
    `/api/workspaces/${workspaceId}/members/invite`,
    data,
  );
  return response.data.data;
};

// ========================================
// UserProfile API Functions (수정됨)
// ========================================

/**
 * 내 프로필 조회 (기본 프로필)
 * [API] GET /api/profiles/me
 */
export const getMyProfile = async (): Promise<UserProfileResponse> => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_DEFAULT_PROFILE), 300);
    });
  }

  const response: AxiosResponse<{ data: UserProfileResponse }> = await userRepoClient.get(
    '/api/profiles/me',
  );
  return response.data.data;
};

/**
 * 내 모든 프로필 조회 (기본 프로필 + 워크스페이스별 프로필)
 * [API] GET /api/profiles/all/me 💡 신규 엔드포인트
 */
export const getAllMyProfiles = async (): Promise<UserProfileResponse[]> => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ALL_PROFILES), 300);
    });
  }

  const response: AxiosResponse<{ data: UserProfileResponse[] }> = await userRepoClient.get(
    '/api/profiles/all/me',
  );
  return response.data.data;
};

/**
 * 내 프로필 정보 통합 업데이트 (기본 프로필)
 * [API] PUT /api/profiles/me
 */
export const updateMyProfile = async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
  if (USE_MOCK_DATA) {
    MOCK_DEFAULT_PROFILE = { ...MOCK_DEFAULT_PROFILE, ...data };
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_DEFAULT_PROFILE), 300);
    });
  }

  const response: AxiosResponse<{ data: UserProfileResponse }> = await userRepoClient.put(
    '/api/profiles/me',
    data,
  );
  return response.data.data;
};

// ========================================
// [제거/대체됨] 워크스페이스 프로필 관리 함수
// ========================================

/**
 * [제거됨] 워크스페이스 프로필 조회 (GET /api/profiles/workspace/{workspaceId})
 * @deprecated 프론트엔드에서 `getAllMyProfiles()`를 호출하여 필터링해야 합니다.
 */
export const getWorkspaceProfile = async (
  workspaceId: string,
): Promise<UserProfileResponse | null> => {
  // 💡 실제 서비스에서는 이 함수를 호출하지 않거나,
  //    getAllMyProfiles()를 호출하여 로컬에서 필터링해야 합니다.
  return null;
};

/**
 * [제거됨] 워크스페이스 프로필 생성/수정 (PUT /api/profiles/workspace/{workspaceId})
 * @deprecated 프론트엔드는 이 엔드포인트에 직접 접근할 수 없으며, 백엔드에서 별도의 엔드포인트를 구현하거나
 * 다른 방식으로 워크스페이스 프로필을 업데이트해야 합니다.
 */
export const updateWorkspaceProfile = async (
  workspaceId: string,
  data: UpdateProfileRequest,
): Promise<UserProfileResponse> => {
  // 💡 실제 서비스에서는 이 함수를 사용하지 않아야 합니다.
  throw new Error('워크스페이스별 프로필 업데이트 엔드포인트가 제거되었습니다. (백엔드 구현 필요)');
};

// ========================================
// New API Functions (기타)
// ========================================

/**
 * 워크스페이스 가입 신청
 * [API] POST /api/workspaces/join-requests
 */
export const createJoinRequest = async (workspaceId: string): Promise<JoinRequestResponse> => {
  const data = { workspaceId };
  const response: AxiosResponse<{ data: JoinRequestResponse }> = await userRepoClient.post(
    '/api/workspaces/join-requests',
    data,
  );
  return response.data.data;
};

/**
 * 기본 워크스페이스 설정
 * [API] POST /api/workspaces/default
 */
export const setDefaultWorkspace = async (workspaceId: string): Promise<void> => {
  const data = { workspaceId };
  await userRepoClient.post('/api/workspaces/default', data);
};
