-- ============================================
-- Board Service Baseline Schema v1.0.0
-- Created: 2025-01-06
-- Description: Complete initial board schema
-- ============================================

-- Schema Versions Table
CREATE TABLE IF NOT EXISTS schema_versions (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    level INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_roles_name UNIQUE(name)
);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_level ON roles(level);

-- Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at DESC);

-- Workspace Members Table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    is_default BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_workspace_members_workspace_id_user_id UNIQUE(workspace_id, user_id)
);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role_id ON workspace_members(role_id);

-- Workspace Join Requests Table
CREATE TABLE IF NOT EXISTS workspace_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_workspace_join_requests_workspace_id_user_id UNIQUE(workspace_id, user_id)
);
CREATE INDEX idx_workspace_join_requests_workspace_id ON workspace_join_requests(workspace_id);
CREATE INDEX idx_workspace_join_requests_user_id ON workspace_join_requests(user_id);
CREATE INDEX idx_workspace_join_requests_status ON workspace_join_requests(status);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Project Members Table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_project_members_project_id_user_id UNIQUE(project_id, user_id)
);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Project Join Requests Table
CREATE TABLE IF NOT EXISTS project_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_project_join_requests_project_id_user_id UNIQUE(project_id, user_id)
);
CREATE INDEX idx_project_join_requests_project_id ON project_join_requests(project_id);
CREATE INDEX idx_project_join_requests_user_id ON project_join_requests(user_id);

-- Custom Roles Table
CREATE TABLE IF NOT EXISTS custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    is_system_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_custom_roles_project_id_name UNIQUE(project_id, name)
);
CREATE INDEX idx_custom_roles_project_id ON custom_roles(project_id);

-- Custom Stages Table
CREATE TABLE IF NOT EXISTS custom_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    is_system_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_custom_stages_project_id_name UNIQUE(project_id, name)
);
CREATE INDEX idx_custom_stages_project_id ON custom_stages(project_id);

-- Custom Importance Table
CREATE TABLE IF NOT EXISTS custom_importance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    is_system_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_custom_importance_project_id_name UNIQUE(project_id, name)
);
CREATE INDEX idx_custom_importance_project_id ON custom_importance(project_id);

-- Boards Table
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    custom_stage_id UUID NOT NULL,
    custom_importance_id UUID,
    assignee_id UUID,
    due_date TIMESTAMP,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_boards_project_id ON boards(project_id);
CREATE INDEX idx_boards_custom_stage_id ON boards(custom_stage_id);
CREATE INDEX idx_boards_assignee_id ON boards(assignee_id);
CREATE INDEX idx_boards_created_by ON boards(created_by);

-- Board Roles Table
CREATE TABLE IF NOT EXISTS board_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL,
    custom_role_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_board_roles_board_id_custom_role_id UNIQUE(board_id, custom_role_id)
);
CREATE INDEX idx_board_roles_board_id ON board_roles(board_id);
CREATE INDEX idx_board_roles_custom_role_id ON board_roles(custom_role_id);

-- User Order Tables
CREATE TABLE IF NOT EXISTS user_role_column_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_role_ids TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_user_role_column_order_user_id_project_id UNIQUE(user_id, project_id)
);
CREATE INDEX idx_user_role_column_order_user_project ON user_role_column_order(user_id, project_id);

CREATE TABLE IF NOT EXISTS user_stage_column_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_stage_ids TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_user_stage_column_order_user_id_project_id UNIQUE(user_id, project_id)
);
CREATE INDEX idx_user_stage_column_order_user_project ON user_stage_column_order(user_id, project_id);

CREATE TABLE IF NOT EXISTS user_board_order_in_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_role_id UUID NOT NULL,
    board_ids TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_user_board_order_in_role_user_id_project_id_custom_role_id UNIQUE(user_id, project_id, custom_role_id)
);
CREATE INDEX idx_user_board_order_in_role_user_project ON user_board_order_in_role(user_id, project_id);

CREATE TABLE IF NOT EXISTS user_board_order_in_stage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_stage_id UUID NOT NULL,
    board_ids TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uni_user_board_order_in_stage_user_id_project_id_custom_stage_id UNIQUE(user_id, project_id, custom_stage_id)
);
CREATE INDEX idx_user_board_order_in_stage_user_project ON user_board_order_in_stage(user_id, project_id);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_comments_board_id ON comments(board_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Default Roles
INSERT INTO roles (name, level, description) VALUES
    ('OWNER', 100, 'Workspace owner with full permissions'),
    ('ADMIN', 50, 'Administrator with management permissions'),
    ('MEMBER', 10, 'Regular member with basic permissions')
ON CONFLICT (name) DO NOTHING;

-- Schema Version
INSERT INTO schema_versions (version, description)
VALUES ('20250106120000', 'Baseline v1.0.0 - Complete initial board schema');
