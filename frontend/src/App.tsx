import React, { useState, Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthResponse } from './api/userService';
import { createWorkspace, WorkspaceCreate } from './api/KanbanService';

type AppState = 'AUTH' | 'SELECT_GROUP' | 'CREATE_WORKSPACE' | 'KANBAN';

// Lazy load 페이지들
const AuthPage = lazy(() => import('./pages/Authpage'));
const SelectGroupPage = lazy(() => import('./components/SelectGroupPage'));
const MainDashboard = lazy(() => import('./pages/Dashboard'));

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
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const handleAuthSuccess = (authData: AuthResponse) => {
    setAccessToken(authData.accessToken);
    setUserId(authData.userId);
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('user_id', authData.userId);
    setAppState('SELECT_GROUP');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setAccessToken(null);
    setUserId(null);
    setCurrentGroupId(null);
    setAppState('AUTH');
  };

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
      await createWorkspace(workspaceData, accessToken!);
      setLoadingMessage(null);
      setAppState('KANBAN');
    } catch (error: any) {
      alert(`오류: ${error.message || '알 수 없는 오류'}`);
      setLoadingMessage(null);
      setAppState('SELECT_GROUP');
    }
  };

  const renderContent = () => {
    if (appState === 'AUTH') {
      return <AuthPage onLogin={handleAuthSuccess} />;
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
    if (appState === 'CREATE_WORKSPACE') {
      return <LoadingScreen msg={loadingMessage || '작업 공간을 준비 중입니다...'} />;
    }
    if (appState === 'KANBAN' && currentGroupId && accessToken) {
      return (
        <MainDashboard
          onLogout={handleLogout}
          currentGroupId={currentGroupId}
          accessToken={accessToken}
        />
      );
    }
    return <AuthPage onLogin={handleAuthSuccess} />;
  };

  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingScreen />}>{renderContent()}</Suspense>
    </ThemeProvider>
  );
};

export default App;
