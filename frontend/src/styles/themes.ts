export interface Theme {
  name: string;
  cssClass: string;
  colors: {
    primary: string;
    primaryHover: string;
    primaryDark: string;
    secondary: string;
    background: string;
    card: string;
    border: string;
    text: string;
    textSecondary: string;
  };
  effects: {
    shadow: string;
    headerShadow: string;
    borderWidth: string;
    cardBorderWidth: string;
    borderRadius: string;
  };
  font: {
    family: string;
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
}

// 레트로 픽셀 테마
export const retroTheme: Theme = {
  name: "retro",
  cssClass: "theme-retro",
  colors: {
    primary: "bg-orange-500",
    primaryHover: "hover:bg-orange-600",
    primaryDark: "bg-orange-700",
    secondary: "bg-white",
    background: "bg-gray-100",
    card: "bg-white",
    border: "border-black",
    text: "text-gray-800",
    textSecondary: "text-gray-600",
  },
  effects: {
    shadow: "4px 4px 0 #000",
    headerShadow: "0 4px 0 #000",
    borderWidth: "border-4",
    cardBorderWidth: "border-2 sm:border-4",
    borderRadius: "rounded-none",
  },
  font: {
    family: "'Press Start 2P', cursive",
    size: {
      xs: "text-[8px] sm:text-xs",
      sm: "text-xs sm:text-sm",
      base: "text-sm sm:text-base",
      lg: "text-lg sm:text-xl",
      xl: "text-xl sm:text-2xl",
    },
  },
};

// 모던 깔끔한 테마
export const modernTheme: Theme = {
  name: "modern",
  cssClass: "theme-modern",
  colors: {
    primary: "bg-blue-600",
    primaryHover: "hover:bg-blue-700",
    primaryDark: "bg-blue-800",
    secondary: "bg-white",
    background: "bg-gray-50",
    card: "bg-white",
    border: "border-gray-200",
    text: "text-gray-900",
    textSecondary: "text-gray-500",
  },
  effects: {
    shadow: "0 1px 3px rgba(0,0,0,0.1)",
    headerShadow: "0 2px 4px rgba(0,0,0,0.1)",
    borderWidth: "border",
    cardBorderWidth: "border",
    borderRadius: "rounded-lg",
  },
  font: {
    family:
      "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif",
    size: {
      xs: "text-xs font-semibold",
      sm: "text-sm font-semibold",
      base: "text-base font-semibold",
      lg: "text-lg font-bold",
      xl: "text-2xl font-bold",
    },
  },
};

// 모든 테마 export
export const themes = {
  retro: retroTheme,
  modern: modernTheme,
};

export type ThemeName = keyof typeof themes;
