import { useEffect, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";
import { getMe, getAccessToken, clearTokens } from "./lib/api";
import type { AppUser } from "./types/user";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
   const [isBooting, setIsBooting] = useState(true);

  const handleLogin = (userData: AppUser) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Restore session on refresh if tokens exist
  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = getAccessToken();
      if (!token) {
        setIsBooting(false);
        return;
      }
      try {
        const me = await getMe();
        if (!mounted) return;
        handleLogin({
          name: me.name ?? me.email?.split("@")[0] ?? "User",
          email: me.email,
          avatar_url: me.avatar_url ?? null,
          phone: me.phone ?? null,
          company: me.company ?? null,
          job_title: me.job_title ?? me.role ?? null,
          location: me.location ?? null,
          bio: me.bio ?? null,
          language: me.language ?? null,
          timezone: me.timezone ?? null,
          date_format: me.date_format ?? null,
        });
      } catch (err) {
        clearTokens();
      } finally {
        if (mounted) setIsBooting(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    clearTokens();
    setIsLoggedIn(false);
    setUser(null);
  };

  if (isBooting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {!isLoggedIn ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={user!} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}
