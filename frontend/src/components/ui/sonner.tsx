import { Toaster as Sonner } from "sonner";
import { useTheme } from "../ThemeProvider";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  
  return (
    <Sonner 
      position="top-right" 
      theme={resolvedTheme}
      richColors
    />
  );
}