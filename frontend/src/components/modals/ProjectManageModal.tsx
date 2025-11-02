import React, { useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, X, Search, UserCheck, Users, Briefcase, LayoutGrid } from 'lucide-react';

// 💡 새로운 인터페이스: 조직원 상세 (재활용성을 위해 확장)
interface MemberDetail {
  id: string;
  name: string;
  role: 'ORGANIZER' | 'OPERATOR' | 'VIEWER';
  isProjectMember?: boolean; // 프로젝트 모드일 때 해당 프로젝트에 속하는지 여부
  canBeManager?: boolean; // 워크스페이스 모드일 때 운영자 권한을 줄 수 있는지 여부
}

// 💡 새로운 인터페이스: 프로젝트 현황 상세 (워크스페이스 모드에서 일반 설정에 통합)
interface ProjectStatus {
  id: string;
  name: string;
  memberCount: number; // 프로젝트에 참여 중인 팀원 수
  taskCount: number; // 프로젝트 내 전체 태스크 수
  lastUpdated: string; // 최종 업데이트 시점
}

interface ProjectManageModalProps {
  // 💡 모드 추가: 프로젝트 멤버 관리인지, 워크스페이스 멤버 관리인지 구분
  mode: 'PROJECT' | 'WORKSPACE';
  // 💡 워크스페이스 이름 또는 프로젝트 이름
  targetName: string;
  // 현재 로그인한 사용자의 역할
  role: 'ORGANIZER' | 'OPERATOR' | 'VIEWER';
  onClose: () => void;
}

// 💡 Mock 데이터: 프로젝트 현황 리스트 (워크스페이스 모드에서 일반 설정에 통합)
const getMockProjectStatus = (): ProjectStatus[] => {
  return [
    {
      id: 'prj-1',
      name: 'Wealist 서비스 개발',
      memberCount: 4,
      taskCount: 22,
      lastUpdated: '2025-10-31',
    },
    {
      id: 'prj-2',
      name: 'Orange Cloud 디자인 시스템',
      memberCount: 2,
      taskCount: 15,
      lastUpdated: '2025-10-28',
    },
    {
      id: 'prj-3',
      name: '내부 인프라 구축 (EKS)',
      memberCount: 3,
      taskCount: 8,
      lastUpdated: '2025-11-01',
    },
    {
      id: 'prj-4',
      name: '마케팅 컨텐츠 기획',
      memberCount: 1,
      taskCount: 4,
      lastUpdated: '2025-10-15',
    },
    {
      id: 'prj-5',
      name: '신규 채용 프로세스',
      memberCount: 5,
      taskCount: 10,
      lastUpdated: '2025-11-02',
    },
    {
      id: 'prj-6',
      name: '백엔드 서비스 확장',
      memberCount: 3,
      taskCount: 30,
      lastUpdated: '2025-10-20',
    },
  ];
};

export const ProjectManageModal: React.FC<ProjectManageModalProps> = ({
  mode,
  targetName,
  role,
  onClose,
}) => {
  const { theme } = useTheme();
  const isWorkspaceMode = mode === 'WORKSPACE';
  const isManager = role === 'ORGANIZER' || role === 'OPERATOR';

  // 💡 탭 상태: GENERAL과 MEMBERSHIP 두 가지로만 유지
  const initialTab = 'GENERAL';
  const [activeTab, setActiveTab] = useState<'MEMBERSHIP' | 'GENERAL'>(initialTab);

  // 💡 Mock 데이터 상태
  const getMockMembers = (): MemberDetail[] => {
    if (isWorkspaceMode) {
      return [
        { id: 'user-1', name: '김조직장', role: 'ORGANIZER', canBeManager: true },
        { id: 'user-2', name: '박운영자', role: 'OPERATOR', canBeManager: true },
        { id: 'user-3', name: '이일반인', role: 'VIEWER', canBeManager: true },
        { id: 'user-4', name: '최초대필요', role: 'VIEWER', canBeManager: false },
      ];
    } else {
      return [
        { id: 'user-1', name: '김개발 (조직장)', role: 'ORGANIZER', isProjectMember: true },
        { id: 'user-2', name: '박보안 (운영자)', role: 'OPERATOR', isProjectMember: true },
        { id: 'user-3', name: '이디자인', role: 'VIEWER', isProjectMember: false },
        { id: 'user-4', name: '최데브옵스', role: 'VIEWER', isProjectMember: true },
      ];
    }
  };
  const [members, setMembers] = useState<MemberDetail[]>(getMockMembers());
  const [searchQuery, setSearchQuery] = useState('');

  // 💡 프로젝트 현황 상태는 useRef로 유지
  const projectStatus = useRef<ProjectStatus[]>(getMockProjectStatus());

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 역할 변경 및 팀원 추가/제거 로직 (변경 없음)
  const toggleRole = (memberId: string, currentRole: 'ORGANIZER' | 'OPERATOR' | 'VIEWER') => {
    if (role !== 'ORGANIZER') return;
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === memberId) {
          const newRole = currentRole === 'OPERATOR' ? 'VIEWER' : 'OPERATOR';
          console.log(`[Mock] ${member.name} 역할을 ${newRole}로 변경 요청`);
          return { ...member, role: newRole };
        }
        return member;
      }),
    );
  };
  const toggleProjectMembership = (memberId: string, currentStatus: boolean) => {
    if (!isManager) return;
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === memberId) {
          const newStatus = !currentStatus;
          console.log(
            `[Mock] ${member.name}을(를) 프로젝트 팀원에서 ${newStatus ? '추가' : '제거'} 요청`,
          );
          return { ...member, isProjectMember: newStatus };
        }
        return member;
      }),
    );
  };
  const getRoleLabel = (memberRole: 'ORGANIZER' | 'OPERATOR' | 'VIEWER') => {
    switch (memberRole) {
      case 'ORGANIZER':
        return { text: '조직장', color: 'bg-red-500 text-white font-semibold' };
      case 'OPERATOR':
        return { text: '운영자', color: 'bg-yellow-300 text-yellow-900 font-medium' };
      case 'VIEWER':
      default:
        return { text: '팀원', color: 'bg-blue-100 text-blue-700 font-medium' };
    }
  };

  // 💡 멤버 목록 렌더링 컴포넌트 (스크롤 영역 최적화)
  const MemberListContent = () => (
    <>
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        {isWorkspaceMode
          ? `전체 조직원 (${filteredMembers.length}명)`
          : `워크스페이스 멤버 (${filteredMembers.length}명)`}
      </h3>
      <div className="max-h-80 overflow-y-auto space-y-1 p-1 -m-1">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {member.name[0]}
                </div>

                {/* 이름 및 역할 */}
                <div>
                  <span className="text-sm font-medium text-gray-800">{member.name}</span>
                  <div className="flex items-center mt-0.5 space-x-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        getRoleLabel(member.role).color
                      }`}
                    >
                      {getRoleLabel(member.role).text}
                    </span>
                    {/* 프로젝트 모드일 때 참여 여부 표시 */}
                    {!isWorkspaceMode && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          member.isProjectMember
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.isProjectMember ? '프로젝트 참여 중' : '미참여'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 액션 버튼 영역 (운영자 설정 or 프로젝트 팀원 추가/제거) */}
              {isManager && (
                <div className="flex items-center gap-2">
                  {/* 💡 1. 워크스페이스 모드: 역할 설정 (조직장은 자기 자신 역할 변경 불가) */}
                  {isWorkspaceMode && member.role !== 'ORGANIZER' && (
                    <button
                      onClick={() => toggleRole(member.id, member.role)}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        member.role === 'OPERATOR'
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {member.role === 'OPERATOR' ? '팀원 지정' : '운영자 지정'}
                    </button>
                  )}

                  {/* 💡 2. 프로젝트 모드: 프로젝트 팀원 추가/제거 */}
                  {!isWorkspaceMode && (
                    <button
                      onClick={() =>
                        toggleProjectMembership(member.id, member.isProjectMember || false)
                      }
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        member.isProjectMember
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {member.isProjectMember ? '제거' : '추가'}
                    </button>
                  )}
                </div>
              )}

              {/* 비운영자/일반 조직원에게는 설정 아이콘만 표시 */}
              {!isManager && !isWorkspaceMode && member.isProjectMember && (
                <UserCheck className="w-5 h-5 text-green-500" />
              )}
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-gray-500">검색 결과가 없습니다.</p>
        )}
      </div>
    </>
  );

  // 💡 일반 설정 탭 내용 (통합 로직 반영 및 UI 정리)
  const GeneralSettingsContent = () => {
    // 프로젝트 모드일 때의 칸반 현황 Mock 데이터 (일반 설정 탭 내에서만 사용)
    const mockKanbanSummary = [
      { status: '백엔드 (Backend)', count: 4, color: 'bg-blue-500' },
      { status: '프론트엔드 (Frontend)', count: 3, color: 'bg-yellow-500' },
      { status: '인프라 (DevOps)', count: 1, color: 'bg-purple-500' },
      { status: '완료 (Done)', count: 22, color: 'bg-green-500' },
    ];

    return (
      <div className="space-y-6">
        {/* 1. 기본 정보 섹션 */}
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isWorkspaceMode ? '워크스페이스 이름' : '프로젝트 이름'}
          </label>
          <input
            type="text"
            defaultValue={targetName}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isWorkspaceMode ? '기본 URL' : '프로젝트 설명'}
          </label>
          <input
            type="text"
            defaultValue={isWorkspaceMode ? 'mock.wealist.com' : '칸반 보드를 위한 설정'}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* 2. 현황 정보 섹션 (모드별 구분) - 💡 섹션 구분을 위한 border-t 제거 */}
        {isWorkspaceMode ? (
          /* 워크스페이스 모드: 프로젝트 현황 목록 */
          <div className="pt-4">
            <h3 className="text-md font-bold text-gray-800 mb-3">
              <Briefcase className="w-5 h-5 inline mr-2 text-blue-500" />
              프로젝트 현황 (총 {projectStatus.current.length}개)
            </h3>
            <div className="max-h-80 overflow-y-auto space-y-3 p-1 -m-1">
              {' '}
              {/* 💡 max-h-80으로 확장 */}
              {projectStatus.current.map((project) => (
                <div
                  key={project.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{project.name}</h4>
                    <span className="text-xs text-gray-500">
                      {project.lastUpdated.slice(5)} 업데이트
                    </span>
                  </div>

                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-700 font-medium">팀원: {project.memberCount}명</span>
                    <span className="text-gray-700 font-medium">태스크: {project.taskCount}개</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 프로젝트 모드: 칸반 현황 (컬럼별 태스크 개수) */
          <div className="pt-4">
            <h3 className="text-md font-bold text-gray-800 mb-3">
              <LayoutGrid className="w-5 h-5 inline mr-2 text-blue-500" />
              현재 칸반 현황 (컬럼별 태스크 개수)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {mockKanbanSummary.map((summary, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{summary.status}</span>
                    <span
                      className={`text-xl font-bold text-white px-3 py-1 rounded-full ${summary.color}`}
                    >
                      {summary.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 저장 버튼 - 💡 저장 버튼 위에는 다시 구분선 추가 (이전에 반영됨) */}
        <div className="pt-6 border-t border-gray-200">
          <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
            {isWorkspaceMode ? '워크스페이스 저장' : '프로젝트 저장'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[90]"
      onClick={onClose}
    >
      {/* 💡 모달 크기: max-w-lg 유지 */}
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div
          className={`relative ${theme.colors.card} ${theme.effects.borderWidth} ${theme.colors.border} p-6 ${theme.effects.borderRadius} shadow-xl`}
        >
          {/* 💡 헤더/탭 구조 통합 및 제목 제거 (이전 요청사항 반영) */}
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 -mt-4 -mx-6 px-6 pt-4">
            {' '}
            {/* 탭/닫기 버튼 영역을 모달 상단에 붙임 */}
            <div className="flex">
              {/* 탭 버튼 */}
              <button
                onClick={() => setActiveTab('GENERAL')}
                className={`py-2 px-4 text-sm font-semibold transition ${
                  activeTab === 'GENERAL'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                일반 설정 &amp; 현황
              </button>
              <button
                onClick={() => setActiveTab('MEMBERSHIP')}
                className={`py-2 px-4 text-sm font-semibold transition ${
                  activeTab === 'MEMBERSHIP'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {isWorkspaceMode ? '조직원/역할 관리' : '회원 관리'}
              </button>
            </div>
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 💡 모달 본문 내용 (탭 구조 변경으로 인해 mb-4 제거) */}
          <div className="space-y-4">
            {' '}
            {/* 탭 하단 경계선과 본문 사이 간격 조정 */}
            {/* 일반 설정 및 현황 탭 내용 */}
            {activeTab === 'GENERAL' && <GeneralSettingsContent />}
            {/* 멤버십 탭 (워크스페이스 조직원 관리, 프로젝트 팀원 관리) */}
            {activeTab === 'MEMBERSHIP' && (
              <div className="space-y-4">
                {/* 검색 및 초대/추가 버튼은 MEMBERSHIP 탭에서만 보이도록 유지 */}
                {isManager && (
                  <div className="flex gap-3">
                    {/* 검색 필드 */}
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`${isWorkspaceMode ? '조직원' : '팀원'} 검색...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* 초대/추가 버튼 */}
                    <button
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition shadow-md ${
                        isManager
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-300 text-gray-700 cursor-default'
                      }`}
                      disabled={!isManager}
                    >
                      <Plus className="w-4 h-4" />
                      {isWorkspaceMode ? '조직원 초대' : '팀원 추가'}
                    </button>
                  </div>
                )}

                {/* 멤버 목록 */}
                <MemberListContent />

                {/* 비운영자/비관리자가 프로젝트 모드일 때의 메시지 */}
                {!isManager && !isWorkspaceMode && (
                  <p className="text-sm text-gray-500 mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <Users className="w-4 h-4 inline mr-1 text-blue-500" />
                    비운영자는 팀원 목록만 확인할 수 있습니다. 팀원 추가/제거 권한은 운영자에게
                    있습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
