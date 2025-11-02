import React, { useState } from 'react';
import { X, ChevronDown, Trash2 } from 'lucide-react';
import { CustomField } from '../../types/kanban';

// 💡 CustomField 관련 인터페이스는 상단 정의를 가정합니다.

interface CustomFieldModalProps {
  initialField?: CustomField; // 수정 모드일 경우 기존 필드 데이터
  onSave: (field: CustomField) => void;
  onClose: () => void;
}

export const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  initialField,
  onSave,
  onClose,
}) => {
  const [fieldData, setFieldData] = useState<CustomField>(
    initialField || {
      id: '',
      name: '',
      type: 'TEXT',
      options: [],
      allowMultipleSections: false,
    },
  );
  const [newOptionValue, setNewOptionValue] = useState('');

  const isSelectType = fieldData.type === 'SELECT';

  // 필드 유형 옵션
  const fieldTypes = [
    { value: 'TEXT', label: '텍스트' },
    { value: 'SELECT', label: '선택' },
    { value: 'NUMBER', label: '숫자' },
    { value: 'DATE', label: '날짜' },
    { value: 'PERSON', label: '사람' },
  ];

  // 옵션 추가 핸들러 (엔터 및 토글 기반)
  const handleAddOption = () => {
    if (newOptionValue.trim() && isSelectType) {
      setFieldData((prev) => {
        const isDefault = prev.options?.length === 0; // 첫 번째 옵션은 기본값으로 설정
        return {
          ...prev,
          options: [
            ...(prev.options || []).map((opt) => (isDefault ? { ...opt, isDefault: false } : opt)),
            { value: newOptionValue.trim(), isDefault: isDefault },
          ],
        };
      });
      setNewOptionValue('');
    }
  };

  // 기본값 설정 핸들러
  const handleSetDefault = (selectedValue: string) => {
    setFieldData((prev) => ({
      ...prev,
      options: prev.options?.map((opt) => ({
        ...opt,
        isDefault: opt.value === selectedValue,
      })),
    }));
  };

  // 최종 저장 핸들러
  const handleSave = () => {
    if (!fieldData.name.trim()) {
      alert('필드 이름을 입력해주세요.');
      return;
    }
    if (fieldData.type === 'SELECT' && fieldData.options?.length === 0) {
      alert('선택 필드는 옵션을 하나 이상 추가해야 합니다.');
      return;
    }
    onSave({ ...fieldData, id: fieldData.id || `cf-${Date.now()}` });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-white p-6 rounded-xl shadow-2xl">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 className="text-lg font-bold">사용자 정의 필드 추가</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 1. 필드 유형 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">필드 유형</label>
            <div className="relative">
              <select
                value={fieldData.type}
                onChange={(e) =>
                  setFieldData({
                    ...fieldData,
                    type: e.target.value as 'TEXT' | 'SELECT' | 'NUMBER' | 'DATE' | 'PERSON',
                    options: e.target.value !== 'SELECT' ? undefined : fieldData.options,
                    allowMultipleSections:
                      e.target.value !== 'SELECT' ? undefined : fieldData.allowMultipleSections,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* 2. 필드 이름 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">필드 이름</label>
            <input
              type="text"
              value={fieldData.name}
              onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
              placeholder="필드 이름 (선택 사항)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* 3. 선택 필드 옵션 및 다중 섹션 허용 */}
          {isSelectType && (
            <>
              {/* 여러 섹션 허용 토글 */}
              <div className="flex justify-between items-center mb-4 border-t pt-4">
                <label className="text-sm font-semibold text-gray-700">여러 섹션 허용</label>
                <div
                  onClick={() =>
                    setFieldData((prev) => ({
                      ...prev,
                      allowMultipleSections: !prev.allowMultipleSections,
                    }))
                  }
                  className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${
                    fieldData.allowMultipleSections ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      fieldData.allowMultipleSections ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>

              {/* 옵션 입력 필드 */}
              <div className="mb-4">
                <input
                  type="text"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                  placeholder="입력하고 Enter를 눌러 추가"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* 옵션 리스트 */}
              <div className="max-h-24 overflow-y-auto mb-4 border rounded-lg p-2 bg-gray-50">
                {fieldData.options?.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">옵션을 추가하세요.</p>
                ) : (
                  fieldData.options?.map((opt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-1 hover:bg-white rounded"
                    >
                      <span className="text-sm">{opt.value}</span>
                      <div className="flex items-center space-x-2">
                        {opt.isDefault && (
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                            기본값
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setFieldData((prev) => ({
                              ...prev,
                              options: prev.options?.filter((o) => o.value !== opt.value),
                            }));
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* 4. 기본값 설정 (SELECT 타입이거나, 기타 타입일 때) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">기본값</label>
            <div className="relative">
              {isSelectType ? (
                <>
                  {fieldData.options && fieldData.options.length > 0 ? (
                    <select
                      value={fieldData.options.find((opt) => opt.isDefault)?.value || ''}
                      onChange={(e) => handleSetDefault(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="" disabled>
                        옵션을 선택해주세요.
                      </option>
                      {fieldData.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm">
                      옵션을 선택해주세요.
                    </div>
                  )}
                </>
              ) : (
                // 💡 SELECT 타입이 아닐 때의 기본값 입력 필드 (TEXT/NUMBER/DATE)
                <input
                  type={
                    fieldData.type === 'NUMBER'
                      ? 'number'
                      : fieldData.type === 'DATE'
                      ? 'date'
                      : 'text'
                  }
                  value={(fieldData.defaultValue as string) || ''}
                  onChange={(e) => setFieldData({ ...fieldData, defaultValue: e.target.value })}
                  placeholder={`기본 ${
                    fieldData.type === 'TEXT'
                      ? '텍스트'
                      : fieldData.type === 'NUMBER'
                      ? '숫자'
                      : '값'
                  } 입력`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              )}

              {isSelectType && (
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
