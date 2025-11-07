import React, { useState, Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthResponse } from './api/userService';
// import { createWorkspace, WorkspaceCreate } from './api/KanbanService'; // 주석처리: 에러 방지

type AppState = 'AUTH' | 'SELECT_GROUP' | 'CREATE_WORKSPACE' | 'KANBAN';

// Lazy load 페이지들
const AuthPage = lazy(() => import('./pages/Authpage'));
const SelectGroupPage = lazy(() => import('./components/SelectGroupPage'));
const MainDashboard = lazy(() => import('./pages/Dashboard'));
// 💡 리다이렉트 처리를 위한 새로운 페이지 임포트
const OAuthRedirectPage = lazy(() => import('./pages/OAuthRedirectPage'));

const LoadingScreen = ({ msg = '로딩 중..' }) => (
  <div className="text-center min-h-screen flex items-center justify-center bg-gray-50">
    <div className="p-8 bg-white rounded-xl shadow-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h1 className="text-xl font-medium text-gray-800">{msg}</h1>
    </div>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  // const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  // handleAuthSuccess는 OAuthRedirectPage에서 호출됩니다.
  const handleAuthSuccess = (authData: AuthResponse) => {
    // 토큰이 유효한지 확인
    if (authData.accessToken && authData.userId) {
      setAccessToken(authData.accessToken);
      setUserId(authData.userId);
      localStorage.setItem('access_token', authData.accessToken);
      localStorage.setItem('user_id', authData.userId);
      setAppState('SELECT_GROUP');
    } else {
      // 토큰이 유효하지 않으면 강제 로그아웃
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setAccessToken(null);
    setUserId(null);
    setCurrentGroupId(null);
    setAppState('AUTH');
  };

  // NOTE: createWorkspace 타입 에러 방지를 위해 임시 주석 처리하거나,
  // KanbanService.ts에 정의가 필요합니다.
  /*
  const handleGroupSelectionSuccess = async (groupId: string) => {
    if (!accessToken || !userId) {
      alert('인증 정보가 유효하지 않습니다.');
      handleLogout();
      return;
    }

    setCurrentGroupId(groupId);
    setLoadingMessage('워크스페이스를 생성하고 초기 설정을 진행합니다...');
    setAppState('CREATE_WORKSPACE');

    try {
      const workspaceData: WorkspaceCreate = {
        name: 'My Kanban Workspace - ' + groupId.substring(0, 8),
        description: `Group ID ${groupId}를 위한 기본 공간`,
      };
      // await createWorkspace(workspaceData, accessToken!); 
      setLoadingMessage(null);
      setAppState('KANBAN');
    } catch (error: any) {
      alert(`오류: ${error.message || '알 수 없는 오류'}`);
      setLoadingMessage(null);
      setAppState('SELECT_GROUP');
    }
  };
  */
  // 임시로 그룹 선택 성공 후 바로 KANBAN으로 이동하도록 수정
  const handleGroupSelectionSuccess = (groupId: string) => {
    if (!accessToken || !userId) {
      handleLogout();
      return;
    }
    setCurrentGroupId(groupId);
    setAppState('KANBAN');
  };

  const renderContent = () => {
    // 1. OAuth Redirect Check: 최상단에 배치하여 TS2367 에러를 해결하고 논리를 명확하게 합니다.
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthTokens = urlParams.has('accessToken') && urlParams.has('refreshToken');

    // ⚠️ 백엔드 개발자에게 확인한 최종 리다이렉트 경로를 사용하세요.
    // 현재는 '/oauth/redirect'를 가정하고 URL 경로를 검사합니다.
    const isRedirectPath = window.location.pathname.includes('/oauth/redirect');

    if (isRedirectPath || hasOAuthTokens) {
      // URL에 토큰이 있다면 상태와 무관하게 처리 페이지를 렌더링
      return <OAuthRedirectPage onAuthSuccess={handleAuthSuccess} />;
    }

    // 2. Standard State Routing
    if (appState === 'AUTH') {
      // 💡 onLogin prop 제거
      return <AuthPage />;
    }

    if (appState === 'SELECT_GROUP' && userId && accessToken) {
      return (
        <SelectGroupPage
          userId={userId}
          accessToken={accessToken}
          onGroupSelected={handleGroupSelectionSuccess}
        />
      );
    }
    // if (appState === 'CREATE_WORKSPACE') {
    //   return <LoadingScreen msg={loadingMessage || '작업 공간을 준비 중입니다...'} />;
    // }
    if (appState === 'KANBAN' && currentGroupId && accessToken) {
      return (
        <MainDashboard
          onLogout={handleLogout}
          currentGroupId={currentGroupId}
          accessToken={accessToken}
        />
      );
    }

    // 3. Fallback
    return <AuthPage />;
  };

  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingScreen />}>{renderContent()}</Suspense>
    </ThemeProvider>
  );
};

export default App;
