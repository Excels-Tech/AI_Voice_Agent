import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";
import type { AppUser } from "./types/user";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  const handleLogin = (userData: AppUser) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  return (
    <>
      {!isLoggedIn ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={user!} onLogout={() => setIsLoggedIn(false)} />
      )}
      <Toaster />
    </>
  );
}
