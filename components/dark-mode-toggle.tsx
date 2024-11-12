// components/dark-mode-toggle.tsx
"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 left-4">
      <Button onClick={toggleTheme}>
        {theme === "dark" ? "Modo claro" : "Modo oscuro"}
      </Button>
    </div>
  );
}