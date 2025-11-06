-- ============================================
-- Board Service Baseline Schema v1.0.0 Rollback
-- Created: 2025-01-06
-- Description: Rollback script for baseline schema
-- ============================================

-- Drop User Order Tables
DROP TABLE IF EXISTS user_kanban_order_in_stage CASCADE;
DROP TABLE IF EXISTS user_kanban_order_in_role CASCADE;
DROP TABLE IF EXISTS user_stage_column_order CASCADE;
DROP TABLE IF EXISTS user_role_column_order CASCADE;

-- Drop Comments Table
DROP TABLE IF EXISTS comments CASCADE;

-- Drop Kanban Tables
DROP TABLE IF EXISTS kanban_roles CASCADE;
DROP TABLE IF EXISTS kanbans CASCADE;

-- Drop Custom Fields Tables
DROP TABLE IF EXISTS custom_importance CASCADE;
DROP TABLE IF EXISTS custom_stages CASCADE;
DROP TABLE IF EXISTS custom_roles CASCADE;

-- Drop Project Tables
DROP TABLE IF EXISTS project_join_requests CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Drop Workspace Tables
DROP TABLE IF EXISTS workspace_join_requests CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- Drop Core System Tables
DROP TABLE IF EXISTS roles CASCADE;

-- Drop Schema Versions Table
DROP TABLE IF EXISTS schema_versions CASCADE;
