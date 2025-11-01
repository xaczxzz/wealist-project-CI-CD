import React, { useState } from 'react';
// Styles & Contexts
import { ThemeProvider } from "./contexts/ThemeContext";

// API Services
// 💡 실제 파일 경로에 맞게 수정하세요. (예: './services/userService' 등)
import { AuthResponse } from './api/userService'; 
import { createWorkspace, WorkspaceCreate } from './api/KanbanService';

// Pages & Components
import AuthPage from "./pages/Authpage";
import SelectGroupPage from "./components/SelectGroupPage"; // 조직 선택 컴포넌트 (이전에 구현됨)
import MainDashboard from "./pages/Dashboard"; // 최종 목적지

// 애플리케이션의 주요 흐름 상태 정의 (상태 머신)
type AppState = 'AUTH' | 'SELECT_GROUP' | 'CREATE_WORKSPACE' | 'KANBAN';

// 사용자 플로우를 제어하는 최상위 App 컴포넌트입니다.
const App: React.FC = () => {
  // 1. 상태 관리
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  // 2. 인증 성공 핸들러 (AUTH -> SELECT_GROUP)
  const handleAuthSuccess = (authData: AuthResponse) => {
    // JWT 토큰과 사용자 ID를 저장합니다.
    setAccessToken(authData.accessToken);
    setUserId(authData.userId);
    
    // 로컬 스토리지에 토큰 임시 저장 (페이지 새로고침 대비)
    localStorage.setItem("access_token", authData.accessToken);
    localStorage.setItem("user_id", authData.userId);

    // 다음 단계로 전환
    setAppState('SELECT_GROUP');
  };

  // 3. 로그아웃 핸들러 (KANBAN -> AUTH)
  const handleLogout = () => {
    // 저장된 토큰 및 사용자 정보 삭제
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    setAccessToken(null);
    setUserId(null);
    setCurrentGroupId(null);
    setAppState('AUTH');
  };

  // 4. 그룹 선택 성공 핸들러 (SELECT_GROUP -> CREATE_WORKSPACE -> KANBAN)
  const handleGroupSelectionSuccess = async (groupId: string) => {
    // 유효성 검사 (세션이 끊어졌을 경우 대비)
    if (!accessToken || !userId) {
      alert("세션 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      handleLogout();
      return;
    }

    setCurrentGroupId(groupId);
    setLoadingMessage("워크스페이스를 생성하고 초기 설정을 진행합니다...");
    setAppState('CREATE_WORKSPACE');

    try {
      // 4-1. Workspace 생성 요청 데이터 준비
      const workspaceData: WorkspaceCreate = {
        name: "My Kanban Workspace - " + groupId.substring(0, 8),
        description: `Group ID ${groupId}를 위한 기본 공간 (그룹 선택 완료)`
      };

      // 4-2. 💡 Kanban Service 호출: Workspace 생성
      const newWorkspace = await createWorkspace(workspaceData, accessToken);
      
      console.log("Workspace 생성 성공:", newWorkspace);
      
      setLoadingMessage(null);
      // 🚀 최종 목적지: Kanban 메인 화면으로 이동
      setAppState('KANBAN'); 
      
    } catch (error) {
      console.error("Workspace 생성 실패:", error);
      alert("Workspace 생성 중 오류가 발생했습니다. 그룹 선택 페이지로 복귀합니다.");
      setLoadingMessage(null);
      setAppState('SELECT_GROUP'); // 실패 시 그룹 선택 페이지로 복귀
    }
  };

  // 5. 렌더링 로직 (상태 기반 분기)
  const renderContent = () => {
    // 💡 Auth (인증) 단계
    if (appState === 'AUTH') {
        return <AuthPage onLogin={handleAuthSuccess} />;
    }
    
    // 💡 Select Group (그룹 선택/생성) 단계
    if (appState === 'SELECT_GROUP' && userId && accessToken) {
        return (
            <SelectGroupPage
                userId={userId}
                accessToken={accessToken}
                onGroupSelected={handleGroupSelectionSuccess}
            />
        );
    }
    
    // 💡 Create Workspace (로딩) 단계
    if (appState === 'CREATE_WORKSPACE') {
        return (
          <div className="text-center min-h-screen flex items-center justify-center bg-gray-50">
            <div className="p-8 bg-white rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <h1 className="text-xl font-medium text-gray-800">{loadingMessage}</h1>
            </div>
          </div>
        );
    }

    // 💡 Kanban (메인 화면) 단계
    if (appState === 'KANBAN' && currentGroupId) {
        return (
          <MainDashboard onLogout={handleLogout} />
        );
    }

    // 예외적인 상태 (토큰은 없는데 KANBAN 상태가 아닐 때 등)
    return <AuthPage onLogin={handleAuthSuccess} />;
  };

  // 6. 초기 로딩 및 세션 복구 로직 (useEffect 추가 필요)
  // 실제 프로덕션 코드에서는 여기에 초기 세션 복구 로직이 들어가야 합니다.
  // 예: localStorage에서 토큰을 읽어와서 user service의 /api/auth/me 엔드포인트로 유효성 검사를 수행하는 로직

  return (
    <ThemeProvider>
      {/* 💡 상태 기반 렌더링 */}
      {renderContent()}
    </ThemeProvider>
  );
};

export default App;