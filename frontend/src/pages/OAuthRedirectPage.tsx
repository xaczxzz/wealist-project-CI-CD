import React, { useEffect, useState } from 'react';
import { AuthResponse } from '../api/userService';
import { AlertTriangle, Loader, CheckCircle } from 'lucide-react';

interface OAuthRedirectPageProps {
  onAuthSuccess: (authData: AuthResponse) => void;
}

const OAuthRedirectPage: React.FC<OAuthRedirectPageProps> = ({ onAuthSuccess }) => {
  const [message, setMessage] = useState('인증 정보를 처리 중입니다.');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // 1. URL 파라미터에서 토큰 추출
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userId = params.get('userId');
    const name = params.get('name');
    const email = params.get('email');

    if (accessToken && refreshToken) {
      setMessage('인증 성공! 서비스 접속 준비 중...');
      setStatus('success');

      // 2. AuthResponse 구조에 맞춰 데이터 구성
      const authData: AuthResponse = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: userId || 'unknown-id',
        name: name || 'User',
        email: email || 'user@example.com',
        tokenType: 'Bearer',
      };

      // 3. App.tsx의 상태 업데이트 함수 호출
      // 딜레이를 주어 사용자에게 전환 과정을 보여줍니다.
      setTimeout(() => {
        onAuthSuccess(authData);
        // 4. URL에서 토큰 정보를 제거 (보안 및 재접속 방지)
        window.history.replaceState(null, '', window.location.pathname);
      }, 500);
    } else {
      setMessage('로그인 처리 중 문제가 발생했습니다. 토큰이 누락되었거나 인증이 실패했습니다.');
      setStatus('error');
      // 5. 실패 시 로그인 페이지로 강제 이동 (App.tsx의 상태가 'AUTH'로 남아있으므로 화면이 자연스럽게 전환됨)
      setTimeout(() => {
        // App.tsx에서 AUTH 상태로 전환을 유도합니다.
        onAuthSuccess({
          accessToken: null,
          refreshToken: null,
          userId: null,
          name: null,
          email: null,
          tokenType: null,
        } as unknown as AuthResponse); // 실패 시 강제 로그아웃을 위해 잘못된 데이터를 전달하여 상태를 초기화
      }, 3000);
    }
  }, [onAuthSuccess]);

  const Icon = status === 'loading' ? Loader : status === 'success' ? CheckCircle : AlertTriangle;
  const color =
    status === 'loading'
      ? 'text-blue-500'
      : status === 'success'
      ? 'text-green-500'
      : 'text-red-500';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center p-8 bg-white rounded-xl shadow-xl border-t-4 border-blue-500">
        <Icon
          className={`w-12 h-12 mx-auto mb-4 ${color} ${
            status === 'loading' ? 'animate-spin' : ''
          }`}
        />
        <h2 className="text-xl font-medium text-gray-800">{message}</h2>
        {status === 'error' && (
          <p className="mt-4 text-sm text-gray-600">잠시 후 로그인 페이지로 돌아갑니다.</p>
        )}
      </div>
    </div>
  );
};

export default OAuthRedirectPage;
