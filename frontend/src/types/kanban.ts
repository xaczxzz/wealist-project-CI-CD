// Common Types
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';

// Workspace Types
export interface WorkspaceCreate {
  name: string;
  description?: string | null;
}

export interface WorkspaceUpdate {
  name?: string | null;
  description?: string | null;
}

export interface WorkspaceResponse {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by?: number | null;
}

export interface WorkspaceListResponse {
  total: number;
  items: WorkspaceResponse[];
  limit: number;
  offset: number;
}

// Ticket Types
export interface TicketCreate {
  title: string;
  description?: string | null;
  status?: TicketStatus;
  priority?: Priority;
  project_id: number;
  assignee_id?: number | null;
}

export interface TicketUpdate {
  title?: string | null;
  description?: string | null;
  status?: TicketStatus | null;
  priority?: Priority | null;
  assignee_id?: number | null;
}

export interface TicketResponse {
  id: number;
  title: string;
  description?: string | null;
  status: TicketStatus;
  priority: Priority;
  project_id: number;
  assignee_id?: number | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by?: number | null;
}

export interface TicketListResponse {
  total: number;
  items: TicketResponse[];
  limit: number;
  offset: number;
}

// Query Parameters
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface TicketListParams extends PaginationParams {
  project_id?: number | null;
  status?: TicketStatus | null;
  priority?: Priority | null;
}