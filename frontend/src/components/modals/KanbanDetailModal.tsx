// KanbanDetailModal.tsx의 코드를 KanbanDetailModal로 변경하여 아래와 같이 확장합니다.

import React, { useState } from 'react';
import { X, Calendar, Tag, Plus, Settings } from 'lucide-react'; // Plus, Settings 아이콘 추가
import { useTheme } from '../../contexts/ThemeContext';
import { CustomFieldModal } from './CustomFieldModal'; // 새로 만든 모달 임포트
import { Kanban, KanbanWithCustomFields } from '../../types/kanban';

// 💡 CustomField 관련 인터페이스는 이 파일 상단 또는 별도 파일에 정의되었다고 가정
interface CustomFieldOption {
  value: string;
  isDefault: boolean;
}
interface CustomField {
  id: string;
  name: string;
  type: 'TEXT' | 'SELECT' | 'NUMBER' | 'DATE' | 'PERSON';
  options?: CustomFieldOption[];
  allowMultipleSections?: boolean;
  defaultValue?: string | number | string[];
}

interface KanbanDetailModalProps {
  kanban: KanbanWithCustomFields; // 확장된 Kanban 타입을 사용
  onClose: () => void;
}

const KanbanDetailModal: React.FC<KanbanDetailModalProps> = ({ kanban, onClose }) => {
  const { theme } = useTheme();

  const isCreating = kanban.id === '';

  // 💡 Mock: 사용자 정의 필드 목록 상태
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: 'cf-status',
      name: '커스텀 진행단계',
      type: 'SELECT',
      options: [
        { value: 'TO DO', isDefault: true },
        { value: 'IN PROGRESS', isDefault: false },
        { value: 'QA', isDefault: false },
      ],
      allowMultipleSections: false,
    },
    {
      id: 'cf-role',
      name: '관련 역할',
      type: 'SELECT',
      options: [
        { value: '프론트엔드', isDefault: true },
        { value: '백엔드', isDefault: false },
      ],
      allowMultipleSections: true,
    },
    { id: 'cf-sprint', name: '스프린트 번호', type: 'NUMBER' },
    { id: 'cf-review', name: '리뷰어', type: 'PERSON' },
  ]);

  const [currentKanban, setCurrentKanban] = useState<KanbanWithCustomFields>({
    ...kanban,
    customFieldValues: kanban.customFieldValues || {},
    // 필수 필드에 대한 Mock 값 설정 (Kanban Detail Modal의 초기화 로직은 그대로 사용)
    title: kanban.title,
    assignee: kanban.assignee,
    assignee_id: kanban.assignee_id,
    status: kanban.status,
    dueDate: kanban.dueDate || '',
    priority: kanban.priority || 'MEDIUM',
    description: kanban.description || '',
  });

  //   const [comments, setComments] = useState(/* ... 댓글 Mock 데이터 그대로 사용 ... */);
  //   const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 💡 CustomFieldModal 상태
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);

  // ... (priorityMap, statusColorMap, handleAddComment, handleSave, handleDelete 로직은 KanbanDetailModal과 동일) ...

  const handleFieldChange = (field: keyof Kanban, value: string) => {
    setCurrentKanban((prev) => ({ ...prev, [field]: value }));
  };

  // 💡 Custom Field 값 변경 핸들러
  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCurrentKanban((prev) => ({
      ...prev,
      customFieldValues: {
        ...prev.customFieldValues,
        [fieldId]: value,
      },
    }));
  };

  // 💡 Custom Field 저장 핸들러
  const handleSaveCustomField = (newField: CustomField) => {
    setCustomFields((prev) => {
      // 이미 존재하는 필드인지 확인하여 수정 또는 추가
      const existingIndex = prev.findIndex((f) => f.id === newField.id);
      if (existingIndex > -1) {
        return prev.map((f, i) => (i === existingIndex ? newField : f));
      }
      return [...prev, newField];
    });
  };

  const priorityMap: { [key: string]: string } = { HIGH: '높음', MEDIUM: '보통', LOW: '낮음' };
  //   const statusColorMap: { [key: string]: string } = {
  //     BACKEND: 'bg-blue-600',
  //     FRONTEND: 'bg-yellow-600',
  //     DEVOPS: 'bg-purple-600',
  //     DONE: 'bg-green-600',
  //     HIGH: 'bg-red-500',
  //     MEDIUM: 'bg-orange-500',
  //     LOW: 'bg-gray-500',
  //   };

  // ... (handleAddComment, handleSave, handleDelete 등) ...

  //   const handleAddComment = () => {
  //     if (newComment.trim()) {
  //       const authorName = currentKanban.assignee || '사용자 본인';
  //       setComments([
  //         ...comments,
  //         {
  //           id: comments.length + 1,
  //           author: authorName,
  //           content: newComment,
  //           timestamp: '방금 전',
  //         },
  //       ]);
  //       setNewComment('');
  //     }
  //   };

  const handleSave = () => {
    if (!currentKanban.title.trim()) {
      alert('제목은 필수입니다.');
      return;
    }

    setIsLoading(true);

    // 🚧 [Mock API 호출]
    setTimeout(() => {
      alert(
        isCreating
          ? `[Mock] 태스크 '${currentKanban.title}' 생성 완료! (컬럼: ${currentKanban.status})`
          : `[Mock] 태스크 '${currentKanban.title}' 수정 완료!`,
      );
      // onSave(currentKanban); // 부모 컴포넌트에 최종 데이터 전달 (추후 구현)
      setIsLoading(false);
      onClose();
    }, 800);
  };

  const handleDelete = () => {
    if (window.confirm(`정말로 태스크 "${currentKanban.title}"을(를) 삭제하시겠습니까?`)) {
      alert(`[Mock] 태스크 삭제 처리 완료.`);
      onClose();
    }
  };

  // 💡 Custom Field 렌더링 함수
  const renderCustomField = (field: CustomField) => {
    const currentValue = currentKanban.customFieldValues?.[field.id] || field.defaultValue || '';

    // 다중 선택 값을 쉼표로 분리하여 표시 (SELECT + allowMultipleSections)
    const displayValue = Array.isArray(currentValue) ? currentValue.join(', ') : currentValue;

    // 💡 입력/선택 필드 렌더링 로직
    const inputField = () => {
      switch (field.type) {
        case 'TEXT':
          return (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 border bg-gray-50 text-sm rounded focus:ring-2 focus:ring-blue-500`}
            />
          );
        case 'NUMBER':
          return (
            <input
              type="number"
              value={displayValue}
              onChange={(e) => handleCustomFieldChange(field.id, Number(e.target.value))}
              className={`w-full px-3 py-2 border bg-gray-50 text-sm rounded focus:ring-2 focus:ring-blue-500`}
            />
          );
        case 'DATE':
          return (
            <input
              type="date"
              value={displayValue}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 border bg-gray-50 text-sm rounded focus:ring-2 focus:ring-blue-500`}
            />
          );
        case 'PERSON':
          return (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              placeholder="담당자 이름 검색..."
              className={`w-full px-3 py-2 border bg-gray-50 text-sm rounded focus:ring-2 focus:ring-blue-500`}
            />
          );
        case 'SELECT':
          if (field.allowMultipleSections) {
            // 다중 선택 (Mock: 텍스트 입력 후 쉼표로 분리)
            return (
              <input
                type="text"
                value={displayValue}
                onChange={(e) =>
                  handleCustomFieldChange(
                    field.id,
                    e.target.value.split(',').map((v) => v.trim()),
                  )
                }
                placeholder="값들을 쉼표(,)로 구분하여 입력"
                className={`w-full px-3 py-2 border bg-gray-50 text-sm rounded focus:ring-2 focus:ring-blue-500`}
              />
            );
          }
          return (
            <select
              value={displayValue}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 border bg-gray-50 text-sm rounded focus:ring-2 focus:ring-blue-500`}
            >
              <option value="" disabled>
                선택하세요
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value} {opt.isDefault ? '(기본)' : ''}
                </option>
              ))}
            </select>
          );
        default:
          return null;
      }
    };

    return (
      <div key={field.id}>
        <label className={`${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold block`}>
          {field.name || field.type}
        </label>
        <div className="flex items-center gap-2">
          {inputField()}
          <button
            onClick={() => setShowCustomFieldModal(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition"
            title="필드 설정/수정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <div className="relative w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
          <div
            className={`relative ${theme.colors.card} ${theme.effects.borderWidth} ${theme.colors.border} p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${theme.effects.borderRadius} shadow-xl`}
          >
            <div className={`flex items-start justify-between mb-4 pb-4 border-b border-gray-200`}>
              <div className="flex-1 pr-4">
                {/* 💡 제목 입력 필드 */}
                <input
                  type="text"
                  value={currentKanban.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder={isCreating ? '새 태스크 제목을 입력하세요 (필수)' : '제목'}
                  className={`w-full ${
                    theme.font.size.base
                  } font-bold mb-2 break-words focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isCreating ? 'border-b-2 border-blue-200' : 'bg-transparent'
                  }`}
                  disabled={isLoading}
                />

                {/* 💡 담당자 정보 (작성자) */}
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className={`w-8 h-8 ${theme.colors.primary} ${theme.effects.cardBorderWidth} ${theme.colors.border} flex items-center justify-center text-white ${theme.font.size.xs} font-bold ${theme.effects.borderRadius}`}
                  >
                    {currentKanban.assignee ? currentKanban.assignee[0] : '?'}
                  </div>
                  <input
                    type="text"
                    value={currentKanban.assignee || ''}
                    onChange={(e) => handleFieldChange('assignee', e.target.value)}
                    placeholder="작성자 지정"
                    className={`${theme.font.size.sm} border-b border-gray-300 focus:outline-none focus:border-blue-500`}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                onClick={onClose}
                className={`bg-red-500 ${theme.effects.cardBorderWidth} ${theme.colors.border} p-2 hover:bg-red-600 flex-shrink-0 ${theme.effects.borderRadius} transition`}
                disabled={isLoading}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* --- 상세 정보 섹션 --- */}
            <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
              {/* 💡 기본 필수 필드 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 마감일 */}
                <div>
                  <label
                    className={`flex items-center gap-2 ${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold`}
                  >
                    <Calendar className="w-4 h-4" />
                    마감일 :
                  </label>
                  <input
                    type="date"
                    value={currentKanban.dueDate}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                    className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} bg-gray-50 ${theme.font.size.sm} ${theme.effects.borderRadius} font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isLoading}
                  />
                </div>

                {/* 중요도 (기본값 없음 - 선택 필드) */}
                <div>
                  <label
                    className={`flex items-center gap-2 ${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold`}
                  >
                    <Tag className="w-4 h-4" />
                    중요도 (우선 순위) :
                  </label>
                  <select
                    value={currentKanban.priority}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} bg-gray-50 ${theme.font.size.sm} ${theme.effects.borderRadius} font-bold focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      선택 사항
                    </option>
                    {Object.keys(priorityMap).map((key) => (
                      <option key={key} value={key}>
                        {priorityMap[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 💡 커스텀 필드 렌더링 영역 */}
              <div className="grid grid-cols-2 gap-4">{customFields.map(renderCustomField)}</div>

              {/* 💡 새 필드 추가 버튼 */}
              <button
                onClick={() => setShowCustomFieldModal(true)}
                className="w-full text-blue-600 hover:text-blue-800 text-sm font-semibold border-dashed border-2 border-blue-200 hover:border-blue-400 p-2 rounded-lg mt-2 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> 사용자 정의 필드 추가
              </button>

              {/* 💡 상세 설명 (Description) */}
              <div>
                <label
                  className={`${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold block`}
                >
                  상세 내용:
                </label>
                <textarea
                  value={currentKanban.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="상세 내용 및 목표를 입력하세요."
                  className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} bg-gray-50 ${theme.font.size.sm} min-h-24 ${theme.effects.borderRadius} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* --- 댓글 섹션 (생성 모드에서는 댓글 비활성화) --- */}
            {/* ... (댓글 섹션은 KanbanDetailModal과 동일하게 유지) ... */}

            {/* --- 액션 버튼 --- */}
            <div className={`flex gap-3 mt-6 pt-4 border-t border-gray-300`}>
              <button
                onClick={handleSave}
                disabled={isLoading || !currentKanban.title.trim()}
                className={`flex-1 ${theme.colors.primary} text-white py-3 font-bold ${theme.colors.primaryHover} transition ${theme.font.size.sm} ${theme.effects.borderRadius} disabled:opacity-50`}
              >
                {isLoading ? '처리 중...' : isCreating ? '태스크 생성' : '태스크 수정 및 저장'}
              </button>

              {!isCreating && (
                <button
                  onClick={handleDelete}
                  className={`bg-red-500 text-white px-4 py-3 font-bold hover:bg-red-600 transition ${theme.font.size.sm} ${theme.effects.borderRadius} disabled:opacity-50`}
                  disabled={isLoading}
                >
                  태스크 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 💡 CustomFieldModal 렌더링 */}
      {showCustomFieldModal && (
        <CustomFieldModal
          onSave={handleSaveCustomField}
          onClose={() => setShowCustomFieldModal(false)}
        />
      )}
    </>
  );
};

export default KanbanDetailModal;
