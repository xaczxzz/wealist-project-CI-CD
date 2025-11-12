import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
// 💡 API 호출 시 accessToken 인수가 필요 없도록 변경됨
import { getMyWorkspaces, createWorkspace } from '../api/user/userService';
import { Search, Plus, X, AlertCircle, Settings, LogOut } from 'lucide-react';
import WorkspaceManagementModal from './modals/WorkspaceManagementModal';
import { CreateWorkspaceRequest, WorkspaceResponse } from '../types/user';

type WorkspacePageStep = 'list' | 'create-form' | 'add-members' | 'loading';

interface PendingMember {
  id: string;
  email: string;
}

const SelectWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userEmail, logout, nickName } = useAuth(); // useAuth의 userEmail, nickName은 JWT Payload 등에서 가져온다고 가정

  // 페이지 상태
  const [step, setStep] = useState<WorkspacePageStep>('list');
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 폼 상태
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // 멤버 초대
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberEmailError, setMemberEmailError] = useState<string | null>(null);

  const [_createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);

  // 워크스페이스 관리 모달
  const [managingWorkspace, setManagingWorkspace] = useState<WorkspaceResponse | null>(null);

  // 1. 초기 워크스페이스 로드
  useEffect(() => {
    // 💡 accessToken 변수 선언 및 localStorage.getItem 호출 제거
    const fetchWorkspaces = async () => {
      // 💡 토큰이 없거나 만료된 경우, 인터셉터가 자동으로 로그아웃/리다이렉트 처리해주므로,
      //    여기서는 API 호출만 시도합니다.
      //    (단, useAuth 등에서 userEmail, nickName이 유효한지 확인하는 로직은 별도로 필요할 수 있습니다.)

      setIsLoading(true);
      setError(null);
      try {
        const fetchedWorkspaces = await getMyWorkspaces();
        setWorkspaces(fetchedWorkspaces);
      } catch (e) {
        // 💡 401 에러는 인터셉터가 처리하고, 그 외의 에러(4xx, 5xx)는 여기서 처리
        const err = e as Error;
        console.error('워크스페이스 목록 조회 실패:', err);
        // 토큰 갱신 실패로 인한 로그아웃 시 에러가 여기서 잡힐 수도 있지만,
        // 인터셉터에서 window.location.href = '/' 처리했으므로,
        // 실제로는 리다이렉트되어 페이지가 바뀌게 됩니다.
        setError(`워크스페이스 목록 조회 실패: ${err.message}`);
        setWorkspaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [navigate]); // 💡 의존성 배열에서 accessToken 제거

  // 2. 검색 필터 (동일)
  const availableWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return workspaces;
    return workspaces.filter(
      (ws) =>
        ws.workspaceName.toLowerCase().includes(query) ||
        ws.workspaceDescription.toLowerCase().includes(query),
    );
  }, [searchQuery, workspaces]);

  // 3. 이메일 유효성 검사 (동일)
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 4. 멤버 추가 (동일)
  const handleAddMember = () => {
    setMemberEmailError(null);
    if (!memberEmail.trim()) {
      setMemberEmailError('이메일을 입력해주세요');
      return;
    }
    if (!isValidEmail(memberEmail)) {
      setMemberEmailError('유효한 이메일 주소를 입력해주세요');
      return;
    }
    if (pendingMembers.some((m) => m.email === memberEmail)) {
      setMemberEmailError('이미 추가된 이메일입니다');
      return;
    }
    setPendingMembers([...pendingMembers, { id: Date.now().toString(), email: memberEmail }]);
    setMemberEmail('');
  };

  // 5. 멤버 제거 (동일)
  const handleRemoveMember = (id: string) => {
    setPendingMembers(pendingMembers.filter((m) => m.id !== id));
  };

  // 6. 워크스페이스 생성 (토큰 인자 제거)
  const handleCreateWorkspaceWithMembers = async () => {
    if (!newWorkspaceName.trim()) {
      setError('워크스페이스 이름을 입력해주세요');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const createData: CreateWorkspaceRequest = {
        workspaceName: newWorkspaceName,
        workspaceDescription: newDescription || '-',
      };

      // 💡 [핵심] API 호출
      const newWorkspace = await createWorkspace(createData);

      // 💡 [수정] 응답 검증 강화: newWorkspace가 유효한지, 그리고 workspaceId 속성이 있는지 확인
      if (!newWorkspace || !newWorkspace.workspaceId) {
        // 200 OK가 떨어졌지만 데이터가 비었거나 구조가 잘못되었을 경우
        throw new Error(
          '워크스페이스가 생성되었지만, 응답에서 유효한 Workspace ID를 찾을 수 없습니다. (응답 구조 오류)',
        );
      }

      const newWorkspaceId = newWorkspace.workspaceId;
      setCreatedWorkspaceId(newWorkspaceId);
      
      for (const member of pendingMembers) {
        console.log(`멤버 초대 예정: ${member.email}`);
      }

      alert(
        `워크스페이스 '${newWorkspaceName}' 생성 완료! ${pendingMembers.length}명의 멤버 초대 예정입니다.`,
      );

      resetCreateForm();
      navigate(`/workspace/${newWorkspaceId}`);
    } catch (e) {
      const err = e as Error;
      setError(`워크스페이스 생성 실패: ${err.message}`);
      setIsLoading(false);
    }
  };

  // 7. 기존 워크스페이스 선택 (동일)
  const handleSelectExistingWorkspace = async (workspace: WorkspaceResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      // 이 부분은 API 호출이 없으므로 그대로 둡니다.
      alert(`워크스페이스 '${workspace.workspaceName}'에 참여 완료!`);
      navigate(`/workspace/${workspace.workspaceId}`);
    } catch (e) {
      // 현재 로직상 API 호출이 없으나, 혹시 모를 에러 처리용
      const err = e as Error;
      setError(`워크스페이스 참여 실패: ${err.message}`);
      setIsLoading(false);
    }
  };

  // 워크스페이스 관리 모달 열기 (동일)
  const handleManageWorkspace = (workspace: WorkspaceResponse) => {
    setManagingWorkspace(workspace);
  };

  // 8. 폼 초기화 (동일)
  const resetCreateForm = () => {
    setNewWorkspaceName('');
    setNewDescription('');
    setPendingMembers([]);
    setMemberEmail('');
    setMemberEmailError(null);
    setStep('list');
  };

  // --- 로딩 화면 (동일) ---
  if (isLoading && workspaces === null) {
    return (
      <div
        className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-4`}
      >
        <div className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${theme.font.size.lg} ${theme.colors.text}`}>
            워크스페이스 정보를 확인 중...
          </p>
        </div>
      </div>
    );
  }

  // --- 메인 렌더링 (동일) ---
  return (
    <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-4`}>
      <div
        className={`${theme.colors.card} ${theme.effects.borderRadius} p-6 sm:p-8 w-full max-w-2xl relative z-10 shadow-xl ${theme.effects.cardBorderWidth} ${theme.colors.border}`}
      >
        {/* 사용자 정보 헤더 */}
        <div className="flex items-center justify-between mb-6 pb-4">
          <div className="flex items-center gap-2">
            <span className={`${theme.font.size.sm} ${theme.colors.text}`}>
              {userEmail ? `반갑습니다, ${nickName}님!` : '환영합니다!'}
            </span>
          </div>
          {/* 로그아웃은 useAuth의 logout 함수를 사용한다고 가정 (logout 내부에서 performLogout 호출) */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
            <span className={`${theme.font.size.sm}`}>로그아웃</span>
          </button>
        </div>

        {/* Step 1: 워크스페이스 목록 & 선택 */}
        {step === 'list' && (
          <>
            <h2
              className={`text-center ${theme.font.size.xl} font-extrabold ${theme.colors.text} mb-2`}
            >
              워크스페이스 선택
            </h2>
            <p className={`text-center mb-6 ${theme.font.size.sm} ${theme.colors.subText}`}>
              기존 워크스페이스에 참여하거나 새로운 워크스페이스를 생성하세요.
            </p>

            {error && (
              <div
                className={`${theme.colors.danger} text-center mb-4 ${theme.font.size.sm} border border-red-300 p-2 rounded-md bg-red-50 flex items-center gap-2`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* 검색 */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="워크스페이스 이름 또는 설명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 pl-10 py-3 ${theme.colors.secondary} ${theme.font.size.sm} rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* 워크스페이스 목록 */}
            <div
              className={`max-h-60 overflow-y-auto border-2 ${theme.colors.border} rounded-lg mb-4`}
            >
              {availableWorkspaces.length > 0 ? (
                availableWorkspaces.map((ws) => (
                  <div
                    key={ws.workspaceId}
                    onClick={() => !isLoading && handleSelectExistingWorkspace(ws)}
                    className={`w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 ${
                      theme.colors.text
                    } ${
                      theme.font.size.sm
                    } transition flex justify-between items-center last:border-b-0 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{ws.workspaceName}</span>
                      <p className={`${theme.colors.subText} ${theme.font.size.xs}`}>
                        {ws.workspaceDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* {ws.ownerId === userId && ( */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageWorkspace(ws);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title="워크스페이스 관리"
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                      {/* )} */}
                      <span
                        className={`${theme.colors.info} ${theme.font.size.xs} px-2 py-1 border border-blue-200 rounded`}
                      >
                        선택
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`p-4 text-center ${theme.colors.subText} ${theme.font.size.sm}`}>
                  {searchQuery.trim() ? '검색 결과가 없습니다.' : '소속된 워크스페이스가 없습니다.'}
                </p>
              )}
            </div>

            {/* 새 워크스페이스 생성 버튼 */}
            <button
              onClick={() => setStep('create-form')}
              disabled={isLoading}
              className={`w-full ${theme.colors.primary} text-white py-3 font-bold rounded-lg ${theme.colors.primaryHover} transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2`}
            >
              <Plus className="w-5 h-5" /> 새 워크스페이스 생성
            </button>
          </>
        )}

        {/* Step 2: 워크스페이스 정보 입력 (동일) */}
        {step === 'create-form' && (
          <>
            <h2
              className={`text-center ${theme.font.size.xl} font-extrabold ${theme.colors.text} mb-2`}
            >
              새로운 워크스페이스 생성
            </h2>
            <p className={`text-center mb-6 ${theme.font.size.sm} ${theme.colors.subText}`}>
              워크스페이스 정보를 입력하세요.
            </p>

            {error && (
              <div
                className={`${theme.colors.danger} text-center mb-4 ${theme.font.size.sm} border border-red-300 p-2 rounded-md bg-red-50`}
              >
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label
                  className={`block ${theme.font.size.sm} font-semibold ${theme.colors.text} mb-2`}
                >
                  워크스페이스 이름 *
                </label>
                <input
                  type="text"
                  placeholder="예: Orange Cloud 팀"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.colors.secondary} ${theme.font.size.sm} rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  className={`block ${theme.font.size.sm} font-semibold ${theme.colors.text} mb-2`}
                >
                  설명 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: Orange Cloud 프로젝트"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className={`w-full px-4 py-3 ${theme.colors.secondary} ${theme.font.size.sm} rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => resetCreateForm()}
                disabled={isLoading}
                className={`flex-1 ${theme.colors.secondary} text-gray-700 py-3 font-bold rounded-lg border-2 ${theme.colors.border} hover:bg-gray-100 transition disabled:opacity-50`}
              >
                ← 돌아가기
              </button>
              <button
                onClick={() => setStep('add-members')}
                disabled={isLoading || !newWorkspaceName.trim()}
                className={`flex-1 ${theme.colors.primary} text-white py-3 font-bold rounded-lg ${theme.colors.primaryHover} transition disabled:opacity-50`}
              >
                다음: 멤버 초대 →
              </button>
            </div>
          </>
        )}

        {/* Step 3: 멤버 초대 (동일) */}
        {step === 'add-members' && (
          <>
            <h2
              className={`${theme.font.size.xl} font-extrabold ${theme.colors.text} mb-2 text-center`}
            >
              멤버 초대 (선택사항)
            </h2>
            <p className={`text-center mb-6 ${theme.font.size.sm} ${theme.colors.subText}`}>
              초대할 멤버의 이메일을 입력하세요. 나중에 추가할 수도 있습니다.
            </p>

            {error && (
              <div
                className={`${theme.colors.danger} text-center mb-4 ${theme.font.size.sm} border border-red-300 p-2 rounded-md bg-red-50`}
              >
                {error}
              </div>
            )}

            {/* 이메일 입력 폼 */}
            <div className="mb-4 space-y-2 w-full">
              <div className="flex gap-2 w-full">
                <input
                  type="email"
                  placeholder="멤버 이메일"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                  className={`w-full px-4 py-3 ${theme.colors.secondary} ${theme.font.size.sm} rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                  disabled={isLoading}
                />
                <button
                  onClick={handleAddMember}
                  disabled={isLoading || !memberEmail.trim()}
                  className={`px-4 py-3 font-bold rounded-lg flex-shrink-0 transition ${
                    isLoading || !memberEmail.trim()
                      ? 'bg-blue-300 text-white cursor-not-allowed opacity-60'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {memberEmailError && (
                <p className={`${theme.font.size.xs} ${theme.colors.danger}`}>{memberEmailError}</p>
              )}
            </div>

            {/* 추가된 멤버 목록 (동일) */}
            {pendingMembers.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className={`${theme.font.size.sm} font-semibold ${theme.colors.text} mb-3`}>
                  초대 예정 멤버 ({pendingMembers.length}명)
                </p>
                <div className="space-y-2">
                  {pendingMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                    >
                      <span className={`${theme.font.size.sm} ${theme.colors.text}`}>
                        {member.email}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 (동일) */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('create-form')}
                disabled={isLoading}
                className={`flex-1 ${theme.colors.secondary} text-gray-700 py-3 font-bold rounded-lg border-2 ${theme.colors.border} hover:bg-gray-100 transition disabled:opacity-50`}
              >
                ← 이전
              </button>
              <button
                onClick={handleCreateWorkspaceWithMembers}
                disabled={isLoading || !newWorkspaceName.trim()}
                className={`flex-1 ${theme.colors.success} text-white py-3 font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50`}
              >
                {isLoading ? '생성 중...' : '워크스페이스 생성 완료'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 워크스페이스 관리 모달 */}
      {managingWorkspace && (
        <WorkspaceManagementModal
          workspaceId={managingWorkspace.workspaceId}
          workspaceName={managingWorkspace.workspaceName}
          onClose={() => setManagingWorkspace(null)}
        />
      )}
    </div>
  );
};

export default SelectWorkspacePage;
