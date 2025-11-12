/**
 * 사용자 프로필 모달 컴포넌트
 *
 * [최종 로직 목표]
 * 1. 초기 로드 시: GET /api/workspaces/all (워크스페이스 목록) + GET /api/profiles/all/me (모든 프로필)을 호출.
 * 2. 탭 선택 시: 로컬 상태(allProfiles)에서 기본 프로필(workspaceId=null)과 선택된 워크스페이스 프로필을 필터링하여 표시.
 * 3. 저장 시:
 * - 기본 프로필: PUT /api/profiles/me 호출 (닉네임/이미지 업데이트).
 * - 워크스페이스 프로필: 새 명세에 PUT 엔드포인트가 없으므로, 현재는 Mock 처리된 API를 호출하도록 유지합니다. (실제 백엔드 구현 필요)
 */

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  updateMyProfile, // 기본 프로필 업데이트
  getAllMyProfiles, // 💡 [핵심] 모든 프로필을 가져오는 신규 API
  getMyWorkspaces, // 워크스페이스 목록 조회
  // ⚠️ [제거] getWorkspaceProfile, updateWorkspaceProfile 함수는 더 이상 사용하지 않음 (로컬 필터링으로 대체)
} from '../../api/user/userService';
import { UserProfileResponse, WorkspaceResponse, UpdateProfileRequest } from '../../types/user';

interface UserProfileModalProps {
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const { theme } = useTheme();
  // token은 인증 상태 확인용으로만 유지됩니다.
  const { token } = useAuth();

  // ========================================
  // 상태 관리
  // ========================================

  const [activeTab, setActiveTab] = useState<'default' | 'workspace'>('default');

  // 💡 [핵심] 모든 프로필 데이터를 저장 (API 로직 변경 반영)
  const [allProfiles, setAllProfiles] = useState<UserProfileResponse[]>([]);

  // 워크스페이스 목록
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

  // 파일 입력 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 현재 수정 중인 닉네임 입력 필드 상태
  const [defaultNickName, setDefaultNickName] = useState('');
  const [workspaceNickName, setWorkspaceNickName] = useState('');

  // 프로필 이미지 미리보기 URL
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // 프로필 데이터 필터링 및 계산된 상태
  // ========================================

  // 기본 프로필
  const defaultProfile = allProfiles.find((p) => p.workspaceId === null) || null;

  // 선택된 워크스페이스 프로필
  const currentWorkspaceProfile =
    allProfiles.find((p) => p.workspaceId === selectedWorkspaceId) || null;

  // 현재 활성 탭의 프로필 및 입력 상태 결정
  const currentProfile =
    activeTab === 'default' ? defaultProfile : currentWorkspaceProfile || defaultProfile;

  const currentNickName = activeTab === 'default' ? defaultNickName : workspaceNickName;
  const setCurrentNickName = activeTab === 'default' ? setDefaultNickName : setWorkspaceNickName;

  // ========================================
  // 초기 데이터 로드
  // ========================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 💡 [수정] 모든 프로필과 워크스페이스 목록 동시 로드
        const [allProfs, workspaceList] = await Promise.all([
          getAllMyProfiles(), // GET /api/profiles/all/me
          getMyWorkspaces(), // GET /api/workspaces/all
        ]);

        setAllProfiles(allProfs);

        const initialDefaultProfile = allProfs.find((p) => p.workspaceId === null);
        if (initialDefaultProfile) {
          setDefaultNickName(initialDefaultProfile.nickName);
        }

        setWorkspaces(workspaceList);
        if (workspaceList.length > 0) {
          setSelectedWorkspaceId(workspaceList[0].workspaceId);
        }
      } catch (err) {
        console.error('[Initial Data Load Error]', err);
        setError('프로필 정보를 불러오는데 실패했습니다. (세션 만료 가능성)');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 💡 [추가] 워크스페이스 변경 시 닉네임 입력 필드 상태 업데이트
  useEffect(() => {
    if (activeTab === 'workspace') {
      const workspace = workspaces.find((ws) => ws.workspaceId === selectedWorkspaceId);

      if (currentWorkspaceProfile) {
        // 1. 이미 존재하는 워크스페이스 프로필이 있다면 로드
        setWorkspaceNickName(currentWorkspaceProfile.nickName);
      } else if (defaultProfile) {
        // 2. 프로필이 없다면: 기본 프로필 + 워크스페이스명으로 초기 닉네임 제안
        setWorkspaceNickName(
          `${defaultProfile.nickName} (${workspace?.workspaceName || '새 조직'})`,
        );
      } else {
        setWorkspaceNickName('');
      }
    }
  }, [selectedWorkspaceId, activeTab, currentWorkspaceProfile, defaultProfile, workspaces]);

  // ========================================
  // 이미지 업로드 핸들러 (변경 없음)
  // ========================================

  const handleAvatarChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(URL.createObjectURL(file));
      console.log(`[File] 새 프로필 사진 선택: ${file.name}`);
    }
  };

  // ========================================
  // 워크스페이스 변경 핸들러 (변경 없음)
  // ========================================

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setAvatarPreviewUrl(null); // 워크스페이스 변경 시 미리보기 초기화
  };

  // ========================================
  // 저장 핸들러
  // ========================================

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentNickName.trim()) {
        setError('닉네임은 필수입니다.');
        setLoading(false);
        return;
      }

      // 이미지 URL은 미리보기 URL이 있으면 사용하고, 없으면 기존 프로필 URL을 사용합니다.
      const profileImageUpdate = avatarPreviewUrl || currentProfile?.profileImageUrl || undefined;

      const data: UpdateProfileRequest = {
        nickName: currentNickName,
        profileImageUrl: profileImageUpdate,
      };

      if (activeTab === 'default') {
        const updatedProfile = await updateMyProfile(data);

        // 로컬 상태 업데이트
        setAllProfiles((prev) => {
          const index = prev.findIndex((p) => p.workspaceId === null);
          if (index !== -1) {
            const newProfiles = [...prev];
            newProfiles[index] = updatedProfile;
            return newProfiles;
          }
          return [...prev, updatedProfile];
        });
        alert('기본 프로필이 저장되었습니다.');
      } else {
        // 2. 워크스페이스 프로필 저장 (API 명세 부재로 Mock 처리)
        // ⚠️ [수정 필요] 실제 백엔드가 PUT /api/profiles/workspace/{workspaceId}를 다시 지원하거나,
        //    다른 방식으로 워크스페이스 프로필 업데이트 API를 구현해야 합니다.

        // 현재는 userService의 Mock 함수를 호출하여 로컬 상태만 업데이트합니다.
        const updatedProfile = await updateMyProfile(data);

        // 로컬 상태 업데이트
        setAllProfiles((prev) => {
          const index = prev.findIndex((p) => p.workspaceId === selectedWorkspaceId);
          if (index !== -1) {
            const newProfiles = [...prev];
            newProfiles[index] = updatedProfile;
            return newProfiles;
          }
          return [...prev, updatedProfile];
        });

        const workspaceName_display = workspaces.find(
          (ws) => ws.workspaceId === selectedWorkspaceId,
        )?.workspaceName;
        alert(`${workspaceName_display} 프로필이 저장되었습니다. (⚠️ 실제 API 미구현)`);
      }

      setAvatarPreviewUrl(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.error('[Profile Save Error]', errorMsg);
      setError('프로필 저장에 실패했습니다. (API 서버 또는 권한 문제)');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 모달 닫기 핸들러 (변경 없음)
  // ========================================

  const handleClose = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    onClose();
  };

  // ========================================
  // 렌더링
  // ========================================

  if (!defaultProfile && loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!defaultProfile && !loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-700 font-semibold mb-4">프로필 로드 실패</p>
          <p className="text-sm text-gray-700">기본 프로필 정보를 찾을 수 없습니다.</p>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div
          className={`relative ${theme.colors.card} ${theme.effects.borderWidth} ${theme.colors.border} ${theme.effects.borderRadius} shadow-xl`}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 pb-3">
            <h2 className={`${theme.font.size.base} font-bold text-gray-800`}>
              사용자 프로필 설정
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="닫기"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('default')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'default' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              기본 프로필
              {activeTab === 'default' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'workspace' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              워크스페이스별 프로필
              {activeTab === 'workspace' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6 space-y-5">
            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* 워크스페이스 선택 */}
            <div className={activeTab === 'default' ? 'hidden' : ''}>
              <label className={`block ${theme.font.size.xs} mb-2 text-gray-500 font-medium`}>
                워크스페이스 선택:
              </label>
              <select
                value={selectedWorkspaceId}
                onChange={(e) => handleWorkspaceChange(e.target.value)}
                className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.card} ${theme.font.size.xs} ${theme.effects.borderRadius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.workspaceId} value={workspace.workspaceId}>
                    {workspace.workspaceName}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                워크스페이스마다 다른 프로필을 설정할 수 있습니다
              </p>
            </div>
            {/* 기본 탭일 때 높이 유지를 위한 공간 */}
            {activeTab === 'default' && <div style={{ height: '70px' }} className="w-full"></div>}

            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                {avatarPreviewUrl ? (
                  <img
                    src={avatarPreviewUrl}
                    alt="프로필 미리보기"
                    className="w-24 h-24 object-cover border-2 border-gray-300 rounded-full"
                  />
                ) : currentProfile?.profileImageUrl ? (
                  <img
                    src={currentProfile.profileImageUrl}
                    alt="프로필 이미지"
                    className="w-24 h-24 object-cover border-2 border-gray-300 rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-500 border-2 border-gray-300 flex items-center justify-center text-white text-3xl font-bold rounded-full">
                    {currentNickName[0] || 'U'}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  onClick={handleAvatarChangeClick}
                  className="absolute bottom-0 right-0 p-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full transition shadow-md"
                  title="프로필 사진 변경"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 닉네임 */}
            <div>
              <label className={`block ${theme.font.size.xs} mb-2 text-gray-500 font-medium`}>
                닉네임:
              </label>
              <input
                type="text"
                value={currentNickName}
                onChange={(e) => setCurrentNickName(e.target.value)}
                className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.card} ${theme.font.size.xs} ${theme.effects.borderRadius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="닉네임을 입력하세요"
              />
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 ${theme.colors.primary} text-white py-3 ${
                  theme.effects.borderRadius
                } font-semibold transition ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
