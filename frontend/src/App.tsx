import React, { useState } from "react";
// styles
import { ThemeProvider } from "./contexts/ThemeContext";
// components
import AuthPage from "./pages/Authpage";
import MainDashboard from "./pages/Dashboard";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogout = () => {
    // 로그아웃 시 토큰 삭제
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider>
      <div>
        {!isLoggedIn ? (
          <AuthPage onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <MainDashboard onLogout={handleLogout} />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
