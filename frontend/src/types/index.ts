export interface Task {
  id: number;
  title: string;
  assignee: string;
  description?: string;
  dueDate?: string;
  priority?: string;
}

export interface TaskComment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

export interface Column {
  id: number;
  title: string;
  tasks: Task[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  profileImage?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: number;
  projectId: number;
  title: string;
  order: number;
  // tasks?: Task[];
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: User;
}


export interface Board {
  id: number;
  title: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}
