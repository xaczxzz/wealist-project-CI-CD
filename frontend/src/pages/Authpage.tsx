import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div
      className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-4 relative overflow-hidden`}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div
        className={`${theme.colors.primary} ${theme.effects.borderRadius} p-2 w-full max-w-md relative z-10 shadow-2xl ${theme.effects.borderWidth} ${theme.colors.border}`}
      >
        <div
          className={`${theme.colors.secondary} ${theme.effects.cardBorderWidth} ${theme.colors.border} p-4 sm:p-6 ${theme.effects.borderRadius}`}
        >
          <h1
            className={`${theme.font.size.xl} font-bold ${theme.colors.text} mb-2 text-center`}
          >
            weAlists
          </h1>
          <p
            className={`${theme.font.size.xs} ${theme.colors.text} mb-4 sm:mb-6 text-center`}
          ></p>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="email"
                placeholder="EMAIL"
                className={`relative w-full px-3 sm:px-4 py-2 sm:py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.secondary} ${theme.font.size.sm} ${theme.effects.borderRadius} focus:outline-none focus:ring-4 focus:ring-orange-400`}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="PASSWORD"
                className={`relative w-full px-3 sm:px-4 py-2 sm:py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.secondary} ${theme.font.size.sm} ${theme.effects.borderRadius} focus:outline-none focus:ring-4 focus:ring-orange-400`}
              />
            </div>
            <div className="relative">
              <button
                onClick={onLogin}
                className={`relative w-full ${theme.colors.primary} text-white py-3 sm:py-4 ${theme.effects.cardBorderWidth} ${theme.colors.border} font-bold ${theme.colors.primaryHover} transition ${theme.font.size.sm} ${theme.effects.borderRadius}`}
              >
                {isLogin ? "로그인" : "생성"}
              </button>
            </div>
          </div>

          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t-2 sm:border-t-4 border-gray-200`}
              ></div>
            </div>
            <div
              className={`relative flex justify-center ${theme.font.size.xs}`}
            >
              <span
                className={`px-2 ${theme.colors.secondary} ${theme.colors.text} ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.effects.borderRadius}`}
              >
                OR
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="relative">
              <button
                onClick={onLogin}
                className={`relative w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.secondary} hover:bg-gray-50 transition ${theme.effects.borderRadius}`}
              >
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 bg-red-500 border-2 ${theme.colors.border} flex-shrink-0`}
                ></div>
                <span className={`font-bold ${theme.font.size.xs}`}>
                  GOOGLE
                </span>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={onLogin}
                className={`relative w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} ${theme.colors.secondary} hover:bg-gray-50 transition ${theme.effects.borderRadius}`}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-800 border-2 border-black flex-shrink-0"></div>
                <span className={`font-bold ${theme.font.size.xs}`}>
                  GITHUB
                </span>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={onLogin}
                className={`relative w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 ${theme.effects.cardBorderWidth} ${theme.colors.border} bg-yellow-400 hover:bg-yellow-500 transition ${theme.effects.borderRadius}`}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 border-2 border-black flex-shrink-0"></div>
                <span className={`font-bold ${theme.font.size.xs}`}>KAKAO</span>
              </button>
            </div>
          </div>

          <p className={`mt-4 sm:mt-6 text-center ${theme.font.size.xs}`}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`text-blue-600 hover:text-blue-700 underline`}
            >
              {isLogin ? "이메일로 회원가입" : ""}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
