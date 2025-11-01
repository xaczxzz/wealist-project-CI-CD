import React, {
  useEffect,
  useState,
  // useCallback
} from 'react';
import {
  Menu,
  User,
  ChevronDown,
  Plus,
  MoreVertical,
  X,
  // Search
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import UserProfileModal from '../components/modals/UserProfileModal';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import { UserProfile } from '../types';
// 💡 Mock API를 사용하므로, 실제 서비스 임포트는 주석 처리합니다.
// import workspaceService from '../services/workspaceService';
// import healthService from '../services/healthTest';

// --- 1. API 스펙에 맞춘 Mock 데이터 타입 정의 ---
// Kanban API: Workspace 응답 (API 스펙 참고)
interface WorkspaceResponse {
  id: string; // Workspace ID (UUID)
  name: string;
  created_by: string; // userId
}

// Kanban API: Project 응답 (API 스펙 참고)
interface ProjectResponse {
  id: string; // Project ID (UUID)
  name: string;
  workspace_id: string;
}

// 💡 Kanban API: Ticket 응답 (Task로 사용)
interface Task {
  id: string; // Ticket ID (UUID)
  title: string;
  assignee_id: string | null;
  status: string; // "TODO", "IN_PROGRESS", "REVIEW", "DONE"
  // ... (description, priority 등)
}

// 💡 UI에서 사용할 칸반 컬럼 (상태)
interface Column {
  id: string; // "TODO", "IN_PROGRESS" 등
  title: string;
  tasks: Task[];
}

// -------------------------------------------------

// 💡 App.tsx에서 전달받는 Props 정의
interface MainDashboardProps {
  onLogout: () => void;
  currentGroupId: string; // User Service의 Group ID
  accessToken: string; // API 호출에 사용될 토큰
}

// --- 2. Mock API 함수 정의 (백엔드 대체) ---

// 🚧 Mock: 조직(Workspace) 목록 조회
const mockFetchWorkspaces = async (token: string): Promise<WorkspaceResponse[]> => {
  console.log('[Mock] API: 조직(Workspace) 목록 조회 (Token:', token ? '있음' : '없음', ')');
  await new Promise((resolve) => setTimeout(resolve, 300)); // 딜레이
  return [
    { id: 'ws-mock-111', name: 'Wealist 개발팀 (Mock)', created_by: 'user-1' },
    { id: 'ws-mock-222', name: 'Orange Cloud 디자인팀 (Mock)', created_by: 'user-2' },
    { id: 'ws-mock-333', name: '개인 스터디 (Mock)', created_by: 'user-1' },
  ];
};

// 🚧 Mock: 프로젝트 목록 조회 (조직 ID 기반)
const mockFetchProjects = async (
  workspaceId: string,
  // token: string,
): Promise<ProjectResponse[]> => {
  console.log(`[Mock] API: 프로젝트 목록 조회 (Workspace: ${workspaceId})`);
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (workspaceId === 'ws-mock-222') {
    // 디자인팀 Mock
    return [
      { id: 'prj-mock-design-A', name: '랜딩페이지 디자인', workspace_id: workspaceId },
      { id: 'prj-mock-design-B', name: 'BI/CI 리뉴얼', workspace_id: workspaceId },
    ];
  }
  // 기본 Mock (개발팀)
  return [
    { id: 'prj-mock-dev-A', name: '백엔드 API 개발', workspace_id: workspaceId },
    { id: 'prj-mock-dev-B', name: '프론트엔드 UI/UX', workspace_id: workspaceId },
    { id: 'prj-mock-dev-C', name: '인프라 구축 (K8s)', workspace_id: workspaceId },
  ];
};

// 🚧 Mock: 칸반 보드/태스크(Ticket) 목록 조회 (프로젝트 ID 기반)
const mockFetchKanbanBoard = async (
  projectId: string,
  // token: string
): Promise<Column[]> => {
  console.log(`[Mock] API: 칸반 보드 로드 (Project: ${projectId})`);
  await new Promise((resolve) => setTimeout(resolve, 400));

  // 프로젝트 ID에 따라 다른 Mock Task 반환
  const baseTasks: Task[] = [
    { id: 't-1', title: `[${projectId}] UI 디자인`, assignee_id: 'user-1', status: 'TODO' },
    { id: 't-2', title: `[${projectId}] API 문서 작성`, assignee_id: 'user-2', status: 'TODO' },
    {
      id: 't-3',
      title: `[${projectId}] 로그인 기능 구현`,
      assignee_id: 'user-3',
      status: 'IN_PROGRESS',
    },
    {
      id: 't-4',
      title: `[${projectId}] DB 스키마 설계`,
      assignee_id: 'user-4',
      status: 'IN_PROGRESS',
    },
    { id: 't-5', title: `[${projectId}] 코드 리뷰 요청`, assignee_id: 'user-1', status: 'REVIEW' },
    { id: 't-6', title: `[${projectId}] 1차 배포 완료`, assignee_id: 'user-3', status: 'DONE' },
  ];

  // Task를 상태(Column)별로 재분배
  return [
    { id: 'TODO', title: '할 일', tasks: baseTasks.filter((t) => t.status === 'TODO') },
    {
      id: 'IN_PROGRESS',
      title: '진행 중',
      tasks: baseTasks.filter((t) => t.status === 'IN_PROGRESS'),
    },
    { id: 'REVIEW', title: '검토 중', tasks: baseTasks.filter((t) => t.status === 'REVIEW') },
    { id: 'DONE', title: '완료!', tasks: baseTasks.filter((t) => t.status === 'DONE') },
  ];
};
// ----------------------------------------------------

const MainDashboard: React.FC<MainDashboardProps> = ({ onLogout, currentGroupId, accessToken }) => {
  const { theme } = useTheme();

  // --- 3. 상태 관리 (API 연동) ---
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);

  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceResponse | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);

  const [userProfile, _setUserProfile] = useState<UserProfile>({
    name: 'Mock User',
    email: 'mock@wealist.com',
    avatar: 'P',
  });

  // UI 상태
  const [_isLoading, setIsLoading] = useState<boolean>(true);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showUserProfile, setShowUserProfile] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // --- 4. 데이터 연동 (useEffect 연쇄) ---

  // 💡 [Phase 1] 대시보드 진입: 조직(Workspace) 목록 로드
  useEffect(() => {
    setIsLoading(true);
    mockFetchWorkspaces(accessToken)
      .then((data) => {
        setWorkspaces(data);
        // 기본 셋팅: 첫 번째 조직(Workspace)을 자동으로 선택
        if (data.length > 0) {
          setSelectedWorkspace(data[0]);
        }
      })
      .catch((err) => console.error('조직(Workspace) 로드 실패', err))
      .finally(() => setIsLoading(false));
  }, [accessToken, currentGroupId]); // GroupId가 바뀌면 Workspace도 다시 로드 (실제 API 연동 시 필요)

  // 💡 [Phase 2] 조직(Workspace) 변경 시: 프로젝트 목록 리로드
  useEffect(() => {
    if (!selectedWorkspace) return; // 선택된 조직이 없으면 중지

    setIsLoading(true);
    mockFetchProjects(
      selectedWorkspace.id,
      // accessToken
    )
      .then((data) => {
        setProjects(data);
        // 기본 셋팅: 첫 번째 프로젝트를 자동으로 선택
        if (data.length > 0) {
          setSelectedProject(data[0]);
        } else {
          setSelectedProject(null); // 프로젝트가 없으면 초기화
        }
      })
      .catch((err) => console.error('프로젝트 로드 실패', err))
      .finally(() => setIsLoading(false));
  }, [selectedWorkspace, accessToken]); // 👈 'selectedWorkspace'가 변경될 때마다 실행

  // 💡 [Phase 3] 프로젝트 변경 시: 칸반 보드(Ticket/Task) 리로드
  useEffect(() => {
    if (!selectedProject) {
      // 선택된 프로젝트가 없으면
      setColumns([]); // 칸반 보드 비우기
      return;
    }

    setIsLoading(true);
    mockFetchKanbanBoard(
      selectedProject.id,
      // accessToken
    )
      .then((data) => {
        setColumns(data); // 💡 칸반 보드 상태 업데이트
      })
      .catch((err) => console.error('칸반 보드 로드 실패', err))
      .finally(() => setIsLoading(false));
  }, [selectedProject, accessToken]); // 👈 'selectedProject'가 변경될 때마다 실행

  // --- 5. 드래그 앤 드롭 로직 (Mock 데이터 기준) ---
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);

  const handleDragStart = (task: Task, columnId: string): void => {
    setDraggedTask(task);
    setDraggedFromColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string): void => {
    if (!draggedTask || !draggedFromColumn || draggedFromColumn === targetColumnId) return;

    // 💡 Mock 데이터 업데이트
    const updatedTask = { ...draggedTask, status: targetColumnId };

    const newColumns = columns.map((col) => {
      // 1. 드래그 시작 컬럼에서 태스크 제거
      if (col.id === draggedFromColumn) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== draggedTask.id),
        };
      }
      // 2. 드롭 대상 컬럼에 태스크 추가
      if (col.id === targetColumnId) {
        return {
          ...col,
          tasks: [...col.tasks, updatedTask],
        };
      }
      return col;
    });

    setColumns(newColumns);
    setDraggedTask(null);
    setDraggedFromColumn(null);

    // 💡 TODO: 백엔드 준비 시, 여기서 (PATCH /api/tickets/{ticket_id}) API 호출
    console.log(`[Mock] API: Task ${draggedTask.id} 상태를 ${targetColumnId}(으)로 변경 요청`);
  };

  const columnColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];

  // --- 6. UI 렌더링 ---
  return (
    <div className={`min-h-screen ${theme.colors.background}`}>
      {/* 백그라운드 패턴 */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      {/* 헤더 */}
      <header
        className={`${theme.colors.primary} ${theme.effects.borderWidth} ${theme.colors.border} border-t-0 border-l-0 border-r-0 px-3 sm:px-6 py-2 sm:py-4 relative z-20`}
        style={{ boxShadow: theme.effects.headerShadow }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 💡 조직(Workspace) 선택 드롭다운 (API 연동) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 ${theme.colors.secondary} ${theme.effects.cardBorderWidth} ${theme.colors.border} hover:bg-gray-100 transition ${theme.font.size.xs} ${theme.effects.borderRadius}`}
              >
                <Menu className="w-3 h-3 sm:w-4 sm:h-4" style={{ strokeWidth: 3 }} />
                <span className="hidden lg:inline font-bold">
                  {selectedWorkspace?.name || '조직 선택'}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" style={{ strokeWidth: 3 }} />
              </button>
              {showWorkspaceMenu && (
                <div
                  className={`absolute top-full left-0 mt-2 w-48 sm:w-64 ${theme.colors.card} ${theme.effects.cardBorderWidth} ${theme.colors.border} z-50 ${theme.effects.borderRadius}`}
                  style={{ boxShadow: theme.effects.shadow }}
                >
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        setSelectedWorkspace(workspace); // 💡 선택 시 'selectedWorkspace' 상태 변경
                        setShowWorkspaceMenu(false);
                      }}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-orange-100 transition ${
                        theme.effects.cardBorderWidth
                      } ${theme.colors.border} border-t-0 border-l-0 border-r-0 last:border-b-0 ${
                        theme.font.size.xs
                      } ${selectedWorkspace?.id === workspace.id ? 'bg-blue-100 font-bold' : ''}`}
                    >
                      {workspace.name}
                    </button>
                  ))}
                  <div
                    className={`${theme.effects.cardBorderWidth} ${theme.colors.border} border-b-0 border-l-0 border-r-0`}
                  ></div>
                  <button
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left ${theme.colors.success} text-white ${theme.colors.successHover} transition flex items-center gap-2 ${theme.font.size.xs} ${theme.effects.borderRadius} rounded-t-none`}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" style={{ strokeWidth: 3 }} />
                    새로운 조직
                  </button>
                </div>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`md:hidden relative ${theme.colors.secondary} ${theme.effects.cardBorderWidth} ${theme.colors.border} p-2 ${theme.effects.borderRadius}`}
            >
              <Menu className="w-5 h-5" style={{ strokeWidth: 3 }} />
            </button>
          </div>

          {/* 사용자 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 ${theme.colors.secondary} ${theme.effects.cardBorderWidth} ${theme.colors.border} hover:bg-gray-100 transition ${theme.font.size.xs} ${theme.effects.borderRadius}`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 3 }} />
              <span className="hidden sm:inline">{userProfile.name}</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" style={{ strokeWidth: 3 }} />
            </button>
            {showUserMenu && (
              <div
                className={`absolute top-full right-0 mt-2 w-48 sm:w-56 ${theme.colors.card} ${theme.effects.cardBorderWidth} ${theme.colors.border} z-50 ${theme.effects.borderRadius}`}
                style={{ boxShadow: theme.effects.shadow }}
              >
                <div
                  className={`px-3 sm:px-4 py-2 sm:py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} border-t-0 border-l-0 border-r-0 ${theme.colors.primary} text-white`}
                >
                  <p className={`font-bold ${theme.font.size.xs}`}>{userProfile.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserProfile(true);
                    setShowUserMenu(false);
                  }}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-orange-100 transition ${theme.effects.cardBorderWidth} ${theme.colors.border} border-t-0 border-l-0 border-r-0 ${theme.font.size.xs}`}
                >
                  프로필
                </button>
                <div
                  className={`${theme.effects.cardBorderWidth} ${theme.colors.border} border-b-0 border-l-0 border-r-0`}
                ></div>
                <button
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left bg-red-500 hover:bg-red-600 transition text-white ${theme.font.size.xs} ${theme.effects.borderRadius} rounded-t-none`}
                  onClick={onLogout}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 (API 연동) */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className={`${theme.colors.card} ${theme.effects.borderWidth} ${theme.colors.border} w-64 h-full p-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${theme.font.size.xs} font-bold`}>메뉴</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className={`bg-red-500 ${theme.effects.cardBorderWidth} ${theme.colors.border} p-1`}
              >
                <X className="w-4 h-4 text-white" style={{ strokeWidth: 3 }} />
              </button>
            </div>
            <div className="space-y-2">
              <p className={`text-[8px] ${theme.colors.subText} mb-2`}>조직(Workspaces):</p>
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setSelectedWorkspace(workspace);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left ${theme.effects.cardBorderWidth} ${
                    theme.colors.border
                  } text-[8px] ${theme.effects.borderRadius} ${
                    selectedWorkspace?.id === workspace.id
                      ? `${theme.colors.primary} text-white`
                      : `${theme.colors.secondary} hover:bg-gray-100`
                  }`}
                >
                  {workspace.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 💡 프로젝트 탭 바 (API 연동) */}
      <div
        className={`${theme.colors.card} ${theme.effects.borderWidth} ${theme.colors.border} border-t-0 border-l-0 border-r-0 px-3 sm:px-6 py-2 sm:py-3 overflow-x-auto`}
      >
        <div className="flex items-center gap-2 sm:gap-4 min-w-max">
          <div className="flex gap-2 flex-nowrap">
            {projects.map((project) => (
              <div key={project.id} className="relative flex-shrink-0">
                <button
                  onClick={() => setSelectedProject(project)}
                  className={`relative px-2 sm:px-4 py-1 sm:py-2 ${theme.effects.cardBorderWidth} ${
                    theme.colors.border
                  } transition ${theme.font.size.xs} ${
                    theme.effects.borderRadius
                  } whitespace-nowrap ${
                    selectedProject?.id === project.id
                      ? `${theme.colors.primary} text-white`
                      : `${theme.colors.secondary} ${theme.colors.text} hover:bg-gray-100`
                  }`}
                >
                  {project.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 💡 칸반 보드 (API 연동) */}
      <div className="p-3 sm:p-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:overflow-x-auto pb-4">
          {columns.map((column, idx) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              className="w-full lg:w-80 lg:flex-shrink-0 relative"
            >
              <div
                className={`relative ${theme.effects.cardBorderWidth} ${theme.colors.border} p-3 sm:p-4 ${theme.colors.card} ${theme.effects.borderRadius}`}
              >
                <div
                  className={`flex items-center justify-between mb-3 sm:mb-4 pb-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} border-t-0 border-l-0 border-r-0`}
                >
                  <h3
                    className={`font-bold ${theme.colors.text} flex items-center gap-2 ${theme.font.size.xs}`}
                  >
                    <span
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        columnColors[idx % columnColors.length]
                      } ${theme.effects.cardBorderWidth} ${theme.colors.border}`}
                    ></span>
                    {column.title}
                    <span
                      className={`bg-black text-white px-1 sm:px-2 py-1 ${theme.effects.cardBorderWidth} ${theme.colors.border} text-[8px] sm:text-xs`}
                    >
                      {column.tasks.length}
                    </span>
                  </h3>
                  <button className={`${theme.colors.text} hover:${theme.colors.info}`}>
                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" style={{ strokeWidth: 3 }} />
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {column.tasks.map((task) => (
                    <div key={task.id} className="relative">
                      <div
                        draggable
                        onDragStart={() => handleDragStart(task, column.id)}
                        onClick={() => setSelectedTask(task as any)} // (임시 타입 변환)
                        className={`relative ${theme.colors.card} p-3 sm:p-4 ${theme.effects.cardBorderWidth} ${theme.colors.border} hover:border-orange-500 transition cursor-pointer ${theme.effects.borderRadius}`}
                      >
                        <h4
                          className={`font-bold ${theme.colors.text} mb-2 sm:mb-3 ${theme.font.size.xs} break-words`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 ${theme.colors.primary} ${theme.effects.cardBorderWidth} ${theme.colors.border} flex items-center justify-center text-white font-bold text-[8px] sm:text-xs flex-shrink-0 ${theme.effects.borderRadius}`}
                          >
                            {task.assignee_id ? task.assignee_id[0].toUpperCase() : '?'}
                          </div>
                          <span className={`${theme.font.size.xs} truncate ${theme.colors.text}`}>
                            {task.assignee_id || '미배정'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="relative">
                    <button
                      className={`relative w-full py-3 sm:py-4 ${theme.effects.cardBorderWidth} border-dashed ${theme.colors.border} ${theme.colors.card} hover:bg-orange-50 transition flex items-center justify-center gap-2 ${theme.font.size.xs} ${theme.effects.borderRadius}`}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" style={{ strokeWidth: 3 }} />
                      태스크 추가
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="w-full lg:w-80 lg:flex-shrink-0 relative">
            <button
              className={`relative w-full h-24 sm:h-32 ${theme.effects.cardBorderWidth} border-dashed ${theme.colors.border} ${theme.colors.card} hover:bg-orange-50 transition flex items-center justify-center gap-2 ${theme.font.size.xs} ${theme.effects.borderRadius}`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" style={{ strokeWidth: 3 }} />
              새로운 티켓
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {showUserProfile && userProfile && (
        <UserProfileModal user={userProfile} onClose={() => setShowUserProfile(false)} />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask as any} // (임시 타입 변환)
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default MainDashboard;
