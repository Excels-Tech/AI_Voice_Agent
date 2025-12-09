import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return (stored as Theme) || "dark"; // Default to dark instead of system
  });
  
  const [compactMode, setCompactMode] = useState(() => {
    const stored = localStorage.getItem("compactMode");
    return stored === "true";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark"); // Start with dark by default

  useEffect(() => {
    localStorage.setItem("theme", theme);
    
    let effectiveTheme: "light" | "dark" = "light";
    
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      effectiveTheme = mediaQuery.matches ? "dark" : "light";
      
      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };
      
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      effectiveTheme = theme;
    }
    
    setResolvedTheme(effectiveTheme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("compactMode", compactMode.toString());
  }, [compactMode]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Use View Transition API for ultra-smooth transitions if available
    const applyTheme = () => {
      // Add new theme class first, then remove old one (prevents flash)
      const oldTheme = resolvedTheme === "dark" ? "light" : "dark";
      
      root.classList.add(resolvedTheme);
      root.classList.remove(oldTheme);
    };
    
    // Check if View Transitions API is supported
    if (document.startViewTransition) {
      document.startViewTransition(() => applyTheme());
    } else {
      // Fallback: use requestAnimationFrame
      requestAnimationFrame(() => applyTheme());
    }
    
    // Add/remove compact mode class
    if (compactMode) {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }
  }, [resolvedTheme, compactMode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, compactMode, setCompactMode, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}