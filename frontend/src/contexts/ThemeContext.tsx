import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Theme, themes, ThemeName } from '../styles/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 💡 초기 테마를 'modern'으로 고정
  const [themeName, setThemeName] = useState<ThemeName>('modern');
  const theme = themes[themeName];

  // 테마 변경 시 body에 클래스 적용
  useEffect(() => {
    // 💡 모든 테마 클래스 제거 로직 간소화 (현재는 modern만 사용해도 되지만, 안전을 위해)
    document.body.classList.remove('theme-retro', 'theme-modern', 'theme-dark');
    // 현재 테마 클래스 추가
    document.body.classList.add(theme.cssClass);
  }, [theme.cssClass]);

  // 💡 setTheme 함수를 통해 테마를 변경할 수 있지만, 현재는 modern만 지원합니다.
  const setTheme = (newThemeName: ThemeName) => {
    if (newThemeName in themes) {
      setThemeName(newThemeName);
    } else {
      console.warn(`Theme "${newThemeName}" is not supported. Using "modern" theme.`);
      setThemeName('modern');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
