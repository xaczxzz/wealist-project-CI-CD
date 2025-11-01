import React, { useState } from 'react';
import { X, Calendar, Tag, MessageSquare, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Task } from '../../types';
// 💡 Task 타입은 MainDashboard와 동일하게 사용

// 💡 댓글 타입 정의
interface TaskComment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

// 💡 Props 단순화: Task 객체 하나만 받고, 생성 모드일 경우 빈 객체를 받습니다.
interface TaskDetailModalProps {
  task: Task; // 💡 MainDashboard에서 넘겨주는 Task 객체 (생성 시 불완전한 Mock 객체)
  onClose: () => void;
  // onSave?: (data: Task) => void; // TODO: 저장 핸들러
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task, // 💡 이제 task는 항상 존재합니다 (생성 시에는 불완전한 Mock 객체)
  onClose,
}) => {
  const { theme } = useTheme();

  // 💡 모드 판단: task.id가 비어있으면 생성 모드로 판단합니다.
  const isCreating = task.id === '';

  // 💡 상태 초기화: 전달받은 task 객체를 기반으로 현재 상태를 설정합니다.
  const initialTask: Task = {
    id: task.id,
    title: task.title,
    assignee: task.assignee,
    assignee_id: task.assignee_id,
    status: task.status,
    dueDate: task.dueDate || '',
    priority: task.priority || 'MEDIUM',
    description: task.description || '',
  };

  const [currentTask, setCurrentTask] = useState<Task>(initialTask);
  const [comments, setComments] = useState<TaskComment[]>(
    isCreating
      ? []
      : [
          {
            id: 1,
            author: '김개발',
            content: '백엔드 API 설계 리뷰 완료했습니다. 👍',
            timestamp: '2시간 전',
          },
          {
            id: 2,
            author: '최데브옵스',
            content: 'K8s 환경에서 배포 테스트가 필요합니다.',
            timestamp: '1시간 전',
          },
        ],
  );
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 💡 목표일과 우선순위에 대한 Mock 데이터 및 상태 매핑 (한글화)
  const priorityMap: { [key: string]: string } = { HIGH: '높음', MEDIUM: '보통', LOW: '낮음' };
  const statusColorMap: { [key: string]: string } = {
    BACKEND: 'bg-blue-600',
    FRONTEND: 'bg-yellow-600',
    DEVOPS: 'bg-purple-600',
    DONE: 'bg-green-600',
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-orange-500',
    LOW: 'bg-gray-500', // 우선순위 색상 재활용
  };

  const handleFieldChange = (field: keyof Task, value: string) => {
    setCurrentTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const authorName = currentTask.assignee || '사용자 본인';
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          author: authorName,
          content: newComment,
          timestamp: '방금 전',
        },
      ]);
      setNewComment('');
    }
  };

  const handleSave = () => {
    if (!currentTask.title.trim()) {
      alert('제목은 필수입니다.');
      return;
    }

    setIsLoading(true);

    // 🚧 [Mock API 호출]
    setTimeout(() => {
      alert(
        isCreating
          ? `[Mock] 태스크 '${currentTask.title}' 생성 완료! (컬럼: ${currentTask.status})`
          : `[Mock] 태스크 '${currentTask.title}' 수정 완료!`,
      );
      // onSave(currentTask); // 부모 컴포넌트에 최종 데이터 전달 (추후 구현)
      setIsLoading(false);
      onClose();
    }, 800);
  };

  const handleDelete = () => {
    if (window.confirm(`정말로 태스크 "${currentTask.title}"을(를) 삭제하시겠습니까?`)) {
      alert(`[Mock] 태스크 삭제 처리 완료.`);
      onClose();
    }
  };

  return (
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
                value={currentTask.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder={isCreating ? '새 태스크 제목을 입력하세요 (필수)' : '제목'}
                className={`w-full ${
                  theme.font.size.base
                } font-bold mb-2 break-words focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isCreating ? 'border-b-2 border-blue-200' : 'bg-transparent'
                }`}
                disabled={isLoading}
              />

              {/* 💡 담당자 정보 */}
              <div className="flex items-center gap-2 mt-3">
                <div
                  className={`w-8 h-8 ${theme.colors.primary} ${theme.effects.cardBorderWidth} ${theme.colors.border} flex items-center justify-center text-white ${theme.font.size.xs} font-bold ${theme.effects.borderRadius}`}
                >
                  {currentTask.assignee ? currentTask.assignee[0] : '?'}
                </div>
                <input
                  type="text"
                  value={currentTask.assignee || ''}
                  onChange={(e) => handleFieldChange('assignee', e.target.value)}
                  placeholder="담당자 지정"
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
            <div className="grid grid-cols-2 gap-4">
              {/* 💡 마감일 */}
              <div>
                <label
                  className={`flex items-center gap-2 ${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold`}
                >
                  <Calendar className="w-4 h-4" />
                  마감일 :
                </label>
                <input
                  type="date"
                  value={currentTask.dueDate}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} bg-gray-50 ${theme.font.size.sm} ${theme.effects.borderRadius} font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isLoading}
                />
              </div>

              {/* 💡 우선 순위 */}
              <div>
                <label
                  className={`flex items-center gap-2 ${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold`}
                >
                  <Tag className="w-4 h-4" />
                  우선 순위 :
                </label>
                <select
                  value={currentTask.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} bg-gray-50 ${theme.font.size.sm} ${theme.effects.borderRadius} font-bold focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isLoading}
                >
                  {Object.keys(priorityMap).map((key) => (
                    <option key={key} value={key}>
                      {priorityMap[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 💡 현재 상태 (생성 모드에서는 컬럼 이름 표시) */}
            <div>
              <label
                className={`block ${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold`}
              >
                {isCreating ? '생성될 컬럼 상태:' : '현재 컬럼 상태:'}
              </label>
              <span
                className={`inline-block px-3 py-2 ${theme.effects.cardBorderWidth} ${
                  theme.colors.border
                } text-white ${theme.font.size.sm} ${
                  statusColorMap[currentTask.status] || theme.colors.primary
                } font-bold shadow-sm ${theme.effects.borderRadius}`}
              >
                {currentTask.status}
              </span>
            </div>

            {/* 💡 설명 (Description) */}
            <div>
              <label
                className={`${theme.font.size.xs} mb-2 ${theme.colors.subText} font-semibold block`}
              >
                상세 설명:
              </label>
              <textarea
                value={currentTask.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="상세 내용 및 목표를 입력하세요."
                className={`w-full px-3 py-2 ${theme.effects.cardBorderWidth} ${theme.colors.border} bg-gray-50 ${theme.font.size.sm} min-h-24 ${theme.effects.borderRadius} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* --- 댓글 섹션 (생성 모드에서는 댓글 비활성화) --- */}
          {!isCreating && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-700" />
                <h3 className={`${theme.font.size.base} font-bold ${theme.colors.text}`}>
                  댓글 ({comments.length}개)
                </h3>
              </div>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`${theme.colors.card} ${theme.effects.cardBorderWidth} ${theme.colors.border} p-3 ${theme.effects.borderRadius} bg-gray-100`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-6 h-6 ${theme.colors.primary} ${theme.effects.cardBorderWidth} ${theme.colors.border} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${theme.effects.borderRadius}`}
                      >
                        {comment.author[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`${theme.font.size.xs} font-bold`}>
                            {comment.author}
                          </span>
                          <span className={`text-[10px] ${theme.colors.subText}`}>
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className={`${theme.font.size.sm} break-words ${theme.colors.text}`}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`border-t border-gray-200 pt-3 flex gap-2`}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="댓글을 입력하세요..."
                  className={`flex-1 px-3 py-2 border ${theme.font.size.sm} ${theme.effects.borderRadius} focus:outline-none focus:ring-2 focus:focus:ring-blue-500`}
                  disabled={isLoading}
                />
                <button
                  onClick={handleAddComment}
                  disabled={isLoading || !newComment.trim()}
                  className={`${theme.colors.primary} text-white px-4 py-2 ${theme.colors.primaryHover} transition flex items-center justify-center gap-1 ${theme.effects.borderRadius} disabled:bg-gray-400`}
                >
                  <Send className="w-4 h-4" />
                  <span className={theme.font.size.xs}>등록</span>
                </button>
              </div>
            </div>
          )}

          {/* --- 액션 버튼 --- */}
          <div className={`flex gap-3 mt-6 pt-4 border-t border-gray-300`}>
            <button
              onClick={handleSave}
              disabled={isLoading || !currentTask.title.trim()}
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
  );
};

export default TaskDetailModal;
