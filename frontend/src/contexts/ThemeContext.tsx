import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Theme, themes, ThemeName } from '../styles/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('modern');
  const theme = themes[themeName];

  // 테마 변경 시 body에 클래스 적용
  useEffect(() => {
    // 모든 테마 클래스 제거
    document.body.classList.remove('theme-retro', 'theme-modern', 'theme-dark');
    // 현재 테마 클래스 추가
    document.body.classList.add(theme.cssClass);
  }, [theme.cssClass]);

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};