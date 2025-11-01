// src/api/kanbanService.ts

import axios from 'axios';

// 환경 변수에서 Kanban 서비스 URL을 가져옵니다.
const KANBAN_API_URL = process.env.REACT_APP_KANBAN_API_URL || 'http://localhost:8000';

const kanbanService = axios.create({
  baseURL: KANBAN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 💡 Kanban API 스키마 정의 (OpenAPI Workspaces 참고)
export interface WorkspaceCreate {
  name: string;
  description?: string;
}

export interface WorkspaceResponse {
  id: string; // Workspace ID (UUID)
  name: string;
  created_by: string; // userId
  // ... 기타 필드
}

// 💡 API 함수 정의

// 새로운 워크스페이스를 생성합니다. (POST /api/workspaces/)
export const createWorkspace = async (data: WorkspaceCreate, token: string): Promise<WorkspaceResponse> => {
  const response = await kanbanService.post('/api/workspaces/', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  // FastAPI는 생성 시 201 응답과 함께 생성된 객체를 반환합니다.
  return response.data;
};