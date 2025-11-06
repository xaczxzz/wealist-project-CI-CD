import {
  WorkspaceCreate,
  WorkspaceUpdate,
  WorkspaceResponse,
  WorkspaceListResponse,
  PaginationParams,
} from '../types/kanban';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_GO_API_URL || 'http://localhost:8000';
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzYxMTQwMTQyLCJpYXQiOjE3NjEwNTM3NDJ9.hLA-qgb4RfyEkSUM1Iymivp1GdxWzlRst34SNbAhznU';

class WorkspaceService {
  private getAuthHeaders(): HeadersInit {
    // const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * 새로운 Workspace 생성
   */
  async createWorkspace(data: WorkspaceCreate): Promise<WorkspaceResponse> {
    const response = await fetch(`${API_BASE_URL}/api/workspaces/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create workspace: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Workspace 목록 조회
   */
  async listWorkspaces(params?: PaginationParams): Promise<WorkspaceListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/api/workspaces/?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to list workspaces: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 특정 Workspace 조회
   */
  async getWorkspace(workspaceId: number): Promise<WorkspaceResponse> {
    const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get workspace: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Workspace 정보 수정
   */
  async updateWorkspace(workspaceId: number, data: WorkspaceUpdate): Promise<WorkspaceResponse> {
    const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update workspace: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Workspace 삭제
   */
  async deleteWorkspace(workspaceId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workspace: ${response.statusText}`);
    }
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService;
