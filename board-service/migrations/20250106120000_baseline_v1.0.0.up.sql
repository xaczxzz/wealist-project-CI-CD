-- ============================================
-- Board Service Baseline Schema v1.0.0
-- Created: 2025-01-06
-- Description: Initial schema consolidation from golang-migrate to manual migrations
-- ============================================

-- Schema Versions Table
CREATE TABLE IF NOT EXISTS schema_versions (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Core System Tables
-- ============================================

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    level INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_level ON roles(level);

COMMENT ON TABLE roles IS '권한 테이블 (OWNER=100, ADMIN=50, MEMBER=10)';
COMMENT ON COLUMN roles.name IS 'OWNER, ADMIN, MEMBER, PROJECT_LEADER 등';
COMMENT ON COLUMN roles.level IS '권한 레벨 (숫자가 클수록 높은 권한)';

-- ============================================
-- Workspace Tables
-- ============================================

-- Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX idx_workspaces_name ON workspaces(name);
CREATE INDEX idx_workspaces_is_deleted ON workspaces(is_deleted);

COMMENT ON TABLE workspaces IS '워크스페이스 (회사/조직 단위)';
COMMENT ON COLUMN workspaces.created_by IS 'User Service의 user_id (조직장) - no FK';

-- Workspace Members Table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role_id);
CREATE INDEX idx_workspace_members_is_default ON workspace_members(user_id, is_default) WHERE is_default = TRUE;

COMMENT ON TABLE workspace_members IS '워크스페이스 멤버';
COMMENT ON COLUMN workspace_members.workspace_id IS 'References workspaces.id (no FK)';
COMMENT ON COLUMN workspace_members.user_id IS 'References users.id from User Service (no FK)';
COMMENT ON COLUMN workspace_members.role_id IS 'References roles.id (no FK)';
COMMENT ON COLUMN workspace_members.is_default IS '대표 워크스페이스 여부';
COMMENT ON COLUMN workspace_members.left_at IS '탈퇴 시간 (NULL이면 현재 멤버)';

-- Workspace Join Requests Table
CREATE TABLE IF NOT EXISTS workspace_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_join_request_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_workspace_join_requests_workspace ON workspace_join_requests(workspace_id);
CREATE INDEX idx_workspace_join_requests_user ON workspace_join_requests(user_id);
CREATE INDEX idx_workspace_join_requests_status ON workspace_join_requests(status);

COMMENT ON TABLE workspace_join_requests IS '워크스페이스 참여 신청';
COMMENT ON COLUMN workspace_join_requests.workspace_id IS 'References workspaces.id (no FK)';
COMMENT ON COLUMN workspace_join_requests.user_id IS 'References users.id from User Service (no FK)';
COMMENT ON COLUMN workspace_join_requests.status IS 'PENDING, APPROVED, REJECTED';
COMMENT ON COLUMN workspace_join_requests.processed_by IS '승인/거절 처리한 관리자 (no FK)';

-- ============================================
-- Project Tables
-- ============================================

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_is_deleted ON projects(is_deleted);

COMMENT ON COLUMN projects.workspace_id IS 'References workspaces.id (no FK for microservice isolation)';
COMMENT ON COLUMN projects.owner_id IS 'References users.id from User Service (no FK for microservice isolation)';

-- Project Members Table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

COMMENT ON COLUMN project_members.project_id IS 'References projects.id (no FK for microservice isolation)';
COMMENT ON COLUMN project_members.user_id IS 'References users.id from User Service (no FK for microservice isolation)';
COMMENT ON COLUMN project_members.role_id IS 'References roles.id (no FK for microservice isolation)';

-- Project Join Requests Table
CREATE TABLE IF NOT EXISTS project_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_join_requests_project_id ON project_join_requests(project_id);
CREATE INDEX idx_project_join_requests_user_id ON project_join_requests(user_id);
CREATE INDEX idx_project_join_requests_status ON project_join_requests(status);

COMMENT ON COLUMN project_join_requests.project_id IS 'References projects.id (no FK for microservice isolation)';
COMMENT ON COLUMN project_join_requests.user_id IS 'References users.id from User Service (no FK for microservice isolation)';

-- ============================================
-- Custom Fields Tables
-- ============================================

-- Custom Roles Table
CREATE TABLE IF NOT EXISTS custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_role_name UNIQUE(project_id, name)
);

CREATE INDEX idx_custom_roles_project_id ON custom_roles(project_id);
CREATE INDEX idx_custom_roles_is_system_default ON custom_roles(is_system_default);
CREATE INDEX idx_custom_roles_is_deleted ON custom_roles(is_deleted);

COMMENT ON TABLE custom_roles IS 'Project-specific custom roles for kanbans';
COMMENT ON COLUMN custom_roles.project_id IS 'References projects.id (no FK for sharding compatibility)';
COMMENT ON COLUMN custom_roles.is_system_default IS 'System default values cannot be deleted';
COMMENT ON COLUMN custom_roles.display_order IS 'Display order for UI sorting';

-- Custom Stages Table
CREATE TABLE IF NOT EXISTS custom_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_stage_name UNIQUE(project_id, name)
);

CREATE INDEX idx_custom_stages_project_id ON custom_stages(project_id);
CREATE INDEX idx_custom_stages_is_system_default ON custom_stages(is_system_default);
CREATE INDEX idx_custom_stages_is_deleted ON custom_stages(is_deleted);

COMMENT ON TABLE custom_stages IS 'Project-specific custom stages for kanbans';
COMMENT ON COLUMN custom_stages.project_id IS 'References projects.id (no FK for sharding compatibility)';
COMMENT ON COLUMN custom_stages.is_system_default IS 'System default values cannot be deleted';
COMMENT ON COLUMN custom_stages.display_order IS 'Display order for UI sorting';

-- Custom Importance Table
CREATE TABLE IF NOT EXISTS custom_importance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_importance_name UNIQUE(project_id, name)
);

CREATE INDEX idx_custom_importance_project_id ON custom_importance(project_id);
CREATE INDEX idx_custom_importance_is_system_default ON custom_importance(is_system_default);
CREATE INDEX idx_custom_importance_is_deleted ON custom_importance(is_deleted);

COMMENT ON TABLE custom_importance IS 'Project-specific custom importance levels for kanbans';
COMMENT ON COLUMN custom_importance.project_id IS 'References projects.id (no FK for sharding compatibility)';
COMMENT ON COLUMN custom_importance.is_system_default IS 'System default values cannot be deleted';
COMMENT ON COLUMN custom_importance.display_order IS 'Display order for UI sorting';

-- ============================================
-- Kanban Tables
-- ============================================

-- Kanbans Table
CREATE TABLE IF NOT EXISTS kanbans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    stage_id UUID NOT NULL,
    importance_id UUID,
    assignee_id UUID,
    author_id UUID NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_kanbans_project_id ON kanbans(project_id);
CREATE INDEX idx_kanbans_stage_id ON kanbans(stage_id);
CREATE INDEX idx_kanbans_importance_id ON kanbans(importance_id);
CREATE INDEX idx_kanbans_assignee_id ON kanbans(assignee_id);
CREATE INDEX idx_kanbans_author_id ON kanbans(author_id);
CREATE INDEX idx_kanbans_deleted_at ON kanbans(deleted_at);
CREATE INDEX idx_kanbans_due_date ON kanbans(due_date);

COMMENT ON TABLE kanbans IS 'Kanban cards (tasks/issues) for projects';
COMMENT ON COLUMN kanbans.project_id IS 'References projects.id (no FK for sharding compatibility)';
COMMENT ON COLUMN kanbans.stage_id IS 'References custom_stages.id (no FK, required field)';
COMMENT ON COLUMN kanbans.importance_id IS 'References custom_importance.id (no FK, optional)';
COMMENT ON COLUMN kanbans.assignee_id IS 'References users.id in User Service (no FK, optional)';
COMMENT ON COLUMN kanbans.author_id IS 'References users.id in User Service (no FK, required)';
COMMENT ON COLUMN kanbans.deleted_at IS 'Soft delete timestamp';

-- Kanban Roles Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS kanban_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kanban_id UUID NOT NULL,
    custom_role_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_kanban_custom_role UNIQUE(kanban_id, custom_role_id)
);

CREATE INDEX idx_kanban_roles_kanban_id ON kanban_roles(kanban_id);
CREATE INDEX idx_kanban_roles_custom_role_id ON kanban_roles(custom_role_id);

COMMENT ON TABLE kanban_roles IS 'Many-to-many relationship between kanbans and custom roles';
COMMENT ON COLUMN kanban_roles.kanban_id IS 'References kanbans.id (no FK for sharding compatibility)';
COMMENT ON COLUMN kanban_roles.custom_role_id IS 'References custom_roles.id (no FK for sharding compatibility)';

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    kanban_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_comments_kanban_id ON comments(kanban_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

COMMENT ON TABLE comments IS 'Comments on Kanban cards';
COMMENT ON COLUMN comments.kanban_id IS 'References kanbans.id (no FK for sharding compatibility)';
COMMENT ON COLUMN comments.user_id IS 'References users.id from User Service (no FK)';

-- ============================================
-- User Order Tables (Drag and Drop)
-- ============================================

-- User Role Column Order
CREATE TABLE IF NOT EXISTS user_role_column_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_role_id UUID NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, project_id, custom_role_id)
);

CREATE INDEX idx_user_role_order ON user_role_column_order(user_id, project_id);

COMMENT ON TABLE user_role_column_order IS 'Stores user-specific display order for role columns in project board view';
COMMENT ON COLUMN user_role_column_order.user_id IS 'References users.id (no FK for microservice isolation)';
COMMENT ON COLUMN user_role_column_order.project_id IS 'References projects.id (no FK for sharding)';
COMMENT ON COLUMN user_role_column_order.custom_role_id IS 'References custom_roles.id (no FK for sharding)';

-- User Stage Column Order
CREATE TABLE IF NOT EXISTS user_stage_column_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_stage_id UUID NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, project_id, custom_stage_id)
);

CREATE INDEX idx_user_stage_order ON user_stage_column_order(user_id, project_id);

COMMENT ON TABLE user_stage_column_order IS 'Stores user-specific display order for stage columns in project board view';
COMMENT ON COLUMN user_stage_column_order.user_id IS 'References users.id (no FK for microservice isolation)';
COMMENT ON COLUMN user_stage_column_order.project_id IS 'References projects.id (no FK for sharding)';
COMMENT ON COLUMN user_stage_column_order.custom_stage_id IS 'References custom_stages.id (no FK for sharding)';

-- User Kanban Order in Role
CREATE TABLE IF NOT EXISTS user_kanban_order_in_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_role_id UUID NOT NULL,
    kanban_id UUID NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, project_id, custom_role_id, kanban_id)
);

CREATE INDEX idx_user_kanban_role_order ON user_kanban_order_in_role(user_id, project_id, custom_role_id);

COMMENT ON TABLE user_kanban_order_in_role IS 'Stores user-specific display order for kanbans within each role column';
COMMENT ON COLUMN user_kanban_order_in_role.user_id IS 'References users.id (no FK for microservice isolation)';
COMMENT ON COLUMN user_kanban_order_in_role.project_id IS 'References projects.id (no FK for sharding)';
COMMENT ON COLUMN user_kanban_order_in_role.custom_role_id IS 'References custom_roles.id (no FK for sharding)';
COMMENT ON COLUMN user_kanban_order_in_role.kanban_id IS 'References kanbans.id (no FK for sharding)';

-- User Kanban Order in Stage
CREATE TABLE IF NOT EXISTS user_kanban_order_in_stage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    custom_stage_id UUID NOT NULL,
    kanban_id UUID NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, project_id, custom_stage_id, kanban_id)
);

CREATE INDEX idx_user_kanban_stage_order ON user_kanban_order_in_stage(user_id, project_id, custom_stage_id);

COMMENT ON TABLE user_kanban_order_in_stage IS 'Stores user-specific display order for kanbans within each stage column';
COMMENT ON COLUMN user_kanban_order_in_stage.user_id IS 'References users.id (no FK for microservice isolation)';
COMMENT ON COLUMN user_kanban_order_in_stage.project_id IS 'References projects.id (no FK for sharding)';
COMMENT ON COLUMN user_kanban_order_in_stage.custom_stage_id IS 'References custom_stages.id (no FK for sharding)';
COMMENT ON COLUMN user_kanban_order_in_stage.kanban_id IS 'References kanbans.id (no FK for sharding)';

-- ============================================
-- Default Data
-- ============================================

-- Insert Default Roles
INSERT INTO roles (name, level, description) VALUES
('OWNER', 100, '조직장 (최고 권한)'),
('ADMIN', 50, '운영자 (관리 권한)'),
('MEMBER', 10, '일반 멤버')
ON CONFLICT (name) DO NOTHING;

-- Record Schema Version
INSERT INTO schema_versions (version, description)
VALUES ('20250106120000', 'Baseline v1.0.0 - Initial schema consolidation');
