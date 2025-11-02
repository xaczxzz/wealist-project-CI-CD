import React, { useState } from 'react';
import { X, Camera, MessageSquare } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserProfile } from '../../types';

interface UserProfileModalProps {
  user: UserProfile;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const { theme } = useTheme();
  // Mock User ID (실제 Firebase/DB에서 가져와야 함)
  const mockUserId = 'user-c4t9x-d2e8y-p6r0s';
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  // Mock: 구글 연동 상태 (실제는 인증 시스템에서 확인)
  const isGoogleConnected = true;

  // DM 버튼 클릭 핸들러 (Mock)
  const handleDmClick = () => {
    console.log(`[DM] ${user.name} 님에게 DM 보내기 요청`);
    // TODO: 실제 DM 기능(채팅 모듈) 구현 필요
    onClose();
  };

  // 저장 버튼 클릭 핸들러 (Mock)
  const handleSave = () => {
    console.log(`[저장] 사용자 정보 업데이트: ${name}, ${email}`);
    // TODO: 실제 API를 호출하여 사용자 정보(이름, 이메일) 업데이트 로직 구현
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div
          className={`relative ${theme.colors.card} ${theme.effects.borderWidth} ${theme.colors.border} p-6 ${theme.effects.borderRadius} shadow-xl`}
        >
          <div
            className={`flex items-center justify-between mb-6 pb-4 ${theme.effects.borderWidth} ${theme.colors.border} border-t-0 border-l-0 border-r-0`}
          >
            <h2 className={`${theme.font.size.base} font-bold text-gray-800`}>사용자 정보 수정</h2>
            <button
              onClick={onClose}
              className={`bg-red-500 ${theme.effects.cardBorderWidth} ${theme.colors.border} p-2 hover:bg-red-600 ${theme.effects.borderRadius} transition`}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="space-y-5">
            {/* 프로필 이미지 및 변경 버튼 */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div
                  className={`w-28 h-28 ${theme.colors.primary} ${theme.effects.borderWidth} ${theme.colors.border} flex items-center justify-center text-white text-4xl font-bold ${theme.effects.borderRadius} rounded-full`}
                >
                  {user.name[0]}
                </div>
                {/* 프로필 사진 변경 버튼 */}
                <button
                  className="absolute bottom-0 right-0 p-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full transition shadow-md"
                  title="프로필 사진 변경"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* DM 보내기 버튼 */}
              <button
                onClick={handleDmClick}
                className={`mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition shadow-md`}
              >
                <MessageSquare className="w-4 h-4" />
                DM 보내기
              </button>
            </div>

            {/* 사용자 ID (읽기 전용) */}
            <div>
              <label className={`block ${theme.font.size.xs} mb-2 text-gray-500 font-medium`}>
                사용자 ID :
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={mockUserId}
                className={`w-full px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded-md 
              read-only:bg-gray-100 read-only:text-gray-500 read-only:cursor-not-allowed focus:outline-none`}
              />
            </div>

            {/* 이름 수정 */}
            <div>
              <label className={`block ${theme.font.size.xs} mb-2 text-gray-500 font-medium`}>
                이름:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.card} ${theme.font.size.xs} ${theme.effects.borderRadius} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* 이메일 (Google 연동 표시) */}
            <div>
              <label className={`block ${theme.font.size.xs} mb-2 text-gray-500 font-medium`}>
                이메일:
              </label>
              <div className="relative">
                <input
                  disabled
                  type="email"
                  value={email}
                  readOnly
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded-md 
              read-only:bg-gray-100 read-only:text-gray-500 read-only:cursor-not-allowed focus:outline-none`}
                />
                {isGoogleConnected && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                    Google 연동
                  </span>
                )}
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className={`flex-1 ${theme.colors.primary} text-white py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.primaryHover} transition ${theme.font.size.xs} ${theme.effects.borderRadius} font-semibold`}
              >
                저장
              </button>
              <button
                onClick={onClose}
                className={`flex-1 bg-gray-300 py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} text-gray-800 hover:bg-gray-400 transition ${theme.font.size.xs} ${theme.effects.borderRadius} font-semibold`}
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
