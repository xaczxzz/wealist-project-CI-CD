import { AuthResponse, Column, Project, Task, User, Workspace } from ".";


// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Auth Response Types
export interface LoginResponse extends ApiResponse<AuthResponse> {}
export interface RegisterResponse extends ApiResponse<User> {}
export interface VerifyTokenResponse extends ApiResponse<{ valid: boolean }> {}

// Workspace Response Types
export interface WorkspacesResponse extends ApiResponse<Workspace[]> {}
export interface WorkspaceResponse extends ApiResponse<Workspace> {}

// Project Response Types
export interface ProjectsResponse extends ApiResponse<Project[]> {}
export interface ProjectResponse extends ApiResponse<Project> {}

// Column Response Types
export interface ColumnsResponse extends ApiResponse<Column[]> {}
export interface ColumnResponse extends ApiResponse<Column> {}

// Task Response Types
export interface TasksResponse extends ApiResponse<Task[]> {}
export interface TaskResponse extends ApiResponse<Task> {}

// Comment Response Types
export interface CommentsResponse extends ApiResponse<Comment[]> {}
export interface CommentResponse extends ApiResponse<Comment> {}
