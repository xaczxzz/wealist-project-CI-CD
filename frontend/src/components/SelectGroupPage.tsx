import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
// 💡 실제 API 대신 Mock 함수를 사용합니다.
import { GroupResponse } from '../api/userService';

interface SelectGroupPageProps {
  userId: string;
  accessToken: string;
  onGroupSelected: (groupId: string) => void;
}

// 🚧 Mock 데이터 정의 (조직 검색을 위한 더미 데이터)
const MOCK_GROUPS: GroupResponse[] = [
  { groupId: '1111-a', name: 'Wealist Dev Team (Mock)', companyName: 'Wealist Inc.' },
  { groupId: '2222-b', name: 'Orange Cloud Design (Mock)', companyName: 'KT Cloud' },
  { groupId: '3333-c', name: 'Project Kanban Alpha (Mock)', companyName: 'Self-Employed' },
  { groupId: '4444-d', name: 'Data Engineer Study (Mock)', companyName: 'Personal' },
];

const SelectGroupPage: React.FC<SelectGroupPageProps> = ({
  // userId,
  accessToken,
  onGroupSelected,
}) => {
  const { theme } = useTheme();

  const [groups, setGroups] = useState<GroupResponse[] | null>(null);
  const [filteredGroups, setFilteredGroups] = useState<GroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 💡 조직 선택 화면이 기본입니다.
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. 그룹 목록 조회 및 초기화 (MOCK 처리)
  useEffect(() => {
    const mockFetchGroups = () => {
      setIsLoading(true);
      setError(null);

      setTimeout(() => {
        // 🚧 [Mock] 미리 정의된 조직 목록을 반환합니다.
        setGroups(MOCK_GROUPS);
        setIsLoading(false);
      }, 500);
    };

    mockFetchGroups();

    // 이펙트 클린업 (선택적)
    return () => {
      setError(null);
    };
  }, [accessToken]);

  // 2. 조직 검색 필터링 로직
  useEffect(() => {
    if (groups) {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      if (!lowerCaseQuery) {
        // 검색어가 없으면 목록을 비웁니다.
        setFilteredGroups([]);
        return;
      }

      // 이름, 회사 이름, ID로 필터링합니다.
      const results = groups.filter(
        (group) =>
          group.name.toLowerCase().includes(lowerCaseQuery) ||
          group.companyName.toLowerCase().includes(lowerCaseQuery),
      );
      setFilteredGroups(results);
    }
  }, [searchQuery, groups]);

  // 3. 새로운 그룹 생성 및 등록 핸들러 (MOCK)
  const handleCreateAndSelectGroup = async () => {
    if (!newGroupName.trim()) {
      setError('그룹 이름을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const newGroupId = 'mock-new-group-' + Math.random().toString(36).substring(2, 9);
      alert(`[Mock] 조직 '${newGroupName}' 생성 완료!`);
      setIsLoading(false);
      onGroupSelected(newGroupId);
    }, 1500);
  };

  // 4. 기존 그룹 선택 핸들러 (MOCK)
  const handleSelectExistingGroup = async (group: GroupResponse) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      // 🚀 최종 핸들러 호출 -> Workspace 생성 단계로 이동
      onGroupSelected(group.groupId);
    }, 500);
  };

  // --- 렌더링 시작 ---

  if (isLoading || groups === null) {
    return (
      <div
        className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-4`}
      >
        <div className="p-8">
          <p className={`${theme.font.size.lg} ${theme.colors.text}`}>조직 정보를 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-4`}>
      <div
        className={`${theme.colors.card} ${theme.effects.borderRadius} p-6 sm:p-8 w-full max-w-lg relative z-10 shadow-xl ${theme.effects.cardBorderWidth} ${theme.colors.border}`}
      >
        <h2
          className={`${theme.font.size.xl} font-extrabold ${theme.colors.text} mb-2 text-center`}
        >
          {isCreatingNewGroup ? '새로운 조직 만들기 🏗️' : '워크스페이스 조직 선택'}
        </h2>

        {/* 💡 디자인 개선: 문구를 굵게, 서브 텍스트 활용 */}
        <p className={`text-center mb-6 ${theme.font.size.sm}`}>
          <span className={`${theme.colors.text} font-bold mr-1`}>소속된 조직에 참여하거나,</span>
          <span className={`${theme.colors.subText}`}>새 조직을 생성하여 시작해 보세요.</span>
        </p>

        {error && (
          <p
            className={`${theme.colors.danger} text-center mb-4 ${theme.font.size.sm} border border-red-300 p-2 rounded-md bg-red-50`}
          >
            {error}
          </p>
        )}

        {isCreatingNewGroup ? (
          /* ------------------- 조직 생성 폼 ------------------- */
          <div className="space-y-4">
            <input
              type="text"
              placeholder="그룹 이름 (예: Orange Cloud 개발팀)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className={`w-full px-4 py-3 ${theme.colors.secondary} ${theme.font.size.sm} rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="회사 이름 (선택 사항)"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              className={`w-full px-4 py-3 ${theme.colors.secondary} ${theme.font.size.sm} rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
              disabled={isLoading}
            />
            <button
              onClick={handleCreateAndSelectGroup}
              disabled={isLoading || !newGroupName.trim()}
              className={`w-full ${theme.colors.success} text-white py-3 font-bold rounded-lg ${theme.colors.successHover} transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
              {isLoading ? '생성 및 등록 중...' : '새 조직 생성 및 시작 (Mock)'}
            </button>

            <button
              onClick={() => setIsCreatingNewGroup(false)}
              className={`w-full ${theme.colors.info} py-2 mt-2 hover:text-blue-700 underline ${theme.font.size.sm}`}
              disabled={isLoading}
            >
              &larr; 돌아가서 기존 조직 검색하기
            </button>
          </div>
        ) : (
          /* ------------------- 조직 검색/선택 UI ------------------- */
          <div className="space-y-4">
            {/* 1. 검색 입력 필드 및 Mock 표시 */}
            <div className="relative">
              <input
                type="text"
                placeholder="조직 이름으로 검색 (Mock 활성화)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 pl-10 py-3 ${theme.colors.secondary} ${theme.font.size.sm} rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                disabled={isLoading}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            {/* 2. 필터링된 조직 목록 (Mock Select Box 역할) */}
            <div className={`relative ${searchQuery.trim() ? '' : 'hidden'}`}>
              <div
                className={`absolute z-10 w-full bg-white border ${theme.colors.border} ${theme.effects.borderRadius} shadow-lg max-h-60 overflow-y-auto`}
              >
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <button
                      key={group.groupId}
                      onClick={() => handleSelectExistingGroup(group)}
                      className={`w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 ${theme.colors.text} ${theme.font.size.sm} transition flex justify-between items-center`}
                      disabled={isLoading}
                    >
                      <div>
                        <span className="font-semibold">{group.name}</span>
                        <p className={`${theme.colors.subText} ${theme.font.size.xs}`}>
                          {group.companyName}
                        </p>
                      </div>
                      <span
                        className={`${theme.colors.subText} ${theme.font.size.xs} px-2 py-1 bg-gray-100 rounded`}
                      >
                        선택
                      </span>
                    </button>
                  ))
                ) : (
                  <p className={`p-3 text-center ${theme.colors.subText}`}>
                    {searchQuery.trim()
                      ? '검색 결과가 없습니다.'
                      : '조직 이름을 입력하여 검색하세요.'}
                  </p>
                )}
              </div>
            </div>

            {/* 3. + 새 조직 생성하기 버튼 (강조) */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className={`text-center mb-3 ${theme.colors.subText} ${theme.font.size.sm}`}>
                찾는 조직이 없으신가요?
              </p>
              <button
                onClick={() => setIsCreatingNewGroup(true)}
                className={`w-full ${theme.colors.primary} text-white py-3 font-bold rounded-lg ${theme.colors.primaryHover} transition disabled:opacity-50 shadow-lg`}
                disabled={isLoading}
              >
                <span className="text-xl mr-2">+</span> 새 조직 생성하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectGroupPage;
