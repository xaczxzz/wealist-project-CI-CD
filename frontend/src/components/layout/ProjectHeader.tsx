// src/components/layout/ProjectHeader.tsx

import React, { useRef } from 'react';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ProjectResponse } from '../../types/board';
import { WorkspaceMemberResponse } from '../../types/user';
import { AvatarStack } from '../common/AvartarStack';

interface ProjectHeaderProps {
  // Data
  projects: ProjectResponse[];
  selectedProject: ProjectResponse | null;
  workspaceMembers: WorkspaceMemberResponse[];

  // State Handlers
  setSelectedProject: (project: ProjectResponse | null) => void;
  setShowCreateProject: (show: boolean) => void;
  setShowProjectSettings: (show: boolean) => void;

  // UI State
  showProjectSelector: boolean;
  setShowProjectSelector: (show: boolean) => void;

  // Permissions
  canAccessSettings: boolean;
}

const sidebarWidth = 'w-16 sm:w-20'; // MainLayout과 동일한 값 사용

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projects,
  selectedProject,
  workspaceMembers,
  setSelectedProject,
  setShowCreateProject,
  setShowProjectSettings,
  showProjectSelector,
  setShowProjectSelector,
  canAccessSettings,
}) => {
  const { theme } = useTheme();
  const projectSelectorRef = useRef<HTMLDivElement>(null);

  return (
    <header
      className={`fixed top-0 left-0 h-16 flex items-center justify-between pl-20 pr-6 sm:pl-28 sm:pr-4 py-2 sm:py-3 ${theme.colors.card} shadow-md z-20 w-full`}
      style={{
        width: `calc(100% - ${sidebarWidth})`,
        left: sidebarWidth,
      }}
    >
      <div className="flex items-center gap-1 relative">
        <button
          onClick={() => {
            setShowProjectSelector(!showProjectSelector);
          }}
          className={`flex items-center gap-2 font-bold text-xl ${theme.colors.text} hover:opacity-80 transition`}
        >
          {selectedProject?.name || '프로젝트를 선택'}
        </button>
        {canAccessSettings && selectedProject && (
          <button
            onClick={() => setShowProjectSettings(true)}
            className={`p-2 rounded-lg transition ${theme.colors.text} hover:bg-gray-100`}
            title="프로젝트 설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
        <ChevronDown
          onClick={() => setShowProjectSelector(!showProjectSelector)}
          className={`w-5 h-5 text-gray-500 transition-transform ${
            showProjectSelector ? 'rotate-180' : 'rotate-0'
          }`}
          style={{ strokeWidth: 2.5 }}
        />
        {showProjectSelector && (
          <div
            ref={projectSelectorRef}
            className={`absolute top-full -left-6 top-8 mt-1 w-80 ${theme.colors.card} ${theme.effects.cardBorderWidth} ${theme.colors.border} z-50 ${theme.effects.borderRadius}`}
          >
            <div className="p-3 max-h-80 overflow-y-auto">
              <h3 className="text-xs text-gray-400 mb-2 px-1 font-semibold">
                프로젝트 ({projects?.length})
              </h3>
              {projects?.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">프로젝트가 없습니다.</p>
              ) : (
                projects?.map((project) => (
                  <button
                    key={project.projectId}
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectSelector(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm rounded transition truncate ${
                      selectedProject?.projectId === project.projectId
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    # {project.name}
                  </button>
                ))
              )}
            </div>
            <div className="pt-2 pb-2 border-t">
              <button
                onClick={() => {
                  setShowCreateProject(true);
                  setShowProjectSelector(false);
                }}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-blue-500 hover:bg-gray-100 rounded-b-lg transition"
              >
                <Plus className="w-4 h-4" /> 새 프로젝트
              </button>
            </div>
          </div>
        )}
      </div>
      {selectedProject && (
        <button
          className={`flex items-center gap-2 p-1 rounded-lg transition ${
            canAccessSettings ? 'hover:bg-blue-100' : 'hover:bg-gray-100'
          }`}
          title="조직원"
        >
          <AvatarStack members={workspaceMembers} />
        </button>
      )}
    </header>
  );
};
